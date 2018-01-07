const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update cart set sum=${request.payload.sum}, phone='${request.payload.phone}', description='${request.payload.description}', status='${request.payload.status}' where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({'status':'ok','id':res.insertId});
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '更新购物车',
        validate: {
            payload: {
                id: Joi.number().required(),
                status: Joi.number().required(),
                sum: Joi.number().required(),
                phone: Joi.string().optional().default(" "),
                description: Joi.string().optional().default(" ")
            }
        }
    }
};
