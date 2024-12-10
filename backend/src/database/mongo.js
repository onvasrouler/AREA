const mongoose = require("mongoose");

const MongoDBURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/";

mongoose.set("strictQuery", false);

const mainDB = mongoose.createConnection(MongoDBURI, {
    dbName: process.env.NODE_ENV == "PROD" ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME, // this will be used to specify the database name
});

mainDB.on("error", (err) => {
    console.error("An error occured when trying to connect with the database : ", err); // this will log the error
});

mainDB.once("open", async () => {
    console.log("Connection with database established"); // this will log that the connection with the database is established
});

module.exports = { mainDB };