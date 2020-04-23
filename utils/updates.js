const { dbQuery } = require('../db/dbQuery');


let sumUpdateQuery = `INSERT INTO 
summary(name, totalCases, activeCases, discharged, deaths, changeTotal, changeActive, changeDischarged, changeDeaths, date, test)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;

let tickUpdateQuery =`INSERT INTO 
ticks(name, totalCases, activeCases, discharged, deaths, changeTotal, changeActive, changeDischarged, changeDeaths, date)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;



const updateTickTable = async(newData) => {
    try {
        for (let row of newData){
            let params = [row['name'], row['totalcases'], row['activecases'],  row['discharged'], row['deaths'], row['changetotal'], row['changeactive'], row['changedischarged'],  row['changedeaths'],  row['date']];

            await dbQuery(tickUpdateQuery, params);
        }

    } catch (error) {
        console.log(error);
    }

}

const updateSumTable = async(row) => {
    let params = [row['name'], row['totalcases'], row['activecases'],  row['discharged'], row['deaths'], row['changetotal'], row['changeactive'], row['changedischarged'],  row['changedeaths'],  row['date'], row['tests']];

    try {
         await dbQuery(sumUpdateQuery, params)

    } catch (error) {
        console.error(error);
    }

}

module.exports = { updateSumTable, updateTickTable }