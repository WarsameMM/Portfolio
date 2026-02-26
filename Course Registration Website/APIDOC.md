# Course Search API Documentation

Search and Enroll in courses

## Search a course with id

**Request Format:** /search/:id

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Searches for a course using its id, and returns its information if it exists

**Example Request:** /search/10153

**Example Response:**

```
{
	"id": 10153,
	"name": "Back-end Developmemt and Server Side Programming",
	"department": CSE,
	"code": 153,
	"professor_first": "John",
	"professor_last": "Smith",
	"credits": 5,
	"time_start": 1630,
	"time_end": 1750,
	"days": ["T", "Th"],
	"description": "This is a description of the class",
	"max_seats": 100,
	"seats_taken": 0
}
```

**Error Handling:**

500 (Plain text): If there's a server error, returns the message `Server error while searching course`

## Search a course with query

**Request Format:** /search/

**Request Type:** GET

**Query Parameters:** all (boolean), query (string), fields (see below)

**Returned Data Format**: JSON

**Description:** Returns an array of objects that match the query, searching for any courses that contain the query. If `all=true`, return all courses offered. Users can use parameters `query` for a general search along with any of the fields (i.e `credits`)

**Example Request:** /search?query=Jones&credits=5&days=M,W

**Example Response:**

```
[
		{
			"id": 10101,
			"title": "Introduction to Programming 1",
			"department": CSE,
			"code": 101,
			"professor_first": "Steven",
			"professor_last": "Jones",
			"credits": 5,
			"time_start": 1030,
			"time_end": 1120,
			"days": ["M", "W", "F"],
			"description": "This is a description of the class",
			"max_seats": 100,
			"seats_taken": 0
		},
		{
			"id": 10102,
			"title": "Introduction to Programming 2",
			"department": CSE,
			"code": 102,
			"professor_first": "Steven",
			"professor_last": "Jones",
			"credits": 5,
			"time_start": 1130,
			"time_end": 1220,
			"days": ["M", "W", "F"],
			"description": "This is a description of the class",
			"max_seats": 100,
			"seats_taken": 0
		}
]

```

**Error Handling:**

400 (Plain text): If query parameters `start` and `end` aren't numbers, return the message `inputs for start and end must be numbers`

500 (Plain text): If there's a server error, returns the message `Server error while searching courses`

## Register User

**Request Format:** /register

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Creates a new account with username and password. Returns the username if the account is successfully created

**Example Request:** /register

```
{
	"username": "username123",
	"password": "password123"
}
```

**Example Response:**

```
username123
```

**Error Handling:**

400 (Plain text): If username or password aren't provided, return the message `Username and Password are required`

400 (Plain text): If account with username already exists, return the message `Username already taken`

500 (Plain text): If there's a server error, returns the message `Server error while creating account`

## Login user

**Request Format:** /login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Logins the user. Returns the student ID, username, and name if the login is successful.

**Example Request:** /login

```
{
	"username": "username123",
	"password": "password123"
}
```

**Example Response:**

```
{
	"studentID": 101,
	"username": "username123",
	"first_name": "Gary",
	"last_name": "Blue"
}
```

**Error Handling:**

400 (Plain text): If username or password are incorrect, return the message `Incorrect username or password`

500 (Plain text): If there's a server error, returns the message `Server error while logging in`

## Enroll in classes

**Request Format:** /account/enroll

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Enrolls the user in classes and returns what classes have been enrolled in and what classes haven't been enrolled in due to reasons such as seats available or prerequesites

**Example Request:** /account/enroll

```
{
	"cart": [10102, 10153, 11010],
	"studentID": 101
}
```

**Example Response:**

```
{
	"enrolled": [10102, 10153],
        "prereqs": [11010],
        "full": [],
        "timeConflicts": [],
        "classStanding": [],
        "notFound": [],
        "duplicates": []
}
```

**Error Handling:**

500 (Plain text): If there's some other server error, returns the message `Server error while enrolling`

## Drop classes

**Request Format:** /account/drop

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Drops classes and returns the array of dropped class ids

**Example Request:** /account/drop

```
{
	"drop": [10101]
	"studentID": 101
}
```

**Example Response:**

```
{
	"result": [10101]
}
```

**Error Handling:**

500 (Plain text): If there's some other server error, returns the message `Server error while dropping classes`

## View Enrollment History

**Request Format:** /account/history

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns the enrollment history of the user. type=1 means the course was added and type=0 means the course was dropped

**Example Request:** /account/history

```
{
	"studentID": 101
}
```

**Example Response:**

```
{
	[
		"id": 7
		"offered_id": 10102
		"date": 09-04-2025
		"type": 1
	],
	[
		"id": 5
		"offered_id": 10101
		"date": 09-03-2025
		"type": 1
	],
	[
		"id": 2
		"offered_id": 10115
		"date": 09-01-2025
		"type": 0
	]
}
```

**Error Handling:**

500 (Plain text): If there's some other server error, returns the message `Server error while retrieving history`
