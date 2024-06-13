const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const { text } = require("express");
// const { validate } = require("node-cron");
const PASSWORDLENGTH = 8;

const imageFrameSchema = mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  imageURL: {
    type: String,
    required: false,
    validate: [
      function (input) {
        return (
          input.length > 0 || (this.text.length > 0 && this.title.length > 0)
        );
      },
      "ImageURL must be given if title and text is empty",
    ],
  },
  text: {
    type: String,
    required: false,
  },
});

const userschema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: [
      PASSWORDLENGTH,
      `Passwords must have at least this many letters: ${PASSWORDLENGTH}`,
    ],
  },
  imageFrames: [imageFrameSchema],
});

userschema.pre("save", hashPassword);

userschema.statics.login = login;
userschema.methods.changeUserRole = changeUserRole;
userschema.methods.randomUser = randomUser;

/**
 * @param {*} username of the user to log in
 * @param {*} password of the user to log in
 * @returns the user if credentials is successfully validated or null in any other case.
 */
async function login(username, password) {
  let loginresult = null;
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) loginresult = user;
  }
  return loginresult;
}

async function hashPassword(next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
}

/**
 * This function returns a randomly selected user from the database.
 * It uses the mongodb $sample aggregation pipeline operator to select a random document from the collection.
 * The $sample operator selects a single document from its input collection or index.
 * The size option specifies the number of documents to return.
 * @returns {Promise<Object>} A promise that resolves to a randomly selected user object.
 */
async function randomUser() {
  // Use the $sample aggregation pipeline operator to select a random document from the collection
  // The size option specifies the number of documents to return, which is set to 1 in this case
  return this.aggregate([{ $sample: { size: 1 } }]).pretty();
}
/**
 * This function downgrades users by default. This is to ensure that any upgrade is
 * an explicit choice.
 * @param {Boolean} isDowngrade if false, will upgrade
 */
async function changeUserRole(isDowngrade = true) {
  let updatedUser = null;
  if (isDowngrade) {
    this.role = "user";
  } else {
    this.role = "admin";
  }
  try {
    updatedUser = await this.save();
  } catch (error) {
    throw error;
  }
  return updatedUser;
}
const User = mongoose.model("user", userschema);

module.exports = User;
