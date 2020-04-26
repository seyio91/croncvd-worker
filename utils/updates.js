const { dbQuery } = require('../db/dbQuery');


let sumUpdateQuery = `INSERT INTO 
summary(name, totalCases, activeCases, discharged, deaths, changeTotal, changeActive, changeDischarged, changeDeaths, date, test)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

let tickUpdateQuery =`INSERT INTO 
ticks(name, totalCases, activeCases, discharged, deaths, changeTotal, changeActive, changeDischarged, changeDeaths, date)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;



const updateTickTable = async(newData, dateString) => {
    try {
        console.log('updating tick table')
        for (let row of newData){
            let params = [row['name'], row['totalcases'], row['activecases'],  row['discharged'], row['deaths'], row['changetotal'], row['changeactive'], row['changedischarged'],  row['changedeaths'],  dateString];
            
            await dbQuery(tickUpdateQuery, params);
        }
        
        return
    } catch (error) {
        console.log(error);
        console.log('process will exit')
        process.exit(1)
    }

}

const updateSumTable = async(row, dateString) => {
    let params = [row['name'], row['totalcases'], row['activecases'],  row['discharged'], row['deaths'], row['changetotal'], row['changeactive'], row['changedischarged'],  row['changedeaths'],  dateString, row['test']];
    console.log('updating summary table')
    try {
         await dbQuery(sumUpdateQuery, params)
         return

    } catch (error) {
        console.error(error);
        process.exit(1);
    }

}

module.exports = { updateSumTable, updateTickTable }