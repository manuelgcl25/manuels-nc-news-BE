const db = require("../db/connection");

async function selectTopics() {
  const { rows } = await db.query(`SELECT * FROM topics`);
  return rows;
}

async function selectArticleById(articleId) {
  const { rows } = await db.query(
    `SELECT
        * FROM articles WHERE article_id = $1`,
    [articleId]
  );
  if (rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: `article_id ${articleId} not found`,
    });
  }
  return rows;
}

module.exports = { selectTopics, selectArticleById };
