const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();
require("./src/database/mongo");
const api_formatter = require("./src/middleware/api-formatter.js");
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 3333;

app.use(cors()); // this will allow the frontend to communicate with the backend
app.use(helmet()); // this will add security headers
app.use(express.json()); // this will allow the backend to parse json data
app.use(fileUpload()); // this will allow the backend to parse files
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // this will allow the backend to parse urlencoded data
app.use(morgan('combined')); // this will log the requests

app.use((req, res, next) => {
    console.log(`Request from ${req.ip} : ${req.method} ${req.originalUrl}`); // this will log the request
    next();
});

app.use(function (req, res, next) { // this will allow the frontend to communicate with the backend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

require("./src/router/user/user.query")(app); // this will require the user queries
require("./src/router/api/api.query")(app); // this will require the api queries

app.use((req, res) => {
    return api_formatter(req, res, 404, "notFound", "This endpoint isn't found");
});

app.use(function (err, req, res, next) { // this will return a 500 error if an error occured
    console.error(err.stack);
    return api_formatter(req, res, 500, "error", "An error occured", null, err, null);
});

app.listen(PORT, () => { // this will start the server
    console.log(`Server is running on port ${PORT}.`); // this will log the port
});
