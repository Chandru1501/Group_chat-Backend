const Sequelize =require('sequelize');
const sequelize = require('../utills/database');

const groups = sequelize.define('groups',{

    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true
    },
    GroupName : {
        type : Sequelize.STRING,
        allowNull : false
    },
    createdBy : {
        type : Sequelize.STRING,
        allowNull : false
    }
}) 

module.exports = groups;