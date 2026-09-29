# RegistryOS — Higher Education Student Management System

> **PEN Global (PEN Group) Technical Assessment — Registry & Academic Operations Module**  
> Built with Next.js 16 (App Router), PostgreSQL 18, Prisma ORM 7, and Tailwind CSS.

---

## Overview

**RegistryOS** is an enterprise-grade university registry and academic lifecycle platform engineered for modern higher education institutions. Covering admissions, student finance, coursework assessments, examination board marksheet moderation, and compliance, RegistryOS enforces strict role-based access control (RBAC) across administrative, financial, academic, and student roles.

### Key Architecture Documents
- 📖 [**PROJECT_DETAILS.md**](./PROJECT_DETAILS.md) — Comprehensive architecture, domain models, entity-relationship specifications, and edge-case handling.
- 📡 [**API_DOCUMENTATION.md**](./API_DOCUMENTATION.md) — REST API endpoint reference, request/response payloads, and status codes.

---

## Core Institutional Modules

### 1. Student Enrolment & Lifecycle Management
- **Record Creation**: Register students with full biographical data, date of birth, programme, cohort year, and status (`ENROLLED`, `DEFERRED`, `WITHDRAWN`, `COMPLETED`).
- **Sequential Student ID Generation**: Deterministic, collision-resistant identifier format `SMS-YYYY-XXXX` (e.g., `SMS-2025-0001`).
- **Tuition Fee Scheduling**: Enrolling a student automatically assigns the programme's standard annual tuition fee to their financial ledger.
- **Search & Filter Matrix**: Instant client-side search across names, emails, and IDs, paired with multi-parameter filtering by programme, status, and fee balance flags.

### 2. Fees, Instalments & Financial Aid
- **Programme-Based Fee Assignment**: Tuitions are calculated and assigned dynamically based on programme and degree level.
- **Instalment Payment Plans**: Supports structured multi-term instalment plans (e.g. 3-Term split across Autumn, Spring, and Summer) with separate milestone deadlines.
- **Scholarships & Fee Remissions**: Supports awarding merit scholarships, hardship grants, or fee reductions with full audit tracking.
- **Transaction Ledger**: Records payments with transaction reference codes (`TXN-YYYY-XXXXX`), payment method (Bank Transfer, Card, Scholarship Credit), and receipt generation.
- **Real-Time Balance & Overdue Triage**: Computes outstanding liabilities dynamically ($\sum \text{Fees} - \sum \text{Payments}$) with prominent visual alerts for overdue accounts.

### 3. Coursework Assessments & Submissions
- **Assessment Specifications**: Academic staff create module coursework with weighting, learning outcomes, submission deadlines, and grading rubrics.
- **Strict File Type Restriction**: Submissions strictly enforce `.pdf`, `.docx`, and `.doc` MIME type validation.
- **Versioned Resubmissions**: Enforces single active submission per student per assessment while permitting on-time revisions (version counter increments).
- **Late Submission Flagging**: Submissions uploaded past the deadline are accepted to preserve academic evidence, but automatically flagged as **LATE SUBMISSION** with timestamp telemetry.
- **Extenuating Circumstances (EC)**: Formal workflow for students facing bereavement or illness to request deadline extensions (+7 / +14 days) or late penalty waivers.

### 4. Marksheets, Moderation & Degree Classification
- **UK Higher Education Grading**: Numeric scoring (`0`–`100`) mapped to standard UK Honours degree classifications:
  - **Distinction / First Class (1st)**: $\ge 70\%$
  - **Merit / Upper Second Class (2:1)**: $60 - 69.9\%$
  - **Pass / Lower Second Class (2:2)**: $50 - 59.9\%$
  - **Third Class (3rd)**: $40 - 49.9\%$
  - **Fail / Resit Required**: $< 40\%$
- **Examination Board Results Moderation**: Staff control results publication on a per-student and per-module basis. Withheld marks remain private to faculty during Board review and display an official moderation notice to students.
- **Automated Progression Engine**: Calculates progression decisions (e.g., Progress to Next Year, Referral for Resit, Repeat Module, or Fail/Withdraw).

### 5. Official Transcripts & Public QR Verification
- **Official Transcript Generation**: High-fidelity, print-ready academic transcripts formatted to UK institutional standards with modular credit breakdowns, GPA/classification, and signature blocks.
- **Cryptographic QR Code & Verification Portal**:
  - Each transcript embeds a unique QR code pointing to `/verify?id=...&hash=...`.
  - Employers and third parties can scan the QR code to reach the live, tamper-evident verification portal confirming authentic conferral directly against the university database.
- **Clean Print & PDF Output**: Pure `@media print` styling removes navigation chrome and renders crisp vector typography.

### 6. Institutional Compliance & Audit Trail
- **Immutable Audit Logging**: Every high-impact institutional action (enrolment, grade modifications, marksheet publishing, fee waivers, extension approvals) generates a structured audit log entry (`AuditLog` entity).
- **Compliance Inspector**: Dedicated administrative audit tab to investigate event histories by user persona, action category, and timestamp.

---

## Role-Based Access Control (RBAC) & Personas

RegistryOS features a live institutional persona switcher in the header navigation that demonstrates strict role separation:

| Institutional Persona | Enrolment & Admissions | Tuition & Payments | Coursework & Submissions | Grading & Marksheet | Audit Trail |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Registry Administrator** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Module Leader (Academics)** | 🔒 Restricted | 🔒 Restricted | ✅ Manage & Review | ✅ Grade & Moderate | ✅ View Trail |
| **Bursar / Finance Officer** | ✅ View Students | ✅ Full Ledger & Plans | 🔒 Restricted | 🔒 Restricted | ✅ View Trail |
| **Student (Self-Service)** | 🔒 Restricted | 📄 View Ledger | 📤 Upload Submissions | 🎓 View Published Grades | 🔒 Restricted |

### Persona-Aware Dashboard
- **Dynamic Quick Actions**: Action buttons in the executive dashboard hero automatically adapt to the user's permissions (unauthorized actions are hidden).
- **Module Lock Cards**: Navigation cards for restricted modules are visibly locked with `Lock` badges and role boundary descriptions.
- **Contextual Notifications**: Academic leads see marksheet moderation alerts; Finance officers see tuition delinquency alerts.

---

## Technical Stack & Architecture

- **Framework**: Next.js 16.3.6 (App Router, Server Components & Route Handlers)
- **Runtime & UI**: React 19, TypeScript 5, Tailwind CSS
- **Database**: PostgreSQL 18
- **ORM & Data Modeling**: Prisma ORM 7 (`@prisma/client`)
- **Icons & Visuals**: Lucide React
- **Document Printing**: Pure CSS `@media print` with custom vector seals and watermarks
- **State & Routing**: Deep URL tab synchronization (`?tab=overview|enrolment|fees|assessments|marksheet|audit`) preserving UI state across page refreshes.

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v20.x or later (`node -v`)
- **npm**: v10.x or later (`npm -v`)

> **PostgreSQL Configuration**: The project runs on PostgreSQL. A native background database service is configured on port `5433`. You can also configure `DATABASE_URL` in `.env` to point to any PostgreSQL instance (Supabase, Neon, Docker, or local service).

### Step 1: Clone the Repository
```bash
git clone https://github.com/SajibBarua-art/student-management-system-PEN.git
cd student-management-system-PEN
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Verify your `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/sms_registry?schema=public"
NODE_ENV="development"
PORT="3000"
```

### Step 4: Apply Database Schema & Seed Data
```bash
# Push schema migrations to PostgreSQL
npm run db:push

# Seed demo data (programmes, students, fee ledger, assessments, submissions, grades)
npm run db:seed
```

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Persona Directory

Running `npm run db:seed` provisions realistic academic scenarios:

| Student ID | Student Name | Programme | Status | Balance | Academic & Marksheet Status |
|---|---|---|---|---|---|
| **SMS-2025-0001** | Amina Rahman | BSc Computer Science | `ENROLLED` | £0.00 (Settled) | First Class (84.0%) — **Published** |
| **SMS-2025-0002** | Liam O'Connor | BSc Computer Science | `ENROLLED` | £6,250.00 (**OVERDUE**) | Upper Second (64.0%) — Late Submission Flagged |
| **SMS-2025-0003** | Elena Rostova | MSc Data Science & AI | `ENROLLED` | £0.00 (Settled) | Distinction (76.0%) — **WITHHELD** (Board Moderation) |
| **SMS-2025-0004** | Marcus Vance | BSc Computer Science | `DEFERRED` | £8,250.00 (**OVERDUE**) | Extenuating Circumstances Pending |
| **SMS-2025-0005** | Zainab Al-Mansoor | MBA | `COMPLETED` | £0.00 (Settled) | Distinction (88.0%) — **Conferred & Graduated** |
| **SMS-2025-0006** | David Chen | BSc Computer Science | `ENROLLED` | £9,250.00 (**OVERDUE**) | Fail (34.0%) — Resit Scheduled |

---

## Available NPM Scripts

- `npm run dev`: Starts the Next.js development server (with automatic PostgreSQL daemon validation).
- `npm run build`: Compiles production build using Webpack.
- `npm start`: Starts production server.
- `npm run db:start`: Starts local PostgreSQL service daemon.
- `npm run db:push`: Synchronizes `prisma/schema.prisma` with the target PostgreSQL database.
- `npm run db:seed`: Seeds realistic demo students, assessments, submissions, grades, and audit records.
- `npm run db:generate`: Regenerates the Prisma Client.

---

## AI Tools Usage Disclosure

In alignment with the technical assessment guidelines, AI tools were utilized strategically:

1. **System Architecture & Data Modeling**:
   - Leveraged AI to design relational integrity rules across PostgreSQL models (such as composite unique constraints preventing duplicate active submissions, and relational balance derivation).
2. **Institutional Domain Rules**:
   - Accelerated implementation of UK Higher Education degree classification formulas, moderation workflows, and instalment payment schedules.
3. **Executive Visual Design & Aesthetics**:
   - Generated modern glassmorphism design tokens, micro-animations, and dynamic persona-based dashboard layouts.
4. **Verification & Testing**:
   - Headless browser validation of critical user journeys (student enrolment modal, coursework submission, results publishing, transcript verification).
