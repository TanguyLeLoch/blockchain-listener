var Database = (function () {
  var constructeur = function () {
    this.whiteListeContract = [];
    this.blackListContract = [];
    this.grayListContract = [];
    this.pairWhiteListe = undefined;
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

module.exports = Database;
