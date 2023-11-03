//Required Modules and Setup
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session")
const { findUserByEmail } = require("./helpers")

//Middleware Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["hamza"]
}))

//Sample Data
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

// Generating a random string for short URLs
const generateRandomString = function () {
  const shortURL = Math.random().toString(34).substring(7)
  return shortURL;
}

// Function to get URLs for a specific user
const urlsForUser = function (id) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = { longURL: urlDatabase[shortURL].longURL };
    }
  }
  return userURLs;
};

// Listening on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//homepage
app.get("/", (req, res) => {
  const userId = req.session.user_id;

  // if no user ID
  if (!userId) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//register page
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  const templateVars = {
    user,
    urls: urlDatabase
  };
  //if logged in be redirected to /urls else render register page
  if (userId) {
    res.redirect("/urls")
  }
  else {
    res.render("urls_register", templateVars)
  }
})

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  //if no userID redirect login
  if (!userId) {
    res.redirect("/login")
  }
  // render the urls_new.ejs if user is logged in
  else {
    const user = users[userId];
    const templateVars = { urls: urlDatabase, user };
    res.render("urls_new", templateVars);
  }
})

//login form responsible for form submission
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  //if no email or password output
  if (!email || !password) {
    res.status(404).send("<h1> Missing Requirements</h1>");
    return;
  }

  const user = findUserByEmail(email, users);
  //if user is not found
  if (!user) {
    res.status(403).send("user does not exist");
  } // if user does not match password
  else if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("password does not match")
  }
  else {
    req.session.user_id = user.id;
    res.redirect("/urls")
  }

})
//
app.get("/urls", (req, res) => {
  const loggedInID = req.session.user_id;
  const user = users[loggedInID]

  //if not logged in send HTML erorr response
  if (!loggedInID) {
    res.status(403).send("<h1> Please login to view URLs</h1>");
    return;
  }
  //renders urls_index with user info
  const url = urlsForUser(loggedInID);
  const templateVars = {
    user,
    urls: url,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const loggedInID = req.session.user_id;

  if (!loggedInID) { //checks if logged in
    res.status(401).send("<h1> please login to view URLS</h1>")
    return;
  }

  const user = users[loggedInID]
  const shortId = req.params.id;

  if (!urlDatabase[shortId]) {
    res.status(404).send("url does not exist");
    return;
  }

  const { userID, longURL } = urlDatabase[shortId];

  if (userID !== loggedInID) { 
    res.status(403).send("<h1> Not yours </h1>");
  }

  const templateVars = { id: req.params.id, longURL: longURL, user }
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(404).send("need to be logged in to create new URL")
  }
  else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId };
    res.redirect(`urls/${shortURL}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
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

  delete urlDatabase[shortId];
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortId = req.params.id;

  if (!userId) { //check if user is not logged in
    res.status(404).send("<h1> please login to view URLS</h1>")
    return;
  }

  if (!urlDatabase[shortId]) { //if typed in a non-existent ID
    res.status(404).send("does not exist");
    return;
  }

  if (userId !== urlDatabase[shortId].userID) { //If using URL that is not of users
    res.status(403).send("its not yours")
    return;
  }

  const newLongURL = req.body.longURL;
  // Update the longURL in the urlDatabase
  urlDatabase[shortId].longURL = newLongURL;
  res.redirect("/urls");
});

//when logout button pressed reset cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login")
})

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  let { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  let hashedPassword = bcrypt.hashSync(password, salt);

//if email or password is empty
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty");

  } else if (findUserByEmail(email, users)) { //if trying to sign up with existent email
    res.status(400).send("User already exists");

  } else { //register with new email and password
    const newUser = {
      id: userId,
      email: email,
      password: hashedPassword,
    };

    users[userId] = newUser;

    req.session.user_id = userId;
    res.redirect("/urls");
  }
})

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id // b2xvn2 
  const longUrl = urlDatabase[shortId].longURL; // lighthouselabs.ca
//checks if URL exists
  if (!longUrl) {
    res.status(404).send("<h1> does not exist </h1>")
  }
  //redirects to URL
  else {
    res.redirect(longUrl);
  }
});
//check if user logged in or not
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: null };
    res.render("urls_login", templateVars);
  }
})