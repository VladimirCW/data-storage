`use strict`;
dynamoDbConnector = require('./dynamoDbConnector');

module.exports.getUserByLogin = async (login) => {
    const params = {
        TableName: process.env["USERS_TABLE"],
        Key: {
            login
        }
    };
    return await dynamoDbConnector.getItem(params);
}

module.exports.getAllSamples = async (stage) => {
    const params = {
        TableName: `${stage}${process.env["IDENTIFIERS_TABE"]}`
    };
    return await dynamoDbConnector.scan(params);
}

module.exports.getSampleByID = async(stage, id) => {
    const params = {
        TableName: `${stage}${process.env["IDENTIFIERS_TABE"]}`,
        Key: {
            id
        }
    };
    return await dynamoDbConnector.getItem(params);
}

module.exports.createSample = async(stage, id, parsedBody) => {
    const params = {
        TableName: `${stage}${process.env["IDENTIFIERS_TABE"]}`,
        Key: {
            id
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
    return await dynamoDbConnector.update(params);
}

module.export.deleteSampleById = async (stage, id) => {
    const params = {
        TableName: `${stage}${process.env["IDENTIFIERS_TABE"]}`,
        Key: {
            id
        }
    };

    return await dynamoDbConnector.delete(params);
}