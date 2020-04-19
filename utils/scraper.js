const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment')


async function scraper(){
    let result = await axios("https://covid19.ncdc.gov.ng/");
    let page = result.data
    return getData(page)
}

const getData = html => {


    const data = [];
    const summary = {
        totalActive: 0,
        totalDischarged: 0,
        totalDeath: 0,
        totalCases: 0,
        changeTotal: 0,
        changeActive: 0,
        changeDischarged: 0,
        changeDeaths: 0,
        updateTime: moment().format()
    };


    const $ = cheerio.load(html);

    $("table#custom1 > tbody > tr").each((index, elem)=>{
        const tdTags = $(elem).find("td");
        let value = numParse($(tdTags[1]).text().trim());
        if (index == 0){
            summary['testSum'] = $(tdTags[1]).text().trim();
        } else if (index == 1){
            summary['totalCases'] = value;
            summary['totalActive'] += value;
        } else if (index == 2){
            summary['totalDischarged'] = value;
            summary['totalActive'] -= value;
        } else if (index == 3){
            summary['totalDeath'] = value;
            summary['totalActive'] -= value;
        }
    })


    $("table#custom3 > tbody > tr").each((index, element) => {

        const tdTags = $(element).find("td");
        let name = $(tdTags[0]).text().trim()
        if(name !== '' && name !== 'Total'){
            data.push({
                name,
                'totalCases':numParse($(tdTags[1]).text().trim()),
                'activeCases':numParse($(tdTags[2]).text().trim()),
                'discharged': numParse($(tdTags[3]).text().trim()),
                'deaths': numParse($(tdTags[4]).text().trim()),
                'changeTotal': 0,
                'changeActive': 0,
                'changeDischarged': 0,
                'changeDeaths': 0
            });
        }

    });


    // data to return
    return { summary, data }
}


const numParse = (string) => {
    let num = parseInt(string)
    return isNaN(num) ? string : num
}

// scraper().then(console.log('done'))

module.exports = scraper;