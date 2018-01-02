const Boom = require('boom');

module.exports = {
    path: '/api/tools/yesno',
    method: 'GET',
    handler(request, reply) {
        const category = [
            {"code":"0","name":"否","desc":""},
            {"code":"1","name":"是","desc":""},
        ]
        reply(category);
    },
    config: {
        description: '获得是否'
    }
};
