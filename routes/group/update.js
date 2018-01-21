const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const moment = require('moment')

module.exports = {
    path: '/api/group/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update group_bill set private='${request.payload.private}',status='${request.payload.status}',province='${request.payload.province}',city='${request.payload.city}', flash_desc='${request.payload.flash_desc}', isflash='${request.payload.is_flash}',  description='${request.payload.description}', freight=${request.payload.freight}, pay_description='${request.payload.pay_description}',pay_name='${request.payload.pay_name}',pay_count='${request.payload.pay_count}',pay_type='${request.payload.pay_type}', contacts='${request.payload.contacts}',phone='${request.payload.phone}',end_date=${request.payload.end_date},pickup_date=${request.payload.pickup_date}, pickup_address='${request.payload.pickup_address}' where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(config.ok);
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID更新团购清单',
        validate: {
            payload: {
                contacts: Joi.string().required().min(2).max(100),
                phone: Joi.string().required().min(2).max(20),
                end_date: Joi.number().required(),
                description: Joi.string().optional().default(" "),
                city: Joi.string().required().default("shc"),
                province: Joi.string().optional().default("sh"),
                pickup_address: Joi.string().optional().default(" "),
                pickup_date: Joi.number().optional().default(0),
                pay_type: Joi.string().optional().default(" "),
                pay_count: Joi.string().optional().default(" ").max(20),
                pay_name: Joi.string().optional().default(" ").max(50),
                pay_description: Joi.string().optional().default(" ").max(500),
                freight: Joi.number().optional().default(0.0),
                is_flash: Joi.number().optional().optional().default(0),
                private: Joi.number().optional().default(0),
                flash_desc: Joi.string().optional().default(" ").max(500),
                user_id: Joi.number().required(),
                status: Joi.number().required(),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from group_bill where id=${request.payload.id}`;
                    const user = request.auth.credentials;
                    
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.payload.user_id || user.type == 'tggly') {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您没有权限更新这个单子'));
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    const select = `select status from group_bill where id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].status == 0) {
                            reply(Boom.notAcceptable('已经结束的团购单不能更新'));
                        } else {
                            reply(true);
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    if(moment(request.payload.end_date+"","YYYYMMDDhmmss").isBefore(moment())){
                        reply(Boom.notAcceptable('结束日期小于今天'));
                    } else {
                        reply(true);
                    }
                }
            },
            {
                method(request, reply) {
                    if(moment(request.payload.pickup_date+"","YYYYMMDDhmmss").isAfter(moment())){
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('提货日期小于今天'));
                    }
                }
            }
        ]
    }
};

