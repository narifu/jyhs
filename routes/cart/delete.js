const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/cart/delete',
    method: 'GET',
    handler(request, reply) {
        const update = `delete from cart_detail  where cart_id=${request.query.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const update = `delete from cart  where id=${request.query.id}`;
                request.app.db.query(update, (err, res) => {
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
        auth: 'jwt',
        description: '根据ID删除购物车',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
