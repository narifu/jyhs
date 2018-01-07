const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/material/deleteImage',
    method: 'GET',
    handler(request, reply) {
        const select = `select category,code  from material  where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const filePath = config.image + "/"+res[0].category+"/"+request.query.imgName;
                fs.unlinkSync(filePath);
                reply(config.ok);
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID删除生物资料图片',
        validate: {
            query: {
                id: Joi.number().required(),
                imgName: Joi.string().required()
            }
        }
    }
};
