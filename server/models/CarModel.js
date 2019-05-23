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
}

export default new Car();
