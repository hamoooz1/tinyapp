const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  "3s6qj": {
    id: '3s6qj',
    email: 'a@a.com',
    password: '$2a$10$jDNn2Pc7GCp3JfnBPnbhWecNKtiKxgmORlNkoaYkxxqRZHy2c5dIi' //1234
  }
};

const generateRandomString = function () {
  const shortURL = Math.random().toString(34).substring(7)
  return shortURL;
}

const findUserByEmail = function (email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}

const urlsForUser = function (id) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = {longURL: urlDatabase[shortURL].longURL};
    }
  }
  return userURLs;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// middleware: parses url encoded to "UTF-8"
app.use(express.urlencoded({ extended: true }));



//homepage
app.get("/", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]
  const templateVars = { urls: urlDatabase, user };
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

  if (userId === null) {
    res.redirect("/urls")
  }

  res.render("urls_register", templateVars)
})
//hello page
app.get("/hello", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
//
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];

  if (!userId) {
    res.redirect("/login")
  }
  else {
  const user = users[userId]
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars)
  }
})

//login form
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user) {
    res.status(403).send("user does not exist");
  }

  else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("password does not match")
  }
  else {
    res.cookie("user_id", user.id)
    res.redirect("/urls")
  }

})

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]
  const url = urlsForUser(userId);

  const templateVars = {
    user,
    urls: url
  };

  if (!userId) {
    res.status(404).send("<h1> please login to view URLS</h1>")
  }
  else {
  res.render("urls_index", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];

  if (!userId) {
    res.status(401).send("<h1> please login to view URLS</h1>")
    return;
  }

  const user = users[userId]
  const shortId = req.params.id;

  console.log("shortid: ", shortId)
  console.log("database: ", urlDatabase)
  
  if(!urlDatabase[shortId]) {
    res.status(404).send("url does not exist");
    return;
  }

  const longUrl = urlDatabase[shortId].longURL;


  const templateVars = { id: req.params.id, longURL: longUrl, user }
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.status(404).send("need to be logged in to create new URL")
  }
  else {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId};
  console.log("url database: ", urlDatabase)
  res.redirect(`urls/${shortURL}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortId = req.params.id // b2xvn2 
  
  if (!userId) {
    res.status(404).send("<h1> please login to view URLS</h1>")
    return;
  }
  
  if (!urlDatabase[shortId]) {
    res.status(404).send("does not exist");
    return;
  }
  
  if (userId !== urlDatabase[shortId].userID) {
    res.status(403).send("its not yours")
    return;
  }
  
  delete urlDatabase[shortId]; // lighthouselabs.ca
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortId = req.params.id;
  
  if (!userId) {
    res.status(404).send("<h1> please login to view URLS</h1>")
    return;
  }
  
  if (!urlDatabase[shortId]) {
    res.status(404).send("does not exist");
    return;
  }
  
  if (userId !== urlDatabase[shortId].userID) {
    res.status(403).send("its not yours")
    return;
  }
  
  const newLongURL = req.body.longURL;
  // Update the longURL in the urlDatabase
  urlDatabase[shortId].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login")
})

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  let { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10)

  let hashedPassword = bcrypt.hashSync(password, salt);

  if (email === '' || password === '') {
    res.status(400).send("user did not meet requirments");
  }

  else if (findUserByEmail(email) !== null) {
    res.status(400).send("user already exists");
  } else {
    const newUser = {
      id: userId,
      email: email,
      password: hashedPassword
    };

    users[userId] = newUser;

    res.cookie("user_id", userId);
    console.log(users)
    res.redirect("/urls");
  }
})

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id // b2xvn2 
  const longUrl = urlDatabase[shortId].longURL; // lighthouselabs.ca

  if (!longUrl) {
    res.status(404).send("<h1> does not exist </h1>")
  }
  else {
    res.redirect(longUrl);
  }
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]
  const templateVars = { urls: urlDatabase, user };

  if (user) {
    res.redirect("/urls")
  }
  res.render("urls_login", templateVars)
})