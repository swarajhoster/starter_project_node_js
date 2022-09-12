const fs = require("fs")
const mongoose = require('mongoose');
const colors = require("colors");
const User = require("./db/models/User.js");

// Connect To DB
mongoose.connect("mongodb://localhost:27017/StarterProject", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Read JSON files
const users = JSON.parse(
    fs.readFileSync("./_data/user.json", 'utf-8')
);

// Importing Data to DB
const importData = async () => {
    try {
        await User.create(users);
        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await User.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Setting flag for running the function
// ? node seeder.js -i (import data)
// ? node seeder.js -d (delete data)

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}