# LeetCode Company Questions Analytics

A modern web application for analyzing and visualizing LeetCode questions asked by different companies. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Interactive Analytics Dashboard**
  - Real-time data visualization
  - Company-specific question analysis
  - Difficulty distribution charts
  - Topic-based filtering
  - Time-based trends

- **Advanced Filtering & Sorting**
  - Search by question title or topics
  - Filter by company, difficulty, timeframe
  - Sort by multiple criteria
  - Multi-company analysis

- **Advanced Filtering & Sorting**
  - Search by question title or topics
  - Filter by company, difficulty, timeframe, and topic (all with multi-select and search)
  - AND/OR toggles for company and topic filters
  - Range filters for Occurrences, Frequency, and Acceptance %
  - Sort by multiple criteria
  - Multi-company analysis
  - All filters have a consistent, modern UI with icons matching the problems table

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## 📦 Project Structure

### Core Application Files

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── process-csv/   # CSV processing endpoints
│   │   │   └── route.ts   # Handles CSV data processing and validation
│   │   └── webhook/       # GitHub webhook handlers
│   │       └── route.ts   # Processes GitHub webhook events for data updates
│   ├── layout.tsx         # Root layout component with theme provider and global styles
│   ├── page.tsx           # Main dashboard page with analytics and filtering
│   ├── loading.tsx        # Loading state component
│   └── globals.css        # Global CSS styles and Tailwind imports
```

### Components

```
├── components/            # Reusable UI components
│   ├── analytics/         # Analytics-specific components
│   │   ├── filters-panel.tsx      # Advanced filtering interface
│   │   ├── problems-table.tsx     # Data table with sorting and pagination
│   │   ├── data-info-card.tsx     # Statistics and metrics display
│   │   └── chart-container.tsx    # Wrapper for Recharts components
│   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── button.tsx    # Custom button component
│   │   ├── card.tsx      # Card layout component
│   │   ├── input.tsx     # Input field component
│   │   └── ...          # Other UI components
│   └── theme-provider.tsx # Theme context provider
```

### Core Libraries and Utilities

```
├── lib/                  # Utility functions and services
│   ├── api-client.ts     # API client for GitHub and data fetching
│   ├── csv-processor.ts  # CSV parsing and data transformation
│   ├── error-handler.ts  # Custom error handling and reporting
│   ├── file-validator.ts # CSV file validation utilities
│   ├── github-api.ts     # GitHub API integration
│   ├── logger.ts         # Logging service
│   └── utils.ts          # General utility functions
```

### Technical Details

#### 1. Core Application Files

##### `app/page.tsx`
- Main dashboard component
- Implements data fetching, filtering, and visualization
- Key features:
  - Real-time data updates
  - Advanced filtering system
  - Interactive charts
  - Error boundary implementation
- Modification guide:
  - Add new chart types in the `ChartContainer` component
  - Extend filtering logic in the `handleFilter` function
  - Modify data transformation in the `processData` function

##### `app/api/process-csv/route.ts`
- Handles CSV data processing
- Features:
  - File validation
  - Data transformation
  - Error handling
- Modification guide:
  - Add new validation rules in `validateCSVData`
  - Extend data transformation in `transformData`
  - Add new API endpoints for specific data operations

#### 2. Components

##### Analytics Components

###### `components/analytics/filters-panel.tsx`
- Advanced filtering interface
- Features:
  - Dynamic filter generation
  - Real-time search
  - Multi-select capabilities
- Modification guide:
  - Add new filter types in `FilterType` enum
  - Extend filter logic in `handleFilterChange`
  - Customize filter UI in `FilterComponent`

###### `components/analytics/problems-table.tsx`
- Data table with advanced features
- Features:
  - Sorting
  - Pagination
  - Row selection
  - Custom cell rendering
- Modification guide:
  - Add new columns in `TableColumn` interface
  - Extend sorting logic in `handleSort`
  - Customize cell rendering in `renderCell`

##### UI Components

All UI components are built using shadcn/ui and can be customized:

1. **Theme Customization**
   - Modify `components.json` for component styling
   - Update `tailwind.config.ts` for theme colors
   - Extend `globals.css` for custom styles

2. **Component Extension**
   - Create new components in `components/ui`
   - Follow shadcn/ui component structure
   - Use existing components as templates

#### 3. Core Libraries

##### `lib/csv-processor.ts`
- CSV data processing and transformation
- Features:
  - Data parsing
  - Validation
  - Transformation
  - Error handling
- Modification guide:
  - Add new data transformations in `transformData`
  - Extend validation rules in `validateData`
  - Add new data processing methods

##### `lib/github-api.ts`
- GitHub API integration
- Features:
  - Repository access
  - File operations
  - Webhook handling
- Modification guide:
  - Add new API endpoints in `GitHubAPI` class
  - Extend error handling in `handleError`
  - Add new authentication methods

##### `lib/error-handler.ts`
- Custom error handling system
- Features:
  - Error classification
  - Logging
  - User feedback
- Modification guide:
  - Add new error types in `ErrorType` enum
  - Extend error handling in `handleError`
  - Customize error messages

### Contributing Guidelines

1. **Code Structure**
   - Follow TypeScript best practices
   - Use proper type definitions
   - Maintain consistent code style
   - Add JSDoc comments for complex functions

2. **Component Development**
   - Create components in appropriate directories
   - Follow existing component patterns
   - Use shadcn/ui for base components
   - Implement proper error handling

3. **Testing**
   - Add unit tests for new features
   - Test error cases
   - Verify data transformations
   - Check UI responsiveness

4. **Documentation**
   - Update README for new features
   - Document API changes
   - Add code comments
   - Update type definitions

5. **Performance**
   - Optimize data processing
   - Implement proper caching
   - Use React.memo where appropriate
   - Monitor bundle size


## 🛠️ Local Deployment Guide

### 1. Prerequisites Check

First, ensure you have the required software installed:

```bash
# Check Node.js version (should be v18 or higher)
node --version

# Check npm version
npm --version

# Check if Git is installed
git --version
```

### 2. Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/leetcode-company-questions.git
   cd leetcode-company-questions
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install

   # Or using pnpm (recommended)
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Create .env.local file
   touch .env.local
   ```

   Add the following variables to `.env.local`:
   ```env
   # GitHub API Configuration
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # Optional: Analytics Configuration
   NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
   ```

   To get a GitHub token:
   1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
   2. Generate a new token with `repo` and `read:packages` scopes
   3. Copy the token and paste it in `.env.local`

### 3. Development Server

1. **Start the Development Server**
   ```bash
   # Using npm
   npm run dev

   # Or using pnpm
   pnpm dev
   ```

2. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application should be running in development mode
   - You'll see hot-reloading enabled for development

### 4. Data Setup

1. **CSV Data Configuration**
   - Place your LeetCode questions CSV file in the `public` directory
   - The file should follow the format specified in the CSV Data Format section
   - Default filename: `codedata.csv`

2. **Verify Data Loading**
   - Check the browser console for any data loading errors
   - Verify that the dashboard displays the data correctly
   - Test the filtering and sorting functionality

### 5. Troubleshooting

#### Common Issues and Solutions

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

3. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server
   - Check for typos in variable names

4. **GitHub API Rate Limits**
   - Check your GitHub token permissions
   - Verify the token is correctly set in `.env.local`
   - Consider implementing rate limiting in the application

### 6. Development Workflow

1. **Code Changes**
   - Make changes to the code
   - The development server will automatically reload
   - Check the browser for updates

2. **Testing Changes**
   ```bash
   # Run linting
   npm run lint
   
   # Check for TypeScript errors
   npm run type-check
   ```

3. **Building for Production**
   ```bash
   # Create production build
   npm run build
   
   # Start production server
   npm run start
   ```

### 7. Performance Optimization

1. **Development Mode**
   - Use React Developer Tools for debugging
   - Monitor performance in Chrome DevTools
   - Check for unnecessary re-renders

2. **Production Mode**
   - Enable production mode for testing
   ```bash
   NODE_ENV=production npm run build
   npm run start
   ```

### 8. Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_API_URL=your_api_url
```

### CSV Data Format

The application expects CSV data in the following format:

```csv
title,difficulty,companies,topics,timeframe,acceptance_rate
```

## 📊 Data Processing

The application processes LeetCode question data through the following workflow:

1. **Data Fetching**
   - Fetches CSV data from GitHub repository
   - Supports manual CSV upload (feature disabled in current version)

2. **Data Processing**
   - Parses CSV content
   - Validates data structure
   - Transforms into analytics-ready format

3. **Data Analysis**
   - Generates company-specific statistics
   - Calculates difficulty distributions
   - Processes topic-based analytics
   - Tracks temporal trends

## 🎯 Features in Detail

### Analytics Dashboard

- **Overview Statistics**
  - Total questions count
  - Company distribution
  - Difficulty breakdown
  - Topic coverage

- **Interactive Charts**
  - Bar charts for company distribution
  - Pie charts for difficulty breakdown
  - Line charts for temporal trends

### Filtering System

- **Search**
  - Question title search
  - Topic-based search
  - Real-time filtering

- **Advanced Filters**
  - Company selection
  - Difficulty level
  - Timeframe
  - Topic categories

### Data Management

- **Automatic Updates**
  - GitHub webhook integration
  - Real-time data refresh
  - Error handling and recovery

- **Data Validation**
  - Input validation
  - Data integrity checks
  - Error reporting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LeetCode for providing the question data
- Next.js team for the amazing framework
- All contributors who have helped shape this project 

## 🧩 Filter Panel Features

The filter panel provides a powerful and intuitive way to explore the dataset:

- **Company, Difficulty, Timeframe, Topic Filters:**
  - Multi-select with search and clear buttons
  - AND/OR toggle for company and topic filters
  - Dropdowns show all available options, searchable in real time
  - Selected filters are visually highlighted
- **Range Filters:**
  - Filter by Occurrences, Frequency, and Acceptance % using min/max number inputs
  - Inputs default to the min/max values in the dataset
  - Up/down arrows increment/decrement from the dataset min/max
- **UI Consistency:**
  - All filters use the same icons as the problems table for instant recognition
  - Responsive two-row layout for clarity and usability
  - "Cross-Company Only" toggle for advanced analysis

### Example Usage

1. **Select multiple companies and topics using the dropdowns.**
2. **Toggle between AND/OR logic for company/topic filters.**
3. **Set a range for Occurrences, Frequency, or Acceptance % to narrow results.**
4. **All filters update the problems table in real time.** 