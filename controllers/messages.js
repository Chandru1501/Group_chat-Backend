require('dotenv').config();
const Sequelize = require('sequelize');
const messages = require('../model/messages');
const Groupusers = require('../model/groupusers');
const Op = Sequelize.Op;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const AWS = require('aws-sdk');
const multer_S3 = require('multer-s3'); 
const user = require('../model/user');

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

exports.SendFile  = async (req,res,next)=>{
  try{
    let file = await req.result;
    let fileLink  =  file.Location;
    let userId = req.user.Id;
    let groupId = req.headers.groupid;
  
    console.log(file);
    console.log(userId);
    console.log(groupId);

    if(file!='You are not member of this group to send file or message please ask admin to add you !!'){

      let User = await user.findAll({where : {Id : userId}});
    
      if(User){
        let message = await messages.create({
          Message : fileLink,
          groupId : groupId,
          userId : userId
        }); 
        if(message){
          console.log(message);
          let messageId = message.Id
          let messageWithusername = await messages.findAll({ 
            where : {
             groupId : groupId,
             Id : messageId
            }, include: [
             {
               model: user,
               attributes: ['Username'],
             }
           ],
         },
         )
         if(messageWithusername){
          console.log(messageWithusername);
           res.status(200).json({'message' : 'uploaded successfully' , "file" : messageWithusername});
         }
        } 
        else{
          res.status(400).json({'message' : 'some error occured'});
        } 
      }
      else{
        res.status(400).json({'message' : 'user not found'});
      }

    }
    else{
      res.status(400).json({"message" : file});
    }
  

  }
  catch(err){
    console.log(err);
    res.status(400).json({'message' : 'some error occured'});
  }
  
}
