module.exports = class Admin {
  constructor(vendingMachine) {
    this.vendingMachine = vendingMachine;
  }

  loadProduct(compartment, name, quantity) {
    this.vendingMachine.load(compartment, name, quantity);
  }

  setPrice(compartment, price) {
    this.vendingMachine.setPrice(compartment, price);
  }
};
