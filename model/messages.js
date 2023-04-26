const Sequelize = require('sequelize');

const sequelize = require('../utills/database');

const messages = sequelize.define('messages',{
    Id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true
    },
    Message : {
        type : Sequelize.STRING,
        allowNull : false
    }
})

module.exports = messages;