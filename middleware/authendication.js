let jwt = require('jsonwebtoken');

exports.Authendicate = async (req,res,next)=>{
    try{
  let token = req.headers.authorization;

    const ReqUser = jwt.verify(token,process.env.JWT_TOKEN_SECRECT)
    
    req.user = ReqUser;

       next();
    }
    catch(err){
        console.log(err);
        res.status(200).json({"message" : "your account not found"});
    }
}