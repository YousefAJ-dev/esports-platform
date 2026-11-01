import type { AuthUser } from "../types/auth";

// Mirrors the server's rules (backend/middleware + utils/businessRules.js) so the UI only shows
// actions that will work. These never grant anything: the server checks every request again.
// See docs/RBAC.md for the full table.

type User = AuthUser | null;

export const hasRole = (user: User, role: string) => Boolean(user?.roles.includes(role));
export const isAdmin = (user: User) => hasRole(user, "Admin");

// Admin passes every check, like on the server
const isAdminOr = (user: User, role: string) => isAdmin(user) || hasRole(user, role);

// ---- Events and matches: Organizers manage the events they created
export const canCreateEvent = (user: User) => isAdminOr(user, "Organizer");

export const canManageEvent = (user: User, eventCreatedBy: number | null | undefined) =>
	isAdmin(user) || (hasRole(user, "Organizer") && user?.user_id === eventCreatedBy);

// ---- Teams: Team Managers create one team and manage only that one
export const canCreateTeam = (user: User) =>
	isAdmin(user) || (hasRole(user, "Team Manager") && !user?.managed_team_id);

export const canManageTeam = (user: User, teamId: number | null | undefined) =>
	isAdmin(user) || (hasRole(user, "Team Manager") && teamId != null && user?.managed_team_id === teamId);

// ---- Members: managers create members and edit those on their own roster
export const canCreateMember = (user: User) => isAdminOr(user, "Team Manager");

export const canEditMember = (user: User, memberTeamId: number | null | undefined) =>
	isAdmin(user) || (hasRole(user, "Team Manager") && memberTeamId != null && user?.managed_team_id === memberTeamId);

// Activating/deactivating and deleting teams, members and users is Admin-only
export const canDeactivate = isAdmin;

// Visitors see the public tournament view; team/member pages need a login
export const canViewPrivatePages = (user: User) => Boolean(user);
