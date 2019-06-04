
const validateData = (requiredProperties, data) => requiredProperties.find(property => data[property] === undefined || data[property] === '');
export default validateData;
