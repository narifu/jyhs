const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/material/random/image',
    method: 'GET',
    handler(request, reply) {
        const select = `select id,category,code  from material  order by rand() LIMIT 1`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(res&&res[0]&&res[0].category){
                    const filePath = config.image + "/"+res[0].category+"/";
                    const results = [];
                    fs.readdir(filePath,function(err,files){
                        if(err){
                            console.log(err);
                            return;
                        }
                        files.forEach(function(filename){
                            const temp = filename.substring(0,filename.indexOf(".")).split("-");
                            if(res[0].code == temp[1]){
                                results.push( `/${res[0].category}/${filename}`)
                            }
                        });
                        reply({'status':'ok','id':res[0].id,'image':results[0]});
                    });
                }else{
                    reply({'status':'ok'});
                }                    
                
                
            }
        });
    },
    config: {
        description: ' 随机获得生物资料图片',
    }
};
