const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/delete/detail',
    method: 'POST',
    handler(request, reply) {
        const delete_detail = `delete from bill_detail where id=${request.payload.bill_detail_id}`;
        request.app.db.query(delete_detail, (err, res) => {
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
        description: '根据ID删除团购清单明细',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                bill_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from bill where id=${request.payload.bill_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.payload.user_id || 0 == request.payload.user_id) {
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

