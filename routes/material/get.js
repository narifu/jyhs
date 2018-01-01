const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select id,category,type,code,name,ename,sname,tag,level,price,description,compatibility from material where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res[0]);
            }
        });
    },
    config: {
        description: '根据Id获得所有生物资料信息',
        validate: {
            query: {
                id: Joi.number().required()
            }
        },
    }
};
