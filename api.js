const express = require("express");
const app = express();
const {
  getApis,
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleById,
  deleteCommentById,
  getUsers,
} = require("./controllers/api.controller");

app.use(express.json());

app.get("/api", getApis);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postArticleComment);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete("/api/comments/:comment_id", deleteCommentById);

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
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "User or article not found" });
  }
});

module.exports = app;
