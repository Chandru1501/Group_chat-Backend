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
const path = require('path');
const http = require('http');
const authendication = require('./middleware/authendication');
const messageController = require('./controllers/messages');

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', async (socket) => {
  console.log('a user connected');
  console.log (socket.id);

  socket.on('send-message',async (msg,auth,groupname) => {
  let user = await authendication.AuthendicateIO(auth);
  console.log(user);
  console.log(groupname);
  console.log(msg);

  let response = await messageController.SendMessage(user,msg);
  if(response){
    io.to(socket.id).emit("response-to-user",response.message);
    io.to(groupname).emit("receive-message",response.message);
  }

  });
   
  socket.on('group-opened',(groupname)=>{
     console.log(groupname);
      socket.join(groupname);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(cors({
    origin : ["http://localhost:8000"]
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


app.use('/',(req,res)=>{
  console.log(req.url);
  //  res.setHeader('Content-Security-Policy', "script-src 'self' https://react.dev");
  res.sendFile(path.join(__dirname,`public/Group_Chat Frontend${req.url}`));
})



// sequelize.sync({force : true})
sequelize.sync()
.then((response)=>{
    server.listen(8000);
})
.catch(err=>console.log(err));