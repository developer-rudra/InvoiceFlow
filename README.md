# InvoiceFlow — Professional Invoice & Client Management System

InvoiceFlow is a production-grade, full-stack **MERN (MongoDB, Express.js, React, Node.js)** web application built for businesses and freelancers to manage clients, issue customizable invoices, dynamically compute financial totals securely on the backend, evaluate overdue payment statuses automatically, and analyze revenue metrics on an executive dashboard.

---

## 🚀 Key Features

- **Authentication & Security**: Secure User Registration and Login powered by **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
- **Multi-Tenant Data Isolation**: Every client and invoice is strictly scoped to the authenticated user ID (`req.user.id`).
- **Client Management (CRUD + Search)**: Search clients instantly by name, company, or email with MongoDB regex queries.
- **Client Deletion Safeguard**: Business rule prevents accidental deletion of clients with active invoices.
- **Invoice Management (CRUD + Filters)**: Filter by status (`Paid`, `Unpaid`, `Overdue`, `Draft`), Client ID, search query, or date range.
- **Backend Source of Truth for Calculations**: Backend independently recalculates line item amounts, subtotal, tax amount, and grand total to prevent client-side price tampering.
- **Sequential Unique Invoice Numbers**: Auto-generated sequential invoice numbers in standard business format (`INV-2026-001`).
- **Dynamic Overdue Evaluation**: Invoices with past due dates automatically evaluate to `Overdue` across list, stats, and detail APIs.
- **Executive Dashboard**: Real-time KPI metrics for Total Invoices, Total Billed Amount, Total Paid Revenue, and Outstanding Balances.
- **Bonus Capabilities**:
  - **PDF Export**: Download authentic business invoices as PDF.
  - **Print Layout**: Custom CSS `@media print` styling for native browser printing.
  - **CSV Export**: Export filtered invoice lists to `.csv` spreadsheets.
  - **Database Seeder**: Populate demo user, clients, and realistic invoices in 1 command (`npm run seed`).
  - **Automated Test Suite**: Jest unit tests validating calculation formulas and overdue date comparisons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v3 (Custom Dark Slate SaaS aesthetic)
- **Icons**: Lucide React
- **HTTP Client**: Axios (Centralized instance with JWT request/response interceptors)
- **PDF Generation**: html2canvas & jsPDF

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas & Mongoose ORM
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Validation**: express-validator middleware
- **Testing**: Jest & Supertest

---

## 📐 Architecture & Modular Pattern

The backend follows a layered separation of concerns:

```text
HTTP Request
     ↓
Route (express.Router)
     ↓
Validation Middleware (express-validator)
     ↓
Auth Middleware (JWT Bearer Token verification)
     ↓
Controller (Request parsing & HTTP response formatting)
     ↓
Service Layer (Core Business Rules, Monolithic Calculations)
     ↓
Mongoose Model (User, Client, Invoice Schemas)
     ↓
MongoDB Atlas Database
```

---

## 📂 Monorepo Folder Structure

```text
InvoiceFlow/
│
├── client/                     # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Static graphics
│   │   ├── components/
│   │   │   ├── clients/        # Client form modals & tables
│   │   │   ├── common/         # Badge, Skeleton, EmptyState, Modal
│   │   │   ├── invoices/       # Invoice forms & detail views
│   │   │   └── layout/         # Responsive AppLayout & Sidebar
│   │   ├── context/            # AuthContext for global JWT state
│   │   ├── pages/              # Login, Register, Dashboard, Clients, Invoices
│   │   ├── services/           # Axios API services (auth, client, invoice, dashboard)
│   │   ├── utils/              # Currency formatters, PDF generator, CSV exporter
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── main.jsx            # React root entry
│   │   └── index.css           # Tailwind base styles & print CSS
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/                 # Mongoose DB connection (db.js)
│   ├── controllers/            # Route handler logic (auth, client, invoice, dashboard)
│   ├── middleware/             # Auth JWT, error handler, validator check
│   ├── models/                 # Mongoose schemas (User, Client, Invoice)
│   ├── routes/                 # API endpoint routers
│   ├── services/               # Business logic & calculation services
│   ├── tests/                  # Jest unit tests (calculations, overdue logic)
│   ├── utils/                  # Calculations, overdue evaluator, invoice auto-number, seed
│   ├── validators/             # Input validation rules
│   ├── app.js                  # Express app setup & CORS configuration
│   ├── server.js               # Node server entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── .env.example
├── README.md                   # Complete documentation
└── package.json                # Monorepo root scripts
```

---

## 🔑 Environment Variables

### Root / Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string configured in `server/.env` under `MONGO_URI`.

### 1. Clone & Install Dependencies

Root directory install:
```bash
npm install
```

Server dependencies:
```bash
cd server && npm install
```

Client dependencies:
```bash
cd client && npm install
```

### 2. Populate Demo Data on MongoDB Atlas (Optional but Recommended)
Run the seed script to populate demo user, clients, and invoices on MongoDB Atlas:
```bash
npm run seed
```
Demo Credentials:
- **Email**: `demo@invoiceflow.com`
- **Password**: `password123`

### 3. Run Development Servers
From the root directory, start both client and server concurrently:
```bash
npm run dev
```

Or run individually:
- Backend Server: `npm run server` (runs on `http://localhost:5000`)
- Frontend App: `npm run client` (runs on `http://localhost:5173`)

### 4. Execute Backend Automated Tests
```bash
npm test
```

---

## 🔗 REST API Endpoints Summary

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Client Management Routes (`/api/clients`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/clients?search=...` | List clients (with search by name/company/email) | Private |
| `GET` | `/api/clients/:id` | Get client details by ID | Private |
| `POST` | `/api/clients` | Create a new client profile | Private |
| `PUT` | `/api/clients/:id` | Update client details | Private |
| `DELETE` | `/api/clients/:id` | Delete client (blocked if invoices exist) | Private |

### Invoice Management Routes (`/api/invoices`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/invoices?status=...&clientId=...&search=...` | List invoices with multi-filters | Private |
| `GET` | `/api/invoices/:id` | Get complete invoice details & line items | Private |
| `POST` | `/api/invoices` | Create invoice (recalculates totals on backend) | Private |
| `PUT` | `/api/invoices/:id` | Update invoice items/status | Private |
| `DELETE` | `/api/invoices/:id` | Delete an invoice | Private |

### Dashboard Analytics Routes (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Fetch total invoices, billed, paid, & outstanding KPIs | Private |

---

## 🧮 Important Business Logic Explanations

### 1. Invoice Calculation Formula (Backend Source of Truth)
Frontend totals can be manipulated in web tools. Therefore, the backend recalculates monetary totals independently:

$$\text{lineAmount} = \text{quantity} \times \text{rate}$$
$$\text{subtotal} = \sum \text{lineAmount}$$
$$\text{taxAmount} = \frac{\text{subtotal} \times \text{taxPercentage}}{100}$$
$$\text{grandTotal} = \max(0, \text{subtotal} + \text{taxAmount} - \text{discount})$$

Monetary values are rounded using floating-point safe rounding: `Math.round((val + Number.EPSILON) * 100) / 100`.

### 2. Dynamic Overdue Logic
Rather than requiring manual status updates when an invoice becomes overdue, `evaluateInvoiceStatus()` checks if `today > dueDate` AND `status !== 'Paid'`. This guarantees that list queries, dashboard aggregations, and invoice views always display the accurate overdue status.

### 3. Client Deletion Safeguard Decision
To prevent orphaned invoices or broken billing histories, `deleteClient()` checks `Invoice.countDocuments({ client: clientId })`. If invoices exist, deletion is aborted and returns HTTP 400 Bad Request with message: `"This client cannot be deleted because invoices exist for this client."`

---
