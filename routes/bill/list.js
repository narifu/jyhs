const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/list',
    method: 'GET',
    handler(request, reply) {
        const where = request.query.name?`id>0 and name LIKE '%${request.query.name}%' order by id desc`:"id>0 order by upload_date desc";
        const countSql = `select count(1) count from bill where ${where}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let from  = (request.query.page-1)*request.query.size;
                const select = `select id,name,contacts,phone,description,user_id,supplier_id,DATE_FORMAT(effort_date,'%Y-%m-%d') effort_date,if((TO_DAYS(NOW()) - TO_DAYS(effort_date))>0,0,1) status  from bill where ${where} limit ${from},${request.query.size}`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        const bills = res;
                        const count = count_res;
                        reply({count,bills});
                    }
                });
            }
        });
    },
    config: {
        description: '获得所有团购清单',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                name: Joi.string(),
            }
        },
    }
};
