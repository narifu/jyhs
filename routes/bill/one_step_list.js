const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/bill/one/step/list',
    method: 'GET',
    handler(request, reply) {
        const where = request.query.name?` name LIKE '%${request.query.name}%' and is_one_step=1 order by upload_date desc`:" is_one_step=1 order by upload_date desc";
        const countSql = `select count(1) count from bill where ${where}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let from  = (request.query.page-1)*request.query.size;
                const select = `select b.* ,(select name from user u where u.id=b.supplier_id) supplierName,DATE_FORMAT(effort_date,'%Y-%m-%d') effort_date,if((TO_DAYS(NOW()) - TO_DAYS(effort_date))>0,0,1) status  from bill b where ${where} limit ${from},${request.query.size}`;
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
        auth: 'jwt',
        description: '获得所有一步团购清单',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                name: Joi.string(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const user = request.auth.credentials;
                    if(user &&  user.type == 'tggly') {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('权限不足'));
                    }
                }
            }
        ]
    }
};
