require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASS,
    },
  })
);

const createMailContent = (data) => {
  let tokenType = data.tokenType;
  if (tokenType == "bnb")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: "Add Liquidity BNB",
      text: "",
      html: ` hash : ${data.hash}</br> name : ${data.name}</br> symbol : ${data.symbol}</br>token : ${data.token}<br/> amountETHMin : ${data.amountETHMin}`,
    };
  else if (tokenType == "busd")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: "Add Busd Pair Liquidity",
      text: "",
      html: ` hash : ${data.hash}</br> tokenA Name : ${data.nameA}</br> tokenA Symbol : ${data.symbolA}</br>tokenA : ${data.tokenA}</br> tokenB Name : ${data.nameB}</br> tokenB Symbol : ${data.symbolB} tokenB : ${data.tokenB}<br/> busdAmount : ${data.busdAmount}`,
    };
  else if (tokenType == "wbnb")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: "Add wBnb Pair Liquidity",
      text: "",
      html: ` hash : ${data.hash}</br> tokenA Name : ${data.nameA}</br> tokenA Symbol : ${data.symbolA}</br>tokenA : ${data.tokenA}</br> tokenB Name : ${data.nameB}</br> tokenB Symbol : ${data.symbolB} tokenB : ${data.tokenB}</br>wBnbAmount : ${data.wBnbAmount}`,
    };
};

const sendEmail = (data) => {
  transporter.sendMail(createMailContent(data), (err) => {
    console.log(err);
  });
};

module.exports = sendEmail;
