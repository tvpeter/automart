const productId = window.location.href.split('=')[1];
const errorDisplay = document.querySelector('#errorDisplay');

// eslint-disable-next-line consistent-return
window.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault();

  try {
    const adDetail = await fetch(`http://localhost:5000/api/v1/car/${productId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseToJson = await adDetail.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;
      const manufacturer = data.manufacturer.toUpperCase();
      document.querySelector('.imgslide').src = data.img;
      document.querySelector('.col-55 h1').textContent = `${manufacturer}  ${data.model}`;
      document.querySelector('.vehicle-detail-info').textContent = data.description;
      document.querySelector('.vehicle-info p').textContent = `Price: N${data.price}`;
      document.querySelector('.vehicle-info span').textContent = data.state;
      const buyButton = document.querySelector('.txt-center a');
      buyButton.href = `./order.html?pid=${productId}`;
    }
    errorDisplay.textContent = responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
