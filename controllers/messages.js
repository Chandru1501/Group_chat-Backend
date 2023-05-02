const Sequelize = require('sequelize');
const Users = require('../model/user');
const Messages = require('../model/messages');
const groups = require('../model/group'); 
const messages = require('../model/messages');
const Op = Sequelize.Op;

exports.SendMessage = async (req,res,next)=>{
    try{
    console.log("from controlller");
    console.log(req.user);
    console.log(req.body);
    const reqUserId = req.user.Id;
    const groupId = req.body.GroupId;
    const message = req.body.Message;
    
   let response = await messages.create({
    Message : message,
    userId : reqUserId,
    groupId : groupId 
   })
   console.log(response);
   
    res.status(200).json({'message' : 'message sent'})
 }
 catch(err){
    console.log(err);
    res.status(400).json({'message' : 'something went wrong'})
 }
}