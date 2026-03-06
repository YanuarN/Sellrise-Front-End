# SKILL: React JSX Frontend Component Slicing (Simplified Folder Structure)

## Overview

This skill enables AI agents to convert **design mockups/screenshots** into **production-ready React (JSX) components** that are:
- ✅ Pixel-perfect identical to design
- ✅ DRY (Don't Repeat Yourself) principle
- ✅ **Simplified folder structure** (all components in one place)
- ✅ Reusable components
- ✅ Proper styling (Tailwind CSS)
- ✅ Clean, readable code
- ✅ Accessible (WCAG baseline)

**Tech Stack:**
- React (JSX)
- JavaScript (no TypeScript)
- Tailwind CSS
- PropTypes (for prop validation, optional)

**Input:** Screenshot/mockup image of UI  
**Output:** Complete React component with all supporting files

---

## Simplified Folder Structure

```
src/
├── components/                          # ALL reusable components (no sub-categorization)
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── index.js
│   ├── Input/
│   │   ├── Input.jsx
│   │   └── index.js
│   ├── Card/
│   │   ├── Card.jsx
│   │   └── index.js
│   ├── Badge/
│   │   ├── Badge.jsx
│   │   └── index.js
│   ├── Modal/
│   │   ├── Modal.jsx
│   │   └── index.js
│   ├── FormField/
│   │   ├── FormField.jsx
│   │   └── index.js
│   ├── LeadCard/
│   │   ├── LeadCard.jsx
│   │   ├── LeadCard.utils.js
│   │   └── index.js
│   ├── KanbanBoard/
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanBoard.utils.js
│   │   └── index.js
│   ├── ChatBubble/
│   │   ├── ChatBubble.jsx
│   │   └── index.js
│   ├── LoginForm/
│   │   ├── LoginForm.jsx
│   │   ├── LoginForm.utils.js
│   │   └── index.js
│   └── ... (all other components)
│
├── layout/                              # Layout wrappers (SEPARATE)
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── index.js
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── index.js
│   ├── MainLayout/
│   │   ├── MainLayout.jsx
│   │   └── index.js
│   └── ... (all layouts)
│
├── hooks/                               # Custom React hooks (shared)
│   ├── useAuth.js
│   ├── useLeads.js
│   ├── useApi.js
│   └── ...
│
├── utils/                               # Utility functions (shared)
│   ├── api.js
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── ...
│
├── styles/                              # Global styles
│   ├── globals.css
│   ├── tailwind.css
│   ├── animations.css
│   └── ...
│
├── pages/                               # Page components
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── index.js
│   ├── dashboard/
│   │   ├── DashboardPage.jsx
│   │   └── index.js
│   ├── leads/
│   │   ├── LeadsPage.jsx
│   │   └── index.js
│   └── ...
│
├── context/                             # React Context (if needed)
│   ├── AuthContext.js
│   ├── ThemeContext.js
│   └── ...
│
├── assets/                              # Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.jsx                              # Main app component
├── main.jsx                             # Entry point (Vite)
└── index.css                            # Global styles
```

---

## Key Differences from Complex Structure

### OLD (Common + Features separation):
```
components/
├── common/
│   ├── Button/
│   ├── Card/
│   └── Badge/
└── features/
    ├── leads/
    │   └── LeadCard/
    └── auth/
        └── LoginForm/
```

### NEW (All in one components folder):
```
components/
├── Button/
├── Card/
├── Badge/
├── LeadCard/           ← Feature component, same level
├── LoginForm/          ← Feature component, same level
└── ChatBubble/
```

### LAYOUT (Separate from components):
```
layout/
├── Header/
├── Sidebar/
└── MainLayout/
```

---

## Component Structure Template

### Standard Component File

```jsx
// components/Button/Button.jsx

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component
 * 
 * A reusable button with multiple variants and sizes.
 * 
 * @example
 * <Button variant="primary" size="lg">Click me</Button>
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium transition-colors duration-200 rounded-lg';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 disabled:opacity-50',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const finalClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled && 'cursor-not-allowed opacity-50',
    loading && 'relative pointer-events-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  
  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="animate-spin">⏳</span>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Button;
```

### Index/Export File

```javascript
// components/Button/index.js

export { default as Button } from './Button';
```

### Feature Component (Example: LeadCard)

```jsx
// components/LeadCard/LeadCard.jsx

import { Badge, Button, Card } from '../'; // Import from components root
import { formatDate } from '@utils/formatters';
import { getScoreBadgeVariant } from './LeadCard.utils';

/**
 * LeadCard Component
 * 
 * Displays a lead with contact info, qualification, and actions.
 */
const LeadCard = ({
  lead,
  onAssign,
  onChangeStage,
  onDelete,
  className = '',
}) => {
  return (
    <Card className={className}>
      {/* Header with score badge */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
          <p className="text-sm text-gray-600">{lead.email}</p>
        </div>
        <Badge 
          variant={getScoreBadgeVariant(lead.score)}
          label={lead.score?.toUpperCase() || 'N/A'}
        />
      </div>

      {/* Qualification info */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">Procedure</p>
          <p className="text-sm font-medium text-gray-900">{lead.procedure || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Budget</p>
          <p className="text-sm font-medium text-gray-900">{lead.budget_range || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Timeframe</p>
          <p className="text-sm font-medium text-gray-900">{lead.timeframe || '—'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onAssign(lead.id)}
        >
          Assign
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onChangeStage(lead.id)}
        >
          Stage
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(lead.id)}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default LeadCard;
```

### Utils File (Companion to Component)

```javascript
// components/LeadCard/LeadCard.utils.js

/**
 * Determine badge color based on lead score
 */
export const getScoreBadgeVariant = (score) => {
  switch (score) {
    case 'hot':
      return 'danger';
    case 'warm':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Format qualification for display
 */
export const formatQualification = (field) => {
  return field || '—';
};
```

### Layout Component (Example: MainLayout)

```jsx
// layout/MainLayout/MainLayout.jsx

import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

/**
 * MainLayout Component
 * 
 * Main layout wrapper with header and sidebar
 */
const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 border-r border-gray-200" />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header className="border-b border-gray-200" />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
```

---

## Barrel Exports (components/index.js)

```javascript
// components/index.js

export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Modal } from './Modal';
export { default as FormField } from './FormField';
export { default as LeadCard } from './LeadCard';
export { default as KanbanBoard } from './KanbanBoard';
export { default as ChatBubble } from './ChatBubble';
export { default as LoginForm } from './LoginForm';
// ... add more as needed
```

**Usage:**
```jsx
// Instead of multiple imports
import Button from '@components/Button';
import Card from '@components/Card';
import LeadCard from '@components/LeadCard';

// Use barrel export
import { Button, Card, LeadCard } from '@components';
```

---

## Layout Barrel Exports (layout/index.js)

```javascript
// layout/index.js

export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as MainLayout } from './MainLayout';
export { default as AuthLayout } from './AuthLayout';
// ... add more layouts
```

**Usage:**
```jsx
import { MainLayout, Header } from '@layout';
```

---

## DRY Principles

### ✅ Extract Common Patterns

**BAD (repeated):**
```jsx
// LeadCard.jsx
<div className="flex items-center gap-2 rounded-lg border border-gray-300 p-4">
  {/* content */}
</div>

// InvoiceCard.jsx
<div className="flex items-center gap-2 rounded-lg border border-gray-300 p-4">
  {/* content */}
</div>
```

**GOOD (extracted):**
```jsx
// components/Card/Card.jsx - reusable
const Card = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 rounded-lg border border-gray-300 p-4 ${className}`}>
    {children}
  </div>
);

// Use everywhere
import { Card } from '@components';

<Card><LeadItem /></Card>
<Card><InvoiceItem /></Card>
```

### ✅ Create Reusable Hooks

**BAD (repeated):**
```jsx
const [leads, setLeads] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  fetch('/api/leads').then(r => r.json()).then(setLeads);
}, []);
```

**GOOD (extracted):**
```jsx
// hooks/useApi.js
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);
  return { data, loading };
};

// Use everywhere
const { data: leads, loading } = useApi('/api/leads');
```

### ✅ Utility Functions

**BAD (repeated):**
```jsx
<span>{lead.created_at.split('T')[0]}</span>
<span>{invoice.date.split('T')[0]}</span>
```

**GOOD (extracted):**
```jsx
// utils/formatters.js
export const formatDate = (isoDate) => isoDate.split('T')[0];

// Use everywhere
<span>{formatDate(lead.created_at)}</span>
```

---

## Styling with Tailwind CSS

### Basic Component

```jsx
// components/Badge/Badge.jsx

const Badge = ({ label, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;
```

### Complex Component

```jsx
// components/Input/Input.jsx

const Input = ({
  type = 'text',
  placeholder = '',
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-lg transition-colors';
  
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-blue-500';
  
  const disabledStyles = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : 'bg-white';

  return (
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
      {...props}
    />
  );
};

export default Input;
```

---

## File Naming Conventions

### Components
```
✅ Button/
   ├── Button.jsx          (PascalCase)
   └── index.js
   
✅ LoginForm/
   ├── LoginForm.jsx
   ├── LoginForm.utils.js
   └── index.js

✅ LeadCard/
   ├── LeadCard.jsx
   ├── LeadCard.utils.js
   └── index.js
```

### Layouts
```
✅ layout/
   ├── Header/
   │  └── Header.jsx
   ├── Sidebar/
   │  └── Sidebar.jsx
   └── MainLayout/
      └── MainLayout.jsx
```

### Utilities
```
✅ utils/
   ├── formatters.js       (camelCase)
   ├── validators.js
   ├── api.js
   └── constants.js
```

---

## PropTypes Best Practices

```jsx
import PropTypes from 'prop-types';

const Component = ({ name, items, isActive, onClick }) => {
  // component code
};

Component.propTypes = {
  name: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })),
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Component.defaultProps = {
  name: '',
  items: [],
  isActive: false,
};

export default Component;
```

---

## Import Examples (Simplified Folder Structure)

```jsx
// pages/leads/LeadsPage.jsx

// Import from components (all in one folder)
import { Button, Card, Badge, LeadCard, Input } from '@components';

// Import from layout
import { MainLayout } from '@layout';

// Import from hooks
import { useApi, useAuth } from '@hooks';

// Import from utils
import { formatDate } from '@utils/formatters';

const LeadsPage = () => {
  const { data: leads } = useApi('/api/leads');
  
  return (
    <MainLayout>
      <div>
        <Input placeholder="Search leads..." />
        <div className="grid gap-4 mt-4">
          {leads?.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default LeadsPage;
```

---

## Accessibility Standards (WCAG 2.1 AA)

### 1. Semantic HTML

```jsx
// ✅ Good
<button onClick={handleClick}>Click me</button>
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" />
</form>

// ❌ Bad
<div onClick={handleClick} role="button">Click me</div>
<div><input /></div>
```

### 2. ARIA Labels

```jsx
// ✅ Good
<button aria-label="Close modal" onClick={close}>×</button>
<input aria-invalid={hasError} aria-describedby="error-msg" />
<span id="error-msg">{errorMessage}</span>

// ❌ Bad
<button onClick={close}>×</button>
<input />
```

---

## Configuration (jsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components": ["src/components/index.js"],
      "@components/*": ["src/components/*"],
      "@layout": ["src/layout/index.js"],
      "@layout/*": ["src/layout/*"],
      "@hooks": ["src/hooks"],
      "@utils": ["src/utils"],
      "@utils/*": ["src/utils/*"],
      "@pages": ["src/pages"],
      "@context": ["src/context"],
      "@assets": ["src/assets"]
    }
  },
  "include": ["src"]
}
```

---

## Component Patterns

### Pattern 1: Simple Presentational

```jsx
// components/Badge/Badge.jsx
const Badge = ({ label, variant = 'default' }) => (
  <span className={`px-2 py-1 rounded text-xs ${variants[variant]}`}>
    {label}
  </span>
);
```

### Pattern 2: Container with Hooks

```jsx
// components/LeadList/LeadList.jsx
import { useApi } from '@hooks';
import { LeadCard, Button } from '@components';

const LeadList = () => {
  const { data: leads, loading } = useApi('/api/leads');
  
  return (
    <div className="grid gap-4">
      {leads?.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
};
```

### Pattern 3: Controlled Form

```jsx
// components/LoginForm/LoginForm.jsx
import { useState } from 'react';
import { Button, Input, FormField } from '@components';

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <Button type="submit">Sign In</Button>
    </form>
  );
};
```

---

## Verification Checklist

- [ ] Matches design pixel-perfectly
- [ ] Colors correct
- [ ] Typography correct
- [ ] Spacing matches
- [ ] Responsive at all breakpoints
- [ ] PropTypes added
- [ ] No repeated code (DRY)
- [ ] Folder structure correct
- [ ] Semantic HTML + ARIA
- [ ] Touch targets adequate (44x44px)
- [ ] No console errors

---

