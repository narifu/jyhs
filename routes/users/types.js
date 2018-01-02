const Boom = require('boom');

module.exports = {
    path: '/api/users/types',
    method: 'GET',
    handler(request, reply) {
        const typs = [
            {"code":"yy","name":"鱼友","desc":"可以参加团购"},
            {"code":"tgzzz","name":"团购组织者","desc":"可以参加团购、组织团购"},
            {"code":"lss","name":"零售商(鱼店)","desc":"可以参加团购、组织团购、上传普通出货单、一键开团"},
            {"code":"pfs","name":"批发商(渔场)","desc":"可以参加团购、组织团购、上传普通出货单、上传私有出货单、一键开团"}
        ]
        reply(typs);
    },
    config: {
        description: '获得用户类型'
    }
};
