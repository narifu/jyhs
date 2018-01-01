const Joi = require('joi');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/logout',
    method: 'POST',
    handler(request, reply) {
        reply(config.ok);
    },
    config: {
        description: '登出',
        validate: {
            payload: {
                id: Joi.number().required()
            }
        }
    }
};
