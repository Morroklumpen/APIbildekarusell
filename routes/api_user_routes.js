const router = require("express").Router();

//Importering av autentisering og autorisernings middleware som blir brukt i rutene under
const {
  authenticate,
  authenticateRefreshToken,
  invalidateTokens,
  authorizeAdmin,
} = require("../middleware/authorization");

//inportering av controllers/funksjoner som fex sletter noe eller utfører en handling.
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

//alle tjenestene apiet kan gjøre på ett sted.

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

// ekstra routs i tilfelle jeg trenger de på eksamen
router.delete("/remove-quote", authenticate, removeQuote);
router.delete("/delete-user", authenticate, authorizeAdmin, deleteuser);
router.patch("/create-admin", authenticate, authorizeAdmin, upgradeuser);

module.exports = router;
