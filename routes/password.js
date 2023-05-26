const express = require('express');
const router = express.Router();
const Passwordcontroller = require('../controllers/password');
const authendication = require('../middleware/authendication');


router.post('/forgotpassword',Passwordcontroller.ForgotPassword);

router.get('/resetpassword/:uuid',Passwordcontroller.resetPassword);

router.post('/reset-my-password',Passwordcontroller.resetMyPassword);


module.exports = router;