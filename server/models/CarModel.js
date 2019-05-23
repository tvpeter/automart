class Car {
  constructor() {
    this.cars = [];
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
      img: [...data.img] || [],
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
}

export default new Car();
