--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: dob_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO dob_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: dob_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AdminDecision; Type: TYPE; Schema: public; Owner: dob_user
--

CREATE TYPE public."AdminDecision" AS ENUM (
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."AdminDecision" OWNER TO dob_user;

--
-- Name: CertificateStatus; Type: TYPE; Schema: public; Owner: dob_user
--

CREATE TYPE public."CertificateStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED'
);


ALTER TYPE public."CertificateStatus" OWNER TO dob_user;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: dob_user
--

CREATE TYPE public."Role" AS ENUM (
    'OPERATOR',
    'ADMIN',
    'VALIDATOR'
);


ALTER TYPE public."Role" OWNER TO dob_user;

--
-- Name: SubmissionStatus; Type: TYPE; Schema: public; Owner: dob_user
--

CREATE TYPE public."SubmissionStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."SubmissionStatus" OWNER TO dob_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO dob_user;

--
-- Name: admin_reviews; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.admin_reviews (
    id text NOT NULL,
    notes text,
    "technicalScore" integer,
    "regulatoryScore" integer,
    "financialScore" integer,
    "environmentalScore" integer,
    "overallScore" integer,
    decision public."AdminDecision",
    "decisionAt" timestamp(3) without time zone,
    "reviewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submissionId" text NOT NULL
);


ALTER TABLE public.admin_reviews OWNER TO dob_user;

--
-- Name: auth_challenges; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.auth_challenges (
    id text NOT NULL,
    challenge text NOT NULL,
    "walletAddress" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auth_challenges OWNER TO dob_user;

--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.auth_sessions (
    id text NOT NULL,
    token text NOT NULL,
    "walletAddress" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auth_sessions OWNER TO dob_user;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.certificates (
    id text NOT NULL,
    "certificateHash" text NOT NULL,
    "stellarTxHash" text,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    status public."CertificateStatus" DEFAULT 'ACTIVE'::public."CertificateStatus" NOT NULL,
    "submissionId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.certificates OWNER TO dob_user;

--
-- Name: draft_files; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.draft_files (
    id text NOT NULL,
    filename text NOT NULL,
    path text NOT NULL,
    size integer NOT NULL,
    "mimeType" text NOT NULL,
    "documentType" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "draftId" text NOT NULL
);


ALTER TABLE public.draft_files OWNER TO dob_user;

--
-- Name: drafts; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.drafts (
    id text NOT NULL,
    "deviceName" text DEFAULT ''::text NOT NULL,
    "deviceType" text DEFAULT ''::text NOT NULL,
    "serialNumber" text DEFAULT ''::text NOT NULL,
    manufacturer text DEFAULT ''::text NOT NULL,
    model text DEFAULT ''::text NOT NULL,
    "yearOfManufacture" text DEFAULT ''::text NOT NULL,
    condition text DEFAULT ''::text NOT NULL,
    specifications text DEFAULT ''::text NOT NULL,
    "purchasePrice" text DEFAULT ''::text NOT NULL,
    "currentValue" text DEFAULT ''::text NOT NULL,
    "expectedRevenue" text DEFAULT ''::text NOT NULL,
    "operationalCosts" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    location text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.drafts OWNER TO dob_user;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    company text,
    email text NOT NULL,
    "walletAddress" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.profiles OWNER TO dob_user;

--
-- Name: submission_files; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.submission_files (
    id text NOT NULL,
    filename text NOT NULL,
    path text NOT NULL,
    size integer NOT NULL,
    "mimeType" text NOT NULL,
    "documentType" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submissionId" text NOT NULL
);


ALTER TABLE public.submission_files OWNER TO dob_user;

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.submissions (
    id text NOT NULL,
    "deviceName" text NOT NULL,
    "deviceType" text NOT NULL,
    "serialNumber" text NOT NULL,
    manufacturer text NOT NULL,
    model text NOT NULL,
    "yearOfManufacture" text NOT NULL,
    condition text NOT NULL,
    specifications text NOT NULL,
    "purchasePrice" text NOT NULL,
    "currentValue" text NOT NULL,
    "expectedRevenue" text NOT NULL,
    "operationalCosts" text NOT NULL,
    status public."SubmissionStatus" DEFAULT 'PENDING'::public."SubmissionStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "customDeviceType" text,
    location text NOT NULL
);


ALTER TABLE public.submissions OWNER TO dob_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: dob_user
--

CREATE TABLE public.users (
    id text NOT NULL,
    "walletAddress" text NOT NULL,
    email text,
    name text,
    company text,
    role public."Role" DEFAULT 'OPERATOR'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO dob_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ddeb5400-a7ff-426c-afc1-1375a0ff8dae	66516a0fa60aff8a06b0aff977d144c99164885f936e97989bcd61810bf7a967	2025-06-28 04:10:02.925663+00	20250624031049_init	\N	\N	2025-06-28 04:10:02.862191+00	1
76a8a880-dd61-44b4-9136-d62ed93f229a	e88fc2a77fa3e5aacd4edc6888eb1daeed99fdc5067bd422927171c74d425415	2025-06-28 04:10:03.511944+00	20250628041003_add_custom_device_type	\N	\N	2025-06-28 04:10:03.50929+00	1
\.


--
-- Data for Name: admin_reviews; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.admin_reviews (id, notes, "technicalScore", "regulatoryScore", "financialScore", "environmentalScore", "overallScore", decision, "decisionAt", "reviewedAt", "submissionId") FROM stdin;
cmcft84jb00098c1v4fdl6goy		\N	\N	\N	\N	78	APPROVED	2025-06-28 05:40:46.647	2025-06-28 05:40:46.656	cmcfrwtol0003mdk2xel4ggl9
cmcfthd4a000o8c1v4c7k30ft	This device is lookin good, would need further observation to ensure battery life. 	\N	\N	\N	\N	71	APPROVED	2025-06-28 05:45:09.773	2025-06-28 05:45:09.801	cmcftg4f4000h8c1vl4jmqo8c
\.


--
-- Data for Name: auth_challenges; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.auth_challenges (id, challenge, "walletAddress", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: auth_sessions; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.auth_sessions (id, token, "walletAddress", "expiresAt", "createdAt") FROM stdin;
cmcfss8ab000156ou07inpm8a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4MzM3LCJleHAiOjE3NTE2OTMxMzd9.UjKczLF53BZiar2zuGAYK_q8mfbLfMf33UArI1Z5lqU	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:25:37.138	2025-06-28 05:25:37.139
cmcfsskpk000356ouzbspk4iv	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4MzUzLCJleHAiOjE3NTE2OTMxNTN9.svaDplWiy_wDdIXzpQiF8I71s7KNvzs3R4B9mOG355M	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:25:53.24	2025-06-28 05:25:53.24
cmcfssqc9000556ouf7j1u2k3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4MzYwLCJleHAiOjE3NTE2OTMxNjB9.Hb6bgZpexIGhJdbBjMgbPByQp4COTQbprozbjwa1FL4	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:26:00.537	2025-06-28 05:26:00.538
cmcfsvzec0001ilwtvzgh0muk	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTEyLCJleHAiOjE3NTE2OTMzMTJ9.T7PRG1g22b9S2XVFjHyC30wBlWEKc5ztaWjM-c17ufw	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:32.244	2025-06-28 05:28:32.245
cmcfsw1k80003ilwto0ssm8ro	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTE1LCJleHAiOjE3NTE2OTMzMTV9.6kjZ1PEbf7x2bqXl-XWxQ6MKjyyIC6kkD46QqfrY8BE	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:35.047	2025-06-28 05:28:35.048
cmcfsw4mk0005ilwtaw9hrd6h	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTE5LCJleHAiOjE3NTE2OTMzMTl9.nBG5-xiDiAQ7Yjsko179KGzujEyVdYk0R52dUAmuDsA	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:39.02	2025-06-28 05:28:39.02
cmcfsw6vo0007ilwt3727uslv	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTIxLCJleHAiOjE3NTE2OTMzMjF9.0_bp_gzHl4DWGv55HcmfrJ_SglSdDsMOJCSaAfh_tAQ	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:41.939	2025-06-28 05:28:41.94
cmcfsw7yd0009ilwtm7sz8pbs	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTIzLCJleHAiOjE3NTE2OTMzMjN9.whFi8IvFQtJCTkMaZPGulX4scBshmbtIi_h_mpws-k0	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:43.332	2025-06-28 05:28:43.333
cmcfsw8tr000bilwtk82utjzo	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTI0LCJleHAiOjE3NTE2OTMzMjR9.puqbmuPF4Q1cQKcDbA-g9RjWe74R2HNBmK_6MsTGqUM	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:44.46	2025-06-28 05:28:44.463
cmcfswaox000dilwt8sc79mt1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NTI2LCJleHAiOjE3NTE2OTMzMjZ9.s8ITox3E1TdSwELPqkBwxA65rVPIXO5FhU6qa-6K8rE	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:28:46.88	2025-06-28 05:28:46.881
cmcfsy3ah00014s4pax85ydt8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NjEwLCJleHAiOjE3NTE2OTM0MTB9.dp4Z2EeZyTe56X8xulQSs4l4E_-8nYhIcau2Izd9KKM	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:30:10.601	2025-06-28 05:30:10.602
cmcfsy4zt00034s4phk3n1v8t	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NjEyLCJleHAiOjE3NTE2OTM0MTJ9.Ld-U-vvhtrD76lYJjlcUS887p3WORAU19t6f7hsrwZQ	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:30:12.808	2025-06-28 05:30:12.809
cmcfsy9xk00054s4p1o49uih4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NjE5LCJleHAiOjE3NTE2OTM0MTl9.M4m7WY5FnKWBl5WujwsVl3SQrOAPfNpkS-dJ7cHJUt4	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:30:19.208	2025-06-28 05:30:19.209
cmcft0w5g0001r6upnj60gm1x	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NzQxLCJleHAiOjE3NTE2OTM1NDF9.Ryl5qoNd82L8Y1_Ary5b3IaCJBtgPDJ2ddzlnNrz0XM	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:32:21.316	2025-06-28 05:32:21.317
cmcft0y1w0003r6upbnurcbqm	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NzQzLCJleHAiOjE3NTE2OTM1NDN9.zZZWA1-GyLtHrr64MnR-TDzyNFU2NwWI_o9OfjosOMs	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:32:23.779	2025-06-28 05:32:23.78
cmcft1xz4000113rkmsznzrm4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4NzkwLCJleHAiOjE3NTE2OTM1OTB9.ZS1yuC6v7WL9C6tYRIg9gSqLkm6Wfupm3JVtBKc5ajo	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:33:10.335	2025-06-28 05:33:10.336
cmcft2k9y00018c1v9h4s4yzw	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4ODE5LCJleHAiOjE3NTE2OTM2MTl9.z2-Jr_W7XJilnObuqH6sBxQfk5DckwaSc77PDLwvqmM	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:33:39.237	2025-06-28 05:33:39.238
cmcft5v3t00058c1v5lmg48rp	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg4OTczLCJleHAiOjE3NTE2OTM3NzN9.9TqTbJhngRlaon4BQyLN5kia2D48Em25qmItAGu5elw	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:36:13.24	2025-06-28 05:36:13.241
cmcft7uhb00078c1vxgkota4p	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg5MDY1LCJleHAiOjE3NTE2OTM4NjV9.YVQ7L6RsZh480yez4Q61y6rfyehS4_Se1dfS_ybC21I	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:37:45.742	2025-06-28 05:37:45.743
cmcftgei5000m8c1vwzqp7lt7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNmcjNweXYwMDAwNGNxdHJoOTBwYzRxIiwiaWF0IjoxNzUxMDg5NDY0LCJleHAiOjE3NTE2OTQyNjR9.YL5umy3KQE1fNvPibNcmOgFHjoaBNxBdBPoaAoeNNM0	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	2025-07-05 05:44:24.94	2025-06-28 05:44:24.941
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.certificates (id, "certificateHash", "stellarTxHash", "issuedAt", "expiresAt", status, "submissionId", "userId") FROM stdin;
\.


--
-- Data for Name: draft_files; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.draft_files (id, filename, path, size, "mimeType", "documentType", "uploadedAt", "draftId") FROM stdin;
\.


--
-- Data for Name: drafts; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.drafts (id, "deviceName", "deviceType", "serialNumber", manufacturer, model, "yearOfManufacture", condition, specifications, "purchasePrice", "currentValue", "expectedRevenue", "operationalCosts", "createdAt", "updatedAt", "userId", location) FROM stdin;
cmcfrvawk0001mdk2qrvc0b9u	324234	battery-storage	23423432434234234	rerrerr	t3444	1998	Good	wllwenrlwenrwer	20000	20000	20000	20000	2025-06-28 05:00:00.884	2025-06-28 05:01:11.943	cmcfr3pyv00004cqtrh90pc4q	234234
cmcft4n7900038c1vfj6an0db													2025-06-28 05:35:16.342	2025-06-28 05:35:58.882	cmcfr3pyv00004cqtrh90pc4q	
cmcfte7ru000f8c1vw26co16o	samsung T5000	battery-storage	T48000	Samsung	T48088XBR	2008	Excellent	Its in excelnet condiitions. minor aesthetic details. 	15000	8000	24000	10000	2025-06-28 05:42:42.905	2025-06-28 05:44:12.024	cmcfr3pyv00004cqtrh90pc4q	Santiago de Chile
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.profiles (id, "userId", name, company, email, "walletAddress", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: submission_files; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.submission_files (id, filename, path, size, "mimeType", "documentType", "uploadedAt", "submissionId") FROM stdin;
cmcfrwtol0004mdk2rqspjm4z	2025-06-28T05-01-11-864Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-technical-certification.pdf	uploads/temp/2025-06-28T05-01-11-864Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-technical-certification.pdf	1390	application/pdf	technical-certification	2025-06-28 05:01:11.878	cmcfrwtol0003mdk2xel4ggl9
cmcfrwtol0005mdk28vu19rb6	2025-06-28T05-01-11-866Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-purchase-proof.pdf	uploads/temp/2025-06-28T05-01-11-866Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-purchase-proof.pdf	1404	application/pdf	purchase-proof	2025-06-28 05:01:11.878	cmcfrwtol0003mdk2xel4ggl9
cmcfrwtol0006mdk2hh28isdl	2025-06-28T05-01-11-869Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-maintenance-records.pdf	uploads/temp/2025-06-28T05-01-11-869Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-maintenance-records.pdf	1326	application/pdf	maintenance-records	2025-06-28 05:01:11.878	cmcfrwtol0003mdk2xel4ggl9
cmcftg4f4000i8c1vwsn3o4qg	2025-06-28T05-44-11-793Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-technical-certification.pdf	uploads/temp/2025-06-28T05-44-11-793Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-technical-certification.pdf	1390	application/pdf	technical-certification	2025-06-28 05:44:11.872	cmcftg4f4000h8c1vl4jmqo8c
cmcftg4f4000j8c1voq50xwyc	2025-06-28T05-44-11-795Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-purchase-proof.pdf	uploads/temp/2025-06-28T05-44-11-795Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-purchase-proof.pdf	1404	application/pdf	purchase-proof	2025-06-28 05:44:11.872	cmcftg4f4000h8c1vl4jmqo8c
cmcftg4f4000k8c1v8lwkp553	2025-06-28T05-44-11-803Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-maintenance-records.pdf	uploads/temp/2025-06-28T05-44-11-803Z-GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN-maintenance-records.pdf	1326	application/pdf	maintenance-records	2025-06-28 05:44:11.872	cmcftg4f4000h8c1vl4jmqo8c
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.submissions (id, "deviceName", "deviceType", "serialNumber", manufacturer, model, "yearOfManufacture", condition, specifications, "purchasePrice", "currentValue", "expectedRevenue", "operationalCosts", status, "submittedAt", "updatedAt", "userId", "customDeviceType", location) FROM stdin;
cmcfrwtol0003mdk2xel4ggl9	324234	battery-storage	23423432434234234	rerrerr	t3444	1998	Good	wllwenrlwenrwer	20000	20000	20000	20000	APPROVED	2025-06-28 05:01:11.878	2025-06-28 05:40:46.661	cmcfr3pyv00004cqtrh90pc4q		234234
cmcftg4f4000h8c1vl4jmqo8c	samsung T5000	battery-storage	T48000	Samsung	T48088XBR	2008	Excellent	Its in excelnet condiitions. minor aesthetic details. 	15000	8000	24000	10000	APPROVED	2025-06-28 05:44:11.872	2025-06-28 05:45:09.808	cmcfr3pyv00004cqtrh90pc4q		Santiago de Chile
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dob_user
--

COPY public.users (id, "walletAddress", email, name, company, role, "createdAt", "updatedAt") FROM stdin;
cmcfr3pyv00004cqtrh90pc4q	GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN	\N	\N	\N	ADMIN	2025-06-28 04:38:34.04	2025-06-28 05:24:19.817
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_reviews admin_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.admin_reviews
    ADD CONSTRAINT admin_reviews_pkey PRIMARY KEY (id);


--
-- Name: auth_challenges auth_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.auth_challenges
    ADD CONSTRAINT auth_challenges_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: draft_files draft_files_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.draft_files
    ADD CONSTRAINT draft_files_pkey PRIMARY KEY (id);


--
-- Name: drafts drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.drafts
    ADD CONSTRAINT drafts_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: submission_files submission_files_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.submission_files
    ADD CONSTRAINT submission_files_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin_reviews_submissionId_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "admin_reviews_submissionId_key" ON public.admin_reviews USING btree ("submissionId");


--
-- Name: auth_challenges_challenge_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX auth_challenges_challenge_key ON public.auth_challenges USING btree (challenge);


--
-- Name: auth_sessions_token_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX auth_sessions_token_key ON public.auth_sessions USING btree (token);


--
-- Name: certificates_certificateHash_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "certificates_certificateHash_key" ON public.certificates USING btree ("certificateHash");


--
-- Name: certificates_submissionId_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "certificates_submissionId_key" ON public.certificates USING btree ("submissionId");


--
-- Name: idx_auth_challenges_challenge; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_auth_challenges_challenge ON public.auth_challenges USING btree (challenge);


--
-- Name: idx_auth_challenges_expires_at; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_auth_challenges_expires_at ON public.auth_challenges USING btree ("expiresAt");


--
-- Name: idx_auth_sessions_expires_at; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_auth_sessions_expires_at ON public.auth_sessions USING btree ("expiresAt");


--
-- Name: idx_auth_sessions_token; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_auth_sessions_token ON public.auth_sessions USING btree (token);


--
-- Name: idx_certificates_hash; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_certificates_hash ON public.certificates USING btree ("certificateHash");


--
-- Name: idx_certificates_stellar_tx; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_certificates_stellar_tx ON public.certificates USING btree ("stellarTxHash");


--
-- Name: idx_drafts_updated_at; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_drafts_updated_at ON public.drafts USING btree ("updatedAt");


--
-- Name: idx_drafts_user_id; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_drafts_user_id ON public.drafts USING btree ("userId");


--
-- Name: idx_submissions_status; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_submissions_status ON public.submissions USING btree (status);


--
-- Name: idx_submissions_submitted_at; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_submissions_submitted_at ON public.submissions USING btree ("submittedAt");


--
-- Name: idx_submissions_user_id; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_submissions_user_id ON public.submissions USING btree ("userId");


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_wallet_address; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE INDEX idx_users_wallet_address ON public.users USING btree ("walletAddress");


--
-- Name: profiles_userId_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "profiles_userId_key" ON public.profiles USING btree ("userId");


--
-- Name: profiles_walletAddress_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "profiles_walletAddress_key" ON public.profiles USING btree ("walletAddress");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_walletAddress_key; Type: INDEX; Schema: public; Owner: dob_user
--

CREATE UNIQUE INDEX "users_walletAddress_key" ON public.users USING btree ("walletAddress");


--
-- Name: admin_reviews admin_reviews_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.admin_reviews
    ADD CONSTRAINT "admin_reviews_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "certificates_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: draft_files draft_files_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.draft_files
    ADD CONSTRAINT "draft_files_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public.drafts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: drafts drafts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.drafts
    ADD CONSTRAINT "drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profiles profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: submission_files submission_files_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.submission_files
    ADD CONSTRAINT "submission_files_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: submissions submissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dob_user
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: dob_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

