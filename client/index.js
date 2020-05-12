// import Web3 from "web3";
// import Crud from "../build/contracts/Crud.json";

// let web3;
// let crud;

const Web3 = require("web3");
const Crud = require("../build/contracts/Treasury.json");

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      window.ethereum
        .enable()
        .then(() => {
          resolve(new Web3(window.ethereum));
        })
        .catch((e) => {
          reject(e);
        });
      return;
    }
    if (typeof window.web3 !== "undefined") {
      return resolve(new Web3(window.web3.currentProvider));
    }
    resolve(new Web3("http://localhost:9545"));
  });
};

const initContract = () => {
  const deploymentKey = "0xf97b7dCB9EEdb001466980B451Ab753EC6F7446C";

  return new web3.eth.Contract(Crud.abi, deploymentKey);
  console.log("init contract", deploymentKey);
};

const initApp = () => {
  const $balance = document.getElementById("balance");
  const $getbalance = document.getElementById("getbalance");

  const $checkaddress = document.getElementById("checkaddress");
  const $addressresult = document.getElementById("addressresult");

  // const $edit = document.getElementById("edit");
  // const $editResult = document.getElementById("edit-result");

  // const $delete = document.getElementById("delete");
  // const $deleteResult = document.getElementById("delete-result");

  let accounts = [];
  web3.eth.getAccounts().then((_accounts) => {
    accounts = _accounts;
  });

  //********GET BALANCE  */
  $balance.addEventListener("submit", (e) => {
    e.preventDefault();
    var spinner = document.querySelector(".loader");
    spinner.style.visibility = "visible";
    spinner.classList.add("spin");

    console.log(accounts[0]);
    crud.methods
      .getBalance()
      .call()
      .then((result) => {
        spinner.style.visibility = "hidden";
        console.log("result = " + JSON.stringify(result));
        $getbalance.innerHTML = `$ ${result[0]} DAI `;
      })
      .catch(() => {
        $getbalance.innerHTML = `Error - ${e.message}`;
      });
  });

  //********CHECK ADDRESS  */
  $checkaddress.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(e.target.elements[0].value);
    const address = e.target.elements[0].value;
    crud.methods
      .isApproved(address)
      .send({ from: "0x5cC377D9c84136E708C612b00a2617DF635f83ae" })
      .then((result) => {
        if (result[0] == true) {
          $addressresult.innerHTML = `Address is approved for payment`;
        } else {
          $addressresult.innerHTML = `Address is not approved for payment`;
        }
      })
      .catch(() => {
        $addressresult.innerHTML = `Error ${e.message}`;
      });
  });

  // $edit.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   const id = e.target.elements[0].value;
  //   const name = e.target.elements[1].value;
  //   crud.methods
  //     .update(id, name)
  //     .send({ from: accounts[0] })
  //     .then(() => {
  //       $editResult.innerHTML = `Changed name of user ${id} to ${name}`;
  //     })
  //     .catch(() => {
  //       $editResult.innerHTML = `Error while trying to update user ${id}`;
  //     });
  // });

  // $delete.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   const id = e.target.elements[0].value;
  //   crud.methods
  //     .destroy(id)
  //     .send({ from: accounts[0] })
  //     .then(() => {
  //       $deleteResult.innerHTML = `Deleted user ${id}`;
  //     })
  //     .catch(() => {
  //       $deleteResult.innerHTML = `There was an error trying to delete user ${id}`;
  //     });
  // });
};

document.addEventListener("DOMContentLoaded", () => {
  initWeb3()
    .then((_web3) => {
      web3 = _web3;
      crud = initContract();
      initApp();
      console.log(crud.options.address);
    })
    .catch((e) => console.log(e.message));
});
