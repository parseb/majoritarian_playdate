
# Majoritarian

Is a gnosis safe that leverages relative balancer pool holdings to asses the appointment and revocation of members. <br> 
Is a "*digitally native continous representative census suffrage*."

Repository is organized as follows:

- `/contracts/test/`- contracts used for tests.
- `/contracts/Majoritarian.sol`- main contract.
- `/test/`- test scripts.

### Development

requires

```
node >= 12.0
hardhat

(see package.json)
```

to install node modules

```
npm i
```

to compile run

```
npx hardhat compile
```

to test

```
npx hardhat test
```

please prepare `.env` file

```bash
touch .env
```

and add the following

```
INFURA_KEY = infura key
MNEMONIC = mnemonic (choose our development mnemonic to be able to interact with the deployed contracts with the deployer address)
PK = private-key
ETHERSCAN_API_KEY = etherscan key
```

Note:`.env` should be created in root directory.

### Deployment


##### Deployment to rinkeby

`npm run deploy:contracts:rinkeby`
