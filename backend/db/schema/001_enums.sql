CREATE TYPE status_enum AS ENUM (
	'Upcoming', 
	'In-Progress', 
	'Cancelled', 
	'Completed'
);

CREATE TYPE session_type_enum AS ENUM (
    'Qualifier',
    'Group Stage',
    'Round of 16',
    'Quarter-Finals',
    'Semi-Final',
    'Third Place Match',
    'Final',
    'Exhibition'
);


CREATE TYPE team_position_enum AS ENUM (
	'Player', 'Captain', 'Substitute'
);