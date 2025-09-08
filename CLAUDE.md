# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Start development server (uses custom port finder script)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run Playwright tests (tests located in tests/*.spec.ts)
npx playwright test
```

## Architecture Overview

This is a Next.js 15.3.0 media library management application built with React 19, TypeScript, and TailwindCSS. The app provides comprehensive digital asset management with folder organization, collections, tagging, and media viewing/editing capabilities.

### Core Architecture Patterns

**Component Structure**: The application follows a component-driven architecture with all UI components in `src/components/`. The main entry point is `App.tsx` which orchestrates the entire application state and layout.

**State Management**: Uses React Context API with multiple specialized contexts in `src/contexts/`:
- `UserContext`: User preferences and authentication state
- `NavigationContext`: Folder/collection navigation state
- `MediaOperationsContext`: Media selection and bulk operations
- `FilterContext`: Search and filter state
- `UIStateContext`: UI visibility and modal states

**API Layer**: All API interactions go through custom hooks in `src/hooks/useApi.ts` that provide a consistent interface for data fetching and mutations.

**Mock Data System**: During development, the app uses a comprehensive mock system (`src/mocks/`) that simulates backend functionality with realistic data, network delays, and error states. The mock system includes:
- Mock APIs that mirror real API structure
- Realistic data relationships and pagination
- Configurable delays and error simulation
- High-quality Unsplash placeholders for media

### Key Components

- **App.tsx**: Main application orchestrator, manages global state and layout
- **MediaContent.tsx**: Central content area displaying media grid/list
- **MediaViewer.tsx**: Quick view modal for media preview and navigation
- **DetailsSidebar.tsx**: Properties panel for selected media items
- **FolderNavigation.tsx**: Hierarchical folder tree navigation
- **FilterBar.tsx**: Advanced filtering and search interface

### Development Workflow

**Port Management**: The dev server uses a custom script (`scripts/dev-server.js`) that automatically finds an available port starting from 3015.

**TypeScript**: Strict typing throughout with comprehensive type definitions in `src/types/`.

**Testing**: Playwright tests in `tests/` directory focus on critical user flows like media viewing, folder navigation, and quick view functionality.

**Data Source Configuration**: The app supports switching between mock and real API data sources through environment variables or runtime configuration stored in localStorage.