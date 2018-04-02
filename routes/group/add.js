const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const moment = require('moment')

module.exports = {
    path: '/api/group/add',
    method: 'POST',
    handler(request, reply) {
        if(request.payload.pickup_date==0){
            request.payload.pickup_date = null;
        }
        const insert = `insert into group_bill (name,contacts,phone,end_date,pickup_address,pickup_date,pay_type,pay_count,pay_name,pay_description,freight,description,isflash,flash_desc,bill_id,user_id,city,province,private) VALUES('${request.payload.name}','${request.payload.contacts}','${request.payload.phone}',${request.payload.end_date},'${request.payload.pickup_address}',${request.payload.pickup_date},'${request.payload.pay_type}','${request.payload.pay_count}','${request.payload.pay_name}','${request.payload.pay_description}',${request.payload.freight},'${request.payload.description}',${request.payload.is_flash},'${request.payload.flash_desc}',${request.payload.bill_id},${request.payload.user_id},'${request.payload.city}','${request.payload.province}',${request.payload.private})`;
        request.app.db.query(insert, (err, res) => {
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
        description: '添加开团信息',
        validate: {
            payload: {
                name: Joi.string().required().min(2).max(100),
                contacts: Joi.string().required().min(2).max(100),
                phone: Joi.string().required().min(2).max(20),
                end_date: Joi.number().required(),
                city: Joi.string().required().default("shc"),
                description: Joi.string().optional().default(" "),
                province: Joi.string().optional().default("sh"),
                pickup_address: Joi.string().optional().default(" "),
                pickup_date: Joi.number().optional().default(0),
                pay_type: Joi.string().optional().default(" "),
                pay_count: Joi.string().optional().default(" ").max(20),
                pay_name: Joi.string().optional().default(" ").max(50),
                pay_description: Joi.string().optional().default(" ").max(500),
                freight: Joi.number().optional().default(0.0),
                is_flash: Joi.number().optional().default(0),
                private: Joi.number().optional().default(0),
                flash_desc: Joi.string().optional().default(" ").max(500),
                bill_id: Joi.number().required(),
                user_id: Joi.number().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const private = request.payload.private;
                    if(Number(private)==1){
                        const user = request.auth.credentials;
                        if(user && user.type == 'lss' || user.type == 'pfs'|| user.type == 'tggly') {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('权限不足'));
                        }
                    }else{
                        reply(true);
                    }
                }
            }
        ]
    }
};
