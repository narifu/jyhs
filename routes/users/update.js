const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const md5 = require('md5');

module.exports = {
    path: '/api/users/update',
    method: 'POST',
    handler(request, reply) {
        const insert = `update user set contacts='${request.payload.contacts}',province='${request.payload.province}', description='${request.payload.description}',address='${request.payload.address}',name='${request.payload.name}',city='${request.payload.city}',phone='${request.payload.phone}',type='${request.payload.type}',status='${request.payload.status}',point='${request.payload.point}' where id=${request.payload.id}`;
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
                name: Joi.string().required().min(1).max(20),
                province: Joi.string().required().max(20),
                city: Joi.string().required().max(20),
                phone: Joi.string().required().max(20),
                type: Joi.string().required().max(20),
                status: Joi.number().required(),
                point: Joi.number().required(),
                address: Joi.string().optional().default(" "),
                description: Joi.string().optional().default(" "),
                contacts: Joi.string().optional().default(" "),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const user = request.auth.credentials;
                    if(user && user.id == request.payload.id || user.type == 'yhgly') {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('权限不足'));
                    }
                }
            }
        ]
    }
};
