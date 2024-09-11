const fs = require('fs')
const { createFile, dataFetch } = require('./utills');
const { pipeline } = require('stream').promises
const csvtojson = require("csvtojson");
const { Transform } = require('stream');
const { randomUUID } = require('crypto')
const { Throttler } = require('./throatle')


const transforms = new Transform({
    objectMode: true,
    transform(chunks, encoding, callback) {
        const values = JSON.parse(chunks.toString());
        values.uuid = randomUUID()
        values.toString()
        callback(null, values)
    }
})

const throtle = new Throttler({objectMode : true ,rateLimit : 10 })

const write = () => {
    const write = createFile()
}

// write()

const mainStreams = async () => {
    try {
        const createReadStream = fs.createReadStream('input.csv');
        let count = 0
        await pipeline(createReadStream, csvtojson(), transforms ,async function* (data) {
            for await (const chunks of data) {
                console.log(`processing : ${++count} and time : ${performance.now()}`);
                const response = await dataFetch(chunks)
                if(!response == 200){
                    return new Error('Internal_ServerError...!')
                }
            }
        })
    } catch (e) {
        e.message = `Too many requests, please try again later...!`
        console.log(`Error :`, e.message);
    }
}

mainStreams()