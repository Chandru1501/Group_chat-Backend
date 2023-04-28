const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messages');
const Authorization = require('../middleware/authendication');



router.post('/sendmessage',Authorization.Authendicate,MessageController.SendMessage);

router.get('/getmessages/:lastmessage',Authorization.Authendicate,MessageController.getMessages);


module.exports = router;
