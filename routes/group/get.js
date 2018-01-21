const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/group/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select g.private,g.id,g.name,g.city,g.province,g.contacts,g.phone, date_format(g.end_date , '%Y-%c-%d %H:%i:%s') end_date,u.name supplierName,g.pickup_address,date_format(g.pickup_date , '%Y-%c-%d %H:%i:%s') pickup_date,g.pay_type,g.pay_count,g.pay_name,g.pay_description,g.freight,g.description,g.isflash is_flash,g.flash_desc,g.bill_id,g.user_id,if(g.status>0,if(TIMESTAMPDIFF(MINUTE,now(),g.end_date) > 0,1,0),g.status) status from group_bill g,bill b,user u where g.bill_id=b.id and b.user_id=u.id and g.id=${request.query.id}`;
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
        description: '根据ID获得团购单信息',
        validate: {
            query: {
                id: Joi.number()
            }
        },
    }
};
