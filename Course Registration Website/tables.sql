CREATE TABLE "Classes" (
	"id"	INTEGER NOT NULL DEFAULT 1,
	"name"	TEXT NOT NULL,
	"department"	TEXT NOT NULL,
	"code"	INTEGER NOT NULL,
	"credits"	INTEGER NOT NULL,
	"level"	INTEGER NOT NULL,
	"min_class"	INTEGER NOT NULL,
	"description"	TEXT,
	PRIMARY KEY("id")
)

CREATE TABLE "ClassesOffered" (
	"id"	INTEGER,
	"class_id"	INTEGER NOT NULL,
	"professor_id"	INTEGER NOT NULL,
	"start"	INTEGER NOT NULL,
	"end"	INTEGER NOT NULL,
	"max_seats"	INTEGER NOT NULL,
	"seats_taken"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("professor_id") REFERENCES "Professors"("id")
)

CREATE TABLE "ClassesTaken" (
	"student_id"	INTEGER NOT NULL,
	"class_id"	TEXT NOT NULL
)

CREATE TABLE "DaysOffered" (
	"offered_id"	INTEGER NOT NULL,
	"day"	TEXT NOT NULL,
	PRIMARY KEY("offered_id","day"),
	FOREIGN KEY("offered_id") REFERENCES "ClassesOffered"("id")
)

CREATE TABLE "Enrollment" (
	"student_id"	INTEGER NOT NULL,
	"offered_id"	INTEGER NOT NULL,
	FOREIGN KEY("offered_id") REFERENCES "ClassesOffered"("id"),
	FOREIGN KEY("student_id") REFERENCES "Students"("id")
)

CREATE TABLE "History" (
	"id"	INTEGER,
	"student_id"	INTEGER NOT NULL,
	"offered_id"	INTEGER NOT NULL,
	"date"	DATETIME DEFAULT current_timestamp,
	"type"	BOOL,
	PRIMARY KEY("id"),
	FOREIGN KEY("offered_id") REFERENCES "ClassesOffered"("id")
)

CREATE TABLE "Prerequesites" (
	"class_id"	INTEGER NOT NULL,
	"prerequesite_id"	INTEGER NOT NULL,
	FOREIGN KEY("class_id") REFERENCES "Classes"("id"),
	FOREIGN KEY("prerequesite_id") REFERENCES "Classes"("id")
)

CREATE TABLE "Professors" (
	"id"	INTEGER,
	"first_name"	TEXT NOT NULL,
	"last_name"	TEXT NOT NULL,
	PRIMARY KEY("id")
)

CREATE TABLE "Students" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"first_name"	TEXT NOT NULL,
	"last_name"	TEXT NOT NULL,
	"class"	INTEGER NOT NULL,
	"department"	TEXT,
	PRIMARY KEY("id")
)

CREATE TABLE "Types" (
	"class_id"	INTEGER NOT NULL,
	"type"	TEXT,
	FOREIGN KEY("class_id") REFERENCES "Classes"("id")
)