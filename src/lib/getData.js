import axios from "axios"
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();
export async function getData() {
    let paramsUsers = { TableName: process.env.USER_TABLE_NAME, AttributesToGet: [
        "userID",
        "chosenApps",
        "country",
        "createdAt",
        "job",
        "region"
      ], };

      let paramsConvos = { TableName: process.env.CONVOS_TABLE_NAME };

    let scanResultsUsers = [];
    let scanResultsConvos = [];
    let items;

    do {
        const command = new ScanCommand(paramsUsers);
        items = await client.send(command);
        items.Items.forEach((item) => {
            const result = {};
            for (const key in item) {
                const valueObj = item[key];
                const dataType = Object.keys(valueObj)[0];
                const value = valueObj[dataType];
                result[key] = value;
            }
            scanResultsUsers.push(result)});
        if (typeof items.LastEvaluatedKey != "undefined" ) paramsUsers.ExclusiveStartKey = items.LastEvaluatedKey
    } while (typeof items.LastEvaluatedKey != "undefined");
    do {
        const command = new ScanCommand(paramsConvos);
        items = await client.send(command);
        items.Items.forEach((item) => {
            const result = {};
            for (const key in item) {
                const valueObj = item[key];
                const dataType = Object.keys(valueObj)[0];
                const value = valueObj[dataType];
                result[key] = value;
            }
            scanResultsConvos.push(result)});
        if (typeof items.LastEvaluatedKey != "undefined" ) paramsConvos.ExclusiveStartKey = items.LastEvaluatedKey
    } while (typeof items.LastEvaluatedKey != "undefined");


    const results = scanResultsUsers.map(item => {
        const matchingItems = scanResultsConvos.filter(subItem => subItem.userID === item.userID);
        if (matchingItems.length > 0) {
          item.exchanges = matchingItems.map(({userID, ...keepAttrs}) => {
            keepAttrs["createdAt"] *= 1000
            return keepAttrs
        });
        } else {
            item.exchanges = []
        }
        if (typeof item["chosenApps"] === "undefined") item["chosenApps"] = []
        item["createdAt"] *= 1000
        const {userID, ...obj} = item
        return obj;
      });
      
    return results
}