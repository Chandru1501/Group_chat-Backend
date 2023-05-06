const Sequelize = require('sequelize');
const messages = require('../model/messages');
const Groupusers = require('../model/groupusers');
const Op = Sequelize.Op;

exports.SendMessage = async (req,res,next)=>{
    try{
    console.log("from controlller");
    console.log(req.user);
    console.log(req.body);
    const reqUserId = req.user.Id;
    const groupId = req.body.GroupId;
    const message = req.body.Message;
    
    let user = await Groupusers.findOne({where : {
      userId : reqUserId,
      groupId : groupId
    }})

    if(user){
       let response = await messages.create({
        Message : message,
        userId : reqUserId,
        groupId : groupId 
       })
       console.log(response);
       
        res.status(200).json({'message' : 'message sent'})
    }
    else{
      res.status(401).json({'message' : 'You are not member of this group to message!. Please ask admin to add you!'})
    }

 }
 catch(err){
    console.log(err);
    res.status(400).json({'message' : 'something went wrong'})
 }
}
