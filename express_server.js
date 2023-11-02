const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function () {
  const shortURL = Math.random().toString(34).substring(7)
  return shortURL;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(express.urlencoded({ extended: true }));

//homepage
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

//register page
  app.get("/register", (req, res) => {
    const userId = req.cookies["user_id"];
    const user = users[userId]
    const templateVars = {
      user,
      urls: urlDatabase
    };
    res.render("urls_register", templateVars)
  })
//hello page
  app.get("/hello", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
//
  app.get("/urls/new", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_new", templateVars)
  })
  
  app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie("username", username)
    res.redirect("/urls")
  })
  
  app.get("/urls", (req, res) => {
    const userId = req.cookies["user_id"];
    const user = users[userId]
    const templateVars = {
      user,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  });

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortId = req.params.id // b2xvn2 
  delete urlDatabase[shortId]; // lighthouselabs.ca
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const newLongURL = req.body.longURL;
  // Update the longURL in the urlDatabase
  urlDatabase[shortId] = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const {email, password} = req.body;

  const newUser = {
    id: userId,
    email: email,
    password: password
  };

  users[userId] = newUser;

  res.cookie("user_id", userId);
  console.log(users)
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id // b2xvn2 
  const longUrl = urlDatabase[shortId]; // lighthouselabs.ca
  res.redirect(longUrl);
});

