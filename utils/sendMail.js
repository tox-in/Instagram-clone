import nodemailer from 'nodemailer';

const sendMail = async (email, subject, message) => {
    try {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        let info = await transporter.sendMail({
            from: `"Instagram clone" <${process.env.SENDER_EMAIL}>`,
            to:email,
            subject:subject,
            html: message,
        });
        console.log('Email sent: %s', info.messageId);
    } catch (e) {
        console.log(e.message);
    }
}

export default sendMail;