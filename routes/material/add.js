const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/material/add',
    method: 'POST',
    handler(request, reply) {
        const tag = request.payload.tag?request.payload.tag.replace(/，/ig,','):"";
        const insert = `insert into material (category,type,code,name,ename,sname,tag,level,price,description,compatibility) VALUES('${request.payload.category}','${request.payload.type}','${request.payload.code}','${request.payload.name}','${request.payload.ename}','${request.payload.sname}','${tag}','${request.payload.level}','${request.payload.price}','${request.payload.description}','${request.payload.compatibility}')`;
        request.app.db.query(insert, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const select = `select id from material where code='${request.payload.code}' and category='${request.payload.category}';`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply({'status':'ok','id':res[0].id});
                    }
                });
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '添加生物资料',
        validate: {
            payload: {
                category: Joi.string().required().max(20),
                type: Joi.string().required().max(20),
                name: Joi.string().required().max(20),
                ename: Joi.string().optional().allow(''),
                sname: Joi.string().optional().allow(''),
                tag: Joi.string(),
                code: Joi.string().required().min(2).max(20),
                level: Joi.string().required().max(20),
                price: Joi.number().required(),
                compatibility: Joi.string().required(),
                description: Joi.string().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select count(1) count from material where code='${request.payload.code}' and category='${request.payload.category}';`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('编码已经存在'));
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    const select = `select count(1) count from material where name='${request.payload.name}' and category='${request.payload.category}';`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('名字已经存在'));
                        }
                    });
                }
            }
        ]
    }
};
