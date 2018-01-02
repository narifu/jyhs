const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/getByType',
    method: 'GET',
    handler(request, reply) {
        let where = request.query.city?` city='${request.query.city}'`:" 1=1 ";
        
        const select = `select * from user where ${where} and type='${request.query.type}' order by id desc`;
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
        description: '根据类型获得用户信息',
        validate: {
            query: {
                type: Joi.string().required(),
                city: Joi.string()
            }
        }
    }
};
