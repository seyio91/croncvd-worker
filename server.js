const cron = require('node-cron');
const { init } = require('./utils/init')
const updateData = require('./utils/app')


init()
    .then(data => {
        console.log('Cron Worker Process Running');
        cron.schedule('0 */6 * * *', () => {
            console.log('Checking For Updates on server');
            updateData()
                .then(console.log('done'))
        })
});
