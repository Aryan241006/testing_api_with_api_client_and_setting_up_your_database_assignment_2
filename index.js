const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, 'data.json');

const readData = () => {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;

  if (!book_id || !title || !author || !genre || !year || !copies) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const books = readData();
  const existingBook = books.find((book) => book.book_id === book_id);

  if (existingBook) {
    return res.status(400).json({ error: 'Book with this ID already exists' });
  }

  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);
  writeData(books);

  res.status(201).json(newBook);
});

app.get('/books', (req, res) => {
  const books = readData();
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  const books = readData();
  const book = books.find((b) => b.book_id === req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json(book);
});

app.put('/books/:id', (req, res) => {
  const books = readData();
  const bookIndex = books.findIndex((b) => b.book_id === req.params.id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const updatedBook = { ...books[bookIndex], ...req.body };
  books[bookIndex] = updatedBook;
  writeData(books);

  res.json(updatedBook);
});

app.delete('/books/:id', (req, res) => {
  const books = readData();
  const bookIndex = books.findIndex((b) => b.book_id === req.params.id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const deletedBook = books.splice(bookIndex, 1);
  writeData(books);

  res.json({ message: 'Book deleted successfully', book: deletedBook[0] });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
