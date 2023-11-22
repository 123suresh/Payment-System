const app = require('./app');

const dotenv = require('dotenv');

const connectDatabase = require("../Payment/config/database")

//Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1);
})

//setting up config file
dotenv.config({path:'.env'})

connectDatabase()

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

//Handle unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log("Shutting down server due to unhandle promise rejection");
    server.close(() => {
        process.exit(1);
    })
})