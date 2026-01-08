# Business Rules & Constraints

## Member ↔ Team
- A Member cannot be part of multiple Teams at the same time.
- Historical team memberships must be preserved.

## Team ↔ Session
- A Session must be associated with exactly two Teams.
- A Team may participate in multiple Sessions.

## Event ↔ Session
- An Event may have many Sessions.
- Each Session must be associated with exactly one Event.

## Session Constraints
- A Session must have a start and end date-time before being completed.
- Once a Session is completed, it cannot be modified.
- Member session statistics can only be recorded if the Member’s Team participated in the Session.
- Each Member may have at most one statistics record per Session.

## RBAC Constraints
- Only Members with the **Admin** role may assign or revoke roles.
- Only Members with the **Event Coordinator** role may create or modify Events and Sessions.
- Only Members with the **Team Manager** role may modify Team membership.

