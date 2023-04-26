const bcrypt = require('bcrypt');
const sequelize = require('../utills/database');
const users = require('../model/user');



exports.signup = async (req,res,next)=>{
    let t = await sequelize.transaction();
     try{

        let Name = req.body.Name;
        let Email = req.body.Email;
        let Phone = req.body.Phone;
        let Password =  req.body.Password;
  console.log(req.body);
  console.log(req.body.Email);
  let user = await users.findOne({where : {Email:Email}});
  console.log(user);
  if(!user){
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
                 Email : Email,
                 Phone : Phone,
                 Password : hashed
                },{ transaction : t })
                .then(async (response)=>{
                  await t.commit();
                    res.status(200).json({"message" : "success"})
                })
                .catch((err)=>{
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

}