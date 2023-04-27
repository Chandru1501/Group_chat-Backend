const bcrypt = require('bcrypt');
const sequelize = require('../utills/database');
const users = require('../model/user');
let jwt = require('jsonwebtoken');



exports.signup = async (req,res,next)=>{
    let t = await sequelize.transaction();
     try{
        const Name = req.body.Name;
        const EmaiL = req.body.Email;
        const Phone = req.body.Phone;
        const Password =  req.body.Password;
  console.log(req.body);
  console.log(req.body.Email);
  let user = await users.findOne( { where : { Email:EmaiL } } );
  console.log("user",user);
  if(user==null || user==="" || user===undefined){
      let salt = 10;
      bcrypt.hash(Password,salt,async(err,hashed)=>{
         if(err){
            console.log(err);
            throw new Error();
         }
         else{
            console.log(req.body.Email);
             users.create({
                 Username : Name,
                 Email : EmaiL,
                 Phone : Phone,
                 Password : hashed
                },{ transaction : t })
                .then(async (response)=>{
                 await t.commit();
                 console.log('new user update successfull')
                    res.status(200).json({"message" : "success"})
                })
                .catch(async(err)=>{
                  await t.rollback();
                    console.log(err);
                    res.status(400).json({"message" : "somthing went wrong"})
                })
            }
       })
   }
  else{
    console.log(user);
    res.status(400).json({"message" : "user exists"})
  }
     }
     catch(err){
       await t.rollback();
        console.log(err);
        res.status(400).json({"message" : "somthing went wrong"})
     }
}

exports.login = async (req,res,next)=>{
   try{
  console.log(req.body);
  let EmaiL = req.body.Email;
  let userPassword = req.body.Password;

  let user = await users.findAll({ where : {Email : EmaiL}});
  console.log(user);
  if(user[0]==null || user==="" || user===undefined){
   console.log("not Found");
       res.status(404).json({'message' : 'usernotfound'})
  }
  else{
    if(user[0].Email === EmaiL){
       let DBpassword = user[0].Password;
       bcrypt.compare(userPassword,DBpassword,async(err,result)=>{
         console.log(result);
         if(err){

         }
         else{
            if(result===true){
                console.log('password matched')
                let id = user[0].Id;
                let name = user[0].Username;
                console.log( 'userrneme ', name)
               let token = generateAccessToken(id,name);
               console.log(token);
                res.status(200).json({"message" : "login successfull" , "Token" : token , "Username" : name })

                function generateAccessToken(Id,Name){
                 return jwt.sign({Id : Id , Name : Name},process.env.JWT_TOKEN_SECRECT)
                }
            }
            else{
               console.log('password not matched')
               res.status(401).json({"message" : "incorrect password"})

            }
          }
       }) 
    }
  }
}
catch(err){
   console.log(err);
   res.status(404).json({"message" : "something wrong"})
}
}