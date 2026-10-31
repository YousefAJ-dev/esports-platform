# Plan: Members, Teams and Users pages

## Context
Events and Sessions each have a folder with List, Details, Edit and Create pages. Members, Teams and Users are flat stubs in `frontend/src/pages/`:
- `MembersPage.tsx` and `UsersPage.tsx` hold hard-coded sample data, and both export a function named `DashboardPage`.
- `TeamsPage.tsx` has the list only.
- `membersApi.ts` is a copy of `dashboardApi`, `usersApi.ts` doesn't exist, and `types/members.ts` and `types/users.ts` wrongly contain an `eventsOverview` type.

"Usage" does not exist anywhere in the repo. You said to treat Users as the third group. The goal is to bring all three groups up to the Events/Sessions standard.

## Conventions to follow (from `pages/events` and `pages/sessions`)
- Tabs for indentation. Use `import type`. No unused locals or params (`tsconfig` enforces this).
- Local `useState` and `useEffect`, with `isLoading`/`errorMsg` early returns.
- Only the existing CSS classes (`stat-card`, `green-btn`, `purple-input-box`, `main-content-layout`, and so on).
- `apiRequest<T>` from `src/api/apiClient.ts`, and `inputChangeHandler` from `src/helper/helperFunctions.ts`.
- Short comments that explain intent, in team style.

## Frontend changes (`frontend/src`)
1. **Types** (`types/members.ts`, `teams.ts`, `users.ts`)
   - `MemberSummary`, `MemberOverview` and `MemberCardProp`, with `Update*Payload = Partial<...>` and `Create*Payload = Omit<..., id>`.
   - Teams: add `TeamOverview` and the Create/Update payloads.
   - Users: add the same set. The Update payload leaves out the password.
2. **API** (`api/membersApi.ts`, `teamsApi.ts`, `usersApi.ts`)
   - Members: `getMembers`, `getMemberByID`, `getMemberOverview`, `createMember`, `updateMemberByID` and `deleteMemberByID`.
   - Teams: add `getTeamByID`, `getTeamOverview`, `createTeam`, `updateTeamByID` and `deleteTeamByID` to the existing file.
   - Users: the same set as Members.
3. **Components** (`components/ui/`): add `MemberCard` and `UserCard`, modeled on `TeamCard`. Each is wrapped in a `Link` to its details page.
4. **Pages**, moved into `pages/members/`, `pages/teams/` and `pages/users/`, each with four files:

   | Page | Behavior |
   |---|---|
   | List | Fetches once, shows a count `stat-card`, an "Add New" link and a card grid. |
   | Details | Reads `:id`, fetches the overview, has Edit and Delete actions, and confirms before deleting. |
   | Edit | Loads by `:id`, PATCHes only the changed fields, and navigates back to Details. |
   | Create | Controlled form that POSTs, then navigates to Details. |

   - Members (`MembersPage.tsx`, `MemberDetailsPage.tsx`, `EditMemberDetails.tsx`, `CreateMemberPage.tsx`): `date_of_birth` uses `<input type="date">`, and the overview shows age, team, position and activity.
   - Teams (`TeamsPage.tsx`, `TeamDetailsPage.tsx`, `EditTeamDetails.tsx`, `CreateTeamPage.tsx`): Details also shows the roster from `/teams/:id/roster`.
   - Users (`UsersPage.tsx`, `UserDetailsPage.tsx`, `EditUserDetails.tsx`, `CreateUserPage.tsx`): Create also needs a password field. The edit form leaves the password out.
   - The `is_active` checkbox is handled with a small local `handleCheckbox`, because `inputChangeHandler` only handles string values. A shared generic helper would be cleaner, so I'd extend `inputChangeHandler` to read `checked` for checkboxes.
   - Errors from the backend (400 `missingFields`, 404) are shown to the user. Today `apiRequest` throws a generic message, so I'd make it read the response body's `error` field.
   - On Edit pages, show the loading state with a proper early return. The existing `EditEventDetails.tsx` has a never-returned `<p>`, so I won't copy that.
5. **Routing** (`App.tsx`): add `:id`, `:id/edit` and `new` routes for `members`, `teams` and `users`, and fix the stray imports and function names.

## Backend fixes (`backend/routes`)
- `teams.routes.js`:
  - Remove the trailing space in `"contact_email "` (POST and PATCH).
  - Add the missing comma in the `/:id/members` SQL.
  - Return 404, not a 500, when the overview has no row (`result.rows.length === 0` instead of `rows[0].length`).
- `users.routes.js`: the POST `INSERT INTO ( ... )` has no table name and 5 placeholders for 6 values. Fix it to `INSERT INTO users (...) VALUES ($1..$6)`.
- Password hashing: `bcrypt` is already a dependency. POST should accept a plain `password` and hash it server-side, rather than the client sending `password_hash`.
- `members.routes.js`: PATCH and DELETE return 201. Change them to 200, and keep this limited to what the new pages need.

## Complexity notes
- Every list page does one fetch with no N+1 requests, and renders by `.map` in O(n).
- Detail pages fetch with `Promise.all` when more than one request is needed, so they run in parallel rather than sequentially.
- Effects have cleanup flags to avoid state updates after unmount.
- The Edit forms send only changed fields, which keeps payloads small and the PATCH query minimal.

## Verification
1. `cd frontend && npm run build` (runs `tsc -b`, so it catches unused-variable errors).
2. Start the backend and run `npm run dev` in `frontend`.
3. For each of Members, Teams and Users:
   - Open the list.
   - Create a record.
   - Open its details.
   - Edit it.
   - Delete it.
4. Check the error paths: a bad `/members/abc` ID, a missing required field, and a duplicate `display_name`.
5. Test the Teams roster and the fixed team POST and PATCH.
6. `git status` should show only the intended files.
