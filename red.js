const express = require("express");
const app = express();

app.get("/", (req, res) => {
  return res.redirect("/lmao");
});

app.get("/lmao", (req, res) => {
  return res.send("foo bar");
});

app.listen(3000, () => {
  console.log("Spam redirect requests on port 3000");
});
