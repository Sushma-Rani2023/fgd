"use strict";
require("dotenv").config();
const env = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db")
const Emp = require("./model/Emp")
const aws = require("aws-sdk")

//const { eventNames } = require("./model/Emp");

env.config();
const awsConfig = {
  accessKeyId : process.env.AccessKey,
  secretAccessKey : process.env.SecretKey,
  region: process.env.AWS_REGION
}

const SES = new aws.SES (awsConfig)
connectDB();

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v2.0! Your function executed successfully!",
      }),
  };
};

module.exports.getEmployees = async (event) => {
  const e = await Emp.find();

  // const e = await readfromDB()
  return {
    statusCode: 200,
    body: JSON.stringify(e),
  };
}

module.exports.postEmployee = async (event) => {
  try {
    const { Employee, department, email, password } = JSON.parse(event.body)
    const new_password= await bcrypt.hash(password,10)
    const emp = new Emp({
      email,
      Employee,
      department,
      password: new_password
    })

    const data = await emp.save()

    const params = {
      Source: "sushma@inzint.com",
      Destination: {
        ToAddresses: [email]

      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `Welcome ${Employee}`
          }
        },
        Subject: {
          Data: "Your Verified",
        }

      }
    }


    const messageId = await SES.sendEmail(params)
    .promise()
    .then((data) => data.messageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: emp,
        message: "email sent succesfully",
        messageId
      })
    };
  }
  catch (err) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        message: err.message,
      })
    }
  }
}
module.exports.loginEmployee = async (event) => {
  try{
    const parse = JSON.parse(event.body);
    //console.log(parse,"WWWWWWWWWWWWWWWWWWW",Emp);
    const loginemployee =  await Emp.findOne({email:parse.email});
    //console.log("##############3",parse.password,loginemployee.password,loginemployee.email)
    const result=bcrypt.compare(parse.password, loginemployee.password)
    
      if(result){
        var token = jwt.sign(
          {email:loginemployee.email, id:loginemployee._id, },
          process.env.SECRETKEY
        );
        console.log(token);
          
      }
    
    const Email = process.env.FROM_EMAIL;
    //console.log("**********************",Email,parse.email)
    const params ={
      Source: Email,
      Destination :{
        ToAddresses : [loginemployee.email],
      },
      Message: {
        Subject : {
          Charset : "UTF-8",
          Data : "Welcome to Inzint.",
        },
        Body :{
          Html:{
            Charset : "UTF-8",
            Data: `<h1> Hii, welcome to team </h1>`,
          },
        },
      },
    };
    const messageId = await SES.sendEmail(params)
    .promise()
    .then((data) => data.messageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: Emp,
        message: "email sent ",
        messageId
      })
    };
  } 
  catch(error){
    return {
      statusCode: 501,
      body: JSON.stringify({
        message: error.message,
      })
    }
  }
}

;









