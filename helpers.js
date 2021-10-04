const getUserViaEmail = (email, usersDB) => {
  for (const key in usersDB) {
    if (usersDB[key].email === email) {
      return usersDB[key];
    }
  }
  return;
};

module.exports = { getUserViaEmail };