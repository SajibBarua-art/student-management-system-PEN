# RegistryOS — Higher Education Student Management System

> **PEN Global (PEN Group) Technical Assessment — Registry Module**  
> Built with Next.js 16 (App Router), PostgreSQL 18, Prisma ORM 7, and Tailwind CSS.

---

## Overview

**RegistryOS** is a specialized web application covering the four daily core workflows of a University Registry Administrator. It provides an intuitive, high-performance interface with role separation between **Registry Staff** and **Students**, real-time financial tracking, coursework submission controls, and an Examination Board results publishing system.

### Key Architecture Documents
- 📖 [**PROJECT_DETAILS.md**](./PROJECT_DETAILS.md) — Architectural patterns, database entity modeling, domain rules, and edge-case handling.
- 📡 [**API_DOCUMENTATION.md**](./API_DOCUMENTATION.md) — Comprehensive REST API endpoint reference, request/response schemas, and validation rules.

---

## Core Workflows Implemented

### 1. Student Enrolment
- **Record Creation**: Register students with full name, email, date of birth, programme, academic year, and status (`Enrolled`, `Deferred`, `Withdrawn`, `Completed`).
- **Automated ID Generation**: Unique Student IDs generated sequentially in the format `SMS-YYYY-XXXX` (e.g., `SMS-2025-0001`).
- **Search & Filtering**: Search across names, student IDs, and emails, with filters by programme, enrolment status, or overdue fee flags.
- **Tuition Fee Scheduling**: Enrolling a student automatically assigns the programme's standard annual tuition fee to their financial ledger.

### 2. Fees & Payments
- **Programme-Based Fee Assignment**: Tuitions are assigned based on the student's enrolled programme.
- **Transaction Logging**: Record payments with amount, date, payment method, bank reference number (`TXN-YYYY-XXXXX`), and audit notes.
- **Real-Time Balance Calculation**: Computes outstanding liabilities dynamically ($\sum \text{Fees} - \sum \text{Payments}$).
- **Overdue Triage (Edge Case)**: Prominently flags students with overdue balances directly on the Registry Dashboard and student directories.

### 3. Assessment Submission
- **Staff Assignment Creation**: Create module assessments with titles, module codes, descriptions, and submission deadlines.
- **Strict File Type Restriction**: Student submissions are strictly validated to accept only `.pdf`, `.docx`, and `.doc` files.
- **Single Submission & Resubmissions**: Enforces one submission per student per assessment, allowing students to resubmit files before the deadline passes (version counter increments).
- **Late Submission Handling (Edge Case)**: Accepts initial submissions past the deadline to preserve student work, but automatically marks and visually flags them as **LATE SUBMISSION** in the staff interface.

### 4. Marksheet & Results
- **Numeric Grading**: Staff enter numeric scores from `0` to `100` alongside qualitative feedback.
- **Auto-Classification System**:
  - **Distinction**: Grade $\ge 70\%$
  - **Merit**: Grade $\ge 60\%$
  - **Pass**: Grade $\ge 40\%$
  - **Fail**: Grade $< 40\%$
- **Result Publication & Privacy Control (Edge Case)**: Staff control result publication on a per-student basis. Students can only view their marksheet once formally published; withheld results display an Examination Board moderation notice.

---

## Role Separation

The application includes an instant role toggle in the header navigation:

- **Staff View**: Executive command center, enrolment records, financial ledger, assessment manager, and marksheet grading tables.
- **Student View**: Self-service student portal with a **Simulate Persona** selector (switch between demo students such as Amina Rahman, Liam O'Connor, Elena Rostova, Marcus Vance, Zainab Al-Mansoor, and David Chen). Provides digital ID card view, coursework uploads, certified marksheet, and personal tuition balance.

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v20.x or later (`node -v`)
- **npm**: v10.x or later (`npm -v`)

> **Note on PostgreSQL**: The project includes a zero-configuration native embedded PostgreSQL engine. Running `npm run dev` will automatically launch the database service on port `5433` without requiring Docker or root privileges. Alternatively, you can point `DATABASE_URL` to any external PostgreSQL instance (e.g. Supabase, Neon, or local Docker).

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd student-management-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Verify the `.env` settings:
```env
# Default connection string for local embedded PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5433/sms_registry?schema=public"

NODE_ENV="development"
PORT="3000"
```

### Step 4: Push Prisma Schema & Seed Demo Data
Synchronize the database schema and populate realistic demo records:
```bash
# Push schema to PostgreSQL
npm run db:push

# Populate demo data (programmes, students, fees, submissions, and grades)
npm run db:seed
```

### Step 5: Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Seed Data Summary

Running `npm run db:seed` provisions the database with realistic demo scenarios:

| Student ID | Student Name | Programme | Status | Balance | Assessments & Marksheet Status |
|---|---|---|---|---|---|
| **SMS-2025-0001** | Amina Rahman | BSc Computer Science | `ENROLLED` | £0.00 (Paid in full) | Distinction (84.0%) — **Published** |
| **SMS-2025-0002** | Liam O'Connor | BSc Computer Science | `ENROLLED` | £6,250.00 (**OVERDUE**) | Merit (64.0%) — Late Submission Flagged |
| **SMS-2025-0003** | Elena Rostova | MSc Data Science & AI | `ENROLLED` | £0.00 (Paid in full) | Distinction (76.0%) — **WITHHELD** (Board Review) |
| **SMS-2025-0004** | Marcus Vance | BSc Computer Science | `DEFERRED` | £8,250.00 (**OVERDUE**) | No submissions recorded |
| **SMS-2025-0005** | Zainab Al-Mansoor | MBA | `COMPLETED` | £0.00 (Paid in full) | Distinction (88.0%) — **Published** |
| **SMS-2025-0006** | David Chen | BSc Computer Science | `ENROLLED` | £9,250.00 (**OVERDUE**) | Fail (34.0%) — **Published** (Resit Required) |

---

## Available NPM Scripts

- `npm run dev`: Automatically ensures PostgreSQL is active and launches the Next.js development server.
- `npm run build`: Compiles production build using Webpack.
- `npm start`: Runs the production server.
- `npm run db:start`: Starts the native PostgreSQL background service.
- `npm run db:push`: Applies `prisma/schema.prisma` directly to the database.
- `npm run db:seed`: Seeds demo students, programmes, fees, payments, assessments, and grades.
- `npm run db:generate`: Regenerates the type-safe Prisma client.

---

## AI Tools Usage Disclosure

As encouraged by the technical assessment specification, AI assistance was utilized deliberately and strategically during development:

1. **Architecture & Schema Design**:
   - Leveraged AI to evaluate edge cases in academic registry lifecycles, specifically ensuring relational constraints (such as `[studentId, assessmentId]` uniqueness) prevent duplicate coursework uploads while preserving on-time resubmissions.
2. **Boilerplate & TypeScript Typings**:
   - Utilized AI to scaffold Next.js App Router route handlers, write schema validation guards, and format UK grading classification rules.
3. **UI/UX Aesthetics & Visual Polish**:
   - Employed AI to generate the tailored glassmorphism design tokens, CSS radial gradients, and responsive layouts, moving away from default starter templates into a bespoke executive aesthetic.
4. **Testing & Verification**:
   - Automated end-to-end user journey verification using headless browser subagents to ensure modal transitions, real-time balance calculations, and role toggling function reliably.
