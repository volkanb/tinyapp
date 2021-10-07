const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'Al4IHh2xj',
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const { getUserViaEmail } = require('./helpers');

const urlsForUser = (id) => {
  let res = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];
    }
  }
  return res;
};

app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserViaEmail(req.body.email, users);
  if (!user) {
    res.status(403).end(`Invalid username/password!`);
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).end(`Invalid username/password!`);
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.end(`You must login to create a new URL.`);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.end('User authentication error!');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.end('User authentication error!');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].userID = req.session.user_id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.end(`Invalid username/password!`);
    return;
  }
  const user = getUserViaEmail(req.body.email, users);
  if (user) {
    res.status(400);
    res.end(`This email address is not available!`);
    return;
  }

  let newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("user_register", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id] || req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.end('User authentication error!');
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!req.params.shortURL) {
    res.end('Unable to read the short URL.');
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});