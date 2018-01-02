const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/users/get/logo',
    method: 'GET',
    handler(request, reply) {
        let flag = true;
        const files = fs.readdirSync(config["user"]);
        files.forEach(function (itm, index) {
            const filedId = itm.split(".")[0];
            if(filedId==request.query.id){
                flag = false;
                reply({'status':'ok','imgPath':itm});
            }
        })
        if(flag){
            reply({'status':'ok'});
        }
    },
    config: {
        description: '根据ID获得用户头像',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
