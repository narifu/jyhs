const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/list/detail',
    method: 'GET',
    handler(request, reply) {
        const countSql = `select count(1) count from cart_detail where cart_id=${request.query.cart_id}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let from  = (request.query.page-1)*request.query.size;
                const select = `select * from cart_detail where cart_id=${request.query.cart_id} order by id limit ${from},${request.query.size}`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply({count_res,res});
                    }
                });
            }
        });
    },
    config: {
        description: '获得购物车ID获取购物车明细',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                cart_id: Joi.number().required(),
            }
        },
    }
};
