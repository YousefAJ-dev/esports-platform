# Esports Tournament Management SaaS Platform

A full-stack event management platform for creating, organizing, and managing esports tournaments, teams, members, events, and sessions.

The project is designed around a RESTful API and normalized PostgreSQL database, with a React frontend for interacting with tournament data.

Although esports is used as the primary use case, the database and application structure were intentionally generalized so the platform can potentially be adapted for other event-based environments such as professional or local sports tournaments, corporate events, and other scheduled competitions.

## Tech Stack

### Frontend

* React
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js
* RESTful APIs

### Database

* PostgreSQL
* SQL

### Infrastructure / Development

* AWS EC2
* Ubuntu Linux
* Git
* GitHub
* SSH

## Project Goals

I started this project with a backend-first approach because REST API development and relational database design were areas where I wanted to gain more hands-on experience.

The project is focused on:

* Designing a structured relational database
* Building RESTful API endpoints
* Implementing application business rules
* Connecting frontend, backend, and database systems
* Practicing debugging across multiple environments
* Building toward a deployable full-stack SaaS application

## Current Features

### Event Management

* Create events
* Retrieve event information
* Update event information
* Delete events
* Track event start and end times
* Track event status and location

### Team and Member Management

* Store team information
* Store member/player information
* Associate members with teams
* Maintain team membership history

### Session Management

* Associate sessions with events
* Assign participating teams to sessions
* Track session scheduling and results
* Store member performance statistics for individual sessions

### API

* Node.js/Express REST API
* JSON request and response handling
* Required-field validation
* Optional-field handling
* HTTP status handling
* Parameterized PostgreSQL queries
* Error handling

## Database Design

The PostgreSQL database is normalized and uses relationships and constraints to maintain data integrity.

Core entities include:

* Members
* Teams
* Events
* Sessions
* Team Members
* Session Teams
* Member Session Statistics

The schema uses:

* Primary keys
* Foreign keys
* Composite keys
* PostgreSQL enums
* Unique constraints
* Referential integrity
* Business-rule constraints

The database structure was intentionally designed with reusable terminology rather than tying every entity directly to esports.

This allows concepts such as `events`, `sessions`, `members`, and `teams` to potentially support other event-management use cases.

## Architecture

```text
                 React Frontend
                       |
                       |
                  REST API
                       |
                 Node.js / Express
                       |
                       |
                   PostgreSQL
                       |
                 AWS / Ubuntu
```

## Role-Based Access Control

Role-Based Access Control is planned for several user types:

### Admin

* Manage user roles
* Manage teams
* Access administrative functionality
* View audit information
* Perform emergency overrides

### Event Organizer / Coordinator

* Create and manage events
* Schedule sessions
* Assign teams
* Update event information

### Team Manager

* View team and player information
* Manage roster-related information
* Submit scheduling or event requests

### Analyst

* View player performance data
* View relevant team statistics
* Submit performance evaluations

RBAC is currently part of the project's development roadmap and should not be considered fully implemented yet.

## Example REST API Structure

```text
/api/events
/api/teams
/api/members
/api/sessions
/api/users
```

Example:

```http
POST /api/events
```

```json
{
  "event_name": "Summer Championship",
  "description": "Regional tournament",
  "location": "San Antonio, TX",
  "start_on": "2026-09-15T18:00",
  "end_on": "2026-09-17T22:00"
}
```

## Screenshots

### Dashboard

<img width="2535" height="1264" alt="image" src="https://github.com/user-attachments/assets/f742105e-9183-43ad-9ec3-6a24d7d6add8" />

### Event Management

<img width="2535" height="1254" alt="image" src="https://github.com/user-attachments/assets/97e7e08b-fe5e-4a37-a9b4-1801ee93814e" />

### Event Details

<img width="2531" height="1245" alt="image" src="https://github.com/user-attachments/assets/d29b9588-83de-41bb-a9a9-d27d1d42a14a" />

### Event Edit

<img width="2541" height="1251" alt="image" src="https://github.com/user-attachments/assets/74927b00-82e3-4ab3-9266-3e7551cb5715" />

### Event Creation

[Screenshot Here]

> Screenshots will continue to be updated as frontend development progresses.

## Running the Project Locally

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone https://github.com/YousefAJ-dev/esports-platform/
cd esports-platform
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Configure PostgreSQL

Create a PostgreSQL database for the application and configure the required database credentials.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esports_platform
DB_USER=your_username
DB_PASSWORD=your_password
```

Do not commit `.env` files or database passwords to GitHub.

### Initialize the Database

Run the included schema and seed files from the database directory.

```text
db/
├── schema/
└── seed/
```

### Start the Backend

```bash
npm run dev
```

### Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development Roadmap

### In Progress

* React/Tailwind frontend
* Additional REST API functionality
* Improved validation and error handling
* Event and session management workflows

### Planned

* Role-Based Access Control
* Authentication and authorization
* Automated testing
* Docker containerization
* CI/CD pipeline
* NGINX reverse proxy
* AWS production deployment
* CloudWatch monitoring
* Audit logging

## What I Am Learning

This project is intentionally being used to strengthen areas of software engineering where I wanted more practical experience, particularly backend development, database architecture, APIs, and deployment.

Some of the challenges I have worked through include:

* Designing database relationships before implementing application logic
* Determining appropriate primary and composite keys
* Maintaining relational data integrity
* Building Express routes around PostgreSQL queries
* Handling required versus optional API fields
* Debugging PostgreSQL authentication and environment configuration
* Connecting development across Windows, VS Code, PostgreSQL, and an AWS Ubuntu server
* Structuring a project so the frontend, API, and database can evolve independently

Rather than focusing only on completing features, I use the project to understand why different architectural and implementation decisions work.

## Project Status

🚧 **Active Development**

The backend and database are currently the most developed portions of the application. Frontend functionality and deployment infrastructure are continuing to be expanded.

## Author

**Yousef Alzubi Jr.**

Computer Science Graduate — University of Texas at San Antonio

* LinkedIn: [[LinkedIn Profile]](https://www.linkedin.com/in/yousef-the-dev/)
* GitHub: [[GitHub Profile]](https://github.com/YousefAJ-dev)
