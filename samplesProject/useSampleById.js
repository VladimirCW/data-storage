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

            const bodyFromDb = await getSampleById(event, documentClient, event.pathParameters.id);

            console.log("Body from DB: " + JSON.stringify(bodyFromDb, null, "\t"));

            let bodyFromDbAsArray = (bodyFromDb.Item && bodyFromDb.Item.sampleNames) || [];
            let usedSampleName = bodyFromDbAsArray.length ? bodyFromDbAsArray.splice(0, 1)[0] : "no data";

            const params = {
                TableName: `${event.stageVariables["DB_ENV"]}_samples`,
                Key: {
                    id: event.pathParameters.id
                },
                UpdateExpression: "set sampleNames = :n",
                ExpressionAttributeValues: {
                    ":n": bodyFromDbAsArray
                },
                ReturnValues: "ALL_NEW"
            };
            let data;
            try{
                console.log("Ready to update DB");
                data = await documentClient.update(params).promise();
                response.statusCode = 200;
                response.body = JSON.stringify(usedSampleName);
                console.log(JSON.stringify(response, null, "\t"));
            } catch(err) {
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


async function getSampleById (event, documentClient, id) {
    const params = {
        TableName: `${event.stageVariables["DB_ENV"]}_samples`,
        Key: {
            id
        }
    };
    let data;
    try{
        data = await documentClient.get(params).promise();
    } catch(err) {
        console.log(err);
    }
    return data;
}
