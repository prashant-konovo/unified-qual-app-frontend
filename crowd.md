Act as a **principal product designer + senior frontend architect (ex-Linear, Stripe, Vercel)**.

Redesign and implement a **Crowd Management System** for a SaaS research platform called **HalaQual**.

This includes:

1. Crowds listing page (data table dashboard)
2. Create Crowd flow (modern form / wizard)

The current UI is outdated, cluttered, and enterprise-heavy. The goal is to transform it into a **modern, clean, high-performance SaaS interface** using **only ShadCN UI components + TailwindCSS in Next.js**.

---

TECH STACK (STRICT)

Next.js (App Router)
ShadCN UI
TailwindCSS
TanStack Table
React Hook Form
Zod
Lucide Icons

Do NOT use any other UI libraries.

---

PRODUCT CONTEXT

Crowds represent participant groups used for research.

Each crowd includes:

* Name
* Description
* Subscription
* Type (Profile / Custom / Employee)
* Country
* Profession
* Specialty
* Panel (multi-select)
* Attributes (dynamic key-value pairs)

Users need to:

• Browse and manage crowds
• Filter and search crowds
• Create new crowds
• Edit or delete crowds
• Configure attributes dynamically

---

PART 1 — CROWDS LISTING (MODERN TABLE)

Design a **modern SaaS data table** similar to:

Linear issue list
Stripe dashboard
Vercel tables

---

PAGE LAYOUT

Header:

Title: Crowds
Subtitle: Manage participant groups for research

Right side:

* New Crowd (primary button)

---

ALERT BANNER

At top, show an informational banner:

Example:

Crowds unused for over X time will be deleted.

Design using ShadCN Alert component.

---

FILTER BAR

Include:

Search input (debounced)
Subscription filter
Type filter
Panel filter

Optional:

Status chips (Profile / Custom / Employee)

---

TABLE

Use TanStack Table styled with ShadCN.

Columns:

Name
ID
Members
Expected Completes
Subscription
Type
Panel
Actions

---

ROW DESIGN (IMPORTANT)

Make rows compact and scannable.

Name cell:

Crowd Name (bold)
Description (muted text)

Members:

Number (highlight)

Expected Completes:

Clickable or reveal interaction

Subscription:

Display as link-style text

Type:

Use Badge

Panel:

Display as tags

---

ACTIONS COLUMN

Use DropdownMenu instead of icons.

Actions:

View Crowd
Edit Crowd
Delete Crowd

---

TABLE UX

Enable:

Row hover highlight
Column sorting
Pagination
Row click → open details
Checkbox selection for bulk delete

---

BULK ACTIONS

When rows selected:

Show:

Delete Selected

---

PART 2 — CREATE CROWD (MODERN FORM)

Replace long modal with a **clean structured form or step-based flow**.

---

LAYOUT

Use centered layout:

max-w-3xl mx-auto

Use Card sections.

---

SECTION 1 — BASIC INFO

Fields:

Crowd Name (Input)
Description (Textarea)
Subscription (searchable combobox)
Type (Select)

---

SECTION 2 — TARGETING

Fields:

Country (Select)
Profession (Multi-select)
Specialty (Multi-select)
Panel (Multi-select tags)

---

SECTION 3 — ATTRIBUTES (IMPORTANT)

Dynamic attributes system.

User can:

* Add Attribute

Each attribute:

Attribute Name (Select/Input)
Choices (multi-select or input)

Display attributes in a table-like editable list.

---

SECTION 4 — REVIEW

Show summary before creation.

---

FORM UX REQUIREMENTS

Use:

Inline validation
Helper text
Searchable dropdowns
Multi-select with tags
Clean spacing

---

SHADCN COMPONENTS REQUIRED

Table
Input
Textarea
Select
Command (for searchable dropdowns)
Popover
Badge
Button
DropdownMenu
Dialog
Card
Checkbox
Switch
Alert

---

COMPONENT ARCHITECTURE

CrowdsPage
├ PageHeader
├ AlertBanner
├ FiltersBar
├ CrowdsTable
└ CreateCrowdDialog / Page

CreateCrowdForm
├ SectionBasicInfo
├ SectionTargeting
├ SectionAttributes
└ SectionReview

---

DESIGN STYLE

Match quality of:

Linear
Stripe
Vercel

Use:

rounded-xl cards
soft shadows
minimal borders
clear hierarchy
muted secondary text

Avoid:

legacy admin UI
heavy tables
overcrowded layouts

---

EXPECTED OUTPUT

Generate:

1. Full modern UI layout (table + form)
2. React component architecture
3. TanStack table setup
4. Dynamic attributes implementation
5. Form validation with React Hook Form + Zod
6. ShadCN component usage

Make the result feel like a **$10B SaaS product UI**.
