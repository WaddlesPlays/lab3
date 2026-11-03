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
  console.log(`[${Temporal.Now.plainTimeISO()}] Incoming ${req.method} request to ${req.url}`);
  next();
});

app.get("/api/games", (req, res) => {
  const games = readGames();
  res.send(games);
});

app.get("/api/games/:id", (req, res) => {
  const games = readGames();
  for (game of games) {
    if (game.id == req.params.id) {
      res.send(game);
      return
    }
  }
  throw new Error("failedToFindGame");
});

app.post("/api/games", (req, res) => {
  // ensure required fields are present
  if (
    !req.body.hasOwnProperty("name") ||
    !req.body.hasOwnProperty("platforms")
  ) {
    throw new Error("gameReqFieldMissing");
  }

  // check for type mismatching
  if (
    typeof req.body.name !== "string" || // whyyy does typeof return a string this lang sucks
    typeof req.body.platforms !== "object" ||
    (req.body.hasOwnProperty("id") && typeof req.body.id !== "number") ||
    (req.body.hasOwnProperty("completion") && typeof req.body.completion !== "string") ||
    (req.body.hasOwnProperty("score") && typeof req.body.score !== "number")
  ) {
    throw new Error("gameFieldTypeMismatch");
  }

  // check for dupe IDs
  const checkID = readGames().filter((game) => game.id == req.body.id);
  if (checkID.length > 0) throw new Error("gameDupeID");

  const games = readGames();
  let newGame = {
    id: req.body.id || games[games.length].id + 1, // DELETE will leave gaps!
    name: req.body.name,
    platforms: req.body.platforms,
    completion: req.body.completion || "Wishlist",
    score: req.body.score || 0
  };

  writeGame(newGame);
  res.send({ message: "Game successfully added" });
});

app.delete("/api/games/:id", (req, res) => {
  const games = readGames();
  for (game of games) {
    if (game.id == req.params.id) {
      deleteGame(req.params.id);
      res.send({ message: "Game with id " + req.params.id + " successfully removed." });
      return
    }
  }
  throw new Error("failedToFindGame");
});

// error handling
app.use((err, req, res, next) => {
  // handle errors
  switch (err.message) {
    case "failedToFindGame": {
      const msg = `Game with the requested ID couldn't be found!`;
      console.error(msg);
      res.status(400).send({ error: msg });
    } break;
    case "gameReqFieldMissing": {
      const msg = `Request missing one of the following properties: name, platforms`;
      console.error(msg);
      res.status(400).send({ error: msg });
    } break;
    case "gameFieldTypeMismatch": {
      const msg = `Request contains type errors`;
      console.error(msg + `\n${req.body}`);
      res.status(400).send({ error: msg });
    } break;
    case "gameDupeID": {
      const msg = `Request provides an ID that already exists! To edit an entry, you must delete it first!`;
      console.error(msg);
      res.status(400).send({ error: msg });
    } break;
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
  return JSON.parse(fs.readFileSync("data.json"));
}

function writeGame(game) {
  let gamesList = readGames();
  gamesList.push(game);
  fs.writeFileSync("data.json", JSON.stringify(gamesList));
}

function deleteGame(id) {
  const gamesList = readGames();
  const newList = gamesList.filter(g => g.id != id);
  fs.writeFileSync("data.json", JSON.stringify(newList));
}
