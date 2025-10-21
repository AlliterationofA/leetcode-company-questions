# Fix Company Logos Display

## Overview
Replace the current Clearbit logo API implementation with a better logo service that provides more reliable company logos with proper fallbacks.

## Current Issue
- Clearbit Logo API (`https://logo.clearbit.com/`) is not displaying logos correctly
- Simple domain construction (`company.name.toLowerCase().replace(/\s+/g, '')}.com`) doesn't work for most companies
- Fallback to UI Avatars creates generic letter avatars instead of real logos

## Implementation Strategy

### Option 1: Use Multiple Logo Services with Fallback Chain

We'll implement a waterfall approach using multiple logo services:

1. **Primary**: Logo.dev API (`https://img.logo.dev/`)
2. **Secondary**: Clearbit API (improved)
3. **Tertiary**: UI Avatars (existing fallback)

### Files to Modify

**File**: `/Users/Shared/GitHub/Work/AlliterationofA/leetcode-company-questions/app/page.tsx`

**Location**: Lines 847-854 (Company logo rendering in Companies tab)

### Current Code

```jsx
<img 
  src={`https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`}
  alt={`${company.name} logo`}
  className="w-8 h-8 rounded"
  onError={(e) => {
    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(company.name) + '&background=random';
  }}
/>
```

### Proposed Solution

#### Approach A: Helper Function for Logo URL (Recommended)

Create a helper function that generates better logo URLs:

```jsx
// Add this helper function near the top of the component
const getCompanyLogoUrl = (companyName: string) => {
  // Normalize company name to domain
  const normalizedDomain = companyName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
  
  // Use Logo.dev which has better coverage
  return `https://img.logo.dev/${normalizedDomain}.com?token=pk_X-FzcodETdOmGu_S_UnMFA&size=80`;
}

const getCompanyLogoFallback = (e: React.SyntheticEvent<HTMLImageElement>, companyName: string) => {
  const img = e.currentTarget;
  
  // First fallback: Try Clearbit
  if (img.src.includes('logo.dev')) {
    const normalizedDomain = companyName.toLowerCase().replace(/\s+/g, '');
    img.src = `https://logo.clearbit.com/${normalizedDomain}.com`;
  }
  // Second fallback: Use UI Avatars
  else if (img.src.includes('clearbit.com')) {
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=80`;
  }
  // Final fallback: Already on UI Avatars, prevent infinite loop
  else {
    img.style.display = 'none';
  }
}
```

Then update the image tag:

```jsx
<img 
  src={getCompanyLogoUrl(company.name)}
  alt={`${company.name} logo`}
  className="w-8 h-8 rounded object-contain bg-white"
  onError={(e) => getCompanyLogoFallback(e, company.name)}
/>
```

#### Approach B: Simple Logo.dev Implementation (Simpler)

Just replace with Logo.dev API which has better coverage:

```jsx
<img 
  src={`https://img.logo.dev/${company.name.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-FzcodETdOmGu_S_UnMFA&size=80`}
  alt={`${company.name} logo`}
  className="w-8 h-8 rounded object-contain bg-white"
  onError={(e) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=80`;
  }}
/>
```

**Note**: Logo.dev requires an API token. The token shown is a demo token - we should use a free tier token or explore other services like:
- Brandfetch API (https://brandfetch.com/)
- Unavatar (https://unavatar.io/)
- Company Logo API (https://logo.clearbit.com/) - but with better domain mapping

#### Approach C: Use Free Logo Services

Use a combination of free services without API keys:

```jsx
const getCompanyLogoUrl = (companyName: string) => {
  const domain = companyName.toLowerCase().replace(/\s+/g, '');
  // Try multiple free services
  return `https://logo.clearbit.com/${domain}.com`;
}

const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>, companyName: string) => {
  const img = e.currentTarget;
  const normalizedName = companyName.toLowerCase().replace(/\s+/g, '');
  
  if (!img.dataset.fallbackAttempt) {
    img.dataset.fallbackAttempt = '1';
    // Try alternative domain formats
    img.src = `https://logo.clearbit.com/${normalizedName}.io`;
  } else if (img.dataset.fallbackAttempt === '1') {
    img.dataset.fallbackAttempt = '2';
    // Try Google's favicon service
    img.src = `https://www.google.com/s2/favicons?domain=${normalizedName}.com&sz=128`;
  } else {
    // Final fallback
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=80`;
  }
}
```

### Recommended Approach

I recommend **Approach C** (free services) as it doesn't require API keys and provides good coverage with multiple fallback attempts.

## Key Improvements

1. **Better domain handling**: Try multiple TLDs (.com, .io, etc.)
2. **Multiple fallback layers**: Google favicons, then UI Avatars
3. **Object-contain**: Prevent logo distortion
4. **Background color**: White background for transparent logos
5. **Larger size**: Request 80px or 128px for better quality

## Success Criteria

- ✅ Company logos display correctly for major tech companies (Google, Meta, Amazon, Microsoft, etc.)
- ✅ Graceful fallback when logos aren't available
- ✅ No broken image icons
- ✅ Logos are properly sized and not distorted
- ✅ No API rate limiting issues

