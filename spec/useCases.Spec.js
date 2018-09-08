const VendingMachine = require('../src/VendingMachine.js');
const Admin = require('../src/Admin.js');
const User = require('../src/User.js');
const Coins = require('../src/Coins.js');

describe('Use Cases', () => {
  let vendingMachine;
  let admin;
  let user;

  beforeEach(() => {
    /* An Admin loads a VendingMachine with 5 Twixes (price: $.75 each),
      10 Sour Patch Kids (price: $2.00 each),
      and 3 Atomic Warheads (price: $.50 each)' */
    vendingMachine = new VendingMachine();

    admin = new Admin(vendingMachine);
    user = new User(vendingMachine);

    admin.loadProduct(0, 'Twix', 5);
    admin.setPrice(0, 0.75);

    admin.loadProduct(1, 'Sour Patch Kids', 10);
    admin.setPrice(1, 2);

    admin.loadProduct(2, 'Atomic Warheads', 3);
    admin.setPrice(2, 0.5);
  });

  it('Use Case 1', () => {
    // 1. A savvy User checks the price of a Twix.
    expect(user.checkPrice(0)).toBe(0.75);

    // 2. That User deposits $.75 in quarters
    user.deposit(new Coins({
      quarters: 3,
    }));

    // and buys a Twix.
    expect(user.buy(0)).toEqual({
      change: {
        quarters: 0,
        dimes: 0,
        nickles: 0,
        pennies: 0,
      },
    });
  });

  it('Use Case 2', () => {
    // A naive User deposits $1.00 in quarters
    user.deposit(new Coins({
      quarters: 4,
    }));

    // and buys a Twix.
    expect(user.buy(0)).toEqual({
      change: {
        quarters: 1,
        dimes: 0,
        nickles: 0,
        pennies: 0,
      },
    });
  });

  it('Use Case 3', () => {
    // A naive User deposits $.50 in dimes
    user.deposit(new Coins({
      quarters: 2,
    }));

    // and tries to buy a Sour Patch Kids.
    expect(user.buy(1)).toEqual({
      message: 'Please add $1.50',
    });
  });
});
