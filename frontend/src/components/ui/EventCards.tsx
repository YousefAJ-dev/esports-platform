import { Link } from "react-router";
import { convertDate } from "../../helper/helperFunctions";
import type { EventCardProp } from "../../types/events";

function EventCard({event}: EventCardProp) {

	const start_date = convertDate(event.start_on);
	const end_date = convertDate(event.end_on);

	return (
		<Link
			to={`/events/${event.event_id}`}
			className="stat-card stat-card-clickable"
		>
			<div className="stat-card-header">
				<div>
					<p className="stat-id">
						Event #{event.event_id}
					</p>

					<h2 className="mt-2 text-xl font-semibold text-white">
						{event.event_name}
					</h2>
				</div>

				<span className="status-pill">
					{event.status}
				</span>
			</div>

			<div className="stat-body">
				<div>
					<p className="text-slate-500">Location</p>
					<p className="stat-field-value">
						{event.location}
					</p>
				</div>

				<div className="stat-field-grid">
					<div>
						<p className="text-slate-500">Start Date</p>
						<p className="stat-field-value">
							{start_date}
						</p>
					</div>

					<div>
						<p className="text-slate-500">End Date</p>
						<p className="stat-field-value">
							{end_date}
						</p>
					</div>
				</div>
			</div>

			<p className="stat-link-text">
				View details →
			</p>
		</Link>
	);

}

export default EventCard;