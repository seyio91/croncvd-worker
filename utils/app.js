const client = require('./redisClient')
const scraper = require('./scraper')
const moment = require('moment')
const { isEmpty, defaultObj, getRedisObj, getObject, redisSet } = require('./helpers')
const { updateSumTable, updateTickTable } = require('./updates')

async function main(){

    let newView = [];

    let scraperData = await scraper();
    let current = scraperData.data;
    let summaryTotal = scraperData.summary;
    let lastView = await getRedisObj('lastview');
    let baseline = await getRedisObj('baseline');

    let dataChanges = false;

    for (let currentData of current){
        let lastData = getObject(currentData.name, lastView);
        let baselineData = getObject(currentData.name, baseline);

        // Set Default to Zero if State is New
        if (isEmpty(lastData)){
            lastData = defaultObj(currentData.name);
        }

        if (isEmpty(baselineData)){
            baselineData = defaultObj(currentData.name);
        }

        //check if there is a difference for each state from the last time scraoer ran
        let changeTotal = currentData['totalcases'] - lastData['totalcases'];
        let changeActive = currentData['activecases'] - lastData['activecases'];
        let changeDischarged = currentData['discharged'] - lastData['discharged'];
        let changeDeaths = currentData['deaths'] - lastData['deaths'];

        // calculate new change if there is any
        if (changeTotal > 0 ||
            changeActive > 0 ||
            changeDischarged > 0 ||
            changeDeaths > 0 ) {
                // let System know there is a change for push updates later
                dataChanges = true;

                currentData['changetotal'] = currentData['totalcases'] - baselineData['totalcases'];
                currentData['changeactive'] = currentData['activecases'] - baselineData['activecases'];
                currentData['changedischarged'] = currentData['discharged'] - baselineData['discharged'];
                currentData['changedeaths'] = currentData['deaths'] - baselineData['deaths'];

        } else {
                // default the change to last scraped value if no change
                currentData['changetotal'] = lastData['changetotal'];
                currentData['changedctive'] = lastData['changeactive'];
                currentData['changedischarged'] = lastData['changedischarged'];
                currentData['changedeaths'] = lastData['changedeaths'];
        }

        // Calculate Summary. first half can be scraped off ncdc site
        // summaryTotal['totalCases'] += currentData['totalCases']
        // summaryTotal['totalActive'] += currentData['activeCases']
        // summaryTotal['totalDischarged'] += currentData['discharged']
        // summaryTotal['totalDeath'] += currentData['deaths']
        summaryTotal['changetotal'] += currentData['changetotal'];
        summaryTotal['changeactive'] += currentData['changeactive'];
        summaryTotal['changedischarged'] += currentData['changedischarged'];
        summaryTotal['changedeaths'] += currentData['changedeaths'];

        newView.push(currentData)

    }

    let lastRun = await client.get('lasttimestamp');
    
    if (!lastRun){

        lastRun = moment().format();
    }

    lastRun = moment(lastRun)
    const currentTime = moment();
    let diffTime = currentTime.diff(lastRun, 'day');

    // check different between last Update and now. if its a new day and after 5am
    if (diffTime > 0 && moment().isAfter(moment({ hour:5, minute: 0 }))){

        await redisSet(`baseline`, newView);

        await updateTickTable(newView);

        await updateSumTable(summaryTotal);

        lastRun = currentTime.format();

        await client.set('lasttimestamp', lastRun);
    }


    // Fires if there was any change in data 
    if (dataChanges){
        console.log('change occured, Sending Publish Event');

        let publishdata = { summary: summaryTotal, data: newView };

        await client.publish('UPDATED_VIEW', JSON.stringify(publishdata));

        await redisSet('lastview', newView);

        dataChanges = false;
    }

    return { summary: summaryTotal, data: newView };
    
}

module.exports = main;