const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/users/get/pay',
    method: 'GET',
    handler(request, reply) {

        const select = `select pay_type from user where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(res&&res[0]&&res[0].pay_type){
                    let flag = true;
                    const files = fs.readdirSync(config["user"]+"pay/"+res[0].pay_type +"/");
                    files.forEach(function (itm, index) {
                        const filedId = itm.split(".")[0];
                        if(filedId==request.query.id){
                            flag = false;
                            reply({'status':'ok','imgPath':itm,'type':res[0].pay_type});
                        }
                    })
                    if(flag){
                        reply({'status':'ok'});
                    }
                }else{
                    reply({'status':'ok'});
                }
            }
        });


        
    },
    config: {
        description: '根据ID获得支付二维码',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
