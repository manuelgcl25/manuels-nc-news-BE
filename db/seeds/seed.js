const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    .then(() => {
      return db.query(`CREATE TABLE topics (
        slug VARCHAR(50) PRIMARY KEY,
        description VARCHAR(200),
        img_url VARCHAR(1000)
        )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE users (
        username VARCHAR(100) PRIMARY KEY UNIQUE,
        name VARCHAR(200),
        avatar_url VARCHAR(1000)
        )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR(200),
        topic VARCHAR(50) REFERENCES topics(slug),
        author VARCHAR(100) REFERENCES users(username),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR(1000)
        )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id),
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(500) REFERENCES users(username),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    })
    .then(() => {
      // make topicData object into array
      // of arrays (each object will become a nested array)

      const formattedTopicsData = topicData.map((topic) => {
        return [topic.slug, topic.description, topic.img_url];
      });

      const insertTopicsQuery = format(
        `INSERT INTO topics(slug, description, img_url) 
        VALUES %L
        RETURNING*;`,
        formattedTopicsData
      );
      return db.query(insertTopicsQuery);
    })
    .then(() => {
      // make userData object into array
      // of arrays (each object will become a nested array)

      const formattedUsersData = userData.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });

      const insertUsersQuery = format(
        `INSERT INTO users(username, name, avatar_url) 
        VALUES %L
        RETURNING*;`,
        formattedUsersData
      );
      return db.query(insertUsersQuery);
    })
    .then(() => {
      // make articleData object into array
      // of arrays (each object will become a nested array)

      const formattedArticlesData = articleData.map((article) => {
        const convertedArticle = convertTimestampToDate(article);
        return [
          convertedArticle.title,
          convertedArticle.topic,
          convertedArticle.author,
          convertedArticle.body,
          convertedArticle.created_at,
          convertedArticle.votes,
          convertedArticle.article_img_url,
        ];
      });
      const insertArticlesQuery = format(
        `INSERT INTO articles(title, topic, author, body, created_at, votes, article_img_url) 
        VALUES %L
        RETURNING*;`,
        formattedArticlesData
      );
      return db.query(insertArticlesQuery);
    })
    .then(() => {
      return db.query(`SELECT article_id, title FROM articles;`);
    })
    .then((articles) => {
      // make commentsData object into array
      // of arrays (each object will become a nested array)
      const articleLookUp = {};
      articles.rows.forEach((article) => {
        articleLookUp[article.title] = article.article_id;
      });
      const formattedCommentsData = commentData.map((comment) => {
        const convertedComment = convertTimestampToDate(comment);
        return [
          articleLookUp[convertedComment.article_title],
          convertedComment.body,
          convertedComment.votes,
          convertedComment.author,
          convertedComment.created_at,
        ];
      });
      const insertCommentsQuery = format(
        `INSERT INTO comments(article_id, body, votes, author, created_at) 
        VALUES %L
        RETURNING*;`,
        formattedCommentsData
      );
      return db.query(insertCommentsQuery);
    });
};
module.exports = seed;
