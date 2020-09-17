'use strict'
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

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
            const documentClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});
            const params = {
                TableName: `${event.stageVariables["DB_ENV"]}_samples`,
                Key: {
                    id: event.pathParameters.id
                }
            };
            let data;
            try{
                data = await documentClient.get(params).promise();
            } catch(err) {
                console.log(err);
            }
            response.statusCode = 200;
            response.body = JSON.stringify(data.Item);
        } catch(err) {
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized"});
        }
    }
    
    return response;
}