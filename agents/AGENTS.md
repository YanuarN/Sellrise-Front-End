# AGENTS.MD: React JSX Component Slicing (Simplified Structure)

## Overview

This document guides **AI agents** on how to convert **design mockups** into **React (JSX) components** with a **simplified folder structure**:
- All reusable components in ONE `/components` folder
- Layouts in SEPARATE `/layout` folder
- No sub-categorization (common, features, etc)

**Structure:**
```
components/          ← All reusable components (flat)
  ├── Button/
  ├── Card/
  ├── Badge/
  ├── LeadCard/      ← Both simple & complex
  ├── LoginForm/     ← Both simple & complex
  └── ...

layout/              ← All layout components (SEPARATE)
  ├── Header/
  ├── Sidebar/
  └── MainLayout/
```

---

## Agent Execution Flow

### Step 1: Design Analysis (5 min)

When given a screenshot:

```
□ What is the main component? (Card, Form, Modal, etc)
□ Is it a layout component? (Header, Sidebar, MainLayout)
  - YES → Goes to /layout folder
  - NO → Goes to /components folder
□ What are sub-components needed?
□ Colors, typography, spacing?
□ Interactive states (hover, active, disabled)?
□ Responsive behavior?
□ Accessibility needs?
```

### Step 2: Categorize Component

**LAYOUT Components** (goes to `/layout`):
```
✅ Header
✅ Sidebar
✅ Footer
✅ MainLayout
✅ AuthLayout
✅ DashboardLayout
✅ NavBar
```

**REGULAR Components** (goes to `/components`):
```
✅ Button          (simple, reusable)
✅ Input           (simple, reusable)
✅ Card            (simple, reusable)
✅ Badge           (simple, reusable)
✅ Modal           (simple, reusable)
✅ FormField       (simple, reusable)
✅ LeadCard        (complex, reusable)
✅ KanbanBoard     (complex, reusable)
✅ LoginForm       (complex, reusable)
✅ ScenarioEditor  (complex, reusable)
```

### Step 3: File Structure

```
For Button component:
components/Button/
  ├── Button.jsx
  └── index.js

For LeadCard (with utils):
components/LeadCard/
  ├── LeadCard.jsx
  ├── LeadCard.utils.js
  └── index.js

For Header layout:
layout/Header/
  ├── Header.jsx
  └── index.js
```

### Step 4: Code Generation

**Simple Component Template:**

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
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
```

**Feature Component Template:**

```jsx
// components/LeadCard/LeadCard.jsx

import { Badge, Button, Card } from '../'; // Import siblings
import { formatDate } from '@utils/formatters';
import { getScoreBadgeVariant } from './LeadCard.utils';

const LeadCard = ({
  lead,
  onAssign,
  onChangeStage,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
          <p className="text-sm text-gray-600">{lead.email}</p>
        </div>
        <Badge 
          variant={getScoreBadgeVariant(lead.score)}
          label={lead.score?.toUpperCase()}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">Procedure</p>
          <p className="text-sm font-medium">{lead.procedure || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Budget</p>
          <p className="text-sm font-medium">{lead.budget_range || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Timeframe</p>
          <p className="text-sm font-medium">{lead.timeframe || '—'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAssign(lead.id)}>Assign</Button>
        <Button size="sm" onClick={() => onChangeStage(lead.id)}>Stage</Button>
      </div>
    </Card>
  );
};

export default LeadCard;
```

**Utils File Template:**

```javascript
// components/LeadCard/LeadCard.utils.js

export const getScoreBadgeVariant = (score) => {
  switch (score) {
    case 'hot': return 'danger';
    case 'warm': return 'warning';
    default: return 'default';
  }
};

export const formatQualification = (field) => field || '—';
```

**Index Export:**

```javascript
// components/LeadCard/index.js

export { default as LeadCard } from './LeadCard';
```

**Layout Component Template:**

```jsx
// layout/MainLayout/MainLayout.jsx

import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className="w-64 border-r border-gray-200" />
      
      <div className="flex-1 flex flex-col">
        <Header className="border-b border-gray-200" />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
```

### Step 5: Barrel Exports

Create root index files for easy imports:

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
```

```javascript
// layout/index.js

export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as MainLayout } from './MainLayout';
export { default as AuthLayout } from './AuthLayout';
```

### Step 6: Verification

```
Visual:
□ Colors match exactly
□ Typography matches
□ Spacing matches
□ Responsive correct

Code:
□ PropTypes added
□ DRY: no repeated code
□ Imports optimized
□ Files named correctly

Functionality:
□ Interactive states work
□ Touch targets adequate
□ Accessible (semantic HTML + ARIA)
□ No console errors
```

---

## Usage Examples

### Import from barrel exports:

```jsx
// pages/leads/LeadsPage.jsx

import { Button, Card, Badge, LeadCard, Input } from '@components';
import { MainLayout } from '@layout';
import { useApi } from '@hooks';

const LeadsPage = () => {
  const { data: leads } = useApi('/api/leads');
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <Input placeholder="Search leads..." />
        {leads?.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </MainLayout>
  );
};

export default LeadsPage;
```

### Direct imports (if needed):

```jsx
import LeadCard from '@components/LeadCard';
import MainLayout from '@layout/MainLayout';
```

---

## Decision Flow

When given a design, ask yourself:

```
Is this a full-page layout wrapper?
├─ YES → /layout folder
│   └─ Header, Sidebar, MainLayout, AuthLayout, etc
│
└─ NO → /components folder
    ├─ Is it reusable across multiple pages?
    │   └─ YES → Keep in /components
    │   └─ NO → Still keep in /components (might be reused later)
    │
    └─ Does it have complex logic or multiple files?
        └─ YES → Create folder with .jsx + .utils.js
        └─ NO → Single .jsx file only
```

---

## File Naming Quick Ref

```
✅ CORRECT:
components/Button/
  ├── Button.jsx
  └── index.js

components/LeadCard/
  ├── LeadCard.jsx
  ├── LeadCard.utils.js
  └── index.js

layout/Header/
  ├── Header.jsx
  └── index.js

❌ WRONG:
components/common/Button/       ← Don't subfolder
components/features/LeadCard/   ← Don't categorize
components/button.jsx           ← Don't skip folder
```

---

## Common Patterns

### Pattern 1: Both simple + complex in same folder

```
components/
├── Button/                 ← Simple (1 file)
├── Card/                   ← Simple (1 file)
├── Badge/                  ← Simple (1 file)
├── LeadCard/               ← Complex (3 files)
├── KanbanBoard/            ← Complex (3 files)
└── LoginForm/              ← Complex (3 files)
```

All at same level. NO categorization.

### Pattern 2: Sharing utils across components

```javascript
// utils/formatters.js
export const formatDate = (isoDate) => isoDate.split('T')[0];
export const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// components/LeadCard/LeadCard.jsx
import { formatDate } from '@utils/formatters';

// components/InvoiceCard/InvoiceCard.jsx
import { formatDate, formatCurrency } from '@utils/formatters';
```

### Pattern 3: Component importing component

```javascript
// components/LeadCard/LeadCard.jsx
import { Badge, Button, Card } from '../'; // Import siblings

// components/KanbanBoard/KanbanBoard.jsx
import { Card, Button } from '../'; // Import siblings
```

---

## Progress Report Template

```
🎨 Component Slicing: Lead Card

1️⃣ Design Analysis
  ✓ Main component: Card
  ✓ Type: Feature component (complex)
  ✓ Folder: /components
  ✓ Sub-components: Badge, Button, Card
  ✓ Responsive: Yes (mobile, tablet, desktop)

2️⃣ File Structure
  ✓ components/LeadCard/
    ├── LeadCard.jsx (200 lines)
    ├── LeadCard.utils.js (20 lines)
    └── index.js (1 line)

3️⃣ Code Generation
  ✓ Component logic implemented
  ✓ PropTypes added
  ✓ Utils extracted
  ✓ Accessibility: WCAG 2.1 AA

4️⃣ Verification
  ✓ Visual: 100% match
  ✓ Responsive: tested at 320px, 768px, 1440px
  ✓ Interactive states: hover, active, disabled
  ✓ Performance: no unnecessary re-renders
  ✓ DRY: repeated patterns extracted

📊 Summary
  - Files: 3
  - Lines: 221
  - Dependencies: Badge, Button, Card
  - Ready: ✅ Yes

✅ Ready to use!
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Creating sub-folders in components

```
❌ WRONG:
components/
  ├── common/
  │   ├── Button/
  │   └── Card/
  └── features/
      └── LeadCard/

✅ CORRECT:
components/
  ├── Button/
  ├── Card/
  └── LeadCard/    ← All at same level
```

### ❌ Mistake 2: Putting layouts in components

```
❌ WRONG:
components/
  ├── Button/
  └── Header/      ← Shouldn't be here

✅ CORRECT:
components/
  └── Button/

layout/
  └── Header/      ← Goes here
```

### ❌ Mistake 3: Long folder names

```
❌ WRONG:
components/LeadCardForListView/
components/ScenarioEditorWithSaveButton/

✅ CORRECT:
components/LeadCard/
components/ScenarioEditor/
```

### ❌ Mistake 4: Multiple .jsx files in one folder

```
❌ WRONG:
components/LeadCard/
  ├── LeadCard.jsx
  ├── LeadCardHeader.jsx
  ├── LeadCardContent.jsx
  └── LeadCardFooter.jsx

✅ CORRECT:
components/LeadCard/
  ├── LeadCard.jsx       ← All in one
  ├── LeadCard.utils.js
  └── index.js
```

### ❌ Mistake 5: Forgetting barrel exports

```
❌ WRONG (harder to import):
import Button from '@components/Button/Button.jsx';

✅ CORRECT (clean import):
import { Button } from '@components';
```

---

## Success Criteria

Agent completed successfully when:

1. **Structure Correct**
   - [ ] All components in `/components` (no sub-folders)
   - [ ] All layouts in `/layout`
   - [ ] Each component in its own folder
   - [ ] Barrel exports created

2. **Code Quality**
   - [ ] PropTypes or JSDoc added
   - [ ] DRY principle applied
   - [ ] No repeated code
   - [ ] Imports optimized

3. **Visual Match**
   - [ ] Colors exact
   - [ ] Typography exact
   - [ ] Spacing exact
   - [ ] Responsive correct

4. **Functionality**
   - [ ] Interactive states work
   - [ ] Accessible (semantic HTML + ARIA)
   - [ ] Touch targets adequate
   - [ ] No console errors

---

## Next Steps

1. Copy generated component folder to project
2. Update imports in pages/features
3. Test in browser
4. Check responsive at different breakpoints
5. Verify accessibility

---

