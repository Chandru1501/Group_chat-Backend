const Sequelize = require('sequelize');
const Users = require('../model/user');
const Messages = require('../model/messages');

exports.SendMessage = async (req,res,next)=>{
    try{
    console.log("from controlller");
    console.log(req.user);
    console.log(req.message);
    const reqUserId = req.user.Id;
    const reqUserMessage = req.message;
   
    let user = await Users.findAll({where : { Id : reqUserId }});
    console.log(user);
    let send = await user[0].createMessage({
        Message : reqUserMessage
    })
    res.status(200).json({'message' : 'message sent'})
 }
 catch(err){
    console.log(err);
    res.status(400).json({'message' : 'something went wrong'})
 }
}

exports.getMessages = async (req,res,next)=>{
  console.log(req.user);
  let Allmessages = await Messages.findAll({
    include : [ {
        model : Users,
        attributes: [
            [Sequelize.literal('user.Username'), 'Username']
          ],
          as: 'user'
  }],
  attributes: ['Id', 'Message', 'createdAt', 'userId'],
//   raw : true
  })
  console.log(Allmessages)
  res.status(202).json( { 'Usermessages' : Allmessages } )
}