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

            const bodyFromDb = await dbManager.getSampleByID(event.stageVariables["DB_ENV"], event.pathParameters.id.toLowerCase());
            let bodyFromDbAsArray = (bodyFromDb && bodyFromDb.sampleNames) || [];
            let usedSampleName = bodyFromDbAsArray.length ? bodyFromDbAsArray.splice(0, 1)[0] : "no data";
            const data = await dbManager.updateSampleById(event.stageVariables["DB_ENV"], event.pathParameters.id, bodyFromDbAsArray);
            if(data.status === "success") {
                response.statusCode = 200;
                response.body = JSON.stringify(usedSampleName);
            } else {
                console.log(err);
                response.statusCode = 400;
                response.body = JSON.stringify({"message": "Error while updating element"});
            }
        } catch(err) {
            console.log("Error: " + err);
            console.log("Token is exist but not verifyed");
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized"});
        }
    }
    
    return response;
}