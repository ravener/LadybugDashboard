const Router = require("express-promise-router");

const router = new Router();

router.get("/", (req, res) => {
  return res.render("pastebin.ejs");
});

router.get("/:id", async(req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).render("error.ejs", {
    message: "ID must be provided"
  });
  const { rows } = await req.app.db.query("SELECT content FROM pastebin WHERE id = $1", [id]);
  if(!rows.length) return res.status(404).render("error.ejs", {
    message: "Could not find the specified pastebin"
  });
  return res.render("paste.ejs", { content: rows[0].content });
});

router.post("/", async(req, res) => {
  if(!req.body.password || req.body.password !== req.app.config.pastebin) return res.status(401).render("error.ejs", {
    message: "You are not allowed to do this (Invalid Password)"
  });
  if(!req.body.content) return res.status(400).render("error.ejs", {
    message: "Missing content"
  });
  const id = Date.now().toString(36);
  await req.app.db.query("INSERT INTO pastebin (id, content) VALUES ($1, $2)", [
    id, req.body.content.trim()
  ]);
  return res.redirect(`/pastebin/${id}`);
});

router.post("/json", async(req, res) => {
  const auth = req.get("Authorization");
  if(!auth || auth !== req.app.config.pastebin) return res.status(401).json({ message: "Unauthorized" });
  const { content } = req.body;
  if(!content) return res.status(400).json({ message: "Content Missing" });
  const id = Date.now().toString(36);
  await req.app.db.query("INSERT INTO pastebin (id, content) VALUES ($1, $2)", [
    id, content.trim()
  ]);
  return res.json({ id, url: `https://itsladybug.ml/pastebin/${id}` });
});

module.exports = router;
