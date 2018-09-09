const VendingMachine = require('../src/VendingMachine.js');
const Coins = require('../src/Coins.js');

describe('VendingMachine', () => {
  let vendingMachine;

  beforeEach(() => {
    vendingMachine = new VendingMachine();
  });

  describe('toCurrency', () => {
    it('returns the correct formatting for 1 dollar', () => {
      expect(VendingMachine.toCurrency(1)).toEqual('$1.00');
    });
    it('returns the correct formatting for 1 cent', () => {
      expect(VendingMachine.toCurrency(0.01)).toEqual('$0.01');
    });
    it('returns the correct formatting for 50 cents', () => {
      expect(VendingMachine.toCurrency(0.50)).toEqual('$0.50');
    });
  });

  describe('getChange', () => {
    it('calculates the correct change for 0 cents', () => {
      expect(VendingMachine.getChange(0)).toEqual({
        quarters: 0,
        dimes: 0,
        nickles: 0,
        pennies: 0,
      });
    });

    it('calculates the correct change for 1 cent', () => {
      expect(VendingMachine.getChange(0.01)).toEqual({
        quarters: 0,
        dimes: 0,
        nickles: 0,
        pennies: 1,
      });
    });

    it('calculates the correct change for 100 cents', () => {
      expect(VendingMachine.getChange(1)).toEqual({
        quarters: 4,
        dimes: 0,
        nickles: 0,
        pennies: 0,
      });
    });

    it('calculates the correct change for 255 cents', () => {
      expect(VendingMachine.getChange(2.55)).toEqual({
        quarters: 10,
        dimes: 0,
        nickles: 1,
        pennies: 0,
      });
    });
  });

  describe('getCompartment', () => {
    it('returns the compartment for the given index', () => {
      expect(vendingMachine.getCompartment(0)).toEqual({
        name: null,
        quantity: 0,
        price: null,
      });
    });

    it('throws an exception if the index is below bounds', () => {
      expect(() => {
        vendingMachine.getCompartment(-1);
      }).toThrow(new Error('There are only 10 compartments in the range of 0-9 inclusive'));
    });

    it('throws an exception if the index is above bounds', () => {
      expect(() => {
        vendingMachine.getCompartment(10);
      }).toThrow(new Error('There are only 10 compartments in the range of 0-9 inclusive'));
    });

    it('throws an exception if the index is not a number', () => {
      expect(() => {
        vendingMachine.getCompartment('foo');
      }).toThrow(new Error('There are only 10 compartments in the range of 0-9 inclusive'));
    });
  });

  describe('load', () => {
    it('sets name and quanity if the compartment is empty', () => {
      vendingMachine.load(0, 'foo', 1);

      expect(vendingMachine.getCompartment(0)).toEqual({
        name: 'foo',
        quantity: 1,
        price: null,
      });
    });
    it('throws an exception if the compartment is not empty and we are adding a different product', () => {
      vendingMachine.load(0, 'foo', 1);
      expect(() => {
        vendingMachine.load(0, 'bar', 1);
      }).toThrow(new Error('There can be only one product per compartment'));
    });
    it('throws an exception if we initially try to load in excess the compartments capacity', () => {
      expect(() => {
        vendingMachine.load(0, 'foo', 11);
      }).toThrow(new Error('There can be at most 10 products in a compartment'));
    });
    it('throws an exception we add more to compartment exceeding the compartments capacity', () => {
      vendingMachine.load(0, 'foo', 5);
      expect(() => {
        vendingMachine.load(0, 'foo', 6);
      }).toThrow(new Error('There can be at most 10 products in a compartment'));
    });
    it('allows the quantity to be updated', () => {
      vendingMachine.load(0, 'foo', 5);
      vendingMachine.load(0, 'foo', 2);

      expect(vendingMachine.getCompartment(0)).toEqual({
        name: 'foo',
        quantity: 7,
        price: null,
      });
    });
  });

  describe('deposit', () => {
    it('updates the balance with the correct amount', () => {
      vendingMachine.deposit(new Coins({
        quarters: 1,
        dimes: 1,
        nickles: 1,
        pennies: 1,
      }));

      expect(vendingMachine.balance).toBe(0.41);
    });

    it('updates the balance with the correct amount after multiple deposits', () => {
      vendingMachine.deposit(new Coins({
        quarters: 1,
        dimes: 1,
        nickles: 1,
        pennies: 1,
      }));

      vendingMachine.deposit(new Coins({
        quarters: 1,
      }));

      expect(vendingMachine.balance).toBe(0.66);
    });
  });

  describe('setPrice/checkPrice', () => {
    it('should return the correct price', () => {
      vendingMachine.setPrice(1, 1.25);

      expect(vendingMachine.checkPrice(1)).toBe(1.25);
    });
  });

  describe('retrieve', () => {
    it('should add all sales + all pending change', () => {
      vendingMachine.load(0, 'foo', 1);
      vendingMachine.setPrice(0, 0.25);
      vendingMachine.deposit(new Coins({
        quarters: 1,
      }));
      vendingMachine.buy(0, 1);

      vendingMachine.deposit(new Coins({
        quarters: 1,
        dimes: 1,
        nickles: 1,
        pennies: 1,
      }));

      expect(vendingMachine.retrieve()).toEqual({
        quarters: 2,
        dimes: 1,
        nickles: 1,
        pennies: 1,
      });
    });
  });

  describe('buy', () => {
    it('returns no change when the exact amount is deposited', () => {
      vendingMachine.load(0, 'foo', 1);
      vendingMachine.setPrice(0, 0.25);
      vendingMachine.deposit(new Coins({
        quarters: 1,
      }));

      expect(vendingMachine.buy(0, 1)).toEqual({
        change: {
          quarters: 0,
          dimes: 0,
          nickles: 0,
          pennies: 0,
        },
      });
    });

    it('returns a message there is not enough money deposited', () => {
      vendingMachine.load(0, 'foo', 1);
      vendingMachine.setPrice(0, 1.25);
      vendingMachine.deposit(new Coins({
        pennies: 2,
      }));

      expect(vendingMachine.buy(0, 1)).toEqual({
        message: 'Please add $1.23',
      });
    });

    it('returns change if there is money leftover', () => {
      vendingMachine.load(0, 'foo', 1);
      vendingMachine.setPrice(0, 1.25);
      vendingMachine.deposit(new Coins({
        quarters: 8,
      }));

      expect(vendingMachine.buy(0, 1)).toEqual({
        change: {
          quarters: 3,
          dimes: 0,
          nickles: 0,
          pennies: 0,
        },
      });
    });

    it('sets the balance to 0', () => {
      vendingMachine.load(0, 'foo', 1);
      vendingMachine.setPrice(0, 1.25);
      vendingMachine.deposit(new Coins({
        quarters: 8,
      }));

      vendingMachine.buy(0, 1);

      expect(vendingMachine.balance).toBe(0);
    });

    it('you can buy many items', () => {
      vendingMachine.load(0, 'foo', 2);
      vendingMachine.setPrice(0, 0.25);
      vendingMachine.deposit(new Coins({
        quarters: 2,
      }));

      expect(vendingMachine.buy(0, 2)).toEqual({
        change: {
          quarters: 0,
          dimes: 0,
          nickles: 0,
          pennies: 0,
        },
      });
    });

    it('you can\'t buy more items than are in stock', () => {
      vendingMachine.load(0, 'foo', 2);
      vendingMachine.setPrice(0, 0.25);
      vendingMachine.deposit(new Coins({
        quarters: 3,
      }));

      expect(vendingMachine.buy(0, 3)).toEqual({
        message: 'Please make another selection.',
      });
    });
  });
});
