const User = require("../db/models/User.js");
const model = require("../models/auth.model.js");

const ErrorHandler = require("../utils/errorHandler.js");
const { catchAsyncError } = require("../utils/middelwares/catchAsyncError.js");

exports.getAllUsers = catchAsyncError(async (req, res) => {
  const users = await User.find({});
  return res.status(200).json({
    count: users.length,
    success: true,
    users,
  });
});

exports.newUser = catchAsyncError(async (req, res, next) => {

  const {name, email} = req.body;



    const userExists = await model.checkIfUserWithEmailExists(email);


  if (userExists) {
    return next(new ErrorHandler("User Already Exist", 400));
  }

  await model.createAccount(req.body)

  res.status(201).json({ message: "User Created Successfully" });
});
