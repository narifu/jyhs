const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const md5 = require('md5');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/users/register',
    method: 'POST',
    handler(request, reply) {
        const insert = `insert into user (name,password,city,phone,type,province) VALUES('${request.payload.name}','${md5(request.payload.password2)}','${request.payload.city}','${request.payload.phone}','yy','${request.payload.province}')`;
        request.app.db.query(insert, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(config.ok);
            }
        });
    },
    config: {
        description: '注册',
        validate: {
            payload: {
                name: Joi.string().required().min(1).max(20),
                password1: Joi.string().required().min(6).max(20),
                password2: Joi.string().required().min(6).max(20),
                province: Joi.string().optional().default("sh"),
                city: Joi.string().optional().default("shc"),
                phone: Joi.string().required().max(20),
                requestId: Joi.string().required(),
                auth: Joi.string().required().max(6)
            }
        },
        pre: [
            {
                method(request, reply) {
                    const text = global.globalCahce.get(request.payload.requestId)+"";
                    if(text&&text.toLowerCase() === request.payload.auth.toLowerCase()) {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('验证码不正确'));
                    }
                }
            },
            {
                method(request, reply) {
                    if(request.payload.password1 !== request.payload.password2) {
                        reply(Boom.notAcceptable('两次输入的密码不匹配'));
                    } else {
                        reply(true);
                    }
                }
            },
            {
                method(request, reply) {
                    const select = `select count(1) count from user where name='${request.payload.name}';`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('用户名已经存在'));
                        }
                    });
                }
            }
        ]
    }
};
