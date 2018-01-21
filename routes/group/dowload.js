const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");
const xlsx =  require('node-xlsx');
const fs = require("fs");

const count = (itemList)=> {
    let sum = 0;
    _.each(itemList,(item)=>{
        sum+=item.sum;
    })
    return sum;
}

let to = 1;

const range = (rangeList,itemList)=> {
    let from = to+itemList.length-1;
    const range = {s: {c: 0, r:to }, e: {c:0, r:from}}; 
    const range1 = {s: {c: 1, r:to }, e: {c:1, r:from}}; 
    const range2 = {s: {c: 2, r:to }, e: {c:2, r:from}}; 
    const range3 = {s: {c: 3, r:to }, e: {c:3, r:from}};
    to +=  itemList.length+1;
    
    rangeList.push(range);
    rangeList.push(range1);
    rangeList.push(range2);
    rangeList.push(range3);
}

module.exports = {
    path: '/api/group/dowload',
    method: 'POST',
    handler(request, reply) {
        const select = `select id,name from group_bill g where id=${request.payload.id}`;
        request.app.db.query(select, (err, gres) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const returnData = [["姓名","联系电话","合计","备注","品名","规格","单价","数量","合计（不含运费"]];
                const totleReturnData = [["品名","规格","单价","数量","合计（不含运费"]]
                const totlLlist = `select bd.name,bd.size,bd.price,sum(bill_detail_num) bill_detail_num,sum((bd.price*cd.bill_detail_num)) sum from cart c,cart_detail cd,bill_detail bd where c.id=cd.cart_id  and cd.bill_detail_id=bd.id and c.group_bill_id=${request.payload.id} group by name,size,price`;
                const list = `select u.name userName,c.phone,c.description,bd.name,bd.size,bd.price,cd.bill_detail_num,(bd.price*cd.bill_detail_num) sum from cart c,cart_detail cd,bill_detail bd,user u where c.id=cd.cart_id and c.user_id=u.id and cd.bill_detail_id=bd.id and c.group_bill_id=${request.payload.id}`;
                request.app.db.query(list, (err, res) => {
                    if (err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        request.app.db.query(totlLlist, (err, totleRes) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                let totle_sum = 0;
                                _.each(totleRes,(item)=>{
                                    const  _itemList = [];
                                    _itemList.push(item.name);
                                    _itemList.push(item.size);
                                    _itemList.push(item.price);
                                    _itemList.push(item.bill_detail_num);
                                    _itemList.push(item.sum);
                                    totle_sum+=item.sum;
                                    totleReturnData.push(_itemList);
                                });
                                const  _itemList = [];
                                _itemList.push("");
                                _itemList.push("");
                                _itemList.push("");
                                _itemList.push("共计");
                                _itemList.push(totle_sum);
                                totleReturnData.push(_itemList);

                                const tempMap = new Map();
                                const rangeList = [];
                                _.each(res,(item)=>{
                                    const itemList = tempMap.get(item.userName);
                                    if(itemList){
                                        itemList.push(item);
                                    }else{
                                        const list = [item];
                                        tempMap.set(item.userName,list);
                                    }
                                });
                                tempMap.forEach(function (itemList, key, map) {
                                    const _count = count(itemList);
                                    _.each(itemList,(item,index)=>{
                                        const  _itemList = [];
                                        if(index==0){
                                            _itemList.push(item.userName);
                                            _itemList.push(item.phone);
                                            _itemList.push(_count);
                                            _itemList.push(item.description);
                                        }else{
                                            _itemList.push("");
                                            _itemList.push("");
                                            _itemList.push("");
                                            _itemList.push("");
                                        }
                                        _itemList.push(item.name);
                                        _itemList.push(item.size);
                                        _itemList.push(item.price);
                                        _itemList.push(item.bill_detail_num);
                                        _itemList.push(item.sum);
                                        returnData.push(_itemList);
                                    })
                                    returnData.push([]);
                                   // range(rangeList,itemList);
                                });

                                // const name  = gres[0].name.replace(/ /g,'')+"-"+gres[0].id+".xls";
                                const name  = "coral123-"+gres[0].id+".xlsx";
                                const path = config.bill+"/"+name;
                                var buffer = xlsx.build([{name: "总单", data: totleReturnData},{name: "明细", data: returnData}]);
                                //var buffer = xlsx.build([{name: "总单", data: totleReturnData},{name: "明细", data: returnData}],{'!merges': rangeList});
                                var ws = fs.createWriteStream(path);
                                ws.write(buffer, 'utf8', function (err, buffer) {
                                    reply({"status":"ok","name":name});
                                });
                            }
                        });
                        
                    }
                });
        
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID下载团购清单',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from group_bill where id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.payload.user_id || 0 == request.payload.user_id) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您没有权限更新这个单子'));
                        }
                    });
                }
            }
        ]
    }
};

