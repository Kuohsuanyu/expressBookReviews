const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// 註冊
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
  if (isValid(username)) return res.status(409).json({ message: "Username already exists." });

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// 所有書籍
public_users.get('/', async (req, res) => {
  try {
    // 模擬非同步處理，例如資料庫查詢
    const getBooks = () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(books), 100); // 模擬延遲 100ms
      });
    };

    const result = await getBooks();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books." });
  }
});


// 依 ISBN 查詢
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  // 模擬 Promise 查詢
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found for this ISBN.");
      }
    });
  };

  getBookByISBN(isbn)
    .then((book) => res.status(200).json(book))
    .catch((errMsg) => res.status(404).json({ message: errMsg }));
});


// 依作者查詢
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const result = Object.entries(books)
        .filter(([_, book]) => book.author.toLowerCase() === author)
        .map(([isbn, book]) => ({ isbn, ...book }));

      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found for this author.");
      }
    });
  };

  getBooksByAuthor(author)
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(404).json({ message: err }));
});


// 依標題查詢
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const getBookByTitle = (title) => {
    return new Promise((resolve, reject) => {
      for (let key in books) {
        if (books[key].title.toLowerCase() === title) {
          resolve({ isbn: key, ...books[key] });
          return;
        }
      }
      reject("Book not found for this title.");
    });
  };

  getBookByTitle(title)
    .then((book) => res.status(200).json(book))
    .catch((errMsg) => res.status(404).json({ message: errMsg }));
});


// 書評查詢
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  return books[isbn]
    ? res.status(200).json(books[isbn].reviews)
    : res.status(404).json({ message: "Book not found for this ISBN." });
});

module.exports.general = public_users;
