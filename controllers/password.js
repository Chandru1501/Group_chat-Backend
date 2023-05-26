const forgotpassword = require('../model/forgotpassword');
const user = require('../model/user');
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');
const { Transaction } = require('sequelize');
const password = require('../model/forgotpassword');
const sequelize = require('../utills/database');



exports.ForgotPassword = async (req,res,next)=>{
    try{
        console.log(req.body);
       let User = await user.findOne({where : {Email : req.body.Email}});
       console.log(User);
       const uuid = uuidv4();
       console.log(uuid);
       if(User){
         let mailstatus = await SendEmail(req.body.Email,uuid);
         console.log(mailstatus);
         if(mailstatus){
            let status = await forgotpassword.create({
                id : uuid,
                isActive : true,
                userId : User.Id
            })
            console.log(status);
            res.status(400).json({'message' : 'Reset link sent to your Mail'});
         }
         else{
            res.status(400).json({'message' : 'some error occured'});
         }
       }
       else{
        res.status(404).json({'message' : 'user not found'});
       }
    }
    catch(err){
        console.log(err);
    }
}

async function SendEmail(Email,uuid) {
    try {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SEND_IN_BLUE_API;
    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email : "chandraprakash001dpm@gmail.com",
      name : "Chandraprakash",
    }
    const receivers = [
      {
          email : Email
      },
    ]
  
   let response = await tranEmailApi.sendTransacEmail({
      sender,
      to : receivers,
      subject : "reset password",
      htmlcontent : `<h3>click this link to reset your password<h3><br><a href="http://localhost:8000/password/resetpassword/${uuid}">Reset_Password</a>`,
    })
     return response;
   }
    catch(err) {
      return err;
      console.log(err);
     }  
  }

exports.resetPassword = async (req,res,next)=>{
    try{
  console.log(req.body);
  let UUID = req.params.uuid;
  let data = await forgotpassword.findOne({where : { id:UUID }});
  console.log("is Active ",data.isActive!=false);
  if(data.isActive!=false){
   await data.update({isActive:true});
   //res.setHeader('Content-Security-Policy', "script-src 'self' https://cdn.jsdelivr.net");
    res.sendFile( path.join(__dirname,'..','views','reset.html'));
  }
  else{
    res.status(404).send('<h2>LINK EXPIRED</h2>')
  }
}
catch(err){
  console.log(err)
  res.send('<h1>some error occured</h1>')
}
}


exports.resetMyPassword = async (req,res,next)=>{
  try{
    let t = await sequelize.transaction();
    console.log(req.body);
    let email = req.body.Email;
    let uuid = req.body.uuid;
    let newpassword = req.body.newPassword;
    let User = await user.findOne({where: {Email : email}});
    console.log(User);
    if(User){
     bcrypt.hash(newpassword,10, async(err,hash)=>{
      try{
        if(err){
       console.log(err);
       res.status(404).json({'message' : 'some error occured'});
        }
        else{
          let uuidstatus = await forgotpassword.findOne({where : {id : uuid}});
         if(uuidstatus){
           await uuidstatus.update({isActive : false},{transaction : t});
           
           User.update({Password : hash},{ transaction : t })
           .then(async(status)=>{
            await t.commit();
            console.log(status);
            res.status(200).json({'message': 'password updated successfully'});
           })
           .catch(async(err)=>{
            console.log(err);
            res.status(404).json({'message' : 'some error occured'});
            await t.rollback();
           })
         }
         else{
          res.status(404).json({'message' : 'some error occured'});
         }
        }
      }
      catch(err){
        await t.rollback();
        console.log(err);
      }
     })
    }
    else{
      res.status(404).json({'message' : 'user not found'});
    }

  }
   catch(err){
    console.log(err);
    res.status(404).json({'message' : 'some error occured'});
   }
}