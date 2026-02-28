--
-- PostgreSQL database dump
--

\restrict PpKT1dYd0havy2wp15zdIaY6ItltsU1QTv9eKPQLJ0yhZ2HsgCVDGBq1gS43XTa

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.admin_audit_logs (
    id integer NOT NULL,
    actor_id integer,
    action text NOT NULL,
    entity text,
    ip text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.admin_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.admin_audit_logs_id_seq OWNED BY public.admin_audit_logs.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL
);



--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    entity_type text,
    entity_id integer,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.otps (
    mobile text NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_count integer DEFAULT 0 NOT NULL,
    last_request_at timestamp with time zone
);



--
-- Name: ticket_events; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.ticket_events (
    id integer NOT NULL,
    ticket_id integer,
    action_type text NOT NULL,
    performed_by integer,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: ticket_events_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.ticket_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: ticket_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.ticket_events_id_seq OWNED BY public.ticket_events.id;


--
-- Name: ticket_updates; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.ticket_updates (
    id integer NOT NULL,
    ticket_id integer,
    status text NOT NULL,
    note text,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: ticket_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.ticket_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: ticket_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.ticket_updates_id_seq OWNED BY public.ticket_updates.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    user_id integer,
    dept text,
    category text,
    priority text DEFAULT 'MED'::text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    ward text,
    status text DEFAULT 'open'::text NOT NULL,
    sla_due_at timestamp with time zone,
    resolved_at timestamp with time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer,
    service_type text,
    is_emergency boolean DEFAULT false NOT NULL,
    area text,
    latitude double precision,
    longitude double precision,
    assigned_to integer
);



--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: user_departments; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.user_departments (
    user_id integer NOT NULL,
    department_id integer NOT NULL
);



--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer,
    token_hash text NOT NULL,
    issued_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    revoked_by integer,
    revoked_at timestamp with time zone
);



--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text,
    phone character varying(20) NOT NULL,
    role text DEFAULT 'citizen'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    preferred_language text DEFAULT 'en'::text NOT NULL,
    consent_accepted boolean DEFAULT false NOT NULL,
    consent_accepted_at timestamp with time zone
);



--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: suvidha
--

CREATE TABLE public.work_orders (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    assigned_staff_id integer,
    status text DEFAULT 'assigned'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: work_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: suvidha
--

CREATE SEQUENCE public.work_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: work_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: suvidha
--

ALTER SEQUENCE public.work_orders_id_seq OWNED BY public.work_orders.id;


--
-- Name: admin_audit_logs id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.admin_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_audit_logs_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: ticket_events id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_events ALTER COLUMN id SET DEFAULT nextval('public.ticket_events_id_seq'::regclass);


--
-- Name: ticket_updates id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_updates ALTER COLUMN id SET DEFAULT nextval('public.ticket_updates_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: work_orders id; Type: DEFAULT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN id SET DEFAULT nextval('public.work_orders_id_seq'::regclass);


--
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.admin_audit_logs (id, actor_id, action, entity, ip, created_at) FROM stdin;
1	2	TICKET_STATUS_UPDATED	ticket:2	127.0.0.1	2026-02-28 09:30:42.943584
2	2	ANALYTICS_VIEWED	dashboard	127.0.0.1	2026-02-28 09:30:42.943584
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.departments (id, code, name) FROM stdin;
1	GAS	Gas Department
2	ELEC	Electricity Department
3	MUNI	Municipal Corporation
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.notifications (id, user_id, type, title, message, entity_type, entity_id, is_read, created_at) FROM stdin;
1	7	assignment	Ticket assigned	Your ticket has been assigned	ticket	7	f	2026-02-28 09:50:33.606842
2	7	ticket_update	Ticket completed	Your ticket has been marked as completed	ticket	7	f	2026-02-28 09:50:55.965332
3	7	token_revoked	Session closed	Your session has been closed after completion	token	7	f	2026-02-28 09:50:55.969617
4	7	ticket_update	Ticket status updated	Your ticket #7 is now resolved	ticket	7	f	2026-02-28 09:50:55.973981
5	9	assignment	Ticket assigned	Your ticket has been assigned	ticket	8	f	2026-02-28 10:43:00.540378
6	9	ticket_update	Ticket completed	Your ticket has been marked as completed	ticket	8	f	2026-02-28 10:44:08.224009
7	9	token_revoked	Session closed	Your session has been closed after completion	token	8	f	2026-02-28 10:44:08.235082
8	9	ticket_update	Ticket status updated	Your ticket #8 is now resolved	ticket	8	t	2026-02-28 10:44:08.247552
13	10	ticket_update	Ticket status updated	Your ticket #9 is now resolved	ticket	9	t	2026-02-28 10:54:59.24437
11	10	ticket_update	Ticket completed	Your ticket has been marked as completed	ticket	9	t	2026-02-28 10:54:59.218605
10	10	assignment	Ticket assigned	Your ticket has been assigned	ticket	9	t	2026-02-28 10:53:59.540727
9	10	assignment	Ticket assigned	Your ticket has been assigned	ticket	9	t	2026-02-28 10:52:52.379242
12	10	token_revoked	Session closed	Your session has been closed after completion	token	9	t	2026-02-28 10:54:59.231564
14	7	assignment	Ticket assigned	Your ticket has been assigned	ticket	10	f	2026-02-28 15:29:12.359365
15	7	ticket_update	Ticket completed	Your ticket has been marked as completed	ticket	10	f	2026-02-28 15:29:27.76666
16	7	token_revoked	Session closed	Your session has been closed after completion	token	10	f	2026-02-28 15:29:27.770789
17	7	ticket_update	Ticket status updated	Your ticket #10 is now resolved	ticket	10	f	2026-02-28 15:29:27.775648
18	2	ticket_update	Ticket completed	Your ticket has been marked as completed	ticket	4	f	2026-02-28 15:32:39.996327
19	2	token_revoked	Session closed	Your session has been closed after completion	token	4	f	2026-02-28 15:32:40.00166
20	2	ticket_update	Ticket status updated	Your ticket #4 is now resolved	ticket	4	f	2026-02-28 15:32:40.007076
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.otps (mobile, otp_hash, expires_at, attempts, verified_at, created_at, request_count, last_request_at) FROM stdin;
+919537266007	8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92	2026-02-28 15:34:45.057+00	0	2026-02-28 15:29:48.81+00	2026-02-28 15:29:45.057+00	5	2026-02-28 15:29:45.057+00
+918888888888	8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92	2026-02-28 10:36:53.832+00	0	\N	2026-02-28 10:31:53.832+00	1	2026-02-28 10:31:53.832+00
+919999999999	8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92	2026-02-28 15:37:43.686+00	0	2026-02-28 15:32:47.571+00	2026-02-28 15:32:43.686+00	23	2026-02-28 15:32:43.686+00
+911234567890	8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92	2026-02-28 10:49:41.863+00	0	2026-02-28 10:44:48.922+00	2026-02-28 10:44:41.863+00	3	2026-02-28 10:44:41.863+00
+911234569870	8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92	2026-02-28 11:00:53.859+00	0	2026-02-28 10:55:59.799+00	2026-02-28 10:55:53.859+00	3	2026-02-28 10:55:53.859+00
\.


--
-- Data for Name: ticket_events; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.ticket_events (id, ticket_id, action_type, performed_by, note, created_at) FROM stdin;
1	7	assigned	2	assigned_to:8	2026-02-28 09:50:33.603687+00
2	7	status_changed	2	completed_by_admin	2026-02-28 09:50:55.971039+00
3	8	assigned	2	assigned_to:6	2026-02-28 10:43:00.530974+00
4	8	status_changed	2	completed_by_admin	2026-02-28 10:44:08.239048+00
5	9	assigned	2	assigned_to:5	2026-02-28 10:52:52.370053+00
6	9	assigned	2	assigned_to:6	2026-02-28 10:53:59.531159+00
7	9	status_changed	2	completed_by_admin	2026-02-28 10:54:59.235703+00
8	10	assigned	2	assigned_to:5	2026-02-28 15:29:12.355676+00
9	10	status_changed	2	completed_by_admin	2026-02-28 15:29:27.772504+00
10	4	status_changed	2	completed_by_admin	2026-02-28 15:32:40.003479+00
\.


--
-- Data for Name: ticket_updates; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.ticket_updates (id, ticket_id, status, note, updated_by, created_at) FROM stdin;
1	7	in_progress	assigned_to:8	2	2026-02-28 09:50:33.600476
2	7	resolved	completed_by_admin	2	2026-02-28 09:50:55.960552
3	8	in_progress	assigned_to:6	2	2026-02-28 10:43:00.524546
4	8	resolved	completed_by_admin	2	2026-02-28 10:44:08.212796
5	9	in_progress	assigned_to:5	2	2026-02-28 10:52:52.360016
6	9	in_progress	assigned_to:6	2	2026-02-28 10:53:59.524502
7	9	resolved	completed_by_admin	2	2026-02-28 10:54:59.207053
8	10	in_progress	assigned_to:5	2	2026-02-28 15:29:12.351904
9	10	resolved	completed_by_admin	2	2026-02-28 15:29:27.762835
10	4	resolved	completed_by_admin	2	2026-02-28 15:32:39.991594
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.tickets (id, user_id, dept, category, priority, title, description, ward, status, sla_due_at, resolved_at, created_at, updated_at, department_id, service_type, is_emergency, area, latitude, longitude, assigned_to) FROM stdin;
5	2	\N	outage	MED	Power outage sector 12	Transformer issue suspected	\N	in_progress	\N	\N	2026-02-28 08:30:42.943584	2026-02-28 09:30:42.943584	2	\N	f	\N	\N	\N	5
6	2	\N	road	low	Pothole fixed	Road maintenance completed	\N	resolved	\N	\N	2026-02-26 09:30:42.943584	2026-02-28 09:30:42.943584	3	\N	f	\N	\N	\N	6
7	7	\N	\N	MED	problem	jadsnfuijrnj\n	\N	resolved	2026-03-03 09:39:17.954+00	2026-02-28 09:50:55.957813+00	2026-02-28 09:39:17.970826	2026-02-28 09:39:17.970826	2	STREETLIGHT	f	ssecotr 2	\N	\N	8
8	9	\N	\N	MED	need new gas connection	I want to book a new gas connection for my home	\N	resolved	2026-03-03 10:40:37.922+00	2026-02-28 10:44:08.206195+00	2026-02-28 10:40:37.819704	2026-02-28 10:40:37.819704	1	NEW_CONNECTION	f	Sector 26 Gandhinagar	23	72.57	6
9	10	\N	\N	MED	GANDHINAGAR SECTOR 22	book a new gas connection	\N	resolved	2026-03-03 10:50:47.341+00	2026-02-28 10:54:59.20121+00	2026-02-28 10:50:47.985341	2026-02-28 10:50:47.985341	1	NEW_CONNECTION	f	Gandhinagar Sector 12	23	72.57	6
10	7	\N	\N	EMERGENCY	GAS LEAKAGE PROBLEM	GAS IS LEAKED IN CYLENDER 	\N	resolved	2026-02-28 17:28:53.356+00	2026-02-28 15:29:27.75552+00	2026-02-28 15:28:52.560472	2026-02-28 15:28:52.560472	1	LEAKAGE	t	GANDHINAGAR SECTOR 12 	\N	\N	5
4	2	\N	leak	high	Gas leak near market	Reported strong gas smell	\N	resolved	\N	2026-02-28 15:32:39.988585+00	2026-02-28 09:30:42.943584	2026-02-28 09:30:42.943584	1	\N	f	\N	\N	\N	\N
\.


--
-- Data for Name: user_departments; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.user_departments (user_id, department_id) FROM stdin;
8	2
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.user_sessions (id, user_id, token_hash, issued_at, expires_at, revoked, revoked_by, revoked_at) FROM stdin;
5	7	55e840ae6f7015978c123f0828dfc6ae06fae2b9aeaf0df8bb11b2877ac40cf8	2026-02-28 09:38:55.116995+00	2026-02-28 11:38:55+00	t	2	2026-02-28 09:50:55.96782+00
11	7	5b64415eee701153b50df8ddfab3062401d139a516134079a8b36de30f858b1a	2026-02-28 09:50:10.022499+00	2026-02-28 11:50:11+00	t	2	2026-02-28 09:50:55.96782+00
14	9	ab69ceeb774ffd3ab65bb1087ac6b9c808c32cc7cd214bb4f6b1fc13bc92217c	2026-02-28 10:35:43.872197+00	2026-02-28 12:35:43+00	t	2	2026-02-28 10:44:08.230442+00
15	9	49f218251c625ec311b172c46b99f8a1fbca384e4d835b5938aa22785bc4acae	2026-02-28 10:43:31.992399+00	2026-02-28 12:43:33+00	t	2	2026-02-28 10:44:08.230442+00
16	9	c36295670fc373499c27ac491ed0422296f4b137cada506f0353025d2c405e0f	2026-02-28 10:44:49.358467+00	2026-02-28 12:44:48+00	f	\N	\N
17	10	9343a3c5c13c63c4c0a09dfcb75ec3d6e444b20bf97ee7953e0ce6eef3d4a35b	2026-02-28 10:48:36.984384+00	2026-02-28 12:48:38+00	t	2	2026-02-28 10:54:59.225399+00
18	10	cc9b1416068742cdac96f70d44ac366eb145b1660100b7d60873ef4d5e65d45a	2026-02-28 10:54:39.971182+00	2026-02-28 12:54:40+00	t	2	2026-02-28 10:54:59.225399+00
19	10	d1bac5459b1e2f18b44a0eee5c165a3dc78fa225a7d9a56bed95f3a0d1770c72	2026-02-28 10:55:58.945514+00	2026-02-28 12:55:59+00	f	\N	\N
12	7	e4c7e421ad2710ae193c29f5b5d577d006c8d06b8d69777446fcf34ee762ed31	2026-02-28 09:51:19.870857+00	2026-02-28 11:51:20+00	t	2	2026-02-28 15:29:27.768839+00
27	7	81fb542b95ab6a21c506c416d496bb4212f331f7a3eb7c6c1c2060a9fad44b0c	2026-02-28 15:28:18.221087+00	2026-02-28 17:28:18+00	t	2	2026-02-28 15:29:27.768839+00
28	7	b3b82032e8b0549f1f2bf6a537291003185e90a5f4c1fb99e98da6631321541a	2026-02-28 15:29:48.615619+00	2026-02-28 17:29:48+00	f	\N	\N
1	2	587b2136838385597a9c00cdc0b213e98b41003d44e7843de860c30fa993f118	2026-02-28 09:27:21.372409+00	2026-02-28 11:27:20+00	t	2	2026-02-28 15:32:39.998825+00
2	2	e26cc6a7ecf3d2fdf84a833bc4c29baa0423ae6c670d7ed59ccf02cf3a0ba103	2026-02-28 09:27:33.902258+00	2026-02-28 11:27:33+00	t	2	2026-02-28 15:32:39.998825+00
3	2	938d2b3221eb94425554a454f93f59abb3d166c405c1b8598dcadb23cab7104f	2026-02-28 09:35:10.245541+00	2026-02-28 11:35:10+00	t	2	2026-02-28 15:32:39.998825+00
4	2	714e92cd8e1ab2b04976c69adfa409db43a57b4af426411ffd8d98a3fe858279	2026-02-28 09:37:38.358925+00	2026-02-28 11:37:38+00	t	2	2026-02-28 15:32:39.998825+00
6	2	62f9f8b7bc235694fc90d53f4aa77b8bf643341f495ca1cab0905b4677b0ce78	2026-02-28 09:42:56.464147+00	2026-02-28 11:42:57+00	t	2	2026-02-28 15:32:39.998825+00
7	2	c8ef7fdc946f1b4f4836e9d64cbc192e0982df1d0dfaf78f6752dd14efa9d1b9	2026-02-28 09:44:44.488678+00	2026-02-28 11:44:45+00	t	2	2026-02-28 15:32:39.998825+00
8	2	6595767d457212505d2ba8562b36155cdcfd83f3568ed971cbe60463a77d89fd	2026-02-28 09:46:09.131807+00	2026-02-28 11:46:10+00	t	2	2026-02-28 15:32:39.998825+00
9	2	e37fce767e3dfefa9f7e424145b045853f5a1f8e3be9acfcfadd790ec21f3769	2026-02-28 09:47:14.728733+00	2026-02-28 11:47:14+00	t	2	2026-02-28 15:32:39.998825+00
10	2	5ba91a80e933aac4d70d6d1897bdeb9c193ef79334949201f71e9b4eb0558bfe	2026-02-28 09:48:22.346802+00	2026-02-28 11:48:23+00	t	2	2026-02-28 15:32:39.998825+00
13	2	bcb4ad2350ac2431df968a98fc34ca58370dcd076326603b48cd7136c1890f88	2026-02-28 09:52:33.538221+00	2026-02-28 11:52:34+00	t	2	2026-02-28 15:32:39.998825+00
20	2	699f8efb05c0dd8aff0e28aa44c44606c52119d2c0841dd2ac387a660c90a986	2026-02-28 15:17:12.347445+00	2026-02-28 17:17:12+00	t	2	2026-02-28 15:32:39.998825+00
21	2	fb706a8222dceee4fd0a8501bd2a546f1a46c9d29aa66320e3d04a913f37d61a	2026-02-28 15:19:18.313693+00	2026-02-28 17:19:19+00	t	2	2026-02-28 15:32:39.998825+00
22	2	bc926c116e05df8a4d9bc9f9f4bceb423a6733fa5cf2d8e9b36f3ed9ffa80432	2026-02-28 15:19:37.181348+00	2026-02-28 17:19:37+00	t	2	2026-02-28 15:32:39.998825+00
23	2	ffd2d83b7f37dc1ef07f3ce16eff365ddfc38f0c483548b1e080b7f8ead34d67	2026-02-28 15:20:59.699028+00	2026-02-28 17:20:59+00	t	2	2026-02-28 15:32:39.998825+00
24	2	741a3f6666ca52e0cc9101e52eadfb64b2c160e100a3671c1e0a3894696fb368	2026-02-28 15:25:00.287496+00	2026-02-28 17:25:00+00	t	2	2026-02-28 15:32:39.998825+00
25	2	bac6889e00e6bbccf6327c1553fb3b479fb304143cafa6965bd1640cf9e5c64d	2026-02-28 15:25:54.602478+00	2026-02-28 17:25:54+00	t	2	2026-02-28 15:32:39.998825+00
26	2	faae0cc9f526d39c0cdd0e742ea6e48dd983179d12b2ae731ebf6368103fb793	2026-02-28 15:26:20.210223+00	2026-02-28 17:26:20+00	t	2	2026-02-28 15:32:39.998825+00
29	2	8ae7260fcb4c9d595ea34e18d674ca03e3345721c646b1030094d7d727ee5aab	2026-02-28 15:32:47.753919+00	2026-02-28 17:32:47+00	f	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.users (id, name, phone, role, created_at, preferred_language, consent_accepted, consent_accepted_at) FROM stdin;
1	Admin	9999999999	admin	2026-02-28 09:25:59.131206	en	f	\N
5	Asha Worker	+919000000001	staff	2026-02-28 09:30:42.943584	en	f	\N
6	Field Engineer	+919000000002	staff	2026-02-28 09:30:42.943584	en	f	\N
7	\N	+919537266007	citizen	2026-02-28 09:38:55.112913	en	t	2026-02-28 09:38:56.674579+00
2	\N	+919999999999	admin	2026-02-28 09:27:21.366864	en	f	\N
8	Axay	9678683759	staff	2026-02-28 09:49:25.860907	en	f	\N
9	\N	+911234567890	citizen	2026-02-28 10:35:43.864944	en	t	2026-02-28 10:35:46.49473+00
10	\N	+911234569870	citizen	2026-02-28 10:48:36.976728	en	t	2026-02-28 10:48:38.853194+00
11	Nisarg Panchal	96857425457	staff	2026-02-28 15:31:05.173759	en	f	\N
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: suvidha
--

COPY public.work_orders (id, ticket_id, assigned_staff_id, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.admin_audit_logs_id_seq', 2, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.departments_id_seq', 21, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.notifications_id_seq', 20, true);


--
-- Name: ticket_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.ticket_events_id_seq', 10, true);


--
-- Name: ticket_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.ticket_updates_id_seq', 10, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.tickets_id_seq', 10, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 29, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: work_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: suvidha
--

SELECT pg_catalog.setval('public.work_orders_id_seq', 1, false);


--
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (mobile);


--
-- Name: ticket_events ticket_events_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_events
    ADD CONSTRAINT ticket_events_pkey PRIMARY KEY (id);


--
-- Name: ticket_updates ticket_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_updates
    ADD CONSTRAINT ticket_updates_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: user_departments user_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_pkey PRIMARY KEY (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_ticket_events_ticket; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_ticket_events_ticket ON public.ticket_events USING btree (ticket_id);


--
-- Name: idx_tickets_area; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_area ON public.tickets USING btree (area);


--
-- Name: idx_tickets_assigned; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_assigned ON public.tickets USING btree (assigned_to);


--
-- Name: idx_tickets_assigned_to; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_assigned_to ON public.tickets USING btree (assigned_to);


--
-- Name: idx_tickets_created_at; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_created_at ON public.tickets USING btree (created_at);


--
-- Name: idx_tickets_department; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_department ON public.tickets USING btree (department_id);


--
-- Name: idx_tickets_department_id; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_department_id ON public.tickets USING btree (department_id);


--
-- Name: idx_tickets_priority; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_priority ON public.tickets USING btree (priority);


--
-- Name: idx_tickets_sla_due_at; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_sla_due_at ON public.tickets USING btree (sla_due_at);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_user_departments_dept; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_user_departments_dept ON public.user_departments USING btree (department_id);


--
-- Name: idx_user_sessions_token_hash; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE UNIQUE INDEX idx_user_sessions_token_hash ON public.user_sessions USING btree (token_hash);


--
-- Name: idx_work_orders_staff; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_work_orders_staff ON public.work_orders USING btree (assigned_staff_id);


--
-- Name: idx_work_orders_ticket; Type: INDEX; Schema: public; Owner: suvidha
--

CREATE INDEX idx_work_orders_ticket ON public.work_orders USING btree (ticket_id);


--
-- Name: admin_audit_logs admin_audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ticket_events ticket_events_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_events
    ADD CONSTRAINT ticket_events_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ticket_events ticket_events_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_events
    ADD CONSTRAINT ticket_events_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_updates ticket_updates_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_updates
    ADD CONSTRAINT ticket_updates_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_updates ticket_updates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.ticket_updates
    ADD CONSTRAINT ticket_updates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_departments user_departments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_departments user_departments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_revoked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_assigned_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: suvidha
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PpKT1dYd0havy2wp15zdIaY6ItltsU1QTv9eKPQLJ0yhZ2HsgCVDGBq1gS43XTa

