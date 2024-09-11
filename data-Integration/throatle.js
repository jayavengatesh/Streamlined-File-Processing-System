const { Module } = require('module');
const { Transform } = require('stream');

module.exports.Throttler = class  extends Transform {
    constructor({ objectMode, rateLimit }) {
        super({ objectMode });
        this.rateLimit = rateLimit;
        this.rateCount = 0;
    }

    _transform(chunk, encoding, callback) {
        if (this.rateCount >= this.rateLimit) {
            setTimeout(() => {
                this.rateCount = 0;
                callback(null, chunk);
            }, 2000);
        } else {
            ++this.rateCount;
            callback(null, chunk);
        }
    }
}


