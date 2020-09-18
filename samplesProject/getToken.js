'use strict'
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const dbManager = require('./utils/db/dbManager');

AWS.config.update({region: "us-east-2"});

exports.handler = async (event) => {
    const reqBody = JSON.parse(event.body);
    const response = {};
    
    if(reqBody.login) {
        const userDataFromDb = (await dbManager.getUserByLogin(reqBody.login)) || {};
        const {login, password} = userDataFromDb;
        //GET jwtSekretKey---
        const parameterStore = new AWS.SSM();
        const paramsSSM = {
            Name: 'jwtsecretkey'
        };
        const secretKey = (await parameterStore.getParameter(paramsSSM).promise()).Parameter.Value;
        //-------------------
        if(reqBody.login === login && reqBody.password === password) {
            const token = jwt.sign({ name: login }, secretKey, {expiresIn: '12h'});
            const data = {
                token
            };
            response.statusCode = 200;
            response.body = JSON.stringify(data);
        } else {
            response.statusCode = 403;
            response.body = JSON.stringify({"message": "User is not authorized."})
        }
    } else {
        response.statusCode = 403;
        response.body = JSON.stringify({"message": "Can't parse user credentials."})
    }

    return response;
}