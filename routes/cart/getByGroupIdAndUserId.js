const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/get/groupIdAndUserId',
    method: 'GET',
    handler(request, reply) {
        const select = `select c.*,(select name from user where id=c.user_id) user_name from cart c where  group_bill_id=${request.query.group_bill_id} and c.user_id=${request.query.user_id}`;
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
        description: '获得团购单ID和用户ID获取购物车列表',
        validate: {
            query: {
                group_bill_id: Joi.number().required(),
                user_id: Joi.number().required()
            }
        }
    }
};
