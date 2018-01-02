const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select id,name,contacts,phone,description,user_id,supplier_id,DATE_FORMAT(effort_date,'%Y-%m-%d') effort_date,if((TO_DAYS(NOW()) - TO_DAYS(effort_date))>0,'false','true') status  from bill where id=${request.query.id}`;
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
        description: '根据id获得所有团购清单',
        validate: {
            query: {
                id: Joi.number().required()
            }
        },
    }
};
