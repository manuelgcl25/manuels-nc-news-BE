const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../api");
const endpointsJson = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects, each of which should have a slug and a description property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });

  test("404: when trying to access a non-existent end point ", () => {
    return request(app)
      .get("/api/topicazo")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object with the right properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0]).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  test("404: when passed a valid article_id but article does not exist", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article_id 1000 not found");
      });
  });

  test("400: when passed an invalid article_id", () => {
    return request(app)
      .get("/api/articles/mountain")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects with the right properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });

  test("200: Responds with the right amount of comments for each article", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].comment_count).toBe(2);
      });
  });

  test("200: Responds with articles sorted by creation date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.articleComments).toHaveLength(11);
        expect(body.articleComments[0]).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });

  test("200: Responds with recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.articleComments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("200: Responds with the right key pair values for a certain article_id", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.articleComments).toEqual([
          {
            comment_id: 15,
            body: "I am 100% sure that we're not completely sure.",
            votes: 1,
            author: "butter_bridge",
            created_at: "2020-11-24T00:08:00.000Z",
            article_id: 5,
          },
          {
            comment_id: 14,
            body: "What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.",
            votes: 16,
            author: "icellusedkars",
            created_at: "2020-06-09T05:00:00.000Z",
            article_id: 5,
          },
        ]);
      });
  });

  test("404: when passed a valid article_id but article does not exist", () => {
    return request(app)
      .get("/api/articles/5000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments found for article with id 5000");
      });
  });

  test("400: when passed an invalid article_id", () => {
    return request(app)
      .get("/api/articles/cat/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with a 201 status and responds with newly posted comment", () => {
    const postObj = {
      username: "rogersop",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(postObj)
      .expect(201)
      .then(({ body }) => {
        expect(body.articleComment).toEqual({
          comment_id: expect.any(Number),
          body: "This is a test comment",
          votes: expect.any(Number),
          author: "rogersop",
          created_at: expect.any(String),
          article_id: 5,
        });
      });
  });
  test("404; Responds 'User or article not found' when article doesn't exisit in the database", () => {
    return request(app)
      .post("/api/articles/100/comments")
      .send({
        username: "butter_bridge",
        body: "what does this mean for bananas?",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User or article not found");
      });
  });
  test("404; Responds 'User or article not found' when user doesn't exisit in the database", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "banana",
        body: "what does this mean for bananas?",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User or article not found");
      });
  });
  test("400; Responds 'Comment body empty' when body is empty", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment body empty");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with an updated article object with the right properties", () => {
    const updateObj = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/5")
      .send(updateObj)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          author: "rogersop",
          title: "UNCOVERED: catspiracy to bring down democracy",
          article_id: 5,
          body: "Bastet walks amongst us, and the cats are taking arms!",
          topic: "cats",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: 5,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("404: Responds with 'Article not found' if article does not exist", () => {
    const updateObj = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/500000")
      .send(updateObj)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("400: Responds with 'Invalid votes format' if vote increment is not a number", () => {
    const updateObj = { inc_votes: "5" };
    return request(app)
      .patch("/api/articles/5")
      .send(updateObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid votes format");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("status 204: does not send a response body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("status 204: responds with deleting the given comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app).get("/api/comments/1").expect(404);
      });
  });
  test("status 404: when passed a valid number but comment does not exist in the db", () => {
    return request(app)
      .delete("/api/comments/87654")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No comment found under comment id: 87654");
      });
  });
  test("status 400: when passed an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("status 200: responds with an object with the key of users and the value of an array of objects that include username, name, avatar_url as properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          users: [
            {
              username: "butter_bridge",
              name: "jonny",
              avatar_url:
                "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
            },
            {
              username: "icellusedkars",
              name: "sam",
              avatar_url:
                "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
            },
            {
              username: "rogersop",
              name: "paul",
              avatar_url:
                "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
            },
            {
              username: "lurker",
              name: "do_nothing",
              avatar_url:
                "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            },
          ],
        });
      });
  });
});

describe("GET /api/articles?sort_by=''&order=''", () => {
  test("status 200: Responds with articles sorted by default column (created_at) and default order (desc)", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].article_id).toBe(3);
        expect(body.articles[body.articles.length - 1].article_id).toBe(9);
      });
  });
  test("status 400: when passed an invalid sort query", () => {
    return request(app)
      .get("/api/articles?sort_by=hello&order=desc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sorting field");
      });
  });
  test("status 400: when passed an invalid order query", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sorting field");
      });
  });
});

describe.only("GET /api/articles?topic=''", () => {
  test("status 200: Responds with a list of articles of the URL topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(1);
        expect(body.articles[0]).toMatchObject({
          author: "rogersop",
          title: "UNCOVERED: catspiracy to bring down democracy",
          article_id: 5,
          topic: "cats",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 2,
        });
      });
  });
  test("status 200: Responds with a list of articles of the URL topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(12);
      });
  });
  test("status 404: when topic does not exist in out db", () => {
    return request(app)
      .get("/api/articles?topic=nonExistingTopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles found for those filters");
      });
  });
});

describe("GET /api/articles/:article_id (comment_count)", () => {
  test("status 200: article response object should also now include total count of all the comments with this article_id", () => {
    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0]).toMatchObject({
          author: "rogersop",
          title: "UNCOVERED: catspiracy to bring down democracy",
          article_id: 5,
          body: "Bastet walks amongst us, and the cats are taking arms!",
          topic: "cats",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 2,
        });
      });
  });
});
