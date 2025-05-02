const express = require("express");
const app = express();
const { getApis, getTopics } = require("./controllers/api.controller");

app.get("/api", getApis);

app.get("/api/topics", getTopics);

app.all("/*splat", (req, res, next) => {
  next({ status: 404, msg: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
