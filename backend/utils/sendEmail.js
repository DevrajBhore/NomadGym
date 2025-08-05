// utils/sendEmail/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, text) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    
        await transport.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: text,
        });

        console.log(`Email sent successfully`);

    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Failed to send email');
    }
};

export default sendEmail;