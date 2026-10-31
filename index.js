const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const port = 3000;


app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/visit-count', (req, res) => {
  let oldCookie = req.cookies.count;
  if (!oldCookie) oldCookie = 0;
  res.cookie("count", oldValue++).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

