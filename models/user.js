const Sequelize = require('sequelize');

module.exports.createUser = (sequelize, Institution) => {
  const User = sequelize.define('users', {
    "id": {
      "type": Sequelize.INTEGER, 
      "primaryKey": true, 
      "autoIncrement": true
    },  
    "name": {
      "type": Sequelize.STRING(64),
    },
    "email": {
      "type": Sequelize.STRING(64),
      "unique": true
    },
    "role": {
      "type": Sequelize.ENUM('student', 'academic', 'administrator')
    },
    "password": {
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

  return User;
}