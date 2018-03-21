
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
    // console.log("=======name sql========",select)
    
    request.app.db.query(select, (err, res) => {
        if (err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            // console.log("=======name========",res)

            if (_.isEmpty(res)) {
                const _select = `select id,tag from material where  tag like '%${name}%'`;
                // console.log("=======tag sql========",_select)
                
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
                            // console.log("=======matchId========",matchId)
                            
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
    const size = !_.isEmpty(item['size'])?item["size"]:"";
    const numbers = !_.isEmpty(item['numbers'])?item["numbers"]:"99";
    const limits = !_.isEmpty(item['limits'])?item["limits"]:"99";

    const insert = `insert into bill_detail (bill_id,name,size,price,point,material_id,numbers,limits) values (${bill_id},'${item['name']}','${size}',${item['price']},${item['point']?item['point']:0},${materialId},${numbers},${limits}) `;
    // console.log("=======insert sql========",insert)
    
    request.app.db.query(insert, (err, res) => {
        if (err) {
            request.log(['error'], err);
            reply(Boom.serverUnavailable(config.errorMessage));
        } else {
            if (i == length) {
                reply({ 'status': 'ok','bill_id':bill_id });
            }
        }
    });
}
const readExcel = (path) => {
    const buf = fs.readFileSync(path);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const list = [];
    const errorList=[];
    
    let flag = false;
    
    if(sheet['A'+1]&&"鱼名"==sheet['A'+1]["v"]){
        flag = true;
    }else{
        flag = false;
    }
    
    if(sheet['B'+1]&&"尺寸"==sheet['B'+1]["v"]){
        flag = true;
    }else{
        flag = false;
    }
    
    if(sheet['C'+1]&&"价格"==sheet['C'+1]["v"]){
        flag =true;
    }else{
        flag = false;
    }
    
    if(sheet['D'+1]&&"积分"==sheet['D'+1]["v"]){
        flag = true;
    }else{
        flag = false;
    }
    
    
    if(flag){
        for (let row = 2; ; row++) {
            if (sheet['A' + row] == null) {
                break;
            }
            const item = {};
            for (let col = 65; col <= 70; col++) {
                const c = String.fromCharCode(col);
                const key = '' + c + row;
                const td = {};
                const value = sheet[key]?util.trim(sheet[key]['w']):null;

                switch (c) {
                    case 'A':
                            if(_.isEmpty(value)){
                                errorList.push(`第${row}行鱼名不能为空`);
                            }else if(_.size(value)>30){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的名字太长了`);
                            }else{
                                item['name'] = value;
                            }
                            break;
                    case 'B':
                            if(_.isEmpty(value)){
                                item['size'] = "";
                            }else if(_.size(value)>30){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的尺寸太长了`);
                            }else{
                                item['size'] = value;
                            }
                            break;
                    case 'C':
                            if(_.isEmpty(value)){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的价格不能为空`);
                            }else if(isNaN(Number(value))){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的价格不是数字`);
                            }else{
                                item['price'] = value;
                            }
                            break;
                    case 'D':
                            if(_.isEmpty(value)){
                                item['point'] = "";
                            }else if(isNaN(Number(value))){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的积分不是数字`);
                            }else if(Number(value)>100){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的积分太多了`);
                            }else{
                                item['point'] = value;
                            }
                            break;
                    case 'E':
                            if(_.isEmpty(value)){
                                item['numbers'] = "99";
                            }else if(isNaN(Number(value))){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的数量不是数字`);
                            }else{
                                item['numbers'] = value;
                            }
                            break;
                    case 'F':
                            if(_.isEmpty(value)){
                                item['limits'] = "99";
                            }else if(isNaN(Number(value))){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的限购不是数字`);
                            }else if(!_.isEmpty(item["numbers"])&&Number(value)>Number(item["numbers"])){
                                errorList.push(`第${row}行叫${sheet['A' + row]['w']}的限购数大于总数`);
                            }else{
                                item['limits'] = value;
                            }
                            break;
                    default:
                        break;
                }
            }
            list.push(item);
        }
    }
    return {"flag":flag,"list":list,"error":errorList};
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
        const is_one_step = upload["is_one_step"]?upload["is_one_step"]:0;
        
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
            const resault = readExcel(path);
            const list = resault.list;
            const length = _.size(list);
            if(resault.flag){
                if(_.size(resault.error)>0){
                    reply(Boom.badRequest(resault.error.join("\n")));
                }else{
                    const insert = `insert into bill (name,contacts,phone,description,user_id,effort_date,supplier_id,is_one_step) values ('${bill_name}','${contacts}','${phone}','${description}',${user_id},${effort_date},${supplier_id},${is_one_step}) `;
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
                }
            }else{
                reply(Boom.notAcceptable('请使用下载的模版上传单子'));
            }
            
        })
    },
    config: {
        auth: 'jwt',
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
            },
            {
                method(request, reply) {
                    const upload = request.payload;
                    const is_one_step = upload["is_one_step"];
                    if(Number(is_one_step)==1){
                        const user = request.auth.credentials;
                        if(user && user.type == 'lss' || user.type == 'pfs' || user.type == 'tggly') {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('权限不足'));
                        }
                    }else{
                        reply(true);
                    }
                }
            }
        ]
    }
};
