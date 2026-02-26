"use strict";

const SERVERERROR = 500;
const NOOUTPUT = 204;
const USERERROR = 400;
const DEFAULTPORT = 8000;

const express = require("express");
const app = express();

const fs = require("fs").promises;
const multer = require("multer");

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(multer().none());

app.post('/name/submit', async function(req, res) {
  let name = req.body.name;
  try {
    await fs.writeFile("name.txt", name);
    res.type("text")
      .send(name);
  } catch (error) {
    res.status(SERVERERROR).type("text")
      .send("There was an error with the server when submitting the name.");
  }
});

app.get('/name/get', async function(req, res) {
  try {
    let name = await fs.readFile("name.txt", "utf8");
    if (name === '') {
      res.status(NOOUTPUT)
        .send("The name directory does not exist.");
    } else {
      res.type('text').send(name);
    }
  } catch (error) {
    res.status(SERVERERROR).type('text')
      .send("Error with sever when getting users inputted name.");
  }
});

app.post('/name/clear', async function(req, res) {
  try {
    await fs.writeFile("name.txt", "");
    res.type('text').send("Name cleared.");
  } catch (error) {
    res.status(SERVERERROR).type('text')
      .send("Error with server when trying to clear users name.");
  }
});

app.get("/backgrounds/get", async function(req, res) {
  try {
    let backgrounds = await fs.readFile("dndbackgrounds.json", 'utf8');
    backgrounds = JSON.parse(backgrounds);
    res.json(backgrounds);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(NOOUTPUT).type('text')
        .send("No backgrounds file found.");
    } else {
      res.status(SERVERERROR).type('text')
        .send("Error with server when getting backgrounds.");
    }
  }
});

app.post("/backgrounds/add", async function(req, res) {
  try {
    let background = {"name": req.body.background};
    let backgrounds = await fs.readFile("dndbackgrounds.json", 'utf8');
    backgrounds = JSON.parse(backgrounds);
    let contain = backgrounds
      .some(currBackground => currBackground.name === background.name);
    if (!contain) {
      backgrounds.push(background);
      await fs.writeFile("dndbackgrounds.json", JSON.stringify(backgrounds));
      res.type('text')
        .send("Backgroud successfully added!");
    } else {
      res.status(USERERROR).type('text')
        .send("This background is already listed. " +
        "Please choose a different one and try again.");
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(NOOUTPUT).type('text')
        .send("No backgrounds file found.");
    } else {
      res.status(SERVERERROR).type('text')
        .send("Error with server when adding a background.");
    }
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULTPORT;
app.listen(PORT);