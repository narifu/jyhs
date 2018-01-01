const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select * from cart where id=${request.query.id} `;
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
        description: '获得ID获取购物车',
        validate: {
            query: {
                id: Joi.number().required(),
            }
        },
    }
};
