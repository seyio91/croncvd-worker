const client = require('./redisClient')

const getObject = (key, list) => {
    for (let i=0; i < list.length; i++){
        if (list[i].name == key){
            return list[i]
        }
    }
    return {}
}

async function redisSet(key, data){
    await client.set(key, JSON.stringify(data))
}

async function getRedisObj(object){
    let result = await client.get(object);
    return JSON.parse(result)
}

function defaultObj(name){
    initalObj = {
        name,
        totalCases: 0,
        activeCases: 0,
        discharged: 0,
        deaths: 0,
        changeTotal: 0,
        changeActive: 0,
        changeDischarged: 0,
        changeDeaths: 0
      }
    return initalObj;
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    isEmpty,
    defaultObj,
    getRedisObj,
    getObject,
    redisSet
}