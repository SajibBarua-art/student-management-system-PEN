# RegistryOS — API Documentation

This document provides a comprehensive specification of all RESTful API endpoints implemented in the Registry Module of the Student Management System.

All API routes are served under `/api` and utilize Next.js App Router route handlers.

---

## Table of Contents

1. [Overview & Standards](#overview--standards)
2. [Dashboard Metrics](#1-dashboard-metrics)
   - `GET /api/dashboard/stats`
3. [Programmes API](#2-programmes-api)
   - `GET /api/programmes`
4. [Student Enrolment API](#3-student-enrolment-api)
   - `GET /api/students`
   - `POST /api/students`
   - `GET /api/students/:id`
   - `PATCH /api/students/:id`
   - `DELETE /api/students/:id`
5. [Fees & Payments API](#4-fees--payments-api)
   - `GET /api/fees`
   - `POST /api/fees`
   - `GET /api/payments`
   - `POST /api/payments`
6. [Assessments & Submissions API](#5-assessments--submissions-api)
   - `GET /api/assessments`
   - `POST /api/assessments`
   - `GET /api/submissions`
   - `POST /api/submissions` (Multipart File Upload)
7. [Marksheet & Results API](#6-marksheet--results-api)
   - `GET /api/grades`
   - `POST /api/grades`
   - `POST /api/grades/publish`

---

## Overview & Standards

### Base URL
```
http://localhost:3000/api
```

### Standard Response Structure

#### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or missing required fields.
- `403 Forbidden`: Action not permitted (e.g. resubmitting after deadline).
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email or reference number).
- `500 Internal Server Error`: Unhandled server exception.

---

## 1. Dashboard Metrics

### `GET /api/dashboard/stats`
Retrieves aggregated statistics and operational KPIs for the Registry Administrator dashboard.

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "students": {
      "total": 6,
      "statusCounts": {
        "ENROLLED": 4,
        "DEFERRED": 1,
        "WITHDRAWN": 0,
        "COMPLETED": 1
      }
    },
    "finances": {
      "totalAssigned": 62500,
      "totalCollected": 38750,
      "outstandingBalance": 23750,
      "overdueCount": 3,
      "overdueStudents": [
        {
          "id": "cmukxswq8000donpqogzawoie",
          "studentId": "SMS-2025-0002",
          "fullName": "Liam O'Connor",
          "programme": "BSc (Hons) Computer Science",
          "programmeCode": "BSC-CS",
          "balance": 6250,
          "fees": [...]
        }
      ]
    },
    "assessments": {
      "total": 4,
      "open": 2,
      "closed": 2,
      "totalSubmissions": 4,
      "lateSubmissions": 1
    },
    "grades": {
      "total": 5,
      "published": 4,
      "withheld": 1,
      "pending": 0
    }
  }
}
```

---

## 2. Programmes API

### `GET /api/programmes`
Retrieves all academic programmes available in the institution.

#### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cmu...01",
      "code": "BSC-CS",
      "name": "BSc (Hons) Computer Science",
      "department": "School of Computing & Mathematical Sciences",
      "standardFee": 9250.0,
      "durationYears": 3,
      "description": "Comprehensive undergraduate computing degree.",
      "_count": {
        "students": 4,
        "assessments": 2
      }
    }
  ]
}
```

---

## 3. Student Enrolment API

### `GET /api/students`
Lists students with live balance calculations and overdue status flags.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | String | No | Case-insensitive substring match on `fullName`, `studentId`, or `email`. |
| `status` | String | No | Filter by `ENROLLED`, `DEFERRED`, `WITHDRAWN`, or `COMPLETED`. |
| `programmeId` | String | No | Filter by Programme ID. |
| `overdueOnly` | Boolean (`"true"`/`"false"`) | No | If true, returns only students with overdue balances. |

#### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cmukxswpy0007onpqx24c52m3",
      "studentId": "SMS-2025-0001",
      "fullName": "Amina Rahman",
      "email": "amina.rahman@campus.ac.uk",
      "dateOfBirth": "2003-04-15T00:00:00.000Z",
      "academicYear": "2024/2025",
      "status": "ENROLLED",
      "programmeId": "cmukxswpt0000onpq2f462sgl",
      "programme": {
        "code": "BSC-CS",
        "name": "BSc (Hons) Computer Science",
        "standardFee": 9250.0
      },
      "totalFees": 9250.0,
      "totalPaid": 9250.0,
      "balance": 0.0,
      "isOverdue": false
    }
  ]
}
```

---

### `POST /api/students`
Enrols a new student record, auto-generates a unique Student ID (`SMS-YYYY-XXXX`), and assigns the programme's standard tuition fee.

#### Request Body
```json
{
  "fullName": "Jonathan Edwards",
  "email": "jonathan.edwards@campus.ac.uk",
  "dateOfBirth": "2003-07-22",
  "programmeId": "cmukxswpt0000onpq2f462sgl",
  "academicYear": "2024/2025",
  "status": "ENROLLED"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cmuk...",
    "studentId": "SMS-2025-0007",
    "fullName": "Jonathan Edwards",
    "email": "jonathan.edwards@campus.ac.uk",
    "dateOfBirth": "2003-07-22T00:00:00.000Z",
    "academicYear": "2024/2025",
    "status": "ENROLLED",
    "programme": { ... },
    "fees": [
      {
        "amount": 9250.0,
        "description": "Annual Tuition Fee 2024/2025",
        "dueDate": "2026-10-28T07:44:00.000Z"
      }
    ],
    "totalFees": 9250.0,
    "totalPaid": 0.0,
    "balance": 9250.0,
    "isOverdue": false
  }
}
```

---

### `GET /api/students/:id`
Retrieves a single student's complete dossier including fees, payments, submissions, and grades.

#### Response `200 OK`
Returns the student object with nested `programme`, `fees`, `payments`, `submissions`, and `grades`.

---

### `PATCH /api/students/:id`
Modifies student details or enrolment status (`ENROLLED`, `DEFERRED`, `WITHDRAWN`, `COMPLETED`).

#### Request Body
```json
{
  "status": "DEFERRED"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/students/:id`
Deletes a student record and cascades related records.

---

## 4. Fees & Payments API

### `GET /api/fees`
Retrieves fee assignments across students.

#### Query Parameters
- `studentId` (Optional): Filter fee schedule by student.

---

### `POST /api/fees`
Assigns a supplementary or custom fee to a student.

#### Request Body
```json
{
  "studentId": "cmukxswpy0007onpqx24c52m3",
  "amount": 500.00,
  "description": "Re-sit Examination Fee",
  "dueDate": "2026-10-15T00:00:00.000Z",
  "academicYear": "2024/2025"
}
```

---

### `GET /api/payments`
Lists payment transactions with student details.

---

### `POST /api/payments`
Records a student payment transaction and calculates updated balance in real time.

#### Request Body
```json
{
  "studentId": "cmukxswq8000donpqogzawoie",
  "amount": 3250.00,
  "paymentDate": "2026-09-28T14:30:00.000Z",
  "referenceNumber": "TXN-2025-99812",
  "paymentMethod": "Bank Transfer",
  "notes": "Term 2 settlement"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cmuk...",
    "studentId": "cmukxswq8000donpqogzawoie",
    "amount": 3250.0,
    "paymentDate": "2026-09-28T14:30:00.000Z",
    "referenceNumber": "TXN-2025-99812",
    "paymentMethod": "Bank Transfer",
    "notes": "Term 2 settlement",
    "student": {
      "id": "cmukxswq8000donpqogzawoie",
      "studentId": "SMS-2025-0002",
      "fullName": "Liam O'Connor"
    }
  },
  "balanceInfo": {
    "totalFees": 9250.0,
    "totalPaid": 6250.0,
    "outstandingBalance": 3000.0
  }
}
```

---

## 5. Assessments & Submissions API

### `GET /api/assessments`
Retrieves all module assessments, deadlines, and aggregated submission statistics.

#### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cmuk...",
      "title": "Coursework 1: Algorithms & Data Structures",
      "moduleCode": "CS102",
      "moduleName": "Data Structures & Algorithms",
      "deadline": "2026-09-21T07:39:39.818Z",
      "isDeadlinePassed": true,
      "stats": {
        "totalSubmissions": 3,
        "lateSubmissions": 1,
        "gradedCount": 3,
        "publishedCount": 3
      },
      "submissions": [ ... ],
      "grades": [ ... ]
    }
  ]
}
```

---

### `POST /api/assessments`
Creates a new assessment assignment.

#### Request Body
```json
{
  "title": "Coursework 3: Cloud Architecture",
  "moduleCode": "CS109",
  "moduleName": "Distributed Cloud Systems",
  "deadline": "2026-11-15T23:59:00.000Z",
  "description": "Design a high-availability cloud architecture specification.",
  "programmeId": "cmukxswpt0000onpq2f462sgl",
  "totalMarks": 100,
  "academicYear": "2024/2025"
}
```

---

### `GET /api/submissions`
Lists submissions. Filterable by `assessmentId` and `studentId`.

---

### `POST /api/submissions` (Multipart File Upload)
Handles student file upload. Restricted to `.pdf` and `.docx` formats.

#### Headers
`Content-Type: multipart/form-data`

#### Form Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `file` | File (Binary) | PDF or DOCX file (e.g. `report.pdf`). |
| `studentId` | String | ID of the submitting student. |
| `assessmentId` | String | ID of the target assessment. |
| `notes` | String (Optional) | Student remarks or notes. |

#### Business Rules & Edge Cases
1. **File Type Restriction**: Rejects files not ending in `.pdf`, `.docx`, or `.doc` with HTTP `400 Bad Request`.
2. **One Submission Per Student**: Enforced via Prisma unique compound key `[studentId, assessmentId]`.
3. **Resubmission Before Deadline**: Allowed. Updates the file path, updates `submittedAt`, increments `version` count, and maintains `isLate: false`.
4. **Resubmission After Deadline**: Disallowed with HTTP `403 Forbidden`: *"The submission deadline has passed. Resubmission is only permitted before the deadline."*
5. **Initial Late Submission**: Allowed after deadline, but automatically sets `isLate: true`.

#### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cmuk...",
    "fileName": "Liam_OConnor_Algorithms.docx",
    "fileUrl": "/uploads/submissions/SMS-2025-0002_CS102_1790587428_Liam_OConnor_Algorithms.docx",
    "submittedAt": "2026-09-28T07:42:00.000Z",
    "isLate": true,
    "version": 1
  },
  "isResubmission": false,
  "isLate": true,
  "message": "Assessment submitted successfully. Note: Marked as LATE submission as deadline has passed."
}
```

---

## 6. Marksheet & Results API

### `GET /api/grades`
Retrieves entered marksheet grades.

#### Query Parameters
- `assessmentId` (Optional): Filter by assessment.
- `studentId` (Optional): Filter by student.
- `publishedOnly` (Optional, `"true"`): When `true`, returns ONLY published grades (used by Student Portal).

---

### `POST /api/grades`
Records numeric score (0–100) and automatically calculates the UK classification standard.

#### Request Body
```json
{
  "assessmentId": "cmukxswpx0003onpq50fjh02c",
  "studentId": "cmukxswq8000donpqogzawoie",
  "numericGrade": 74.5,
  "feedback": "Outstanding architectural trade-off analysis.",
  "isPublished": true
}
```

#### Classification Logic
- Numeric Grade **≥ 70**: `DISTINCTION`
- Numeric Grade **≥ 60**: `MERIT`
- Numeric Grade **≥ 40**: `PASS`
- Numeric Grade **< 40**: `FAIL`

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cmuk...",
    "numericGrade": 74.5,
    "classification": "DISTINCTION",
    "feedback": "Outstanding architectural trade-off analysis.",
    "isPublished": true,
    "publishedAt": "2026-09-28T14:40:00.000Z",
    "gradedAt": "2026-09-28T14:40:00.000Z"
  }
}
```

---

### `POST /api/grades/publish`
Toggles publication status (`isPublished: true/false`) per student, or batch publishes all graded marks for an assessment.

#### Single Student Toggle
```json
{
  "gradeId": "cmukxswr0000tonpqx6ggh68s",
  "isPublished": true
}
```

#### Batch Publish for Assessment
```json
{
  "assessmentId": "cmukxswpx0003onpq50fjh02c",
  "publishAll": true,
  "isPublished": true
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Successfully published all 4 grades for this assessment.",
  "count": 4
}
```
