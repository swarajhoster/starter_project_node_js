const mongoUri = "mongodb://localhost:27017/StarterProject";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;
let isDbConnectionRequested = false;

module.exports = connectToDatabase = () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }

    if (isDbConnectionRequested){ // Avoids New Connected Requested from Every other file.
        console.log('=> database connection Already requested');
        return Promise.resolve();
    }
    console.log('=> using new database connection');
    isDbConnectionRequested = true
    return mongoose.connect(mongoUri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
        .then(db => {
            isConnected = db.connections[0].readyState;
            console.log(`Connected to DB`);
        });
};
