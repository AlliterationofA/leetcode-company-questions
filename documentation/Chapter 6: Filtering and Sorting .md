# Chapter 6: Filtering and Sorting

Welcome back! In the previous chapter ([Chapter 5: CSV Data Processing](05_csv_data_processing.md)), we learned how the raw CSV data is processed and transformed into a clean, structured format called `AnalyticsData`. This data includes a list of unique programming problems, company stats, and overall metrics, ready to be displayed.

Now that we have this organized data, simply showing a huge list of problems might be overwhelming. Imagine there are hundreds or thousands of problems – finding a specific one would be difficult! We need a way for users to easily narrow down the list and arrange it how they like.

### What Problem Does it Solve?

Think about online shopping. When you look for a product, you don't browse *every single item* the store sells. You use filters (by brand, price range, color, size) and sorting (by relevance, price low-to-high, reviews) to quickly find what you're interested in.

Our list of programming problems is similar. Users need to:

*   **Filter:** See only problems from Google, or only "Hard" problems, or only problems seen in the last 30 days. They also might want to search for a specific word in the problem title or topic.
*   **Sort:** Arrange the list by difficulty (Easy first), frequency (most frequent first), or alphabetically by title.

The problem is: **How do we build the controls for these actions (search box, dropdowns, clickable table headers) and, more importantly, how do we apply the user's choices to the data to show a dynamically updated list?**

The **Filtering and Sorting** logic solves this! It's the mechanism that takes the full list of problems, looks at the user's selected filters and sort preferences, and produces a smaller, ordered list that matches those criteria.

Our central use case for this chapter is: **Allowing the user to search, select filters (company, difficulty, timeframe, topic, multi-company), and sort the list of problems displayed in the table on the main page.**

### What is Filtering and Sorting (in this project)?

Filtering and Sorting in this project aren't handled by one specific file or component. Instead, they are **pieces of logic and state management that live primarily within the main application page component, `app/page.tsx`**.

Remember from [Chapter 1: Main Application Page (`app/page.tsx`)](01_main_application_page___app_page_tsx___.md) that `app/page.tsx` is the central conductor? It holds the main data and manages the overall state of the page. This makes it the perfect place to keep track of the user's filtering and sorting choices and apply that logic to the data *before* passing the results to the table component for display.

*   **State Management:** `app/page.tsx` uses React's `useState` to remember the user's selections (like what text is in the search bar, which company is selected in the filter dropdown).
*   **Logic Application:** It contains code that takes the full list of problems (`data.questions`) and applies a sequence of steps: first filtering based on the current state, then sorting the filtered result based on the current state.
*   **Efficiency:** It uses React's `useMemo` hook to ensure this potentially complex filtering and sorting process only runs when necessary (i.e., when the original data changes or when any of the filter/sort state variables change).
*   **Component Collaboration:** It works closely with UI components like `<FiltersPanel>` (which provides the filter controls) and `<ProblemsTable>` (which displays the results and provides sort headers).

So, Filtering and Sorting is really about the data flow and logic within `app/page.tsx` orchestrating how the problem list is prepared for display.

### Key Concepts

Let's break down the concepts involved in `app/page.tsx` handling filtering and sorting:

1.  **Filter and Sort State:** As mentioned, `app/page.tsx` uses `useState` hooks to hold the current value of each filter and the current sort settings.

    ```typescript
    // Inside app/page.tsx, at the top of the component function
    import { useState } from "react"; // Need to import useState

    // ... other imports and state (like data, loading, error)

    export default function LeetCodeAnalytics() {
      const [data, setData] = useState<AnalyticsData | null>(null);
      // ... other state

      // State variables for filters and sorting:
      const [searchTerm, setSearchTerm] = useState(""); // Holds the search box text
      const [selectedCompany, setSelectedCompany] = useState("all"); // e.g., "Google" or "all"
      const [selectedDifficulty, setSelectedDifficulty] = useState("all"); // e.g., "Easy" or "all"
      const [selectedTimeframe, setSelectedTimeframe] = useState("all"); // e.g., "1 Month" or "all"
      const [selectedTopic, setSelectedTopic] = useState("all"); // e.g., "Array" or "all"
      const [showMultiCompany, setShowMultiCompany] = useState(false); // true or false

      const [sortField, setSortField] = useState<SortField>("title"); // e.g., "title", "difficulty"
      const [sortDirection, setSortDirection] = useState<SortDirection>("asc"); // "asc" or "desc"

      // ... rest of the component logic
    }
    ```
    Each of these `useState` calls creates a variable (`searchTerm`, `selectedCompany`, etc.) to store the filter/sort value and a function (`setSearchTerm`, `setSelectedCompany`, etc.) to update that value. When an update function is called, React knows that the component's state has changed and it might need to re-render.

2.  **Updating Filter/Sort State:** UI components like the search input and filter dropdowns don't manage their state themselves. They call functions provided by `app/page.tsx` to update the central state.

    ```typescript
    // Inside app/page.tsx
    // ... state declarations ...

    // Handler function for search input change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value); // Update the search term state
    };

    // Handler function for company filter change (value comes from the Select component)
    const handleCompanyChange = (value: string) => {
       setSelectedCompany(value); // Update the selected company state
    };

    // Handler function for sorting (called by ProblemsTable when a header is clicked)
    const handleSort = (field: SortField) => {
      // Logic to toggle direction or set new field to 'asc'
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    };

    // ... inside the return() part of the component ...
    return (
      // ... other UI elements ...
      <Input
        value={searchTerm} // Input displays the current state
        onChange={handleSearchChange} // Input calls this handler on change
        // ... other input props ...
      />

      <FiltersPanel
         // ... other props
         selectedCompany={selectedCompany} // Pass current state to filter panel
         onCompanyChange={handleCompanyChange} // Pass handler to filter panel
         // ... pass other filter states and handlers ...
         showMultiCompany={showMultiCompany}
         onMultiCompanyToggle={() => setShowMultiCompany(!showMultiCompany)} // Pass toggle handler
       />

      <ProblemsTable
        questions={filteredAndSortedQuestions} // Pass the filtered/sorted list
        sortField={sortField} // Pass current sort state
        sortDirection={sortDirection}
        onSort={handleSort} // Pass sort handler to the table
      />
      // ... rest of UI
    );
    ```
    The UI components (`Input`, `<FiltersPanel>`, `<ProblemsTable>`) receive the current state values (`searchTerm`, `selectedCompany`, `sortField`, `sortDirection`) as `props`. When a user interacts with a control, the component calls the corresponding handler function (`handleSearchChange`, `handleCompanyChange`, `handleSort`) which were also passed as `props`. These handlers then update the state in `app/page.tsx`.

3.  **Applying Filtering and Sorting Logic (`useMemo`)**: This is the core part where the magic happens. `app/page.tsx` defines a function that takes the full `data.questions` list and the current filter/sort state and produces the final list to display. The `useMemo` hook is used to optimize this calculation.

    ```typescript
    // Inside app/page.tsx
    // ... imports and state ...

    export default function LeetCodeAnalytics() {
      // ... state declarations (data, filters, sort) ...

      // This is the heart of filtering and sorting
      const filteredAndSortedQuestions = useMemo(() => {
          logger.debug("Recalculating filtered/sorted questions"); // Log when this runs

          if (!data) return []; // Can't filter/sort if no data

          let filtered = data.questions; // Start with the full list

          // --- Apply Filters ---

          // Text Search (checks title and topics)
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(question =>
              // Check against properties that combine info from original rows
              question.title.toLowerCase().includes(searchLower) ||
              question.topics?.toLowerCase().includes(searchLower)
              // NOTE: The actual code checks originalRows, which is more accurate
              // Let's show that slightly more complex logic below in 'Under the Hood'
            );
          }

          // Company Filter
          if (selectedCompany !== "all") {
            filtered = filtered.filter(question =>
              // Check if the question's list of companies includes the selected one
              question.companies.includes(selectedCompany)
            );
          }

          // Difficulty Filter
          if (selectedDifficulty !== "all") {
             filtered = filtered.filter(question =>
               question.difficulty === selectedDifficulty
             );
          }

          // Timeframe Filter
          if (selectedTimeframe !== "all") {
             filtered = filtered.filter(question =>
               // Check if the question's list of timeframes includes the selected one
               question.timeframes.includes(selectedTimeframe)
             );
          }

          // Topic Filter
          if (selectedTopic !== "all") {
            filtered = filtered.filter(question => {
               // Split the topic string and check if the selected topic is included
               const topics = question.topics?.split(/[,;|]/).map(t => t.trim()) || [];
               return topics.includes(selectedTopic);
            });
          }

          // Multi-Company Filter
          if (showMultiCompany) {
             filtered = filtered.filter(question => question.companies.length > 1);
          }


          // --- Apply Sorting ---

          // Create a copy to avoid modifying the original filtered array in place
          const sorted = [...filtered].sort((a, b) => {
            let aValue: any, bValue: any;

            // Determine the values to compare based on sortField
            switch (sortField) {
              case "title":
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              case "difficulty":
                 // Assign numerical values for proper difficulty sorting (Easy < Medium < Hard)
                 const difficultyOrder: { [key: string]: number } = { "EASY": 1, "MEDIUM": 2, "HARD": 3 };
                 aValue = difficultyOrder[a.difficulty.toUpperCase()] || 2; // Default to Medium
                 bValue = difficultyOrder[b.difficulty.toUpperCase()] || 2;
                 break;
              case "frequency":
                 aValue = a.frequency || 0; // Handle potential missing values
                 bValue = b.frequency || 0;
                 break;
              case "acceptance_rate":
                 aValue = a.acceptance_rate || 0;
                 bValue = b.acceptance_rate || 0;
                 break;
               case "timeframe":
                 // Sorting timeframes alphabetically might be okay, or need custom logic
                 aValue = a.timeframe.toLowerCase();
                 bValue = b.timeframe.toLowerCase();
                 break;
               case "occurrences":
                 // Sort by the number of times the problem appeared in the original data
                 aValue = a.originalRows?.length || 0;
                 bValue = b.originalRows?.length || 0;
                 break;
              default:
                return 0; // No sorting if field is unknown
            }

            // Perform the comparison based on direction (asc or desc)
            if (sortDirection === "asc") {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else { // desc
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });

          logger.debug("Filtered and sorted", { count: sorted.length });
          return sorted; // Return the final list
      }, [
        // Dependencies: The useMemo function runs again ONLY when
        // any of these values change.
        data, // if the original data reloads
        searchTerm,
        selectedCompany,
        selectedDifficulty,
        selectedTimeframe,
        selectedTopic,
        showMultiCompany,
        sortField,
        sortDirection,
      ]); // Keep this array updated with all state variables used inside!


      // ... inside the return() part, pass this list to the table ...
      // <ProblemsTable questions={filteredAndSortedQuestions} ... />

    }
    ```
    This `useMemo` block is powerful. It contains the actual logic:
    *   It starts with the `data.questions` (the full list from [Chapter 2: Analytics Data Structure](02_analytics_data_structure_.md)).
    *   It then applies `filter()` methods chain. Each `filter()` step keeps only the items from the previous step that meet a specific condition (e.g., `question.companies.includes(selectedCompany)`).
    *   After filtering, it creates a *copy* of the filtered array (`[...filtered]`) and uses the `sort()` method. The `sort()` method uses a comparison function that looks at the `sortField` and `sortDirection` state variables to decide if item `a` comes before item `b`.
    *   Finally, it returns the `sorted` list.
    *   The dependency array `[...]` at the end tells React that this function only needs to re-run if `data` itself changes, or if any of the filter/sort state variables change. This is crucial for performance.

### How it Solves the Use Case

Here's how the concepts work together to deliver the filtering and sorting functionality:

1.  **Data Loaded:** `app/page.tsx` fetches and processes the data ([Chapters 3, 4, 5]), storing the full `AnalyticsData` object in its `data` state.
2.  **Initial Display:** When `data` is set, the `useMemo` hook runs for the first time. Since all filter states are initially set to "all" or empty, and default sorting is applied, `useMemo` returns the full list, sorted by title. This list is passed to `<ProblemsTable>`, which displays it.
3.  **User Action (e.g., selects "Google" from Company filter):**
    *   The `<FiltersPanel>` component detects the change and calls the `onCompanyChange` prop, passing "Google".
    *   This calls `setSelectedCompany("Google")` in `app/page.tsx`.
    *   Updating the state (`selectedCompany`) causes `app/page.tsx` to re-render.
4.  **Re-calculation:** Because `selectedCompany` is listed in the `useMemo` dependency array, React knows it needs to re-run the function inside `useMemo`.
5.  **Filtering Applied:** Inside `useMemo`, the code now sees `selectedCompany` is "Google". The `filter()` step for the company will keep only the `question` objects where `question.companies.includes("Google")` is true. Other filters (if set) are also applied.
6.  **Sorting Applied:** The resulting filtered list is then sorted based on the current `sortField` and `sortDirection` (e.g., still by title, ascending).
7.  **Table Update:** The `useMemo` function returns the new, shorter list of Google-only problems, sorted. This list is passed as the `questions` prop to the `<ProblemsTable>` component.
8.  **UI Refresh:** React efficiently updates the displayed table rows to show only the problems from the filtered and sorted list.

This cycle repeats every time a user changes a filter, types in the search box, or clicks a column header to change the sort. The `useMemo` ensures that the filtering and sorting logic is applied efficiently, recalculating the list only when necessary.

### Under the Hood: Filtering and Sorting Flow

Let's trace the simplified process when a user changes a filter or sorts:

![Filtering and Sorting Sequence Diagram](/public/diagrams/chapter6.svg)

This diagram shows how user interaction with the UI components triggers state updates in `app/page.tsx`, which then performs the core filtering and sorting calculations using the full `data.questions` list and passes the result back down to the display component (`ProblemsTable`).

Now, let's look closer at the actual code snippets in `app/page.tsx` for the filtering and sorting logic within `useMemo`.

First, the filter logic. The provided `app/page.tsx` code uses a slightly more robust filtering method by checking against the `originalRows` associated with each `question`. This allows filtering even if a question appears with multiple companies/timeframes, ensuring it matches the filter if *any* of its occurrences match.

```typescript
// Inside the useMemo function in app/page.tsx (Filtering section)

// Filter questions based on their original CSV rows
const filtered = data.questions.filter((question) => {
  // Check if any of the original rows match the filters
  const hasMatchingRow = question.originalRows?.some((row) => { // Use .some() to check if AT LEAST ONE row matches ALL current filters
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        row.title?.toLowerCase().includes(searchLower) || row.topics?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false; // If search term is present but this row doesn't match, this row fails filter
    }

    // Company filter
    if (selectedCompany !== "all" && row.company !== selectedCompany) {
      return false; // If company filter is set and this row's company doesn't match, this row fails filter
    }

    // Difficulty filter
    if (selectedDifficulty !== "all" && row.difficulty !== selectedDifficulty) {
      return false; // If difficulty filter is set and this row's difficulty doesn't match, this row fails filter
    }

    // Timeframe filter
    if (selectedTimeframe !== "all" && row.timeframe !== selectedTimeframe) {
      return false; // If timeframe filter is set and this row's timeframe doesn't match, this row fails filter
    }

    // Topic filter
    if (selectedTopic !== "all") {
      const topics = row.topics?.split(/[,;|]/).map((t) => t.trim()) || [];
      if (!topics.includes(selectedTopic)) {
        return false; // If topic filter set and this row's topics don't include it, this row fails
      }
    }

    // If the row passes all individual filter checks...
    return true;
  });

  // A question is included in the filtered list ONLY if at least one of its original rows passed all filters.
  if (!hasMatchingRow) return false;

  // Multi-company filter (applied *after* individual row checks)
  if (showMultiCompany && question.companies.length <= 1) {
    return false; // If showing multi-company only, exclude questions with only one company
  }

  // If the question has at least one matching row AND passes multi-company filter...
  return true; // Include this question in the filtered list
});
```
This filter logic iterates through each *unique* `question` object. For each question, it then iterates through the `originalRows` that were combined to create it ([Chapter 5: CSV Data Processing](05_csv_data_processing.md)). It uses the `.some()` method to see if *at least one* of these original rows matches *all* of the currently selected filter criteria (search term, company, difficulty, timeframe, topic). Only if `hasMatchingRow` is true (and the `showMultiCompany` check passes) is the `question` kept in the `filtered` list.

Next, the sorting logic:

```typescript
// Inside the useMemo function in app/page.tsx (Sorting section)

// Create a copy to avoid modifying the original filtered array in place
const sorted = [...filtered].sort((a, b) => {
  let aValue: any, bValue: any;

  // Determine the values to compare based on sortField
  switch (sortField) {
    case "title":
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
      break;
    case "difficulty":
      const difficultyOrder: { [key: string]: number } = { EASY: 1, MEDIUM: 2, HARD: 3 };
      aValue = difficultyOrder[a.difficulty.toUpperCase() as keyof typeof difficultyOrder] || 2;
      bValue = difficultyOrder[b.difficulty.toUpperCase() as keyof typeof difficultyOrder] || 2;
      break;
    case "frequency":
      aValue = a.frequency || 0;
      bValue = b.frequency || 0;
      break;
    case "acceptance_rate":
      aValue = a.acceptance_rate || 0;
      bValue = b.acceptance_rate || 0;
      break;
    case "timeframe":
      // Simple string comparison for timeframes
      aValue = a.timeframe.toLowerCase();
      bValue = b.timeframe.toLowerCase();
      break;
    case "occurrences":
      // Compare based on the count of original rows
      aValue = a.originalRows?.length || 0;
      bValue = b.originalRows?.length || 0;
      break;
    default:
      return 0; // Should not happen if sortField is of type SortField
  }

  // Perform the comparison based on direction (asc or desc)
  if (sortDirection === "asc") {
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; // Standard ascending compare
  } else { // desc
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0; // Standard descending compare
  }
});
```
This code snippet shows how the `sort()` method works. It's given a function `(a, b)` that compares two items (`a` and `b`) from the list. The `switch` statement looks at the current `sortField` state to decide *which* property of the `question` objects (`title`, `difficulty`, etc.) to compare. It then uses the `sortDirection` state to determine whether `a` should come before `b` (return -1), after `b` (return 1), or if they are equal (return 0). Special handling is needed for non-alphabetical sorts like difficulty (using a numerical order map) and occurrences (comparing the length of `originalRows`).

### Conclusion

In this chapter, we've explored the critical concept of **Filtering and Sorting**. We learned that this functionality is implemented primarily within the `app/page.tsx` component, managing filter and sort state using `useState`. We saw how UI components like `<FiltersPanel>` and `<ProblemsTable>` interact with `app/page.tsx` by calling state update functions. Most importantly, we delved into the core filtering and sorting logic within the `useMemo` hook, understanding how it efficiently selects and orders problems based on the current state before passing the resulting list to the display table.

Now that we've seen how the data is fetched, processed, structured, filtered, and sorted, let's look at the building blocks that make up the user interface itself – the components we've been referencing like `<FiltersPanel>` and `<ProblemsTable>`. These components are often built using a UI library.

[Chapter 7: UI Component Library](07_ui_component_library.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/app/page.tsx), [[2]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/components/analytics/filters-panel.tsx), [[3]](https://github.com/Ashraf8ila/test/blob/4147000cd966e2a3dee49acc2ef0020552f3c420/components/analytics/problems-table.tsx)</sup></sub>