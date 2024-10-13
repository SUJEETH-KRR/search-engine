const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "searchEngine",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error: ", err);
    return;
  }
  return console.log("Connection successful");
});

app.get("/", (req, res) => {
  res.send("Default route");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE Username = ? AND Password = ?";
  const values = [email, password];
  db.query(sql, values, (err, data) => {
    if (err) return res.json("DB error occured: ", err);
    if (data.length > 0) return res.status(200).json({ msg: "User found !" });
    else return res.json({ msg: "User Not found or check the credentials" });
  });
});

app.post("/api/search", async (req, res) => {
  const { value } = req.body;
  const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyA5U7lnFOgfm2xP7j7H5HSZvyH9oF4kMjE&cx=8d59952f3963391e6&q=${value}`;
  
  const response = await axios.get(url);
  const items = response.data.items;

  if(!items)
    return res.json({msg: "No Related Search found"})

  const result = items.map((item) => ( {
    title: item.title,
    link: item.link,
    displaylink: item.displayLink,
    snippet: item.snippet
  } ));
  return res.json(result);
});

app.post("/api/history", (req, res) => {
  const { title, link, displaylink } = req.body;
  const sql = "INSERT INTO history (title, link, displaylink) VALUES (?, ?, ?)";
  const values = [title, link, displaylink];
  db.query(sql, values, (err, data) => {
    if(err)
      return res.json({msg: "Error Occured !"});
    return res.json({msg: "History Added !"});
  });
});

app.get("/api/history/data", (req, res) => {
  const sql = "SELECT * FROM history";
  db.query(sql, (err, data) => {
    if(err)
      return res.json({msg: err});
    return res.json(data);
  });
});

app.listen(9000, () => {
  console.log("Listening on port 9000");
});
