ULTIMATE ENTERPRISE ADMIN PANEL PROMPT

(Suvidha Command Center – Production Grade)

Copy everything below 👇

PROMPT START

Design and generate a complete production-grade Admin Command Center frontend for a civic service system named Suvidha.

This must look like a real government municipal control room software.

Not a template.
Not a demo dashboard.
Not basic UI.
Not startup SaaS style.

Design tone:

Enterprise

Data-dense

Operational control system

Minimal but powerful

Government-grade

Structured

Clean typography

Professional alignment

Technology Stack:

React + TypeScript

Vite

TailwindCSS

Axios

React Router

Recharts

Lucide Icons

Backend Base URL:
VITE_API_URL=http://localhost:5000

Use Demo OTP system:
If phone number = 9999999999
OTP = 123456
Allow admin login without backend verification (for demo mode).

🔐 AUTH SYSTEM

Route: /login

Fields:

Phone number

OTP

Remember Device checkbox

Features:

Request OTP button

Resend timer (30 seconds)

Loading spinner

Error state

Success toast

Demo Mode:
If phone = 9999999999 and OTP = 123456
Login as:
Name: Rajesh Kumar
Role: Administrator

Store:
admin_token
admin_user

Redirect to:
/dashboard

🧱 ENTERPRISE LAYOUT

Left Sidebar (260px fixed):
Sections:

OPERATIONS

Dashboard

Tickets

Work Orders

MANAGEMENT

Staff Control

Departments

INTELLIGENCE

Analytics

Audit Logs

SYSTEM

Notifications

Settings

Sign Out

Sidebar must:

Highlight active route

Collapse option

Smooth interaction

Professional hover state

Top Header:

System status indicator (green dot: SYSTEM ONLINE)

Current date and time

Global search input

Notification icon (with badge count)

Profile dropdown

📊 DASHBOARD

Route: /dashboard

Must contain:

KPI Row (Compact professional cards):

Total Tickets

Open

In Progress

Emergency

Overdue

Resolved Today

Each card clickable and navigates to filtered ticket list.

Include seeded demo data:

Total Tickets: 128
Open: 24
In Progress: 31
Emergency: 5
Overdue: 7
Resolved Today: 12

Charts Section:

Department Distribution (Bar Chart)
Water: 32
Roads: 27
Sanitation: 19
Electricity: 24
Other: 26

Status Breakdown (Donut Chart)

Monthly Trend (Line Chart)

SLA Compliance (Gauge style chart – 86%)

Live Activity Feed (right panel):
Scrollable list with timestamps:

New ticket created

Ticket assigned

Status updated

SLA breach warning

Include realistic activity entries.

All charts must render actual demo data.

📋 TICKETS MODULE

Route: /tickets

Full data table with:

Columns:
Ticket ID
Citizen Phone
Department
Category
Priority
Status
Assigned Staff
Created Date
SLA Deadline
Actions

Include:
Search bar
Advanced Filters panel (collapsible)
Date range picker
Department filter
Status filter
Priority filter
Assigned filter

Seed 25 realistic demo tickets.

Bulk Actions:

Bulk Assign

Bulk Status Change

Bulk Export CSV

Each row:
Clickable → /tickets/:id

Actions column:

View

Assign

Change Status

Escalate

All buttons must:

Open modal

Confirm action

Show loading state

Update UI instantly

📄 TICKET DETAIL PAGE

Route: /tickets/:id

Layout:
Left: Ticket Information
Right: Action Control Panel

Show:

Ticket ID

Citizen phone

Description

Department

Priority

Status

Location

Attachments preview

SLA Countdown timer

Timeline updates

Linked Work Orders

Admin Actions:

Approve

Reject

Assign Staff

Escalate

Create Work Order

Change Priority

Each action:

Confirmation modal

Success toast

Update timeline

Reflect change immediately

👥 STAFF CONTROL

Route: /staff

Table:
Staff Name
Department
Active Tickets
Resolved Tickets
Performance %
Availability

Click row:
Open drawer panel:

Assigned tickets list

Performance graph

SLA compliance

🛠 WORK ORDERS

Route: /work-orders

Table:
Work Order ID
Linked Ticket
Assigned Staff
Status
Created Date
Completed Date

Include:
Filter by status
Filter by staff
Create Work Order modal

Seed 12 demo work orders.

📊 ANALYTICS

Route: /analytics

Charts:

Department performance

Area complaint comparison

Emergency trend

SLA compliance graph

Monthly resolution rate

Must look like serious data system.

🔔 NOTIFICATIONS

Route: /notifications

List:

Emergency Alerts

SLA Breach Alerts

Assignment Alerts

Include:
Mark as read
Mark all as read
Delete notification

Seed 10 demo alerts.

📜 AUDIT LOGS

Route: /audit-logs

Table:
Admin
Action
Target
Timestamp
IP Address

Include filters:
Admin filter
Date filter
Action type filter

Seed 20 realistic logs.

⚙ SETTINGS

Route: /settings

Include:
SLA configuration UI
Department list UI
Priority configuration UI
Notification toggle settings

Frontend working simulation only.

🎨 DESIGN REQUIREMENTS

Compact enterprise layout

No cartoon UI

No excessive rounding

Muted grey base

Blue-600 primary

Red-600 critical

Green-600 success

Yellow-600 warning

Typography:

14px base

Clean hierarchy

Tight spacing

Include:

Loading skeletons

Error states

Empty states

Confirmation dialogs

Toast notifications

Drawer components

Collapsible filters

Everything aligned perfectly.

No basic template look.

Make it look like real municipal software used in government control room.

🛡 SECURITY

Axios interceptor

JWT handling

401 redirect to login

Role-based route guard

Demo OTP bypass logic

OUTPUT REQUIREMENTS

Generate:

Full folder structure

Modular architecture

API layer

Auth hook

Layout component

Reusable table component

Reusable modal component

Complete routing

Demo data seeding system

Working navigation

All buttons functional

This must feel like a finished enterprise product.

Not a prototype.

Not a starter template.

A complete civic admin command center.