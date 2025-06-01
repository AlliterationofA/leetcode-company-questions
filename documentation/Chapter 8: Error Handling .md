# Chapter 8: Error Handling (`lib/error-handler.ts`)

Welcome back, data dashboard builder! In our journey so far, we've learned how to build the user interface with a component library ([Chapter 7: UI Component Library](07_ui_component_library.md)), fetch data using the API client ([Chapter 3: API Client (`lib/api-client.ts`)](03_api_client___lib_api_client_ts___.md)), process it on the server ([Chapter 4: API Route Handlers (`app/api/...`)](04_api_route_handlers___app_api_______.md) and [Chapter 5: CSV Data Processing](05_csv_data_processing_.md)), structure it ([Chapter 2: Analytics Data Structure](02_analytics_data_structure_.md)), and make it interactive with filtering and sorting ([Chapter 6: Filtering and Sorting](06_filtering_and_sorting_.md)).

But what happens when things don't go perfectly? The internet connection might drop while fetching data, the CSV file might be formatted incorrectly, or something unexpected could happen during processing. If our application doesn't handle these situations gracefully, the user might see a blank screen, a confusing error message, or the whole application might crash.

### What Problem Does it Solve?

Imagine you're driving a car and a warning light comes on (like "Check Engine"). If your car just stopped dead without warning, you'd be stuck and wouldn't know why. A good car gives you a warning, maybe tells you which system has a problem, and sometimes even suggests what you *can* still do (like "drive to the nearest service").

In our application, errors are like those warning lights or unexpected stops. They *will* happen.

The problem is: **How do we catch errors when they occur (during data fetching, processing, etc.), understand what kind of error it is, present helpful feedback to the user without crashing the app, and log details so we developers can fix the issue later?**

The **Error Handling** system, centered around `lib/error-handler.ts`, solves this! It provides a structured way to:

1.  **Identify** different types of errors (is it a network issue? a data problem? a validation failure?).
2.  **Standardize** error information into a consistent format.
3.  **Log** detailed error information for debugging purposes.
4.  **Signal** to the user interface that an error occurred, allowing it to display a user-friendly message or fallback content instead of just breaking.

Our central use case for this chapter is: **When data fetching or processing fails, gracefully catch the error, log its details, and update the UI on the main page (`app/page.tsx`) to show an error message instead of the data table.**

### What is Error Handling (`lib/error-handler.ts`)?

The file `lib/error-handler.ts` is the core of our structured error handling approach. It contains:

*   **Custom Error Classes:** Definitions for different types of errors specific to our application (like `NetworkError`, `ValidationError`). This gives us more specific information than just a generic `Error` object.
*   **`handleError` Function:** A central utility function. When an error is caught (for example, in a `try...catch` block), it's passed to `handleError`. This function determines the type of error, logs it using the logging utility ([see `lib/logger.ts` if it exists, but not covered in detail in this tutorial]), and ensures it's returned or re-thrown in a consistent, standardized `AppError` format.

Think of `lib/error-handler.ts` as the application's central "incident reporting" and "classification" department. Any problem gets reported here to be identified, logged, and described consistently.

Beyond `lib/error-handler.ts`, other parts of the application contribute to the overall error *experience*:

*   **`try...catch` Blocks:** Used in places where errors might occur (like data fetching in [Chapter 3](03_api_client___lib_api-client_ts___.md), processing in [Chapter 5](05_csv_data_processing_.md), or API routes in [Chapter 4](04_api_route_handlers___app_api_______.md)) to gracefully capture exceptions.
*   **UI Components:** Components like `StatusIndicator` (`components/ui/status-indicator.tsx`) show loading/success/error states, and `ErrorBoundary` (`components/ui/error-boundary.tsx`) catch rendering errors within the React UI tree to prevent the whole page from crashing.

While `StatusIndicator` and `ErrorBoundary` are visual components, `lib/error-handler.ts` provides the underlying structure and logic for *what* an error is and *how* it's initially processed when caught outside of rendering.

### Key Concepts

Let's explore the main ideas in `lib/error-handler.ts`:

1.  **Base `AppError` Class:** This is the foundation for all custom errors in our application. It extends the built-in JavaScript `Error` but adds specific properties like a unique `code` (e.g., "NETWORK_ERROR"), an HTTP-like `statusCode`, and `isOperational` (to distinguish errors we expect and handle gracefully from unexpected programming bugs).

    ```typescript
    // Inside lib/error-handler.ts (Simplified)
    export class AppError extends Error {
      public readonly code: string;
      public readonly statusCode: number;
      public readonly isOperational: boolean; // Expected vs unexpected error

      constructor(message: string, code: string, statusCode = 500, isOperational = true) {
        super(message); // Call the base Error constructor
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // This helps keep the correct stack trace
        Error.captureStackTrace(this, this.constructor);
      }
    }
    ```
    This code defines the blueprint for our application-specific errors. Every custom error will inherit from `AppError`.

2.  **Specific Custom Error Classes:** Building on `AppError`, we define classes for specific types of problems we anticipate.

    ```typescript
    // Inside lib/error-handler.ts (Simplified)
    import { AppError } from "./error-handler"; // Import the base class

    export class ValidationError extends AppError {
      constructor(message: string) {
        // Call base AppError constructor with specific code and status
        super(message, "VALIDATION_ERROR", 400); // 400 means Bad Request/Invalid Input
      }
    }

    export class NetworkError extends AppError {
      constructor(message: string) {
        // Call base AppError constructor with specific code and status
        super(message, "NETWORK_ERROR", 503); // 503 means Service Unavailable
      }
    }

    export class DataProcessingError extends AppError {
      constructor(message: string) {
        // Call base AppError constructor with specific code and status
        super(message, "DATA_PROCESSING_ERROR", 422); // 422 means Unprocessable Entity
      }
    }

    // ... other specific error types like FileError ...
    ```
    These classes make our code more readable. Instead of throwing a generic `new Error("Invalid file format")`, we throw `new ValidationError("Invalid file format")`. This tells us immediately *what kind* of problem occurred just by looking at the error type.

3.  **The `handleError` Function:** This function is the central point for processing errors caught in `try...catch` blocks. It takes any caught error (`error: unknown`) and tries to turn it into one of our specific `AppError` types if it isn't already one.

    ```typescript
    // Inside lib/error-handler.ts (Simplified)
    import { logger } from "./logger"; // Assuming a logger exists
    import { AppError, NetworkError, ValidationError, DataProcessingError } from "./error-handler"; // Import error types

    export const handleError = (error: unknown, context = "Unknown"): AppError => {
      // Log the original error for debugging
      logger.error(`Error in ${context}`, error instanceof Error ? error : new Error(String(error)));

      // If it's already one of our AppErrors, just return it
      if (error instanceof AppError) {
        return error;
      }

      // If it's a standard JavaScript Error, try to infer a specific type
      if (error instanceof Error) {
        // Basic checks based on error message content
        if (error.message.includes("fetch") || error.message.includes("network")) {
          return new NetworkError(`Network error: ${error.message}`);
        }

        // You could add more checks here for other common error types
        // e.g., if message includes "validation", return ValidationError

        // If we can't infer a specific type, wrap it in a generic AppError
        // Mark it as non-operational because it was unexpected
        return new AppError(error.message, "UNKNOWN_ERROR", 500, false);
      }

      // If it's not even an Error object, wrap it as an unknown error
      return new AppError("An unexpected error occurred", "UNKNOWN_ERROR", 500, false);
    };
    ```
    When you catch an error (e.g., in a `catch (err)` block), you call `handleError(err, "Data Fetching")`. `handleError` logs the error, figures out the best `AppError` type to represent it (either the original if it was already an `AppError`, or a new one based on message hints, or a generic "UNKNOWN_ERROR"), and returns that standardized `AppError` object.

### How it Solves the Use Case

Using `lib/error-handler.ts` helps solve the use case of handling data fetching/processing errors gracefully:

1.  **Error Origin:** An operation that might fail (like fetching data from GitHub in `lib/api-client.ts` or parsing CSV in `lib/csv-processor.ts`) is wrapped in a `try...catch` block.
2.  **Catching & Handling:** If an error occurs inside the `try` block (either a built-in error, or a custom `AppError` thrown intentionally, like `new NetworkError`), the `catch` block is executed.
3.  **Standardization & Logging:** Inside the `catch` block, the caught error is passed to `handleError`. `handleError` logs the error details for developers and returns a standardized `AppError` object.
4.  **Re-throwing/Returning:** The code that called `handleError` (the `catch` block) typically re-throws the `AppError` it received. This allows the error to "bubble up" to the code that initiated the operation (e.g., `app/page.tsx`).
5.  **UI Reaction:** The calling code (`app/page.tsx`) also uses a `try...catch` block when calling the potentially failing operation (like `apiClient.fetchGitHubCSV`). When it catches the `AppError` that was re-thrown, it updates its state (e.g., sets the `error` state variable in `useState`).
6.  **Displaying Feedback:** The main page's render logic checks the error state. If an error is present, it renders a UI component like `StatusIndicator` or a simple message displaying the error details from the `AppError` object (specifically, the user-friendly `message`).

This chain ensures that even if a low-level network issue occurs, it gets wrapped, logged, and presented to the main page as a consistent `AppError` object, allowing the page to display a controlled error state to the user.

### Under the Hood: Error Flow

Let's visualize the flow when an error happens during data fetching and how `lib/error-handler.ts` plays its part.

![Error Handling Sequence Diagram](assets/chapter8.svg)

This diagram shows how an error originating in `ApiClient` is caught, processed by `ErrorHandler`, logged, and then re-thrown so that the calling component (`AppPage`) can catch it and update its display state.

Now, let's look at snippets showing how different parts use the error handling system.

First, how `lib/api-client.ts` uses `try...catch` and `handleError`:

```typescript
// Inside lib/api-client.ts (Snippet from fetchGitHubCSV)
import { logger } from "./logger";
import { NetworkError, handleError } from "./error-handler"; // Import what's needed

async fetchGitHubCSV(): Promise<string> {
  try {
    // ... fetch logic ...
    const response = await fetch(...);

    if (!response.ok) {
      // Explicitly throw a custom error for HTTP failures
      throw new NetworkError(`Failed to fetch: HTTP ${response.status}`);
    }

    const csvContent = await response.text();
    return csvContent;

  } catch (error) {
    // If any error happens (NetworkError above, or low-level fetch error)
    // Pass it to handleError for standardization and logging
    const appError = handleError(error, "GitHub CSV Fetch");
    // Log the handled error (handleError already logged original, but this confirms flow)
    logger.error("Final handled error from fetch", appError);
    // Re-throw the standardized error
    throw appError;
  }
}
```
This is a common pattern: Wrap risky code in `try`, throw specific `AppError` types for known failure conditions, and use a `catch` block that calls `handleError` for robust logging and re-throwing.

Next, how `lib/csv-processor.ts` uses `try...catch` and `handleError`:

```typescript
// Inside lib/csv-processor.ts (Snippet from processCSVContent)
import { logger } from "./logger";
import { ValidationError, DataProcessingError, handleError } from "./error-handler"; // Import error types

async processCSVContent(csvContent: string): Promise<AnalyticsData> {
  try {
    // ... validation (e.g., check empty content) ...
    if (!csvContent || csvContent.trim().length === 0) {
      throw new ValidationError("CSV content is empty"); // Throw a specific custom error
    }

    // ... parsing and processing logic ...
    // If parsing fails unexpectedly... parseCSVRow might throw a built-in Error
    // If data looks wrong... you might throw a DataProcessingError

    const analyticsData = { /* ... processed data ... */ };
    return analyticsData;

  } catch (error) {
    // Catch any error that happened during validation or processing
    const appError = handleError(error, "CSV Processing");
    logger.error("Final handled error from processing", appError);
    throw appError; // Re-throw the standardized error
  }
}
```
The pattern is the same: `try...catch` around the core logic, throwing specific `AppError` types for expected processing issues (like bad data format), and using `handleError` in the `catch` block.

Finally, how `app/page.tsx` reacts to these errors:

```typescript
// Inside app/page.tsx (Snippet from useEffect)
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
// Assuming StatusIndicator and ErrorBoundary are imported
import { StatusIndicator } from "@/components/ui/status-indicator";
// And ErrorBoundary is used somewhere wrapping main content, but not shown in this snippet

export default function LeetCodeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null); // State can hold our AppError type

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Call the API client, which might throw an AppError
        const csvContent = await apiClient.fetchGitHubCSV();

        // Pass to the processor, which might throw an AppError
        const analyticsData = await csvProcessor.processCSVContent(csvContent);

        setData(analyticsData);
        setLoading(false);
        // Set success state if needed for StatusIndicator

      } catch (error) {
        // Catch the AppError re-thrown by apiClient or csvProcessor
        console.error("Caught error in page useEffect:", error); // Log for local dev console

        // Check if it's our standardized AppError
        if (error instanceof AppError) {
           setError(error); // Store the standardized error in state
        } else {
           // If it's an unexpected error not standardized, create a basic one
           setError(new AppError("An unexpected error occurred.", "UNKNOWN_UI_ERROR", 500, false));
        }
        setLoading(false); // Stop loading
      }
    };

    initializeData();
  }, []);

  // Inside the component's render function (return())
  if (loading) {
    return <StatusIndicator status="loading" message="Loading data..." />;
  }

  if (error) {
    // If there's an error in the state, show an error indicator/message
    return (
      <div className="p-4">
        <StatusIndicator
           status="error"
           message={`Error: ${error.message} (${error.code})`} // Display message and code from AppError
           className="mx-auto max-w-md"
        />
        {/* Potentially add a retry button here */}
      </div>
    );
  }

  // If no loading and no error, display the data content
  if (data) {
    return (
      // ... main content using data ...
      // <FiltersPanel ... />
      // <ProblemsTable ... />
    );
  }

   // Fallback for unexpected state (shouldn't happen if logic is correct)
   return <div>No data or status to display.</div>;
}
```
This snippet shows the `app/page.tsx` component's `useEffect` using `try...catch` to call the data fetching/processing logic. If an error is caught, it sets the `error` state variable (ensuring it's an `AppError`). The component's render function then checks the `loading` and `error` states to decide what to display – showing a `StatusIndicator` with the error details if `error` is set.

Error boundaries (`components/ui/error-boundary.tsx`) work differently; they catch errors that happen *during React's rendering phase*, which `try...catch` around asynchronous operations like fetching data won't catch. An `ErrorBoundary` typically wraps a part of the UI tree. If a component *inside* the boundary throws an error while rendering, the boundary catches it, logs it (often using `handleError` or the logger internally), and renders a fallback UI defined within the boundary component itself, preventing the rest of the page from breaking. The provided `ErrorBoundary` component does exactly this, using `componentDidCatch` to log and `getDerivedStateFromError` to update state and trigger the fallback render. While `app/page.tsx` handles errors from initial data loading async operations using state and `StatusIndicator`, an `ErrorBoundary` would protect against subsequent rendering issues, offering another layer of resilience.

### Conclusion

In this chapter, we explored the crucial concept of **Error Handling** and the role of `lib/error-handler.ts`. We learned how custom `AppError` classes provide structured information about problems, and how the central `handleError` function standardizes and logs errors caught in `try...catch` blocks throughout the application. We saw how components like the API client and CSV processor utilize this system by re-throwing standardized errors, and how the main page (`app/page.tsx`) catches these errors to update its state and display user-friendly feedback using components like `StatusIndicator`. Understanding this system is key to building a robust application that can gracefully handle unexpected issues.

With error handling covered, we have completed our exploration of the core concepts and files provided for the `test` project.

This concludes the tutorial chapters for this project. We have covered the main application structure, data handling (fetching, processing, structuring, filtering, sorting), UI components, and error handling.

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/components/ui/error-boundary.tsx), [[2]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/components/ui/status-indicator.tsx), [[3]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/lib/api-client.ts), [[4]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/lib/csv-processor.ts), [[5]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/lib/error-handler.ts)</sup></sub>