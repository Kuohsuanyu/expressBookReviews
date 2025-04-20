const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = "my_secret_key";

const isValid = (username) => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

// 登入
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid username or password." });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful.", token });
});

// 新增/修改 書評
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user?.username;

  if (!username) return res.status(401).json({ message: "Unauthorized: Missing user info." });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found." });
  if (!review) return res.status(400).json({ message: "Review content is required." });

  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

// 刪除 書評（只能刪自己的）
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username;

  if (!username) return res.status(401).json({ message: "Unauthorized: User not logged in." });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found." });
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user." });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
