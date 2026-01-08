# Requirements

## Purpose
Provide an organized platform for professional players, analysts, and event coordinators to view player performance, match and character statistics, and to manage matches by adding, editing, or removing upcoming or past events.

Although the system is demonstrated using esports data, it was intentionally designed to be **domain-agnostic** and reusable for other event-based performance tracking environments.

---

## Use Cases
- Performance Tracking  
- Event Scheduling  
- Analytics  

---

## Example Domain Objects
- Players  
- Teams  
- Matches  
- Tournaments  

---

## Roles & Capabilities

### Player
- View personal performance statistics:
  - Character win rates
  - Gold per minute
  - Average kills/deaths/assists
  - Match history
- View team win/loss overview

### Team Manager
- Access all player stats for their team
- View overall team statistics:
  - Team win/loss
  - Match outcomes
  - Side-based statistics
- Manage team roster and player assignments
- Submit requests or event schedule updates

### Analyst
- Access all player performance data
- Limited view of team information:
  - Team name
  - Active players
  - Team statistics
- Review and submit performance evaluations

### Event Coordinator
- Add, edit, and delete tournaments and matches
- Schedule event times and assign teams to events
- Notify players and managers of event updates

### Admin (System-Wide Control)
- Assign or remove roles:
  - Player
  - Team Manager
  - Analyst
  - Event Coordinator
- Add or remove teams from the system
- Access audit logs for all actions
- Perform emergency fixes or overrides

---

## Functional Requirements

### Manage Event Information
- Add, edit, or delete tournament events
- Schedule event dates, times, and locations
- Assign participating teams to events
- Notify relevant users of event updates
- Restrict event modification to Event Coordinators and Admins

### Manage Team Information
- Add, edit, or remove players
- Assign or remove players from teams
- Track team statistics:
  - Win/loss
  - Side-based results
  - Aggregate player performance
- Restrict team management to Team Managers and Admins

### Display Match and Player Statistics
- Display individual player stats per match:
  - Kills, deaths, assists
  - Champion
  - Position
- Display aggregate stats across matches:
  - Average K/D/A
  - Win rate
  - Gold per minute
- Display team-level stats:
  - Team win/loss
  - Side-based performance
- Provide filters by:
  - Player
  - Team
  - Champion
  - Position
- Allow Analysts to generate performance trend reports

---

## Non-Functional Requirements

### Performance & Reliability
- Calculate statistics efficiently and near real-time
- Support at least 50–100 concurrent users
- Ensure data accuracy and consistency
- Provide audit trails for all match and stat modifications

### Accessibility
- Accessible via modern web browsers
- Mobile-friendly responsive design

