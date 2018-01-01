const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const md5 = require('md5');

module.exports = {
    path: '/api/users/changPassword',
    method: 'POST',
    handler(request, reply) {
        const update = `update user set password='${md5(request.payload.password)}' where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(config.ok);
            }
        });
    },
    config: {
        description: '根据ID修改用户密码',
        validate: {
            payload: {
                password: Joi.string().required().min(6).max(20),
                id: Joi.number().required()
            }
        }
    }
};
