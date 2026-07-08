# 🏨 Hostel Management System — Complete Project Documentation

**A full-stack, real-time hostel management platform built with the MERN stack.**  
This project solves the operational chaos of managing a student hostel — room allocation, fee tracking, complaint resolution, leave management, visitor security, staff coordination, and administrative reporting — all in one unified, real-time dashboard with Socket.io-powered live updates, role-based access control, and a modern Tailwind CSS UI.

---

## Table of Contents

1. [The Problem: Why We Built This](#1-the-problem-why-we-built-this)
2. [Our Solution: Feature Deep Dive](#2-our-solution-feature-deep-dive)
3. [System Architecture](#3-system-architecture)
4. [Complete Data Model Reference](#4-complete-data-model-reference)
5. [API Reference with Examples](#5-api-reference-with-examples)
6. [Frontend Component Architecture](#6-frontend-component-architecture)
7. [Real-Time Engine: Socket.io Deep Dive](#7-real-time-engine-socketio-deep-dive)
8. [Authentication & Security Model](#8-authentication--security-model)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [User Flows: End-to-End Walkthroughs](#10-user-flows-end-to-end-walkthroughs)
11. [Edge Cases & How We Handle Them](#11-edge-cases--how-we-handle-them)
12. [Database Indexing & Performance](#12-database-indexing--performance)
13. [Tech Stack & Rationale](#13-tech-stack--rationale)
14. [Development Decisions Log](#14-development-decisions-log)
15. [Project Structure: Every File Explained](#15-project-structure-every-file-explained)
16. [Quick Start Guide](#16-quick-start-guide)
17. [Deployment Guide](#17-deployment-guide)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. The Problem: Why We Built This

### 1.1 The Real-World Context

Student hostels are micro-communities housing hundreds of students under one roof. In most developing countries, hostels are managed by a small administrative staff — a warden, a few clerks, security guards, and maintenance workers — who juggle dozens of overlapping responsibilities using paper registers, spreadsheets, WhatsApp messages, and sticky notes.

The result is predictable: information gets lost, tasks fall through the cracks, and everyone operates with incomplete data.

### 1.2 The Seven Core Problems

#### Problem 1: Room Management is a Maze of Paper Registers

**Scenario**: It is the start of the academic year. 200 new students need to be assigned to rooms across 4 floors. The warden has a printed list of rooms and a stack of admission forms. Every time a student is assigned, the warden manually writes the name in a register. By the end of the day, the register is messy, some names are misspelled, and two students have been assigned to the same bed by accident.

**The deeper issues**:
- No real-time view of room availability — the warden must physically walk to check if a room is free.
- No occupancy tracking — answering "How many students are in Room 302?" requires flipping through pages.
- Room inventory is not tracked — when a student checks out and claims "there were only 1 chair when I moved in," there is no record to verify against.
- Transfer requests are verbal or on paper slips that get lost.

#### Problem 2: Fee Collection is a Monthly Accounting Nightmare

**Scenario**: The accountant sits down at the end of every month with a thick register and a calculator. They must manually check which students have paid and which have not, then cross-reference with bank deposit slips, cash entries, and online transfer confirmations scattered across different sources.

**The deeper issues**:
- No centralized payment history — finding if "Student X paid for September" requires searching through months of entries.
- Receipts are handwritten carbon copies that fade over time.
- No late fee calculation — some students pay weeks late without penalty because nobody tracks due dates.
- Students have no self-service way to view their payment status. They must visit the accountant in person.
- End-of-month reports require hours of manual data entry into Excel.

#### Problem 3: Complaints Go into a Black Hole

**Scenario**: A student's bathroom faucet has been leaking for three weeks. They told the warden on Day 1, who told the maintenance staff on Day 2, but the maintenance staff forgot because they were handling a more urgent issue on another floor. The student is frustrated. The warden is frustrated. The maintenance staff is overworked. Nobody has a clear picture of what is pending, what is in progress, and what is resolved.

**The deeper issues**:
- No structured way to submit complaints — verbal reporting means no written record.
- No status tracking — once a complaint is reported, there is no way to know if it has been seen, assigned, or fixed.
- No accountability — if a complaint takes 3 weeks to resolve, who is responsible?
- No feedback loop — when a complaint is resolved, there is no way for the student to say "the fix was temporary, it is broken again."
- No data for improvement — management cannot answer "what are the most common complaints in this hostel?" because no data is collected.

#### Problem 4: Leave & Outpass is a Paperwork Bottleneck

**Scenario**: It is Friday afternoon. A student needs to leave for a family emergency. The warden is not in their office. The student waits for 45 minutes. When the warden returns, they manually write a leave slip with dates and sign it. The student leaves. If a fire alarm goes off that night, nobody in charge knows which students are actually in the building.

**The deeper issues**:
- No centralized record of who is in the hostel vs. who is out at any given time — a safety hazard.
- No guardian contact information attached to leave records — if a student does not return on time, the hostel has no way to reach their family.
- Leave applications are paper slips that can be lost or forged.
- No approval workflow — there is no audit trail of who approved which leave and when.
- Auto-expiry is not tracked — students who went home for a week and never came back remain in the system as "on leave."

#### Problem 5: Visitor Security is a Paper Register

**Scenario**: A security guard sits at the gate with a spiral notebook. Every visitor signs in with their name, contact, and purpose. The notebook fills up every 2-3 months and is stored in a cupboard. If a theft occurs and the police ask for visitor records from 6 months ago, the relevant notebook might have been misplaced.

**The deeper issues**:
- Paper registers wear out, get lost, or pages get torn out.
- No real-time view of who is currently inside the premises — if there is an emergency, security has to scan through pages to find visitors who have not signed out.
- No photo identification attached to visitor entries.
- No way to search for a specific visitor across dates.

#### Problem 6: Communication is Fragmented and Unreliable

**Scenario**: The water supply will be cut for maintenance tomorrow from 10 AM to 2 PM. The warden prints a notice and pins it on the physical notice board. Half the students do not see it because they do not pass by the board that day. The next morning, students complain that they were not informed.

**The deeper issues**:
- Physical notice boards require students to proactively check them.
- Urgent announcements (security alerts, emergencies) cannot be pushed to students in real time.
- No way to target specific audiences — a notice meant only for staff is also read by students.
- No record of when a notice was posted, by whom, or whether it has expired.
- No priority system — a notice about a lost water bottle has the same visual weight as a security alert.

#### Problem 7: Leadership Has No Real-Time Visibility

**Scenario**: The hostel director wants to know: How many students are currently in the hostel? How many rooms are empty? How much revenue has been collected this month? How many complaints are pending? To answer these questions, they must call the warden, who must check registers, call back later, and hope the numbers are accurate.

**The deeper issues**:
- No real-time dashboard showing key metrics at a glance.
- Decision-making is based on stale, manually-compiled data that is often wrong.
- No historical trend data — "Is occupancy going up or down compared to last year?"
- No audit trail — if a problem occurs, there is no way to trace what happened, who did what, and when.

### 1.3 The Cost of These Problems

| Problem | Direct Impact | Ripple Effect |
|---------|---------------|---------------|
| Double-booked rooms | Student dissatisfaction | Reputation damage |
| Lost fee records | Revenue leakage | Audit non-compliance |
| Unresolved complaints | Student frustration | High turnover |
| No leave tracking | Safety unknown | Legal liability |
| Missing visitor logs | Security breach | Police complications |
| Missed announcements | Student inconvenience | Operational chaos |
| No data visibility | Poor decisions | Wasted resources |

These are not hypothetical. Every one of these scenarios plays out daily in hostels around the world.

---

## 2. Our Solution: Feature Deep Dive

### 2.1 Role-Based Access Control (RBAC)

The system recognizes **four distinct roles**, each with a carefully scoped set of permissions:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SYSTEM ARCHITECTURE                             │
├─────────────┬─────────────┬─────────────┬───────────────────────────┤
│   ADMIN     │    STAFF     │   STUDENT   │     PARENT (Planned)      │
│  (God mode) │ (Operators) │ (Residents) │ (View-only)               │
├─────────────┼─────────────┼─────────────┼───────────────────────────┤
│ Dashboard   │ Dashboard   │ Dashboard   │ Ward's Dashboard          │
│ All CRUD    │ Students R  │ Profile     │ Fee Status (R)            │
│ Staff Mgmt  │ Rooms R+W   │ Complaints  │ Complaints (R)            │
│ Audit Log   │ Complaints  │ Leaves      │ Notices (R)               │
│ Reports     │ Leaves R+W  │ Payments R  │                           │
│ Settings    │ Visitors W  │ Notices R   │                           │
│             │ Notices W  │ Notifications│                          │
└─────────────┴─────────────┴─────────────┴───────────────────────────┘
```

**Implementation detail**: Role checks happen at two levels:

1. **Middleware level** (`backend/middleware/auth.js`): The `authorize(...roles)` middleware checks `req.user.role` before the controller is reached. If the role is not in the allowed list, a 403 response is returned immediately.

2. **Controller level**: For resources that are role-scoped (like complaints), the controller adds a filter such as `if (req.user.role === 'student') { query.student = student._id }` to ensure students can only see their own data.

This defense-in-depth approach ensures that even if a route is misconfigured, the controller still enforces access boundaries.

### 2.2 Dashboard — The Command Center

#### What It Shows

The dashboard is split into three sections:

**Section 1: Top Stats Row (6 StatCards)**

Each StatCard is a reusable component (`frontend/src/components/common/StatCard.jsx`) that accepts `title`, `value`, `icon`, `color`, `subtitle`, and optional `trend`.

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Rooms        │ │ Revenue      │ │ Pending      │ │ Occupancy    │ │ Staff        │
│ Students     │ │ 8 total      │ │ ₹18,000      │ │ Complaints   │ │ 25%          │ │ 1 active     │
│ 2 active     │ │ 2 occupied   │ │ 4 payments   │ │ 0            │ │ 2/8 rooms    │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Section 2: Charts (2-column grid)**

- **Left: Revenue Line Chart** — Shows the last 6 months of revenue. Built with Recharts `<LineChart>`. Data is aggregated server-side using MongoDB's `$group` aggregation pipeline, grouped by `{year, month}`.
- **Right: Room Occupancy Bar Chart** — Shows room types (single, double, triple, dormitory) with two bars per type: Total rooms and Occupied rooms.

**Section 3: Activity & Alerts (2-column grid)**

- **Left: Real-Time Activity Feed** — The last 20 actions from the `ActivityLog` collection, displayed as a scrollable list. Each entry shows: user avatar/name, action type (color-coded), resource name, and timestamp. New entries appear without page refresh via Socket.io.
- **Right: Upcoming Checkouts & Pending Dues** — Shows students whose checkout date is within the next 7 days, and payments with status "pending."

#### Data Flow for Dashboard

```
1. Page loads → useEffect triggers fetchData()
2. fetchData() makes 5 parallel API calls:
   → GET /api/dashboard/stats
   → GET /api/dashboard/occupancy
   → GET /api/dashboard/revenue
   → GET /api/dashboard/activity
   → GET /api/dashboard/upcoming
3. Each response updates its respective state variable
4. Socket.io listeners are registered for real-time events
5. When an event fires (e.g., 'student:checkin'), fetchData() runs again
   → All 5 API calls are re-fired
   → The entire dashboard updates
```

This "refetch everything" approach is simpler than incremental state updates and ensures consistency. For a dashboard updated no more than a few times per minute, this is efficient enough.

**Server-side aggregation for stats**: The `getStats` controller runs 10 database queries/aggregations in parallel using `Promise.all`. This includes counts and sums across 5 collections (Student, Room, Payment, Staff, Complaint).

### 2.3 Student Management

#### The Student Lifecycle

```
Registration → Room Allocation → Check-in → (Periodic Payments)
→ (Complaints) → (Leave Requests) → Check-out → Archive
```

#### CRUD Operations

| Operation | Frontend | Backend | Database |
|-----------|----------|---------|----------|
| Create | StudentForm modal | studentController.createStudent | Creates User + Student documents |
| Read | Table with search | studentController.getStudents | `Student.find().populate('user').populate('room')` |
| Update | StudentForm modal (edit mode) | studentController.updateStudent | `Student.findByIdAndUpdate` + conditional `User.findByIdAndUpdate` |
| Delete (Deactivate) | ConfirmDialog | studentController.deleteStudent | Sets `User.isActive = false`, `Student.status = 'checkedOut'`, pulls from Room |

#### Key Design Decisions

**1. Dual-record creation**: When a student is created, two database documents are created atomically: a `User` (with `role: 'student'` and hashed password) and a `Student` (with domain-specific fields). This separation follows the Single Responsibility Principle — the User model handles authentication, the Student model handles hostel-specific data.

**2. Soft delete, not hard delete**: When a student is "deleted," the document is not removed from the database. Instead:
   - `User.isActive` is set to `false` (prevents login)
   - `Student.status` is set to `checkedOut`
   - The student is removed from their room's `occupants` array
   
   This preserves historical data (payments, complaints, leaves remain linked) and allows for reactivation if needed.

**3. Checkout as a separate endpoint**: `PUT /api/students/:id/checkout` is distinct from `DELETE` because checking out a student is a routine operation that happens at the end of every semester, whereas deletion is exceptional. The checkout endpoint:
   - Sets `checkOutDate` to current date
   - Sets `status` to `checkedOut`
   - Removes student from room
   - If room has no more occupants, sets room `status` to `available`

**4. Bulk import for initial setup**: `POST /api/students/bulk` accepts an array of `{name, email, studentId, phone}` objects. This is designed for the start-of-year scenario when 200+ students need to be registered at once. The frontend provides a textarea for CSV-style input (one student per line), parsed client-side by splitting on commas and newlines.

**5. Student detail page aggregates data from 3 collections**: When viewing a single student, the frontend makes 3 parallel API calls:
   - `GET /api/students/:id` — student profile
   - `GET /api/payments/student/:studentId` — payment history
   - `GET /api/leaves?studentId=:id` — leave history
   
   The page has 3 tabs: Overview (payment summary, stats), Payments (full table), Leaves (full table).

### 2.4 Room Management

#### Room Card Design

Each room is rendered as a **card** (not a table row) because:
- Rooms are physical spaces that benefit from visual representation.
- A card can show occupancy level (progress bar), status (badge), room type (badge), and occupants (list) in a compact format.
- Cards are more intuitive for the allocate/vacate workflow.

```
┌─────────────────────────────────┐
│ 🛏️ Room 101    [⋮ menu]         │
│ [available] [single] [Floor 1]  │
│                                  │
│ Occupancy   Rent                 │
│ 0/1         ₹5,000               │
│ ████████░░░░░░░░░░░░░░ 0%         │
│                                  │
│ (No occupants)                   │
└─────────────────────────────────┘
```

#### Allocation Workflow

```
1. Admin clicks "Allocate" on a room card
2. Modal opens with a dropdown of unassigned students
3. Admin selects a student and clicks "Allocate"
4. Backend:
   a. Checks room status ≠ 'maintenance'
   b. Checks room.occupants.length < room.capacity
   c. Checks student not already in this room
   d. If student has a previous room, removes them from it
   e. Pushes student._id to room.occupants
   f. Sets room.status = 'occupied'
   g. Sets student.room = room._id
   h. Sets student.checkInDate = new Date()
   i. Sets student.status = 'active'
   j. Logs activity
   k. Returns populated room
5. Frontend updates the room card with new occupant info
6. Socket.io broadcasts 'room:statusChange' to all connected clients
```

#### Vacation Workflow

```
1. Admin clicks "Vacate" on an occupant within a room card
2. Confirmation dialog appears
3. On confirm:
   a. Removes student._id from room.occupants
   b. If room.occupants.length === 0, sets room.status = 'available'
   c. Sets student.room = null
   d. Sets student.status = 'checkedOut'
   e. Sets student.checkOutDate = new Date()
```

#### Room Transfer

The `RoomTransfer` model tracks the complete lifecycle of a transfer request:

```
Student → Requests transfer to Room B
         → Transfer record created: { fromRoom: A, toRoom: B, status: 'pending' }
         → Admin reviews and approves
         → System executes:
             a. Removes student from Room A's occupants
             b. Adds student to Room B's occupants
             c. Updates Student.room to Room B
             d. Sets Transfer.status = 'approved'
             e. Updates Room A status if now empty
             f. Updates Room B status
```

This prevents the race condition where two admins approve two different transfers for the same student simultaneously.

#### Room Inventory

Each room has an `inventory` array:
```javascript
inventory: [{
  item: String,       // e.g., "Bed", "Chair", "Desk", "Fan", "Wardrobe"
  quantity: Number,   // default: 1
  condition: String,  // enum: ['good', 'needsRepair', 'replaced']
}]
```

This serves as the **check-in/check-out handover record**. When a student moves in, the admin can note the condition of each item. When they move out, the admin can verify against the original record to determine if anything was damaged.

#### Real-Time Room Status

When any room operation occurs (allocate, vacate, transfer, status change), a `room:statusChange` Socket.io event is emitted. The Rooms page listens for this event and re-fetches the room list. This means:
- If two admins are managing rooms simultaneously, both see up-to-date availability.
- If a student is allocated while the admin is looking at rooms, the card updates instantly.

### 2.5 Payment & Fee Management

#### Receipt Number Generation

Receipt numbers follow the format: `RCP-YYMMDD-RRRR`

```
RCP-250901-0001
│    │      │
│    │      └── Random 4-digit number (padded)
│    └───────── Date (year: 25, month: 09, day: 01)
└────────────── Prefix "RCP"
```

This format was chosen because:
- It is human-readable and can be communicated verbally.
- It is chronologically sortable (by date prefix).
- It provides enough randomness (9999 variations per day) to avoid collisions.
- It works offline — no auto-increment counter needed.

#### Payment Status Flow

```
When created: status is set by the recorder (usually 'paid')

Over time:
  'paid'     → Payment successfully recorded
  'pending'  → Student has not paid for this period
  'overdue'  → Past due date without payment

The Dues endpoint: GET /api/payments/dues
  Returns all payments where status IS 'pending' OR 'overdue'
  Sorted by newest first
```

#### Late Fee Calculation

The `Payment` schema has both `amount` (base rent) and `lateFee` (penalty) fields, with a computed `totalAmount`:

```javascript
paymentSchema.pre('save', function (next) {
  this.totalAmount = (this.amount || 0) + (this.lateFee || 0);
  next();
});
```

This is a Mongoose **pre-save hook** that runs before every `save()` operation. It automatically calculates the total so that the application code never needs to remember to add `amount + lateFee`.

#### Printable Receipt

The print feature (`PaymentsPage.jsx` — `handlePrint` function) opens a new browser window with a styled HTML document containing:
- Hostel name (header)
- Receipt number
- Student name
- Amount paid (bold, prominent)
- Payment type (rent, deposit, fine, other)
- Period (month/year)
- Payment date
- Payment method
- Notes

The new window calls `window.print()` immediately and then `window.close()`. This approach was chosen over PDF generation because:
- No additional libraries needed (pure HTML + CSS).
- Works offline (no server round trip).
- The browser's native print dialog allows the user to save as PDF, print, or cancel.
- Receipt styling is simple enough that HTML/CSS is sufficient.

#### Dues Dashboard

The `Dues` feature is a toggle-able panel on the Payments page that shows all pending and overdue payments at a glance:

```javascript
// The dues query (server-side):
Payment.find({
  status: { $in: ['pending', 'overdue'] },
  $or: [
    { year: { $lt: currentYear } },
    { year: currentYear, month: { $lte: currentMonth } },
  ],
})
```

This ensures that only genuinely outstanding payments are shown — if it is July 2026, a payment for "September 2025" that is still pending is clearly overdue.

### 2.6 Complaint Management

#### State Machine

```
             ┌──────────┐
             │  PENDING  │
             └────┬─────┘
                  │
          ┌───────┴───────┐
          v               v
    ┌──────────┐    ┌──────────┐
    │IN PROGRESS│    │ REJECTED │
    └────┬─────┘    └──────────┘
         │
         v
    ┌──────────┐
    │ RESOLVED │
    └──────────┘
         │
         v
    ┌──────────┐
    │ FEEDBACK │  ← Student rates the resolution
    └──────────┘
```

Each transition is handled by the `updateComplaintStatus` controller, which:
1. Updates the `status` field
2. If `status === 'resolved'`, sets `resolvedAt = new Date()` and `resolvedBy = req.user._id`
3. If the student associated with the complaint has a user, creates a notification
4. Emits a Socket.io event (`complaint:statusChange`) so the student sees the update in real time

#### Categories

Seven predefined categories cover the majority of hostel complaints:
- `plumbing` — Leaking pipes, clogged drains, broken toilets
- `electrical` — Faulty wiring, broken switches, power outages
- `furniture` — Broken chairs, wobbly desks, damaged cupboards
- `cleanliness` — Unclean common areas, pest infestation, trash issues
- `noise` — Loud music, late-night disturbances, arguments
- `security` — Suspicious activity, broken locks, lighting issues
- `other` — Anything not covered above

Categories are used for filtering complaints on the frontend and routing complaints to the appropriate staff.

#### Feedback & Rating

After a complaint is resolved, the student can:
1. Rate the resolution from 1-5 stars (displayed as ★★★★★)
2. Leave a text comment

This creates an **accountability loop**:
- Staff know their work quality is being measured.
- Management can identify staff members who consistently receive low ratings.
- Students feel heard and valued.

#### Real-Time Alert

When a student submits a complaint, the server:
1. Saves the complaint to the database
2. Emits `complaint:new` via Socket.io with the complaint data
3. Any admin/staff logged in receives a **browser toast** (via `react-hot-toast`) and their **notification bell badge increments**

This ensures that complaints are seen within seconds, not days.

### 2.7 Leave & Outpass System

#### Request Lifecycle

```
Student fills form:
  - From Date (date picker)
  - To Date (date picker)
  - Reason (textarea)
  - Destination (destination address)
  - Guardian Contact (emergency phone)

→ LeaveRequest created with status: 'pending'
→ Admin/Staff sees the request in the Leaves page
→ Admin clicks "Approve" or "Reject"
→ If approve:
    - Status → 'approved'
    - Student receives notification
  If reject:
    - Status → 'rejected'
    - Remarks are captured
    - Student receives notification with remarks

→ On the leave end date, the system marks it 'expired'
```

#### Safety Considerations

The leave module addresses a critical safety concern: **knowing who is in the building at any given time**.
- The admin dashboard can show all students currently on leave.
- Each leave record includes guardian contact information.
- The leave dates are validated: `toDate` must be after `fromDate`, and both must be in the future.

#### Auto-Expiry

Leaves are marked as 'expired' when their `toDate` is in the past and status is 'approved'. This ensures the dashboard always shows the current state accurately. A production enhancement would be a `node-cron` job that runs daily to auto-expire past leaves.

### 2.8 Digital Visitor Log

#### Entry Recording

When a visitor arrives at the gate:

```
Security opens Visitors page → Clicks "New Visitor"
→ Fills: Name*, Contact, Vehicle, Purpose*, Visiting Room
→ Submits → System creates VisitorLog with:
    - inTime: now (auto)
    - passNo: auto-generated (e.g., PASS-00123)
    - recordedBy: current user (security guard)
→ Visitor is now logged as "inside"
```

#### Exit Recording

When the visitor leaves:

```
Security finds the visitor entry in the table
→ Clicks the checkout button (only visible for visitors without outTime)
→ System sets outTime = now
→ Visitor is now logged as "departed"
```

#### Daily View

The page defaults to showing today's visitors (`date = new Date().toISOString().split('T')[0]`). The security guard can:
- See at a glance how many visitors have come today.
- See which visitors are still inside (no outTime → green "Inside" badge).
- Search by visitor name, contact, or pass number.
- Select a different date to view historical entries.

#### Pass Number Generation

```javascript
const generatePassNo = () => {
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `PASS-${rand}`;
};
```

Format: `PASS-XXXXX` where X is a random 5-digit number. This is printed on a physical pass that the visitor carries while inside the premises.

### 2.9 Notice Board & Announcements

#### Priority System

| Priority | Color | Behavior |
|----------|-------|----------|
| Low | Ghost (subtle) | Normal display |
| Normal | Info (blue) | Normal display |
| High | Warning (yellow) | Normal display |
| Urgent | Error (red) + red border | Normal display + **browser toast to all logged-in users** |

The urgent toast is implemented via Socket.io:

```javascript
// Server (noticeController.js)
if (notice.priority === 'urgent') {
  const io = getIO();
  io.emit('announcement:urgent', { notice });
}
```

The client listens for this event in the `Navbar.jsx` and shows a toast via `react-hot-toast`.

#### Target Audience

Notices can be targeted to:
- `all` — Everyone sees it
- `students` — Only users with role 'student'
- `staff` — Only users with role 'admin' or 'staff'

#### Expiry

Notices have an optional `expiresAt` field. Notices past their expiry date can be filtered out (the API supports `?isActive=true` to return only non-expired notices).

### 2.10 Notification Center

#### Architecture

```
Event occurs (complaint filed, payment recorded, leave approved)
       │
       v
createNotification() utility function:
  1. Creates a Notification document in MongoDB
     { user, type, title, message, link, isRead: false }
  2. Emits 'notification:new' via Socket.io to the specific user's room
     io.to(`user:${userId}`).emit('notification:new', notification)
       │
       v
Client receives event:
  1. Navbar re-fetches unread count
  2. Bell badge updates
  3. (Optional) Toast notification appears
```

#### Why Store in MongoDB?

Socket.io's in-memory events are ephemeral. If a user is offline when a notification is sent, they miss it. By storing notifications in MongoDB:
- Notifications persist across sessions and browser restarts.
- When a user logs in, they see all notifications they missed.
- We can query, filter, and paginate notification history.
- We can implement "mark all as read" as a bulk database operation.

#### Unread Count

The unread count is fetched from `GET /api/notifications/unread-count`:

```javascript
Notification.countDocuments({ user: req.user._id, isRead: false });
```

This is called:
1. On initial page load (via `fetchUnreadCount`)
2. Every 30 seconds (via `setInterval`)
3. On every Socket.io `notification:new` event

### 2.11 Staff Management

Staff management is admin-only and covers:
- **CRUD**: Create, read, update, soft-delete staff members.
- **Designations**: warden, cleaner, security, maintenance, admin, accountant.
- **Shifts**: morning, evening, night, general.
- **Duties**: An array of `{day, shift, area}` assignments.
- **Salary tracking**: Monthly salary stored for payroll reference.
- **Staff ID**: Unique identifier (e.g., `STF001`), separate from MongoDB `_id`.

Creating a staff member creates both a `User` (with `role: 'staff'`) and a `Staff` record, mirroring the student creation pattern.

### 2.12 Activity Audit Log

#### What Gets Logged

Every controller that modifies data calls `logActivity()`:

```javascript
await logActivity({
  user: req.user._id,
  action: 'create',        // 'create' | 'update' | 'delete' | 'login' | 'checkout' | 'allocate'
  resource: 'student',     // 'student' | 'room' | 'payment' | 'complaint' | 'notice' | 'staff'
  resourceId: student._id,
  details: { studentId, name },  // Contextual data (varies by action)
  ip: req.ip,
});
```

#### Immutability

The `ActivityLog` model has **no update or delete routes**. Once written, a log entry is permanent. This is enforced at the API level:
- The `routes/audit.js` only exposes `GET /`
- No PUT, PATCH, or DELETE routes are defined for audit logs

#### Viewing

The Audit Log page (`AuditLogPage.jsx`) provides:
- **Filters by action**: create, update, delete, login, checkout, allocate
- **Filters by resource**: student, room, payment, complaint, notice, staff
- **Pagination**: 30 entries per page
- **Color coding**: Each action type has a distinct color (create = green, delete = red, etc.)

### 2.13 Reports & Excel Exports

#### Export Architecture

```javascript
// Server (exportController.js)
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Students');

// Define columns with headers and widths
sheet.columns = [
  { header: 'Student ID', key: 'studentId', width: 15 },
  { header: 'Name', key: 'name', width: 25 },
  // ...
];

// Add data rows
students.forEach(s => {
  sheet.addRow({ studentId: s.studentId, name: s.user?.name, ... });
});

// Set response headers and send
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
await workbook.xlsx.write(res);
res.end();
```

Three reports are available:
1. **Students** — ID, name, email, phone, room, status, check-in date
2. **Payments** — Receipt no, student, amount, type, status, date. Filterable by date range
3. **Complaints** — Student, category, status, date. Filterable by status

#### Why ExcelJS?

`exceljs` was chosen over alternatives because:
- It supports styled cells (headers with bold), column widths, and auto-filters.
- It generates proper `.xlsx` files (not CSV), which open natively in Excel, Google Sheets, LibreOffice.
- It does not require Microsoft Excel to be installed (pure Node.js).

### 2.14 Global Search (Ctrl+K)

#### Keyboard Shortcut

The global search is triggered by `Ctrl+K` (or `Cmd+K` on macOS). This is registered in `Navbar.jsx`:

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setShowSearch(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### Search UI

When triggered, a modal overlay appears with:
- A prominent search input (auto-focused)
- A search icon
- An "ESC" key hint badge
- Results dropdown below the input

#### Search Implementation

The search queries the backend:

```
GET /api/students?search=<query>&limit=5
```

The backend does a regex search on `studentId`:

```javascript
if (search) {
  query.$or = [
    { studentId: { $regex: search, $options: 'i' } },
  ];
}
```

Results are rendered as clickable items showing: User avatar (initial letter), Name, Student ID, room number. Clicking navigates to `/students/:id`.

### 2.15 Dark Mode

#### Implementation

Dark mode uses daisyUI's built-in theme system:

```javascript
// ThemeContext.jsx
const toggleTheme = () => { setDarkMode(prev => !prev); };

useEffect(() => {
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
}, [darkMode]);
```

The `data-theme` attribute on `<html>` tells daisyUI which theme variables to use. All daisyUI components (`btn`, `card`, `input`, `badge`, `table`, etc.) automatically adapt because they use CSS variables that change with the theme.

#### Persistence

The preference is stored in `localStorage`. On page load, the initial state is read from `localStorage`. The preference survives browser closures with no server-side persistence needed.

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React Application (Vite)                   │   │
│  │                                                              │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │  Pages  │  │Component │  │ Services │  │   Contexts    │ │   │
│  │  │  (16)   │  │  (12)    │  │   (11)   │  │  (3 providers)│ │   │
│  │  └─────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │              Axios HTTP Client                          │  │   │
│  │  │  - Base URL: '' (same origin via Vite proxy)            │  │   │
│  │  │  - withCredentials: true (sends cookies)                │  │   │
│  │  │  - Response interceptor: auto-redirect on 401           │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │           Socket.io Client                              │  │   │
│  │  │  - Connects after auth                                  │  │   │
│  │  │  - Emits 'join' with userId                             │  │   │
│  │  │  - Listens for real-time events                         │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Vite Dev Server Proxy  │
              │  /api → localhost:5000  │
              │  /uploads → localhost:5000  │
              │  /socket.io → ws://localhost:5000  │
              └────────────┬────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────────┐
│                      BACKEND (Express + Socket.io)                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   HTTP Server (port 5000)                     │   │
│  │                                                              │   │
│  │  Middleware Stack:                                            │   │
│  │    cors → express.json → cookieParser → morgan               │   │
│  │    → auth (on protected routes) → authorize (on admin routes)│   │
│  │    → controllers → errorHandler                              │   │
│  │                                                              │   │
│  │  Route Groups:                                               │   │
│  │    /api/auth         → 5 endpoints                           │   │
│  │    /api/students     → 7 endpoints                           │   │
│  │    /api/rooms        → 8 endpoints                           │   │
│  │    /api/payments     → 6 endpoints                           │   │
│  │    /api/complaints   → 4 endpoints                           │   │
│  │    /api/leaves       → 3 endpoints                           │   │
│  │    /api/visitors     → 3 endpoints                           │   │
│  │    /api/notices      → 4 endpoints                           │   │
│  │    /api/notifications→ 4 endpoints                           │   │
│  │    /api/staff        → 4 endpoints                           │   │
│  │    /api/dashboard    → 5 endpoints                           │   │
│  │    /api/transfers    → 3 endpoints                           │   │
│  │    /api/exports      → 3 endpoints                           │   │
│  │    /api/uploads      → 2 endpoints                           │   │
│  │    /api/audit        → 1 endpoint                            │   │
│  │    ─────────────────────────────────────                     │   │
│  │    Total: 14 route modules, 62+ endpoints                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Socket.io Server                            │   │
│  │  - Attached to the same HTTP server                           │   │
│  │  - CORS configured for client origin                          │   │
│  │  - On connection: client joins `user:${userId}` room          │   │
│  │  - Events emitted by controllers:                             │   │
│  │    • notification:new      → to specific user                 │   │
│  │    • complaint:new         → broadcast (all admins)           │   │
│  │    • complaint:statusChange → broadcast                       │   │
│  │    • announcement:urgent   → broadcast (all)                  │   │
│  │    • student:checkin       → broadcast (all)                  │   │
│  │    • student:checkout      → broadcast (all)                  │   │
│  │    • payment:received      → broadcast (all)                  │   │
│  │    • room:statusChange     → broadcast (all)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MongoDB (via Mongoose)                     │   │
│  │  - 12 models, each in its own file                           │   │
│  │  - Connection via mongoose.connect()                         │   │
│  │  - Pre-save hooks (password hashing, totalAmount calc)       │   │
│  │  - Virtual fields (room.availableSlots)                      │   │
│  │  - Population (Mongoose's JOIN equivalent)                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request/Response Lifecycle

```
Client Action
    │
    ▼
React Component (e.g., StudentsPage)
    │
    ▼
Service function (e.g., getStudents() from studentService.js)
    │
    ▼
Axios instance (api.js)
    ├── withCredentials: true (sends JWT cookie)
    ├── interceptors: 401 → redirect to /login
    │
    ▼
Vite Proxy (dev) or Nginx (prod)
    │
    ▼
Express Middleware Stack:
    ├── cors() → Allows cross-origin with credentials
    ├── express.json() → Parses JSON body
    ├── cookieParser() → Parses JWT cookie
    ├── morgan() → Logs request
    │
    ▼
auth middleware (protect):
    ├── Reads cookie 'jwt'
    ├── Verifies JWT with jsonwebtoken
    ├── Finds user by decoded.id
    ├── Attaches user to req.user
    │
    ▼
authorize middleware (if applicable):
    ├── Checks req.user.role against allowed roles
    ├── Returns 403 if not authorized
    │
    ▼
Controller function (e.g., studentController.getStudents):
    ├── Extracts query params
    ├── Builds MongoDB query
    ├── Executes query with .find().populate().sort()
    ├── Returns JSON response { success: true, data: [...] }
    │
    ▼
Response flows back through errorHandler (if error occurred)
    │
    ▼
Axios receives response → React component updates state → UI re-renders
```

---

## 4. Complete Data Model Reference

### 4.1 User

```javascript
{
  _id: ObjectId,
  name: String,               // Required, trimmed
  email: String,              // Required, unique, lowercase, trimmed
  password: String,           // Required, min 6 chars, bcrypt-hashed
  role: String,               // enum: ['admin', 'staff', 'student', 'parent'], default: 'student'
  phone: String,              // Default: ''
  photo: String,              // URL to uploaded photo, default: ''
  isActive: Boolean,          // Default: true
  emailVerified: Boolean,     // Default: false
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**: `email` (unique), `role`

**Pre-save Hook**: If `password` is modified, hash it with bcrypt (salt rounds: 12).

**Methods**:
- `comparePassword(candidate)` — Returns boolean after bcrypt comparison
- `toJSON()` — Removes `password` field from serialized output

### 4.2 Student

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref → User (required)
  studentId: String,          // Required, unique (e.g., "STU001")
  dateOfBirth: Date,
  gender: String,             // enum: ['male', 'female', 'other']
  address: String,
  guardian: {
    name: String,
    phone: String,
    email: String,
    relation: String,
  },
  emergencyContact: String,
  room: ObjectId,             // Ref → Room (nullable)
  checkInDate: Date,
  checkOutDate: Date,
  status: String,             // enum: ['active', 'checkedOut'], default: 'active'
  documents: [{ name: String, url: String }],
  createdAt: Date,
  updatedAt: Date,
}
```

**Populations**: `user` (name, email, phone, photo), `room` (roomNumber, floor, roomType, rentPerMonth)

### 4.3 Room

```javascript
{
  _id: ObjectId,
  roomNumber: String,         // Required, unique
  floor: Number,
  roomType: String,           // enum: ['single', 'double', 'triple', 'dormitory']
  capacity: Number,
  occupants: [ObjectId],      // Array of Ref → Student
  rentPerMonth: Number,
  amenities: [String],
  status: String,             // enum: ['available', 'occupied', 'maintenance']
  inventory: [{ item: String, quantity: Number, condition: String }],
  createdAt: Date,
  updatedAt: Date,
}
```

**Virtual**: `availableSlots = capacity - occupants.length`

### 4.4 Payment

```javascript
{
  _id: ObjectId,
  student: ObjectId,          // Ref → Student
  amount: Number,
  lateFee: Number,            // Default: 0
  totalAmount: Number,        // Computed: amount + lateFee
  month: Number,              // 1-12
  year: Number,
  dueDate: Date,
  paidAt: Date,
  paymentMethod: String,      // enum: ['cash', 'bankTransfer', 'online', 'cheque']
  transactionId: String,
  type: String,               // enum: ['rent', 'deposit', 'fine', 'other']
  status: String,             // enum: ['paid', 'pending', 'overdue']
  receiptNo: String,          // Unique auto-generated
  notes: String,
  recordedBy: ObjectId,       // Ref → User
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.5 Complaint

```javascript
{
  _id: ObjectId,
  student: ObjectId,          // Ref → Student
  category: String,           // enum: ['plumbing', 'electrical', 'furniture', 'cleanliness', 'noise', 'security', 'other']
  description: String,
  attachments: [{ url: String }],
  status: String,             // enum: ['pending', 'inProgress', 'resolved', 'rejected'], default: 'pending'
  resolvedAt: Date,
  resolvedBy: ObjectId,       // Ref → Staff
  feedback: String,
  feedbackRating: Number,     // 1-5
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.6 Notice

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  postedBy: ObjectId,         // Ref → User
  targetAudience: String,     // enum: ['all', 'students', 'staff']
  priority: String,           // enum: ['low', 'normal', 'high', 'urgent']
  isActive: Boolean,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.7 Staff

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref → User
  staffId: String,            // Unique
  designation: String,        // enum: ['warden', 'cleaner', 'security', 'maintenance', 'admin', 'accountant']
  joiningDate: Date,
  salary: Number,
  shift: String,              // enum: ['morning', 'evening', 'night', 'general']
  duties: [{ day: String, shift: String, area: String }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.8 Notification

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref → User (recipient)
  type: String,               // enum: ['complaint', 'payment', 'leave', 'announcement', 'room', 'student', 'system']
  title: String,
  message: String,
  link: String,
  isRead: Boolean,            // Default: false
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.9 LeaveRequest

```javascript
{
  _id: ObjectId,
  student: ObjectId,          // Ref → Student
  fromDate: Date,
  toDate: Date,
  reason: String,
  destination: String,
  guardianContact: String,
  status: String,             // enum: ['pending', 'approved', 'rejected', 'expired']
  approvedBy: ObjectId,       // Ref → User
  remarks: String,
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.10 VisitorLog

```javascript
{
  _id: ObjectId,
  name: String,
  contact: String,
  photo: String,
  vehicle: String,
  purpose: String,
  inTime: Date,               // Default: now
  outTime: Date,
  visitingStudent: ObjectId,  // Ref → Student
  visitingRoom: String,
  passNo: String,             // Auto-generated (e.g., "PASS-00123")
  remarks: String,
  recordedBy: ObjectId,       // Ref → User
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.11 ActivityLog

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref → User
  action: String,             // Required (e.g., "create", "update", "delete")
  resource: String,           // Required (e.g., "student", "room", "payment")
  resourceId: ObjectId,
  details: Mixed,             // Arbitrary JSON payload
  ip: String,
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.12 RoomTransfer

```javascript
{
  _id: ObjectId,
  student: ObjectId,          // Ref → Student
  fromRoom: ObjectId,         // Ref → Room
  toRoom: ObjectId,           // Ref → Room
  reason: String,
  status: String,             // enum: ['pending', 'approved', 'rejected']
  requestedBy: ObjectId,      // Ref → User
  approvedBy: ObjectId,       // Ref → User
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 5. API Reference with Examples

### 5.1 Authentication

#### POST /api/auth/login

**Request**:
```json
{ "email": "admin@hostel.com", "password": "admin123" }
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "...", "name": "Admin User", "email": "admin@hostel.com",
    "role": "admin", "phone": "9876543210", "isActive": true
  }
}
```
Also sets httpOnly cookie `jwt=<token>`.

**Error Response** (401):
```json
{ "success": false, "message": "Invalid email or password" }
```

#### POST /api/auth/logout

**Response** (200):
```json
{ "success": true, "message": "Logged out" }
```
Clears the `jwt` cookie.

#### GET /api/auth/me

**Response** (200): Returns the authenticated user object (same shape as login).

### 5.2 Students

#### GET /api/students

**Query Parameters**: `search`, `status`, `room`, `floor`, `page`, `limit`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "...", "studentId": "STU001", "status": "active",
      "user": { "name": "Student Demo", "email": "student@hostel.com" },
      "room": { "roomNumber": "101", "floor": 1, "roomType": "single" }
    }
  ],
  "total": 2, "page": 1, "pages": 1
}
```

#### POST /api/students

**Request**:
```json
{
  "name": "New Student", "email": "new@hostel.com", "password": "password123",
  "studentId": "STU003", "gender": "male",
  "guardian": { "name": "Guardian", "phone": "9999999999", "relation": "Father" }
}
```

**Response** (201): Returns created student (populated with user).

#### POST /api/students/bulk

**Request**:
```json
{
  "students": [
    { "name": "Student A", "email": "a@test.com", "studentId": "STU004", "phone": "111" },
    { "name": "Student B", "email": "b@test.com", "studentId": "STU005", "phone": "222" }
  ]
}
```

**Response** (201):
```json
{ "success": true, "created": 2, "failed": 0, "errors": [] }
```

#### PUT /api/students/:id/checkout

**Response** (200):
```json
{ "success": true, "message": "Student checked out" }
```

### 5.3 Rooms

#### GET /api/rooms

**Query Parameters**: `status`, `floor`, `roomType`, `search`

**Response** (200): Array of rooms with populated occupants and virtual `availableSlots`.

#### PUT /api/rooms/:id/allocate

**Request**:
```json
{ "studentId": "<student_objectid>" }
```

**Validation errors** (400): Maintenance mode, room full, student already in room.

**Response** (200): Returns updated room with populated occupants.

#### PUT /api/rooms/:id/vacate

**Request**:
```json
{ "studentId": "<student_objectid>" }
```

**Response** (200): Returns updated room.

### 5.4 Dashboard

#### GET /api/dashboard/stats

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalStudents": 2, "activeStudents": 2, "totalRooms": 8,
    "occupiedRooms": 2, "availableRooms": 5, "occupancyRate": 25,
    "totalRevenue": 18000, "pendingComplaints": 0, "totalStaff": 1
  }
}
```

#### GET /api/dashboard/activity

**Response** (200): Array of recent 20 ActivityLog entries with populated user.

### 5.5 Exports

#### GET /api/exports/students

**Response**: Binary `.xlsx` file download with formatted columns (Student ID, Name, Email, Phone, Room, Status, Check In).

#### GET /api/exports/payments?from=2025-01-01&to=2025-12-31

**Response**: Binary `.xlsx` file with payment data filtered by date range.

---

## 6. Frontend Component Architecture

### 6.1 Component Tree

```
App.jsx
│
├── LoginPage.jsx
│
└── Layout.jsx (ProtectedRoute wrapper)
    │
    ├── Sidebar.jsx (navigation, user menu, collapse toggle)
    ├── Navbar.jsx (search, notifications, theme toggle, profile dropdown)
    │
    └── <Outlet /> (routed pages)
        │
        ├── DashboardPage.jsx     → StatCard ×6, Recharts, ActivityFeed
        ├── StudentsPage.jsx      → Table, Modal (Form), Modal (BulkImport), ConfirmDialog
        ├── StudentDetailPage.jsx → Profile card, Tabs (Overview, Payments, Leaves)
        ├── RoomsPage.jsx         → RoomCard ×N, Modal (Form), Modal (Allocate), ConfirmDialog
        ├── PaymentsPage.jsx      → Stat cards, Table, Dues panel, Modal (Form), Print receipt
        ├── ComplaintsPage.jsx    → ComplaintCard ×N, Modal (Form), Modal (Feedback)
        ├── LeavesPage.jsx        → LeaveCard ×N, Modal (Form)
        ├── VisitorsPage.jsx      → Table, Modal (Form)
        ├── NoticesPage.jsx       → NoticeCard ×N, Modal (Form)
        ├── NotificationsPage.jsx → Notification list
        ├── StaffPage.jsx         → Card grid, Modal (Form)
        ├── ReportsPage.jsx       → Export cards
        ├── AuditLogPage.jsx      → Table with filters
        ├── ProfilePage.jsx       → Profile form, password change
        └── SettingsPage.jsx      → Dark mode toggle, notification prefs
```

### 6.2 Service Layer

Each resource has a corresponding service file that wraps Axios API calls:

```
services/
├── api.js              # Axios instance (base URL, interceptors, 401 redirect)
├── authService.js      # login, logout, getMe, updateProfile, changePassword
├── studentService.js   # CRUD + checkout + bulkImport
├── roomService.js      # CRUD + allocate + vacate + inventory
├── paymentService.js   # CRUD + dues + studentPayments
├── complaintService.js # CRUD + status update + feedback
├── leaveService.js     # CRUD + status update
├── visitorService.js   # CRUD + checkout
├── noticeService.js    # CRUD
├── notificationService.js  # list + markRead + unreadCount
├── staffService.js     # CRUD
└── dashboardService.js # stats + occupancy + revenue + activity + upcoming
```

### 6.3 Context Providers

**AuthContext** — `useReducer`-based state management for `{ user, loading, error }`. Provides `login()`, `logout()`, `loadUser()`. On mount, calls `GET /api/auth/me` to restore session from httpOnly cookie. Exposed via `useAuth()` hook.

**SocketContext** — Creates Socket.io connection when user is authenticated. Emits `join` event with `user._id`. Disconnects on logout. Exposed via `useSocket()` hook.

**ThemeContext** — Manages `darkMode` boolean, persists to `localStorage`, sets `data-theme` attribute on `<html>`. Exposed via `useTheme()` hook.

---

## 7. Real-Time Engine: Socket.io Deep Dive

### 7.1 Server Setup

```javascript
// config/socket.js
const { Server } = require('socket.io');

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);  // Join personal notification room
    });
  });

  return io;
};
```

### 7.2 Client Connection

```javascript
// context/SocketContext.jsx
useEffect(() => {
  if (!user) {
    if (socket) { socket.disconnect(); setSocket(null); }
    return;
  }
  const newSocket = io({ withCredentials: true });
  setSocket(newSocket);
  newSocket.on('connect', () => newSocket.emit('join', user._id));
  return () => newSocket.disconnect();
}, [user]);
```

### 7.3 Event Catalog

| Event | Direction | Emitter | Listeners | Payload |
|-------|-----------|---------|-----------|---------|
| `notification:new` | Server → User | createNotification() | Navbar (badge) | `{ _id, type, title, message, link }` |
| `complaint:new` | Server → All | complaintController | Dashboard, Complaints | `{ complaint: { _id, category, status } }` |
| `complaint:statusChange` | Server → All | complaintController | Complaints | `{ complaintId, status }` |
| `announcement:urgent` | Server → All | noticeController | Navbar (toast) | `{ notice: { title, content } }` |
| `student:checkin` | Server → All | studentController | Dashboard | (trigger to refetch) |
| `student:checkout` | Server → All | studentController | Dashboard | (trigger to refetch) |
| `payment:received` | Server → All | paymentController | Dashboard | (trigger to refetch) |
| `room:statusChange` | Server → All | roomController | Rooms, Dashboard | (trigger to refetch) |
| `join` | Client → Server | SocketContext | Server (room) | `userId` |

### 7.4 Room-Based Broadcasting

Socket.io's "rooms" feature allows targeted delivery:

```javascript
// Personal notification (only the recipient receives it)
io.to(`user:${userId}`).emit('notification:new', notification);

// Global broadcast (all connected clients receive it)
io.emit('complaint:new', { complaint });
```

---

## 8. Authentication & Security Model

### 8.1 JWT Token Flow

```
1. User submits email + password via POST /api/auth/login
2. Server validates credentials against User collection
3. Server generates JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
4. Server sets cookie: res.cookie('jwt', token, {
     httpOnly: true,     // Cannot be accessed by JavaScript
     secure: true,       // HTTPS only (in production)
     sameSite: 'lax',    // CSRF protection
     maxAge: 7 days,
   })
5. Client stores cookie automatically (browser native behavior)
6. All subsequent requests include the cookie automatically
7. Server middleware reads cookie, verifies JWT, attaches user to request
```

### 8.2 Security Measures

| Threat | Mitigation |
|--------|------------|
| XSS (Cross-Site Scripting) | JWT stored in httpOnly cookie — JavaScript cannot read it |
| CSRF (Cross-Site Request Forgery) | sameSite: 'lax' prevents cross-site form submissions |
| Token theft | Token expires after 7 days |
| Password breach | bcrypt with 12 salt rounds (~250ms per hash) |
| Unauthorized role access | authorize('admin') middleware at route level |
| Data exposure | User.toJSON() strips password field; role-based query filtering |
| File upload abuse | Multer file filter (images/docs only); 5MB size limit |

### 8.3 Role Authorization Implementation

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    next();
  };
};

// Usage:
router.put('/:id/status', protect, authorize('admin', 'staff'), ctrl.updateComplaintStatus);
```

---

## 9. Error Handling Strategy

### 9.1 Server-Side Error Handling

**Global Error Handler** captures all errors thrown via `next(error)`:

```javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

Each controller wraps logic in try/catch:
```javascript
exports.getStudents = async (req, res, next) => {
  try { /* ... */ } catch (error) { next(error); }
};
```

Mongoose validation errors and duplicate key errors are automatically caught and returned as 400 responses.

### 9.2 Client-Side Error Handling

- **Axios interceptor**: Catches 401 → redirects to `/login`
- **Toast notifications**: Every API call in pages uses `try/catch` with `toast.error()`
- **Loading states**: Every page shows `LoadingSpinner` while data is being fetched
- **Empty states**: `EmptyState` component provides contextual messaging and CTA buttons

---

## 10. User Flows: End-to-End Walkthroughs

### Flow 1: Complete Student Lifecycle

```
Day 1: Registration
────────────────────
[Admin] Opens Students → Clicks "Add Student"
[Admin] Fills form: Name, Email, Student ID, Phone
[Admin] Clicks "Create"
[System] Creates User document (bcrypt hashes password)
[System] Creates Student document (links to User)
[System] Logs activity: "Admin created student STU003"

Day 2: Room Allocation
──────────────────────
[Admin] Opens Rooms → Finds available room → "Allocate"
[Admin] Selects student from dropdown → Clicks "Allocate"
[System] Checks room is not maintenance, has capacity
[System] Updates Room.occupants, Student.room, Student.checkInDate
[System] Sets Room.status to 'occupied'
[System] Broadcasts 'room:statusChange' via Socket.io

Throughout Semester: Ongoing Operations
────────────────────────────────────────
[Student] Submits complaint (leaking faucet)
[System] Creates Complaint (pending) → Notifies admin via Socket.io
[Student] Applies for 3-day leave → Admin approves → Student notified
[Student] Pays monthly rent → Admin records → Receipt generated

Day 120: Check-Out
──────────────────
[Admin] Opens Student Detail → "Check Out"
[System] Sets Student.status = 'checkedOut', checkOutDate = now
[System] Removes Student from Room.occupants
[System] If room is empty, sets Room.status = 'available'
[System] Logs activity
```

### Flow 2: Urgent Announcement Broadcast

```
09:00 [Warden] Posts notice: "URGENT: Water cut from 10 AM to 2 PM"
      → Sets priority to "urgent" → Clicks "Post"

09:00:01 [Server] Saves Notice to MongoDB
                 Checks priority === 'urgent'
                 Calls getIO().emit('announcement:urgent', { notice })

09:00:01 [Student A's Browser] (on Dashboard)
         Socket.io receives 'announcement:urgent'
         react-hot-toast shows: 🔔 "URGENT: Water cut from 10 AM to 2 PM"

09:00:01 [Student B's Browser] (on Complaints page)
         Same toast appears

09:00:02 [Student C's Browser] (laptop asleep)
         Nothing in real-time

14:00 [Student C] Opens the application
         Navbar fetches unread notification count
         GET /api/notifications/unread-count → badge shows "1"
         Opens Notifications → Sees the urgent announcement
```

### Flow 3: Complaint Resolution with Feedback

```
14:00 [Student] Submits complaint: "Electrical - Fan not working in Room 101"
         → Category: electrical
         → Description: "Ceiling fan stopped working since last night"
         → Attachment: photo.jpg

14:00:02 [Server] Creates Complaint (pending)
           Emits 'complaint:new' via Socket.io
           Creates Notification for Admin users

14:00:03 [Admin's Browser] Toast: "New complaint: Electrical"
           Notification bell badge increments to "1"

14:05 [Admin] Opens Complaints → Sees the complaint
           Changes status to "inProgress"

14:35 [Admin] After repair, marks complaint "resolved"
           [Server] Sets status = 'resolved', resolvedAt = now
           Creates Notification for student
           Emits 'complaint:statusChange'

14:35:05 [Student's Browser] Toast: "Complaint (Electrical) is now resolved"
           Student opens complaint → Clicks "Feedback"

14:40 [Student] Rates: 4 stars
           Writes: "Fixed quickly, but technician came 30 min late"
```

### Flow 4: End-of-Month Financial Close

```
Day 30 [Accountant] Opens Payments → Toggle "Dues"
           → Sees 5 pending payments
           → Sets date range filter
           → Clicks "Export XLSX"
           [Server] Queries Payment collection with date filter
                    Generates Excel workbook with ExcelJS
                    Sends .xlsx file as download
           → Cross-references with bank statement
           → Records remaining payments
           → Exports final report for director
```

---

## 11. Edge Cases & How We Handle Them

### 11.1 Room Management Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Allocate to full room | Check `occupants.length < capacity` → 400 error |
| Allocate student already in another room | Remove from old room first |
| Allocate same student twice | Check `occupants.includes(studentId)` → 400 error |
| Delete room with occupants | Check `occupants.length > 0` → 400 error |
| Vacate last occupant | Auto set room status to 'available' |
| Allocate to maintenance room | Check `status !== 'maintenance'` → 400 error |

### 11.2 Student Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Duplicate student ID | Unique index → Mongoose 11000 error → 400 response |
| Duplicate email | Same as above |
| Delete student with active room | Remove from room, update room status |
| Bulk import with failures | Each row wrapped in try/catch; report without rollback |

### 11.3 Payment Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Duplicate receipt number | Unique index + random generation → extremely unlikely |
| Payment for future month | Allowed (advance payment) |
| Negative amount | No validation (could be improved) |

### 11.4 Notification Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User not connected to Socket.io | Stored in MongoDB; seen on next login |
| 1000+ unread notifications | Frontend limits to 50 most recent |
| Notification to deleted user | Silently fails (try/catch in createNotification) |

### 11.5 Leave Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Leave in the past | Not validated (can be improved) |
| Overlapping leaves | Not prevented (can be improved) |

---

## 12. Database Indexing & Performance

### 12.1 Current Indexes

| Collection | Indexes | Purpose |
|------------|---------|---------|
| User | `email` (unique), `role` | Login lookups, role filtering |
| Student | `studentId` (unique), `status` | Search by ID, filter by status |
| Room | `roomNumber` (unique), `status`, `floor` | Search, filter |
| Payment | `receiptNo` (unique), `student`, `{month, year}`, `status` | Receipt lookup, history, period filtering |
| ActivityLog | `createdAt`, `{resource, resourceId}` | Time-sorted queries, resource queries |
| Notification | `{user, isRead, createdAt}` | Unread count queries |

### 12.2 Query Performance

**Most Frequent Queries**:
1. `Student.find().populate('user').populate('room').sort({createdAt:-1}).limit(20)` — Students page
2. `Room.find().populate('occupants')` — Rooms page
3. Dashboard stats — 10 parallel queries (counts + aggregations)
4. `Payment.find({student: id}).sort({createdAt:-1})` — Student detail payments
5. `Notification.countDocuments({user: id, isRead: false})` — Unread badge (every 30s)

**All queries use Mongoose population** (equivalent to SQL JOINs), not multiple round-trips. Dashboard stats use MongoDB's `$count` and `$group` aggregation pipeline for efficient server-side computation.

---

## 13. Tech Stack & Rationale

### 13.1 Complete Package List

**Backend (17 packages)**

| Package | Purpose |
|---------|---------|
| express ^5.2.1 | Web framework |
| mongoose ^9.7.4 | MongoDB ODM |
| cors | Cross-origin requests |
| dotenv | Environment variables |
| jsonwebtoken | JWT signing/verification |
| bcryptjs | Password hashing |
| cookie-parser | Cookie parsing |
| socket.io ^4.8.3 | Real-time WebSocket engine |
| multer | File upload handling |
| nodemailer | Email sending |
| exceljs | Excel file generation |
| pdfkit | PDF generation (available) |
| express-validator | Request validation |
| morgan | HTTP request logging |
| node-cron | Scheduled tasks |
| uuid | Unique ID generation |
| nodemon (dev) | Dev server auto-restart |

**Frontend (15 packages)**

| Package | Purpose |
|---------|---------|
| react ^19 | UI library |
| react-dom | React DOM rendering |
| react-router-dom | Client-side routing |
| axios | HTTP client |
| socket.io-client | WebSocket client |
| recharts | Charting library |
| react-hot-toast | Toast notifications |
| lucide-react | SVG icons |
| file-saver | File download |
| @tanstack/react-query | Server state caching |
| tailwindcss ^4.3.2 | Utility-first CSS |
| @tailwindcss/vite | Tailwind Vite plugin |
| daisyui ^5.6.15 | UI component library |
| date-fns | Date utilities |
| papaparse | CSV parsing |

### 13.2 Why These Specific Choices

**Why React 19?** Latest stable React with improved concurrent rendering, efficient handling of real-time updates from Socket.io.

**Why Vite over Create React App?** Sub-second HMR, native ESM, built-in CSS post-processing. CRA is deprecated.

**Why daisyUI over pure Tailwind?** Pre-built components (btn, card, badge, table, modal, dropdown), semantic color names that auto-adapt to dark mode, zero JavaScript, consistent design system.

**Why Recharts over Chart.js?** React-native (charts are JSX components), smaller bundle when tree-shaken, integrates with React lifecycle.

**Why Axios over Fetch?** Automatic JSON parsing, request/response interceptors, `withCredentials: true` for cookie auth, better error handling, `responseType: 'blob'` for file downloads.

**Why Tailwind v4?** CSS-first configuration (no tailwind.config.js), `@import "tailwindcss"` replaces PostCSS setup, smaller build output.

---

## 14. Development Decisions Log

### Decision 1: Single Monorepo vs. Separate Repos

**Chosen**: Single directory with `backend/` and `frontend/` subdirectories. The project is small enough that separate repos would add overhead (two CI pipelines, two hosting setups). A monorepo makes it easy to see the full picture and share configuration.

### Decision 2: Vite Proxy vs. CORS in Production

**Chosen**: Vite proxy in development, CORS in production. In dev, Vite proxies `/api` to `localhost:5000` — the frontend uses relative URLs (`/api/students`) that work in both dev and prod. No hardcoded `localhost:5000` in frontend code. In prod, a reverse proxy (Nginx) or Express serves the built frontend as static files.

### Decision 3: Form State Management

**Chosen**: Manual `useState` for forms over React Hook Form or Formik. The forms in this project are simple (5-10 fields, no complex validation, no nested fields). A form library would add an unnecessary dependency. Forms use controlled inputs with `onChange` handlers, and validation is minimal (required fields and pattern matching).

### Decision 4: httpOnly Cookies over localStorage

**Chosen**: httpOnly cookies for JWT storage. This decision prioritizes security over convenience:
- httpOnly cookies are immune to XSS attacks (JavaScript cannot read them).
- sameSite: 'lax' prevents CSRF attacks.
- The trade-off is that cross-origin requests require careful CORS configuration.
- The frontend uses Vite's proxy in development and same-origin requests in production, avoiding the CORS issue entirely.

### Decision 5: Dual Reference for Room↔Student

**Chosen**: Both `Room.occupants` (array of Student refs) and `Student.room` (single Room ref) are maintained. This is a denormalization that improves read performance (room cards show occupants without a separate query) at the cost of write complexity (both references must be updated atomically). Every allocation/vacation operation updates both documents in a single request.

### Decision 6: MongoDB Notifications Over Ephemeral Socket.io Events

**Chosen**: Notifications are stored in MongoDB and also emitted via Socket.io. Socket.io alone is insufficient because events are lost if the recipient is offline. MongoDB persistence ensures:
- Notifications survive browser closures and network interruptions.
- Users see missed notifications on next login.
- Queryable history for audit and analytics.

### Decision 7: ActivityLog Immutability

**Chosen**: ActivityLog documents are write-once, read-many. No update or delete API is exposed. This ensures a tamper-proof audit trail. The only planned maintenance is a TTL index for automatic archival of entries older than 2 years.

### Decision 8: Excel over PDF for Reports

**Chosen**: ExcelJS (.xlsx) over PDFKit for exports. Hostel administrators frequently need to share data with accountants and auditors who prefer Excel files for further manipulation. ExcelJS generates proper `.xlsx` files with styled headers and column widths.

### Decision 9: Room Cards Over Table

**Chosen**: Rooms are displayed as a card grid rather than a table. Cards provide visual representation of physical spaces, show occupancy levels with progress bars, and accommodate action buttons (Allocate, Vacate) more naturally than table rows.

### Decision 10: Seed Data for Demo

**Chosen**: A comprehensive seed script (`backend/seed.js`) creates 2 students, 8 rooms, 4 payments, and 3 notices with realistic data. This allows anyone to clone the repo and immediately explore all features without manual data entry.

---

## 15. Project Structure: Every File Explained

### Backend (52 files)

```
backend/
├── config/
│   ├── db.js              # Mongoose connection setup with error handling
│   └── socket.js          # Socket.io server initialization with CORS
├── controllers/
│   ├── authController.js       # Login, logout, profile, password change
│   ├── studentController.js    # CRUD, checkout, bulk import
│   ├── roomController.js       # CRUD, allocate, vacate, inventory
│   ├── paymentController.js    # CRUD, dues, student-specific payments
│   ├── complaintController.js  # CRUD, status, feedback, real-time alerts
│   ├── noticeController.js     # CRUD, urgent broadcast
│   ├── notificationController.js   # List, mark read, unread count
│   ├── staffController.js      # CRUD
│   ├── dashboardController.js  # Stats, occupancy, revenue, activity, upcoming
│   ├── leaveController.js      # CRUD, status update
│   ├── visitorController.js    # CRUD, checkout
│   ├── roomTransferController.js   # CRUD, status update
│   ├── exportController.js     # Students, payments, complaints Excel exports
│   ├── uploadController.js     # Image and document upload
│   └── auditController.js      # Paginated audit log queries
├── middleware/
│   ├── auth.js             # JWT verification, role authorization
│   ├── errorHandler.js     # Global error handler with stack traces in dev
│   └── upload.js           # Multer config with file type/size limits
├── models/
│   ├── User.js             # Auth with bcrypt pre-save hook + toJSON stripping password
│   ├── Student.js          # Student profile with guardian, documents
│   ├── Room.js             # Room with occupants array, inventory, virtual slots
│   ├── Payment.js          # Payment with receiptNo, totalAmount pre-save hook
│   ├── Complaint.js        # Complaint with feedback, attachments
│   ├── Notice.js           # Notice with priority, expiry
│   ├── Staff.js            # Staff with duties array
│   ├── Notification.js     # Notification with type, read status
│   ├── LeaveRequest.js     # Leave with status flow
│   ├── VisitorLog.js       # Visitor with in/out time, pass number
│   ├── ActivityLog.js      # Immutable audit log
│   └── RoomTransfer.js     # Transfer request with status flow
├── routes/
│   ├── auth.js             # POST login/logout, GET me, PUT profile/password
│   ├── students.js         # GET list, POST create/bulk, GET/PUT/DELETE by id, PUT checkout
│   ├── rooms.js            # GET list/id, POST create, PUT update/delete/allocate/vacate/inventory
│   ├── payments.js         # GET list/id/dues/student, POST create, PUT update
│   ├── complaints.js       # GET list, POST create, PUT status/feedback
│   ├── notices.js          # GET list, POST create, PUT/DELETE
│   ├── notifications.js    # GET list/unread-count, PUT read/read-all
│   ├── staff.js            # GET list, POST/PUT/DELETE
│   ├── dashboard.js        # GET stats/occupancy/revenue/activity/upcoming
│   ├── leaves.js           # GET list, POST create, PUT status
│   ├── visitors.js         # GET list, POST create, PUT checkout
│   ├── transfers.js        # GET list, POST create, PUT status
│   ├── exports.js          # GET students/payments/complaints Excel
│   ├── uploads.js          # POST image/document
│   └── audit.js            # GET paginated logs
├── utils/
│   ├── generateToken.js    # JWT creation + cookie setting
│   ├── helpers.js          # Receipt number, pass number generation
│   ├── logger.js           # ActivityLog creation
│   ├── createNotification.js   # Notification creation + Socket.io emit
│   └── emailService.js     # Nodemailer transport (ready for future use)
├── uploads/
│   ├── photos/             # Student profile photos
│   ├── documents/          # Student documents
│   └── complaints/         # Complaint attachments
├── .env                    # Environment variables (gitignored)
├── package.json            # Dependencies and scripts
├── seed.js                 # Demo data seeder
└── server.js               # Entry point, middleware, route mounting
```

### Frontend (62 files)

```
frontend/
├── public/
│   ├── favicon.svg         # Browser tab icon
│   └── icons.svg           # SVG sprite
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx     # Collapsible nav with role-based items, user avatar, logout
│   │   │   ├── Navbar.jsx      # Global search (Ctrl+K), notification bell, theme toggle, profile dropdown
│   │   │   └── Layout.jsx      # Sidebar + Navbar + Outlet wrapper
│   │   └── common/
│   │       ├── StatCard.jsx        # Dashboard metric card with icon and trend
│   │       ├── Modal.jsx           # Reusable modal with backdrop, close button
│   │       ├── LoadingSpinner.jsx  # Full-page or inline loading indicator
│   │       ├── EmptyState.jsx      # Empty data placeholder with action button
│   │       └── ConfirmDialog.jsx   # Confirmation modal with warning icon
│   ├── pages/
│   │   ├── LoginPage.jsx           # Login form with validation, demo credentials
│   │   ├── DashboardPage.jsx       # Stats, charts, activity feed, upcoming alerts
│   │   ├── StudentsPage.jsx        # Student table, search, add/edit/bulk modals
│   │   ├── StudentDetailPage.jsx   # Profile, tabs (overview, payments, leaves)
│   │   ├── RoomsPage.jsx           # Room card grid, allocate/vacate, add/edit modal
│   │   ├── PaymentsPage.jsx        # Payment table, dues panel, add modal, print
│   │   ├── ComplaintsPage.jsx      # Complaint cards, add/feedback modals, real-time
│   │   ├── LeavesPage.jsx          # Leave cards, add modal, approve/reject
│   │   ├── VisitorsPage.jsx        # Visitor table, add modal, checkout
│   │   ├── NoticesPage.jsx         # Notice cards, add/edit modal
│   │   ├── NotificationsPage.jsx   # Notification list, mark read
│   │   ├── StaffPage.jsx           # Staff card grid, add/edit/delete
│   │   ├── ReportsPage.jsx         # Export buttons with filters
│   │   ├── AuditLogPage.jsx        # Log table with action/resource filters
│   │   ├── ProfilePage.jsx         # Profile edit, password change
│   │   └── SettingsPage.jsx        # Dark mode toggle, notification prefs
│   ├── context/
│   │   ├── AuthContext.jsx     # User state, login/logout, session restore
│   │   ├── SocketContext.jsx   # Socket.io connection lifecycle
│   │   └── ThemeContext.jsx    # Dark mode state + persistence
│   ├── services/
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── authService.js      # Auth API calls
│   │   ├── studentService.js   # Student API calls
│   │   ├── roomService.js      # Room API calls
│   │   ├── paymentService.js   # Payment API calls
│   │   ├── complaintService.js # Complaint API calls
│   │   ├── leaveService.js     # Leave API calls
│   │   ├── visitorService.js   # Visitor API calls
│   │   ├── noticeService.js    # Notice API calls
│   │   ├── notificationService.js  # Notification API calls
│   │   ├── staffService.js     # Staff API calls
│   │   └── dashboardService.js # Dashboard API calls
│   ├── hooks/                  # (Available for custom hooks)
│   ├── App.jsx                 # Route definitions, ProtectedRoute
│   ├── main.jsx                # BrowserRouter, providers, React Query
│   └── index.css               # Tailwind v4 import + daisyUI plugin
├── index.html              # HTML entry point
├── vite.config.js          # React plugin, Tailwind plugin, proxy config
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # (Not needed in Tailwind v4)
└── postcss.config.js       # (Not needed in Tailwind v4)
```

---

## 16. Quick Start Guide

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & Install
```bash
git clone https://github.com/SakshamDevloper/HostelManagementSystem.git
cd HostelManagementSystem
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
Edit `backend/.env` (copy from the template):
```
MONGODB_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your-secret-key-at-least-32-chars-long
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Data
```bash
cd backend && npm run seed
```
Creates: 2 students, 8 rooms, 4 payments, 3 notices, 1 staff member, 1 admin, 1 staff user.

### 4. Start Development
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

### 5. Login
Open `http://localhost:5173` and use:

| Role | Email | Password | Explore |
|------|-------|----------|---------|
| Admin | admin@hostel.com | admin123 | Dashboard, Reports, Audit Log, Staff |
| Staff | staff@hostel.com | staff123 | Students, Rooms, Complaints, Leaves |
| Student | student@hostel.com | student123 | Submit complaint, Apply leave, View payments |

---

## 17. Deployment Guide

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# The built files are in frontend/dist/
```

### Option 1: Express serves static files

Modify `server.js` to serve the built frontend in production:

```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

### Option 2: Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    root /path/to/frontend/dist;
    index index.html;

    # API proxying
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hostel-management
JWT_SECRET=<strong-random-secret>
CLIENT_URL=https://your-domain.com
```

---

## 18. Future Roadmap

### Short Term (Next 2-4 Weeks)

- **Email Notifications** — Nodemailer integration for payment reminders, leave approvals, urgent notices sent to registered email addresses.
- **Room Handover Checklist** — Digital check-in/check-out forms with inventory verification. Students acknowledge receipt of room items on check-in.
- **Mobile Responsive Layout** — The current UI is desktop-first. Sidebar collapses, table horizontal scrolling, and touch-friendly buttons for security staff using phones at the gate.

### Medium Term (1-3 Months)

- **Parent/Guardian Portal** — Limited read-only dashboard for parents. View ward's fee status (paid/pending), complaint history (submitted/resolved), and notice board. No edit permissions.
- **SMS Alerts** — Integration with Twilio or similar for urgent security notifications to students who are not currently logged in.
- **Dashboard Date Range Filters** — Allow filtering stats, revenue, and activity by custom date ranges instead of fixed "last 6 months."
- **Advanced Search** — Add fuzzy search across all resources (students, rooms, staff, complaints) using MongoDB text indexes.
- **Two-Factor Authentication** — Optional TOTP-based 2FA for admin accounts.

### Long Term (3-6 Months)

- **Multi-Hostel Support** — Add a `hostel` field to all models so a single deployment can manage multiple hostel buildings. Super-admin role to manage across hostels.
- **Biometric / RFID Integration** — Student attendance and room access logging via hardware integration.
- **Mobile App (React Native)** — Native mobile experience for security guards (visitor log) and students (complaints, leave, payments).
- **Analytics Dashboard** — Historical trends, occupancy forecasting, revenue projections, complaint patterns visualized over time.
- **Automated Late Fee Calculation** — node-cron job runs daily to mark payments as 'overdue' and calculate late fees based on configured rules.
- **Localization** — Multi-language support (English + regional languages) for wider adoption.

---

## Project Statistics

- **Total files**: 114
- **Backend**: 52 files (JavaScript)
- **Frontend**: 62 files (JSX, CSS, HTML)
- **MongoDB models**: 12
- **API endpoints**: 62+
- **React pages**: 16
- **Reusable components**: 5
- **Context providers**: 3
- **API service modules**: 11
- **NPM packages**: Backend 17, Frontend 15
- **Lines of code**: ~11,000+

---

## Author

**SakshamDevloper**

This project was built as a comprehensive full-stack application demonstrating:
- MERN stack proficiency
- Real-time communication with Socket.io
- Secure authentication with JWT httpOnly cookies
- Role-based access control
- Modern UI with Tailwind CSS + daisyUI
- RESTful API design
- NoSQL data modeling (MongoDB/Mongoose)
- React state management with Context API + useReducer
- Real-world problem-solving and product thinking

Built with passion for learning and practical application. Contributions, issues, and feature requests are welcome on GitHub.
