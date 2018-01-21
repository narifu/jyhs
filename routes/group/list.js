const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/group/list',
    method: 'GET',
    handler(request, reply) {
        let where = request.query.name?` g.name LIKE '%${request.query.name}%'`:" 1=1 ";
        where = request.query.user_id?`${where} and g.user_id = ${request.query.user_id} `:`${where} and private=0`;
        where = request.query.city?`${where} and g.city = '${request.query.city}' `:`${where}`;
        where = request.query.province?`${where} and g.province = '${request.query.province}' `:`${where} `;
        const countSql = `select count(1) count from group_bill g,user u where  g.user_id=u.id and  ${where} `;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                where = `${where}  order by g.end_date desc`;
                let from  = (request.query.page-1)*request.query.size;
                const select = `select g.private,g.id,g.name,(select name from citys where mark=g.city) city,g.contacts,g.phone,date_format(g.end_date, '%Y-%c-%d %H:%i:%s') end_date ,(select name from user where id=(select supplier_id from bill bb where bb.id=g.bill_id )) supplierName,g.pickup_address,date_format(g.pickup_date , '%Y-%c-%d %H:%i:%s') pickup_date,g.pay_type,g.pay_count,g.pay_name,g.pay_description,g.freight,g.description,g.isflash is_flash,g.flash_desc,g.bill_id,g.user_id, if(g.status>0,if(TIMESTAMPDIFF(MINUTE,now(),g.end_date) > 0,1,0),g.status) status, ifnull((select sum(d.bill_detail_num*b.price) sum from cart c,cart_detail d,bill_detail b where c.id=d.cart_id and d.bill_detail_id=b.id and c.group_bill_id=g.id and c.status=1),0) sum from group_bill g,user u where g.user_id=u.id and  ${where}  limit ${from},${request.query.size}`;
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
        description: '获得所有团购单信息',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                name: Joi.string(),
                city: Joi.string(),
                province: Joi.string(),
                user_id: Joi.number()
            }
        },
    }
};
