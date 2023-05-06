const express = require('express');
const router = express.Router();
const authendication = require('../middleware/authendication');
const groupController = require('../controllers/group');

router.use('/creategroup',authendication.Authendicate,groupController.createGroup);

router.get('/getallgroups',authendication.Authendicate,groupController.getAllgroups);

router.get('/getallmembers',authendication.Authendicate,groupController.getAllmembers);

router.get('/getgroupmembers/:groupId',authendication.Authendicate,groupController.getgroupmembers)

router.get('/getgroupmessages/:lastmessageId',authendication.Authendicate,groupController.getGroupmessages);

router.post('/addmembers',authendication.Authendicate,groupController.addgroupmember);

router.post('/removemember',authendication.Authendicate,groupController.removegroupmember);

router.post('/makeasadmin',authendication.Authendicate,groupController.makeasAdmin);

router.get('/deletegroup/:groupId',authendication.Authendicate,groupController.deleteGroup);


module.exports = router;