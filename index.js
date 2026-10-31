const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const port = 3000;


app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/visit-count', (req, res) => {
  let oldValue = parseInt(req.cookies.count);
  oldValue ||= 0; // i love you Logical OR assignment...
  console.log(oldValue);
  res.cookie("count", oldValue + 1);
  res.send(oldValue + 1 + "");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

