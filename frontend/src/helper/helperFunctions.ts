type loadAPIData = {
	getData: Object,
	setError: string,
	setIsLoading: boolean
};

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