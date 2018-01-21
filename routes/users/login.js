const Joi = require('joi');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const config = require('../../config.js');
const util = require('../../lib/util.js');

const TOKEN_TTL = '43200m';
const md5 = require('md5');

const login = function(user,request,reply){
    const options = {
        expiresIn: TOKEN_TTL
    };
    const session = {
        id: user.id,
        username: request.payload.name,
        type :user.type
    };
    const token = JWT.sign(session, config.authKey, options);
    const key = util.buildKey(request)+'token';
    global.globalCahce.set(key, token);
    const res = {
        token,
        "status": "ok",
        "id":user.id
    };
    reply(res);
}

module.exports = {
    path: '/api/users/login',
    method: 'POST',
    handler(request, reply) {
        const select = `select * from user where name='${request.payload.name}' and password='${md5(request.payload.password)}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const user = res[0];
                if(user&&user.id > 0) {
                    if(user.status==0){
                        reply(Boom.notAcceptable('该用户已经失效请联系管理员'));
                    }else{
                        if(request.payload.phone&&"00000000000"!=request.payload.phone){
                            const insert = `update user set phone='${request.payload.phone}' where id=${user.id}`;
                            request.app.db.query(insert, (err, res) => {
                                if(err) {
                                    request.log(['error'], err);
                                    reply(Boom.serverUnavailable(config.errorMessage));
                                } else {
                                    login(user,request,reply);
                                }
                            });
                        }else{
                            login(user,request,reply);
                        }
                    }
                    
                } else {
                    reply(Boom.notAcceptable('用户名或密码错误'));
                }
            }
        });
    },
    config: {
        description: '登陆',
        validate: {
            payload: {
                password: Joi.string().required().min(6).max(20).allow(null),
                name: Joi.string().required().min(1).max(20),
                auth: Joi.string().required().min(4),
                requestId: Joi.string().required(),
                phone: Joi.string().required(),
                is_error:Joi.boolean().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                   if(request.payload.is_error){
                    const text = global.globalCahce.get(request.payload.requestId)+"";
                    if(text&&text.toLowerCase() === request.payload.auth.toLowerCase()) {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('验证码不正确'));
                    }
                   }else{
                        reply(true);
                   }
                }
            }
        ]
    }
};
