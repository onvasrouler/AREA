const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
require("./src/database/mongo");
const { ServerRunner } = require("./src/runner/runner");
const api_formatter = require("./src/middleware/api-formatter.js");
const fileUpload = require("express-fileupload");
require("./src/utils/discord");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const os = require("os");

const PORT = process.env.PORT || 3333;
const networkInterfaces = os.networkInterfaces();
let aboutJson = require("./about.json");



app.use(cors()); // this will allow the frontend to communicate with the backend
app.use(helmet()); // this will add security headers
app.use(express.json()); // this will allow the backend to parse json data
app.use(fileUpload()); // this will allow the backend to parse files
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // this will allow the backend to parse urlencoded data

app.use(function (req, res, next) { // this will allow the frontend to communicate with the backend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

require("./src/router/user/user.query")(app); // this will require the user queries
require("./src/router/api/api.query")(app); // this will require the api queries
require("./src/router/auth0/auth.query.js")(app); // this will require the auth0 queries
require("./src/router/actionReaction/actionReaction.query")(app); // this will require the actionReaction queries

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AREA API",
            version: "4.2.0",
            description: "this is the API for the AREA project",
            contact: {
                name: "aimeric",
                email: "aimeric.rouyer@gmail.com",
            },
        },
        servers: [
            {
                url: `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_URL}${process.env.PORT ? ":" + process.env.PORT : ""}`,
            },
        ],
    },
    apis: ["./src/router/*/*.js", "./src/router/*/*/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/about.json", (req, res) => {
    aboutJson.server.current_time = Math.round(new Date() / 1000);
    res.status(200).setHeader("Content-Type", "application/json").send(JSON.stringify(aboutJson, null, 2));
});

app.use((req, res) => {
    return api_formatter(req, res, 404, "notFound", "This endpoint isn't found");
});


app.listen(PORT, () => { // this will start the server
    const localIp = networkInterfaces["Wi-Fi"] ? networkInterfaces["Wi-Fi"].find(details => details.family === "IPv4").address : "127.0.0.1";
    aboutJson.client.host = `${localIp}`;
    console.log(`Local IP address: ${localIp} and port ${PORT}.`);
    ServerRunner.run(); // this will run the server
});
