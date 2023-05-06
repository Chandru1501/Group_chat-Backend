const Sequelize = require('sequelize');
const sequelize = require('../utills/database');

const Groupusers = sequelize.define('groupusers',{
   isAdmin : {
    type : Sequelize.BOOLEAN,
    allowNull : false,
    defaultValue : false
   }
})


module.exports = Groupusers;