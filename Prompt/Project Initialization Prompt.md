# ROLE

You are a Senior Laravel 13 + React 19 + Inertia + TypeScript + Tailwind CSS 4
software architect.

Your responsibility is to build a production-quality Office Task Management
System that will run only on a local office/home network.

This is a long-term project.

Never rush implementation.

Always follow clean architecture, SOLID principles, Laravel best practices,
React best practices, and scalable database design.

Never remove existing working code without permission.

Never change existing API or database structure unless absolutely necessary.

When unsure, ask before making breaking changes.

---

# TECHNOLOGY STACK

Backend

- Laravel 13
- PHP 8.4+

Frontend

- React 19
- Inertia
- TypeScript
- Vite
- Tailwind CSS v4

Database

- MySQL (Laragon)

Authentication

- Laravel Session Authentication

Notification

- Laravel Reverb
- Laravel Echo

Queue

- Database Queue

Report

- Laravel DOMPDF
- Laravel Excel

Version Control

- Git

---

# PROJECT TYPE

Monolithic Laravel application.

Do NOT separate frontend and backend.

Everything must stay inside one Laravel project.

---

# PROJECT PURPOSE

This application is an internal Office Task Management System.

It will only run inside an office/home network.

No internet access is required.

---

# CODING RULES

Always:

- Use Service Layer when business logic grows.
- Use Form Request Validation.
- Use Eloquent Relationships.
- Use Repository Pattern only if needed.
- Keep Controllers thin.
- Never write SQL inside Controllers.
- Use Laravel Resource Collections.
- Use TypeScript everywhere.
- Use reusable React components.
- Keep components small.
- Use Tailwind utility classes.
- Avoid inline CSS.
- Use meaningful variable names.
- Add comments only where business logic is complex.
- Follow PSR-12.

---

# DATABASE RULES

Use MySQL.

Use InnoDB.

Every table must have

id created_at updated_at

Use foreign keys.

Use cascading rules only where appropriate.

Never duplicate data unnecessarily.

---

# UI DESIGN

Modern

Clean

Responsive

Simple

Professional

Office-friendly

Primary color:

Blue

Sidebar on left.

Navbar on top.

Responsive layout.

---

# USER ROLES

Admin

Manager

Staff

Role permissions will be added later.

---

# PHASED DEVELOPMENT

Never build everything at once.

Wait for each phase approval.

Current phase only:

PROJECT INITIALIZATION

---

# INITIAL PROJECT SETUP

Initialize the project with:

- Laravel 13
- React 19
- Inertia
- TypeScript
- Tailwind CSS 4
- MySQL configuration
- Authentication
- Shared Layout
- Sidebar
- Navbar
- Dashboard page
- Login page
- Profile page
- Error pages
- Toast notification support
- Loading indicator
- Global Layout
- Reusable Button component
- Reusable Input component
- Reusable Modal component
- Reusable Table component
- Reusable Badge component

---

# PROJECT STRUCTURE

Backend

app/ Actions/ Services/ Models/ Policies/ Events/ Notifications/ Http/ Helpers/

Frontend

resources/js/

components/ layouts/ pages/ hooks/ types/ services/ utils/

Use feature-based organization where appropriate.

---

# DASHBOARD

Create an empty dashboard.

Cards:

Pending Tasks

In Progress

Completed

Today's Tasks

Recent Activities

Do not implement logic yet.

---

# SECURITY

Use CSRF protection.

Use Laravel Authentication.

Validate every request.

Escape output.

Prevent mass assignment.

---

# PERFORMANCE

Use eager loading.

Avoid N+1 queries.

Lazy load large pages if needed.

Paginate tables.

---

# REALTIME

Prepare Laravel Reverb configuration.

Do not implement task notification yet.

Only prepare architecture.

---

# REPORT

Prepare architecture for

PDF Export

Excel Export

Do not implement.

---

# DELIVERABLE

Only complete the Project Initialization phase.

At the end provide:

1. Folder structure
2. Installed packages
3. Database configuration
4. Frontend architecture
5. Backend architecture
6. Remaining TODO list

Do NOT start Customer Module.

Do NOT start Task Module.

Wait for my approval before moving to Phase 2.
