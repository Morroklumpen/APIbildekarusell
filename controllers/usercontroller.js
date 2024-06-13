//Created by: Geir Hilmersen
//5 May 2024 Geir Hilmersen

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

const {
  accessDenied,
  notAuthorized,
  createFeedback,
  resourceNotFound,
  internalServerError,
} = require("../handlers/feedbackHandler");
const { response } = require("express");

/**
 * createuser
 * @param {*} req
 * @param {*} res
 */
const createuser = async (req, res) => {
  const { username, password } = req.body;
  let feedback = createFeedback(404, `${username} could not be created.`);

  if (typeof username !== "undefined" && typeof password !== "undefined") {
    try {
      const result = await User.create({ username, password });
      if (result) {
        const { _id } = result;
        feedback = createFeedback(200, `${username} was created!`, true, {
          _id,
        });
      }
    } catch (error) {
      console.log("error creating user", error);

      feedback = createFeedback(
        409,
        `${username} could not be created: ${error}`,
        false,
        error
      );
    }
  }
  res.status(feedback.statuscode).json(feedback);
};

const upgradeuser = async (req, res) => {
  const { username, isDowngrade } = req.body;
  let feedback = createFeedback(404, "Faulty inputdata!");
  try {
    let targetUser = await User.findOne({ username });
    const updateduser = await targetUser.changeUserRole(isDowngrade);

    if (updateduser) {
      feedback = createFeedback(200, "Success", true, {
        username: updateduser.username,
        role: updateduser.role,
      });
    } else {
      feedback = internalServerError();
    }
  } catch (error) {
    feedback = resourceNotFound();
  }
  res.status(feedback.statuscode).json(feedback);
};

const deleteuser = async (req, res) => {
  const { username } = req.body;
  let feedback = createFeedback(404, `User ${username} could not be deleted`);
  if (typeof username !== "undefined") {
    try {
      const result = await User.findOneAndDelete({ username });
      if (result) {
        feedback = createFeedback(
          200,
          `${username} was deleted!`,
          true,
          result
        );
      }
    } catch (error) {
      console.log("error!");
    }
  }
  res.status(feedback.statuscode).json(feedback);
};

const logoutuser = async (req, res) => {
  let feedback = createFeedback(404, "user not found!");
  const { user } = req.body;
  if (user) {
    feedback = createFeedback(
      200,
      `${user.username} has been logged out!`,
      true
    );
  }
  res.status(feedback.statuscode).json(feedback);
};

/**
 * loginuser
 * @param {*} req
 * @param {*} res
 */
const loginuser = async (req, res) => {
  const { username, password } = req.body;
  console.log("loginuser user/pw:", username, password);
  let feedback = accessDenied();
  const user = await User.login(username, password);

  if (user) {
    const { _id } = user;
    //expiration: one hour
    const accessToken = generateAccessToken(_id);
    const refreshToken = await generateRefreshToken(_id);

    if (refreshToken) {
      feedback = createFeedback(
        200,
        `${username} was authenticated`,
        true,
        {
          accessToken,
          refreshToken,
        },
        username
      );
    } else {
      feedback = internalServerError();
    }
  }
  res.status(feedback.statuscode).json(feedback);
};

/**
 * This controller checks for req.body.refreshToken, looks up the token in the corresponding
 * database and checks if it is valid. If it is valid, it authenticates the user and sends
 * a new accesstoken.
 */
const refreshUser = async (req, res) => {
  const { _id } = req.body.user;
  const accessToken = generateAccessToken(_id);
  const feedback = createFeedback(200, "Token refreshed!", true, {
    accessToken,
  });

  res.status(feedback.statuscode).json(feedback);
};

/**
 * getRandomQuote
 * @param {*} req
 * @param {*} res
 */
const getRandomQuote = async (req, res) => {
  //const { user } = req.body;
  let feedback = createFeedback(404, "Faulty inputdata");

  try {
    // const rndUser = await User.aggregate([{ $sample: { size: 1 } }]);
    const rndUsers = await User.aggregate([
      {
        $match: {
          quotes: {
            $exists: true,
            $ne: [],
          },
        },
      },
      {
        $sample: {
          size: 1,
        },
      },
    ]);

    // check if user has quotes
    if (rndUsers.length === 0 || rndUsers[0].quotes.length === 0) {
      sendresponse(res, createFeedback(404, "No quotes found in the database"));
      return;
    }
    const rndUser = rndUsers[0];

    // get random quote
    const rndQuote =
      rndUser.quotes[Math.floor(Math.random() * rndUser.quotes.length)];

    // create feedback
    feedback = createFeedback(
      200,
      "Random quote found in the database",
      true,
      rndQuote
    );
  } catch (err) {
    console.log(err);
    feedback = createFeedback(500, "Internal server error");
  }

  // send response
  sendresponse(res, feedback);
};

/**
 * getMyQuotes
 * @param {*} req
 * @param {*} res
 **/

const getMyImageFrames = async (req, res) => {
  console.log("getMyImageFrames");
  const { user } = req.body;

  let feedback = createFeedback(404, "Faulty inputdata");
  if (typeof user !== "undefined") {
    const imageFrames = user.imageFrames;
    try {
      feedback = createFeedback(
        200,
        " Image frames found in the database: " + imageFrames.length,
        true,
        imageFrames,
        user.username
      );
    } catch (err) {
      console.log(err);
      feedback = createFeedback(500, "Internal server error");
    }
  }

  sendresponse(res, feedback);
};
/**
 * getUserQuotes
 * @param {*} req
 * @param {*} res
 **/

const getUserQuotes = async (req, res) => {
  const { username } = req.params;
  let feedback = createFeedback(404, "Faulty inputdata", false, [], username);
  const user = await User.findOne({ username: username });

  if (typeof username !== "undefined" && user != null) {
    const quotes = user.quotes;

    try {
      feedback = createFeedback(
        200,
        "Quotes found in the database for user " + username,
        true,
        quotes
      );
    } catch (err) {
      console.log(err);
      feedback = createFeedback(500, "Internal server error");
    }
  }

  sendresponse(res, feedback);
};

/**
 *
 * @param {*} req daskfj
 * @param {*} res
 */

const createimageframe = async (req, res) => {
  const { title, imageURL, text, user } = req.body;

  console.log(
    "createimageframe: ",
    "title:",
    title,
    "text:",
    text,
    "imageURL:",
    imageURL,
    "user:",
    user
  );

  let feedback = createFeedback(404, "Faulty inputdata");

  if (typeof user !== "undefined") {
    const newFrame = { title, imageURL, text };
    user.imageFrames.push(newFrame);
    try {
      const updatedFrame = await user.save();
      feedback = createFeedback(
        200,
        "Image Frame was inserted to the database",
        true,
        newFrame,
        user.username
      );
    } catch (err) {
      console.log("ERROR createimageframe: ", err.message);
      feedback = createFeedback(404, err.message, false, null, user.username);
    }
  }
  sendresponse(res, feedback);
};

/**
 * The function will look for title and description in the body of the request object.
 * If either of those variables is not present. Then a json object relaying the failure
 * will be rendered.
 */
const createtodo = async (req, res) => {
  const { title, description, user } = req.body;
  let feedback = createFeedback(404, "Faulty inputdata");

  if (
    typeof title !== "undefined" &&
    typeof description !== "undefined" &&
    typeof user !== "undefined"
  ) {
    const todo = { title, description };
    user.todos.push(todo);
    try {
      const updatedUser = await user.save();
      feedback = createFeedback(
        200,
        "Todo was inserted to the database",
        true,
        updatedUser.todos
      );
    } catch (err) {
      console.log(err);
      feedback = createFeedback(500, "Internal server error");
    }
  }
  sendresponse(res, feedback);
};

const removeQuote = async (req, res) => {
  let feedback = resourceNotFound();
  const { quote, user } = req.body;
  if (typeof quote === "string" && typeof user === "object") {
    user.quotes = user.quotes.filter((item) => {
      return item.quote !== quote;
    });

    try {
      const { quotes } = await user.save();
      feedback = createFeedback(200, "Quote was removed!", true, quotes);
    } catch (error) {}
  }

  sendresponse(res, feedback);
};

const removetodo = async (req, res) => {
  let feedback = resourceNotFound();
  const { title, user } = req.body;
  if (typeof title === "string" && typeof user === "object") {
    user.todos = user.todos.filter((item) => {
      return item.title !== title;
    });

    try {
      const { todos } = await user.save();
      feedback = createFeedback(200, "Reqested title is gone!", true, todos);
    } catch (error) {}
  }

  sendresponse(res, feedback);
};

function generateAccessToken(_id) {
  const cryptotoken = crypto.randomBytes(32).toString("hex");
  return jwt.sign({ _id, cryptotoken }, process.env.JWTSECRET, {
    expiresIn: "1h",
  });
}

//generates a refresh token that is valid for one week
async function generateRefreshToken(_id) {
  const expireDays = 7; //jwt token measure expire in days
  const expireTime = new Date(); //Mongodb handles expiry better if it is a date
  expireTime.setDate(expireTime.getDate() + expireDays);

  const cryptotoken = crypto.randomBytes(32).toString("hex");

  const refreshToken = jwt.sign({ _id, cryptotoken }, process.env.JWTSECRET, {
    expiresIn: `${expireDays}d`,
  });

  const result = await RefreshToken.create({
    jwt: refreshToken,
    cryptotoken,
    expireTime,
  });
  return refreshToken;
}

function sendresponse(response, feedback) {
  response.status(feedback.statuscode).json(feedback);
}

module.exports = {
  createimageframe,
  createtodo,
  removeQuote,
  createuser,
  loginuser,
  logoutuser,
  deleteuser,
  upgradeuser,
  refreshUser,
  getMyImageFrames,
  getRandomQuote,
  getUserQuotes,
};
