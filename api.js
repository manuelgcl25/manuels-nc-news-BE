const express = require("express");
const app = express();
const {
  getApis,
  getTopics,
  getArticleById,
  getArticles,
} = require("./controllers/api.controller");

app.get("/api", getApis);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.all("/*splat", (req, res, next) => {
  next({ status: 404, msg: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
});

module.exports = app;
