const mongoose = require('mongoose');
const chalk = require('chalk');


const app = require('./src/app');
const {LOCAL_DB_URI, PORT} = require("./src/utils/constants");
console.log("localDb", LOCAL_DB_URI)


/** connect to database */
// const DB_REMOTE = REMOTE_DB_URI.replace("<PASSWORD>", DB_PASSWORD);
mongoose.connect(LOCAL_DB_URI,
    {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true,
    }).then(conn => {
        console.log("Database connected!")
    }).catch(e => console.log(`Database connection error!=${e}`));

const server =app.listen(PORT, () => {
    console.log(`server listening on port : ${PORT}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message);
    // Shutting Down Server
    server.close(() => {
        process.exit(1); // 0 - success | 1 - Uncaught Exception
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
  