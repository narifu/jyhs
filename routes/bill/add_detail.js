const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");

const addBillDetail = (request, reply, materialId) => {
    const insert = `insert into bill_detail (bill_id,name,size,price,point,material_id,numbers,limits) values (${request.payload.bill_id},'${request.payload.name}','${request.payload.size}',${request.payload.price},${request.payload.point},${materialId},${request.payload.numbers},${request.payload.limits}) `;
    request.app.db.query(insert, (err, res) => {
        if(err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            reply(config.ok);
        }
    });
}
module.exports = {
    path: '/api/bill/add/detail',
    method: 'POST',
    handler(request, reply) {
        const fish_name = request.payload.name.match(/[\u4e00-\u9fa5]/g);
        const name = fish_name?fish_name.join(""):request.payload.name;
        const select = `select id from material where  name='${name}'`;
        request.app.db.query(select, (err, res) => {
            if (err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if (_.isEmpty(res)) {
                    const select = `select id,tag from material where  tag like '%${name}%'`;
                    request.app.db.query(select, (err, res) => {
                        if (err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            if (_.isEmpty(res)) {
                                addBillDetail(request, reply, null);
                            } else {
                                let matchId = null;
                                _.each(res, (re) => {
                                    const id = re["id"];
                                    const tags = re["tag"];
                                    _.each(tags.split(","), (tag) => {
                                        if (name == tag) {
                                            matchId = id;
                                        }
                                    });
                                });
                                addBillDetail(request, reply, matchId);
                            }
                        }
                    });
                } else {
                    addBillDetail(request, reply, res[0]["id"]);
                }
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID添加团购清单明细',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                name: Joi.string().required().min(2).max(100),
                size: Joi.string().required().min(2).max(20),
                price: Joi.number().required(),
                point: Joi.number().required(),
                numbers: Joi.string().optional().default("100"),
                limits: Joi.string().optional().default("100"),
                bill_id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from bill where id=${request.payload.bill_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.payload.user_id || 0 == request.payload.user_id) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您没有权限更新这个单子'));
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    const select = `select count(1) count from bill_detail where name='${request.payload.name}' and size='${request.payload.size}'`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable(request.payload.name+'名字和大小一样的鱼已经存在'));
                        }
                    });
                }
            }
        ]
    }
};

