
const fs = require("fs");
const config = require('../../config.js');
const Boom = require('boom');
const XLSX = require('xlsx');
const util = require("../../lib/util");
const _ = require("lodash");
const moment = require('moment')
const insertToDb = (item, i, length, request, bill_id, reply) => {
    const fish_name = item['name'].match(/[\u4e00-\u9fa5]/g);
    let name = fish_name?fish_name.join(""):item['name'];
    name = _.trim(name);
    const select = `select id from material where  name='${name}'`;
    request.app.db.query(select, (err, res) => {
        if (err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            // console.log("=======name========",res)

            if (_.isEmpty(res)) {
                const _select = `select id,tag from material where  tag like '%${name}%'`;
                console.log(_select)
                request.app.db.query(_select, (err, _res) => {
                    if (err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        // console.log("=======tag========",_res)
                        
                        if (_.isEmpty(_res)) {
                            insertBillDetail(item, i, length, request, bill_id, reply, null);
                        } else {
                            let matchId = null;
                            _.each(_res, (re) => {
                                const id = re["id"];
                                const tags = re["tag"];
                                _.each(tags.split(","), (tag) => {
                                    if (name == tag) {
                                        matchId = id;
                                    }
                                });
                            });
                            insertBillDetail(item, i, length, request, bill_id, reply, matchId);
                        }
                    }
                });
            } else {
                insertBillDetail(item, i, length, request, bill_id, reply, res[0]["id"]);
            }
        }
    });
}
const insertBillDetail = (item, i, length, request, bill_id, reply, materialId) => {
    const size = item['size']?item["size"]:"";
    const insert = `insert into bill_detail (bill_id,name,size,price,point,material_id) values (${bill_id},'${item['name']}','${size}',${item['price']},${item['point']?item['point']:0},${materialId}) `;
    request.app.db.query(insert, (err, res) => {
        if (err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            if (i == length) {
                reply({ 'status': 'ok' });
            }
        }
    });
}
const readExcel = (path) => {
    const buf = fs.readFileSync(path);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const list = [];
    for (let row = 2; ; row++) {
        if (sheet['A' + row] == null) {
            break;
        }
        const item = {};
        for (let col = 65; col <= 90; col++) {
            const c = String.fromCharCode(col);
            const key = '' + c + row;
            if (sheet[key] == null) {
                break;
            }
            const td = {};
            const value = util.trim(sheet[key]['w']);
           
            switch (c) {
                case 'A':
                    item['name'] = value;
                    break;
                case 'B':
                    item['price'] = value;
                    break;
                case 'C':
                    item['size'] = value;
                    break;
                case 'D':
                    item['point'] = value;
                    break;
                default:
                    break;
            }
        }
        list.push(item);
    }
    return list;
}
module.exports = {
    method: 'POST',
    path: '/api/bill/upload',
    handler: (request, reply) => {
        const upload = request.payload;
        const bill = upload["bill"];
        const bill_name = upload["bill_name"];
        const contacts = upload["contacts"];
        const phone = upload["phone"];
        const description = upload["description"];
        const user_id = upload["user_id"];
        const supplier_id = upload["supplier_id"];
        const effort_date = upload["effort_date"];
        const _name = bill.hapi.filename;
        const tempName = _name.split(".");
        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        const name = "bill-"+timestamp + "." + tempName[1];
        const path = "./temp/" + name;
        const file = fs.createWriteStream(path);
        file.on('error', function (err) {
            reply(Boom.notAcceptable('创建文件失败'));
        });
        bill.pipe(file);
        bill.on('end', function (err) {
            const list = readExcel(path);
            const length = list.length;
            const insert = `insert into bill (name,contacts,phone,description,user_id,effort_date,supplier_id) values ('${bill_name}','${contacts}','${phone}','${description}',${user_id},${effort_date},${supplier_id}) `;
            request.app.db.query(insert, (err, res) => {
                if (err) {
                    request.log(['error'], err);
                    reply(Boom.serverUnavailable(config.errorMessage));
                } else {

                    for (let i = 1; i <= length; i++) {
                        insertToDb(list[i - 1], i, length, request, res.insertId, reply);
                    }
                }
            });
        })
    },
    config: {
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        description: '上传团购清单',
        pre: [
            {
                method(request, reply) {
                    const upload = request.payload;
                    const effort_date = upload["effort_date"];
                    if(moment(effort_date+"","YYYYMMDDhmmss").isAfter(moment())){
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('生效日期必须大于今天'));
                    }
                    
                }
            }
        ]
    }
};
