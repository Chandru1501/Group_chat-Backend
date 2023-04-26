const Sequelize = require('sequelize');

const sequelize = require('../utills/database');

const user = sequelize.define('users',{

    Id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    Username : {
        type : Sequelize.STRING,
        allowNull : false
    },
    Email : {
        type : Sequelize.STRING,
        allowNull : false,
        primaryKey : true
    },
    Phone : {
        type : Sequelize.STRING,
        allowNull : false
    },
    Password : {
        type : Sequelize.STRING,
        allowNull : false
    }
})

module.exports = user;