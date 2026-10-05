import { Link } from "react-router";
import { convertDate } from "../../helper/helperFunctions";
import type { SessionCardProp } from "../../types/sessions";

export function SessionCard( {session} : SessionCardProp ){

	const start_date = convertDate(session.scheduled_start);
	const end_date = convertDate(session.scheduled_end);

	return(
		<Link 
			to={`/sessions/${session.session_id}`} 
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<p className="stat-id">
					Match #{session.session_id}
				</p>
				<p className="status-pill">
					{session.status}
				</p>
			</div>
			<div className="stat-body">
				<h2 className="mt-2 text-xl font-semibold text-white">
					Match Bracket: {session.session_type}
				</h2>
				<p>Event ID: {session.event_id}</p>
				<div className="stat-field-grid">
					<div>
						<p className="text-slate-500">
							Scheduled Start Date
						</p>
						<p className="mt-3 stat-field-value">{start_date}</p>
					</div>
					<div>
						<p className="text-slate-500">
							Scheduled End Date
						</p>
						<p className="mt-3 stat-field-value">{end_date}</p>
					</div>
					
				</div>
				<p className="stat-link-text">
					View details →
				</p>
			</div>
		</Link>
	);

}

export default SessionCard;