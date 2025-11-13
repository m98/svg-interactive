# Integration Examples

Examples showing integration with popular React libraries.

## Examples in This Folder

### 1. React Hook Form (`react-hook-form.tsx`)
Integrate with react-hook-form for advanced form management.

**What you'll learn**:
- Syncing with useForm hook
- Form validation
- Form submission
- Reset functionality

### 2. Zustand (`zustand.tsx`)
Global state management with Zustand.

**What you'll learn**:
- Creating a diagram store
- Subscribing to state changes
- Actions and selectors
- Persistent state

### 3. Redux Toolkit (`redux-toolkit.tsx`)
Integration with Redux Toolkit.

**What you'll learn**:
- Creating diagram slices
- Dispatching actions
- Using selectors
- Async computations

### 4. TanStack Query (`tanstack-query.tsx`)
Data fetching and server state.

**What you'll learn**:
- Fetching SVG from API
- Caching diagrams
- Loading states
- Error handling

## Running These Examples

Install required dependencies:

```bash
# React Hook Form
npm install react-hook-form

# Zustand
npm install zustand

# Redux Toolkit
npm install @reduxjs/toolkit react-redux

# TanStack Query
npm install @tanstack/react-query
```

Then import and use:

```tsx
import { ReactHookFormExample } from './react-hook-form';

function App() {
  return <ReactHookFormExample />;
}
```

## Next Steps

- **[05-real-world/](../05-real-world)** - Complete applications
- **[API Reference](../../docs/api.md)** - Full API docs
