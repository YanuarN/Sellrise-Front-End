# Sellrise Frontend — Copilot Instructions

This document provides domain context, architectural patterns, UI/UX guidelines, and coding conventions for the Sellrise frontend. Use this as the primary reference when building, reviewing, or debugging frontend code.

---

## 1. Project Overview

**Sellrise Frontend** is the admin dashboard and CRM interface for the Sellrise lead qualification platform. It enables:
- **Lead Management**: Kanban pipeline, inbox, lead detail views
- **Bot Configuration**: Scenario/flow builder (future), knowledge base management
- **Analytics Dashboard**: Conversation metrics, conversion funnels
- **Settings & Integrations**: User management, workspace settings, channel connections

**User Roles**:
- **Admin**: Full access (bot builder, KB, settings, users)
- **Agent**: Lead management (view, update, notes)
- **Viewer**: Read-only analytics

---

## 2. Tech Stack

- **Framework**: React 19.2.0 (modern functional components)
- **Build Tool**: Vite 7.3.1 (fast HMR, optimized builds)
- **Routing**: React Router DOM v7.13.1
- **State Management**: Zustand 5.0.11 (installed but not yet implemented)
- **Styling**: Tailwind CSS v4.2.1 with `@tailwindcss/vite` plugin
- **UI Utilities**: 
  - `clsx` (2.1.1) - conditional classNames
  - `tailwind-merge` (3.5.0) - merge/dedupe Tailwind classes
  - `lucide-react` (0.577.0) - icon library
- **CSS Processing**: PostCSS + Autoprefixer
- **Linting**: ESLint 9.39.1 with React hooks plugin

---

## 3. Project Structure

```
src/
├── assets/              # Images, logos (logo.png, Picture1-12.png)
├── components/          # Reusable UI components
│   ├── Badge/          # Status badges (hot/warm/cold, colored variants)
│   ├── BadgeContent/   # Custom SVG icon component
│   ├── Button/         # Primary UI button (variants, sizes)
│   ├── Card/           # Container component (white bg, border, shadow)
│   ├── Input/          # Form input with icon support
│   ├── LeadCard/       # Complex lead display card
│   └── index.js        # Barrel export for components
├── layout/             # Layout components
│   ├── MainLayout/     # Dashboard layout wrapper (sidebar + main)
│   ├── Sidebar/        # Navigation sidebar (collapsible, dark theme)
│   └── index.js        # Barrel export for layouts
├── pages/              # Page-level components
│   ├── LandingPage/    # Marketing landing page (~600 lines)
│   └── LeadManagement/ # CRM Kanban board with filters
├── App.jsx             # Main app component with routing
├── main.jsx            # React entry point
├── index.css           # Global styles + Tailwind imports
└── App.css             # (Legacy Vite boilerplate, not actively used)
```

**Key Conventions**:
- Each component has its own folder: `ComponentName/ComponentName.jsx` + `index.js`
- Barrel exports in `index.js` for clean imports
- PascalCase for component files, camelCase for utilities

---

## 4. Component Development Patterns

### 4.1 Functional Components with Hooks

**Standard Pattern**:
```jsx
import { useState } from 'react';

function MyComponent({ title, onAction, variant = 'default', ...props }) {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };
  
  return (
    <div className="..." {...props}>
      <h2>{title}</h2>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
}

export default MyComponent;
```

**Key Practices**:
- Destructure props with default values
- Use `?. optional chaining for callback props
- Spread remaining props to root element
- Keep components focused (single responsibility)

### 4.2 Button Component Pattern

Reference: [src/components/Button/Button.jsx](src/components/Button/Button.jsx)

```jsx
function Button({ 
  children, 
  variant = 'primary',  // primary | outline | ghost | secondary
  size = 'md',          // sm | md | lg | icon
  className,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Usage**:
```jsx
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Save Changes
</Button>
```

### 4.3 Input Component Pattern

Reference: [src/components/Input/Input.jsx](src/components/Input/Input.jsx)

```jsx
function Input({ icon: Icon, className, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${Icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}
```

**Usage**:
```jsx
import { Search } from 'lucide-react';

<Input 
  icon={Search} 
  placeholder="Search leads..." 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### 4.4 Badge Component Pattern

Reference: [src/components/Badge/Badge.jsx](src/components/Badge/Badge.jsx)

```jsx
function Badge({ children, variant = 'gray', className, ...props }) {
  const variants = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
```

**Usage**:
```jsx
<Badge variant="green">Hot Lead</Badge>
<Badge variant="yellow">Warm</Badge>
<Badge variant="blue">Qualified</Badge>
```

### 4.5 Card Component Pattern

Reference: [src/components/Card/Card.jsx](src/components/Card/Card.jsx)

```jsx
function Card({ children, className, ...props }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## 5. Layout Patterns

### 5.1 MainLayout Structure

Reference: [src/layout/MainLayout/MainLayout.jsx](src/layout/MainLayout/MainLayout.jsx)

```jsx
function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

**Usage**: Wrap all authenticated pages in MainLayout to get sidebar navigation.

### 5.2 Sidebar Navigation

Reference: [src/layout/Sidebar/Sidebar.jsx](src/layout/Sidebar/Sidebar.jsx)

**Design Specs**:
- Dark theme: `#121626` background
- Collapsible with smooth transition
- Active state: blue highlight
- Icons from `lucide-react`

**Menu Items**:
- Analytics
- Chats (Conversations)
- CRM (Lead Management)
- Integrations
- Plans & Billing

---

## 6. Routing Patterns

### 6.1 Current Routes

Reference: [src/App.jsx](src/App.jsx)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout';
import LeadManagement from './pages/LeadManagement/LeadManagement';
import LandingPage from './pages/LandingPage/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authenticated routes */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <LeadManagement />
            </MainLayout>
          }
        />
        <Route
          path="/crm"
          element={
            <MainLayout>
              <LeadManagement />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.2 Adding New Routes

**Pattern**:
1. Create page component in `src/pages/PageName/`
2. Import in `App.jsx`
3. Add route with appropriate layout wrapper

**Example** (protected route):
```jsx
<Route
  path="/analytics"
  element={
    <ProtectedRoute>
      <MainLayout>
        <AnalyticsDashboard />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

**Note**: Authentication wrapper (`ProtectedRoute`) not yet implemented. See Section 11 for implementation guidance.

---

## 7. Styling with Tailwind CSS

### 7.1 Setup

**Import in** [src/index.css](src/index.css):
```css
@import "tailwindcss";
```

**Vite Plugin**: `@tailwindcss/vite` configured in [vite.config.js](vite.config.js)

### 7.2 Styling Best Practices

**Use Utility-First Approach**:
```jsx
// ✅ GOOD - Tailwind utilities
<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">

// ❌ AVOID - Custom CSS classes (unless necessary for complex components)
<div className="custom-card">
```

**Conditional Classes with clsx**:
```jsx
import clsx from 'clsx';

<button
  className={clsx(
    'rounded-lg px-4 py-2 font-medium transition-colors',
    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900',
    isDisabled && 'cursor-not-allowed opacity-50'
  )}
>
```

**Merge Conflicting Classes with tailwind-merge**:
```jsx
import { twMerge } from 'tailwind-merge';

function Button({ className, ...props }) {
  return (
    <button
      className={twMerge(
        'rounded-lg bg-blue-600 px-4 py-2 text-white',
        className  // User can override default classes
      )}
      {...props}
    />
  );
}

// Usage: <Button className="bg-red-600" /> → red wins, not blue
```

### 7.3 Responsive Design

**Mobile-First Approach**:
```jsx
<div className="
  flex flex-col        /* Mobile: Stack vertically */
  md:flex-row          /* Tablet+: Horizontal */
  lg:gap-6             /* Desktop: Larger gap */
">
```

**Breakpoints** (Tailwind default):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 7.4 Dark Mode (Future)

**Preparation**:
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## 8. State Management

### 8.1 Local State (Current)

**Use `useState` for component-level state**:
```jsx
function LeadCard({ lead }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.notes || []);
  
  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {/* ... */}
    </div>
  );
}
```

### 8.2 Zustand (Future Global State)

**Zustand is installed but not yet implemented.** When ready:

**Create Store** (`src/stores/useLeadStore.js`):
```jsx
import { create } from 'zustand';

const useLeadStore = create((set) => ({
  leads: [],
  filters: { stage: null, score: null },
  
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, ...updates } : l)
  })),
  
  setFilters: (filters) => set({ filters }),
}));

export default useLeadStore;
```

**Usage in Components**:
```jsx
import useLeadStore from '../stores/useLeadStore';

function LeadManagement() {
  const { leads, filters, setFilters } = useLeadStore();
  
  return (
    <div>
      {/* Use leads and setFilters */}
    </div>
  );
}
```

**When to use Zustand**:
- User authentication state
- Current workspace context
- Lead/scenario data shared across pages
- UI state (sidebar collapsed, theme, etc.)

---

## 9. Data Fetching & API Integration

### 9.1 Current State

**No API integration yet.** Mock data used in components.

Reference: [src/pages/LeadManagement/LeadManagement.jsx](src/pages/LeadManagement/LeadManagement.jsx#L10-L37)

### 9.2 Future API Service Pattern

**Create API Service** (`src/services/api.js`):
```jsx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1';

// Get auth token from localStorage or Zustand store
const getAuthToken = () => localStorage.getItem('access_token');

async function fetchAPI(endpoint, options = {}) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle token expiration, redirect to login
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Leads
  getLeads: (filters) => fetchAPI(`/leads?${new URLSearchParams(filters)}`),
  getLead: (id) => fetchAPI(`/leads/${id}`),
  updateLead: (id, data) => fetchAPI(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Scenarios
  getScenarios: () => fetchAPI('/scenarios'),
  publishScenario: (id) => fetchAPI(`/scenarios/${id}/publish`, { method: 'POST' }),
};
```

**Usage in Components**:
```jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';

function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await api.getLeads({ stage: 'new' });
        setLeads(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeads();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render leads */}</div>;
}
```

### 9.3 Environment Variables

**Vite Environment Variables** (`.env`):
```
VITE_API_BASE_URL=http://localhost:8000/v1
VITE_WIDGET_URL=http://localhost:8000/widget.js
```

**Access in Code**:
```jsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**Note**: Vite requires `VITE_` prefix for client-side variables.

---

## 10. Icon Usage (lucide-react)

**Import Icons**:
```jsx
import { Search, Filter, X, ChevronDown, Mail, Phone, Calendar } from 'lucide-react';
```

**Usage**:
```jsx
<Search size={18} className="text-gray-400" />
<Mail size={16} strokeWidth={2} />
```

**Common Icons**:
- Navigation: `Menu`, `X`, `ChevronLeft`, `ChevronRight`, `ChevronDown`
- Actions: `Plus`, `Edit`, `Trash2`, `Save`, `Download`
- UI: `Search`, `Filter`, `SortAsc`, `Eye`, `Settings`
- Communication: `Mail`, `Phone`, `MessageSquare`, `Calendar`
- Status: `Check`, `AlertCircle`, `Info`, `XCircle`

**Full Icon Set**: [https://lucide.dev/icons/](https://lucide.dev/icons/)

---

## 11. Authentication & Protected Routes

### 11.1 Auth Context Pattern (To Implement)

**Create Auth Context** (`src/contexts/AuthContext.jsx`):
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token and load user
      api.getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (credentials) => {
    const { access_token, user } = await api.login(credentials);
    localStorage.setItem('access_token', access_token);
    setUser(user);
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Wrap App** ([src/main.jsx](src/main.jsx)):
```jsx
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

### 11.2 Protected Route Component

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or loading spinner component
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

**Usage**:
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

---

## 12. Page Development Guidelines

### 12.1 Page Structure

**Standard Page Template**:
```jsx
function MyPage() {
  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
        <Button variant="primary">Primary Action</Button>
      </div>
      
      {/* Filters/Controls (optional) */}
      <div className="mb-6 flex gap-3">
        <Input icon={Search} placeholder="Search..." />
        <Button variant="outline">Filter</Button>
      </div>
      
      {/* Main Content */}
      <div className="space-y-4">
        {/* Content here */}
      </div>
    </div>
  );
}
```

### 12.2 Complex Page Example: Lead Management

Reference: [src/pages/LeadManagement/LeadManagement.jsx](src/pages/LeadManagement/LeadManagement.jsx)

**Features**:
- Kanban board with draggable columns (future)
- Search and filter controls
- Lead cards with status badges
- Floating help button

**Key Patterns**:
- Group leads by stage/column
- Map over grouped data to render columns
- Use `LeadCard` component for consistency

---

## 13. Screen Map & Navigation (PRD Reference)

### 13.1 Platform Screens (~60 Total)

Defined in: `../docs/list of screens.md`

**Core Sections**:
1. **Authentication** (4 screens): Login, Signup, Password Reset, Email Verification
2. **Onboarding** (10 screens): Welcome, Workspace Setup, First Bot Creation
3. **Dashboard** (4 screens): Main Dashboard, Performance Overview, Activity, Lead Summary
4. **Bots Management** (5 screens): Bots List, Create, Overview, Settings, Deployment
5. **Bot Builder** (6 screens): Workspace, Flow Editor, Stage/Task Config, Testing
6. **Conversations** (5 screens): List, Viewer, Lead Profile, Analytics, Manual Takeover
7. **Leads** (4 screens): List, Profile, Pipeline, CRM Sync
8. **Knowledge Base** (4 screens): Overview, Article Editor, Upload, Search
9. **Analytics** (5 screens): Overview, Metrics, Funnel, Drop-off, Performance Comparison
10. **Integrations** (5 screens): Overview, Messaging, CRM, Calendar, API/Webhooks
11. **Settings** (6 screens): Workspace, Team, Permissions, Billing, API Keys, Notifications
12. **Support/System** (2 screens): Activity Logs, Diagnostics

### 13.2 Implementation Priority

**MVP Phase 1** (Current):
- ✅ Landing Page
- ✅ Lead Management (Kanban)
- 🔄 Dashboard (overview)
- 🔄 Auth (login/signup)

**MVP Phase 2**:
- Bot Builder (scenario editor)
- Knowledge Base CRUD
- Basic Analytics
- Settings (workspace, users)

**Post-MVP**:
- Advanced Bot Builder (visual flow)
- Conversation viewer
- Integrations
- Onboarding wizard

---

## 14. UI/UX Design Principles

Reference: `../docs/ai chatbot ui ux.md`

### 14.1 Design System

**Influenced By**: Intercom, Drift, ManyChat, Ada, HubSpot

**Key Principles**:
- **Clean & Minimal**: Reduce cognitive load
- **Data-Dense**: Show important metrics prominently
- **Action-Oriented**: CTAs clear and accessible
- **Responsive**: Mobile-first approach

### 14.2 Color Palette (Inferred from Components)

**Primary**:
- Blue: `bg-blue-600`, `text-blue-800`, `border-blue-500` (primary actions, active states)

**Status Colors**:
- Green: `bg-green-100 text-green-800` (success, hot leads)
- Yellow: `bg-yellow-100 text-yellow-800` (warning, warm leads)
- Red: `bg-red-100 text-red-800` (error, cold leads)
- Gray: `bg-gray-100 text-gray-800` (neutral)

**UI Grays**:
- Background: `bg-gray-50` (page background)
- Cards: `bg-white`
- Borders: `border-gray-200`, `border-gray-300`
- Text: `text-gray-900` (primary), `text-gray-600` (secondary), `text-gray-400` (tertiary)

**Dark Theme (Sidebar)**:
- Background: `#121626`
- Hover: `bg-gray-700`
- Active: `bg-blue-600 text-white`

### 14.3 Typography

**Headings**:
```jsx
<h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-xl font-semibold text-gray-900">Section Title</h2>
<h3 className="text-lg font-medium text-gray-900">Subsection</h3>
```

**Body Text**:
```jsx
<p className="text-sm text-gray-600">Regular text</p>
<p className="text-xs text-gray-500">Small text</p>
```

**Emphasis**:
```jsx
<span className="font-medium">Important</span>
<span className="font-semibold">More Important</span>
<span className="font-bold">Very Important</span>
```

### 14.4 Spacing System

**Consistent Spacing** (Tailwind scale: 4px base):
- `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)
- `p-2`, `p-4`, `p-6` for padding
- `mb-2`, `mb-4`, `mb-6` for margins

**Container Padding**:
```jsx
<div className="p-6">  {/* Standard card padding */}
<div className="px-4 py-2">  {/* Button padding */}
```

---

## 15. Bot Builder UI Specification

Reference: `../docs/Bot Builder — Pixel-Level UI Layout.md`, `../docs/list of screens.md`

### 15.1 Layout Structure

**Three-Panel Layout**:
```
┌─────────┬──────────────────────┬────────────┐
│ Sidebar │  Canvas / Flow       │ Properties │
│ (Tree)  │  Editor              │ Panel      │
└─────────┴──────────────────────┴────────────┘
```

**Left Sidebar**: Stage/Task tree structure
**Center Canvas**: Visual flow editor (drag-drop, connections)
**Right Panel**: Configuration for selected stage/task

### 15.2 Implementation Approach

**Future Implementation** (React Flow or Custom):
```jsx
import ReactFlow from 'reactflow';

function BotBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <StageTree stages={stages} />
      </div>
      
      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </div>
      
      {/* Properties Panel */}
      <div className="w-80 border-l bg-white">
        <PropertiesPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
}
```

**Note**: Bot Builder is post-MVP. Reference PRD for detailed stage-based architecture when implementing.

---

## 16. Testing Guidelines

### 16.1 Component Testing (Future)

**When Testing Library is Added**:
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('button renders with correct variant', () => {
  render(<Button variant="primary">Click Me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toHaveClass('bg-blue-600');
});

test('button calls onClick handler', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 16.2 Manual Testing Checklist

**For Each Component/Page**:
- [ ] Renders correctly on desktop (1920x1080)
- [ ] Renders correctly on tablet (768px)
- [ ] Renders correctly on mobile (375px)
- [ ] Interactive elements (buttons, inputs) have hover/focus states
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader accessible (semantic HTML, ARIA labels)

---

## 17. Accessibility (a11y) Guidelines

### 17.1 Semantic HTML

**Use Proper Elements**:
```jsx
// ✅ GOOD
<button onClick={handleClick}>Action</button>
<nav><a href="/dashboard">Dashboard</a></nav>
<input type="text" id="search" aria-label="Search leads" />

// ❌ BAD
<div onClick={handleClick}>Action</div>  // Use <button>
<div><span onClick={...}>Link</span></div>  // Use <a>
```

### 17.2 ARIA Labels

**Label Interactive Elements**:
```jsx
<button aria-label="Close modal" onClick={onClose}>
  <X size={16} />
</button>

<input 
  type="search" 
  placeholder="Search..."
  aria-label="Search leads"
/>
```

### 17.3 Keyboard Navigation

**Focus States**:
```jsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Action
</button>
```

**Tab Order**: Ensure logical tab order (sequential, top to bottom, left to right).

---

## 18. Performance Optimization

### 18.1 Code Splitting

**Lazy Load Pages**:
```jsx
import { lazy, Suspense } from 'react';

const LeadManagement = lazy(() => import('./pages/LeadManagement/LeadManagement'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/crm" element={<LeadManagement />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### 18.2 Optimize Re-Renders

**Use React.memo for Expensive Components**:
```jsx
import { memo } from 'react';

const LeadCard = memo(function LeadCard({ lead, onUpdate }) {
  // Component that doesn't need to re-render unless lead or onUpdate changes
  return <div>{/* ... */}</div>;
});
```

**Use useCallback for Event Handlers**:
```jsx
import { useCallback } from 'react';

const handleUpdate = useCallback((id, data) => {
  // Handler won't change unless dependencies change
}, [/* dependencies */]);
```

### 18.3 Image Optimization

**Use Proper Formats**:
- PNG for logos/graphics
- WebP for photos (with PNG fallback)
- SVG for icons (or use lucide-react)

**Responsive Images**:
```jsx
<img 
  src="/images/hero-mobile.png"
  srcSet="/images/hero-mobile.png 768w, /images/hero-desktop.png 1920w"
  sizes="(max-width: 768px) 768px, 1920px"
  alt="Dashboard preview"
/>
```

---

## 19. Development Workflow

### 19.1 Running Development Server

```bash
npm run dev
# Server runs on http://localhost:5173 (Vite default)
```

### 19.2 Building for Production

```bash
npm run build
# Output: dist/ folder
```

### 19.3 Preview Production Build

```bash
npm run preview
# Preview the production build locally
```

### 19.4 Linting

```bash
npm run lint
# Runs ESLint with React rules
```

---

## 20. Common Development Tasks

### 20.1 Adding a New Component

1. Create folder: `src/components/NewComponent/`
2. Create component file: `NewComponent.jsx`
3. Create barrel export: `index.js`
4. Add to components index: `src/components/index.js`

**Example**:
```bash
src/components/
  NewComponent/
    NewComponent.jsx
    index.js
```

**NewComponent.jsx**:
```jsx
function NewComponent({ prop1, prop2, className, ...props }) {
  return (
    <div className={`base-styles ${className}`} {...props}>
      {/* component content */}
    </div>
  );
}

export default NewComponent;
```

**index.js**:
```jsx
export { default } from './NewComponent';
```

### 20.2 Adding a New Page

1. Create folder: `src/pages/NewPage/`
2. Create page component: `NewPage.jsx`
3. Import in `App.jsx`
4. Add route

**NewPage.jsx**:
```jsx
function NewPage() {
  return (
    <div className="h-full bg-gray-50 p-6">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
}

export default NewPage;
```

**App.jsx**:
```jsx
import NewPage from './pages/NewPage/NewPage';

// In Routes:
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <MainLayout>
        <NewPage />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

### 20.3 Adding a Sidebar Menu Item

Edit [src/layout/Sidebar/Sidebar.jsx](src/layout/Sidebar/Sidebar.jsx):

```jsx
import { NewIcon } from 'lucide-react';

const menuItems = [
  // ... existing items
  { icon: NewIcon, label: 'New Section', path: '/new-page' },
];
```

---

## 21. PRD References & Feature Requirements

### 21.1 Reading Project Documentation

When implementing specific features, consult these documents:

**Product Vision & Scope**:
- `../docs/**Product Vision: All-in-One Lead Chat.md` - Business context, goals, user roles
- `../docs/sellrise.ai MVP — User Stories & Acceptance Criteria (Final).md` - Detailed requirements

**UI/UX Specifications**:
- `../docs/ai chatbot ui ux.md` - Complete UI/UX architecture, user flows
- `../docs/list of screens.md` - Full screen map (~60 screens)
- `../docs/Bot Builder — Pixel-Level UI Layout.md` - Bot Builder interface spec

**Technical Specifications**:
- `../docs/AI Conversation Engine – Technical Specification/` - Scenario engine architecture (for Bot Builder implementation)
- Backend Copilot Instructions: `../Sellrise-BackEnd/copilot-instructions.md` - API contracts, data models

### 21.2 Key Feature Areas

**Lead Management (Current MVP)**:
- Kanban pipeline (New → Qualified → Contacted → Booked → Won/Lost)
- Lead cards with score badges (Hot/Warm/Cold)
- Search and filters
- Lead detail view with transcript

**Dashboard (Coming Soon)**:
- KPI cards (conversion rate, lead volume, hot lead count)
- Activity graphs (conversations over time)
- Recent conversations list
- Quick actions

**Bot Builder (Post-MVP)**:
- Visual flow editor (stage-based)
- Stage/task configuration
- Knowledge base integration
- Testing/simulation interface

**Analytics (Post-MVP)**:
- Funnel visualization
- Stage drop-off analysis
- Conversion metrics
- Bot performance comparison

---

## 22. FAQ & Troubleshooting

**Q: Should I use CSS modules or Tailwind?**
A: Tailwind utility-first. Only use custom CSS for very complex components where Tailwind becomes unreadable.

**Q: When should I create a new component vs. inline JSX?**
A: Create a component if:
- Used in multiple places
- Complex logic (>50 lines)
- Reusable pattern (button variants, cards, etc.)

**Q: How do I handle forms?**
A: Use controlled components with `useState`. For complex forms (>5 fields), consider React Hook Form (install when needed).

**Q: How do I optimize bundle size?**
A: Vite automatically code-splits. Use `lazy()` for heavy pages. Avoid importing entire icon libraries (lucide-react supports tree-shaking).

**Q: How do I handle modals/dialogs?**
A: Create a `Modal` component with portal:
```jsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-xl">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}
```

**Q: How do I handle loading states?**
A: Create a `Spinner` or `Loading` component:
```jsx
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  );
}
```

---

## 23. Version History

- **v1.0** (2026-03-08): Initial frontend instructions based on current implementation and PRD requirements

---

**Note**: This is a living document. Update when:
- New patterns emerge
- Tech stack changes (e.g., Zustand implementation, API integration)
- UI/UX requirements evolve
- New components or pages are added

For questions or clarifications, consult the PRD documents in `../docs/` or the backend instructions at `../Sellrise-BackEnd/copilot-instructions.md`.