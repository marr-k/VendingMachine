const VendingMachine = require('../src/VendingMachine.js');
const Admin = require('../src/Admin.js');
const User = require('../src/User.js');
const Coins = require('../src/Coins.js');

describe('Use Cases', () => {
  const EMPTY_COINS = {
    quarters: 0,
    dimes: 0,
    nickles: 0,
    pennies: 0,
  };

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
      change: EMPTY_COINS,
    });

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(0.75);
    expect(vendingMachine.compartments[0].quantity).toBe(4);
    expect(vendingMachine.coinsTotal).toEqual(EMPTY_COINS);
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

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(0.75);
    expect(vendingMachine.compartments[0].quantity).toBe(4);
    expect(vendingMachine.coinsTotal).toEqual(EMPTY_COINS);
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

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(0);
    expect(vendingMachine.compartments[1].quantity).toBe(10);
    expect(vendingMachine.coinsTotal).toEqual({
      quarters: 2,
      dimes: 0,
      nickles: 0,
      pennies: 0
    });
  });

  it('Use Case 4', () => {
    // A generous User deposits $5 in quarters and walks away.
    user.deposit(new Coins({
      quarters: 20,
    }));

    // 2. A different (and lucky, and savvy) User
    const user2 = new User(vendingMachine);

    // checks the price of a Twix,
    expect(user2.checkPrice(0)).toEqual(0.75);
    // of a Sour Patch Kids,
    expect(user2.checkPrice(1)).toEqual(2.00);
    // and of an Atomic Warhead.
    expect(user2.checkPrice(2)).toEqual(0.50);

    // The second User buys an Atomic Warhead,
    const { change } = user2.buy(2);
    expect(change).toEqual({
      quarters: 18,
      dimes: 0,
      nickles: 0,
      pennies: 0,
    });

    // and, using the change she received, buys a Twix.
    user2.deposit(new Coins(change));
    expect(user2.buy(0).change).toEqual({
      quarters: 15,
      dimes: 0,
      nickles: 0,
      pennies: 0,
    });

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(1.25);
    expect(vendingMachine.compartments[0].quantity).toBe(4);
    expect(vendingMachine.compartments[1].quantity).toBe(10);
    expect(vendingMachine.compartments[2].quantity).toBe(2);
    expect(vendingMachine.coinsTotal).toEqual(EMPTY_COINS);
  });

  it('Use Case 5', () => {
    // 1. A generous User deposits $5 in quarters and walks away.
    user.deposit(new Coins({
      quarters: 20,
    }));

    /* 2. An Admin , having spied on the User ,
      retrieves all the deposited money from the VendingMachine . */
    expect(admin.retrieve()).toEqual({
      quarters: 20,
      dimes: 0,
      nickles: 0,
      pennies: 0,
    });

    /* 3. That Admin , sensing that he's surrounded by high rollers,
      raises the prices on all items by $.10. */
    admin.setPrice(0, 0.85);
    admin.setPrice(1, 2.10);
    admin.setPrice(2, 0.60);

    // 4. A different User , who has only quarters,
    const user2 = new User(vendingMachine);
    // checks the price on a Twix,
    expect(user2.checkPrice(0)).toBe(0.85);

    // deposits enough money to buy 3, and does so.
    user2.deposit(new Coins({
      quarters: 11,
    }));

    expect(user2.buy(0, 3)).toEqual({
      change: {
        quarters: 0,
        dimes: 2,
        nickles: 0,
        pennies: 0,
      },
    });

    // 5. That Admin retrieves all the deposited money from the VendingMachine
    const retrievedCoins = admin.retrieve();
    expect(retrievedCoins).toEqual({
      quarters: 10,
      dimes: 0,
      nickles: 1,
      pennies: 0,
    });

    // and counts it.
    expect(VendingMachine.countCoins(retrievedCoins)).toBe(2.55);

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(0);
    expect(vendingMachine.compartments[0].quantity).toBe(2);
    expect(vendingMachine.compartments[1].quantity).toBe(10);
    expect(vendingMachine.compartments[2].quantity).toBe(3);
    expect(vendingMachine.coinsTotal).toEqual(EMPTY_COINS);
  });

  it('Use Case 6', () => {
    // override beforeEach
    vendingMachine = new VendingMachine();

    admin = new Admin(vendingMachine);
    user = new User(vendingMachine);

    admin.loadProduct(0, 'Twix', 2);
    admin.setPrice(0, 0.75);

    admin.loadProduct(1, 'Sour Patch Kids', 10);
    admin.setPrice(1, 2);

    admin.loadProduct(2, 'Atomic Warheads', 3);
    admin.setPrice(2, 0.5);

    // 1. A User deposits enough money (in any denomination) to buy 2 Twixes and does so.
    user.deposit(new Coins({
      quarters: 4,
      dimes: 5,
    }));
    user.buy(0, 2);

    // 2. A different User deposits enough money to buy a Twix a tries to do so.
    const user2 = new User(vendingMachine);
    user2.deposit(new Coins({
      dimes: 7,
      pennies: 5,
    }));

    expect(user2.buy(0)).toEqual({
      message: 'Please make another selection.',
    });

    // 3. The second User realizes her error, checks the price of a Sour Patch Kids,
    expect(user2.checkPrice(1)).toBe(2);

    // adds enough money (in any denomination) to buy one,
    user2.deposit(new Coins({
      pennies: 125,
    }));

    // and does so.
    expect(user2.buy(1)).toEqual({
      change: {
        quarters: 0,
        dimes: 0,
        nickles: 0,
        pennies: 0,
      },
    });

    // check the vending machine state
    expect(vendingMachine.totalBought).toBe(3.5);
    expect(vendingMachine.compartments[0].quantity).toBe(0);
    expect(vendingMachine.compartments[1].quantity).toBe(9);
    expect(vendingMachine.compartments[2].quantity).toBe(3);
    expect(vendingMachine.coinsTotal).toEqual(EMPTY_COINS);
  });
});
