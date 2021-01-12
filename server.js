const cron = require('node-cron');
const { init } = require('./utils/init')
const updateData = require('./utils/app')
const createTables = require('./db/dbConn');

// SetUp Database
createTables();

init()
    .then(data => {
        if (data) updateData().then(console.info('Initializing Worker Process'));

        console.log('Cron Worker Process Running');
        
        cron.schedule('0 */2 * * *', () => {
            console.log('Checking For Updates on server');
            updateData()
                .then(console.log('Success'))
        })
});
