const Airtable = require("airtable");
const { disabled } = require("./app");

const TOKEN = "patJRnYixCXZr1yOb.6b10018a8a823e6eef2a22c2f9956f30b94df7a55519a7863a660b7e70130f42"
const BASE = "appm11T3EfghsEADQ"
const TABLE = "business_users"

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: TOKEN
});
var base = Airtable.base(BASE);

const createUser = async (user) => {
    try {
        const created = await base(TABLE).create(
            user 
        )
        console.log(created._rawJson.fields)
        return created._rawJson.fields
    }catch (err) {
        // console.log(err)
        throw err
    }
}

const selectRecord = async () => {
    let data = [];

    try {
        // Use Promise-based version of the select method
        const records = await base(TABLE).select({
            view: 'Grid view'
        }).firstPage();

        records.forEach(function(record) {
            data.push(record._rawJson);
        });

        // Now data is populated with the records
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
        throw err; // You might want to handle or propagate the error accordingly
    }
};


const findSingleUserRecord = async (recordId) => {
    console.log(recordId);

    try {
        const filterFormula = `email = "${recordId}"`;

        const { records } = await new Promise((resolve, reject) => {
            base(TABLE).select({
                filterByFormula: filterFormula,
            }).eachPage((pageRecords, fetchNextPage) => {
                // Resolve the promise with the records
                resolve({ records: pageRecords });
            }, (error) => {
                // Reject the promise with the error if any
                reject(error);
            });
        });

        if (records.length > 0) {
            const record = records[0]; // Assuming you want the first record
            console.log("Retrieved this playlist record", record._rawJson.fields);
            return {id:record.id,...record._rawJson.fields };
        } else {
            console.log("Record not found");
            return null;
        }
    } catch (error) {
        console.error(error);
        // Handle or propagate the error accordingly
        throw error;
    }
};


const updateSingleUser = async (userId, fieldsToUpdate) => {
    try {
        const update = await base(TABLE).update(
            userId, // recordId
            fieldsToUpdate, // fieldsToUpdate
            (err, record) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Record updated:', record);
            }
        );
        return update;
    } catch (err) {
        console.error(err);
        return false;
    }
};


module.exports = {createUser,selectRecord,findSingleUserRecord,updateSingleUser }