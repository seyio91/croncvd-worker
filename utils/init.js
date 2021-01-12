const scraper = require('./scraper');
const client = require('./redisClient');
const { dbQuery } = require('../db/dbQuery');
const moment = require('moment');
const { defaultObj } = require('./helpers')
const { updateSumTable, updateTickTable } = require('./updates')

async function init(){
    try {
        let baseline = null;
        baseline = await client.get('baseline');
        let lastSummary = null;
        // Get scraped values;
        const { data, summary } = await scraper();

        // Get last time            
        const hours = await dbQuery(`SELECT date FROM ticks ORDER BY date DESC LIMIT 1`);
        let lastTime;

        if (hours.rowCount == 0){
            lastTime = moment().format('YYYY-MM-DD');
        } else {
            lastTime = moment(hours.rows[0].date).format('YYYY-MM-DD');
        }

        if (!baseline){
            console.log('No Baseline Found, Should Check DB or Run from Scraped File')
            
            try {
                const { rows } = await dbQuery(`SELECT * FROM ticks WHERE date = '${lastTime}'`);
                baseline = rows
            } catch (error) {
                console.log(error);
            }
            // if DB Returns Empty Rows. Scrape NCDC Page
            if (baseline.length == 0){
                baseline = data
            }
            await client.set('baseline', JSON.stringify(baseline))
        }

        // Check if Summary is Empty
        lastSummary = await client.get('lastSummary')
        if (!lastSummary){
            // Check if Object from Scraper is available, as it will contain summary data
            if (data == null){         
                try {
                    const { rows } = await dbQuery(`SELECT * FROM summary WHERE date = '${lastTime}' LIMIT 1`);
                    lastSummary = rows;
                } catch (error) {
                    console.error(error);
                }

                if (lastSummary != null || lastSummary.length != 0) {
                    lastSummary = lastSummary[0]
                } else{
                    lastSummary = summary;
                }

                await client.set('lastSummary', JSON.stringify(lastSummary));
            } else {
                // to avoid scraping twice
                await client.set('lastSummary', JSON.stringify(summary));
            }
        }


        // check if Last Data is empty
        let lastview = await client.get('lastview')
        if (!lastview){
            console.log('No LastView  Found, Setting Current Baseline to Last Data');
            await client.set('lastview', JSON.stringify(baseline));
        }
        
        // Check last update time
        let lastTimeStamp = await client.get('lastimestamp');
        if (!lastTimeStamp){
            // get from datebase or set to now
            console.log('No TimeStamp Found, Checking DB for Last Timedate Time')
            // checking DB
            try {
                const { rows } = await dbQuery(`SELECT date FROM summary ORDER BY date DESC LIMIT 1`);

                if (rows.length == 0){
                    lastTimeStamp = moment().format('YYYY-MM-DD');
                } else {
                    lastTimeStamp = moment(hours.rows[0].date).format('YYYY-MM-DD');
                }

                await client.set('lastimestamp', lastTimeStamp);
            } catch (error) {
                console.error(error);
            }
        }

        // Save Values to DB if empty //hrs.rowCOunt is 0
        if (hours.rowCount == 0){
            let savedObject = []
            // loop over scraped values
            for (value of data){
                savedValue = defaultObj(value)
                savedObject.push(savedValue)
            }

            summarySaved = defaultObj(summary)
            summarySaved['test'] = summary.test
            dbSave = moment().subtract(1, 'day').format('YYYY-MM-DD')
            await updateSumTable(summarySaved, dbSave);
    
            await updateTickTable(savedObject, dbSave);
        }

        
        return true


    } catch (error) {
        console.error({error: error, message: `Error Initializing Server at ${moment()}`})
        process.exit(1)
    }

}

module.exports = { init }
