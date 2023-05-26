const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();
const groupusers = require('../model/groupusers');

// exports.UploadToS3  =  async function (data,filename) {
//     const BUCKET_NAME = process.env.BUCKET_NAME;
//     const IAM_USER_KEY = process.env.IAM_USER_KEY;
//     const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
//     console.log(data,filename);

//     let S3bucket = new AWS.S3({
//         accessKeyId : IAM_USER_KEY,
//         secretAccessKey : IAM_USER_SECRET
//     })

//     let params = {
//         Bucket : BUCKET_NAME,
//         Key : filename,
//         Body : data,
//         ACL : "public-read"
//     }

// return new Promise((resolve, reject) => {
//     S3bucket.upload(params , (err,S3response)=>{
//         if(err){
//             reject("error",err);
//         }
//         else{
//             resolve(S3response.Location);
//         }
//      })
//   })
// }







exports.UploadTOs3 = async (req,res,next)=>{
  let userId = req.user.Id;
  let groupId = req.headers.groupid;

  let user = await groupusers.findAll({where : {
    userId : userId,
    groupId : groupId
  }});

  console.log(user[0]);
  if(user[0]!=undefined){
      AWS.config.update({
          accessKeyId: process.env.IAM_USER_KEY,
          secretAccessKey: process.env.IAM_USER_SECRET,
          region: 'us-east-1'
      });
      
      const s3 = new AWS.S3();
  
      const { originalname , buffer } = req.file;
  
          let params = {
          Bucket : process.env.BUCKET_NAME,
          Key : `${Date.now()}--${req.headers.groupid}--${originalname}`,
          Body : buffer,
          ACL : "public-read"
      }
      
      s3.upload(params,(err,result)=>{
          if(err){
           console.log(err);
           res.status(500).json({'message' : 'some error in uploading file' })
          }
          else{
             console.log(result);
             req.result = result;
             next();
          }
      })
      console.log('group user');
  }
  else{
    req.result = 'You are not member of this group to send file or message please ask admin to add you !!'
    next();
  }
 }