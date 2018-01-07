const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/material/delete',
    method: 'GET',
    handler(request, reply) {
        const select = `select category,code  from material  where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const filePath = config.image  + "/"+res[0].category+"/";
                fs.readdir(filePath,function(err,files){
                    if(err){
                        console.log(err);
                        return;
                    }
                    var count = files.length;
                    var results = [];
                    files.forEach(function(filename){
                        if(filename.indexOf(res[0].code)>=0){
                            results.push(filename)
                        }
                    });
                    results.forEach((file)=>{
                        fs.unlinkSync(filePath+"/"+file);
                    });

                });
                const update = `delete from material  where id=${request.query.id}`;
                request.app.db.query(update, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply(config.ok);
                    }
                });
            }
        });
      
    },
    config: {
        auth: 'jwt',
        description: '根据ID删除生物资料',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
