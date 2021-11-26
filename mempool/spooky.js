require("dotenv").config();

const Web3 = require("web3");

const parseTx = require("./util_spooky");
const sendEmail = require("./mailer");

const web3 = new Web3(process.env.OPERA_WSS);

const trace = async () => {
  try {
    web3.eth
      .subscribe("pendingTransactions", function (err, res) {})
      .on("data", function (hash) {
        web3.eth
          .getTransaction(hash)
          .then(async (tx, hash) => {
            if (tx) {
              let result = await parseTx(tx);
              if (result) {
                sendEmail(result);
              }
            }
          })
          .catch((err) => {
            console.log(err);
            console.log("getTransaction failed");
          });
      });
  } catch (error) {
    console.log("error in tracing");
  }
};

trace();
