module.exports = class Admin {
  constructor(vendingMachine) {
    this.vendingMachine = vendingMachine;
  }

  checkPrice(compartmentIndex) {
    return this.vendingMachine.checkPrice(compartmentIndex);
  }

  deposit(coins) {
    this.vendingMachine.deposit(coins);
  }

  buy(compartmentIndex) {
    return this.vendingMachine.buy(compartmentIndex);
  }
};
