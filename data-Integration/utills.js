const fs = require('fs');
const axios  = require('axios');
const { Transform } = require('stream');

exports.randomNames = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = ''
    for (let i = 0; i < 6; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return randomString
}

exports.createFile = async () => {
    const createWriteStream = fs.createWriteStream('input.txt')
    for (let i = 0; i < 1000000; i++) {
        const names = exports.randomNames()
        const id = i + 1
        const values = `{ name :${names},id : ${id} }  \n`;
        if (!createWriteStream.write(values)) {
            await new Promise((resolve) => createWriteStream.once('drain', resolve))
        }
    }
    createWriteStream.end();
    createWriteStream.on('finish', () => {
        console.log(`writting finished ...!`);

    })
}


exports.dataFetch = async (data) => {
    const response = await  axios.post('http://localhost:3000/files',{
        body:data
    })
    return response.status
}


