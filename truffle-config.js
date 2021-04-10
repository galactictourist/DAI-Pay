const fs = require("fs");
const HDWalletProvider = require("truffle-hdwallet-provider");

const secrets = JSON.parse(fs.readFileSync(".secrets").toString().trim());

module.exports = {
    networks: {
        ropsten: {
            provider: () =>
                new HDWalletProvider(
                    //seed phrase
                    secrets.seed,
                    `https://ropsten.infura.io/v3/${secrets.projectId}`
                ),
            network_id: 3,
        },
        matic: {
            provider: () =>
                new HDWalletProvider(
                    //seed phrase
                    secrets.seed,
                    `https://rpc-mumbai.matic.today`
                ),
            network_id: 80001,
            //confirmations: 2,
            //timeoutBlocks: 200,
            //skipDryRun: true,
        },
    },
    compilers: {
        solc: {
            version: "0.6.12",
            docker: false,
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "istanbul"
            }
        }
    }
};
