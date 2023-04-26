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
 }
 catch(err){
    console.log(err);
    res.status(400).json({'message' : 'something went wrong'})
 }
}