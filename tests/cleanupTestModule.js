require('dotenv').config();
const app = require('express')();
const RefreshToken = require('../models/RefreshToken');
const {startScheduler} = require('../services/scheduler');
const dbhandler = require('../handlers/dbhandler');


app.listen(5000, async ()=>{
    await setupForTesting(23022);
    startScheduler(31,17);
})

//Create tokens and test the cleanup function
async function setupForTesting(numberoftokens=2000){
    console.log('starting cross insemination!')
    let docsInserted=0;
    try {
        await dbhandler.mongoConnect(process.env.DBURI)
        for(let i=0; i < numberoftokens; ++i){
            await RefreshToken.create({jwt:"falsetoken", cryptotoken: "alkjdafkjødfa", expireTime: Date.now()});
            docsInserted++;
        }
    } catch(error){
        console.log('error')
    } finally {
        console.log(`inserted ${docsInserted} into the database`)
    }
}

module.exports={setupForTesting}