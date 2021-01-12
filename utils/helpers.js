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

function defaultObj(object){
    initalObj = {
        name: object.name,
        totalcases: object.totalcases || 0,
        activecases: object.activecases || 0,
        discharged: object.discharged || 0,
        deaths: object.deaths || 0,
        changetotal: object.changetotal || 0,
        changeactive: object.changeactive || 0,
        changedischarged: object.changedischarged || 0,
        changedeaths: object.changedeaths || 0,
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