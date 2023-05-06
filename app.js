require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const UserRoutes = require('./routes/user');
const MessageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/group');
const sequelize = require('./utills/database');
const users = require('./model/user');
const messages = require('./model/messages');
const group = require('./model/group');
const GroupUsers = require('./model/groupusers');

app.use(bodyParser.json());
app.use(cors({
    // origin : "http://127.0.0.1:5500"
})
);


app.use('/user',UserRoutes);
app.use('/messages',MessageRoutes);
app.use('/group',groupRoutes);


group.belongsToMany(users, {
    through: GroupUsers,
    foreignKey: 'groupId'
  });
  users.belongsToMany(group, {
    through: GroupUsers,
    foreignKey: 'userId'
  });

GroupUsers.belongsTo(group);
GroupUsers.belongsTo(users);

messages.belongsTo(group);
messages.belongsTo(users);
group.hasMany(messages);

// sequelize.sync({force : true})
sequelize.sync()
.then((response)=>{
    // console.log(response);
    app.listen(8000);
})
.catch(err=>console.log(err));