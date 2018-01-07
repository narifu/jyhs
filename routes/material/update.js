const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update material set code='${request.payload.code}',level='${request.payload.level}',price='${request.payload.price}',compatibility='${request.payload.compatibility}',description='${request.payload.description}',name='${request.payload.name}',category='${request.payload.category}',type='${request.payload.type}',ename='${request.payload.ename}',sname='${request.payload.sname}',tag='${request.payload.tag}' where id=${request.payload.id}`;
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
        auth: 'jwt',
        description: '根据ID更新生物资料',
        validate: {
            payload: {
                category: Joi.string().required().min(2).max(20),
                type: Joi.string().required().min(2).max(20),
                name: Joi.string().required().min(2).max(20),
                ename: Joi.string().optional().allow(''),
                sname: Joi.string().optional().allow(''),
                tag: Joi.string().min(2).max(100),
                code: Joi.string().required().min(2).max(20),
                level: Joi.string().required().max(20),
                price: Joi.number().required(),
                compatibility: Joi.string().required(),
                description: Joi.string().required(),
                id: Joi.number().required()
            }
        }
    }
};
