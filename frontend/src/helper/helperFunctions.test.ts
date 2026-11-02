import { describe, expect, test } from "vitest";
import { convertDateToInput, getChangedFields, getTimeRangeError } from "./helperFunctions";

describe("convertDateToInput", () => {

	// Guards the old bug where editing an event shifted its end time (3pm became 3am)
	test("shows a stored time in the record's own timezone", () => {
		// 21:00 UTC is 3pm in Chicago in December (UTC-6)
		expect(convertDateToInput("2026-12-05T21:00:00.000Z", "America/Chicago")).toBe("2026-12-05T15:00");
		expect(convertDateToInput("2026-12-05T21:00:00.000Z", "America/New_York")).toBe("2026-12-05T16:00");
	});

	test("uses a 24-hour clock, so midnight is 00 rather than 24", () => {
		expect(convertDateToInput("2026-12-06T06:00:00.000Z", "America/Chicago")).toBe("2026-12-06T00:00");
	});

	test("falls back to the browser's zone for an unknown timezone instead of crashing", () => {
		expect(convertDateToInput("2026-12-05T21:00:00.000Z", "Not/AZone")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
	});
});


describe("getTimeRangeError", () => {

	test("an end at or before the start is an error", () => {
		expect(getTimeRangeError("2026-12-05T15:00", "2026-12-05T14:00")).toMatch(/must be after/);
		expect(getTimeRangeError("2026-12-05T15:00", "2026-12-05T15:00")).toMatch(/must be after/);
	});

	test("a later end, or a blank value, is fine", () => {
		expect(getTimeRangeError("2026-12-05T15:00", "2026-12-05T16:00")).toBeNull();
		expect(getTimeRangeError("", "2026-12-05T16:00")).toBeNull();
		expect(getTimeRangeError("2026-12-05T15:00", null)).toBeNull();
	});
});


describe("getChangedFields", () => {

	test("returns only the fields that changed", () => {
		const original = { team_name: "Titans", contact_email: "a@x.com", is_active: true };
		const current = { team_name: "Titans", contact_email: "b@x.com", is_active: false };

		expect(getChangedFields(original, current)).toEqual({ contact_email: "b@x.com", is_active: false });
	});

	test("returns an empty object when nothing changed", () => {
		const record = { team_name: "Titans" };
		expect(getChangedFields(record, { ...record })).toEqual({});
	});
});
