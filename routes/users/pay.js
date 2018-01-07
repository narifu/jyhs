
const fs = require("fs");
const config = require('../../config.js');
const Boom = require('boom');

module.exports = {
    method: 'POST',
    path: '/api/users/upload/pay',
    handler: (request, reply) => {
        
         const upload = request.payload;
         const id = upload.id;
         const img = upload["img"];
         const pay_type = upload["pay_type"];


         const files = fs.readdirSync(config["user"]+"pay/"+pay_type +"/");
         files.forEach(function (itm, index) {
             const filedId = itm.split(".")[0];
             if(filedId==id){
                fs.unlinkSync(config["user"]+"pay/"+pay_type +"/" + itm);
             }
         })
         
         const _name = img.hapi.filename;
         const tempName = _name.split(".");
         let timestamp = Date.parse(new Date());
         timestamp = timestamp / 1000;
         const name = id+"."+tempName[1];
         const path = config["user"]+"pay/"+pay_type +"/"+ name;
         const file = fs.createWriteStream(path);
         file.on('error', function (err) {
             reply(Boom.notAcceptable('创建文件失败'));
         });

         img.pipe(file);

         img.on('end', function (err) {
            const insert = `update user set pay_type='${pay_type}' where id=${id}`;
            request.app.db.query(insert, (err, res) => {
                if(err) {
                    request.log(['error'], err);
                    reply(Boom.serverUnavailable(config.errorMessage));
                } else {
                    const returnPath = `${name}`;
                    reply({'status':'ok','imgPath':returnPath});
                }
            });
            
         })

       

    },
    config: {
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        description: '添加支付图片'
    }
};
