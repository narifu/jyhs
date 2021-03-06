const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/count',
    method: 'GET',
    handler(request, reply) {
        const select = `select sum(d.bill_detail_num*b.price) sum from cart c,cart_detail d,bill_detail b where c.id=d.cart_id and d.bill_detail_id=b.id and c.id=${request.query.id} `;
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
        description: '获得ID获取购物车价格',
        validate: {
            query: {
                id: Joi.number().required(),
            }
        },
    }
};
