const Sequelize = require('sequelize');
const messages = require('../model/messages');
const Groupusers = require('../model/groupusers');
const Op = Sequelize.Op;

exports.SendMessage = async (userDetails,userMessage)=>{
  try{
  console.log("from controlller");
  console.log(userDetails);
  console.log(userMessage);
  const reqUserId = userDetails.Id;
  const groupId = userMessage.GroupId;
  const message = userMessage.Message;
  
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
     if(response){
       return {"message" : 'message sent',"res" : response } ;
     }
  }
   else{
     return 'You are not member of this group to message!. Please ask admin to add you!'
   }

}
catch(err){
  console.log(err);
  return 'something went wrong';
}
}
