require('dotenv').config();

const pairWhiteListe = new Map();
pairWhiteListe.set('bsc', [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'.toUpperCase(), // WBNB
    // "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
    // "0x55d398326f99059ff775485246999027b3197955", // USDT
]);
pairWhiteListe.set('bsctestnet', [
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'.toUpperCase(), // WBNB
]);

const swapperFrontRunner = new Map();
swapperFrontRunner.set('bsc', process.env.BSC_SWAPPER_ADDRESS);

module.exports = { pairWhiteListe, swapperFrontRunner };
