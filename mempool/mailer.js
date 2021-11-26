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
  if (tokenType == "native")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: `Add Liquidity on ${data.chain == 56 ? "BSC" : "Polygon"}`,
      text: "",
      html: `chain : ${data.chain == 56 ? "BSC" : "Polygon"}</br> hash : ${
        data.hash
      }</br> name : ${data.name}</br> symbol : ${data.symbol}</br>token : ${
        data.token
      }<br/> amount : ${data.amount}`,
    };
  else if (tokenType == "stable")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: `Add StableCoin Pair Liquidity on ${
        data.chain == 56 ? "BSC" : "Polygon"
      }`,
      text: "",
      html: `chain : ${data.chain == 56 ? "BSC" : "Polygon"}</br> hash : ${
        data.hash
      }</br> tokenA Name : ${data.nameA}</br> tokenA Symbol : ${
        data.symbolA
      }</br>tokenA : ${data.tokenA}</br> tokenB Name : ${
        data.nameB
      }</br> tokenB Symbol : ${data.symbolB} tokenB : ${
        data.tokenB
      }<br/> usdAmount : ${data.amount}`,
    };
  else if (tokenType == "wrapped")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: `Add Wrapped token Pair Liquidity on ${
        data.chain == 56 ? "BSC" : "Polygon"
      }`,
      text: "",
      html: `chain : ${data.chain == 56 ? "BSC" : "Polygon"}</br> hash : ${
        data.hash
      }</br> tokenA Name : ${data.nameA}</br> tokenA Symbol : ${
        data.symbolA
      }</br>tokenA : ${data.tokenA}</br> tokenB Name : ${
        data.nameB
      }</br> tokenB Symbol : ${data.symbolB} tokenB : ${
        data.tokenB
      }</br>wrappedAmount : ${data.amount}`,
    };
  else if (tokenType == "weth")
    return {
      from: process.env.MAIL_ADDRESS,
      to: process.env.MAIL_ADDRESS,
      subject: `Add wEth token Pair Liquidity on ${
        data.chain == 56 ? "BSC" : "Polygon"
      }`,
      text: "",
      html: `chain : ${data.chain == 56 ? "BSC" : "Polygon"}</br> hash : ${
        data.hash
      }</br> tokenA Name : ${data.nameA}</br> tokenA Symbol : ${
        data.symbolA
      }</br>tokenA : ${data.tokenA}</br> tokenB Name : ${
        data.nameB
      }</br> tokenB Symbol : ${data.symbolB} tokenB : ${
        data.tokenB
      }</br>wEthAmount : ${data.amount}`,
    };
};

const sendEmail = (data) => {
  transporter.sendMail(createMailContent(data), (err) => {
    console.log(err);
  });
};

module.exports = sendEmail;
