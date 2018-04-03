const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/check/detail',
    method: 'POST',
    handler(request, reply) {
        const insert = `select sum(bill_detail_num) count ,b.numbers,b.name  from cart_detail c ,bill_detail b,cart ca  where ca.id=c.cart_id and  c.bill_detail_id = b.id and c.bill_detail_id=${request.payload.bill_detail_id} and ca.group_bill_id=${request.payload.group_bill_id}`;
        request.app.db.query(insert, (err, res) => {
            if (err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if ((Number(res[0]["count"])) == Number(res[0]["numbers"]) || (Number(res[0]["count"])+ request.payload.bill_detail_num) > Number(res[0]["numbers"])) {
                    reply(Boom.notAcceptable(res[0]['name'] + '  库存不足'));
                } else {
                    reply(config.ok);
                }
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据购物车id更新购物车明细',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
                group_bill_id: Joi.number().required(),
                bill_detail_num: Joi.number().required(),
            }
        },
        pre: [{
            method(request, reply) {
                const select = `select count(1) count from cart where id=${request.payload.cart_id}`;
                request.app.db.query(select, (err, res) => {
                    if (err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else if (res && res[0].count === 0) {
                        reply(Boom.notAcceptable('请先创建购物车'));
                    } else {
                        reply(true);
                    }
                });
            }
        }]
    }
};