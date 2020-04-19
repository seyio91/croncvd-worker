const scraper = require('./scraper')
const client = require('./redisClient')



let states = [
    'Lagos',   'Abuja FCT',
    'Osun',      'Edo',     'Oyo',
    'Ogun',      'Bauchi',  'Kaduna',
    'Akwa Ibom', 'Katsina', 'Kwara',
    'Kano',      'Delta',   'Ondo',
    'Enugu',     'Ekiti',   'Rivers',
    'Benue',     'Niger',   'Anambra'
  ]

async function init(){
    // set States
    await client.set('states', JSON.stringify(states))

    // Check Summary
    // check if baseline is empty
    let baseline = await client.get('baseline');
    let scraperData = null;

    //checking for my empty summary
    // Need to check here and only scrape once for 3 

    if (!baseline){
        console.log('No Baseline Found, Should Check DB or Run from Scraped File')
        scraperData = await scraper();
        baseline = JSON.stringify(scraperData.data)
        await client.set('baseline', baseline)
    
        for (data of scraperData.data){
            let dataString = JSON.stringify(data)
            await client.set(`${data.name}-baseline`, dataString);
        }
    }

    // Check if Summary is Empty
    let lastSummary = await client.get('lastSummary')
    if (!lastSummary){
        if (scraperData == null){
            scraperData = await scraper();
            await client.set('lastSummary', JSON.stringify(scraperData.summary))
        } else {
            // to avoid scraping twice
            await client.set('lastSummary', JSON.stringify(scraperData.summary))
        }
    }


    // check if Last Data is empty
    let lastview = await client.get('lastview')
    if (!lastview){
        console.log('No LastView  Found, Should Check DB or Run from Scraped File')
        await client.set('lastview', baseline)
    }    

    
    return true


}

module.exports = { init }