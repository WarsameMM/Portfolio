"use strict";

const DEFAULTPORT = 8000;

const express = require("express");
const app = express();
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const {createToken, validateToken} = require("./JWT");


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(cookieParser());

/**
 * gets the information of a single course by offered id
 */
app.get("/search/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let db = await getDBConnection();
    let qry = `SELECT o.id, c.name, c.department, c.code,
      p.first_name "professor_first", p.last_name "professor_last", c.credits,
      o.start "time_start", o.end "time_end", c.description,
      o.max_seats, o.seats_taken
      FROM ClassesOffered o, Classes c, Professors p
      WHERE o.id = ?
      AND c.id = o.class_id
      AND p.id = o.professor_id`;
    let result = await db.get(qry, [id]);
    if (!result.id) {
      await db.close();
      res.type("text")
        .send("No class found");
    } else {

      await getDays(db, [result]);
      await getTypes(db, [result]);
      await db.close();
      res.type("json")
        .send(result);
    }
  } catch (error) {
    console.log(error);
    res.type("text").status(500)
      .send("Server error while searching course");
  }
});

/**
 * gets the information of courses based on query
 */
app.get("/search", async (req, res) => {
  let search = req.query.search ? "%" + req.query.search + "%" : null;
  let all = req.query.all;
  let name = req.query.name ? "%" + req.query.name + "%" : "%";
  let department = req.query.department ? "%" + req.query.department + "%" : "%";
  let code = req.query.code ? "%" + req.query.code + "%" : "%";
  let first = req.query.first_name ? "%" + req.query.first_name + "%" : "%";
  let last = req.query.last_name ? "%" + req.query.last_name + "%" : "%";
  let credits = req.query.credits ? "%" + req.query.credits + "%" : "%";
  let start =  req.query.start || 0;
  let end = req.query.end || 2400;

  let result;
  try {
    let db = await getDBConnection();
    if (all) {
      let qry = `SELECT o.id, c.name, c.department, c.code, c.min_class,
        p.first_name "professor_first", p.last_name "professor_last", c.credits,
        o.start "time_start", o.end "time_end", c.description,
        o.max_seats, o.seats_taken
        FROM ClassesOffered o, Classes c, Professors p
        WHERE c.id = o.class_id
        AND p.id = o.professor_id`;

      result = await db.all(qry);
    } else{
      if ((isNaN(start) || isNaN(end))) {
        res.type("text").status(400)
          .send("inputs for start and end must be numbers");
      } else {

        if (search) {
          let qry = `SELECT o.id, c.name, c.department, c.code, c.min_class,
            p.first_name "professor_first", p.last_name "professor_last", c.credits,
            o.start "time_start", o.end "time_end", c.description,
            o.max_seats, o.seats_taken
            FROM ClassesOffered o, Classes c, Professors p
            WHERE (LOWER(o.id) = ?
            OR LOWER(c.name) LIKE ?
            OR LOWER(c.department) LIKE ?
            OR LOWER(c.code) LIKE ?
            OR c.credits LIKE ?
            OR LOWER(p.first_name) LIKE ?
            OR LOWER(p.last_name) LIKE ?)

            AND LOWER(c.name) LIKE ?
            AND LOWER(c.department) LIKE ?
            AND LOWER(c.code) LIKE ?
            AND c.credits LIKE ?
            AND LOWER(p.first_name) LIKE ?
            AND LOWER(p.last_name) LIKE ?
            AND o.start >= ?
            AND o.end <= ?
            AND c.id = o.class_id
            AND p.id = o.professor_id`;
          result = await db.all(qry, [search.toLowerCase(),
            search.toLowerCase(), search.toLowerCase(), search.toLowerCase(),
            search.toLowerCase(), search.toLowerCase(),
            search.toLowerCase(), name.toLowerCase(), department.toLowerCase(),
            code.toLowerCase(), credits.toLowerCase(), first.toLowerCase(), last.toLowerCase(),
            start, end
          ]);
        } else {
          let qry = `SELECT o.id, c.name, c.department, c.code, c.min_class,
            p.first_name "professor_first", p.last_name "professor_last", c.credits,
            o.start "time_start", o.end "time_end", c.description,
            o.max_seats, o.seats_taken
            FROM ClassesOffered o, Classes c, Professors p
            WHERE LOWER(c.name) LIKE ?
            AND LOWER(c.department) LIKE ?
            AND LOWER(c.code) LIKE ?
            AND c.credits LIKE ?
            AND LOWER(p.first_name) LIKE ?
            AND LOWER(p.last_name) LIKE ?
            AND o.start >= ?
            AND o.end <= ?
            AND c.id = o.class_id
            AND p.id = o.professor_id`;
          result = await db.all(qry, [name.toLowerCase(), department.toLowerCase(),
            code.toLowerCase(), credits.toLowerCase(), first.toLowerCase(), last.toLowerCase(),
            start, end
          ]);

        }
      }
    }
    await getDays(db, result);
    await getTypes(db, result);
    await db.close();
    res.type("json")
      .send(result);

  } catch (error) {
    console.log(error);
    res.type("text").status(500)
      .send("Server error while searching course");
  }
});

/**
 * takes the input username and password and logs the user in if they're correct
 */
app.post("/account/login", async (req, res) => {
  try {
    let db = await getDBConnection();
    let qry = `SELECT *
      FROM students s
      WHERE s.username = ?
      AND s.password = ?`;
    let result = await db.get(qry, [req.body.username, req.body.password]);
    await db.close();
    if (!result) {
      res.type("text").status(400)
        .send("Incorrect username or password");
    } else {
      const accessToken = createToken(result);
      res.cookie("access-token", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
      });

      res.json({
        "studentID": result.id,
        "username": result.username,
        "first_name": result.first_name,
        "last_name": result.last_name
      })
    }
  } catch (error) {
    console.log(error);
    res.type("text").status(500)
      .send("Server error while logging in");
  }
});

/**
 * clears the JWT token that keeps track of login
 */
app.post("/account/logout", (req, res) => {
  res.clearCookie("access-token");
  res.type("text")
    .send("Logged out successfully");
})

/**
 * Enrolls the array of courses for the user
 */
app.post("/account/enroll", validateToken, async (req, res) => {
  let enrolled = new Set();
  let cart = JSON.parse(req.body.cart);
  let studentID = req.user.id;
  let prereqs = new Set();
  let full = new Set();
  let timeConflicts = new Set();
  let classStanding = new Set();
  let notFound = new Set();
  let duplicates = new Set();
  let restricted = new Set();

  try {
    let db = await getDBConnection();
    let studentqry = `SELECT *
      FROM students
      WHERE id = ?`;
    let student = await db.get(studentqry, [studentID]);

    if (!student) {
      res.type("text").status(400).send("Student not found");
    } else if (!Array.isArray(cart)){
      res.type("text").status(400).send("cart must be an array of course offering ids");
    } else {
      let alphanum = crypto.randomUUID();
      while (await db.get(`
        SELECT * FROM History WHERE transaction_id = ?`, [alphanum])) {
        alphanum = crypto.randomUUID();
      }
      for (let item of cart) {
        let can = true;
        let qry = `SELECT o.*, c.department, c.min_class, c.restricted
          FROM ClassesOffered o, Classes c
          WHERE o.id = ?
          AND o.class_id = c.id`;

        let result =  await db.get(qry, [item]);
        if (!result) {
          notFound.add(item);
          can = false;
        } else {

          let classPrereqs = await db.all(`SELECT prerequesite_id
            FROM Prerequesites
            WHERE class_id = ?`, result.class_id);

          for (let prereq of classPrereqs) {
            if (!(await db.get(`
              SELECT * FROM ClassesTaken
              WHERE student_id = ? AND class_id = ?`, [studentID, prereq.prerequesite_id]))) {
                prereqs.add(item);
                can = false;
            }
          }

          if (result.seats_taken >= result.max_seats) {
            full.add(item);
            can = false;
          }

          /**
           * time conflicts
           * for every class that the student has enrolled in
           * check if result conflicts with that class
           */

          let enrolledTimes = await db.all(`SELECT o.start, o.end, d.day
            FROM ClassesOffered o, Enrollment e, DaysOffered d
            WHERE o.id = e.offered_id
            AND d.offered_id = o.id
            AND e.student_id = ?`, [studentID]);

          await getDays(db, [result]);

          for (let e of enrolledTimes) {
            console.log(e)
            if (result.days.includes(e.day) &&
              ((result.start >= e.start && result.start <= e.end) ||
              (result.end >=e.start && result.end <= e.end))) {
              timeConflicts.add(item);
              can = false;
            }
          }

          if (result.min_class > student.class) {
            classStanding.add(item);
            can = false;
          }

          if (await db.get(`SELECT *
            FROM Enrollment
            WHERE offered_id = ? AND student_id = ?`, [item, studentID])) {
            duplicates.add(item);
            can = false;
          }

          if (result.restricted && result.department !== student.department) {
            restricted.add(item);
            can = false;
          }
        }

        if (can) {
          let insertEnrolled = `INSERT INTO Enrollment (student_id, offered_id)
            VALUES (?, ?)`;
          await db.run(insertEnrolled, [studentID, item]);

          let insertHistory = `INSERT INTO History (student_id, offered_id, type, transaction_id)
            VALUES (?, ?, 1, ?)`;

          await db.run(insertHistory, [studentID, item, alphanum]);
          await db.run(`UPDATE ClassesOffered
            SET seats_taken = seats_taken + 1
            WHERE id = ?`, [item]);
          enrolled.add(item);
        }
      }
      await db.close();
      if (enrolled.size === 0) {
        alphanum = null;
      }
      res.json({
        "confirmation": alphanum,
        "enrolled": Array.from(enrolled),
        "prereqs": Array.from(prereqs),
        "full": Array.from(full),
        "timeConflicts": Array.from(timeConflicts),
        "classStanding": Array.from(classStanding),
        "notFound": Array.from(notFound),
        "duplicates": Array.from(duplicates),
        "restricted": Array.from(restricted)
      })
    }
  } catch (error) {
    console.log(error);
    res.type("text").status(500)
      .send("Server error while enrolling")
  }
});

/**
 * Drops the array of courses form the user's enrolled courses
 */
app.post("/account/drop", validateToken, async (req, res) => {
  let drop = JSON.parse(req.body.drop);
  if (!Array.isArray(drop)) {
    res.type("text").status(400)
      .send("input must be array of courses to drop");
  } else {
    let studentID = req.user.id;
    let alphanum = crypto.randomUUID();
    try {
      let db = await getDBConnection();
        while (await db.get(`
        SELECT * FROM History WHERE id = ?`, [alphanum])) {
        alphanum = crypto.randomUUID();
      }
      for (let d of drop) {
        await db.run(`DELETE FROM Enrollment
          WHERE student_id = ? AND offered_id = ?`, [studentID, d]);
        let insertHistory = `INSERT INTO History (student_id, offered_id, type, transaction_id)
            VALUES (?, ?, 0, ?)`;
        await db.run(insertHistory, [studentID, d, alphanum]);
        await db.run(`UPDATE ClassesOffered
          SET seats_taken = seats_taken - 1
          WHERE id = ?`, [d]);
      }
      await db.close();
      res.json({
        "dropped": drop,
        "confirmation_num": alphanum
      }
      )
    } catch (error) {
      console.log(error);
      res.type("text").status(500)
        .send("Server error while dropping classses");
    }
  }
});

/**
 * Gets the past transactions for a user
 */
app.post("/account/history", validateToken, async (req, res) => {
  let studentID = req.user.id;
  try {
    let db = await getDBConnection();
    let results = await db.all(`SELECT h.transaction_id, h.offered_id, h.date, h.type
      FROM History h
      WHERE h.student_id = ?
      ORDER BY h.date DESC`, [studentID]);
    await db.close();
    res.json(results);
  } catch (error) {
    res.type("text").status(500)
      .send("Server error while retrieving history");
  }
});

/**
 * Gets the enrolled courses for a user
 */
app.post("/account/enrolled", validateToken, async (req, res) => {
  let studentID = req.user.id;
  try {
    let db = await getDBConnection();
    let results = await db.all(`SELECT e.offered_id
      FROM Enrollment e
      WHERE e.student_id = ?`, [studentID]);
    await db.close();
    res.json(results);
  } catch (error) {
    res.type("text").status(500)
      .send("Server error while retrieving currently enrolled classes");
  }
});

/**
 * Changes the users password
 */
app.post("/account/change-password", validateToken, async (req, res) => {
  let studentID = req.user.id;
  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;
  try {
    let db = await getDBConnection();

    if (await db.get(`SELECT *
      FROM Students
      WHERE id = ? AND password = ?`, [studentID, oldPassword])) {
      await db.run(`UPDATE Students
        SET password = ?
        WHERE id = ?`, [newPassword, studentID]);
      await db.close();
      res.type("text")
        .send("Password changed.");
    } else {
      await db.close();
      res.type("text").status(400)
        .send("Old password is incorrect");
    }

  } catch (error) {
    console.log(error);
    res.type("text").status(500)
      .send("Server error while changing password");
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULTPORT;
app.listen(PORT);

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
      filename: "db.db",
      driver: sqlite3.Database
  });

  return db;
}

/**
 * Gets the days of the classes and inserts the array of days into the classes
 * @param {sqlite3.Database} db - database of classes and days
 * @param {JSON} arr  - array of class objects
 */
async function getDays(db, arr) {
  for (let i of arr) {
    let qry2 = `SELECT *
      FROM DaysOffered d, ClassesOffered o
      WHERE o.id = d.offered_id
      AND o.id = ?`;
    let result2 = await db.all(qry2, i["id"]);
    let days =  [];
    for (let j of result2) {
      days.push(j["day"]);
    }
    i["days"] = days;
  }
}

/**
 * Gets the credit types of the classes and inserts the array of types into the classes
 * @param {sqlite3.Database} db - database of classes and days
 * @param {JSON} arr  - array of class objects
 */
async function getTypes(db, arr) {
  for (let i of arr) {
    let qry2 = `SELECT *
      FROM Types t, Classes c, ClassesOffered o
      WHERE t.class_id = c.id
      AND c.id = o.class_id
      AND o.id = ?`;
    let result2 = await db.all(qry2, i["id"]);
    let types =  [];
    for (let j of result2) {
      types.push(j["type"]);
    }
    i["types"] = types;
  }
}

