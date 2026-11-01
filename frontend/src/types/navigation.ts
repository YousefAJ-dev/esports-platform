// One link in the breadcrumb trail
export type Crumb = {
	label: string,
	to: string
};

// Shape of router state passed between linked pages
export type TrailState = {
	trail?: Crumb[]
};
