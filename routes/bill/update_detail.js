const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");

const updateBillDetail = (request, reply, materialId) => {
    const update = `update bill_detail set numbers=${request.payload.numbers}, limits=${request.payload.numbers}, material_id=${materialId}, name='${request.payload.name}',size='${request.payload.size}',price=${request.payload.price},point=${request.payload.point} where id=${request.payload.id}`;
    request.app.db.query(update, (err, res) => {
        if(err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            reply(config.ok);
        }
    });
}

module.exports = {
    path: '/api/bill/update/detail',
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
                                updateBillDetail(request, reply, null);
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
                                updateBillDetail(request, reply, matchId);
                            }
                        }
                    });
                } else {
                    updateBillDetail(request, reply, res[0]["id"]);
                }
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID更新团购清单明细',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                name: Joi.string().required().min(2).max(100),
                size: Joi.string().required().min(2).max(20),
                price: Joi.number().required(),
                point: Joi.number().required(),
                numbers: Joi.string().optional().default("100"),
                limits: Joi.string().optional().default("100"),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select b.user_id from bill b,bill_detail d where b.id=d.bill_id and d.id=${request.payload.id}`;
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
            }
        ]
    }
};

