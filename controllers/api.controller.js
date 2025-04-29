const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");

async function getApis(req, res, next) {
  try {
    const endpoints = endpointsJson;
    console.log(endpoints);
    res.status(200).send({ endpoints });
  } catch (err) {
    next(err);
  }
}

module.exports = { getApis };
