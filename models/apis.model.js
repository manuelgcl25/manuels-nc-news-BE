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

async function selectArticles() {
  const { rows } = await db.query(`
    SELECT articles.author, 
    articles.title, 
    articles.article_id, 
    articles.topic, 
    articles.created_at, 
    articles.votes, 
    articles.article_img_url, 
    COUNT(comments.comment_id)::INT AS comment_count 
    FROM articles
    JOIN
    comments ON articles.article_id = comments.article_id
    GROUP BY 
    articles.article_id
    ORDER BY created_at DESC;
    `);

  return rows;
}

async function selectArticleComments(articleId) {
  const { rows } = await db.query(
    `
    SELECT *  FROM comments WHERE article_id = $1 ORDER BY created_at DESC;
    `,
    [articleId]
  );
  if (rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: `No comments found for article with id ${articleId}`,
    });
  }
  return rows;
}

module.exports = {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectArticleComments,
};
