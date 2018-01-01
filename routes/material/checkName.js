const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/checkName',
    method: 'GET',
    handler(request, reply) {
        const select = `select count(1) count from material where name='${request.query.name}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else if(res && res[0].count ==0) {
                reply(config.ok);
            } else {
                reply(Boom.notAcceptable('名称已经存在'));
            }
        });
    },
    config: {
        description: '检查生物资料名字是否重复',
        validate: {
            query: {
                name: Joi.string().required().max(20),
            }
        },
    }
};
