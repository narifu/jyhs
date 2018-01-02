const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/get/groupId/userId',
    method: 'GET',
    handler(request, reply) {
        const select = `select c.*,(select name from user where id=c.user_id) user_name from cart c where status=1 and group_bill_id=${request.query.group_bill_id} `;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res);
            }
        });
    },
    config: {
        description: '获得团购单ID和用户ID获取购物车',
        validate: {
            query: {
                group_bill_id: Joi.number().required(),
                user_id: Joi.number().required()
            }
        },

        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from group_bill where id=${request.query.group_bill_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.query.user_id) {
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
