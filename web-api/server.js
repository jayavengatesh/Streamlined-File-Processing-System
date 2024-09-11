const express = require('express');
const fs = require('fs');
const app = express();
const { Transform } = require('stream')
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const csvtojson = require('csvtojson')


app.use(express.json());
app.use(morgan('combined'))

const limiter = rateLimit({
    windowMs: 1000, // 15 minutes
    limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
// app.use(limiter)


const transform = new Transform({
    objectMode: true,
    transform(chunks, encoding, callback) {
        const values = chunks.toString();
        const result = JSON.parse(Buffer.from(values));
        console.log(result);

        callback(null, values);
    },
});



// File Writing Route
app.post('/files', async (req, res, next) => {
    try {
        const values = req.body;  // Assuming this is a string or buffer suitable for writing
        const dataWrittable = JSON.stringify(values) + '\n'
        const writeStreams = fs.createWriteStream('output.txt', { flags: 'a' });

        if (!writeStreams.write(dataWrittable)) {
            await new Promise((resolve) => writeStreams.once('drain', resolve));
        }

        writeStreams.end();

        writeStreams.on('finish', () => {
            res.send('File has been written successfully');
        });

        writeStreams.on('error', (err) => {
            next(err);
        });

    } catch (err) {
        console.log(`error :`, err);

        next(err); // Pass any synchronous errors to the error handling middleware
    }
});


app.post('/upload', async (req, res) => {

    const createWriteStream = fs.createWriteStream('database.csv');

    req.pipe(csvtojson())
        .pipe(createWriteStream);

    createWriteStream.on('drain', () => {
        const written = parseInt(createWriteStream.bytesWritten);
        const total = parseInt(req.headers['content-length']);
        const pWritten = ((written / total) * 100).toFixed(2);
        console.log(`Processing  ...  ${pWritten}% done`);
    });

    createWriteStream.on('error', (error) => {
        if (error) {
            return res.status(400).send('Error While Writing File...!');
        }
    });

    createWriteStream.on('finish', () => {
        console.log('File writing finished!');
        res.status(200).send('File received successfully');
    });


});


app.use((error, req, res, next) => {
    if (error) {
        error.status = 501;
        res.status(error.status).send({ message: error.message });
    } else {
        next();
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
