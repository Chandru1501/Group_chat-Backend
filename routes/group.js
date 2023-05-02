const express = require('express');
const router = express.Router();
const authendication = require('../middleware/authendication');
const groupController = require('../controllers/group');

router.use('/creategroup',authendication.Authendicate,groupController.createGroup);

router.get('/getallgroups',authendication.Authendicate,groupController.getAllgroups);

router.get('/getallmembers',authendication.Authendicate,groupController.getAllmembers);

router.get('/getgroupmessages/:lastmessageId',authendication.Authendicate,groupController.getGroupmessages);



module.exports = router;