const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function () {
  const shortURL = Math.random().toString(34).substring(7)
  return shortURL;
}

console.log(generateRandomString())


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
      res.render("urls_index", templateVars);
    });
    
app.get("/hello", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars)
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: "http://www.lighthouselabs.ca"}
  res.render("urls_show", templateVars);
})