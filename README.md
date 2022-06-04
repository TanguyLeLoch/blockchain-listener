# Quick start

Clone the repository (via ssh):

```bash
git clone git@github.com:TanguyLeLoch/blockchain-listener.git
cd blockchain-listener
```

Create an instance of the Swapper contract, code of this contract is in the file `Swapper.sol` in the folder `contracts`. Note that you can run the bot in dry mode without it.

rename <code>.env-example</code> file to <code>.env</code> and fill it with your:

-   public key
-   private keys
-   moralis speedy node key
-   Swapper contract address

Then run the following command:

```bash
npm i
npm run server bsc
```

# Model

## Contract

-   address: address of the contract
-   color: Enum of [white, black , gray]
-   feeBuy: fee to buy the token
-   feeToSell: fee to buy the token
-   numberOfSeller: the number of different Seller

## Seller

-   sellerAddress : the address of the seller
-   contractAddress : the contract of the token sell

# Condition to front run

-   be profitable
-   the contract is whitelisted see condition below

# Condition to be white listed

-   no honeypot : at least 10 different seller
-   buy and sell fees are next to zero

# Condition to be black listed

-   blacklisting is a manual process only. Do a PUT on the contract endpoint. Example are available in the postman collection.
