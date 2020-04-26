const scraper = require('./scraper');
const client = require('./redisClient');
const { dbQuery } = require('../db/dbQuery');
const moment = require('moment');

async function init(){
    // Check Summary
    // check if baseline is empty
    let baseline = null;
    baseline = await client.get('baseline');
    let scraperData = null;
    let lastSummary = null;

    // Get last time            
    const hours = await dbQuery(`SELECT date FROM ticks ORDER BY date DESC LIMIT 1`);
    const lastTime = moment(hours.rows[0].date).format('YYYY-MM-DD');

    //checking for my empty summary
    // Need to check here and only scrape once for 3 

    if (!baseline){
        console.log('No Baseline Found, Should Check DB or Run from Scraped File')
        // checking DB
        try {
            const { rows } = await dbQuery(`SELECT * FROM ticks WHERE date = '${lastTime}'`);
            baseline = rows
        } catch (error) {
            console.log(error);
        }
        // if DB Returns Empty Rows. Scrape NCDC Page
        if (baseline.lenght == 0){
            scraperData = await scraper();
            baseline = scraperData.data
        }
        await client.set('baseline', JSON.stringify(baseline))
    }

    // Check if Summary is Empty
    lastSummary = await client.get('lastSummary')
    if (!lastSummary){
        // Check if Object from Scraper is available, as it will contain summary data
        if (scraperData == null){         
            try {
                const { rows } = await dbQuery(`SELECT * FROM summary WHERE date = '${lastTime}' LIMIT 1`);
                lastSummary = rows;
            } catch (error) {
                console.error(error);
            }

            if (lastSummary != null || lastSummary.lenght != 0) {
                lastSummary = lastSummary[0]
            } else{
                scraperData = await scraper();
                lastSummary = scraperData.summary;
            }

            await client.set('lastSummary', JSON.stringify(lastSummary));
        } else {
            // to avoid scraping twice
            await client.set('lastSummary', JSON.stringify(scraperData.summary));
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
            lastTimeStamp = moment(rows[0].date).format();

            await client.set('lastimestamp', lastTimeStamp);
        } catch (error) {
            console.error(error);
        }
    }

    
    return true


}

//init().then(data => console.log('done'))
module.exports = { init }
