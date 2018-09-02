const crypto = require('crypto');

module.exports = function sha1(data) {
    var generator = crypto.createHash('sha1');
    generator.update(data);
    return generator.digest('hex');
}