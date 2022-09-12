const User = require("../db/models/User.js");

module.exports.checkIfUserWithEmailExists = async (email) => {
  return (await User.countDocuments({ email: email })) > 0;
};

module.exports.findUserByEmail = async (email) => {
  return User.findOne({ email });
};

module.exports.createAccount = async (body) => {
  const { name, email } = body;
  return new User({
    name,
    email,
  }).save();
};