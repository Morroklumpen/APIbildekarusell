const router = require("express").Router();
const {
  authenticate,
  authenticateRefreshToken,
  invalidateTokens,
  authorizeAdmin,
} = require("../middleware/authorization");

const {
  createuser,
  loginuser,
  logoutuser,
  createimageframe,
  getRandomUserImageFrame,
  removeQuote,
  deleteuser,
  upgradeuser,
  refreshUser,
  getMyImageFrames,
  getRandomImageFrame,
} = require("../controllers/usercontroller");

// all users

router.post("/get-imageframes", authenticate, getMyImageFrames);
router.post("/create-imageframe", authenticate, createimageframe);

router.get("/randomImageFrame", getRandomImageFrame);
router.get("/:username", getRandomUserImageFrame);

// router.get("/random", getRandomQuote);

//Authentication
router.post("/create-user", createuser);
router.post("/loginuser", loginuser);
router.post("/refreshuser", authenticateRefreshToken, refreshUser);
router.post("/logout", invalidateTokens, logoutuser);

//Protected routes
//router.post("/create-todo", authenticate, createtodo);
// router.post("/get-quote", authenticate, getMyQuotes);

router.delete("/remove-quote", authenticate, removeQuote);
router.delete("/delete-user", authenticate, authorizeAdmin, deleteuser);
router.patch("/create-admin", authenticate, authorizeAdmin, upgradeuser);

module.exports = router;
