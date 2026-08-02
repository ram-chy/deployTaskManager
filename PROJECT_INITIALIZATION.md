# Flexmania — Project Initialization Report

Phases: **PROJECT INITIALIZATION** (completed) &middot; **PHASE 2 — USER ROLES &amp; PERMISSIONS** (completed) &middot; **PHASE 3 — CUSTOMER MODULE** (completed) &middot; **PHASE 4 — TASK MODULE** (completed) &middot; **PHASE 5 — DASHBOARD STATS &amp; ACTIVITY** (completed) &middot; **PHASE 6 — REALTIME TASK NOTIFICATIONS** (completed) &middot; **PHASE 7 — PDF &amp; EXCEL REPORT EXPORTS** (completed) &middot; **PHASE 8 — PRODUCTION HARDENING** (completed)

Stack: Laravel 13 / PHP 8.4 / React 19 / Inertia / TypeScript / Vite 8 / Tailwind CSS 4 / MySQL / Laravel Session Auth

---

## 1. Folder Structure

### Backend (`app/`)
```
app/
├── Actions/                  # Single-responsibility action classes (Phase 2+)
├── Events/                   # Domain events (Phase 2+)
├── Http/
│   ├── Controllers/          # Thin controllers (Auth + Profile from Breeze)
│   ├── Helpers/helpers.php   # Global helpers (format_date, format_datetime, time_ago)
│   ├── Middleware/HandleInertiaRequests.php   # Shared Inertia props (auth, flash)
│   └── Requests/             # Form Request validation (Auth + Profile)
├── Models/                   # Eloquent models (User)
├── Notifications/            # Notifications (Phase 2+)
├── Policies/                 # Authorization policies (Phase 2+)
├── Providers/
└── Services/AbstractService.php   # Base class for the service layer
```

### Frontend (`resources/js/`)
```
resources/js/
├── app.tsx                   # Inertia app bootstrap (title, progress bar)
├── bootstrap.ts              # Axios + Laravel Echo/Reverb (prepared, guarded)
├── css/app.css               # Tailwind v4 @theme (primary blue palette)
├── components/
│   ├── Brand.tsx
│   ├── loading/PageLoader.tsx      # Global navigation loading overlay
│   ├── toast/ToastProvider.tsx     # Toast context + flash renderer
│   └── ui/
│       ├── Button.tsx              # variants: primary/secondary/danger/outline/ghost
│       ├── Input.tsx               # label/error/hint/leadingIcon, forwardRef
│       ├── Checkbox.tsx
│       ├── Modal.tsx               # Headless UI dialog + transitions
│       ├── Table.tsx               # generic typed <Table<T>>
│       └── Badge.tsx               # neutral/success/warning/danger/info/primary
├── layouts/
│   ├── AppLayout.tsx               # Global layout: Sidebar + Navbar + footer + providers
│   ├── GuestLayout.tsx             # Centered auth card layout
│   └── partials/
│       ├── Sidebar.tsx             # Left sidebar (responsive, off-canvas on mobile)
│       └── Navbar.tsx              # Top navbar + user dropdown menu
├── pages/
│   ├── Welcome.tsx                 # Public landing page
│   ├── Dashboard.tsx               # Empty dashboard cards (no logic)
│   ├── Auth/                       # Login, Register, Forgot/Reset Password, Confirm, Verify
│   ├── Profile/                    # Edit + Partials (info, password, delete)
│   └── errors/error.tsx            # Inertia error pages (403/404/419/500/503)
├── hooks/useToast.ts
├── services/api.ts                 # Axios wrapper
├── types/                          # User, Flash, PageProps + global (route, window) types
└── utils/cn.ts
```

### Other
```
bootstrap/app.php   # Middleware group + Inertia error-page rendering
config/             # dompdf.php, excel.php, reverb.php published + defaults
routes/web.php      # Dashboard + Profile routes
database/seeders/   # Demo admin user
```

---

## 2. Installed Packages

### Composer (production)
- `laravel/framework` ^13.8
- `laravel/breeze` ^2.4 (auth scaffolding — customized)
- `inertiajs/inertia-laravel` ^2.0
- `laravel/reverb` ^1.11 (architecture prepared, not yet active)
- `laravel/sanctum` ^4.0
- `maatwebsite/excel` ^3.1 (report architecture, not implemented)
- `barryvdh/laravel-dompdf` ^3.1 (report architecture, not implemented)
- `tightenco/ziggy` ^2.0
- `laravel/tinker` ^3.0

### Composer (dev)
- `laravel/pint`, `laravel/pail`, `laravel/pao`, `phpunit/phpunit`, `mockery`, `fakerphp/faker`, `nunomaduro/collision`

### npm (dependencies)
- `react` / `react-dom` ^19.2.8
- `@inertiajs/react` ^2.3.27
- `axios` ^1.19.0
- `laravel-echo` ^2.4.0 + `pusher-js` ^8.6.0 (for Reverb)

### npm (devDependencies)
- `@vitejs/plugin-react` ^6.0.5
- `vite` ^8.2.0
- `laravel-vite-plugin` ^3.1.3
- `tailwindcss` ^4.3.3 + `@tailwindcss/vite` ^4.3.3 + `@tailwindcss/forms` ^0.5.11
- `typescript` ^5.9.3, `@types/react` ^19.2.18, `@types/react-dom` ^19.2.4
- `@headlessui/react` ^2.2.10
- `concurrently` ^10.0.4

---

## 3. Database Configuration

- **Engine:** MySQL 8.4.3 via Laragon (InnoDB, foreign keys)
- **Host/Port:** `127.0.0.1:3307` (Laragon local setup — NOT the default 3306)
- **Database:** `flexmania` — charset `utf8mb4`, collation `utf8mb4_unicode_ci`
- **User:** `root` (no password, local dev)
- Session: `database` · Queue: `database` · Cache: `database`
- Migrations applied: users, cache, jobs (+ related framework tables)
- Seeded: demo admin — `admin@flexmania.local` / `password`

---

## 4. Frontend Architecture

- **Inertia v2 + React 19 + TypeScript (strict)** resolved via `@/*` alias to `resources/js/*`.
- **Global Layout** (`AppLayout`): fixed left `Sidebar` (off-canvas on mobile), sticky top `Navbar` with user dropdown, content area, footer. Provides `ToastProvider` + `PageLoader` once.
- **Design system:** Tailwind v4 `@theme` with blue `primary-*` palette; reusable UI kit — `Button`, `Input`, `Checkbox`, `Modal`, `Table`, `Badge`.
- **Toasts:** `ToastProvider` renders Inertia `flash` (success/error/info) automatically; `useToast()` hook for imperative use.
- **Loading:** Inertia navigation events drive a global overlay + blue progress bar.
- **Error pages:** `pages/errors/error.tsx` rendered for 403/404/419/500/503 via `bootstrap/app.php` (Inertia-aware).
- **Reverb/Echo:** `bootstrap.ts` configures Echo only when `VITE_REVERB_APP_KEY` is set (off by default — prepared, not wired).

---

## 5. Backend Architecture

- **Auth:** Laravel session auth via Breeze (login, register, password reset, email verification, profile). CSRF + form validation + mass-assignment protection in place.
- **Inertia middleware** shares `auth.user` and `flash` (success/error/info) to all pages.
- **Service layer:** `app/Services/AbstractService` base class; services to be added per feature.
- **Directory readiness:** `Actions/`, `Events/`, `Notifications/`, `Policies/` created for Phase 2+.
- **Helpers:** `app/Http/Helpers/helpers.php` autoloaded via Composer.
- **Queue:** database driver (jobs table migrated) — ready for notifications/reports.
- **Reports:** DOMPDF + Excel installed, configs published, no implementation.
- **Realtime:** Reverb installed + configured (`REVERB_*` env, `BROADCAST_CONNECTION=reverb`), Echo client prepared; no channels/notifications yet.

---

## 6. Phase 2 — User Roles &amp; Permissions (completed)

### Roles
- **Admin** (`admin`) — full access; can manage users and their roles.
- **Manager** (`manager`) — management placeholder role (no module yet).
- **Staff** (`staff`) — regular team member.

### Schema (migrations)
- `roles` — `id`, `name`, `slug` (unique), `description`, timestamps.
- `role_user` — pivot (`role_id` FK, `user_id` FK, `created_at`/`updated_at`, unique `role_id`+`user_id`).

### Backend
- `app/Models/Role.php` — `users()` belongsToMany.
- `app/Models/User.php` — `roles()` relation plus helpers: `hasRole(string|array)`, `assignRole()`, `syncRoles()`, `removeRole()`, `isAdmin()`, `isManager()`, `isStaff()`.
- `app/Http/Middleware/EnsureUserHasRole.php` — abort 403 unless user has any of the given role slugs; registered as the `role:` middleware alias in `bootstrap/app.php`.
- `app/Providers/AppServiceProvider.php` — `Gate::define('manage-users', fn ($user) => $user->isAdmin())`.
- `app/Services/UserService.php` — `listUsers()` (paginated, eager-loaded roles) + `syncRoles()`.
- `app/Http/Requests/UpdateUserRoleRequest.php` — validates `role_id` exists.
- `app/Http/Resources/RoleResource.php` + `UserResource.php`.
- `app/Http/Controllers/UserController.php` — `index`, `updateRole` (thin, delegates to service).
- Routes (`routes/web.php`), group `['auth', 'role:admin']`: `GET /users` (`users.index`), `PATCH /users/{user}/role` (`users.role.update`).
- `HandleInertiaRequests` now shares `auth.user` with `roles` eager-loaded.

### Seeder
- `RoleSeeder` — upserts the three roles by slug. `DatabaseSeeder` creates demo users:
  - `admin@flexmania.local` / `password` (Admin)
  - `manager@flexmania.local` / `password` (Manager)
  - `staff@flexmania.local` / `password` (Staff)

### Frontend
- `layouts/partials/Sidebar.tsx` — role-aware nav; **Users** item only when `user.roles` includes `admin`.
- `layouts/partials/Navbar.tsx` — shows current role badge next to the user name.
- `pages/Users/Index.tsx` — admin-only user list: name, email, current role badges, per-row role `<select>` (PATCH via `router.patch`), created date, pagination controls.
- `types/index.d.ts` — added `Role` interface; `User` now includes `roles: Role[]`.

### Tests (`tests/Feature/UserRoleTest.php`)
Admin sees `/users` (200) &middot; non-admin 403 &middot; anonymous redirect &middot; admin can update a user's role &middot; invalid `role_id` rejected &middot; model role helpers (assign/check/remove, multi-slug `hasRole`).

---

## 7. Phase 3 — Customer Module (completed)

Scope per user decision: **minimal fields** (name, email, phone, notes); **Admin manages** (create/update/delete), **all authenticated roles view**.

### Schema
- `customers` — `id`, `name`, `email` (nullable, unique), `phone` (nullable), `notes` (nullable text), timestamps.

### Backend
- `app/Models/Customer.php` — fillable attribute model.
- `database/factories/CustomerFactory.php` — realistic demo data.
- `app/Http/Requests/StoreCustomerRequest.php` + `UpdateCustomerRequest.php` — validation (email unique, ignoring self on update).
- `app/Services/CustomerService.php` — `listCustomers(?search)` (search across name/email/phone, paginated), `createCustomer`, `updateCustomer`, `deleteCustomer`.
- `app/Policies/CustomerPolicy.php` — `viewAny`/`view` allowed for all authenticated users; `create`/`update`/`delete` admin-only.
- `app/Http/Controllers/CustomerController.php` — thin; `$this->authorize(...)` + service delegation. Base `Controller` now uses the `AuthorizesRequests` trait.
- `app/Http/Resources/CustomerResource.php`.
- Routes: `GET /customers` (`customers.index`, auth) &middot; `POST /customers` (`customers.store`), `PATCH /customers/{customer}` (`customers.update`), `DELETE /customers/{customer}` (`customers.destroy`) — all admin-only.
- `app/Http/Middleware/HandleInertiaRequests.php` unchanged; `can.manage` computed per request and passed to the page.

### Seeder
- `CustomerSeeder` — 8 demo customers (companies), hooked into `DatabaseSeeder`.

### Frontend
- `pages/Customers/Index.tsx` — debounced server-side search, `Table` (name/email/phone/notes/added + admin Actions), create/edit `Modal` form (`useForm`), delete confirmation `Modal`, pagination controls.
- `layouts/partials/Sidebar.tsx` — **Customers** nav item visible to all authenticated users.
- `types/index.d.ts` — added `Customer` interface.

### Tests (`tests/Feature/CustomerTest.php`)
Anonymous redirect &middot; any role can view &middot; non-admin create/update/delete → 403 &middot; admin CRUD happy paths &middot; validation (name required, invalid email, duplicate email) &middot; search.

---

## 8. Phase 4 — Task Module (completed)

Scope per user decision: fields **title, description, status, priority, due_date** (optional), **assignee_id** (optional), **customer_id** (optional), **created_by**; **Admin + Manager create/edit**; **everyone views all tasks**; **status transitions by assignee OR Admin/Manager** (forward-only); **delete admin-only**.

### Schema
- `tasks` — `id`, `title`, `description` (nullable text), `status` (enum), `priority` (enum), `due_date` (nullable date), `created_by` (FK users), `assignee_id` (nullable FK users), `customer_id` (nullable FK customers), timestamps.
- `app/Enums/TaskStatus.php` — `pending` / `in_progress` / `completed`. `app/Enums/TaskPriority.php` — `low` / `medium` / `high` / `urgent`.

### Backend
- `app/Models/Task.php` — fillable + relations (`assignee`, `creator`, `customer`) + `isOverdue()` + `canBeTransitionedTo()` (forward-only check).
- `database/factories/TaskFactory.php` — realistic demo data + `pending`/`inProgress`/`completed`/`assignedTo`/`forCustomer` states.
- `app/Http/Requests/StoreTaskRequest.php` + `UpdateTaskRequest.php` — validation (title required, enum status/priority, assignee/customer exist, nullable), `TransitionTaskStatusRequest.php` (enum + forward-only rule).
- `app/Services/TaskService.php` — `listTasks(?search, ?status, ?priority)` (eager-loaded, filtered, paginated), `createTask`, `updateTask`, `transitionStatus`, `deleteTask`.
- `app/Policies/TaskPolicy.php` — `viewAny`/`view` all authenticated; `create`/`update` Admin+Manager; `transition` assignee OR Admin/Manager; `delete`/`deleteAny` admin-only.
- `app/Http/Controllers/TaskController.php` — thin; authorize + service delegation; passes `can.create`/`can.delete` flags.
- `app/Http/Resources/TaskResource.php` — includes `assignee`, `customer`, `is_overdue`, per-task `can_transition`.
- Routes (`routes/web.php`), group `['auth']`: `GET /tasks` (`tasks.index`) &middot; `POST /tasks` (`tasks.store`) &middot; `PATCH /tasks/{task}` (`tasks.update`) &middot; `PATCH /tasks/{task}/status` (`tasks.status.update`) &middot; `DELETE /tasks/{task}` (`tasks.destroy`).

### Seeder
- `TaskSeeder` — demo tasks for the manager/admin/staff demo users, runs after demo users + customers in `DatabaseSeeder`.

### Frontend
- `pages/Tasks/Index.tsx` — search + status/priority filters, `Table` (task / status Badge / priority Badge / assignee / due date / actions), New/Edit `Modal` form (`useForm`, assignee+customer selects), delete confirmation `Modal`, Start/Complete action buttons guarded by `can_transition`.
- `layouts/partials/Sidebar.tsx` — **Tasks** nav item visible to all authenticated users.
- `types/index.d.ts` — added `TaskStatus`, `TaskPriority`, `TaskReference`, `Task` interfaces.

### Tests (`tests/Feature/TaskTest.php`)
Anonymous redirect &middot; any role can view index (Inertia props incl. `can.create`/`can.delete`, `can_transition`, assignee, `is_overdue`) &middot; staff create/update/delete → 403 &middot; manager create happy path &middot; admin update/delete happy paths &middot; creation validation &middot; assignee start/complete own task &middot; non-assignee staff cannot transition &middot; admin can transition any task &middot; forward-only transitions enforced &middot; status filter.

---

## 9. Phase 5 — Dashboard Stats &amp; Recent Activity (completed)

Replaced the placeholder dashboard with real task data: status count cards, today's open tasks, and a recent-activity feed.

### Backend
- `app/Services/DashboardService.php` — `getStatusCounts()` (tasks grouped by status), `getTodaysTaskCount()` (open tasks due today), `getRecentActivities(5)` (tasks ordered by `updated_at`, eager-loaded assignee).
- `app/Http/Controllers/DashboardController.php` — thin; builds `stats` (pending / in_progress / completed / today) and `recentActivities` (via `TaskResource`).
- Route `GET /dashboard` (`dashboard`, auth + verified) now points at the controller instead of the placeholder closure.
- `app/Http/Resources/TaskResource.php` — added `updated_at` (formatted) so the feed can show when a task was last updated.

### Frontend
- `pages/Dashboard.tsx` — stat cards wired to `stats` props and clickable (`Link` to `/tasks?status=...` or `/tasks`), "Recent Activities" feed renders the latest updated tasks (title link, assignee, update time, status Badge) with a real empty state; "View all" link to the tasks page.
- `types/index.d.ts` — added `DashboardStats`; `Task` now includes `updated_at`.

### Tests (`tests/Feature/DashboardTest.php`)
Anonymous redirect &middot; empty dashboard renders zeroed stats &middot; stats reflect seeded task counts &middot; completed tasks due today excluded from `today` &middot; recent activities ordered most-recent-first with assignee names.

---

## 10. Phase 6 — Realtime Task Notifications (completed)

Turns the previously prepared Reverb/Echo architecture into a working realtime notification system: task broadcasts to all authenticated users plus per-assignee bell notifications.

### Backend
- **Broadcast events** (`ShouldBroadcastNow`, synchronous — no queue worker needed):
  - `app/Events/TaskCreated.php` — broadcasts as `TaskCreated` on the private `tasks` channel (title/status/priority/assignee).
  - `app/Events/TaskStatusUpdated.php` — broadcasts as `TaskStatusUpdated` on `tasks` (old/new status).
- **Notifications** (`database` + `broadcast` channels, sent to the assignee):
  - `app/Notifications/TaskAssignedNotification.php` — sent when a task is created with an assignee or the assignee changes.
  - `app/Notifications/TaskStatusUpdatedNotification.php` — sent to the assignee when their task's status changes.
- **Channels** (`routes/channels.php`, registered via `withRouting(channels: ...)` which also auto-registers `/broadcasting/auth`): `tasks` (any authenticated user), `App.Models.User.{id}` (owner only).
- **`TaskService`** — dispatches the events and sends the notifications from `createTask`, `updateTask` (only when assignee changes), and `transitionStatus`.
- **`app/Http/Controllers/NotificationController.php`** — `GET /notifications` (JSON: latest 10 + `unread_count`), `POST /notifications/read` (mark all read).
- **`app/Http/Resources/NotificationResource.php`** — id, task_id, title, message, read_at, created_at.
- **`HandleInertiaRequests`** — lazily shares `notifications.unread_count` to every page.
- Published `config/broadcasting.php`; added the `notifications` table migration (`notifications:table`).

### Frontend
- `components/notification/NotificationProvider.tsx` — context (unread count, items, refresh, mark all read); subscribes to `private-tasks` (`.TaskCreated`, `.TaskStatusUpdated`) and `private-App.Models.User.{id}` (`.notification`) via Echo, showing a toast and refreshing the list on each event; fetches the list on mount. Guards `window.Echo` so it's a no-op when Reverb is not configured.
- `components/notification/NotificationBell.tsx` — bell icon in the navbar with unread-count badge; dropdown of recent notifications (links to Tasks), "Mark all read".
- `layouts/partials/Navbar.tsx` — bell rendered next to the user menu.
- `layouts/AppLayout.tsx` — `NotificationProvider` wraps the app (inside `ToastProvider`).
- `types/index.d.ts` — `AppNotification` interface; `PageProps.notifications.unread_count`.

### Tests (`tests/Feature/NotificationTest.php`)
Task creation broadcasts `TaskCreated` on `private-tasks` &middot; transition broadcasts `TaskStatusUpdated` &middot; assignment stores a DB notification for the assignee &middot; no notification when unassigned &middot; changing assignee notifies only the new assignee &middot; status transition notifies the assignee &middot; `/notifications` requires auth &middot; index returns list + unread count &middot; mark-all-read &middot; any authenticated user can authorize on `private-tasks` &middot; only the owner can authorize on `App.Models.User.{id}` (via pusher driver).

### Verified live (with `php artisan reverb:start`)
`/broadcasting/auth` returns a signed 200 for `private-tasks` and `App.Models.User.{id}` &middot; creating a task (assignee=staff) returns 302 with no broadcast exception (Pusher HTTP broadcaster throws on failure) &middot; staff `/notifications` shows 1 unread "You have been assigned task ..." &middot; `POST /notifications/read` returns 200 &middot; built JS contains the real Reverb key (Vite env expansion works).

---

## 11. Phase 7 — PDF &amp; Excel Report Exports (completed)

Adds downloadable reports of the task list. Both exports respect the exact filters used on the Tasks page (search / status / priority), and any authenticated user (all staff) can download them.

### Backend
- **`app/Services/TaskService.php`** — extracted the filtered query into `queryTasks(array $filters): Builder` (search / status / priority with eager loads), reused by both the index list (`listTasks`) and the exports.
- **`app/Exports/TasksExport.php`** — Maatwebsite Excel export (`FromQuery`, `WithHeadings`, `WithMapping`, `WithStyles`, `ShouldAutoSize`): columns ID, Title, Status, Priority, Assignee, Customer, Created by, Due date, Created at. Status/priority rendered as human labels; assignee/customer/creator resolved by name; bold header row.
- **`app/Http/Controllers/TaskExportController.php`** — `excel()` streams `tasks-YYYY-MM-DD.xlsx` via `Excel::download`; `pdf()` renders `resources/views/exports/tasks.blade.php` and streams `tasks-YYYY-MM-DD.pdf` via dompdf. Both `authorize('viewAny', Task::class)`.
- **`resources/views/exports/tasks.blade.php`** — styled table with a generated-at line and the active filters (search/status/priority), empty state row.
- **Routes** — `GET /tasks/export/pdf` and `GET /tasks/export/excel` in the `auth` group (all staff), named `tasks.export.pdf` / `tasks.export.excel`.

### Frontend (`resources/js/pages/Tasks/Index.tsx`)
"Export Excel" / "Export PDF" buttons beside "New Task", rendered as plain links (native browser download) whose hrefs carry the currently selected search/status/priority filters via Ziggy.

### Tests (`tests/Feature/ExportTest.php`)
Guest redirected to login for both endpoints &middot; staff can download a valid `%PDF` report (`application/pdf` + attachment) &middot; staff can download a real `.xlsx` (headers row + task title present, parsed with PhpSpreadsheet) &middot; Excel export respects the `status` filter (pending included, completed excluded) &middot; status/priority shown as labels ("In Progress", "High") &middot; PDF blade view renders task titles and enum labels.

### Verified live
Logged in as manager: `GET /tasks/export/pdf` → 200 `application/pdf` + `attachment; filename=tasks-2026-08-01.pdf`, 880 KB, `%PDF-` header &middot; `GET /tasks/export/excel?status=pending` → 200 `.xlsx` with header row + 3 pending tasks (names/labels resolved) &middot; anonymous request → 302 to `/login`.

---

## 12. Phase 8 — Production Hardening (completed)

### Registration disabled
- Removed the `register` GET/POST routes from `routes/auth.php`; deleted the now-unused `app/Http/Controllers/Auth/RegisteredUserController.php` and `resources/js/pages/auth/Register.tsx`.
- `GET/POST /register` now returns 404; the Welcome page no longer offers a Register button (`canRegister` is false because `Route::has('register')` is false).
- `tests/Feature/Auth/RegistrationTest.php` rewritten to assert the routes are gone and no guest is authenticated.

### APP_DEBUG=false / APP_ENV=production
- `.env` (and `.env.example`) now set `APP_ENV=production` and `APP_DEBUG=false`; verified at runtime (`config('app.debug') === false`, `app()->environment() === 'production'`).
- Login and `/dashboard` still serve correctly with debug off.
- Deployment note: run `php artisan optimize` + `php artisan migrate --force` when deploying.

### Database backup strategy
- New `app/Console/Commands/DatabaseBackupCommand.php` (`php artisan backup:database {--keep=7}`):
  - Dumps the MySQL database with `mysqldump --no-defaults` (explicit `--no-defaults` ignores config files — Laragon ships a malformed `[mysqldump] =quick` line in `my.ini` that would otherwise break the dump). Uses `--single-transaction`, `--routines`, `--no-tablespaces`; matches the driver/version.
  - Writes `storage/app/backups/backup-YYYY-MM-DD-HHMMSS.sql`, prunes to the N newest (default 7), and fails loudly with a clear message if the binary is missing or the dump errors.
  - Binary resolution: `MYSQLDUMP_PATH` (config `database.backup.mysqldump`) → if set but invalid, fail (no silent fallback to a possibly-wrong-version PATH binary) → otherwise `ExecutableFinder` on PATH.
- Scheduled daily at 02:00 via `withSchedule` in `bootstrap/app.php`; verified with `php artisan schedule:list`.
- `MYSQLDUMP_PATH` added to `.env` / `.env.example` (forward slashes — Dotenv rejects backslashes in quoted values).

### Tests (`tests/Feature/BackupCommandTest.php`)
Prunes old backups keeping the newest N (with `--keep`) &middot; fails gracefully with exit code 1 and no file when `MYSQLDUMP_PATH` points at a missing binary. (The missing-binary test restores the `database.default` config override in a `finally` — leaving it flipped broke RefreshDatabase's teardown, which re-reads the default connection dynamically and left the shared in-memory SQLite PDO stuck in a transaction.)

### Verified live
`GET /register` → 404 &middot; Welcome page `canRegister=false` &middot; `php artisan backup:database` → `storage/app/backups/backup-....sql` with 14 `CREATE TABLE` statements + users data &middot; `schedule:list` shows `0 2 * * * backup:database` &middot; login (302) + `/dashboard` (200) work with `APP_ENV=production`, `APP_DEBUG=false`.

---

## 13. Remaining TODO List

**Nothing pending.** All planned phases are complete. Suggested follow-ups if this ever grows: spatie/laravel-backup for off-site storage, frontend test coverage, CI pipeline.

---

## Verified Checks

- `npm run build` — clean (tsc + Vite, zero errors, no warnings)
- `php artisan test` — 80 passed / 284 assertions
- `php artisan route:list` — auth (login/password) + profile + dashboard + users + customers + tasks + task exports (pdf/excel) + notifications routes registered; no register routes
- Smoke test — `/` 200, `/login` 200, `/dashboard` 302 (redirects to login when anonymous); admin login + `/users` renders `Users/Index` with roles; non-admin 403; staff views `/customers` (`can.manage=false`, search works); admin create/update/delete customers; manager login + `/dashboard` renders `Dashboard` with real stats and the recent-activity feed; live Reverb broadcast + per-user notifications verified; task exports download valid PDF/xlsx respecting filters; registration 404 + `canRegister=false` with debug off; backup command produces a valid SQL dump
- `php artisan migrate:fresh --seed` — roles + customers + tasks + notifications + 3 demo users + 8 demo customers + 8 demo tasks
- `vendor/bin/pint` — PSR-12 clean
