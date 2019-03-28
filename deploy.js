const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface , bytecode } = require('./compile');

const ETH_MNEMONIC = 'cruel soft deal wolf dance spoil steak used short fatal husband fashion';
const NETWORK_ENDPOINT = 'https://rinkeby.infura.io/v3/c50f0a9cc37642b4a6da71c669855a1a';

const provider = new HDWalletProvider(ETH_MNEMONIC, NETWORK_ENDPOINT);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);
    try {
        const result = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data: '0x' + bytecode, arguments: []})
            .send({gas: '1000000', from: accounts[0]});
    }   catch (e) {
        console.log(e);
    }
    console.log(interface);
    console.log('Contract deployed to',await  result.options.address);
};

deploy();
