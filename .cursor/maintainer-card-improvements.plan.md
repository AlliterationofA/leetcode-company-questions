# Maintainer Card Improvements

## Background and Motivation

The user requested two improvements to the "Last Updated" card:

1. **Move avatar images after @handles**: Currently avatars appear before the username, but they should appear after for better visual flow
2. **Show this repo's last commit date**: The "Last Updated" date should reflect when THIS repo (AlliterationofA/leetcode-company-questions on branch dev) was last updated, not the data source repo

## Key Challenges and Analysis

1. **Avatar positioning**: Need to reorder elements so @handle comes first, then avatar
2. **Fetch correct repo data**: Currently fetching from "liquidslr/leetcode-company-wise-problems", need to also fetch from "AlliterationofA/leetcode-company-questions" on the "dev" branch
3. **State management**: Need new state variable to store this repo's last commit date
4. **Display logic**: Update the card to show the correct date

## High-level Task Breakdown

### Task 1: Move Avatars After @Handles
- **File**: `/Users/Shared/GitHub/Work/AlliterationofA/leetcode-company-questions/app/page.tsx`
- **Location**: Lines 643-650 (maintainer section)
- **Current order**: `Maintained by → avatar → @handle → & → avatar → @handle`
- **New order**: `Maintained by → @handle → avatar → & → @handle → avatar`
- **Success criteria**: Avatars appear after usernames without overlap

### Task 2: Fetch and Display This Repo's Last Commit
- **Add state variable**: `const [thisRepoLastUpdated, setThisRepoLastUpdated] = useState<string | null>(null)`
- **Fetch commit**: In `handleCSVProcessing`, add call to `githubApi.getLastCommitInfo("AlliterationofA", "leetcode-company-questions")`
- **Update card**: Change line 641 from `data.metadata.lastUpdated` to `thisRepoLastUpdated || data.metadata.lastUpdated`
- **Success criteria**: Card shows the actual last commit date from this repo

## Implementation Details

### Change 1: Reorder Avatar and Handle

**Current code (lines 643-650):**
```jsx
<div className="flex items-center gap-1 flex-wrap">
  <span>Maintained by</span>
  <img src="https://github.com/AlliterationofA.png" alt="AlliterationofA GitHub" className="h-3 w-3 rounded-full border border-card bg-card flex-shrink-0" />
  <a href="https://github.com/AlliterationofA" target="_blank" rel="noopener noreferrer" className="underline truncate">@AlliterationofA</a>
  <span className="text-xs">&</span>
  <img src="https://github.com/Ashraf8ila.png" alt="Ashraf8ila GitHub" className="h-3 w-3 rounded-full border border-card bg-card flex-shrink-0" />
  <a href="https://github.com/Ashraf8ila" target="_blank" rel="noopener noreferrer" className="underline truncate">@Ashraf8ila</a>
</div>
```

**New code:**
```jsx
<div className="flex items-center gap-1 flex-wrap">
  <span>Maintained by</span>
  <a href="https://github.com/AlliterationofA" target="_blank" rel="noopener noreferrer" className="underline truncate">@AlliterationofA</a>
  <img src="https://github.com/AlliterationofA.png" alt="AlliterationofA GitHub" className="h-3 w-3 rounded-full border border-card bg-card flex-shrink-0" />
  <span className="text-xs">&</span>
  <a href="https://github.com/Ashraf8ila" target="_blank" rel="noopener noreferrer" className="underline truncate">@Ashraf8ila</a>
  <img src="https://github.com/Ashraf8ila.png" alt="Ashraf8ila GitHub" className="h-3 w-3 rounded-full border border-card bg-card flex-shrink-0" />
</div>
```

### Change 2: Add This Repo's Last Commit Date

**Step 1: Add state (after line 60)**
```jsx
const [thisRepoLastUpdated, setThisRepoLastUpdated] = useState<string | null>(null)
```

**Step 2: Fetch this repo's commit (in handleCSVProcessing, after line 290)**
```jsx
// Fetch last commit for THIS repo (AlliterationofA/leetcode-company-questions)
const thisRepoInfo = await githubApi.getLastCommitInfo(
  "AlliterationofA",
  "leetcode-company-questions"
)
setThisRepoLastUpdated(thisRepoInfo.lastUpdated)
```

**Step 3: Update display (line 641)**

**Current:**
```jsx
<div className="text-2xl font-bold leading-tight mb-1 truncate">{formatDate(data.metadata.lastUpdated)}</div>
```

**New:**
```jsx
<div className="text-2xl font-bold leading-tight mb-1 truncate">{formatDate(thisRepoLastUpdated || data.metadata.lastUpdated)}</div>
```

## Success Criteria

1. ✅ Avatars appear after @handles in maintainer section
2. ✅ "Last Updated" card shows the last commit date from AlliterationofA/leetcode-company-questions repo
3. ✅ No visual overlap in the card
4. ✅ Fallback to data.metadata.lastUpdated if repo fetch fails
5. ✅ All links and avatars work correctly

