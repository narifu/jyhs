const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/random/list',
    method: 'GET',
    handler(request, reply) {
        const select = `select id,category,type,code,name,ename,sname,tag,level,price,description,compatibility from material order by rand() LIMIT ${request.query.number}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res);
            }
        });
    },
    config: {
        description: '随机获得生物资料信息',
        validate: {
            query: {
                number: Joi.number().required()
            }
        },
    }
};
