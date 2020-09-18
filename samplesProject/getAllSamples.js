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
        response.body = JSON.stringify({"message": "User is not authorized. No token in header."});
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
    
            const data = await dbManager.getAllSamples(event.stageVariables["DB_ENV"]);
            response.statusCode = 200;
            response.body = JSON.stringify(data);
        } catch(err) {
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized. Can't verify the token."});
        }
    }
    
    return response;
}