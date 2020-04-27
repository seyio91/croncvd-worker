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
        console.error(error)
    }
}

const reg = /\d+/;

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

    $("table#custom1 > tbody > tr").each((index, elem)=>{
        const tdTags = $(elem).find("td");
        let value = numParse($(tdTags[1]).text().trim());
        if (index == 0){
            test = $(tdTags[1]).text().trim();
            summary['test'] = parseInt(test.match(reg))
        } else if (index == 1){
            summary['totalcases'] = value;
            summary['activecases'] += value;
        } else if (index == 2){
            summary['discharged'] = value;
            summary['activecases'] -= value;
        } else if (index == 3){
            summary['deaths'] = value;
            summary['activecases'] -= value;
        }
    })


    $("table#custom3 > tbody > tr").each((index, element) => {

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


    // data to return
    return { summary, data }
}


const numParse = (string) => {
    let num = parseInt(string)
    return isNaN(num) ? string : num
}

// scraper().then(data => console.log(data));


module.exports = scraper;