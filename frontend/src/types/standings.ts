// One row of GET /standings; draws are completed matches with no winner
export type Standing = {
	team_id: number,
	team_name: string,
	is_active: boolean,
	played: number,
	wins: number,
	losses: number,
	draws: number,
	score_for: number,
	score_against: number
};
