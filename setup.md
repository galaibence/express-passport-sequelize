# PostgreSQL
1. install on ubuntu 18.04 via ```sudo apt-get install postgres postgres-client```
2. create role and database
3. create enum ```user_role```
```sql
CREATE TYPE user_role AS ENUM ('student', 'academic', 'administrator');
```
4. create table ```institutions```
```sql
CREATE TABLE institutions (
    ID SERIAL PRIMARY KEY,
    name varchar(64) UNIQUE,
    url varchar(64),
    email_domain varchar(64) UNIQUE
);
```
5. create table ```users```
```sql
CREATE TABLE users (
    ID SERIAL PRIMARY KEY,
    name varchar(64),
    email varchar(64) UNIQUE,
    role user_role,
    password varchar(64),
    institution_id INTEGER REFERENCES institutions (id)
)
```
6. create table ```books```
```sql
CREATE TABLE books (
    ID SERIAL PRIMARY KEY,
    isbn varchar(16) UNIQUE,
    title varchar(64),
    author varchar(64),
    institution_id INTEGER REFERENCES institutions (id)
);
```
