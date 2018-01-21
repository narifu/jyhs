const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/list',
    method: 'GET',
    handler(request, reply) {
        let where = request.query.name ?`id>0 and name LIKE '%${request.query.name}%'`:"1=1 ";
        where = request.query.city?`${where} and city='${request.query.city}' `:`${where} and 1=1 `;
        where = request.query.province?`${where} and province='${request.query.province}' `:`${where} and 1=1 `;
        if(request.query.type1&&!request.query.type2){
            where = `${where} and type = '${request.query.type1}' `
        }else if(request.query.type1&&request.query.type2){
            where = `${where} and (type = '${request.query.type1}' or type =  '${request.query.type2}') `
        }
        where =  `${where} order by id desc`;
        const countSql = `select count(1) count from user where ${where}`;
        request.app.db.query(countSql, (err, count_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let from  = (request.query.page-1)*request.query.size;
                const select = `select u.id,u.name,u.phone,u.type,u.status,u.point,u.address,u.description,u.province,u.contacts,(select name from citys c where c.mark=u.city ) city_name from user u where ${where} limit ${from},${request.query.size}`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        const users = res;
                        const count = count_res;
                        reply({count,users});
                    }
                });
            }
        });
    },
    config: {
        description: '获得所有用户信息',
        validate: {
            query: {
                page: Joi.number().required(),
                size: Joi.number().required(),
                name: Joi.string(),
                city: Joi.string(),
                province: Joi.string(),
                type1: Joi.string(),
                type2:Joi.string(),
            }
        }
    }
};
