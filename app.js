require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const UserRoutes = require('./routes/user');
const sequelize = require('./model/user');

app.use(bodyParser.json());
app.use(cors({
    origin : "http://127.0.0.1:5500"
})
);


app.use('/user',UserRoutes);

// sequelize.sync({force : true})
sequelize.sync()
.then((response)=>{
    console.log(response);
    app.listen(8000);
})
.catch(err=>console.log(err));