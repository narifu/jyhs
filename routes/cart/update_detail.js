const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/update/detail',
    method: 'POST',
    handler(request, reply) {
        const select = `delete from cart_detail where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const insert = `insert into cart_detail (cart_id,bill_detail_id,bill_detail_num) values (${request.payload.cart_id},${request.payload.bill_detail_id},${request.payload.bill_detail_num})`;
                request.app.db.query(insert, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply(config.ok);
                    }
                });
            }
        });
    },
    config: {
        description: '根据购物车id更新购物车明细',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
                bill_detail_num: Joi.number().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select count(1) count from cart where id=${request.payload.cart_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(Boom.notAcceptable('请先创建购物车'));
                        } else {
                            reply(true);
                        }
                    });
                }
            }
        ]
    }
};
