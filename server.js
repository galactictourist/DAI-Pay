//Blockchain
const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3");
const Crud = require("./build/contracts/Treasury.json");
const cjson = require("cjson");
const libZ = require("./lib");

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

const web3 = new Web3(
  "https://rpc-mumbai.matic.today"
);

const account = "0x5cC377D9c84136E708C612b00a2617DF635f83ae"; //Your account address
const privateKey = Buffer.from(
  "3c90126762f743ef8eadf39cd65da5b6c044b46239cf2d4806f039aa31c14be1",
  "hex"
);
const contractAddress = "0xBdc13b765a8cF46496653368a74934C8c252F901"; // Deployed manually

const abi = Crud.abi;
// const contract = new web3.eth.Contract(abi, contractAddress, {
//   from: account,
//   gasLimit: 4000000,
// });
const contract = new web3.eth.Contract(abi, contractAddress);

let estimatedGas;
let nonce;

console.log("contract address " + contract.options.address);
console.log("Getting gas estimate");

app.post("/api/pay", (req, res) => {
  const payment = {
    id: req.body.id,
    name: req.body.name,
    address: req.body.address,
    amount: req.body.amount,
  };

  if (!Web3.utils.isAddress(payment.address)) {
    throw new Error("Not a valid wallet address");
  }
  if (JSON.stringify(payment) === "{}") {
    throw new Error("No API data sent. Empy JSON");
  }
  //Amount processing
  var amount = payment.amount;
  console.log("raw amount - " + amount);
  var str = String(amount);

  var amountNoDec = str.replace(/[^0-9|-]/g, "");
  console.log("no dec amount - " + amountNoDec);
  var decLeft = amount.toString().indexOf(".");

  var totalDigits = decLeft + 18;

  var daiAmount = libZ.addZeros(amountNoDec, totalDigits);
  console.log("dai amount - " + daiAmount);

  const functionAbi = contract.methods
    .withdraw(payment.address, daiAmount)
    .encodeABI();

  web3.eth.getTransactionCount(account, (err, txCount) => {
    // Build the transaction
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      to: contractAddress,
      value: web3.utils.toHex(web3.utils.toWei("0", "ether")),
      gasLimit: web3.utils.toHex(2100000),
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      data: functionAbi,
    };

    // Sign the transaction
    const tx = new Tx(txObject, { chain: "ropsten", hardfork: "istanbul" });
    tx.sign(privateKey);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    // Broadcast the transaction
    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      console.log("err", err);
      console.log("txHash", txHash);
      res.send(txHash);
    });
  });

  // contractFunction.estimateGas({ from: account }).then((gasAmount) => {
  //   estimatedGas = gasAmount.toString(16);

  //   //console.log("Estimated gas: " + estimatedGas);

  //   web3.eth.getTransactionCount(account).then((_nonce) => {
  //     nonce = _nonce.toString(16);

  //     console.log("Nonce: " + nonce);

  //     const txParams = {
  //       gasPrice: 300000,
  //       gasLimit: 4000000,
  //       to: contractAddress,
  //       data: functionAbi,
  //       from: account,
  //       nonce: "0x" + nonce,
  //     };

  //     const tx = new Tx(txParams, { chain: "ropsten", hardfork: "istanbul" });
  //     tx.sign(privateKey); // Transaction Signing here

  //     const serializedTx = tx.serialize();

  //     web3.eth
  //       .sendSignedTransaction("0x" + serializedTx.toString("hex"))
  //       .on("receipt", (receipt) => {
  //         console.log(receipt);
  //       });
  //   });
  // });
  //res.send(txHash);
});

app.listen(port, () => console.log(`Server started on ${port}`));
