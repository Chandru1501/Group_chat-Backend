const group = require('../model/group');
const users = require('../model/user');
const messages = require('../model/messages');
let Sequelize = require('sequelize');
let Op = Sequelize.Op;


exports.createGroup = async (req,res,next)=>{
    try{
        let createdBy = req.body.CreatedBy;
        let GroupName = req.body.GroupName;
        let GroupMembers = req.body.GroupMembers;
        console.log(req.body);

       let response = await group.create({
            GroupName : GroupName,
            createdBy : createdBy
        })
        GroupMembers.forEach(async(user)=> {
            let thisuser = await users.findAll({where : { Id : user.Id }})
            response.addUser(thisuser);         
        });

      console.log(response);
        res.status(200).json({"message" : "successfully created", "createdgroup" : response });
    }
    catch(err){
        console.log(err);
        res.status(200).json({"message" : "error occured"});
    }
}

exports.getAllmembers = async (req,res,next)=>{
    try{
        let Allusers = await users.findAll({
            attributes : ["Id",'Username']
        })
        console.log(Allusers);
        res.status(200).json({ "Allusers" : Allusers });
    }
    catch(err){
        console.log(err);
        res.status(400).json({'message' : "error"});
    }
}

exports.getAllgroups = async (req,res,next)=>{
    try{
        let Allgroups = await group.findAll();
        res.status(200).json({ 'message' : "success", "Allgroups" : Allgroups});
    }
    catch(err){
        console.log(err);
        res.status(400).json({'message' : 'some error occured'});
    }
}

exports.getGroupmessages = async (req,res,next)=>{
    try{
        let groupId = req.headers.groupid;
        let lastmessageId = req.params.lastmessageId;
      console.log("group id : "+groupId)
      console.log("lastmessageId : "+lastmessageId);
    
      let Group = await group.findAll({where :{Id : groupId}});
      console.log(Group);
      let messageData = await messages.findAll({ 
           where : {
            groupId : groupId,
            Id : { 
                [Op.gt]: lastmessageId
            }
           }, include: [
            {
              model: users,
              attributes: ['Username'],
            }
          ],
        },
        )
        console.log(messageData);
      res.status(200).json({'message' : 'success',"messageData" : messageData })
      console.log(messageData);

    }
    catch(err){
        console.log(err);
        res.status(400).json({'message' : 'some error occured'});
    }
}