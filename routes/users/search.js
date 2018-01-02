const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/search',
    method: 'GET',
    handler(request, reply) {
        const select = `select * from user where name LIKE '%${request.query.name}%'`;
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
        description: '根据姓名获得用户信息支持模糊查询',
        validate: {
            query: {
                name: Joi.string().required(),
            }
        }
    }
};
