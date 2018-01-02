const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require('lodash');
module.exports = {
    path: '/api/material/list',
    method: 'GET',
    handler(request, reply) {
        let types = null;
        if(request.query.type){
            types = `'',`;
            _.each(request.query.type.split(","),(item)=>{
                types+=`'${item}',`;
            });
        }
        let where = request.query.name?` name LIKE '%${request.query.name}%' or tag LIKE '%${request.query.name}%' `:" 1=1 ";
        where = request.query.type?`${where} and type in (${types}'')`:`${where} `;
        const countSql = `select count(1) count from material where ${where}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let from  = (request.query.page-1)*request.query.size;
                const select = `select id,category,type,code,name,ename,sname,tag,level,price,description,compatibility from material where ${where} order by id desc limit ${from},${request.query.size}`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        const materials = res;
                        const count = count_res;
                        reply({count,materials});
                    }
                });
            }
        });
    },
    config: {
        description: '获得所有生物资料信息',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                name: Joi.string(),
                type: Joi.string(),
            }
        },
    }
};
