const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/cart/list',
    method: 'GET',
    handler(request, reply) {
        const countSql = `select count(1) count from cart c,group_bill g where c.group_bill_id=g.id and c.status=1 and c.user_id=${request.query.user_id}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(count_res[0].count>0){
                    let from  = (request.query.page-1)*request.query.size;
                    const select = `select c.*,g.id group_id,g.name group_name,if(g.status>0,if(TIMESTAMPDIFF(MINUTE,now(),g.end_date) > 0,1,0),g.status)  group_status,date_format(c.insert_date, '%Y-%c-%d %H:%i:%s') insert_format_date from cart c,group_bill g where c.group_bill_id=g.id and c.status=1 and  c.user_id=${request.query.user_id} order by id limit ${from},${request.query.size}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            reply({count_res,res});
                        }
                    });
                }else{
                    reply({count_res,"res":[]});
                }
                
            }
        });
    },
    config: {
        description: '获得用户ID获取购物车',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                user_id: Joi.number().required(),
            }
        },
    }
};
