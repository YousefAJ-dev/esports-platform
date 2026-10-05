import { useState, useEffect } from "react";
import type { TeamSummary } from "../types/teams";
import { getTeams } from "../api/teamsApi";
import TeamCard from "../components/ui/TeamCard";

function TeamsPage (){

	const [ teams, setTeams ] = useState<TeamSummary[]>([]);
	const [ errorMsg, setErrorMsg ] = useState<null|string>(null);
	const [ isLoading, setIsLoading ] = useState<boolean>(true);

	useEffect( () => {
		async function loadSessionData() {
			try {
				const data = await getTeams();
				setTeams(data);
			} catch {
				setErrorMsg("Failed to Fetch Team Data")
			} finally {
				setIsLoading(false);
			}
		}
		loadSessionData();
	}, []);

	if (isLoading){
		<p>Page Loading...</p>
	}
	
	if (!teams){
		<p>{errorMsg}</p>
	}

	const TeamsList = teams.map(team => (
		<TeamCard 
			key={team.team_id}
			team={team}
		/>));

	return(
		<section className="min-h-screen px-10 flex flex-col items-center bg-slate-800">
			<div className="flex-1 py-15">
				<p className="text-4xl">Team</p>
				<p className="text-xl">An overview of sessions that belong to this platform</p>
			</div>
			<main  className="flex-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{TeamsList}
				</div>
			</main>
		</section>
	)
}

export default TeamsPage;