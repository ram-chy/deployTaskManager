# TaskManager — Office Task Management System

TaskManager is a modern, self-hosted office task management system built with
Laravel, React, Inertia, and TypeScript. It is designed for a small office or
home-network deployment and runs fully offline — no internet access required.

It lets you manage customers, assign tasks, and track work through a
general-purpose status workflow with real-time notifications, PDF/Excel export,
and role-based access for Admin, Manager, and Staff users.

---

## Features

### User management
- Role-based access control: **Admin**, **Manager**, **Staff**
- User CRUD and role assignment (Admin only)
- Registration is enabled out of the box, or you can disable it

### Customer management
- Maintain a customer directory
- Full CRUD (Admin only) inside the authenticated app

### Task management
- Create, assign, and track tasks per customer
- View full task details (with customer info) in a modal
- 5-status general-purpose workflow with status transition:
  1. **Pending**
  2. **In Progress**
  3. **Under Review**
  4. **Completed**
  5. **Cancelled** (from any active stage)
- Guarded forward-only status transitions via a dedicated service layer
- Real-time task status updates over WebSockets

### Dashboard & reporting
- Dashboard cards: pending tasks, in-progress, completed, today's tasks, recent activity
- Export the full task listing to **PDF** (landscape layout via DOMPDF)
- Export to **Excel** (via Maatwebsite Excel)

### UI & theming
- **Dark mode** with light/dark toggle (saved to localStorage, falls back to system preference)
- Responsive sidebar layout (Tailwind CSS v4 + Headless UI)

### Realtime & notifications
- Laravel **Reverb** WebSocket server + Laravel **Echo**
- Realtime (broadcast) notifications when a task status changes
- In-app notification center with read/unread state

### Operations
- Automatic daily **database backup** command (`php artisan backup:database`)
- Database-backed queues, cache, and sessions
- Production-friendly `.env.example` (debug off)

---

## Technology Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Backend    | Laravel 13, PHP 8.4+                                  |
| Frontend   | React 19, Inertia 2, TypeScript, Vite                |
| Styling    | Tailwind CSS v4, Headless UI                          |
| Database   | MySQL (InnoDB, foreign keys)                          |
| Auth       | Laravel session authentication + Sanctum             |
| Realtime   | Laravel Reverb, Laravel Echo, Pusher JS              |
| Queues     | Database queue driver                                |
| Export     | barryvdh/laravel-dompdf (PDF), Maatwebsite Excel     |

---

## Requirements

- PHP **8.4+** (with `pdo_mysql`, `mbstring`, `openssl`, `gd` extensions)
- Composer 2
- Node.js 20+ and npm
- MySQL 8 (or compatible)
- A running queue worker and Reverb server for realtime notifications

---

## Installation

### 1. Clone or extract the project

```bash
cd path/to/taskmanager
```

### 2. Install backend dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 3. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your database credentials:

```env
APP_NAME=TaskManager
APP_URL=http://your-domain.local

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmanager
DB_USERNAME=root
DB_PASSWORD=your_password
```

> **Note:** If your server's `mysqldump` binary is not on the PATH, set the absolute
> path in `MYSQLDUMP_PATH` for the `backup:database` command.

### 4. Create the database and run migrations

```bash
php artisan migrate --force
```

### 5. Seed demo data (optional)

```bash
php artisan db:seed --force
```

### 6. Install frontend dependencies and build assets

```bash
npm install --ignore-scripts
npm run build
```

### 7. Link storage

```bash
php artisan storage:link
```

### 8. Start the application

```bash
php artisan serve
```

Then open `http://localhost:8000`.

---

## Realtime Notifications (optional)

Realtime notifications use Laravel Reverb:

1. Set the Reverb credentials in `.env` (pre-filled in `.env.example`).
2. If you change them, publish fresh values:

```bash
php artisan reverb:start
```

3. Run a queue worker in a separate terminal:

```bash
php artisan queue:listen --tries=1 --timeout=0
```

> Without the queue worker and Reverb server, the app still works correctly —
> only live/broadcast notifications are disabled.

---

## Usage

### Demo accounts (after seeding)

| Role    | Email                     | Password |
| ------- | ------------------------- | -------- |
| Admin   | `admin@taskmanager.local`  | `password` |
| Manager | `manager@taskmanager.local` | `password` |
| Staff   | `staff@taskmanager.local`  | `password` |

### Workflow

1. **Admin** creates users and customers.
2. **Manager/Staff** create tasks assigned to customers.
3. Tasks move through the general-purpose workflow; the current user's role controls which transitions are allowed.
4. Export the task list to PDF or Excel from the Tasks page.

---

## Scheduled Backups

Set up a scheduler entry to run the daily database backup automatically:

```bash
* * * * * cd /path/to/taskmanager && php artisan schedule:run >> /dev/null 2>&1
```

Manual backup:

```bash
php artisan backup:database
```

---

## Deployment (Docker demo)

The repo ships with a Docker setup (`Dockerfile`, `docker-compose.yml`,
`render.yaml`, `railway.json`) so you can stand up a demo in a few minutes.

### 1. Local demo (Docker Compose)

```bash
cp .env.example .env      # optional; the container provides its own values
docker compose up --build
```

Open `http://localhost:8000`. MySQL and demo data are provisioned automatically.

### 2. Render (free tier)

1. Push the repo to GitHub.
2. In Render, **New → Blueprint**, point it at the repo, choose `render.yaml`.
3. Change `repo` in `render.yaml` to your repo URL if you use the dashboard form.
4. After deploy, generated data is ephemeral (SQLite, rebuilt on each deploy).

> Render only proxies traffic to `0.0.0.0:$PORT` (default `10000`). The
> container entrypoint renders `docker/deploy/nginx.conf.tpl` with that port at
> boot, so no port is hardcoded — nothing to configure.
>
> Free instances also spin down after ~15 min idle and restart on the next
> request. Sessions live in the ephemeral database, so visitors are logged out
> afterwards. The seeders are idempotent, so restarts do not duplicate data.

### 3. Railway

1. Push to GitHub and create a Railway project.
2. Add a **MySQL** plugin and name it `MySQL`.
3. Deploy the repo — Railway uses `railway.json`, which wires up the app to the
   MySQL plugin automatically.

### Demo accounts (seeded with `APP_SEED_DEMO=true`)

| Role    | Email                     | Password |
| ------- | ------------------------- | -------- |
| Admin   | `admin@taskmanager.local`  | `password` |
| Manager | `manager@taskmanager.local` | `password` |
| Staff   | `staff@taskmanager.local`  | `password` |

### Realtime notifications (optional)

The demo runs without websockets by default. To enable Laravel Reverb, set
`START_REVERB=true` and export port **8080** in your hosting platform (public
TCP ports are only available on paid plans on most hosts).

---

## Development

```bash
npm run dev          # Vite dev server with HMR
php artisan serve    # Laravel dev server
php artisan pail     # Tail the logs
```

Run the test suite:

```bash
composer test
```

---

## Project Structure

```
app/
  Console/Commands/      # DatabaseBackupCommand
  Enums/                 # TaskStatus workflow enum
  Http/Controllers/      # Dashboard, Task, Customer, User, Export controllers
  Models/                # User, Role, Customer, Task
  Services/              # Service layer (TaskService, etc.)
resources/
  js/
    components/          # Reusable React components
    layouts/             # App layout, Sidebar, Navbar
    pages/               # Inertia pages
    types/               # TypeScript types
database/
  migrations/            # Schema migrations
  seeders/               # Roles, users, customers, tasks
routes/
  web.php                # Web routes
```

---

## Security

- CSRF protection enabled
- Form Request validation on all writes
- Role-based authorization (Admin-only write actions for users/customers)
- Mass-assignment protection

---

## License

This project is proprietary. See the CodeSter listing for license terms.