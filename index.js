const express = require('express');
const fs = require('node:fs');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.json());
const port = 3000;


app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/visit-count", (req, res) => {
  let oldValue = parseInt(req.cookies.count);
  oldValue ||= 0; // i love you logical OR assignment... (zig orelse ftw tho)
  console.log(oldValue);
  res.cookie("count", oldValue + 1);
  res.send(oldValue + 1 + ""); // and then I'm reminded of why I hate JS...
});


// actual lab 3 routes //

app.use((req, res, next) => {
  // log request
  console.log(`[${new Temporal.PlainTime().toString()}] Incoming ${req.method} request to ${req.url}`);
  next();
});

app.get("/api/items", (req, res) => {
  // return all items
  const games = readGames();
  res.send(games);
});

app.get("/api/items/:id", (req, res) => {
  // return the item with the game name
  const games = readGames();
  for (game of games) {
    if (game.id == id) {
      res.send(id);
      return
    }
  }
  throw new Error(`Failed to find game with id ${id}`);
});

app.post("/api/items", (req, res) => {
  // add an item
  // make sure the data is valid first
});

app.delete("/api/items/:id", (req, res) => {
  // delete an item
  const games = readGames();
  for (game of games) {
    if (game.id == id) {
      deleteGame(id);
      return
    }
  }
  throw new Error(`Failed to find game with id ${id}`);
});

// error handling
app.use((err, req, res, next) => {
  // handle errors
  switch (err.text) {
    case "":
      console.log(`An unhandled exception has occured of type ${err}`);
      res.status(500).send({ error: "An unhandled exception has occured!" });
      break;
    default:
      console.log(err.text);
      res.status(400).send({ error: `${err.text}`})
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


// util functions //

function readGames() {
  return fs.readFileSync("data.json");
}

function writeGame(game) {
  const gamesFile = readGames();
  let gamesList = JSON.parse(gamesFile);
  gamesList.append(game);
  fs.writeFileSync("data.json", gamesFile);
}

function deleteGame(game) {
  const gamesFile = readGames();
  let gamesList = JSON.parse(gamesFile);
  gamesList = gamesList.filter(g => game !== g);
  fs.writeFileSync("data.json", gamesFile);
}
