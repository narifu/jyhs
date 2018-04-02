const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select *,(select name from citys c where c.mark=u.city) cityName from user u where id=${request.query.id}`;
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
        description: '根据ID获得用户信息',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
