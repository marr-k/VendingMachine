module.exports = class Coins {
  constructor({
    quarters = 0,
    dimes = 0,
    nickles = 0,
    pennies = 0,
  }) {
    this.quarters = quarters;
    this.dimes = dimes;
    this.nickles = nickles;
    this.pennies = pennies;
  }
};
