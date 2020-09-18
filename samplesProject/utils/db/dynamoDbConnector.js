`use strict`;
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});

module.exports.getItem = async (params) => {
    let data;
    try{
        data = (await documentClient.get(params).promise()).Item;
    } catch(err) {
        console.log(err);
    }
    return data;
}

module.exports.scan = async (params) => {
    let data;
    try{
        data = (await documentClient.scan(params).promise()).Items;
    } catch(err) {
        console.log(err);
    }
    return data;
}

module.exports.update = async (params) => {
    const data = {};
    try{
        await documentClient.update(params).promise();
        data.status = "success";
    } catch(err) {
        data.status = "error";
        data.error = err;
    }
    return data;
}

module.exports.delete = async (params) => {
    const data = {};
    try{
        await documentClient.delete(params).promise();
        data.status = "success";
    } catch(err) {
        data.status = "error";
        data.error = err;
    }
    return data;
}