const Sequelize = require('sequelize');

module.exports.createInstitution = (sequelize) => {
  const Institution = sequelize.define('institutions', {
    "id": {
      "type": Sequelize.INTEGER, 
      "primaryKey": true, 
      "autoIncrement": true
    },  
    "name": {
      "type": Sequelize.STRING(64),
      "unique": true
    },
    "url": {
      "type": Sequelize.STRING(64)
    },
    "email_domain": {
      "type": Sequelize.STRING(64),
      "unique": true
    }
  }, {
    "timestamps": false
  });
  
  return Institution;
};