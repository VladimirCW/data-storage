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
        response.body = JSON.stringify({"message": "User is not authorized. No token"});
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
            const parsedBody = JSON.parse(event.body);
            const documentClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});

            const params = {
                TableName: `${event.stageVariables["DB_ENV"]}_samples`,
                Key: {
                    id: event.pathParameters.id
                },
                UpdateExpression: "set description = :m, sampleNames = :sn",
                ExpressionAttributeValues: {
                    ":m": parsedBody.description || "",
                    ":sn": typeof parsedBody.sampleName === "string"  
                        ? [
                            {
                                sampleName: parsedBody.sampleName,
                                dto: Date.now()
                            }
                        ]
                        : parsedBody.sampleName.map(i => {
                            return {
                                sampleName: i,
                                dto: Date.now()
                            };
                        })
                },
                ReturnValues: "ALL_NEW"
            };
            let data;
            try{
                data = await documentClient.update(params).promise();
                response.statusCode = 204;
                response.body = JSON.stringify(data);
            } catch(err) {
                console.log(err);
                response.statusCode = 400;
                response.body = JSON.stringify({"message": "Error while updating element"});
            }
        } catch(err) {
            console.log("Error: " + err);
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized. Bad token", "error": err});
        }
    }
    
    return response;
}