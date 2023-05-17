const config = require('../config/config');
var crypto = require("crypto");

module.exports = {
    response(res, flag, data = [], message = "", otherData = {}) {
        // return response
        res.json({
            flag,
            data,
            message: message ? message.replaceAll("\"", "'") : "",
            ...otherData
        });
    },

    currentDateTime(time = false) {
        const Current = new Date();
        var y = Current.getFullYear();
        var m = Current.getMonth() + 1;
        m = m > 9 ? m : "0" + m;
        var d = Current.getDate();
        d = d > 9 ? d : "0" + d;
        var H = Current.getHours();
        H = H > 9 ? H : "0" + H;
        var i = Current.getMinutes();
        i = i > 9 ? i : "0" + i;
        var s = Current.getSeconds();
        s = s > 9 ? s : "0" + s;

        return time ? `${y}-${m}-${d} ${H}:${i}:${s}` : `${y}-${m}-${d}`;
    },

    encrypt(text) {
        const key = Buffer.from(config.encryption_key);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    },

    decrypt(text) {
        const key = Buffer.from(config.encryption_key);
        const textParts = text.split(':');
        console.log('textParts', textParts)
        const iv = Buffer.from(textParts[1], 'hex');
        const encryptedText = Buffer.from(textParts[0], 'hex');

        // let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
};