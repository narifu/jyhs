const Boom = require('boom');

module.exports = {
    path: '/api/material/level',
    method: 'GET',
    handler(request, reply) {
        const category = [
            {"code":"ry","name":"容易","desc":""},
            {"code":"yb","name":"一般","desc":""},
            {"code":"kn","name":"困难","desc":""},
            
        ]
        reply(category);
    },
    config: {
        description: '获得生物种类'
    }
};
