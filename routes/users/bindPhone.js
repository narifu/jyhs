const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/bind/phone',
    method: 'POST',
    handler(request, reply) {
        const insert = `update user set phone='${request.payload.phone}' where id=${request.payload.id}`;
        request.app.db.query(insert, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(config.ok);
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID更新用户',
        validate: {
            payload: {
                phone: Joi.string().required().max(11),
                id: Joi.number().required()
            }
        }
    }
};
