const sequelize = require('../utills/database');
const Sequelize = require('sequelize');


const password = sequelize.define('forgotpassword',{
    id : {
        type : Sequelize.STRING,
        allowNull : false,
        primaryKey : true
    },
    isActive : {
        type : Sequelize.BOOLEAN
    }
})


module.exports = password;