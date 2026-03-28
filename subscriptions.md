Act as a **principal product designer + senior frontend architect (ex-Stripe, Linear, Vercel)**.

Redesign and implement a **Subscriptions Management System** for a SaaS platform called **HalaQual**.

This includes:

1. Subscriptions list (data table dashboard)
2. Create subscription flow (multi-step form wizard)
use 
ShadCN UI
TailwindCSS
TanStack Table
React Hook Form
Zod
Lucide Icons

Do NOT use any other UI libraries.

---

PRODUCT CONTEXT

Subscriptions represent client accounts tied to:

* Company
* Plan
* Salesforce Account
* Markets
* Panels
* Contacts (CS, Sales, PM)
* Configuration settings

Users need to:

• Browse and search subscriptions
• Filter and sort data
• Create new subscriptions
• Edit and manage subscriptions

---

PART 1 — SUBSCRIPTIONS LIST (TABLE DASHBOARD)

Design a **modern SaaS data table interface** similar to:

Linear issue list
Stripe payments dashboard
Vercel deployments table

---

PAGE LAYOUT

Header:

Title: Subscriptions
Subtitle: Manage all client subscriptions

Right side:

* New Subscription (primary button)

---

FILTER BAR

Include:

Search input (debounced)
Plan filter
Currency filter
Panel filter

Use:

Input
Select
Badge filters (optional)

---

TABLE

Use TanStack Table styled with ShadCN.

Columns:

Company
Plan
Phone
Created
Salesforce Account
Actions

---

ROW DESIGN (IMPORTANT)

Each row must be **compact but rich**:

Company cell:

Company Name (bold)
Short Code (muted text)

Plan:

Display as Badge

Created:

Use relative time (e.g. “2 hours ago”)

---

ACTIONS COLUMN

Use DropdownMenu:

View Details
Edit Subscription
Delete Subscription

---

TABLE UX

Enable:

Row hover state
Column sorting
Pagination
Row click → opens details page
Checkbox selection (optional for bulk actions)

---

PART 2 — CREATE SUBSCRIPTION (MULTI-STEP WIZARD)

Replace long form with a **stepper wizard** similar to Stripe onboarding.

Steps:

1. Basic Info
2. Salesforce & Markets
3. Contacts
4. Configuration
5. Review & Create

---

STEP 1 — BASIC INFO

Fields:

Company Name (Input)
Short Code (Input)
Subscription Plan (Select)
Currency (Select)
Phone (Input)

---

STEP 2 — SALESFORCE & MARKETS

Salesforce Account (searchable combobox)
Markets (multi-select)
Panel (multi-select with tags)

---

STEP 3 — CONTACTS

Managing CS User (searchable)
Sales Contact (searchable)
PM Contact (searchable)

---

STEP 4 — CONFIGURATION

Default Service Type (Select)
Business Type (Select)
AE Reporting Requirements (Select)

Checkboxes:

Enable AE Consent Question
Skip Salesforce validation

---

STEP 5 — REVIEW

Show summary of all inputs.

Buttons:

Back
Create Subscription

---

UX REQUIREMENTS

Use modern SaaS UX patterns:

• Card-based sections
• Clear visual hierarchy
• Minimal borders
• Soft shadows
• Consistent spacing
• Inline validation
• Keyboard accessibility

---

COMPONENT ARCHITECTURE

SubscriptionsPage
├ PageHeader
├ FiltersBar
├ SubscriptionsTable
└ CreateSubscriptionDialog

CreateSubscriptionWizard
├ Stepper
├ StepBasicInfo
├ StepSalesforce
├ StepContacts
├ StepConfiguration
└ StepReview

---

SHADCN COMPONENTS (MANDATORY)

Table
Input
Select
Button
Badge
DropdownMenu
Dialog
Card
Textarea
Checkbox
Switch
Popover
Command (for searchable dropdowns)

---

DESIGN STYLE

Match quality of:

Linear
Stripe Dashboard
Vercel

Avoid:

bulky layouts
heavy borders
legacy admin UI patterns

---

EXPECTED OUTPUT

Generate:

1. Full modern UI layout (table + wizard)
2. React component structure
3. ShadCN component usage
4. TanStack table setup
5. Multi-step form implementation
6. Form validation with React Hook Form + Zod

Make the result feel like a **$10B SaaS product UI**.
