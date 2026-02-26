# Overview
This API personalizes the page for the user, allowing the user to choose and rechoose
a name and add backgrounds for the DND character generator.

## Endpoint 1: Submitting a name.
**Request Format:** /name/submit

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Stores the given name in a file and returns it.

**Example Request:** "/name/submit" with parameters name=givenName

**Example Response:**

```
Gary
```

**Error Handling:**
Possible 500 error(Plain Text):
if something goes wrong with the server, returns error with text
```
There was an error with the server when submitting the name.
```


## Endpoint 2: Getting the provided name
**Request Format:** /name/get

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Gets and returns the stored name. If theres no stored name, returns nothing.

**Example Request:** /name/get

**Example Response:**

```
Gary
```

**Error Handling:**
Possible 500 and 204 error(Both Plain Text):
if something goes wrong with the server, returns error with text
```
There was an error with the server when submitting the name.
```
if theres no name file, returns error with text

```
The name directory does not exist.
```

## Endpoint 3: Deleting the provided name
**Request Format:** /name/claer

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Erases the stored name and returns text confirming sucesss.

**Example Request:** /name/clear

**Example Response:**

```
Name cleared.
```

**Error Handling:**
Possible 500 error(Plain Text):
if something goes wrong with the server, returns error with text
```
Error with server when trying to clear users name.
```


## Endpoint 4: Getting Backgrounds
**Request Format:** /backgrounds/get

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** gets and returns all the backgrounds in the background file in a JSON format.

**Example Request:** /backgrounds/get

**Example Response:**

```json
[
{"name":"Acolyte"},
{"name":"Criminal/Spy"},
{"name":"Artisan"}
]
```

**Error Handling:**
Possible 204 and 500 errors(Both Plain Text):
if something goes wrong with the server, returns error with text
```
Error with server when getting backgrounds.
```
if the file containing backgrounds doesn't exist, return error with text
```
No backgrounds file found.
```

## Endpoint 5: Adding a Background*
**Request Format:** /backgrounds/add

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** adds the users background to the end of the background list as long as its unique.

**Example Request:** /backgrounds/add with parameters background=newbackground

**Example Response:**

```
Backgroud successfully added!
```

**Error Handling:**
Possible 500, 400 and 204 errors(All Plain Text):
if something goes wrong with the server, returns error with text
```
Error with server when adding a backgrounds.
```
if the file containing backgrounds doesn't exist, return error with text
```
No backgrounds file found.
```
if the added background is already in the background list return error text with

```
This background is already listed. Please choose a different one and try again.
```