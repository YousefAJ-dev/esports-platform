# Database Schema Draft

## Entities

### Core Entities
- Member
- Team
- Session
- Event

### Supporting Entities
- Member_Session_Stats
- Team_Members
- Session_Teams
- Roles
- Permission

---

## Relationships
- Member ↔ Team (Many-to-Many) → Junction Table: Team_Members
- Team ↔ Session (Many-to-Many) → Junction Table: Session_Teams
- Event ↔ Session (One-to-Many) → FK in Session
- Member ↔ Session (Many-to-Many via statistics)

> **Note**
> - Many-to-Many relationships require junction tables  
> - One-to-Many relationships require a foreign key on the “many” side  

---

## Schema Definition

### Member
- Member_id (PK)
- Real_name
- Display_name
- Date_of_birth
- Created_at
- Status (Active / Inactive)

### Team
- Team_id (PK)
- Name
- Created_at
- Status (Active / Inactive)
- Contact_Email

### Session
- Session_id (PK)
- Event_id (FK)
- Scheduled_start
- Scheduled_end
- Actual_start
- Actual_end
- Session_type
- Status (Upcoming / In-Progress / Completed)

### Event
- Event_id (PK)
- Name
- Description
- Location
- Timezone
- Start_Date
- Start_Time
- Event_Type
- Status (Upcoming / In-Progress / Completed)

---

## Junction Tables

### Member_Session_Stats
**Composite Primary Key:** (Member_id, Session_id)
- Member_id (FK)
- Session_id (FK)
- Kills
- Deaths
- Assists
- Champion
- Position
- Result (Win / Loss / Draw)

### Team_Members
**Composite Primary Key:** (Member_id, Team_id, Start_date)
- Member_id (FK)
- Team_id (FK)
- Created_at
- Updated_at
- Start_date
- End_date
- Position

### Session_Teams
**Composite Primary Key:** (Team_id, Session_id)
- Session_id (FK)
- Team_id (FK)
- Result (Win / Loss / Draw)
- Side (Red / Blue, Home / Away)
- Score

---

## RBAC Tables

### Roles
- Role_id (PK)
- Role_name (Player, Team Manager, Analyst, Event_Coordinator, Admin)
- Description

### Permission
- Permission_id (PK)
- Permission_name (CREATE_EVENT, EDIT_EVENT, VIEW_ALL_STATS, MANAGE_TEAM)
- Description

### Role_Permission
**Composite Primary Key:** (Role_id, Permission_id)
- Role_id (FK)
- Permission_id (FK)

### Member_Role
**Composite Primary Key:** (Role_id, Member_id)
- Member_id (FK)
- Role_id (FK)
- Created_at
- Updated_at
- Assigned_on
- Revoked_on (nullable)

---

## Aggregates (Derived)
- Member_Overall_Stats
- Team_Overall_Stats

