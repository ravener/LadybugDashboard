const Router = require("express-promise-router");
const { extname } = require("path");

const router = new Router();

router.get("/", (req, res) => {
  return res.render("pastebin.ejs");
});

router.get("/:id", async(req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).render("error.ejs", {
    message: "ID must be provided"
  });
  const ext = extname(id).slice(1);
  let name = id;
  if(ext) name = name.substring(0, name.length - ext.length - 1);
  const db = req.app.db;
  const data = await db.collection("pastebin").findOne({ id: name });
  if(!data) return res.status(404).render("error.ejs", {
    message: "Could not find the specified pastebin"
  });
  return res.render("paste.ejs", { content: data.content, lang: ext || "js" });
});

router.post("/", async(req, res) => {
  if(!req.body.password || req.body.password !== req.app.config.pastebin) return res.status(401).render("error.ejs", {
    message: "You are not allowed to do this (Invalid Password)"
  });
  const { content } = req.body;
  if(!content || typeof content !== "string") return res.status(400).render("error.ejs", {
    message: "Missing content or is not a string"
  });
  const id = Date.now().toString(36);
  const db = req.app.db;
  await db.collection("pastebin").insertOne({ id, content: content.trim() });
  return res.redirect(`/pastebin/${id}`);
});

router.post("/json", async(req, res) => {
  const auth = req.get("Authorization");
  if(!auth || auth !== req.app.config.pastebin) return res.status(401).json({ message: "Unauthorized" });
  const { content } = req.body;
  if(!content || typeof content !== "string") return res.status(400).json({ message: "Content missing or not a string" });
  const id = Date.now().toString(36);
  const db = req.app.db;
  await db.collection("pastebin").insertOne({ id, content: content.trim() });
  return res.json({ id, url: `https://itsladybug.ml/pastebin/${id}` });
});

module.exports = router;
