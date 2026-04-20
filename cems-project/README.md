# CEMS - College Event Management System

A role-based college event workflow platform built with React + Vite and Supabase.

It supports full event lifecycle processing from proposal submission to final resource approval/rejection.

## Tech Stack

- Frontend: React 19, React Router
- Backend as a Service: Supabase (Auth + Postgres)
- Validation/Form libs: React Hook Form, Zod
- Build Tooling: Vite
- Linting: ESLint

## Core Workflow (Step-by-Step)

### 1) Club/Event Head creates event proposal

- Page: `/create`
- Initial status: `pending_hod`
- Event is visible in club dashboard timeline as submitted.

### 2) HOD reviews proposal

- Page: `/hod-dashboard`
- Approve -> status becomes `approved_hod`
- Reject -> status becomes `rejected_hod`, stores `hod_comment`

### 3) Principal reviews HOD-approved proposal

- Page: `/principal-dashboard`
- Approve -> status becomes `approved_principal`
- Reject -> status becomes `rejected_principal`, stores `principal_comment`

### 4) Club submits resource request

- Page: `/club-resource-request`
- Available for events with principal approval and pending request state.
- Saves:
	- `requested_hall`
	- `requested_resources`
	- `resource_request_status = submitted`

### 5) Admin verifies submitted request

- Page: `/admin-resource-verification`
- Admin can approve/reject request verification and add comments.

### 6) Admin allocation and final decision

- Page: `/admin`
- Admin selects hall + resource availability and confirms allocation.
- If available:
	- `status = resources_approved`
	- `admin_approved = true`
- If not available:
	- `status = resources_rejected`
	- `admin_approved = false`
	- `admin_comment` saved

### 7) Club dashboard reflects final status and comments

- Page: `/dashboard`
- Club sees status messages and event timeline including:
	- Submitted
	- HOD decision
	- Principal decision
	- Resource decision
- Rejection comments are shown for HOD, Principal, and Admin rejections.

## Role Access Summary

- Club/Event Head:
	- `/dashboard`
	- `/create`
	- `/club-resource-request`
- HOD:
	- `/hod-dashboard`
- Principal:
	- `/principal-dashboard`
- Admin:
	- `/admin`
	- `/admin-resource-verification`

## Project Setup

### Prerequisites

- Node.js 18+ (recommended latest LTS)
- npm 9+
- A Supabase project with required tables/columns and auth enabled

### 1. Clone repository

```bash
git clone <your-repository-url>
cd cems-project/cems-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your local environment file

Create a file named `.env` in the project root (`cems-project/cems-project`) and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can copy from the template file:

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then replace placeholder values with your own Supabase credentials.

### 4. Start development server

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev` -> Start Vite dev server
- `npm run build` -> Build production bundle
- `npm run preview` -> Preview production build locally
- `npm run lint` -> Run ESLint checks

## Environment and Security Notes

- `.env` is intentionally excluded from git.
- Do not commit real Supabase keys.
- Share only `.env.example` with placeholders.

## Suggested Database Fields (Proposal Table)

This app uses fields similar to:

- `id`
- `title`, `description`, `date`, `participants`
- `status`
- `created_by`, `user_id`
- `hod_comment`, `principal_comment`, `admin_comment`
- `hall`, `resource_status`, `admin_approved`
- `requested_hall`, `requested_resources`, `resource_request_status`
- `created_at`

## Current Status Values Used

- `pending_hod`
- `approved_hod`
- `rejected_hod`
- `approved_principal`
- `rejected_principal`
- `resources_approved`
- `resources_rejected`

## Notes for Contributors

- Keep workflow status transitions consistent across all dashboards.
- If new statuses are added, update:
	- timeline mapping
	- dashboard status messages
	- admin allocation/review logic

---

If you are forking this project: clone, set your own `.env`, and run normally. The app is ready for role-based event workflow development.
