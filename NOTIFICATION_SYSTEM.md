# Notification System Documentation

## Overview

The Media Library Manager application now includes a comprehensive notification/toast system that provides user feedback for various operations. The system is built with React Context API, TypeScript, and Tailwind CSS, offering smooth animations, keyboard accessibility, and multiple notification types.

## Features

### Core Features
- ✅ **Multiple notification types**: success, error, warning, info
- ✅ **Configurable auto-dismiss**: with customizable timeout
- ✅ **Manual dismiss**: with close button
- ✅ **Stacking multiple notifications**: up to configurable maximum
- ✅ **Smooth animations**: enter/exit transitions from multiple directions
- ✅ **Keyboard accessible**: ESC to dismiss, tab navigation
- ✅ **Position management**: 6 different screen positions
- ✅ **Pause on hover**: stops auto-dismiss timers
- ✅ **Action buttons**: optional interactive buttons
- ✅ **Progress indicators**: visual countdown for auto-dismiss

### Advanced Features
- ✅ **Async operation helpers**: automatic loading/success/error states
- ✅ **Quick notification methods**: common patterns (upload, save, copy, etc.)
- ✅ **TypeScript integration**: full type safety
- ✅ **Performance optimized**: memoized context values, minimal re-renders
- ✅ **Portal rendering**: proper z-index stacking

## Architecture

### File Structure
```
src/
├── contexts/
│   └── NotificationContext.tsx     # Main context and provider
├── components/
│   ├── NotificationToast.tsx       # Toast UI components
│   └── NotificationDemo.tsx        # Development demo (optional)
├── hooks/
│   └── useNotification.ts          # Convenience hook with utilities
└── styles/
    └── globals.css                 # Animation CSS classes
```

### Components

#### 1. NotificationContext
**File**: `src/contexts/NotificationContext.tsx`

The central context that manages all notification state and provides actions.

**Key interfaces**:
```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

interface NotificationOptions {
  type?: NotificationType;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}
```

#### 2. NotificationToast
**File**: `src/components/NotificationToast.tsx`

The UI component that renders notifications using React Portal.

**Features**:
- Renders in document.body for proper z-index
- Handles all 6 position variants
- Smooth enter/exit animations
- Progress bar for auto-dismiss
- Keyboard navigation support

#### 3. useNotification Hook
**File**: `src/hooks/useNotification.ts`

Enhanced hook providing convenience methods for common notification patterns.

## Usage

### Basic Setup

The notification system is already integrated into the main App.tsx:

```tsx
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

function App() {
  return (
    <NotificationProvider position="top-right" maxNotifications={5}>
      {/* Your app content */}
      
      {/* Notification Toast Container */}
      <NotificationToast />
    </NotificationProvider>
  );
}
```

### Basic Usage

```tsx
import useNotification from '../hooks/useNotification';

function MyComponent() {
  const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();

  const handleSuccess = () => {
    notifySuccess('Operation completed!', {
      message: 'Your file has been uploaded successfully.',
      duration: 4000
    });
  };

  const handleError = () => {
    notifyError('Upload failed', {
      message: 'Please try again later.',
      duration: 0 // Don't auto-dismiss
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

### Quick Methods

The hook provides quick methods for common scenarios:

```tsx
function FileOperations() {
  const { quick } = useNotification();

  const handleUpload = () => {
    quick.uploadSuccess('image.jpg');
  };

  const handleSave = () => {
    quick.saveSuccess('Document');
  };

  const handleNetworkError = () => {
    quick.networkError('upload file');
  };

  // Other quick methods available:
  // quick.uploadError(), quick.saveError(), quick.deleteSuccess()
  // quick.copySuccess(), quick.moveSuccess(), quick.permissionError()
  // quick.maintenance(), quick.updateAvailable()
}
```

### Async Operations

Handle async operations with automatic loading/success/error states:

```tsx
function AsyncOperations() {
  const { async: asyncNotify } = useNotification();

  const handleAsyncSave = async () => {
    try {
      await asyncNotify.notifySave(
        () => saveDocument(), // Your async operation
        'Document'           // Item name (optional)
      );
    } catch (error) {
      // Error notification is automatically shown
    }
  };

  const handleCustomAsync = async () => {
    await asyncNotify.notifyAsync(
      () => customOperation(),
      {
        loading: 'Processing...',
        success: 'Operation completed!',
        error: 'Operation failed'
      }
    );
  };
}
```

### Notifications with Actions

```tsx
function NotificationWithAction() {
  const { notifyInfo } = useNotification();

  const showUpdateNotification = () => {
    notifyInfo('Update Available', {
      message: 'A new version is available.',
      duration: 0, // Don't auto-dismiss
      action: {
        label: 'Download',
        onClick: () => {
          window.open('https://updates.example.com');
        }
      }
    });
  };
}
```

### Advanced Configuration

```tsx
function AdvancedUsage() {
  const { 
    notify, 
    clearAll, 
    setPosition, 
    setMaxNotifications 
  } = useNotification();

  const customNotification = () => {
    notify('Custom Notification', {
      type: 'warning',
      message: 'This is a custom notification with all options.',
      duration: 8000,
      dismissible: true,
      action: {
        label: 'Action',
        onClick: () => console.log('Action clicked')
      },
      onDismiss: () => console.log('Notification dismissed')
    });
  };

  const changeSettings = () => {
    setPosition('bottom-left');
    setMaxNotifications(3);
  };

  const clearAllNotifications = () => {
    clearAll();
  };
}
```

## Configuration Options

### NotificationProvider Props

```typescript
interface NotificationProviderProps {
  children: ReactNode;
  position?: NotificationPosition;     // Default: 'top-right'
  maxNotifications?: number;           // Default: 5
  defaultDuration?: number;            // Default: 5000ms
}
```

### Position Options

```typescript
type NotificationPosition = 
  | 'top-right'     // Default
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';
```

### Notification Types

```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info';
```

## Styling and Theming

### CSS Classes

The notification system uses Tailwind CSS classes with custom animations defined in `globals.css`:

- **Container**: Positioned fixed with z-index 50
- **Toast**: Rounded corners, shadow, border, padding
- **Types**: Color-coded backgrounds and text
- **Animations**: Slide in/out from various directions

### Type-specific Styling

- **Success**: Green color scheme with CheckCircle icon
- **Error**: Red color scheme with XCircle icon  
- **Warning**: Yellow color scheme with AlertTriangle icon
- **Info**: Blue color scheme with Info icon

### Custom Animations

All animations are defined in `globals.css`:
- `slide-in-right`, `slide-out-right`
- `slide-in-left`, `slide-out-left`
- `slide-in-down`, `slide-out-up`
- `slide-in-up`, `slide-out-down`
- `toast-progress` for auto-dismiss indicator

## Accessibility

### Keyboard Support
- **Tab**: Navigate between notifications
- **Escape**: Dismiss focused notification
- **Enter**: Activate action button (if present)

### Screen Reader Support
- `role="alert"` for important notifications
- `aria-live="polite"` for non-intrusive updates
- `aria-atomic="true"` for complete message reading
- Proper labeling for dismiss and action buttons

### Focus Management
- Notifications are focusable with `tabIndex={0}`
- Visual focus indicators with `focus:ring-2`
- Logical tab order for multiple notifications

## Development Tools

### Demo Component
In development mode, a demo panel is available in the bottom-left corner with buttons to test:
- Basic notification types
- Quick methods
- Async operations
- Notifications with actions
- Long-running notifications
- Clear all functionality

### Debug Features
- Console logging for notification lifecycle (can be enabled)
- Visual progress indicators
- Hover state debugging (pause timers)

## Performance Considerations

### Optimizations
- **Memoized context value**: Prevents unnecessary re-renders
- **Stable function references**: Using useCallback for actions
- **Portal rendering**: Efficient DOM management
- **Cleanup timers**: Automatic cleanup on unmount
- **Limited stacking**: Automatic removal of oldest notifications

### Memory Management
- Automatic cleanup of expired notifications
- Timer cleanup on component unmount
- Efficient animation handling with CSS transitions

## Integration Examples

### Form Submission
```tsx
import { useFormNotification } from '../hooks/useNotification';

function ContactForm() {
  const submitWithNotification = useFormNotification(async (data) => {
    await submitForm(data);
  });

  return (
    <form onSubmit={submitWithNotification}>
      {/* form fields */}
    </form>
  );
}
```

### API Operations
```tsx
import { useApiNotification } from '../hooks/useNotification';

function DataManager() {
  const saveWithNotification = useApiNotification(
    saveData,
    'Saving data'
  );

  const deleteWithNotification = useApiNotification(
    deleteData,
    'Deleting item'
  );
}
```

### File Operations
```tsx
function FileUploader() {
  const { quick, async: asyncNotify } = useNotification();

  const handleFileUpload = async (file: File) => {
    try {
      await asyncNotify.notifyUpload(
        () => uploadFile(file),
        file.name
      );
    } catch (error) {
      // Error automatically handled
    }
  };

  const handleFileCopy = () => {
    quick.copySuccess('document.pdf');
  };
}
```

## Testing

### Unit Testing
```typescript
// Test notification creation
const { result } = renderHook(() => useNotification(), {
  wrapper: NotificationProvider
});

act(() => {
  result.current.notifySuccess('Test message');
});

expect(result.current.notifications).toHaveLength(1);
```

### Integration Testing
```typescript
// Test with user interactions
render(
  <NotificationProvider>
    <TestComponent />
    <NotificationToast />
  </NotificationProvider>
);

fireEvent.click(screen.getByText('Trigger Notification'));
expect(screen.getByText('Success!')).toBeInTheDocument();
```

## Migration Guide

### From Manual Toast Implementation
1. Remove existing toast components
2. Install the notification system
3. Replace manual toast calls with useNotification hook
4. Update global CSS with animation classes

### Adding to Existing Projects
1. Copy the three main files (Context, Component, Hook)
2. Add CSS animations to global styles
3. Wrap app with NotificationProvider
4. Add NotificationToast component
5. Replace existing notification calls

## Troubleshooting

### Common Issues

**Notifications not appearing**:
- Ensure NotificationProvider wraps your component
- Check z-index conflicts (notifications use z-50)
- Verify NotificationToast is rendered

**Animations not working**:
- Ensure CSS animations are loaded in globals.css
- Check for conflicting CSS transitions
- Verify Tailwind CSS is properly configured

**Hook errors**:
- Ensure useNotification is called inside NotificationProvider
- Check for proper TypeScript types
- Verify React version compatibility

**Performance issues**:
- Limit maxNotifications to reasonable number (5-10)
- Use appropriate durations for auto-dismiss
- Monitor for memory leaks with long-running notifications

## Future Enhancements

### Potential Features
- [ ] Sound notifications
- [ ] Persistent notifications (localStorage)
- [ ] Notification history/log
- [ ] Custom themes and styling
- [ ] Notification groups/categories
- [ ] Rate limiting/debouncing
- [ ] Custom animation presets
- [ ] Mobile-optimized layouts
- [ ] Rich content support (HTML, images)
- [ ] Notification scheduling

### Contributing

When adding new notification types or features:
1. Update TypeScript interfaces
2. Add corresponding CSS styles
3. Update this documentation
4. Add tests for new functionality
5. Update demo component examples

---

This notification system provides a solid foundation for user feedback in the Media Library Manager application. The modular design makes it easy to extend and customize for specific needs while maintaining accessibility and performance standards.