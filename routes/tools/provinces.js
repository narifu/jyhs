const Boom = require('boom');

module.exports = {
    path: '/api/tools/provinces',
    method: 'GET',
    handler(request, reply) {
        const citys = {
            "bj":"北京",
            "sh":"上海",
            "hn":"河南",
            "gd":"广东",
            "ah":"安徽",
            "cq":"重庆",
            "fj":"福建",
            "gx":"广西",
            "gz":"贵州",
            "gs":"甘肃",
            "he":"河北",
            "hl":"黑龙江",
            "hb":"湖北",
            "hu":"湖南",
            "jl":"吉林",
            "js":"江苏",
            "ln":"辽宁",
            "nm":"内蒙古",
            "nx":"宁夏",
            "qh":"青海",
            "sx":"山西",
            "sd":"山东",
            "sc":"四川",
            "sa":"陕西",
            "tj":"天津",
            "xz":"西藏",
            "xj":"新疆",
            "yn":"云南",
            "zj":"浙江",
            "jx":"江西",
        }
        reply(citys);
    },
    config: {
        description: '获得所有省份列表'
    }
};