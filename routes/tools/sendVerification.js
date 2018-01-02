const util  = require("../../lib/util");
const SMSClient = require('@alicloud/sms-sdk')
const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/tools/send/verification',
    method: 'POST',
    handler(request, reply) {
        const accessKeyId = 'LTAIsffrX7XjmFfv';
        const secretAccessKey = 'awRTvHPaX6jOODdPFcgBLNRHHvMYxW';
        let smsClient = new SMSClient({accessKeyId, secretAccessKey});
        const code = parseInt(Math.random()*9000+1000);
        
        //发送短信
        smsClient.sendSMS({
            PhoneNumbers: request.payload.phone,
            SignName: '礁岩海水',
            TemplateCode: 'SMS_119090261',
            TemplateParam: '{"code":"'+code+'"}'
        }).then(function (res) {
            let {Code}=res
            if (Code === 'OK') {
                // { Message: 'OK',
                // RequestId: '49369B45-0F07-4328-8892-029717A54D69',
                // BizId: '340003414040389327^0',
                // Code: 'OK' }
                global.globalCahce.set(res.RequestId, code);
                reply({"status":"ok","requestId":res.RequestId});
            }
        }, function (err) {
            console.log(err);
            reply(Boom.notAcceptable('验证码发送失败'));
        })
    },
    config: {
        description: '发送手机验证码',
        validate: {
            payload: {
                phone: Joi.string().required().min(3).max(11)
            }
        }
    }
};
