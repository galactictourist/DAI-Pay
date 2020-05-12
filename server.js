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
const contractAddress = "0xf97b7dCB9EEdb001466980B451Ab753EC6F7446C"; // Deployed manually
const abi = Crud.abi;
const contract = new web3.eth.Contract(abi, contractAddress, {
  from: account,
  gasLimit: 3000000,
});

let estimatedGas;
let nonce;

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

  const contractFunction = contract.methods.withdraw(
    payment.address,
    daiAmount
  );
  const functionAbi = contractFunction.encodeABI();
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

app.listen(port, () => console.log(`Server started on ${port}`));
