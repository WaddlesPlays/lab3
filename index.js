const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const port = 3000;


app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/visit-count", (req, res) => {
  let oldValue = parseInt(req.cookies.count);
  oldValue ||= 0; // i love you Logical OR assignment...
  console.log(oldValue);
  res.cookie("count", oldValue + 1);
  res.send(oldValue + 1 + ""); // i HATE you dynamic typing
});


// actual lab 3 routes //

app.get("/api/items", (req, res) => {
  // return all items
});

app.get("/api/items/:id", (req, res) => {
  // return the item with the id
});

app.post("/api/items", (req, res) => {
  // add an item
});

app.delete("/api/items/:id", (req, res) => {
  // delete an item
});

// error handling
app.use((err, req, res, next) => {
  // handle errors
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

