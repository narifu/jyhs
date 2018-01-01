const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/checkName',
    method: 'GET',
    handler(request, reply) {
        const select = `select count(1) count from user where name='${request.query.name}';`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else if(res && res[0].count === 0) {
                reply(config.ok);
            } else {
                reply(Boom.notAcceptable('用户名已经存在'));
            }
        });
    },
    config: {
        description: '检查姓名是否重复',
        validate: {
            query: {
                name: Joi.string().required().min(3).max(20),
            }
        },
    }
};
