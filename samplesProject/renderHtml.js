'use strict'
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.update({region: "us-east-2"});

exports.handler = async (event, context) => {
    const response = {};
    const data = fs.readFileSync(path.join(__dirname, 'index.html'), {encoding:'utf8'});
    response.statusCode = 200;
    response.headers = {'Content-Type': 'text/html'},
    response.body = data;
    return response;
}