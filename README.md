A hosted version of this project can be found here: https://manuels-nc-news.onrender.com/api

# Summary

This project is a simple resftul API which uses Node.js, PostgreSQL and both Supabase and Render for hosting.
It also makes use of a GitHub actions to continuously integrate any commits as long as tests are still passing.

# Usage

Cloning this repo:

    git clone https://github.com/manuelgcl25/manuels-nc-news-BE.git

After this, ensure that you install all required dependencies with:
cd manuels-nc-news-BE
npm install

To work with the database, you will need to first create two .env files, namely .env.development and .env.test in the root directory.
Now, inside .env.development add the line:

    PGDATABASE=nc_news

and inside .env.test add:

    PGDATABASE=nc_news_test

To seed the database, you will need to run the following scripts which exist in the package-json:

    npm run setup-dbs
    npm run seed-dev
    npm run test-seed

Running tests:

To run all tests on the project, simply run

    npm t

If you wish to only run tests in a particular test file, add its file path to the end of the command above.

# Dependencies

This app requies both Node.js (v23.7.0) and PostgreSQL (16.8) to be installed.
