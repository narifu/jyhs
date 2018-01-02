
const Boom = require('boom');

module.exports = {
    path: '/api/material/compatibility',
    method: 'GET',
    handler(request, reply) {
        const category = [
            {"code":"jr","name":"兼容","desc":""},
            {"code":"bjr","name":"不兼容","desc":""},
        ]
        reply(category);
    },
    config: {
        description: '获得珊瑚缸兼容'
    }
};
