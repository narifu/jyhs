const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const md5 = require('md5');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/users/forget',
    method: 'POST',
    handler(request, reply) {
        const select = `select id from user where name='${request.payload.name}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else if(res && res[0].id) {
                if(res[0].phone&&res[0].phone.length>10){
                    if(res[0].phone==request.payload.phone){
                        reply({"status":"ok","id":res[0].id});
                    }else{
                        reply(Boom.notAcceptable('手机号不正确'));
                    }
                }else{
                    reply({"status":"ok","id":res[0].id});
                }
            } else {
                reply(Boom.notAcceptable('用户名不正确'));
            }
        });
    },
    config: {
        description: '验证忘记密码',
        validate: {
            payload: {
                name: Joi.string().required().min(3).max(20),
                requestId: Joi.string().required(),
                auth: Joi.string().required().max(6),
                phone: Joi.string().required(),
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
            }
        ]
    }
};
