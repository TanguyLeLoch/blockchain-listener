var Ctx = (function () {
    var constructeur = function () {
        this.log = undefined;
        this.mongoose = undefined;
        this.web3 = undefined;
        this.accounts = [];
        this.chain = undefined;
        this.router = undefined;
        this.factory = undefined;
        this.initCodeHash = undefined;
        this.routerContract = undefined;
        this.feePair;

        this.swapperFrontRunnerAddress = undefined;

        this.botFrontRunnerEnabled = true;
        this.deleteTransaction = true;
        this.traddingEnabled = true;
    };

    var instance = null;
    return new (function () {
        this.getInstance = function () {
            if (instance == null) {
                instance = new constructeur();
                instance.constructeur = null;
            }
            return instance;
        };
    })();
})();

module.exports = Ctx;
