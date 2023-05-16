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

exports.AuthendicateIO = async (auth)=>{
    try{
  let token = auth;

    const ReqUser = jwt.verify(token,process.env.JWT_TOKEN_SECRECT)
    
    return ReqUser;
    }
    catch(err){
        console.log(err);
        return "your account not found";
    }
}