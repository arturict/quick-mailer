# Design System Components

This document provides documentation for the modern design system components added to Quick Mailer.

## Table of Contents

- [Toast Notifications](#toast-notifications)
- [Empty States](#empty-states)
- [Loading Skeletons](#loading-skeletons)
- [Error Boundary](#error-boundary)
- [Offline Indicator](#offline-indicator)
- [Keyboard Shortcuts](#keyboard-shortcuts)

## Toast Notifications

Toast notifications provide non-intrusive feedback to users about the success or failure of their actions.

### Features

- 4 variants: success, error, info, warning
- Automatic dismissal with configurable duration
- Manual dismiss button
- Accessibility support with ARIA live regions
- Smooth slide-down animation

### Usage

```tsx
import { showToast } from './components/ui/Toast';

// Success notification (3s duration)
showToast.success('Email sent successfully!');

// Error notification (4s duration, assertive ARIA)
showToast.error('Failed to send email');

// Info notification (3s duration)
showToast.info('Loading templates...');

// Warning notification (3s duration)
showToast.warning('Check your email format');
```

### Accessibility

- Success, info, and warning use `aria-live="polite"`
- Errors use `aria-live="assertive"` for immediate announcement
- Icons have `aria-hidden="true"` to prevent redundant screen reader output
- Dismiss buttons have proper `aria-label`

## Empty States

Empty states provide guidance when there's no content to display.

### Features

- Multiple icon variants (mail, inbox, template, sparkles)
- Animated entrance with spring physics
- Optional call-to-action button
- Responsive text layout

### Usage

```tsx
import { EmptyState } from './components/ui/EmptyState';

<EmptyState
  icon="inbox"
  title="No emails yet"
  description="Your email history will appear here once you send your first email."
  action={{
    label: "Compose Email",
    onClick: () => navigate('/compose')
  }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `'mail' \| 'inbox' \| 'template' \| 'sparkles'` | `'inbox'` | Icon to display |
| `title` | `string` | Required | Main heading text |
| `description` | `string` | Required | Descriptive text |
| `action` | `{ label: string, onClick: () => void }` | Optional | Action button config |

## Loading Skeletons

Loading skeletons improve perceived performance by showing placeholder content.

### Variants

#### LoadingSkeleton

Basic skeleton for text content.

```tsx
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';

<LoadingSkeleton />
```

#### TableSkeleton

Skeleton for table rows.

```tsx
import { TableSkeleton } from './components/ui/LoadingSkeleton';

<TableSkeleton rows={5} />
```

#### CardSkeleton

Skeleton for card-based content.

```tsx
import { CardSkeleton } from './components/ui/LoadingSkeleton';

<CardSkeleton />
```

#### ShimmerSkeleton

Skeleton with animated shimmer effect.

```tsx
import { ShimmerSkeleton } from './components/ui/LoadingSkeleton';

<ShimmerSkeleton />
```

## Error Boundary

Error Boundary catches React errors and displays a fallback UI instead of crashing.

### Features

- Catches all React rendering errors
- Shows user-friendly error message
- "Try Again" and "Reload Page" actions
- Development mode shows error details
- Production mode hides technical details

### Usage

```tsx
import { ErrorBoundary } from './components/ui/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Custom Fallback

```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

## Offline Indicator

Displays a banner when the user goes offline or comes back online.

### Features

- Automatic detection of online/offline status
- Persistent banner when offline
- Brief confirmation when coming back online
- Accessibility support with ARIA live regions

### Usage

```tsx
import { OfflineIndicator } from './components/ui/OfflineIndicator';

function App() {
  return (
    <div>
      <OfflineIndicator />
      {/* Your app content */}
    </div>
  );
}
```

### Hook Usage

```tsx
import { useOnlineStatus } from './components/ui/OfflineIndicator';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? 'Connected' : 'Offline'}
    </div>
  );
}
```

## Keyboard Shortcuts

Provides a hook-based system for registering keyboard shortcuts.

### Built-in Shortcuts

- `Ctrl+C` - Go to Compose
- `Ctrl+T` - Go to Templates
- `Ctrl+H` - Go to History
- `Ctrl+Enter` - Send Email (in compose view)
- `Shift+?` - Show/Hide Shortcuts Modal

### Usage

```tsx
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      callback: () => handleSave(),
      description: 'Save document'
    },
    {
      key: 'Escape',
      callback: () => handleClose(),
      description: 'Close dialog'
    }
  ]);
  
  return <div>...</div>;
}
```

### Shortcut Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | Required | Key to press |
| `ctrl` | `boolean` | `false` | Require Ctrl/Cmd key |
| `shift` | `boolean` | `false` | Require Shift key |
| `alt` | `boolean` | `false` | Require Alt key |
| `callback` | `() => void` | Required | Function to execute |
| `description` | `string` | Required | Human-readable description |

## API Error Handling

Enhanced error handling with retry logic for API calls.

### Features

- Automatic retry with exponential backoff
- Configurable retry attempts
- Better error messages
- Network error detection

### Usage

```tsx
import { fetchWithRetry, parseErrorResponse } from './utils/apiHelpers';

// Basic usage with default retry config (3 retries)
const response = await fetchWithRetry('/api/endpoint');

// Custom retry configuration
const response = await fetchWithRetry(
  '/api/endpoint',
  { method: 'POST', body: JSON.stringify(data) },
  { maxRetries: 2, retryDelay: 1000, backoffMultiplier: 2 }
);

// Parse error response
if (!response.ok) {
  const errorMessage = await parseErrorResponse(response);
  showToast.error(errorMessage);
}
```

### Utility Functions

#### fetchWithRetry

```tsx
fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: {
    maxRetries?: number;        // Default: 3
    retryDelay?: number;         // Default: 1000ms
    backoffMultiplier?: number;  // Default: 2
  }
): Promise<Response>
```

#### parseErrorResponse

```tsx
parseErrorResponse(response: Response): Promise<string>
```

#### getErrorMessage

```tsx
getErrorMessage(error: unknown): string
```

#### isNetworkError

```tsx
isNetworkError(error: unknown): boolean
```

## Performance Best Practices

### Debouncing

Use the `useDebounce` hook for search inputs:

```tsx
import { useDebounce } from './hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // API call with debouncedSearch
}, [debouncedSearch]);
```

### Memoization

Components are memoized where appropriate:

- `EmailRow` component in EmailHistory uses `React.memo()`
- Heavy computations use `useMemo()`
- Callbacks use `useCallback()`

### Code Splitting

Components are lazy-loaded:

```tsx
const EmailComposer = lazy(() => import('./components/EmailComposer'));
```

## Accessibility Guidelines

### ARIA Attributes

- Use `aria-label` for icon-only buttons
- Use `aria-live` for dynamic content updates
- Use `aria-atomic` for complete message announcements
- Use `aria-hidden` for decorative icons

### Focus Management

- All interactive elements have visible focus states
- Focus rings use `focus:ring-2 focus:ring-primary`
- Modal dialogs trap focus appropriately

### Keyboard Navigation

- All functionality is keyboard accessible
- Tab order is logical
- Shortcuts don't conflict with browser defaults

### Color Contrast

- All text meets WCAG 2.1 AA standards
- Status badges use semantic colors from DaisyUI
- Error states use high-contrast error color

## Animation Performance

### Framer Motion Best Practices

- Use `layoutId` for smooth transitions between states
- Prefer `transform` and `opacity` for animations
- Use `AnimatePresence` for exit animations
- Stagger child animations with `transition.delay`

### Reducing Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox
- Tailwind CSS 3.x

## Contributing

When adding new components:

1. Add JSDoc comments
2. Include usage examples
3. Add accessibility features
4. Document in this README
5. Add TypeScript types
6. Test keyboard navigation
7. Test with screen readers
