
const validateData = (newCar) => {
  const requiredProperties = ['owner', 'state', 'status', 'price', 'manufacturer', 'model', 'body_type', 'description'];
  return requiredProperties.find(property => newCar[property] === undefined || newCar[property] === '');
};
export default validateData;
