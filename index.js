const express = require('express');
const fs = require('node:fs');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
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
// I think if this is here it'll only work from here on out? so the above should still work normally
app.use(express.json());

app.use((req, res, next) => {
  // log request
  console.log(`[${new Temporal.PlainTime().toString()}] Incoming ${req.method} request to ${req.url}:\n  ${req.body}`);
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
    if (game.id == req.params.id) {
      res.send(game);
      return
    }
  }
  throw new Error("failedToFindGame");
});

app.post("/api/items", (req, res) => {
  // add an item
  if (
    !req.body.hasOwnProperty("name") ||
    !req.body.hasOwnProperty("platforms")
  ) {
    throw new Error("gameReqFieldMissing");
  }

  if (
    typeof req.body.name !== String ||
    typeof req.body.platforms !== String ||
    (req.body.hasOwnProperty("id") && typeof req.body.id !== Number) ||
    (req.body.hasOwnProperty("completion") && typeof req.body.completion !== String) ||
    (req.body.hasOwnProperty("score") && typeof req.body.score !== Number)
  ) {
    throw new Error("gameFieldTypeMismatch");
  }

  let newGame = {
    id: req.body.id || readGames().length, // idk if this works
    name: req.body.name,
    platforms: req.body.platforms,
    completion: req.body.completion || "Wishlist",
    score: req.body.score || 0
  };

  writeGame(newGame);
  res.send({ message: "Game successfully added" });
});

app.delete("/api/items/:id", (req, res) => {
  // delete an item
  const games = readGames();
  for (game of games) {
    if (game.id == req.params.id) {
      deleteGame(req.params.id);
      res.send({ message: "Game with id " + req.body.id + " successfully removed." });
      return
    }
  }
  throw new Error("failedToFindGame");
});

// error handling
app.use((err, req, res, next) => {
  // handle errors
  switch (err.text) {
    case "failedToFindGame":
      const msg = `Game with ID ${req.id} couldn't be found!`;
      console.error(msg);
      res.status(400).send({ error: msg });
      break;
    case "gameReqFieldMissing":
      const msg = `Request missing one of the following properties: name, platforms`;
      console.error(msg);
      res.status(400).send({ error: msg });
      break;
    case "gameFieldTypeMismatch":
      const msg = `Request contains type errors`;
      console.error(msg);
      res.status(400).send({ error: msg });
      break;
    default:
      console.error(`An unhandled exception has occured of type ${err}`);
      res.status(500).send({ error: "An unhandled exception has occured!" });
  }
});

// no update is provided by the API, frontends are to delete the old entry and add a new one with the same id

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
