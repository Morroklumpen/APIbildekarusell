const nodecron=require('node-cron');
const RefreshToken=require('../models/RefreshToken');

// Runs a daily cleanup of expired tokens. Neeeds to be expanded in case of more scheduled tasks
// Could implement a register and register(function);
function startScheduler(minutesOfDay='*', hourOfDay='*', dayOfMonth='*', month='*', dayOfWeek='*' ){
    //Call the cleanupfunction from the RefreshToken model
    const cronstring = `${minutesOfDay} ${hourOfDay} ${dayOfMonth} ${month} ${dayOfWeek}`;
    console.log("Starting schedule according to cronstring:",cronstring)
    nodecron.schedule(cronstring, ()=>{
        RefreshToken.cleanUpExpiredRefreshTokens(1000);
    });
}

module.exports={
    startScheduler
};