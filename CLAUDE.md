# CLAUDE.md

## Project Overview

This is an Enterprise-grade Frontend Application built using:

* React 19+
* TypeScript
* Vite
* React Router
* Axios
* React Hook Form
* Zod Validation
* Material UI (MUI)
* Tailwind CSS (Optional)
* Redux Toolkit

Assume the tech stack is finalized.

Do not spend tokens recommending alternative libraries unless explicitly requested.

Focus on implementing business functionality.

---

# Primary Objective

Always prioritize:

1. Business Logic
2. Feature Development
3. Security
4. Performance
5. Scalability
6. Maintainability

Avoid spending time on:

* Tech stack selection
* Architecture debates
* Library comparisons
* Folder structure discussions

Assume project standards are already approved.

---

# Development Philosophy

Before creating anything:

* Check if reusable code already exists.
* Reuse first.
* Extend second.
* Create new only if necessary.

Avoid duplicate:

* Components
* Hooks
* Services
* Types
* Utilities
* Constants

---

# Folder Structure

```text
src/
│
├── api/
│   ├── axios.ts
│
├── assets/
│
├── components/
│   ├── common/
│   ├── layout/
│
├── hooks/
│
├── pages/
│
├── layouts/
│
├── routes/
│
├── services/
│
├── store/
│
├── types/
│
├── constants/
│
├── validations/
│
├── utils/
│
├── contexts/
│
└── App.tsx
```

Follow this structure unless instructed otherwise.

---

# TypeScript Rules

Always use strict typing.

Never use:

```typescript
any
```

Prefer:

```typescript
interface
type
enum
```

All APIs must have:

```typescript
Request DTO
Response DTO
Model Interface
```

Example:

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
}
```

---

# React Rules

Use only Functional Components.

Example:

```typescript
const Dashboard = () => {
  return <div>Dashboard</div>;
};

export default Dashboard;
```

Do not create Class Components.

---

# Component Responsibilities

Components should contain:

* UI Rendering
* User Interaction

Components should not contain:

* API Calls
* Business Logic
* Complex Transformations

Move logic into:

* Hooks
* Services
* Utilities

---

# Reusable Component Standards

Always check existing components first.

Create reusable components for:

* Button
* Input
* TextField
* Select
* Checkbox
* Radio
* Modal
* Dialog
* Drawer
* Loader
* Spinner
* DataTable
* Pagination
* Search
* File Upload
* Image Upload
* Date Picker
* Empty State
* Error State
* Confirm Dialog

Location:

```text
src/components/common/
```

Never duplicate common UI.

---

# Data Table Standards

Use a reusable table component.

Supported Features:

* Pagination
* Search
* Sort
* Filters
* Loading
* Export
* Actions
* Empty State

Never create multiple table implementations.

---

# Modal Standards

Use reusable modals.

Examples:

* Confirmation Modal
* Delete Modal
* Form Modal
* Information Modal

Avoid page-specific modal implementations.

---

# Custom Hooks

Move reusable logic into hooks.

Examples:

```typescript
useAuth()
usePagination()
useApi()
useDebounce()
usePermission()
useSearch()
useInfiniteScroll()
```

Location:

```text
src/hooks/
```

Avoid duplicate logic across pages.

---

# Service Layer Rules

All API calls must go through services.

Never call axios directly from pages or components.

Example:

```typescript
src/services/user.service.ts
src/services/product.service.ts
src/services/order.service.ts
```

---

# Base Service Pattern

Create a reusable base service.

Example:

```typescript
export abstract class BaseService {
  protected get() {}
  protected post() {}
  protected put() {}
  protected patch() {}
  protected delete() {}
}
```

All services should extend BaseService.

---

# API Standards

Use centralized axios configuration.

File:

```typescript
src/api/axios.ts
```

Responsibilities:

* Base URL
* Request Interceptor
* Response Interceptor
* Error Handling
* Authorization Header

Never duplicate API configurations.

---

# Authentication

Use:

* JWT Access Token
* Refresh Token

Preferred:

* Access Token in Memory
* Refresh Token in Secure HttpOnly Cookie

Avoid storing sensitive tokens in localStorage.

---

# Authorization

Always validate:

* Role
* Permission
* Access Level

Before showing protected actions.

Example:

```typescript
CanCreateProduct
CanEditUser
CanDeleteOrder
CanManageShop
```

---

# Permission Components

Use reusable permission wrappers.

Example:

```typescript
<PermissionGuard permission="PRODUCT_CREATE">
  <CreateButton />
</PermissionGuard>
```

Avoid duplicate permission checks.

---

# Form Standards

Use:

* React Hook Form
* Zod Validation

Example:

```typescript
const form = useForm({
  resolver: zodResolver(schema),
});
```

Avoid manual validations.

---

# Validation Standards

Validate:

* Forms
* Query Parameters
* Route Parameters
* API Payloads

Validation should be centralized.

Location:

```text
src/validations/
```

---

# Security Standards

Security is mandatory.

---

## Input Validation

Validate every user input.

Never trust frontend data.

---

## XSS Protection

Avoid:

```typescript
dangerouslySetInnerHTML
```

Unless explicitly approved.

Sanitize all HTML.

---

## Secret Management

Never expose:

* API Keys
* JWT Secrets
* Database Credentials
* Private URLs

Use environment variables.

---

## Environment Variables

Use:

```env
VITE_API_URL=
VITE_APP_NAME=
VITE_ENV=
```

Never hardcode secrets.

---

## Local Storage Rules

Allowed:

* Theme
* Language
* Non-sensitive Preferences

Not Allowed:

* Passwords
* Secrets
* Refresh Tokens

---

# State Management

Redux Toolkit should be used for:

* Authentication
* User Profile
* Permissions
* Global Settings

Local Component State should be used for:

* Modal Visibility
* Filters
* Temporary UI State

Avoid unnecessary global state.

---

# Constants Management

Store constants centrally.

Location:

```text
src/constants/
```

Examples:

```typescript
ROLES
PERMISSIONS
API_ENDPOINTS
ROUTES
REGEX
ERROR_MESSAGES
SUCCESS_MESSAGES
```

Avoid magic strings.

---

# Utility Functions

Reusable helpers belong in:

```text
src/utils/
```

Examples:

```typescript
date.util.ts
currency.util.ts
string.util.ts
storage.util.ts
validation.util.ts
```

Never duplicate helper functions.

---

# DTO Standards

Separate requests and responses.

Example:

```typescript
CreateUserRequest
UpdateUserRequest

UserResponse
UserListResponse
```

Location:

```text
src/types/
```

Never use raw API responses directly.

---

# Performance Rules

Always optimize for scalability.

Use:

```typescript
React.lazy()
Suspense
useMemo()
useCallback()
memo()
```

Implement:

* Pagination
* Lazy Loading
* Code Splitting
* Virtualization for large lists

Avoid unnecessary re-renders.

---

# Error Handling

Every API operation must handle:

* Loading
* Success
* Failure

Provide user-friendly messages.

Never expose raw backend errors.

Bad:

```typescript
Internal Server Error
```

Good:

```typescript
Unable to process request.
Please try again later.
```

---

# Accessibility

Ensure:

* Keyboard Navigation
* Proper Labels
* ARIA Attributes
* Focus Management
* Screen Reader Support

Accessibility is required.

---

# Logging

Remove before production:

```typescript
console.log()
console.warn()
console.error()
```

Use centralized logging service if required.

---

# Code Quality

Follow:

* ESLint
* Prettier
* Strict TypeScript

Remove:

* Dead Code
* Unused Imports
* Commented Legacy Code

---

# Testing Standards

Prioritize tests for:

* Business Logic
* Authentication
* Permissions
* API Integrations
* Critical User Flows

Focus on functionality rather than visual testing.

---

# Naming Conventions

Files:

```text
user.service.ts
auth.service.ts
product.service.ts
```

Hooks:

```text
useAuth.ts
usePagination.ts
```

Components:

```text
UserTable.tsx
ProductForm.tsx
OrderModal.tsx
```

Types:

```text
user.types.ts
order.types.ts
```

---

# Enterprise Rules

Before generating code:

1. Search existing implementation.
2. Reuse existing code.
3. Extend existing code.
4. Create new implementation only if necessary.

Always prefer consistency over creativity.

---

# Claude Response Instructions

When generating code:

* Do not explain React basics.
* Do not explain TypeScript basics.
* Do not suggest alternative stacks.
* Do not redesign architecture.
* Do not regenerate unchanged files.

Return:

* Only necessary files.
* Production-ready code.
* Secure implementation.
* Strong typing.
* Enterprise standards.

Assume the developer is experienced.

Focus on delivering the requested functionality as efficiently as possible.
