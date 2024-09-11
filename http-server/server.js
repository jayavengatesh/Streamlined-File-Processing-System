const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const multer = require('multer')
const { Readable, Transform, PassThrough } = require('stream')

const { pipeline } = require('stream/promises')
const http = require('http');
const fs = require('fs')
const csvtojson = require('csvtojson')
const axios = require('axios')


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


function fileFilter(req, file, cb) {
    const type = req.file.mimetype;
    if (type !== 'text/csv') {
        const error = new Error()
        error.message = 'csv File formats only allowed!'
        error.status = 400
        cb(error)
    } else {
        cb(null, true)
    }
}


app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));




app.post('/uploads', upload.single('file'), fileFilter, async (req, res, next) => {
    try {
        // converts code into readables streams 
        console.log(`request :`, req.file);

        const passThroughStream = new PassThrough();
        passThroughStream.end(req.file.buffer);
        const response = await axios({
            method: 'post',
            url: 'http://localhost:3000/upload',
            data: passThroughStream,
            headers: {
                'Content-Type': 'application/octet-stream', // Send as stream
                'Content-Length': req.file.size
            },
            maxBodyLength: req.file.size,
        });
        if(response.status == 200 ){
            res.status(response.status).send({message : 'File Written successfully...!'});
        }

    } catch (e) {
        console.error(e)
        next(e)
    }
});


app.use((err, req, res, next) => {
    if (err) {
        console.error('Error:', err);
        console.error('Error status:', err.status);

        const statusCode = err.status || 500;
        const message = statusCode === 500
            ? 'Internal Server Error...!'
            : err.message;

        res.status(statusCode).send({ message });
    } else {
        next();
    }
});



app.listen(8000, () => {
    console.log(`server listening on 8000...!`);
})