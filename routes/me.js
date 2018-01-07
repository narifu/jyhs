const Boom = require('boom');

module.exports = {
    path: '/api/me',
    method: 'GET',
    handler(request, reply) {
        reply(request.auth.credentials);
    },
    config: {
        auth: 'jwt',
        pre: [
            {
                method(request, reply) {
                   if(request.headers["Authorization"]) {
                    reply(true);
                } else {
                    reply(Boom.notAcceptable('验证码不正确'));
                }
                }
            }
        ],
        description: 'Get current user details'
    }
};
