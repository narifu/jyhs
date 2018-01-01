const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/detail',
    method: 'GET',
    handler(request, reply) {
        let where = request.query.name?`d.name LIKE '%${request.query.name}%'`:"1=1 ";
        const select = `select d.* from bill b,bill_detail d where b.id=d.bill_id and ${where} and b.id=${request.query.id}`;
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
        description: '根据ID获得团购清单的明细',
        validate: {
            query: {
                id: Joi.number().required(),
                name: Joi.string(),
            }
        }
    }
};
