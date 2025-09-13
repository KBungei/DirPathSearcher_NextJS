# Dir Path Searcher - TODO List

## 1. Project Setup
- [x] Initialize Next.js project with server-side rendering
- [x] Install and configure Bootstrap for UI styling
- [x] Set up project structure (pages, components, utils, etc.)

## 2. Database and Persistence
- [ ] Set up SQLite database for storing root directory paths
- [ ] Create database utility functions for CRUD operations on root paths
- [ ] Implement logic to validate and update root paths on app launch

## 3. Directory Scanning and Watching
- [ ] Implement recursive directory scanning logic
- [ ] Implement file system watching for directory changes (additions, deletions, renames)
- [ ] Create utility functions for maintaining the directory paths list

## 4. Search Functionality
- [ ] Implement case-insensitive and accent-insensitive text normalization
- [ ] Create search phrase parsing logic (handling ">", "!", order enforcement)
- [ ] Implement search matching algorithm for directory paths
- [ ] Add sorting logic for search results (roots to subfolders)

## 5. Backend API Routes
- [ ] Create API route for adding new directory paths
- [ ] Create API route for scanning directories
- [ ] Create API route for searching directory paths
- [ ] Implement modal popup status updates during operations

## 6. Frontend UI Components
- [ ] Create main page layout with Bootstrap styling
- [ ] Implement directory path input component
- [ ] Implement search input component with phrase parsing
- [ ] Add checkbox for order enforcement in search
- [ ] Create scrollable search results display with copy functionality
- [ ] Implement modal popup for "Scanning directories, please wait..." status

## 7. Integration and Testing
- [ ] Connect frontend components to backend API routes
- [ ] Test directory scanning and watching functionality
- [ ] Test search functionality with various phrases and options
- [ ] Test UI interactions and copy functionality
- [ ] Perform end-to-end testing of the complete app
