# API - LOGIN DEMO

This repositary contains basic code for demonstrational purposes. It contains some routes that require authentication, and some that require authorization.
It requires access to a mongo database, but should be easy enought to reconfigure for other dbs.

## Apropos .env

- DBURI must have a value directing it to a mongo database
- JWTSECRET must have a value. Any value will do; security is your concern

## Apropos redis

This app uses redis to handle banned accesstokens and is configured to connect to redis locally on the host machine. Should
you need access redis anywhere else, be sure modify "./handlers/redishandler.js" and "./apiserver.js"
