const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment')


async function scraper(){
    try {
        let result = await axios("https://covid19.ncdc.gov.ng/");
        let page = result.data
        return getData(page)
    } catch (error) {
        // This should be later turned to a retry
        console.error({error: error, message: `Error Downloading NCDC Page at ${moment()}`})
    }
}

const reg = /\d+/g;

const getData = html => {
    const data = [];

    const summary = {
        name: 'Total',
        totalcases: 0,
        activecases: 0,
        discharged: 0,
        deaths: 0,
        changetotal: 0,
        changeactive: 0,
        changedischarged: 0,
        changedeaths: 0,
        test: 0,
        date: moment().format()
    };


    const $ = cheerio.load(html);

    const pageBlock = $("div.pcoded-content > .page-header > .page-block > .row");
    const pagetag = $(pageBlock).find('span')
    summary['test'] = numParse($(pagetag).text().trim());


    const rows = $("div.pcoded-content > .page-header > .row");
    let spanTags = $(rows[0]).find('span');

    summary['totalcases'] = numParse($(spanTags[0]).text().trim());
    summary['activecases'] = numParse($(spanTags[1]).text().trim());
    summary['discharged'] = numParse($(spanTags[2]).text().trim());
    summary['deaths'] = numParse($(spanTags[3]).text().trim());

    $("table#custom1 > tbody > tr").each((index, element) => {

        const tdTags = $(element).find("td");
        let name = $(tdTags[0]).text().trim()
        if(name !== '' && name !== 'Total'){
            data.push({
                name,
                'totalcases':numParse($(tdTags[1]).text().trim()),
                'activecases':numParse($(tdTags[2]).text().trim()),
                'discharged': numParse($(tdTags[3]).text().trim()),
                'deaths': numParse($(tdTags[4]).text().trim()),
                'changetotal': 0,
                'changeactive': 0,
                'changedischarged': 0,
                'changedeaths': 0,
                'date': moment().format()
            });
        }

    });

    return { summary, data }
}


const numParse = (string) => {
    // check number received
    if (isNaN(string)){
        val = string.match(reg);
        num = parseInt(val.join(""));
    } else {
        num = string
    }
    return parseInt(num)
}

// 
module.exports = scraper;