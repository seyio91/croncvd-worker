const client = require('./redisClient')
const scraper = require('./scraper')
const moment = require('moment')
const { isEmpty, defaultObj, getRedisObj, getObject, redisSet } = require('./helpers')


async function main(){

    let newView = [];

    let states = await getRedisObj('states');
    // for production
    let scraperData = await scraper()
    let current = scraperData.data
    let summaryTotal = scraperData.summary
    // remove after test
    // let current = await getRedisObj('current')
    let lastView = await getRedisObj('lastview')

    // To check if there are any changes
    let dataChanges = false;

    // Check New Date
    let newDay = false;

    let lastRun = await client.get('lasttimestamp')
    if (!lastRun){
        lastRun = moment().format();
    }
    lastRun = moment(lastRun)
    const currentTime = moment()
    let diffTime = currentTime.diff(lastRun, 'day')

    if (diffTime > 0){
        // baseline = lastView;
        await client.set('baseline', JSON.stringify(lastView))
        

        //update baseline for each State
        //set date update to true, to avoid another for loop
        newDay = true;
        // Save to redis
        // Update Last Run to CurrentTime.
        lastRun = currentTime.format();
        await client.set('lasttimestamp', lastRun)
    }


    for (let data of states){        
        // returned from database // using redis for now
        //get last data for each state
        let lastData = await getRedisObj(`${data}-lastview`)

        let baselineData;

        //if its a new day, set previous data to the new baseline
        if (newDay){

            baselineData = lastData;

        } else {
            baselineData = await getRedisObj(`${data}-baseline`)
        }
        
        
        // Get State Data from scraped content
        let currentData = getObject(data, current)


        // Do error checking here to deal if values are empty or in the case removed from NCDC Site. Equate All values to zero
        if (isEmpty(baselineData)){
            baselineData = defaultObj(data);
            await redisSet(`${data}-baseline`, baselineData);
        }
        
        if (isEmpty(currentData)) {
            currentData = defaultObj(data);
        }
        
        if (isEmpty(lastData)){
            lastData = defaultObj(data);
            await redisSet(`${data}-lastview`, lastData);
        }

        //check if there is a difference for each state.
        let changeTotal = currentData['totalCases'] - lastData['totalCases']
        let changeActive = currentData['activeCases'] - lastData['activeCases']
        let changeDischarged = currentData['discharged'] - lastData['discharged']
        let changeDeaths = currentData['deaths'] - lastData['deaths']


        if (changeTotal > 0 ||
            changeActive > 0 ||
            changeDischarged > 0 ||
            changeDeaths > 0 ) {
                // let System know there is a change for push updates later
                dataChanges = true
                // calculate change from baseline
                currentData['changeTotal'] = currentData['totalCases'] - baselineData['totalCases']
                currentData['changeActive'] = currentData['activeCases'] - baselineData['activeCases']
                currentData['changeDischarged'] = currentData['discharged'] - baselineData['discharged']
                currentData['changeDeaths'] = currentData['deaths'] - baselineData['deaths']

        } else {
                // default the change to last update
                currentData['changeTotal'] = lastData['changeTotal']
                currentData['changeActive'] = lastData['changeActive']
                currentData['changeDischarged'] = lastData['changeDischarged']
                currentData['changeDeaths'] = lastData['changeDeaths']
        }

        // Calculate Summary. first half can be scraped off ncdc site
        // summaryTotal['totalCases'] += currentData['totalCases']
        // summaryTotal['totalActive'] += currentData['activeCases']
        // summaryTotal['totalDischarged'] += currentData['discharged']
        // summaryTotal['totalDeath'] += currentData['deaths']
        summaryTotal['changeTotal'] += currentData['changeTotal']
        summaryTotal['changeActive'] += currentData['changeActive']
        summaryTotal['changeDischarged'] += currentData['changeDischarged']
        summaryTotal['changeDeaths'] += currentData['changeDeaths']

        // push to list for newView
        newView.push(currentData)

        // reset each lastview
        await redisSet(`${data}-lastview`, currentData);
    }

    newDay = false

    // do some action here
    if (dataChanges){
        console.log('change occured, Sending Publish Event')

        // Create new object to be returned.
        let publishdata = { summary: summaryTotal, data: newView }

        // Publish to redis client. Note to remove event
        await client.publish('UPDATED_VIEW', JSON.stringify(publishdata))

        // Save Published Events
        await redisSet('lastview', newView)

        await redisSet('lastSummary', summaryTotal)
        // change data back to false
        dataChanges = false;
    }

    return { summary: summaryTotal, data: newView }
    
}

module.exports = main