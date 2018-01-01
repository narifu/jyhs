const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/get/detail',
    method: 'GET',
    handler(request, reply) {
        const select = `select * from bill_detail where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res[0]);
            }
        });
    },
    config: {
        description: '根据id获得所有团购清单明细',
        validate: {
            query: {
                id: Joi.number().required()
            }
        },
    }
};
