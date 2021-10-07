const getUserViaEmail = (email, usersDB) => {
  for (const key in usersDB) {
    if (usersDB[key].email === email) {
      return usersDB[key];
    }
  }
  return;
};

const urlsForUser = (id, urlDatabase) => {
  let res = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];
    }
  }
  return res;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserViaEmail, urlsForUser, generateRandomString };