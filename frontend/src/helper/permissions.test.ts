import { describe, expect, test } from "vitest";
import type { AuthUser } from "../types/auth";
import {
	canCreateEvent,
	canCreateMember,
	canCreateTeam,
	canDeactivate,
	canEditMember,
	canManageEvent,
	canManageTeam,
	canViewPrivatePages,
	isAdmin,
} from "./permissions";

// These helpers only decide what the UI shows; the server enforces the same rules.
// The cases follow the table in docs/RBAC.md, so a drift between the two shows up here.

const makeUser = (userId: number, roles: string[], managedTeamId: number | null = null): AuthUser => ({
	user_id: userId,
	username: `user${userId}`,
	first_name: "Test",
	last_name: "User",
	roles,
	managed_team_id: managedTeamId,
});

const admin = makeUser(1, ["Admin"]);
const organizer = makeUser(2, ["Organizer"]);
const analyst = makeUser(3, ["Analyst"]);
const manager = makeUser(4, ["Team Manager"], 1);
const managerWithoutTeam = makeUser(15, ["Team Manager"]);
const visitor = null;


describe("events and matches", () => {

	test("Organizers and Admins can create events; nobody else can", () => {
		expect(canCreateEvent(admin)).toBe(true);
		expect(canCreateEvent(organizer)).toBe(true);
		expect(canCreateEvent(analyst)).toBe(false);
		expect(canCreateEvent(manager)).toBe(false);
		expect(canCreateEvent(visitor)).toBe(false);
	});

	test("Organizers manage only the events they created", () => {
		expect(canManageEvent(organizer, 2)).toBe(true);
		expect(canManageEvent(organizer, 99)).toBe(false);
		expect(canManageEvent(admin, 99)).toBe(true);
		expect(canManageEvent(analyst, 3)).toBe(false);
		expect(canManageEvent(visitor, 2)).toBe(false);
	});
});


describe("teams and members", () => {

	test("a Team Manager can create a team only if they don't run one yet", () => {
		expect(canCreateTeam(managerWithoutTeam)).toBe(true);
		expect(canCreateTeam(manager)).toBe(false);
		expect(canCreateTeam(admin)).toBe(true);
		expect(canCreateTeam(organizer)).toBe(false);
	});

	test("Team Managers manage only their own team", () => {
		expect(canManageTeam(manager, 1)).toBe(true);
		expect(canManageTeam(manager, 2)).toBe(false);
		expect(canManageTeam(managerWithoutTeam, 1)).toBe(false);
		expect(canManageTeam(admin, 2)).toBe(true);
		expect(canManageTeam(organizer, 1)).toBe(false);
	});

	test("members can be created by Team Managers and edited while on their roster", () => {
		expect(canCreateMember(manager)).toBe(true);
		expect(canCreateMember(analyst)).toBe(false);
		expect(canEditMember(manager, 1)).toBe(true);
		expect(canEditMember(manager, 2)).toBe(false);
		expect(canEditMember(manager, null)).toBe(false);
		expect(canEditMember(admin, null)).toBe(true);
	});
});


describe("Admin-only and private pages", () => {

	test("only Admins deactivate or delete records", () => {
		expect(canDeactivate(admin)).toBe(true);
		expect(canDeactivate(organizer)).toBe(false);
		expect(canDeactivate(manager)).toBe(false);
		expect(isAdmin(visitor)).toBe(false);
	});

	test("visitors can't open private pages; any logged-in user can", () => {
		expect(canViewPrivatePages(visitor)).toBe(false);
		expect(canViewPrivatePages(analyst)).toBe(true);
	});
});
