const nodemailer = require('nodemailer');

function main(email) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: "smtp.qq.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: '2528660980@qq.com', // generated ethereal user
                pass: 'qeqwjiobnznfdiff', // generated ethereal password
            },
        });
        var res = resolve;
        // 随机验证码
        function randow() {
            let code = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
            res(code);
            return code;
        };
        transporter.sendMail({
            from: '2528660980@qq.com', // sender address
            to: email, // list of receivers
            subject: "putao.work", // Subject line
            // text: "Hello world?", // plain text body
            html: `<b>邮箱验证码:${randow()} </b>`, // html body
        });
    });
}

module.exports = {
    main
}
