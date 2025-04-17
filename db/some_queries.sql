\c nc_news;

-- \c nc_news_test;

SELECT * FROM users;

SELECT * FROM articles WHERE topic = 'coding';

SELECT * FROM comments WHERE votes < 0;

SELECT * FROM topics;

SELECT * FROM articles WHERE author = 'grumpy19';

SELECT * FROM comments WHERE votes > 10;