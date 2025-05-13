# Static Code Analysis Report

**Date:** May 12, 2025

## 1. Introduction

This report details the findings of a static code analysis performed on the Media Library Manager codebase. The primary objectives were to identify and catalog instances of:
1.  Potentially unused or dead code (including functions, methods, classes, variables, constants, imports, and unreachable code blocks).
2.  Incomplete or placeholder code (identified by markers like TODO, FIXME, XXX, stub functions, placeholder comments, or obviously unfinished logic).

The analysis covered both the backend (C#) and frontend (JavaScript/React) portions of the application.

## 2. Methodology

The analysis involved the following steps:
*   **Marker-Based Search:** Automated searches for common markers of incomplete code (e.g., `TODO`, `FIXME`, `XXX`) were performed across the codebase.
*   **Definition Listing:** Code definition tools were used to list classes, functions, methods, hooks, and components in key areas of the backend and frontend.
*   **Usage Analysis:** For the identified definitions, automated searches were conducted to find their usages within the codebase. Definitions with no apparent usages were flagged as potentially unused.
*   **Manual Review:** Specific files and code segments were manually reviewed based on initial findings to confirm or clarify potential issues.
*   **Placeholder Identification:** Searches for other common placeholder patterns (e.g., `NotImplementedException`, "Implement me", empty functions) were conducted.

## 3. Catalog of Findings

### 3.1. Incomplete Code (TODO Markers - Backend C#)

The following `TODO` markers were identified in the backend C# codebase, indicating areas requiring further development or attention:

| File Path                                       | Line(s) | Code Snippet (Relevant Part)                                     | Classification                | Suggested Remediation                                                                 |
|-------------------------------------------------|---------|------------------------------------------------------------------|-------------------------------|---------------------------------------------------------------------------------------|
| [`backend/Program.cs`](backend/Program.cs:20)                     | 20      | `// TODO: Make origin configurable for production`                 | Configuration Placeholder     | Move CORS origin to `appsettings.json` or environment variables.                      |
| [`backend/Program.cs`](backend/Program.cs:54)                     | 54      | `// TODO: Move JWT settings (Key, Issuer, Audience) to appsettings.json` | Configuration Placeholder     | Relocate JWT configuration (Key, Issuer, Audience) to `appsettings.json`.             |
| [`backend/Program.cs`](backend/Program.cs:96)                     | 96      | `// TODO: Add other services (e.g., Logging, Custom Services)`     | Feature Enhancement           | Implement or integrate additional services like logging or other custom business logic. |
| [`backend/Models/Collection.cs`](backend/Models/Collection.cs:23)   | 23      | `// TODO: Add UserId later when User entity is implemented`        | Deferred Feature              | Add `UserId` property and link to User entity once user management is fully implemented. |
| [`backend/Services/IFileStorageService.cs`](backend/Services/IFileStorageService.cs:20) | 20      | `// TODO: Add methods for getting file streams, etc. later if needed.` | Potential Enhancement         | Evaluate need and implement methods for file streaming if required by features.       |
| [`backend/Models/MediaItem.cs`](backend/Models/MediaItem.cs:20)     | 20      | `// TODO: Add Navigation Property for Folder later: public Folder? Folder { get; set; }` | Deferred Feature | Add the navigation property `Folder` to the `MediaItem` model.                      |
| [`backend/Api/AuthApi.cs`](backend/Api/AuthApi.cs:32)               | 32      | `// TODO: Add endpoints for logout, refresh token, password reset etc.` | Incomplete Feature            | Implement API endpoints for user logout, token refresh, and password reset.           |
| [`backend/Api/AuthApi.cs`](backend/Api/AuthApi.cs:76)               | 76-77   | `// TODO: Optionally assign roles... send confirmation email`      | Optional Feature              | Implement role assignment during registration and email confirmation if desired.        |
| [`backend/Api/AuthApi.cs`](backend/Api/AuthApi.cs:136)              | 136     | `// TODO: Add roles if using them:`                               | Optional Feature              | Add role claims to JWT if role-based authorization is implemented.                  |
| [`backend/Api/CollectionsApi.cs`](backend/Api/CollectionsApi.cs:73) | 73      | `// TODO: Add endpoint for sharing collections`                    | Incomplete Feature            | Implement an API endpoint for sharing collections between users.                      |
| [`backend/Api/CollectionsApi.cs`](backend/Api/CollectionsApi.cs:115)| 115     | `// TODO: Add pagination/sorting for contents if needed`           | Potential Enhancement         | Implement pagination and sorting for collection contents if lists become large.       |
| [`backend/Api/CollectionsApi.cs`](backend/Api/CollectionsApi.cs:135)| 135     | `// TODO: Assign UserId when auth is implemented`                  | Deferred Feature              | Assign `UserId` when creating collections once authentication is integrated.          |
| [`backend/Api/FoldersApi.cs`](backend/Api/FoldersApi.cs:70)         | 70      | `// TODO: Consider if loading children/parent is needed here...`   | Design Consideration          | Evaluate if eager/lazy loading of folder hierarchy is needed for `GetAllFolders`.     |
| [`backend/Api/FoldersApi.cs`](backend/Api/FoldersApi.cs:165)        | 165     | `// TODO: Add logic to update Path for this folder and ALL descendants...` | Complex Deferred Logic      | Implement logic to recursively update paths of descendant folders on name change.     |
| [`backend/Api/FoldersApi.cs`](backend/Api/FoldersApi.cs:278)        | 278     | `// TODO: Add MediaItemCount if needed (requires extra query or join)` | Potential Enhancement    | Add `MediaItemCount` to `FolderTreeNodeDto` if useful, optimizing the query.        |
| [`backend/Api/FoldersApi.cs`](backend/Api/FoldersApi.cs:307)        | 307     | `// TODO: Add pagination/sorting`                                  | Potential Enhancement         | Implement pagination and sorting for folder contents.                                 |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:52)             | 52      | `// TODO: Add batch operations if needed (batch update, batch delete)` | Potential Feature           | Implement batch update/delete operations for media items if required.               |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:60)             | 60      | `// TODO: Implement filtering, sorting, pagination based on query parameters` | Incomplete Feature       | Implement filtering, sorting, and pagination for `GetAllMediaItems`.                |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:96)             | 96      | `// TODO: Add more robust validation (file type, size limits, etc.)` | Missing Validation            | Enhance validation for media item creation (file type, size, etc.).                 |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:113)            | 113     | `// TODO: Add validation for manually bound DTO fields if needed`  | Missing Validation            | Add validation for DTO fields if they are manually bound and not covered by attributes. |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:137)            | 137     | `// TODO: Extract Dimensions/Duration if possible...`              | Potential Feature           | Implement logic to extract dimensions/duration from media files upon creation.      |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:164)            | 164     | `// TODO: Consider deleting the saved file if DB save fails...`    | Missing Error Handling        | Implement a compensating transaction to delete uploaded file if DB save fails.        |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:201)            | 201     | `// TODO: Validate FolderId exists if implementing folders later`  | Missing Validation            | Add validation to ensure `FolderId` exists when updating a media item.              |
| [`backend/Api/MediaApi.cs`](backend/Api/MediaApi.cs:246)            | 246     | `// TODO: Add validation for allowed status values`                | Missing Validation            | Implement validation for allowed media item status values during updates.             |
| [`backend/Api/TagsApi.cs`](backend/Api/TagsApi.cs:51)               | 51      | `// TODO: Add endpoints for GetMediaByTag, GetPopularTags`         | Incomplete Feature            | Implement API endpoints to get media by tag and retrieve popular tags.              |
| [`backend/Api/UsersApi.cs`](backend/Api/UsersApi.cs:52)             | 52      | `// TODO: Add endpoints for GET /users, GET /users/{id}, PUT /users/recent` | Incomplete Feature      | Implement additional user management and activity endpoints.                        |
| [`backend/Api/UsersApi.cs`](backend/Api/UsersApi.cs:122)            | 122-123 | `// TODO: Handle Email update... Handle other profile fields`      | Incomplete Feature            | Implement logic for updating user email (with confirmation) and other profile fields. |

### 3.2. Incomplete Code (TODO Markers - Frontend JS/JSX)

| File Path                                 | Line(s) | Code Snippet (Relevant Part)                               | Classification     | Suggested Remediation                                                                 |
|-------------------------------------------|---------|------------------------------------------------------------|--------------------|---------------------------------------------------------------------------------------|
| [`src/components/App.jsx`](src/components/App.jsx:319) | 319     | `// TODO: Get all media IDs from the current view`         | Incomplete Feature | Implement logic in `handleSelectAll` to fetch and select all media IDs in the current view. |

### 3.3. Incomplete Code (Placeholder Functions - Frontend JS/JSX)

| File Path                                 | Function Name        | Line(s)   | Code Snippet (Relevant Part)                                  | Classification       | Suggested Remediation                                                              |
|-------------------------------------------|----------------------|-----------|---------------------------------------------------------------|----------------------|------------------------------------------------------------------------------------|
| [`src/components/App.jsx`](src/components/App.jsx:241) | `getNextMediaId`     | 241-246   | `console.log(...); return null; // placeholder...`             | Placeholder Function | Implement logic to get the ID of the next media item for navigation in QuickView/MediaViewer. |
| [`src/components/App.jsx`](src/components/App.jsx:264) | `getPreviousMediaId` | 264-269   | `console.log(...); return null; // placeholder...`             | Placeholder Function | Implement logic to get the ID of the previous media item for navigation.           |

### 3.4. Potentially Unused Files (Frontend)

| File Path                                                 | Classification      | Suggested Remediation                                                                                                |
|-----------------------------------------------------------|---------------------|----------------------------------------------------------------------------------------------------------------------|
| [`src/hooks/useMockApi.js`](src/hooks/useMockApi.js)         | Unused Hooks File   | Verify not used by tests/builds outside `src`. If confirmed, remove. Mocking is handled by mock services via `src/services/index.js`. |
| [`src/components/QuickView.jsx`](src/components/QuickView.jsx) | Unused Component    | Verify and remove. `MediaViewer.jsx` appears to serve its intended purpose in `App.jsx`.                               |

### 3.5. Potentially Unused Exports (Frontend Hooks)

The following hooks exported from [`src/hooks/useApi.js`](src/hooks/useApi.js) appear to be unused within the `src` directory:

| Hook Name                      | Classification          | Suggested Remediation                                                       |
|--------------------------------|-------------------------|-----------------------------------------------------------------------------|
| `useMediaItem`                 | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useCollectionContents`        | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useCollection`                | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useChildCollections`          | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useRemoveItemsFromCollection` | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useBulkImport`                | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useTagById`                   | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useCreateTagCategory`         | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useUpdateTagCategory`         | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useTagSuggestions`            | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |
| `useMediaWithTag`              | Potentially Unused Hook | Verify usage. If confirmed unused, remove from `useApi.js`.                 |

### 3.6. Potentially Unused Exports (Frontend Utilities)

| File Path                                                           | Function Name  | Classification                   | Suggested Remediation                                      |
|---------------------------------------------------------------------|----------------|----------------------------------|------------------------------------------------------------|
| [`src/mocks/utils/apiUtils.js`](src/mocks/utils/apiUtils.js:129) | `applyFilters` | Potentially Unused Utility Function | Verify usage. If confirmed unused, remove from the file. |

### 3.7. Developer/Testing Utility Pages (Frontend)

The following pages appear to be utilities for development and testing:

| File Path                                                             | Classification             | Suggested Remediation                                                     |
|-----------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------|
| [`src/pages/data-source-test.jsx`](src/pages/data-source-test.jsx)   | Developer/Testing Utility  | Likely not dead code if used for testing. Consider exclusion from production builds. |
| [`src/pages/mock-explorer.jsx`](src/pages/mock-explorer.jsx)         | Developer/Testing Utility  | Likely not dead code if used for testing. Consider exclusion from production builds. |

## 4. Overall Summary and Recommendations

The static analysis identified several areas for improvement:
*   **Backend TODOs:** A significant number of `TODO` comments in the backend indicate planned features, configuration improvements, and missing logic. Prioritizing those related to security (JWT configuration) and core functionality (path updates, robust validation) is recommended.
*   **Frontend Placeholders:** Some frontend functions are placeholders and need full implementation (e.g., media navigation, select all).
*   **Unused Frontend Code:** There are potentially unused files (`useMockApi.js`, `QuickView.jsx`) and a number of unused exported hooks from `useApi.js`. Removing confirmed unused code will improve maintainability and reduce bundle size. The `applyFilters` utility in mock utils also seems unused.
*   **Developer Utilities:** Pages like `data-source-test.jsx` and `mock-explorer.jsx` are valuable for development but should be reviewed to ensure they are not included in production builds unless intended.

Addressing these findings will contribute to a more robust, maintainable, and cleaner codebase.