const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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

const getUserViaEmail = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return;
};

const urlsForUser = (id) => {
  let res = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];      
    }
  }
  return res;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log('Login attempt from user: ' + req.body.email);
  const user = getUserViaEmail(req.body.email);
  if (!user) {
    res.status(403).end();
  } else if (user.password !== req.body.password) {
    res.status(403).end();
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.end(`You must login to create a new URL.`);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies['user_id'] || req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.end('User authentication error!');
  }
  console.log('Deleting ' + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  console.log('Gonna update shortURL: ' + req.params.shortURL);
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].userID = req.cookies['user_id'];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).end();
    return;
  }
  const user = getUserViaEmail(req.body.email);
  if (user) {
    res.status(400).end();
    return;
  }

  let newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };
  users[newUser.id] = newUser;
  res.cookie('user_id', newUser.id);
  console.log(users);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  if (!templateVars.user) {
    res.redirect("/urls");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']]
  };
  if (!templateVars.user || req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.end('User authentication error!');
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!req.params.shortURL) {
    res.end('Unable to read the short URL.')
  }
  res.redirect(longURL);
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