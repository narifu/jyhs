const Boom = require('boom');
const Joi = require('joi');

module.exports = {
    path: '/api/tools/citys',
    method: 'GET',
    handler(request, reply) {
        const select = `select mark,name from citys where area='${request.query.area}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({'status':'ok',res});
            }
        });
    },
    config: {
        description: '获得所有城市列表',
        validate: {
            query: {
                area: Joi.string().required(),
            }
        },
    }
};