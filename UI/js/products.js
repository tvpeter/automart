const errorDisplay = document.querySelector('#errorDisplay');
const displayArea = document.querySelector('.product-grids');

window.addEventListener('DOMContentLoaded', async (event) => {
  event.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/v1/car?status=available', {
      method: 'get',
      headers: {
        'Content-Type': 'application/Json',
      },
    });
    const responseToJson = await response.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;
      data.forEach((car) => {
        const manufacturer = car.manufacturer.toUpperCase();
        const state = car.state.charAt(0).toUpperCase() + car.state.slice(1);
        const ad = `<div class='product-grid'>
        <div class='product-pic'>
          <a href='details.html'><img src='${car.img}' title='${car.model}' /></a>
          <p>
            <a href="#"><small>${manufacturer} </small> ${car.model}</a>
            <span>${state}</span> </p>
        </div>
        <div class="product-info">
          <div class="product-info-cust">
            <a href="details.html">Details</a>
          </div>
          <div class="product-info-price">
            N${car.price}
          </div>
          <div class="clear"> </div>
        </div>
      </div>`;
        displayArea.innerHTML += ad;
      });
    }
    // eslint-disable-next-line no-return-assign
    return errorDisplay.textContent = responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
