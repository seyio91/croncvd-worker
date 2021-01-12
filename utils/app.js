const client = require('./redisClient')
const scraper = require('./scraper')
const moment = require('moment')
const { isEmpty, defaultObj, getRedisObj, getObject, redisSet } = require('./helpers')
const { updateSumTable, updateTickTable } = require('./updates')

async function main(){

    try {
        let newView = [];

        let scraperData = await scraper();
        let current = scraperData.data;
        let summaryTotal = scraperData.summary;
        let lastView = await getRedisObj('lastview');
        let baseline = await getRedisObj('baseline');
        let lastSummary = await getRedisObj('lastSummary')
    
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

            // check for change
            baselineData['totalcases'] = currentData['totalcases'] < baselineData['totalcases'] ? currentData['totalcases'] : baselineData['totalcases'];
            baselineData['activecases'] = currentData['activecases'] < baselineData['activecases'] ? currentData['activecases'] : baselineData['activecases'];
            baselineData['discharged'] = currentData['discharged'] < baselineData['discharged'] ? currentData['discharged'] : baselineData['discharged'];
            baselineData['deaths'] = currentData['deaths'] < baselineData['deaths'] ? currentData['deaths'] : baselineData['deaths'];
    
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
                    currentData['changetotal'] = lastData['changetotal'];
                    currentData['changeactive'] = lastData['changeactive'];
                    currentData['changedischarged'] = lastData['changedischarged'];
                    currentData['changedeaths'] = lastData['changedeaths'];
            }
    
            newView.push(currentData)
        }
        summaryTotal['changetotal'] = summaryTotal['totalcases'] - lastSummary['totalcases'];
        summaryTotal['changeactive'] = summaryTotal['activecases'] - lastSummary['activecases'];
        summaryTotal['changedischarged'] = summaryTotal['discharged'] - lastSummary['discharged'];
        summaryTotal['changedeaths'] = summaryTotal['deaths'] - lastSummary['deaths'];
    
        await redisSet('lastview', newView);
        await redisSet('currentSummary', summaryTotal);
    
        let lastRun = await client.get('lastimestamp');
        
        if (!lastRun) lastRun = moment().format();
    
        lastRun = moment(lastRun)
        const currentTime = moment();
        let diffTime = currentTime.diff(lastRun, 'day');
    
    
        // check different between last Update and now. if its a new day and after 3am
        if (diffTime > 0 && moment().isAfter(moment({ hour:3, minute: 0 }))){
    
            await redisSet(`baseline`, newView);

            await client.set('lastSummary', JSON.stringify(summaryTotal));
    
            dbSave = moment().subtract(1, 'day').format('YYYY-MM-DD')
            
            await updateSumTable(summaryTotal, dbSave);
    
            await updateTickTable(newView, dbSave);
    
            lastRun = currentTime.format("YYYY-MM-DD");
    
            await client.set('lastimestamp', lastRun);
        }
    
    
        // Fires if there was any change in data 
        if (dataChanges){
            console.info('New Updates on NCDC, Firing Publish Event');
    
            let publishdata = { summary: summaryTotal, data: newView };

            await client.setex('overview',86400, JSON.stringify(publishdata))
    
            await client.publish('UPDATED_VIEW', JSON.stringify(publishdata));
            
            dataChanges = false;
        }
    
        return { summary: summaryTotal, data: newView };

    } catch (error) {
        console.error({error: error, message: `Error Updating Page at ${moment()}`})
    }
}
module.exports = main;