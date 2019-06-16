const Sequelize = require('sequelize');

const sequelize = new Sequelize('ebook', 'prjkt', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

const Institution = require('./institution').createInstitution(sequelize);
const User = require('./user').createUser(sequelize, Institution);
const Book = require('./book').createBook(sequelize, Institution);

module.exports = {
  User,
  Book,
  Institution
}