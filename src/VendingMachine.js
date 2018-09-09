module.exports = class VendingMachine {
  constructor() {
    this.compartments = new Array(10);
    this.initCoinsTotal();
    this.totalBought = 0;

    for (let i = 0; i < 10; i += 1) {
      this.compartments[i] = {
        name: null,
        quantity: 0,
        price: null,
      };
    }
  }

  static toCurrency(number) {
    return `$${(number).toFixed(2)}`;
  }

  static getChange(totalChange) {
    const change = {
      quarters: 0,
      dimes: 0,
      nickles: 0,
      pennies: 0,
    };

    let runningTotal = +(totalChange * 100).toFixed(2);
    change.quarters = Math.floor(runningTotal / 25);
    runningTotal %= 25;
    change.dimes = Math.floor(runningTotal / 10);
    runningTotal %= 10;
    change.nickles = Math.floor(runningTotal / 5);
    change.pennies = runningTotal % 5;

    return change;
  }

  static countCoins(coins) {
    return +(coins.quarters * 0.25
      + coins.dimes * 0.10
      + coins.nickles * 0.05
      + coins.pennies * 0.01).toFixed(2);
  }

  initCoinsTotal() {
    this.coinsTotal = {
      quarters: 0,
      dimes: 0,
      nickles: 0,
      pennies: 0,
    };
  }

  getCompartment(compartmentIndex) {
    if (compartmentIndex < 0 || compartmentIndex > 9 || typeof compartmentIndex !== 'number') {
      throw new Error('There are only 10 compartments in the range of 0-9 inclusive');
    }

    return this.compartments[compartmentIndex];
  }

  load(compartmentIndex, name, quantity) {
    const compartment = this.getCompartment(compartmentIndex);

    if (compartment.quantity + quantity > 10) {
      throw new Error('There can be at most 10 products in a compartment');
    }

    if (compartment.quantity === 0) {
      compartment.name = name;
      compartment.quantity = quantity;
    } else {
      if (compartment.name !== name) {
        throw new Error('There can be only one product per compartment');
      }
      compartment.quantity += quantity;
    }
  }

  setPrice(compartmentIndex, price) {
    const compartment = this.getCompartment(compartmentIndex);

    compartment.price = price;
  }

  checkPrice(compartmentIndex) {
    const compartment = this.getCompartment(compartmentIndex);

    return compartment.price;
  }

  get balance() {
    return VendingMachine.countCoins(this.coinsTotal);
  }

  deposit(coins) {
    this.coinsTotal.quarters += coins.quarters;
    this.coinsTotal.dimes += coins.dimes;
    this.coinsTotal.nickles += coins.nickles;
    this.coinsTotal.pennies += coins.pennies;
  }

  retrieve() {
    const result = +(this.totalBought + this.balance).toFixed(2);

    this.totalBought = 0;
    this.initCoinsTotal();

    return VendingMachine.getChange(result);
  }

  buy(compartmentIndex, quantity) {
    const compartment = this.getCompartment(compartmentIndex);

    const delta = +(this.balance - compartment.price * quantity).toFixed(2);

    let result;

    if (delta < 0) {
      result = {
        message: `Please add ${VendingMachine.toCurrency(delta * -1)}`,
      };
    } else if (compartment.quantity < quantity) {
      result = {
        message: 'Please make another selection.',
      };
    } else {
      this.totalBought = compartment.price * quantity;
      compartment.quantity -= quantity;
      this.initCoinsTotal();

      if (delta === 0) {
        result = {
          change: {
            quarters: 0,
            dimes: 0,
            nickles: 0,
            pennies: 0,
          },
        };
      } else {
        result = {
          change: VendingMachine.getChange(delta),
        };
      }
    }

    return result;
  }
};
