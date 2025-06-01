# Chapter 4: API Route Handlers (`app/api/...`)

Welcome back, future web wizard! In our previous chapter ([Chapter 3: API Client (`lib/api-client.ts`)](03_api_client___lib_api_client_ts___.md)), we learned how our frontend (the code running in the user's browser) uses the API Client as a messenger service to *request* data from somewhere else, like fetching the raw CSV file from GitHub.

But where does the frontend send these requests? And what code *receives* them and does the necessary work, like reading files, talking to databases, or performing complex calculations that we don't want to do directly in the user's browser?

This is where **API Route Handlers** come in!

### What Problem Do They Solve?

Imagine our application is like a restaurant again. The main page is the customer, the API Client is the waiter, and now **API Route Handlers are the chefs and kitchen staff**. The customer (frontend) tells the waiter (API Client) what they need (e.g., "Get me the processed analytics data"). The waiter then goes to the kitchen (the server-side API Route) and tells the chef (the API Route Handler function) what was requested. The chef does the cooking (processing data, accessing files, etc.) and gives the finished dish (the processed data) back to the waiter, who delivers it to the customer.

The problem is: **How do we create specific addresses (URLs) that the frontend can send requests to, and how do we write the server-side code that listens at these addresses and performs the necessary tasks?**

**API Route Handlers** solve this! They allow us to define server-side endpoints that can receive incoming network requests (like `GET` or `POST`) and execute server-side code. This is crucial because certain operations (like reading files from the server's disk, performing heavy data processing, or interacting with external APIs that require secrets) must happen on the server, not in the user's potentially insecure or resource-limited browser.

Our central use case for this chapter is: **Creating a server endpoint (`/api/process-csv`) that receives a request (potentially with an uploaded CSV file or a command to use a default file) and sends back the fully processed, structured analytics data.**

### What are API Route Handlers?

In our project, built with Next.js, API Route Handlers are special files located inside the `app/api` directory. They function as the backend endpoints for our application.

*   **File-Based Routing:** Just like `page.tsx` files define UI routes, files inside `app/api` define API routes. A file named `app/api/my-endpoint/route.ts` will handle requests sent to `/api/my-endpoint`.
*   **Server-Side Only:** The code in these files *only* runs on the server. It's never sent to the user's browser. This is why they can do things the frontend can't, like read local files or perform computationally expensive tasks without blocking the user's browser.
*   **HTTP Methods:** Instead of exporting React components, these files export functions matching standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.). Next.js automatically routes incoming requests to the correct function based on the HTTP method and the URL path.
*   **`NextRequest` and `NextResponse`:** These are special objects provided by Next.js for handling incoming server-side requests and sending responses back. You receive a `NextRequest` object and return a `NextResponse` object.

Essentially, API Route Handlers provide a clean way to create the "backend" part of our application right within our Next.js project, without needing a separate server framework.

### Key Concepts

Let's look at the core ideas behind API Route Handlers, focusing on how they relate to our `/api/process-csv` example.

1.  **Route File (`route.ts`)**: The entry point for an API route is typically a `route.ts` file inside a directory within `app/api`.
    ```typescript
    // This file is at: app/api/process-csv/route.ts
    // It handles requests to the URL /api/process-csv

    // Import necessary types/functions
    import { NextResponse } from "next/server";
    import { NextRequest } from "next/server"; // Used for handling requests

    // Define handler functions for different HTTP methods
    export async function GET(request: NextRequest) {
       // Code to handle GET requests to /api/process-csv
    }

    export async function POST(request: NextRequest) {
      // Code to handle POST requests to /api/process-csv
    }

    // ... other HTTP methods (PUT, DELETE, etc.) could be defined here
    ```
    This structure means that any `GET` request to `/api/process-csv` will execute the `GET` function, and any `POST` request to the same URL will execute the `POST` function in this file.

2.  **Receiving the Request (`request: NextRequest`)**: The handler function receives a `NextRequest` object, which contains all the details about the incoming request, including:
    *   The request method (`GET`, `POST`, etc.)
    *   Headers
    *   The URL (including query parameters like `?company=Google`)
    *   The request body (for methods like `POST` or `PUT`, containing data sent by the frontend, like a file or form data).

    ```typescript
    // Inside the POST function in app/api/process-csv/route.ts
    export async function POST(request: NextRequest) {
      // Access the request body, typically as FormData for file uploads
      const formData = await request.formData();
      const file = formData.get("csvFile"); // Get the uploaded file

      // Access other data from the form if needed
      const useLocalFileFlag = formData.get("useLocalFile");

      // ... rest of the processing logic ...
    }
    ```
    For our `POST` use case involving file uploads, `request.formData()` is used to easily access form fields and files sent by the frontend.

3.  **Sending the Response (`return NextResponse`)**: After processing the request, the handler function must return a `NextResponse` object. This object contains the data and status code to send back to the frontend.

    ```typescript
    // Inside a handler function (GET or POST) in route.ts
    // Assume 'analyticsData' is the processed data object

    // If successful:
    return NextResponse.json({
      success: true,
      data: analyticsData // Send back the processed data
    }, { status: 200 }); // Send a 200 OK status code

    // If there was an error:
    return NextResponse.json({
      success: false,
      error: "Something went wrong during processing" // Send an error message
    }, { status: 500 }); // Send a 500 Internal Server Error status code
    ```
    `NextResponse.json()` is a convenient helper to send JSON data back. It automatically sets the correct headers (`Content-Type: application/json`). The second argument `{ status: ... }` sets the HTTP status code, which is important for letting the frontend (and the API Client) know if the request was successful or if an error occurred.

### How it Solves the Use Case

The `app/api/process-csv/route.ts` file directly solves our central use case by providing the server-side logic needed to process the CSV data.

1.  **Frontend Action:** The user interacts with the UI on the main page ([Chapter 1: Main Application Page (`app/page.tsx`)](01_main_application_page___app_page_tsx___.md)), perhaps clicking a button to analyze the default GitHub file or uploading their own.
2.  **API Client Request:** The main page (via the API Client, [Chapter 3: API Client (`lib/api-client.ts`)](03_api_client___lib_api_client_ts___.md)) constructs a request. For processing, this is typically a `POST` request to the `/api/process-csv` URL, potentially including the uploaded file in the request body.
3.  **Server Receives Request:** Next.js on the server receives the incoming `POST` request to `/api/process-csv`.
4.  **Route Handler Invoked:** Next.js finds the `app/api/process-csv/route.ts` file and calls the exported `POST` function within it.
5.  **Processing Logic:** The `POST` function's code runs on the server:
    *   It checks if a file was uploaded or if the request asks to use the default GitHub file.
    *   It reads the content of the chosen CSV file (either from the uploaded file or by fetching it from GitHub, and using a local fallback if GitHub fails).
    *   It performs the complex data parsing, cleaning, and structuring logic ([Chapter 5: CSV Data Processing](05_csv_data_processing.md)) to transform the raw CSV text into the `AnalyticsData` structure ([Chapter 2: Analytics Data Structure](02_analytics_data_structure_.md)).
6.  **Response Sent:** Once the `AnalyticsData` object is ready (or if an error occurred), the `POST` function returns a `NextResponse.json()` object containing either the `success: true` status and the `data: analyticsData`, or `success: false` and an `error` message.
7.  **API Client Receives Response:** The API Client on the frontend receives this response.
8.  **Frontend Updates:** The API Client returns the processed data (or throws an error) back to `app/page.tsx`, which updates its state (`setData`, `setError`) to display the results to the user.

This sequence shows how the API Route Handler acts as the crucial middle layer, performing the heavy lifting on the server that the frontend cannot or should not do.

### Under the Hood: Request to Response Flow

Let's trace the journey of a `POST` request from the frontend (via API Client) to the server and back.

![API Route Handlers Sequence Diagram](/public/diagrams/chapter4.svg)

Now, let's look at simplified code snippets from `app/api/process-csv/route.ts` to see parts of this flow in action.

First, the structure showing the exported handler functions:

```typescript
// app/api/process-csv/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
// ... other imports (like fs/promises, path, processing logic) ...

// This function handles POST requests to /api/process-csv
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/process-csv received"); // Server logs

    // --- 1. Receive and read incoming data ---
    const formData = await request.formData(); // Read the body as form data
    const file = formData.get("csvFile") as File | null;
    const useLocalFile = formData.get("useLocalFile") === "true";

    let csvContent: string;

    // --- 2. Determine data source and read CSV ---
    if (useLocalFile) {
      // Logic to fetch from GitHub or read local file...
      // (Simplified - actual code has detailed fetch/fallback)
      const response = await fetch("..."); // Fetch from GitHub
      csvContent = await response.text(); // Read content
      console.log("Using GitHub/local CSV");
    } else if (file) {
      // Read content from uploaded file
      csvContent = await file.text();
      console.log("Using uploaded CSV");
    } else {
      // Handle case where no file or flag is provided
      return NextResponse.json({ success: false, error: "No CSV source specified" }, { status: 400 });
    }

    // --- 3. Process the raw CSV content ---
    // This is where the core processing logic runs (see Chapter 5)
    // const analyticsData = processCsvContent(csvContent); // Imagine this function exists
     const analyticsData = { /* Simplified example structure */ questions: [], companies: [], stats: {}, metadata: {} }; // Replace with actual processing call

    // --- 4. Send back the structured data as JSON response ---
    console.log("Processing successful, returning data");
    return NextResponse.json({
      success: true,
      data: analyticsData, // The structured data goes here
    }, { status: 200 });

  } catch (error) {
    // --- 5. Handle errors and send error response ---
    console.error("API Route error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }, { status: 500 });
  }
}

// This function handles GET requests to /api/process-csv
// It's used for server-side filtering/pagination on the default data
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/process-csv received"); // Server logs

    // --- 1. Read query parameters from the URL ---
    const { searchParams } = new URL(request.url);
    const companyFilter = searchParams.get("company");
    const difficultyFilter = searchParams.get("difficulty");
    // ... get other filters and pagination params (limit, offset) ...
    console.log("Filters:", { companyFilter, difficultyFilter });

    // --- 2. Load the default CSV data (usually from GitHub/local fallback) ---
    // Logic similar to the POST handler, but always gets the default source
    const response = await fetch("..."); // Fetch from GitHub
    const csvContent = await response.text(); // Read content
    console.log("Loaded default CSV for filtering");

    // --- 3. Apply filters to the raw/partially processed data ---
    // This logic filters *before* creating the final AnalyticsData structure,
    // or filters a pre-calculated list. (See Chapter 6 for filtering details).
    // Simplified: Imagine a function that takes csvContent and filters, then structures
    const filteredQuestions = [/* ... array of filtered questions ... */]; // Replace with actual filtering/structuring call
    const totalQuestions = 100; // Total before pagination

    // --- 4. Apply pagination and send back filtered/paginated list ---
    console.log("Filtering and pagination successful, returning data");
    return NextResponse.json({
      success: true,
      data: {
        questions: filteredQuestions, // Return just the list of questions
        totalQuestions: totalQuestions, // Return total count for pagination UI
      },
    }, { status: 200 });

  } catch (error) {
    console.error("API Route GET error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }, { status: 500 });
  }
}
```

Let's break down the differences between the `POST` and `GET` handlers in this file:

| Feature             | `POST` Handler (`/api/process-csv`)                                  | `GET` Handler (`/api/process-csv`)                                          |
| :------------------ | :------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **Primary Role**    | Receive CSV source (upload or default), perform *full* processing. | Receive filter/sort parameters, retrieve *default* data, apply filtering/pagination. |
| **Input Source**    | Request Body (FormData with file or flags).                          | URL Query Parameters (`?company=...&search=...`).                           |
| **Data Source Used**| Uploaded file OR default (GitHub/Local fallback).                    | Always the default data source (GitHub/Local fallback).                     |
| **Output Data**     | Full `AnalyticsData` object (questions, companies, stats, metadata). | Filtered/paginated list of `Question` objects + total count.                |
| **Frontend Caller** | Typically called once on initial load or after file upload.        | Can be called multiple times as user changes filters/pagination.            |

Both handlers demonstrate the core concepts: they receive a `NextRequest`, perform server-side operations (reading files, fetching data, processing/filtering), and return a `NextResponse`.

### Conclusion

In this chapter, we've learned about **API Route Handlers (`app/api/...`)**. We saw that they are the server-side counterparts to our frontend's API Client, providing specific URLs where the frontend can send requests. These handlers run exclusively on the server, enabling tasks like file processing and data retrieval that are unsuitable for the browser. We explored how the file structure defines routes, how different functions handle different HTTP methods (`GET`, `POST`), and how they use `NextRequest` and `NextResponse` to communicate. We specifically focused on the `/api/process-csv` route, understanding its role in receiving CSV data (uploaded or default) and returning the processed analytics, as well as its GET functionality for server-side filtering.

Now that we know *how* the raw data gets to the server-side API route, the next logical step is to understand *what happens* to that data inside the handler – the complex steps of parsing, cleaning, and structuring the raw CSV text.

[Chapter 5: CSV Data Processing](05_csv_data_processing.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/app/api/process-csv/route.ts), [[2]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/app/api/webhook/route.ts)</sup></sub>