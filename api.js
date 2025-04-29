const express = require("express");
const app = express();
const { getApis } = require("./controllers/api.controller");

app.get("/api", getApis);

module.exports = app;
