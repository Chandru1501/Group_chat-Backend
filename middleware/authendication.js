let jwt = require('jsonwebtoken');

exports.Authendicate = async (req,res,next)=>{
    try{
  let token = req.headers.authorization;
  let message = req.body.Message;

    const ReqUser = jwt.verify(token,process.env.JWT_TOKEN_SECRECT)
    
    req.user = ReqUser;
    req.message = message;

       next();
    }
    catch(err){
        console.log(err);
        res.status(200).json({"message" : "your account not found"});
    }
}