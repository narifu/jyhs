const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");
const xlsx =  require('node-xlsx');
const fs = require("fs");


module.exports = {
    path: '/api/group/reopen',
    method: 'POST',
    handler(request, reply) {
        const update = `update group_bill set status=1,end_date=${request.payload.end_date} where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({"status":"ok"});
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID重开团购',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                id: Joi.number().required(),
                end_date: Joi.number().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from group_bill where id=${request.payload.id}`;
                    const user = request.auth.credentials;
                    
                    request.app.db.query(select, (err, res) => {

                        console.log(res)
                        console.log(res[0].user_id)
                        console.log(request.payload.user_id)
                        console.log(user.type == 'tggly')
                        

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
            }
        ]
    }
};

