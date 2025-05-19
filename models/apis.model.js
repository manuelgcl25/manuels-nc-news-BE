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

async function insertArticleComment(username, body, articleId) {
  const { rows } = await db.query(
    `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
    [username, body, articleId]
  );
  return rows[0];
}

async function updateArticleById(voteIncrement, articleId) {
  const { rows } = await db.query(
    `
    UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *
    `,
    [voteIncrement, articleId]
  );
  return rows[0];
}

async function removeCommentById(commentId) {
  const { rows } = await db.query(
    `
    DELETE FROM
    comments
    WHERE
    comment_id = $1
    RETURNING *
    `,
    [commentId]
  );
  if (!rows.length) {
    return Promise.reject({
      status: 404,
      msg: `No comment found under comment id: ${commentId}`,
    });
  }
  return rows[0];
}

module.exports = {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectArticleComments,
  insertArticleComment,
  updateArticleById,
  removeCommentById,
};
