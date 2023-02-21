"use strict";
require("dotenv").config();
const env = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db")
const Emp = require("./model/Emp")
const aws = require("aws-sdk")

const { eventNames } = require("./model/Emp");

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
    const { Employee, department, email } = JSON.parse(event.body)

    const emp = new Emp({
      email,
      Employee,
      department
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
  const Email = process.env.FROM_EMAIL;
  try{
    const{email,password} = JSON.parse(event.body);
    let loginemployee = await  employee.findOne({email:email});
    bcrypt.compare(password, loginemployee.password, function (error,result){
      if(result==true){
        var token = jwt.sign(
          {email:loginemployee.email, id:loginemployee._id, name: loginemployee.name},
          process.env.SECRETKEY
        );

        
        console.log("Logged in Successfully");
        
      }
      else{
        console.log("Logged in unsuccessfully");
      }
    });
    const params ={
      Source: Email,
      Destination :{
        ToAddresses : [email],
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
    const emailSent = await SES.sendEmail(params).promise()
    .then(data => {
      data
    })
      .catch(error =>{
        error.message
  
      
    })


  }
  catch(error){
    console.log("Invalid Details");
  }
};









