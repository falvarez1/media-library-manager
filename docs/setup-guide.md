# Media Library Manager - Setup Guide

This guide will help you set up and run the Media Library Manager on your local development machine.

## Prerequisites

Before getting started, make sure you have the following installed:

- Node.js (v16.0.0 or later)
- npm (v7.0.0 or later) or yarn (v1.22.0 or later)
- Git (optional, for cloning the repository)

## Setup Instructions

### 1. Clone or Create the Project

#### Option A: Create a New Next.js Project

```bash
# Create a new Next.js project
npx create-next-app media-library-manager
cd media-library-manager
```

#### Option B: Clone the Repository (if available)

```bash
git clone https://github.com/yourusername/media-library-manager.git
cd media-library-manager
```

### 2. Install Dependencies

```bash
# Using npm
npm install react react-dom next
npm install lucide-react
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms

# Or using yarn
yarn add react react-dom next
yarn add lucide-react
yarn add tailwindcss postcss autoprefixer
yarn add -D @tailwindcss/forms
```

### 3. Set Up Tailwind CSS

Initialize Tailwind CSS configuration:

```bash
npx tailwindcss init -p
```

Update the `tailwind.config.js` file:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

Create or update the `styles/globals.css` file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Create the Component Files

Create a `components` directory in your project root and add each of the component files:

1. Create `components/FolderNavigation.jsx`
2. Create `components/MediaContent.jsx`
3. Create `components/MediaItem.jsx`
4. Create `components/DetailsSidebar.jsx`
5. Create `components/FilterBar.jsx`
6. Create `components/QuickView.jsx`
7. Create `components/MediaEditor.jsx`
8. Create `components/App.jsx` (main app layout)

Copy the code from each artifact into the appropriate file.

### 5. Create the Home Page

Create or update the `pages/index.js` file:

```javascript
import MediaLibraryManager from '../components/App';

export default function Home() {
  return (
    <div className="h-screen">
      <MediaLibraryManager />
    </div>
  );
}
```

### 6. Run the Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
media-library-manager/
│
├── components/
│   ├── App.jsx               # Main application layout
│   ├── FolderNavigation.jsx  # Left sidebar with folder navigation
│   ├── MediaContent.jsx      # Main content area with media items
│   ├── MediaItem.jsx         # Individual media item component
│   ├── DetailsSidebar.jsx    # Right sidebar with item details
│   ├── FilterBar.jsx         # Filter bar for searching and filtering
│   ├── QuickView.jsx         # Modal for quick viewing media
│   └── MediaEditor.jsx       # Modal for editing images
│
├── pages/
│   └── index.js              # Home page that renders the app
│
├── styles/
│   └── globals.css           # Global styles with Tailwind imports
│
├── public/                   # Public assets
│
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Project dependencies
```

## Customization

### Mock Data

The components currently use mock data defined within each component. In a production environment, you would want to:

1. Create a central state management system (Context API, Redux, etc.)
2. Connect to a backend API for data retrieval and mutation
3. Implement proper authentication and authorization

### Backend Integration

To connect this frontend to a backend:

1. Create API routes in the `pages/api` directory
2. Use `fetch` or a library like `axios` to make API calls
3. Update the components to use real data from your API

## Additional Features to Implement

- User authentication and authorization
- Real-time collaboration
- Advanced search with filters
- Drag and drop uploading
- Bulk operations on multiple files
- Version control and history
- Integration with cloud storage services
- Analytics dashboard

## Troubleshooting

- **Components not rendering correctly**: Make sure you've correctly imported all dependencies and components
- **Tailwind styles not applying**: Check that your Tailwind configuration is properly set up
- **Image placeholders not showing**: The project uses `/api/placeholder/{width}/{height}` URLs for mock images, which won't work locally. Replace these with actual image URLs or use a placeholder service like `https://placehold.co/{width}x{height}`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [React Documentation](https://reactjs.org/docs/getting-started.html)