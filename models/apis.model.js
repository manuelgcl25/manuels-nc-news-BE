const db = require("../db/connection");
const { sort } = require("../db/data/test-data/articles");

async function selectTopics() {
  const { rows } = await db.query(`SELECT * FROM topics`);
  return rows;
}

async function selectArticleById(articleId) {
  const { rows } = await db.query(
    `SELECT articles.author, 
        articles.title, 
        articles.body,
        articles.article_id, 
        articles.topic, 
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.comment_id)::INT AS comment_count 
        FROM articles
        LEFT JOIN
        comments ON articles.article_id = comments.article_id 
        WHERE articles.article_id = $1 GROUP BY 
        articles.article_id`,
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

async function selectArticles(
  sortBy = "created_at",
  order = "desc",
  topic = null
) {
  const allowedSorts = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
  ];
  const allowedOrder = ["asc", "desc"];
  if (
    !allowedSorts.includes(sortBy) ||
    !allowedOrder.includes(order.toLowerCase())
  ) {
    return Promise.reject({ status: 400, msg: "Invalid sorting field" });
  }

  let queryString = `SELECT articles.author, 
    articles.title, 
    articles.article_id, 
    articles.topic, 
    articles.created_at, 
    articles.votes, 
    articles.article_img_url, 
    COUNT(comments.comment_id)::INT AS comment_count 
    FROM articles
    JOIN
    comments ON articles.article_id = comments.article_id`;

  const queryParams = [];

  if (topic) {
    queryParams.push(topic);
    queryString += ` WHERE articles.topic = $1`;
  }

  queryString += ` GROUP BY 
    articles.article_id
    ORDER BY ${sortBy} ${order};`;

  const { rows } = await db.query(queryString, queryParams);
  if (rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "No articles found for those filters",
    });
  }
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

async function selectUsers() {
  const { rows } = await db.query(`SELECT * FROM users;`);
  if (!rows.length) {
    return Promise.reject({
      status: 404,
      msg: `No users found`,
    });
  }
  return rows;
}

module.exports = {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectArticleComments,
  insertArticleComment,
  updateArticleById,
  removeCommentById,
  selectUsers,
};
