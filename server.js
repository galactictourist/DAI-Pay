//Blockchain
const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3");
const Crud = require("./build/contracts/Crud.json");
const cjson = require("cjson");

//Server
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname + "/public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/public/index.html"));
});

let web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/21bd07309ba84caf8161c6c4bc26ed36"
  )
);

const account = "0x5cC377D9c84136E708C612b00a2617DF635f83ae"; //Your account address
const privateKey = Buffer.from(
  "3c90126762f743ef8eadf39cd65da5b6c044b46239cf2d4806f039aa31c14be1",
  "hex"
);
const contractAddress = "0xBd722D00Ea739b0F762CFA6c9E423457FEf0B4C7"; // Deployed manually
const abi = Crud.abi;
const contract = new web3.eth.Contract(abi, contractAddress, {
  from: account,
  gasLimit: 3000000,
});

const contractFunction = contract.methods.create("Whammo"); // Here you can call your contract functions

const functionAbi = contractFunction.encodeABI();

let estimatedGas;
let nonce;

console.log("Getting gas estimate");

app.post("/api/pay", (req, res) => {
  const payment = {
    id: req.body.id,
    name: req.body.name,
    address: req.body.address,
  };

  contractFunction.estimateGas({ from: account }).then((gasAmount) => {
    estimatedGas = gasAmount.toString(16);

    console.log("Estimated gas: " + estimatedGas);

    web3.eth.getTransactionCount(account).then((_nonce) => {
      nonce = _nonce.toString(16);

      console.log("Nonce: " + nonce);
      const txParams = {
        gasPrice: 100000,
        gasLimit: 3000000,
        to: contractAddress,
        data: functionAbi,
        from: account,
        nonce: "0x" + nonce,
      };

      const tx = new Tx(txParams, { chain: "ropsten", hardfork: "petersburg" });
      tx.sign(privateKey); // Transaction Signing here

      const serializedTx = tx.serialize();

      web3.eth
        .sendSignedTransaction("0x" + serializedTx.toString("hex"))
        .on("receipt", (receipt) => {
          console.log(receipt);
        });
    });
  });
  res.send("got it");
});

// // smart contract details
// const provider = new Web3(
//   new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/21bd07309ba84caf8161c6c4bc26ed36"));

// const contractAddress = "0xBd722D00Ea739b0F762CFA6c9E423457FEf0B4C7";
// const privateKey = new Buffer(
//   "3c90126762f743ef8eadf39cd65da5b6c044b46239cf2d4806f039aa31c14be1",
//   "hex"
// );
// const defaultAccount = "0x5cC377D9c84136E708C612b00a2617DF635f83ae";
// const etherscanLink = "https://ropsten.etherscan.io/txs/";

// // initiate the web3
// const web3 = new Web3(provider);

// // initiate the contract with null value
// var contract = null;

// // Initiate the Contract
// function getContract() {
//   if (contract === null) {
//     //var abi = cjson.load("./build/contracts/Crud.json");
//     var c = new web3.eth.Contract(Crud.abi, contractAddress);
//     contract = c.clone();
//   }
//   console.log("Contract Initiated successfully!");
//   return contract;
// }

// // Send Signed Transaction
// async function sendSignTransaction(rawTrans) {
//   console.log("sendsignedT");
//   // Initiate values required by the dataTrans
//   if (rawTrans) {
//     console.log("now here");
//     var txCount = await web3.eth.getTransactionCount(defaultAccount); // needed for nonce

//     var abiTrans = rawTrans.encodeABI(); // encoded contract method

//     var gas = await rawTrans.estimateGas();
//     var gasPrice = await web3.eth.getGasPrice();
//     gasPrice = Number(gasPrice);
//     gasPrice = gasPrice * 2;
//     var gasLimit = gas * 4;

//     // Initiate the transaction data
//     var dataTrans = {
//       nonce: web3.utils.toHex(txCount),
//       gasLimit: web3.utils.toHex(gasLimit),
//       gasPrice: web3.utils.toHex(gasPrice),
//       to: contractAddress,
//       data: abiTrans,
//     };

//     console.log("here" + dataTrans.nonce);

//     // sign transaction
//     var tx = new TX(dataTrans);
//     tx.sign(privateKey);

//     // after signing send the transaction
//     return await sendSigned(tx);
//   } else {
//     //throw new console.error("Encoded raw transaction was not given.");
//     console.log(error);
//   }
// }

// function sendSigned(tx) {
//   console.log("sendsigned");

//   return new Promise(function (resolve, reject) {
//     // send the signed transaction
//     web3.eth
//       .sendSignedTransaction("0x" + tx.serialize().toString("hex"))
//       .once("transactionHash", function (hash) {
//         var result = {
//           status: "sent",
//           url: etherscanLink + hash,
//           message: "click the given url to verify status of transaction",
//         };

//         // respond with the result
//         resolve(result);
//       })
//       .then((out) => {
//         console.log(out);
//       })
//       .catch((err) => {
//         // respond with error
//         console.log(err);
//         reject(err);
//       });
//   });
// }

// // send DAI to Address
// async function sendDai(req, res) {
//   var address = contractAddress;
//   var _name = req.body.name;

//   if (_name) {
//     const rawTrans = getContract().methods.create(_name); // contract method
//     return res.send(await sendSignTransaction(rawTrans));
//   } else {
//     res.send({
//       message: "Payment sent",
//     });
//   }
// }

// //API ------------------------------
// app.get("/", (req, res) => {
//   res.sendFile(path.resolve(__dirname + "/public/index.html"));
// });

// app.get("/hello", (req, res) => {
//   res.send("hellfffo");
// });

// app.post("/api/pay", (req, res) => {
//   const payment = {
//     id: req.body.id,
//     name: req.body.name,
//     address: req.body.address,
//   };

//   res.send(payment);
// });

// app.post("/api/payDAI", sendDai);

app.listen(port, () => console.log(`Server started on ${port}`));
