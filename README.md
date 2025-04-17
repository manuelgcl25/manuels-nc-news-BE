# NC News Seeding

Please to set up the .env files:

1. First create two separate .env files in the root of the project directory: one with the name of .env.development (for your development database) and another with the name of .env.test (for your testing database).

2. In order to connect to each of these databases locally, you will need to populate each with the PGDATABASE environment variable set to the name of the respective database.

For example:

# in the .env.test file
PGDATABASE=test_database_name

# in the .env.development file
PGDATABASE=development_database_name
