const nodemailer=require('nodemailer');

exports.sendEmail=async(options)=>{
    var transport = nodemailer.createTransport({
         host: "sandbox.smtp.mailtrap.io",
         port: 2525,
         auth: {
           user: "e7d94e5b63eb92",
           pass: "0dfc067414ed7c"
         }
       });
   
   const mailOptions={
    from:process.env.SMPT_MAIL,
    to:options.email,
    subject:options.subject,
    message:options.message,
   }
   await transport.sendMail(mailOptions)
}