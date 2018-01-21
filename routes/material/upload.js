
const fs = require("fs");
const config = require('../../config.js');
const Boom = require('boom');


module.exports = {
    method: 'POST',
    path: '/api/material/upload',
    handler: (request, reply) => {
        
         const upload = request.payload;
         const code = upload.code;
         const category = upload.category;
         const id = upload.id;
         const img = upload["img"];
         const small = upload["small"];
         const _name = img.hapi.filename;
         const tempName = _name.split(".");
         let timestamp = Date.parse(new Date());
         timestamp = timestamp / 1000;
         const name = timestamp+"-"+code+"."+tempName[1];
         const path = config["image"] + "/"+category+"/" + name;
         const file = fs.createWriteStream(path);
         file.on('error', function (err) {
             reply(Boom.notAcceptable('创建文件失败'));
         });

         img.pipe(file);

         img.on('end', function (err) {
            const returnPath = `/${category}/${name}`;
            reply({'status':'ok','imgPath':returnPath});
         })

       

    },
    config: {
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        description: '添加生物资料图片'
    }
};
