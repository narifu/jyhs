const captchapng = require('captchapng');
const LRU = require('lru-cache');
global.globalCahce = LRU({ maxAge: 1000 * 10 * 60 });
const util  = require("../../lib/util");
const Joi = require('joi');

module.exports = {
    path: '/api/tools/verification',
    method: 'GET',
    handler(request, reply) {
        const text = parseInt(Math.random()*9000+1000);
        const captcha = new captchapng(80,25,text);
        captcha.color(0, 0, 0, 0);
        captcha.color(80, 80, 80, 255);
        const img = captcha.getBase64();
        const imgbase64 = new Buffer(img,'base64');
        // const key = util.buildKey(request);
        const key = request.query.key;
        global.globalCahce.set(key, text);
        reply(imgbase64).type('image/png');
    },
    config: {
        description: '获得验证码',
        validate: {
            query: {
                key: Joi.string().required()
            }
        }
    }
};
