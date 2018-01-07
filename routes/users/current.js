const config = require('../../config.js');
const moment = require('moment')
module.exports = {
    path: '/api/users/current',
    method: 'GET',
    handler(request, reply) {
            reply(request.auth.credentials);
    },
    config:{
        auth: 'jwt',
        description: '获得当前用户信息'
    }
};
