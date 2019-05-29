import carsData from '../test/carsData';

class Car {
  constructor() {
    this.cars = carsData;
  }
  /**
   * @description - creates a car advert
   * @params {object}
   * @return {object}
   */

  createCar(data) {
    const newCar = {
      id: Math.floor(Math.random() * 100000) + 1 + Date.now(),
      owner: data.owner || '',
      created_on: new Date().toLocaleString(),
      state: data.state || '',
      status: data.status || 'available',
      price: data.price || 0,
      manufacturer: data.manufacturer || '',
      model: data.model || '',
      body_type: data.body_type || '',
      description: data.description || '',
      img: data.img || '',
    };
    this.cars.push(newCar);
    return newCar;
  }

  getAllCars() {
    return this.cars;
  }

  /**
   * @description - select cars owned by the user
   * @param {string} owner
   * @param {object} carToAdd
   * @returns {boolean}
   */
  similarUserCar(owner, carToAdd) {
    const onwerCars = []; let result = false;
    this.cars.forEach((car) => {
      if (car.owner === owner) {
        onwerCars.push(car);
      }
    });

    if (onwerCars.length > 0) {
      onwerCars.find((car) => {
        if (!this.constructor.compareCars(car, carToAdd)) {
          result = true;
        }
        return result;
      });
    }
    return result;
  }

  /**
   * @description - return a single ad
   * @param {integer} adId
   * @returns {object}
   */
  findSingle(id) {
    return this.cars.find(car => parseInt(car.id, 10) === parseInt(id, 10));
  }

  /**
   * @description - compare two selected cars
   * @param {object} car1
   * @param {object} car2
   * @returns boolean
   */
  static compareCars(car1, car2) {
    const keysToCompare = ['state', 'status', 'manufacturer', 'model', 'body_type'];

    // true means not equal, false means equal
    return keysToCompare.some(key => (car1[key] !== car2[key]));
  }

  /**
   * @description - get all unsold cars by given property - body type, manufacturer or state
   * @param {string} ppty - gotten from the req object
   * @param {string} val - gotten from the req object
   */
  getUnsoldCarsByProperty(ppty, val) {
    return this.cars.filter(car => car.status.toLowerCase() === 'available' && car[ppty].toLowerCase() === val.toLowerCase());
  }

  /**
   * @description -get all unsold cars
   * @returns {Array}
   */
  getAllUnsoldCars() {
    return this.cars.filter(car => car.status.toLocaleLowerCase() === 'available');
  }

  /**
   * @description - update ad
   * @param {Integer} id
   * @param {Object} updateData
   * @returns {Object}
   */
  completeUpdate(id, updateData) {
    const car = this.findSingle(id);
    car.state = updateData.state || car.state;
    car.status = updateData.status || car.status;
    car.price = updateData.price || car.price;
    car.description = updateData.description || car.description;
    return car;
  }

  updateAdStatus(id, updateData) {
    const car = this.findSingle(id);

    car.status = updateData.status || car.status;
    return car;
  }

  /**
   * @description - get cars within a price range
   * @param {Number} min
   * @param {Number} max
   * @returns {Array}
   */
  getCarsWithinPriceRange(min, max) {
    return this.cars.filter(car => parseInt(car.price, 10)
      >= parseInt(min, 10) && parseInt(car.price, 10) <= parseInt(max, 10));
  }
}

export default new Car();
