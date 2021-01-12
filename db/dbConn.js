const pool = require('./pool')

pool.on('connect', () => {
    console.log('Connected to Postgres DB');
})

const createTickTable = () => {
    const createTickQuery = `
        CREATE TABLE IF NOT EXISTS ticks
        (id SERIAL PRIMARY KEY,
            name VARCHAR (20) NOT NULL,
            totalCases INT NOT NULL,
            activeCases INT NOT NULL,
            discharged INT NOT NULL,
            deaths INT NOT NULL,
            changeTotal INT NOT NULL,
            changeActive INT NOT NULL,
            changeDischarged INT NOT NULL,
            changeDeaths INT NOT NULL,
            date DATE NOT NULL DEFAULT CURRENT_DATE
            )`;
        pool.query(createTickQuery)
            .catch(err => {
                throw err;
            })
}


const createTotalsTable = () => {
    const createTotalQuery = `
    CREATE TABLE IF NOT EXISTS summary
    (id SERIAL PRIMARY KEY,
        name VARCHAR (20) NOT NULL,
        totalCases INT NOT NULL,
        activeCases INT NOT NULL,
        discharged INT NOT NULL,
        deaths INT NOT NULL,
        changeTotal INT NOT NULL,
        changeActive INT NOT NULL,
        changeDischarged INT NOT NULL,
        changeDeaths INT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        test INT DEFAULT 0 NOT NULL
        )`;

        pool.query(createTotalQuery)
        .catch(err => {
            throw err;
        })
    
}

const createTables = () => {
    createTickTable();
    createTotalsTable();
};

pool.on('remove', () => {
    console.log('Closing Connection')
})

pool.on('error', (err) => {
    console.log(err);
    process.exit(1);
})


module.exports = createTables
