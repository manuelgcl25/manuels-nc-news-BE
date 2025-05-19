const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");
const {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectArticleComments,
  insertArticleComment,
  updateArticleById,
  removeCommentById,
  selectUsers,
} = require("../models/apis.model");

async function getApis(req, res, next) {
  try {
    const endpoints = endpointsJson;
    res.status(200).send({ endpoints });
  } catch (err) {
    next(err);
  }
}

async function getTopics(req, res, next) {
  try {
    const topics = await selectTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
}

async function getArticleById(req, res, next) {
  try {
    const { article_id } = req.params;
    const articles = await selectArticleById(article_id);
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
}

async function getArticles(req, res, next) {
  try {
    const articles = await selectArticles();
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
}

async function getArticleComments(req, res, next) {
  try {
    const { article_id } = req.params;
    const articleComments = await selectArticleComments(article_id);
    res.status(200).send({ articleComments });
  } catch (err) {
    next(err);
  }
}

async function postArticleComment(req, res, next) {
  try {
    const { article_id } = req.params;
    const { username, body } = req.body;
    if (body.length === 0) {
      return res.status(400).json({ msg: "Comment body empty" });
    }
    const articleComment = await insertArticleComment(
      username,
      body,
      article_id
    );
    res.status(201).send({ articleComment });
  } catch (err) {
    next(err);
  }
}

async function patchArticleById(req, res, next) {
  try {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    if (!inc_votes || typeof inc_votes !== "number") {
      return res.status(400).send({ msg: "Invalid votes format" });
    }

    const article = await updateArticleById(inc_votes, article_id);

    if (!article) {
      return res.status(404).send({ msg: "Article not found" });
    }

    res.status(200).send({ article });
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
}

async function deleteCommentById(req, res, next) {
  try {
    const { comment_id } = req.params;
    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await selectUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getApis,
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleById,
  deleteCommentById,
  getUsers,
};
