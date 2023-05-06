const group = require('../model/group');
const users = require('../model/user');
const messages = require('../model/messages');
let groupusers = require('../model/groupusers');
let Sequelize = require('sequelize');
let Op = Sequelize.Op;


exports.createGroup = async (req,res,next)=>{
    try{
        let createdBy = req.body.CreatedBy;
        let GroupName = req.body.GroupName;
        let GroupMembers = req.body.GroupMembers;
        let userId = req.user.Id; 
        // console.log(req.body);
        
        let response = await group.create({
            GroupName : GroupName,
            createdBy : createdBy
        })
        
        
       await GroupMembers.forEach(async(user)=> {
            let thisuser = await users.findAll({where : { Id : user.Id }})
            await response.addUser(thisuser);         
        });
        
        console.log(response);
        console.log(userId);
        console.log(response.id);

      setTimeout(()=>{
          groupusers.findAll({where : 
            {
                groupId: response.id,
                userId : userId
            }})
            .then(async(groupuser)=>{
                console.log(groupuser)
                await groupuser[0].update({
                         isAdmin : true
                        })
            })
      },3000);
        

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
        //console.log(messageData);
      res.status(200).json({'message' : 'success',"messageData" : messageData })
      //console.log(messageData);

    }
    catch(err){
        console.log(err);
        res.status(400).json({'message' : 'some error occured'});
    }
}

exports.getgroupmembers =  async (req,res,next)=>{
    try{
        let groupId = req.params.groupId;
       let Allgroupusers = await groupusers.findAll({
        where : {
            groupId : groupId
         },
         include: [
            {
              model: users,
              attributes: ['Username'],
            }
          ],
        });
    
       res.status(200).json({"message" : "success" , "groupmembers" : Allgroupusers});
    }
    catch(err){
        console.log(err);
        res.status(400).json({"message" : "some error occured"});
    }
}

exports.addgroupmember = async (req,res,next)=>{
    try{
        console.log(req.body);
        let requserId = req.user.Id;
        let reqgroupId = req.body[0].groupId;
    
        let requser = await groupusers.findOne({where : {
            userId : requserId,
            groupId : reqgroupId
        }})
        console.log(requser);
        if(requser){
            if(requser.isAdmin){
                console.log(req.body);
                let reqgroup = await group.findOne({where : {id : reqgroupId}});
                addedusers = [];
                req.body.forEach(async(user)=>{
                    let thisuser = await users.findOne({where : {Id : user.userId}});
                    let added = await reqgroup.addUser(thisuser);
                    addedusers.push(added);
                })
                console.log(addedusers);
                res.status(200).json({ 'message' : 'user successfully added', "users" : addedusers } );
        }
        else{
            res.status(400).json({ 'message' : 'You are not admin to add members' } );
        }
        }
        else{
            res.status(400).json({ 'message' : 'You are not member and admin of this group to add members please ask admin to add you' } );
    
        }

    }
    catch(err){
        console.log(err);
        res.status(404).json({'message' : 'something went wrong'});
    }
}

exports.removegroupmember = async (req,res,next)=>{
    try{
        console.log(req.body);
        console.log(req.user);
        let user = await groupusers.findOne({where : {
           userId : req.user.Id,
           groupId : req.body.groupId
          }
        })
        console.log(req);
        console.log(user);
        if(user){
               let groupId = req.body.groupId;
               let userId = req.body.userId;
            if(req.headers.clarification==='Exit'){
                console.log('trying to exit');
                let removeUser = await groupusers.findOne({where :{
                        groupId : groupId,
                        userId : userId
                       }})
                       console.log(removeUser); 
                       removeUser.destroy();
                       res.status(200).json({'message' : 'Exited from this group successfully'});
            }
            else{          
                if(user.isAdmin){
                  let removeUser = await groupusers.findOne({where :{
                    groupId : groupId,
                    userId : userId
                   }})
                   console.log(removeUser); 
                   removeUser.destroy();
                   res.status(200).json({'message' : 'User removed from this group successfully'});
                }else{
                    res.status(401).json({'message' : 'You are not admin to remove members'});
                }
            }
        }
        else{
            res.status(401).json({'message' : 'You are not this group member and admin to remove members please ask admin to add you'});
        }
    }
    catch(err){
        console.log(err);
        res.status(404).json({'message' : 'something went wrong'});
    }
    
}

exports.makeasAdmin = async(req,res,next)=>{
    try{
        console.log(req.body);
        console.log(req.user);
        let requserId = req.user.Id;
        let groupId = req.body.groupId;
      
       let requser = await groupusers.findOne({where : {
          userId : requserId,
          groupId : groupId
        }})
      
        console.log(requser);
        if(requser.isAdmin){
          let toMakeAdminId = req.body.userId;
          let tomakeAdmin = await groupusers.findAll({where : {
              userId : toMakeAdminId,
              groupId : groupId
          }})
          console.log(tomakeAdmin);
          await tomakeAdmin[0].update({
              isAdmin : true
          })
         res.status(200).json({'message' : 'Marked as admin successfully'});
        }
        else{
         res.status(401).json({'message' : 'You are not admin to make this Operation'})
        }
    }
    catch(err){
        console.log(err);
        res.status(401).json({"message" : 'some error occured'})
    }
}

exports.deleteGroup = async (req,res,next)=>{
    try{
        console.log(req.params.groupId);
        let groupId = req.params.groupId;
        let requsername = req.user.Name;
    
        let reqgroup = await group.findAll({where : { id : groupId}});
        console.log(reqgroup);
        console.log(requsername);
        if(reqgroup){
            if(reqgroup[0].createdBy===requsername){
                reqgroup[0].destroy();
                console.log('deleted');
                res.status(200).json({'message' : 'group deleted succesfully'});
            }
            else{
                res.status(200).json({'message' : 'Only who created this group can only able to delete this group'});
            }
        }
        else{
            res.status(401).json({ 'message' : 'something went wrong' });
        }
    }
    catch(err){
        console.log(err);
        res.status(401).json({ 'message' : 'something went wrong' });
    }
}