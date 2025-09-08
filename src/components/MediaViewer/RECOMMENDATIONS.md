# MediaViewer Component - React & Frontend Recommendations

## Executive Summary

The current MediaViewer component works but has several opportunities for improvement in React best practices, performance, reusability, and user experience. This document provides specific, actionable recommendations with code examples.

## 1. React Best Practices & Hooks Usage

### Current Issues:
- **Memory leaks** in event listeners due to overly broad dependency arrays
- **Too many useState calls** (10+) that should be consolidated
- **Missing cleanup** for media refs and event listeners
- **Stale closure issues** in keyboard event handler

### Recommendations:

#### Use useReducer for Complex State
```tsx
// Instead of 10+ useState calls, use reducers:
const [playerState, playerDispatch] = useReducer(mediaPlayerReducer, initialPlayerState);
const [viewerState, viewerDispatch] = useReducer(imageViewerReducer, initialViewerState);
```

#### Fix Event Listener Memory Leaks
```tsx
// Use refs to avoid stale closures
const handlersRef = useRef(handlers);
useEffect(() => {
  handlersRef.current = handlers;
});

useEffect(() => {
  const handleKeyDown = (e) => handlersRef.current[e.key]?.();
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []); // Empty deps, uses ref
```

#### Proper Cleanup for Media Elements
```tsx
useEffect(() => {
  const media = mediaRef.current;
  if (!media) return;
  
  const handleEnd = () => setIsPlaying(false);
  media.addEventListener('ended', handleEnd);
  
  return () => {
    media.removeEventListener('ended', handleEnd);
    media.pause(); // Cleanup playback
    media.src = ''; // Release resources
  };
}, [mediaId]);
```

## 2. Component Composition & Reusability

### Current Issues:
- Single 700+ line component handling all media types
- Difficult to test individual features
- Poor separation of concerns

### Recommendations:

#### Split Into Focused Components
```
src/components/MediaViewer/
├── index.tsx                 // Main orchestrator
├── components/
│   ├── ImageViewer.tsx      // Image-specific logic
│   ├── VideoPlayer.tsx      // Video playback
│   ├── AudioPlayer.tsx      // Audio playback
│   ├── DocumentViewer.tsx   // Document preview
│   ├── MediaControls.tsx    // Shared controls
│   └── MediaViewerHeader.tsx // Header bar
├── hooks/
│   ├── useMediaKeyboardShortcuts.ts
│   ├── useMediaPlayback.ts
│   └── useImageZoomPan.ts
└── utils/
    ├── mediaHelpers.ts
    └── fullscreenApi.ts
```

#### Create Reusable Custom Hooks
```tsx
// useMediaPlayback.ts
export const useMediaPlayback = (mediaRef: RefObject<HTMLMediaElement>) => {
  const [state, dispatch] = useReducer(playbackReducer, initialState);
  
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    
    const handlers = {
      play: () => dispatch({ type: 'PLAY' }),
      pause: () => dispatch({ type: 'PAUSE' }),
      timeupdate: () => dispatch({ type: 'UPDATE_TIME', payload: media.currentTime }),
      loadedmetadata: () => dispatch({ type: 'SET_DURATION', payload: media.duration })
    };
    
    Object.entries(handlers).forEach(([event, handler]) => 
      media.addEventListener(event, handler)
    );
    
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => 
        media.removeEventListener(event, handler)
      );
    };
  }, []);
  
  return { state, dispatch, controls: createControls(mediaRef, dispatch) };
};
```

## 3. CSS & Styling Approach

### Current Issues:
- Inline styles mixed with Tailwind classes
- Hardcoded values that should be configurable
- No theme consistency

### Recommendations:

#### Use CSS Variables for Theming
```css
/* MediaViewer.module.css */
.viewer {
  --viewer-bg: rgba(0, 0, 0, 0.95);
  --control-bg: rgba(0, 0, 0, 0.6);
  --control-hover: rgba(59, 130, 246, 1);
  --transition-speed: 100ms;
}

.imageTransform {
  transition: transform var(--transition-speed) ease-out;
  will-change: transform;
}
```

#### Tailwind with Custom Components
```tsx
// Use cn() utility for conditional classes
import { cn } from '@/utils/cn';

const imageClasses = cn(
  'relative transition-transform duration-100 ease-out select-none',
  isDragging && 'cursor-grabbing',
  zoom > 1 && !isDragging && 'cursor-grab',
  zoom <= 1 && 'cursor-default'
);
```

## 4. Performance Optimizations

### Critical Improvements:

#### Memoize Expensive Operations
```tsx
const formatTime = useMemo(() => (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}, []);

const zoomPercentage = useMemo(() => 
  Math.round(zoom * 100), [zoom]
);
```

#### Use React.memo for Child Components
```tsx
const MediaControls = React.memo(({ 
  type, 
  onAction 
}: MediaControlsProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.type === nextProps.type;
});
```

#### Debounce Expensive Operations
```tsx
const debouncedPan = useMemo(
  () => debounce((position: Position) => {
    setPosition(position);
  }, 16), // 60fps
  []
);
```

#### Lazy Load Heavy Components
```tsx
const DocumentViewer = lazy(() => 
  import(/* webpackChunkName: "document-viewer" */ './DocumentViewer')
);

// In render:
<Suspense fallback={<MediaSkeleton />}>
  <DocumentViewer {...props} />
</Suspense>
```

## 5. User Experience Improvements

### Enhancements:

#### Add Touch Gesture Support
```tsx
const usePinchZoom = () => {
  const [gesture, setGesture] = useState({ scale: 1, initialDistance: 0 });
  
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = calculateDistance(e.touches[0], e.touches[1]);
      setGesture({ scale: 1, initialDistance: distance });
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = calculateDistance(e.touches[0], e.touches[1]);
      const scale = distance / gesture.initialDistance;
      dispatch({ type: 'SET_ZOOM', payload: zoom * scale });
    }
  };
  
  return { handleTouchStart, handleTouchMove };
};
```

#### Preload Adjacent Media
```tsx
const usePreloadAdjacent = (currentId: MediaId, getAdjacent: Function) => {
  useEffect(() => {
    const preloadQueue = new Set<string>();
    
    ['next', 'prev'].forEach(direction => {
      const id = getAdjacent(direction);
      if (id && !preloadQueue.has(id)) {
        const img = new Image();
        img.src = `/api/media/${id}/thumbnail`;
        preloadQueue.add(id);
      }
    });
    
    return () => preloadQueue.clear();
  }, [currentId]);
};
```

#### Progressive Image Loading
```tsx
const ProgressiveImage: React.FC<{ src: string; thumbnail: string }> = ({ 
  src, 
  thumbnail 
}) => {
  const [currentSrc, setCurrentSrc] = useState(thumbnail);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
  }, [src]);
  
  return (
    <div className="relative">
      <img 
        src={currentSrc} 
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'blur-sm'
        )}
      />
      {isLoading && <LoadingOverlay />}
    </div>
  );
};
```

## 6. Accessibility Improvements

### Recommendations:

```tsx
// Add ARIA labels and roles
<div
  role="dialog"
  aria-label="Media viewer"
  aria-modal="true"
  aria-describedby="media-description"
>
  <div id="media-description" className="sr-only">
    Viewing {item.name}. Use arrow keys to navigate, escape to close.
  </div>
  
  <button
    aria-label={`Zoom in, current zoom ${zoomPercentage}%`}
    onClick={zoomIn}
  >
    <ZoomIn />
  </button>
</div>

// Focus management
useEffect(() => {
  const previousFocus = document.activeElement as HTMLElement;
  containerRef.current?.focus();
  
  return () => {
    previousFocus?.focus();
  };
}, []);

// Keyboard navigation with proper focus trap
const useFocusTrap = (containerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, []);
};
```

## 7. Testing Strategy

### Unit Tests with React Testing Library
```tsx
// MediaViewer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MediaViewer', () => {
  it('handles keyboard shortcuts correctly', async () => {
    const onClose = jest.fn();
    render(<MediaViewer mediaId="123" onClose={onClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  
  it('zooms image on scroll', async () => {
    const { container } = render(<MediaViewer mediaId="123" type="image" />);
    const viewer = container.querySelector('.image-viewer');
    
    fireEvent.wheel(viewer!, { deltaY: -100 });
    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument();
    });
  });
});
```

## 8. Error Handling

### Implement Error Boundaries
```tsx
class MediaViewerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MediaViewer Error:', error, info);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}
```

## Implementation Priority

1. **High Priority** (Performance & UX Critical):
   - Split into smaller components
   - Implement useReducer for state management
   - Fix memory leaks in event listeners
   - Add touch gesture support

2. **Medium Priority** (Quality of Life):
   - Progressive image loading
   - Preload adjacent media
   - Improve keyboard shortcuts
   - Add proper ARIA labels

3. **Low Priority** (Nice to Have):
   - Theme customization
   - Advanced animations
   - Analytics tracking
   - Sharing features

## Migration Path

1. Create new component structure in parallel
2. Implement core functionality with tests
3. Add feature flag to switch between old/new
4. Gradually migrate features
5. Remove old implementation once stable

## Conclusion

These recommendations will significantly improve the MediaViewer component's:
- **Performance**: Reduced re-renders, better memory management
- **Maintainability**: Modular structure, better testing
- **User Experience**: Smoother interactions, better accessibility
- **Developer Experience**: Clearer code organization, reusable hooks

The modular structure provided in `src/components/MediaViewer/` serves as a starting point for implementing these improvements incrementally.