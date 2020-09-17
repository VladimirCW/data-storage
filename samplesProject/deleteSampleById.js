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
                TableName: "testTable",
                Key: {
                    id: event.pathParameters.id
                }
            };
            let data;
            try{
                data = await documentClient.delete(params).promise();
                response.statusCode = 204;
                response.body = JSON.stringify(data);
            } catch(err) {
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