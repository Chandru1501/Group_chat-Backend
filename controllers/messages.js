const Sequelize = require('sequelize');
const Users = require('../model/user');
const Messages = require('../model/messages');
const Op = Sequelize.Op;

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
  let lastmessage = req.params.lastmessage;
  lastmessage = Number(lastmessage.substring(1,lastmessage.length))

  console.log("my last message ID ",lastmessage);
  console.log(req.user);
  const Allmessages = await Messages.findAll({
    where: {
      id: {
        [Op.gt]: lastmessage
      }
    },
    include: [
      {
        model: Users,
        attributes: [['Username', 'Username']],
        as: 'user'
      }
    ],
    attributes: ['id', 'Message', 'createdAt', 'userId']
  });
  
  // console.log(Allmessages);
  res.status(202).json( { 'Usermessages' : Allmessages } )
}