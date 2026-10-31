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


export function convertDateToInput(date:string){

	const minute = String(new Date(date).getMinutes()).padStart(2, "0");
	const hour = String(new Date(date).getHours()).padStart(2, "0");
	const year = String(new Date(date).getFullYear()).padStart(2, "0");
	const month = String(new Date(date).getMonth() + 1).padStart(2, "0");
	const day = String(new Date(date).getDate()).padStart(2, "0");

	return `${year}-${month}-${day}T${hour}:${minute}`;
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
