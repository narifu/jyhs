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
        description: '根据ID更新用户',
        validate: {
            payload: {
                phone: Joi.string().required().max(11),
                auth: Joi.string().required().min(4),
                requestId: Joi.string().required(),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const text = global.globalCahce.get(request.payload.requestId)+"";
                    if(text&&text.toLowerCase() === request.payload.auth.toLowerCase()) {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('验证码不正确'));
                    }
                }
            },
        ]
    }
};
