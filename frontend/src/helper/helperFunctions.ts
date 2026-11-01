import type React from "react";

/*
type loadAPIData = {
	getData: Object,
	setError: string,
	setIsLoading: boolean
};
*/

export function convertTime(t:string){
	const time = new Date(t).toLocaleTimeString([], {
		hour: 'numeric',
		minute:"2-digit"
	});
	
	return time;
}

export function convertDate(d:string){
	const date = new Date(d).toLocaleDateString([], {
		hour: 'numeric',
		minute:"2-digit"
	});

	return date;
}

export function inputChangeHandler<T>( 
	e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setFormData: React.Dispatch<React.SetStateAction<T>> 
){

	const { name, value, type } = e.target;

	// Checkboxes store a boolean, everything else stores the string value
	const newValue = type === "checkbox" && e.target instanceof HTMLInputElement
		? e.target.checked
		: value;

	setFormData( (currentData) => {

		if (currentData === null || typeof currentData !== "object"){ 
			return currentData 
		};

		return {
			...currentData,
			[name]: newValue
		} as T;

	});

};


// Formats a stored timestamp as the "YYYY-MM-DDTHH:mm" string a datetime-local input expects.
// Pass the record's timezone: the backend reads submitted times as wall-clock time in that zone,
// so the input has to show them in that zone too or saving would shift them.
export function convertDateToInput(date: string, timeZone?: string) {

	const format = (zone?: string) => new Intl.DateTimeFormat("en-CA", {
		timeZone: zone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(new Date(date));

	let parts: Intl.DateTimeFormatPart[];
	try {
		parts = format(timeZone);
	} catch {
		// Unknown timezone name, fall back to the browser's zone
		parts = format();
	}

	const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";

	return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}


// Returns an error message when an end time isn't after its start time, otherwise null.
// Both values are datetime-local strings in the same zone, so a string compare is enough.
export function getTimeRangeError(start: string | undefined | null, end: string | undefined | null, startLabel = "start time", endLabel = "End time") {

	if (!start || !end) return null;

	return end <= start ? `${endLabel} must be after ${startLabel}.` : null;
}

// Returns only the fields that differ from the original, so PATCH payloads stay minimal. O(k) over keys.
export function getChangedFields<T extends object>(original: T, current: T): Partial<T> {

	const changes: Partial<T> = {};

	for (const key of Object.keys(current) as (keyof T)[]) {
		if (current[key] !== original[key]) {
			changes[key] = current[key];
		}
	}

	return changes;
}
