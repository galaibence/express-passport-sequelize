const axios = require('axios');
const jsend = require('jsend')({"strict": true});

const Pool = require('pg').Pool;
const pool = new Pool({
  'user': 'prjkt',
  'host': 'localhost',
  'database': 'ebook',
  'password': 'password',
  'port': 5432
});

beforeAll(async () => {
  await pool.query("DROP TABLE IF EXISTS users");
  await pool.query("DROP TABLE IF EXISTS books");
  await pool.query("DROP TABLE IF EXISTS institutions");
  
  await pool.query(
    `
    CREATE TABLE institutions (
      ID SERIAL PRIMARY KEY,
      name varchar(64) UNIQUE,
      url varchar(64),
      email_domain varchar(64) UNIQUE
    )
    `);
  await pool.query(
`
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name varchar(64),
  email varchar(64) UNIQUE,
  role user_role,
  password varchar(64),
  institution_id INTEGER REFERENCES institutions (id)
)
`); //CONSTRAINT fk_users_institutions FOREIGN KEY (institution_id) REFERENCE institutions (id)
  await pool.query(
`
CREATE TABLE books (
  ID SERIAL PRIMARY KEY,
  isbn varchar(16) UNIQUE,
  title varchar(64),
  author varchar(64),
  institution_id INTEGER REFERENCES institutions (id)
)
`);// CONSTRAINT fk_users_books FOREIGN KEY (institution_id) REFERENCE institutions (id)

  await pool.query("INSERT INTO institutions (name, url, email_domain) VALUES ('MTA', 'mta.hu', 'mta')");
  await pool.query("INSERT INTO institutions (name, url, email_domain) VALUES ('BME', 'bme.hu', 'bme')");

  await pool.query("INSERT INTO users (name, email, role, password, institution_id) VALUES ('bence', 'bence@mta.hu', 'student', $1, 1)", 
        [require('crypto').createHmac('sha256', 'secret1').update('mypassword').digest().toString()]);
  
  await pool.query("INSERT INTO books (isbn, title, author, institution_id) VALUES ('0-1234-123345-12', 'A Title', 'Author 1', 1)");
  await pool.query("INSERT INTO books (isbn, title, author, institution_id) VALUES ('0-1234-123345-13', 'A Title II', 'Author 1', 1)");

  require('../../index');
});

test("Signing in with a valid domain return 200", async () => {
  const result = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/signin",
    "data": {
      "email": "bence@mta.hu",
      "password": "mypassword"
    }
  });

  expect(result.data).toEqual({ "status": "success", "data": null });
  expect(jsend.isValid(result.data)).toBe(true);
});

test("Signing in fails with invalid email", async () => {
  const result = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/signin",
    "data": {
      "email": "benceeee@notadomain.blah",
      "password": "mypassword"
    }
  });

  expect(result.data).toEqual({ "status": "error", "message": "Invalid email / password provided.", "code": 403 });
  expect(jsend.isValid(result.data)).toBe(true);
});

test("Signing in fails with invalid invalid password", async () => {
  const result = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/signin",
    "data": {
      "email": "bence@mta.hu",
      "password": "pwd"
    }
  });

  expect(result.data).toEqual({ "status": "error", "message": "Invalid email / password provided.", "code": 403 });
  expect(jsend.isValid(result.data)).toBe(true);
});

test("/books returns items if users is authenticated", async () => {
  const signInresult = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/signin",
    "data": {
      "email": "bence@mta.hu",
      "password": "mypassword"
    }
  });

  const result = await axios({
    "method": "GET",
    "url": "http://localhost:3000/books",
    "headers": { "Cookie": signInresult.headers["set-cookie"][0] },
    "withCredentials": true
  });

  expect(result.data.data).toContainEqual({"id": 1, "isbn": '0-1234-123345-12', "title": "A Title", "author": "Author 1", "institution_id": 1});
  expect(result.data.data).toContainEqual({"id": 2, "isbn": '0-1234-123345-13', "title": "A Title II", "author": "Author 1", "institution_id": 1});
  expect(jsend.isValid(result.data)).toBe(true);
});

test("/books returns error if not authenticated", async () => {
  const result = await axios({
    "method": "GET",
    "url": "http://localhost:3000/books",
  });

  expect(result.data).toEqual({ "status": "error", "message": "Please log in first!", "code": 403 });
  expect(jsend.isValid(result.data)).toBe(true);
});

test("/users/create inserts user into table on valid domain", async () => {
  const result = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/create",
    "data": {
      "name": "bence",
      "email": "bence2@mta.hu",
      "password": "mypassword",
      "role": "student",
    }
  });

  expect(result.data.status).toEqual('success');
  expect(result.data.data.email).toEqual('bence2@mta.hu');
  expect(result.data.data.institution_id).toBe(1);
  expect(jsend.isValid(result.data)).toBe(true);
});

test("/users/create fails on invalid domain name", async () => {
  const result = await axios({
    "method": "POST",
    "url": "http://localhost:3000/users/create",
    "data": {
      "name": "bence",
      "email": "bence2@notvalid.hu",
      "password": "mypassword",
      "role": "student",
    }
  });

  expect(result.data).toEqual({ 'status': 'fail' , 'data': {'email': 'Email domain does not belong to any institutions'} });
  expect(jsend.isValid(result.data)).toBe(true);
});