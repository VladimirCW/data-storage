'use strict'
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const dbManager = require('./utils/db/dbManager');

AWS.config.update({region: "us-east-2"});

exports.handler = async (event, context) => {
    const response = {};
    const tokenBearer = event.headers.Authorization || "";
    const token = tokenBearer.split(' ')[1];
    if(!token) {
        response.statusCode = 403;
        response.body = JSON.stringify({"message": "User is not authorized"});
    } else {
        try{
            //GET jwtSekretKey---
            const parameterStore = new AWS.SSM();
            const paramsSSM = {
                Name: 'jwtsecretkey'
            };
            const secretKey = (await parameterStore.getParameter(paramsSSM).promise()).Parameter.Value;
            //-------------------
            jwt.verify(token, secretKey);
        
            const data = await dbManager.deleteSampleById(event.stageVariables["DB_ENV"], event.pathParameters.id);
            if(data.status === "success") {
                response.statusCode = 204;
                response.body = JSON.stringify(data);
            } else {
                console.log(err);
                response.statusCode = 400;
                response.body = JSON.stringify({"message": "Error while deleting element"});
            }
        } catch(err) {
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized"});
        }
    }
    
    return response;
}