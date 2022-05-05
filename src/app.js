const {options} = require("./docs/swaggerDef");

const express = require("express");
// const monogoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
// const morgan = require("morgan");
const http = require("http");
// const socket = require("socket.io");
const routes = require('./router/v1');
const helmet = require("helmet");
// const xssClean = require("xss-clean");
// const hpp = require("hpp");
// const cookieParser = require("cookie-parser");

const path = require('path');
const dotenv = require("dotenv");
// const getResponseExpress  = require('@tiemma/sonic-express');
const getResponseExpress  = require('./libs/autoSwagger');

dotenv.config({ path: path.join(__dirname, '../env/.env') });
// dotenv.config({ path: '.env' });S
// import global error handler
const AppError = require("./utils/response/appError");
const globalErrorHandler = require("./app/error/global_error_handler");



// const reviewRouter = require("./app/review/reviewRoute");
const {isDevelopment} = require("./config/constants");
const fs = require("fs");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerDefinition = require("./docs/swaggerDef");


// instantiate express app
const app = express();

const server = http.createServer(app);
// const io = socket(server, {
//   cors: {
//     allowed: "*",
//   },
// });

/**
 * using middlewares
 */
app.use(cors());

//for logging purposes
if (isDevelopment()) {
  // app.use(morgan("dev"));
}

// read and parse json data from request body & limit size of request data
app.use(express.json({ limit: "10kb" }));
// use cookie parser to get nicely formatted cookie
// app.use(cookieParser());
// sanitize request body for NoSql injection attacks
// app.use(monogoSanitize());
// sanitize request body for NoSql injection attacks
// app.use(xssClean());
// prevent parameter pollution attacks
// app.use(hpp());
// header sender helmet for security | security http headers
app.use(helmet());




// v1 api routes
app.use('/api/v1', routes);
app.get("/", function (req, res) {
  res.status(200).json("hi");
});

app.use(getResponseExpress(app, options, './docs/swagger.json'));

/**
 * handle unregisterd routes
 */
app.use("*", (req, res, next) => {
  next(
    new AppError(`The requested url ${req.originalUrl} does not exist`, 404)
  );
});

/**
 * general error handling middleware
 * express redirects route to this function
 * if error occured i.e argument passed into
 * the next() function.
 */
app.use(globalErrorHandler);

// /**
 // * Socket
 // */
// io.on("connection", (socket) => {
//   socket.on("join", (ids) => {
//     console.log(ids);
//     socket.join(ids);
//     socket.on("notify-item-added", (data) => {
//       socket.broadcast.to(data.id).emit("receive-item-added", data.content);
//     });
//   });
// });

module.exports = server;
