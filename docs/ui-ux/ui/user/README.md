# User Wireframe Specification (SVG Format)

This directory contains the user-role specific user interface wireframes for the AI Training Management Platform, rendered as visual SVGs. These wireframes are tailored for the standard user roles (**AI Engineer / Data Scientist** and **Project Owner**) and intentionally omit any administrative features or the global "Admin Console" menu link from the App Shell navigation menu.

## 1. Directory Index & Visual Wireframe Links

* **01. Login Page** (`/login`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/01-login.svg)
  - Features a centered credentials entry card, company SSO button, email/password field states, and submit indicators.
* **02. Project Dashboard** (`/projects`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/02-project-dashboard.svg)
  - Displays all authorized projects, search debouncers, status filter tabs, sorting keys, and latest job run badges.
* **03. Project Registration** (`/projects/register`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/03-project-registration.svg)
  - Layout for project registration via Git repository URL clone parameters or drag-and-drop ZIP uploads.
* **04. Project Detail** (`/projects/:projectId`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/04-project-detail.svg)
  - Shows left-hand repository metadata (branch, dataset version dropdown selectors) and right-hand tabs previewing configurations, baseline parameters, and the "Start Training Job" confirm triggers.
* **05. Configuration Editor** (`/projects/:projectId/configuration`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/05-configuration-editor.svg)
  - Combines a left-side monospace YAML baseline code editor (with line numbers) and a right-side hyperparameter forms card with validation alerts.
* **06. Training History** (`/projects/:projectId/history`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/06-training-history.svg)
  - Displays search and date filter toolbars above a dense grid of historical job IDs, owners, git references, status badges, and durations.
* **07. Job Detail & Monitoring** (`/projects/:projectId/jobs/:jobId`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/07-job-detail.svg)
  - Real-time monitor workspace. Displays status control cards, duration counts, and generated artifacts on the left, alongside the live console logs streaming terminal window on the right.
* **08. Notifications** (`/notifications`):
  - [SVG Layout Viewport](file:///Users/phuchoang/Local_Document/training-model-tool/docs/ui-ux/ui/wireframe/user/08-notifications.svg)
  - Alert inbox showing unread badge indicators, collapsible details, and deep-link details routes.

---

## 2. Wireframe Design System Rules

These wireframe SVGs are rendered on a standard grid matching the design system instructions:
- **Aspect Viewport Size**: `1280px x 800px` (standard desktop proportions).
- **App Shell Structure**: Uses the left sidebar (`240px`) and topbar (`60px`).
- **Sidebar Boundaries**:
  - The "Admin Console" link has been removed, restricting access strictly to user-level screens: `Projects` and `Notifications`.
  - The bottom section displays profile metadata for a standard "AI Engineer" role (`engineer@co.com`).
- **Header Boundaries**: Includes breadcrumbs, active notifications indicator, user menu avatar, and the WebSocket state badge (`CONNECTED`).
- **Color tokens**: Slate-900 canvas backgrounds (`#030712`), deep card frames (`#0b0f19`), cobalt blue highlights (`#3b82f6`), and standard status-specific colors (emerald green, amber orange, crimson red, and sky blue).
