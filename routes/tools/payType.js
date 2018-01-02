const Boom = require('boom');

module.exports = {
    path: '/api/tools/paytype',
    method: 'GET',
    handler(request, reply) {
        const category = [
            {"code":"zfb","name":"支付宝","desc":""},
            {"code":"wx","name":"微信","desc":""},
        ]
        reply(category);
    },
    config: {
        description: '获得支付类型'
    }
};
