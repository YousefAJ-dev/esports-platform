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

	const { name, value } = e.target;

	setFormData( (currentData) => {

		if (currentData === null || typeof currentData !== "object"){ 
			return currentData 
		};

		return {
			...currentData,
			[name]: value
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