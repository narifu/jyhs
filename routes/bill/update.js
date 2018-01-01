const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update bill set supplier_id='${request.payload.supplier_id}', effort_date='${request.payload.effort_date}', name='${request.payload.name}',contacts='${request.payload.contacts}',phone='${request.payload.phone}',description='${request.payload.description}' where id=${request.payload.id}`;
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
        description: '根据ID更新团购清单',
        validate: {
            payload: {
                name: Joi.string().required().min(2).max(100),
                contacts: Joi.string().required().min(2).max(20),
                phone: Joi.string().required().min(2).max(20),
                description: Joi.string(),
                user_id: Joi.number().required(),
                effort_date:Joi.number().required(),
                supplier_id:Joi.number().required(),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from bill where id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id === request.payload.user_id || 0 === request.payload.user_id) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您没有权限更新这个单子'));
                        }
                    });
                }
            }
        ]
    }
};

