-- reset db
\i db/schema/reset_data.sql

-- ====================================
-- MEMBERS
-- ====================================

INSERT INTO members (real_name, display_name, date_of_birth)
VALUES 
('Marie Curie', 'MCurie', '1867-11-7'),
('Charles Darwin', 'DaFittest', '1802-02-12'),
('Stephen Hawking', 'SpaceBound', '1942-01-08'),
('Galileo Galilei', 'GGs', '1564-02-15'),
('Niels Bohr', 'Atomic', '1885-10-07'),
('Leonhard Euler', 'Math2EZ', '1707-04-15'),

('Carl Friedrich Gauss', 'RNGauss', '1777-04-30'),
('Euclid', 'ShapeShifter', '0325-01-01'),
('Blaise Pascal', 'NoPressure', '1885-10-07'),
('John von Neumann', 'VNeumann', '1903-12-28'),
('Plato', 'ThePhilosopher', '1428-01-01'),
('Aristotle ', 'Mr.Logic', '1382-01-01'),

('Rihanna Fenty', 'Riri', '1988-02-20'),
('Elvis Presley', 'Hound Dog', '1935-01-08'),
('Justin Bieber', 'Baby JB', '1844-10-15'),
('Ikura Yaosabi', 'The Idol', '2000-09-25'),
('Michael Jackson', 'King Pop', '1958-08-29'),
('David Bowie', 'Chameleon', '1947-01-08'),

('Michelangelo', 'El Chapel', '1475-03-06'),
('Rembrandt van Rijn', 'NightWatch', '1606-07-15'),
('Vincent van Gogh', 'Sunflower', '1853-03-30'),
('Pablo Picasso', 'Guernica', '1881-10-25'),
('Claude Monet', 'Impressionist', '1840-11-14'),
('Artemisia Gentileschi', 'Maidservant', '1593-07-08'),

('Tom Hanks', 'ForrestRun', '1956-07-09'),
('Keanu Reeves', 'NeoMatrix', '1964-09-02'),
('Leonardo DiCaprio', 'TitanicLeo', '1974-11-11'),
('Denzel Washington', 'Equalizer', '1954-12-28'),
('Robert Downey Jr.', 'IronRDJ', '1965-04-04'),
('Scarlett Johansson', 'BlackWidow', '1984-11-22'),

('Michael Jordan', 'AirJordan', '1963-02-17'),
('Usain Bolt', 'Lightning', '1986-08-21'),
('Serena Williams', 'AceQueen', '1981-09-26'),
('Lionel Messi', 'GOAT10', '1987-06-24'),
('Lee Sang-hyeok', 'Faker', '1996-05-07'),
('Tiger Woods', 'FairwayKing', '1975-12-30'),

('Poseidon', 'SeaKing', '1001-01-01'),
('Hades', 'Underworld', '1002-01-01'),
('Ares', 'WarBringer', '1003-01-01'),
('Athena', 'WisdomBlade', '1004-01-01'),
('Apollo', 'SunSinger', '1005-01-01'),
('Hermes', 'Messenger', '1006-01-01'),

('Jupiter', 'SkyFather', '1100-01-01'),
('Mars', 'RedLegion', '1101-01-01'),
('Neptune', 'DeepBlue', '1102-01-01'),
('Mercury', 'SwiftFeet', '1103-01-01'),
('Venus', 'StarCharm', '1104-01-01'),
('Pluto', 'KingNecro', '1106-01-01'),

('Vishnu', 'Preserver', '1201-01-01'),
('Brahma', 'Creator', '1202-01-01'),
('Krishna', 'FluteMaster', '1203-01-01'),
('Rama', 'BowMaster', '1204-01-01'),
('Indra', 'StormKing', '1205-01-01'),
('Lakshmi', 'Prosperer', '1206-01-01'),

('Baldur', 'PureLight', '1300-01-01'),
('Thor', 'HammerTime', '1301-01-01'),
('Loki', 'Trickster', '1302-01-01'),
('Heimdall', 'Guardian', '1302-01-01'),
('Frigg', 'Mother', '1302-01-01'),
('Freya', 'GoldenHeart', '1303-01-01');


-- ====================================
-- TEAMS
-- ====================================


INSERT INTO teams (team_name, contact_email)
VALUES
('Quantum Titans', 'quantum@arena.gg'),
('Out-Thinkers', 'logic@arena.gg'),
('Super Musicians', 'musicians@arena.gg'),
('Color Splash', 'artists@arena.gg'),
('Chameleons', 'actors@arena.gg'),
('Apex Competitors', 'athletes@arena.gg'),
('The Olympians', 'greekgods@arena.gg'),
('The Pantheon', 'romangods@arena.gg'),
('The Devas', 'hindugods@arena.gg'),
('The Aesir', 'norsegods@arena.gg');


-- ====================================
-- EVENTS
-- ====================================


INSERT INTO events (event_name, description, location, start_on, end_on, status)
VALUES
('Spring Championship 2025',
'Regional spring tournament',
'San Antonio, TX',
'2025-03-01',
'2025-03-03',
'Completed'),

('Summer Invitational 2026',
'Mid-season invitational event',
'Dallas, TX',
'2026-06-15',
'2026-06-17',
'Completed'),

('Fall Open 2026',
'Open registration tournament',
'Austin, TX',
'2026-09-10',
'2026-09-12',
'In-Progress'),

('Winter Clash 2026',
'Season-ending tournament',
'Houston, TX',
'2026-12-05',
'2026-12-07',
'Upcoming'),

('Legends Cup 2027',
'Elite invitational event',
'Las Vegas, NV',
'2027-02-21',
'2027-02-24',
'Upcoming');


-- ====================================
-- SESSIONS
-- ====================================


INSERT INTO sessions
(event_id,scheduled_start,scheduled_end,actual_start,actual_end,session_type,status)
VALUES
(1,'2026-03-01 10:00','2026-03-01 12:00',NULL,NULL,'Qualifier','Completed'),
(1,'2026-03-01 13:00','2026-03-01 15:00',NULL,NULL,'Qualifier','Completed'),
(1,'2026-03-02 10:00','2026-03-02 12:00',NULL,NULL,'Quarter-Finals','Completed'),
(1,'2026-03-02 13:00','2026-03-02 15:00',NULL,NULL,'Quarter-Finals','Completed'),

(2,'2026-06-15 10:00','2026-06-15 12:00',NULL,NULL,'Qualifier','Completed'),
(2,'2026-06-15 13:00','2026-06-15 15:00',NULL,NULL,'Qualifier','Completed'),
(2,'2026-06-16 10:00','2026-06-16 12:00',NULL,NULL,'Quarter-Finals','Completed'),
(2,'2026-06-17 18:00','2026-06-17 21:00',NULL,NULL,'Final','Completed'),

(3,'2026-09-10 10:00','2026-09-10 12:00',NULL,NULL,'Qualifier','In-Progress'),
(3,'2026-09-10 13:00','2026-09-10 15:00',NULL,NULL,'Qualifier','Upcoming'),
(3,'2026-09-11 10:00','2026-09-11 12:00',NULL,NULL,'Quarter-Finals','Upcoming'),
(3,'2026-09-12 18:00','2026-09-12 21:00',NULL,NULL,'Final','Upcoming'),

(4,'2026-12-05 10:00','2026-12-05 12:00',NULL,NULL,'Qualifier','Upcoming'),
(4,'2026-12-05 13:00','2026-12-05 15:00',NULL,NULL,'Qualifier','Upcoming'),
(4,'2026-12-06 10:00','2026-12-06 12:00',NULL,NULL,'Semi-Final','Upcoming'),
(4,'2026-12-07 18:00','2026-12-07 21:00',NULL,NULL,'Final','Upcoming'),

(5,'2026-08-21 10:00','2027-02-21 12:00',NULL,NULL,'Qualifier','Upcoming'),
(5,'2026-08-22 10:00','2027-02-22 12:00',NULL,NULL,'Quarter-Finals','Upcoming'),
(5,'2026-08-23 15:00','2027-02-23 17:00',NULL,NULL,'Semi-Final','Upcoming'),
(5,'2026-08-24 18:00','2027-02-24 21:00',NULL,NULL,'Final','Upcoming');


-- ====================================
-- TEAM_MEMBERS
-- ====================================


INSERT INTO team_members (team_id, member_id, start_date, end_date, team_position)
VALUES
-- Team 1
(1, 1, '2026-01-01', NULL, 'Captain'),
(1, 2, '2026-01-01', NULL, 'Substitute'),
(1, 3, '2026-01-01', NULL, 'Player'),
(1, 4, '2026-01-01', NULL, 'Player'),
(1, 5, '2026-01-01', NULL, 'Player'),
(1, 6, '2026-01-01', NULL, 'Player'),

-- Team 2
(2, 7, '2026-01-01', NULL, 'Captain'),
(2, 8, '2026-01-01', NULL, 'Substitute'),
(2, 9, '2026-01-01', NULL, 'Player'),
(2, 10, '2026-01-01', NULL, 'Player'),
(2, 11, '2026-01-01', NULL, 'Player'),
(2, 12, '2026-01-01', NULL, 'Player'),

-- Team 3
(3, 13, '2026-01-01', NULL, 'Captain'),
(3, 14, '2026-01-01', NULL, 'Substitute'),
(3, 15, '2026-01-01', NULL, 'Player'),
(3, 16, '2026-01-01', NULL, 'Player'),
(3, 17, '2026-01-01', NULL, 'Player'),
(3, 18, '2026-01-01', NULL, 'Player'),

-- Team 4
(4, 19, '2026-01-01', NULL, 'Captain'),
(4, 20, '2026-01-01', NULL, 'Substitute'),
(4, 21, '2026-01-01', NULL, 'Player'),
(4, 22, '2026-01-01', NULL, 'Player'),
(4, 23, '2026-01-01', NULL, 'Player'),
(4, 24, '2026-01-01', NULL, 'Player'),

-- Team 5
(5, 25, '2026-01-01', NULL, 'Captain'),
(5, 26, '2026-01-01', NULL, 'Substitute'),
(5, 27, '2026-01-01', NULL, 'Player'),
(5, 28, '2026-01-01', NULL, 'Player'),
(5, 29, '2026-01-01', NULL, 'Player'),
(5, 30, '2026-01-01', NULL, 'Player'),

-- Team 6
(6, 31, '2026-01-01', NULL, 'Captain'),
(6, 32, '2026-01-01', NULL, 'Substitute'),
(6, 33, '2026-01-01', NULL, 'Player'),
(6, 34, '2026-01-01', NULL, 'Player'),
(6, 35, '2026-01-01', NULL, 'Player'),
(6, 36, '2026-01-01', NULL, 'Player'),

-- Team 7
(7, 37, '2026-01-01', NULL, 'Captain'),
(7, 38, '2026-01-01', NULL, 'Substitute'),
(7, 39, '2026-01-01', NULL, 'Player'),
(7, 40, '2026-01-01', NULL, 'Player'),
(7, 41, '2026-01-01', NULL, 'Player'),
(7, 42, '2026-01-01', NULL, 'Player'),

-- Team 8
(8, 43, '2026-01-01', NULL, 'Captain'),
(8, 44, '2026-01-01', NULL, 'Substitute'),
(8, 45, '2026-01-01', NULL, 'Player'),
(8, 46, '2026-01-01', NULL, 'Player'),
(8, 47, '2026-01-01', NULL, 'Player'),
(8, 48, '2026-01-01', NULL, 'Player'),

-- Team 9
(9, 49, '2026-01-01', NULL, 'Captain'),
(9, 50, '2026-01-01', NULL, 'Substitute'),
(9, 51, '2026-01-01', NULL, 'Player'),
(9, 52, '2026-01-01', NULL, 'Player'),
(9, 53, '2026-01-01', NULL, 'Player'),
(9, 54, '2026-01-01', NULL, 'Player'),

-- Team 10
(10, 55, '2026-01-01', NULL, 'Captain'),
(10, 56, '2026-01-01', NULL, 'Substitute'),
(10, 57, '2026-01-01', NULL, 'Player'),
(10, 58, '2026-01-01', NULL, 'Player'),
(10, 59, '2026-01-01', NULL, 'Player'),
(10, 60, '2026-01-01', NULL, 'Player');


-- ====================================
-- SESSION_TEAMS
-- ====================================


INSERT INTO session_teams(session_id, team_id)
VALUES
('1', '1'),
('1', '2'),
('2', '3'),
('2', '4'),
('3', '5'),
('3', '6'),
('4', '7'),
('4', '8'),

('5', '9'),
('5', '10'),
('6', '1'),
('6', '3'),
('7', '5'),
('7', '7'),
('8', '9'),
('8', '2'),

('9', '4'),
('9', '6'),
('10', '8'),
('10', '10'),
('11', '1'),
('11', '9'),
('12', '5'),
('12', '3'),

('13', '2'),
('13', '6'),
('14', '4'),
('14', '10'),
('15', '8'),
('15', '1'),
('16', '9'),
('16', '7'),

('17', '5'),
('17', '2'),
('18', '10'),
('18', '6'),
('19', '7'),
('19', '3'),
('20', '9'),
('20', '8');


-- ====================================
-- USERS
-- ====================================

INSERT INTO users (first_name, last_name, username, email, password_hash, is_active)
VALUES 
('Yousef', 'Alzubi', 'TheSysAdmin', 'noemail@noemail.com', 'dev_placeholder_hash', TRUE),
('Oliver', 'Queen', 'O3OQueen', 'greenarrow@justice.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Nara', 'Shikimaru', 'A2NShikimaru', 'lazyshinobi@hiddenleaf.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE), 
('Albert', 'Einstein', 'TM1AEinstein', 'TheBrainiac@smartz.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE), 
('The', 'Socrates', 'TM1TSocrates', 'TheThinker@philo.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Wolfgang', 'Mozart', 'TM1WMozart', 'TheRhythm@music.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Leonardo', 'DaVinci', 'TM1LDaVinci', 'MrLisa@artist.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Morgan', 'Freeman', 'TM1AMFreeman', 'thenarrator@actor.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Muhammad', 'Ali', 'TM1MAli', 'thefighter@sports.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('King', 'Zues', 'TM1KZues', 'godking@greekmyth.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Goddess', 'Minerva', 'TM1GMinerva', 'goddesswisdom@romanmyth.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Destroyer', 'Shiva', 'TM1DShiva', 'destroyer@hindude.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE),
('Odin', 'AllFather', 'TM1OAllfather', 'allfather@norsemyth.com', '$2b$10$IyXFMLX79vBUswVHN\jTM.m9hZH8qtmPNIyQlCncMlVSQY70U5fbG', TRUE);

-- ====================================
-- ROLES
-- ====================================

INSERT INTO roles (role_name)
VALUES
	('Admin'),
	('Organizer'),
	('Analyst'),
	('Team Manager')
;


-- ====================================
-- USER ROLES
-- ====================================

INSERT INTO user_roles(user_id, role_id)
VALUES 
(1,1),
(2,2),
(3,3),
(4,4),
(5,4),
(6,4),
(7,4),
(8,4),
(9,4),
(10,4),
(11,4),
(12,4),
(13,4);


-- ====================================
-- TEAM USERS
-- ====================================

INSERT INTO team_users(team_id, user_id, start_date, end_date)
VALUES 
(1,4, '2026-01-01', NULL),
(2,5, '2026-01-01', NULL),
(3,6, '2026-01-01', NULL),
(4,7, '2026-01-01', NULL),
(5,8, '2026-01-01', NULL),
(6,9, '2026-01-01', NULL),
(7,10, '2026-01-01', NULL),
(8,11, '2026-01-01', NULL),
(9,12, '2026-01-01', NULL),
(10,13, '2026-01-01', NULL);
