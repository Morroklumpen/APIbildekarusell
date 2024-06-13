//
require("dotenv").config();

// cleanup
const appEventHandler = require("./handlers/appEventHandler");

//  verdens mest brukte rammeverk express
const express = require("express");
const app = express();

// routes!
const user_api = require("./routes/api_user_routes");

// vedlikehold hiver ut sesjoner som har gått ut på tid via redis
const { startScheduler } = require("./services/scheduler");

// redis (håndtering av sesjoner (session management))
const { enableRedis } = require("./handlers/redishandler");

// mongodb (NoSQL database)
const { mongoConnect } = require("./handlers/dbhandler");

// default values se .env filen
const PORT = process.env.PORT || 3000;
const DBURI = process.env.DBURI || "";

//setup bodyparsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// kobbler Express og routes
app.use(user_api);

app.listen(PORT, () => {
  console.log(`Revving engine...`);
  console.log(
    `Server started at port ${PORT}\n------------------------------------`
  );

  mongoConnect(DBURI);

  enableRedis();

  startScheduler();
});
