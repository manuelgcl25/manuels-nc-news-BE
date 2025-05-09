const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");
const {
  selectTopics,
  selectArticleById,
  selectArticles,
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

module.exports = { getApis, getTopics, getArticleById, getArticles };
