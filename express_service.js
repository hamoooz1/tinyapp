const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const templateVars = { urls: urlDatabase };

app.get("/", (req, res) => {
  res.render("urls_index", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
  console.log(req.params)
  res.render("urls_index", templateVars);
});