const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messages');
const Authorization = require('../middleware/authendication');
const AWSUpload = require('../middleware/AWS-S3');
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer();


// const storage = multer.diskStorage({
//     destination : (req,file,cb)=>{
//         return cb(null,'./uploads')
//     },
//     filename : (req,file,cb)=>{
//         console.log(req.headers)
//         return cb(null,`${Date.now()}--${req.headers.groupid}--${file.originalname}`);
//     }
// })



router.post('/sendmessage',Authorization.Authendicate,MessageController.SendMessage);

router.post('/sendfile',Authorization.Authendicate,upload.single('file'),AWSUpload.UploadTOs3,MessageController.SendFile);


module.exports = router;
