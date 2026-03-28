---

# ✅ 📄 PARTICIPANT + INTERVIEW SLOT LIFECYCLE — FEATURE SPEC

```md
# Participant Management & Interview Scheduling System

## Overview

This system manages **participants (users)** who:

1. Take surveys
2. Get qualified
3. Select interview slots
4. Get scheduled with moderators

Participants are stored in the **Users collection** with role:

```

role = "participant"

````

This system integrates:

- Survey Builder
- Crowds
- Projects
- Moderator Availability
- Interview Scheduler
- AI Scheduling Engine

---

# 1. Core Concepts

## Entities

### Participant (User)

```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "participant",
  "status": "active"
}
````

---

### Survey Response

```json
{
  "id": "resp_123",
  "userId": "user_123",
  "projectId": "proj_123",
  "answers": {},
  "status": "qualified"
}
```

---

### Interview Slot

```json
{
  "id": "slot_123",
  "moderatorId": "mod_123",
  "start": "2026-03-12T08:45",
  "end": "2026-03-12T09:15",
  "capacity": 1
}
```

---

### Interview Booking

```json
{
  "id": "booking_123",
  "userId": "user_123",
  "slotId": "slot_123",
  "status": "scheduled"
}
```

---

# 2. Participant Lifecycle

```
Participant
   ↓
Survey
   ↓
Qualified
   ↓
Interview Slot Selection
   ↓
Scheduled
```

---

# 3. Participant Management (Admin)

## Features

* View participants
* Filter by:

  * Project
  * Status (Qualified / Disqualified / Scheduled)
* View survey responses
* View booking status

---

## Participant Table

Columns:

* Name
* Email
* Project
* Survey Status
* Interview Status
* Actions

Actions:

* View Details
* View Survey
* View Schedule

---

# 4. Survey → Qualification Flow

## Flow

```
Participant takes survey
   ↓
Answers evaluated
   ↓
IF qualifies → eligible for scheduling
ELSE → disqualified
```

---

## Qualification Output

```json
{
  "userId": "user_123",
  "status": "qualified"
}
```

---

# 5. Interview Slot Generation

Slots are generated from:

```
Moderator Availability
+ Project Interview Duration
```

---

## Example

Moderator availability:

```
8:00 – 10:00
```

Project duration:

```
30 minutes
```

Generated slots:

```
8:00 – 8:30
8:30 – 9:00
9:00 – 9:30
9:30 – 10:00
```

---

# 6. Participant Slot Selection UI

## Features

* View available slots
* Filter by date/time
* Select preferred slot

---

## UI Behavior

```
Calendar / List view
   ↓
Show available slots
   ↓
User selects slot
   ↓
Confirm booking
```

---

# 7. No Slot Available Scenario (CRITICAL)

If no suitable slot:

User selects:

```
"None of these times work"
```

---

# 8. Preferred Time Capture

Capture:

* Preferred start time
* Preferred end time
* Preferred days
* Timezone

---

## Data

```json
{
  "userId": "user_123",
  "preferredStart": "18:00",
  "preferredEnd": "21:00",
  "state": "WAITING_FOR_SLOT"
}
```

---

# 9. Waiting Queue System

Participants are added to:

```
WAITING QUEUE
```

Stored fields:

* preferred time range
* waiting since
* projectId
* timezone

---

# 10. Slot Matching Engine

Triggered when:

* Moderator adds availability
* New slots generated

---

## Matching Logic

```
slot.start >= preferred.start
AND
slot.end <= preferred.end
```

---

## Priority

1. Time match
2. Oldest waiting participant

---

# 11. Scheduling Decision Engine

### Case 1 — Auto Assign

```
IF slot.start - current_time < 12 hours
```

Action:

* Automatically assign slot
* Send confirmation email

---

### Case 2 — Re-invite

```
IF slot.start - current_time ≥ 12 hours
```

Action:

* Send booking link
* Participant selects slot

---

# 12. Booking Flow

```
Participant selects slot
   ↓
Slot capacity checked
   ↓
Booking created
   ↓
Status = SCHEDULED
```

---

# 13. Moderator Interaction

Moderators:

* Add availability
* View bookings
* Receive AI suggestions

---

# 14. AI Scheduling Layer (AI Lab)

## Input

* Waiting queue
* Preferred times
* Timezones
* Demand density

---

## Output

```
Recommended Slots:

6:30 PM → 4 participants
7:00 PM → 5 participants
7:30 PM → 5 participants
```

---

## Moderator UI

```
AI Suggested Slots

[Create All] [Select Slots]
```

---

# 15. Notifications

### Participant

* Booking confirmation
* Slot available (from queue)

### Moderator

* New booking
* Suggested availability

---

# 16. APIs

## Participants

* GET /participants
* GET /participants/:id

---

## Survey

* POST /survey/submit
* GET /survey/:userId

---

## Slots

* GET /slots?projectId=
* POST /slots

---

## Booking

* POST /bookings
* GET /bookings/:userId

---

## Waiting Queue

* POST /waiting-queue
* GET /waiting-queue
* POST /match-slots

---

# 17. Permissions

Admin:

* Full access

Participant:

* Own survey + booking only

Moderator:

* Availability + assigned interviews

---

# 18. UX Requirements

* Fast slot selection
* Clear availability view
* Mobile friendly scheduling
* Real-time slot updates

---

# 19. Edge Cases

* Slot full → disable selection
* Double booking prevention
* Timezone conversion
* Last-minute auto assignment

---

# 20. Future Enhancements

* No-show prediction
* Auto scheduling
* Smart reminders
* Calendar integrations

---

# 21. System Summary

```
Participant → Survey → Qualification
   ↓
Slot Selection
   ↓
If no slot → Waiting Queue
   ↓
AI + Matching Engine
   ↓
Auto Assign / Re-invite
   ↓
Interview Scheduled
```

```

---

# 🔥 Why this is powerful

This spec gives you:

✅ Full lifecycle  
✅ Real scheduling engine  
✅ AI integration  
✅ Production-ready architecture  
✅ Works with your existing modules  

---