require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const UserRoutes = require('./routes/user');
const MessageRoutes = require('./routes/messages');
const sequelize = require('./utills/database');
const users = require('./model/user');
const messages = require('./model/messages');

app.use(bodyParser.json());
app.use(cors({
    origin : "http://127.0.0.1:5500"
})
);


app.use('/user',UserRoutes);
app.use('/messages',MessageRoutes);

users.hasMany(messages);
messages.belongsTo(users);


// sequelize.sync({force : true})
sequelize.sync()
.then((response)=>{
    // console.log(response);
    app.listen(8000);
})
.catch(err=>console.log(err));