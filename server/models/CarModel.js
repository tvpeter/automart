
class Car {
  constructor() {
    this.cars = [
      {
        id: 1558731168820,
        owner: 1558730737306,
        created_on: '5/24/2019, 9:51:34 PM',
        state: 'New',
        status: 'available',
        price: '12000000',
        manufacturer: 'AUDI',
        model: 'SPORT UV',
        body_type: 'car',
        description: 'This is the description of the car',
        img: 'http://res.cloudinary.com/tvpeter/image/upload/v1558731093/vkjzwklvedrocyyerzyr.jpg',
      },
      {
        id: 1558731356445,
        owner: 1558730737306,
        created_on: '5/24/2019, 9:55:03 PM',
        state: 'New',
        status: 'available',
        price: '20000000',
        manufacturer: 'Mercedes',
        model: 'CLA Classic',
        body_type: 'car',
        description: 'This is the description of the car',
        img: 'http://res.cloudinary.com/tvpeter/image/upload/v1558731303/ngtkcuygfxmtxgpywsjg.jpg',
      },
      {
        id: 1558731607229,
        owner: 1558730737306,
        created_on: '5/24/2019, 9:59:37 PM',
        state: 'Old',
        status: 'available',
        price: '7000000',
        manufacturer: 'BMW',
        model: 'Class 5',
        body_type: 'car',
        description: 'This is the description of the car',
        img: 'http://res.cloudinary.com/tvpeter/image/upload/v1558731577/uiqu5bj63lyxjhlaxkyu.jpg',
      },
      {
        id: 1558731657092,
        owner: 1558730737306,
        created_on: '5/24/2019, 10:00:14 PM',
        state: 'Old',
        status: 'available',
        price: '60000000',
        manufacturer: 'BMW',
        model: 'Class 3',
        body_type: 'car',
        description: 'This is the description of the car',
        img: 'http://res.cloudinary.com/tvpeter/image/upload/v1558731614/man4tmwmim5zvum4zspt.jpg',
      },
    ];
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

  getUnsoldCarsByManufactuer(manufacturer) {
    return this.cars.filter(car => car.status.toLowerCase() === 'available' && car.manufacturer.toLowerCase() === manufacturer.toLowerCase());
  }
}

export default new Car();
