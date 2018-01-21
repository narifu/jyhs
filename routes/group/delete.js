const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/group/delete',
    method: 'POST',
    handler(request, reply) {
        const delete_detail = `delete from cart_detail where cart_id in (select id from (select c.id from cart c where c.group_bill_id=${request.payload.id}) cartid)`;
        request.app.db.query(delete_detail, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const delete_bill = `delete from cart where group_bill_id=${request.payload.id}`;
                request.app.db.query(delete_bill, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        const delete_bill = `delete from group_bill where id=${request.payload.id}`;
                        request.app.db.query(delete_bill, (err, res) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                reply(config.ok);
                            }
                        });
                    }
                });
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID删除团购单',
        validate: {
            payload: {
                user_id: Joi.number().required(),
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
                        } else if(res && user.type == 'tggly') {
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

