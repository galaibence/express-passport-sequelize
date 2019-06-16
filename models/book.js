const Sequelize = require('sequelize');

module.exports.createBook = (sequelize, Institution) => {
  const Book = sequelize.define('books', {
    "id": {
      "type": Sequelize.INTEGER, 
      "primaryKey": true, 
      "autoIncrement": true
    },  
    "isbn": {
      "type": Sequelize.STRING(16),
      "unique": true
    },
    "title": {
      "type": Sequelize.STRING(64)
    },
    "author": {
      "type": Sequelize.STRING(64)
    },
    "institution_id": {
      "type": Sequelize.INTEGER,
      "references": {
        "model": Institution,
        "key": "id"
      }
    }
  }, {
    "timestamps": false
  });

  return Book;
}