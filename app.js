const express = require("express");
const path = require("path");
const mountRoutes = require("./routes");
const config = require("./config.json");
const session = require("express-session");
// const debug = require("debug")("ladybug:main");
const Database = require("./db");
const logger = require("morgan");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// app.use("/assets", express.static(path.join(__dirname, "assets")));

app.db = new Database(app);
app.db.connect();
app.config = config;

app.use(logger("dev"));

app.use(session({
  saveUninitialized: true,
  resave: false,
  secret: config.session.secret
}));

mountRoutes(app);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use((req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(404).render("404.ejs");
});

app.listen(app.get("port"), () => {
  // eslint-disable-next-line no-console
  console.log("Listening to port %s", app.get("port"));
});

