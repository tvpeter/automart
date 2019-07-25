if (localStorage.length < 1 || localStorage.getItem('uid') === null || localStorage.getItem('name') === null || localStorage.getItem('auth') === null) {
  localStorage.clear();
  window.location.href = './login.html';
}

const welcome = document.querySelector('.top-header-right span');
welcome.textContent = `Hello ${localStorage.getItem('name')}`;

const productId = window.location.href.split('=')[1];
const errorDisplay = document.querySelector('#errorDisplay');

// eslint-disable-next-line consistent-return
window.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault();

  try {
    const adDetail = await fetch(`https://tvpautomart.herokuapp.com/api/v1/car/${productId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
    });
    const responseToJson = await adDetail.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;

      const table = document.getElementById('table');
      const row = table.insertRow();
      const snCell = row.insertCell();
      snCell.textContent = '1';
      const idCell = row.insertCell();
      idCell.innerHTML = `<img src='${data.image_url}'/>`;
      const modelCell = row.insertCell();
      modelCell.textContent = `${data.manufacturer + data.model}`;
      const stateCell = row.insertCell();
      stateCell.textContent = `${data.state}`.charAt(0).toUpperCase() + `${data.state}`.slice(1);
      const cState = row.insertCell();
      cState.textContent = `N${data.price}`;
      document.getElementById('pid').value = productId;
    }
    errorDisplay.textContent = responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});


const createOrderUrl = 'https://tvpautomart.herokuapp.com/api/v1/order';
const createOrder = document.getElementById('createOrderForm');

createOrder.addEventListener('click', async (event) => {
  event.preventDefault();

  const data = {
    carId: productId,
    priceOffered: document.getElementById('price').value,
  };

  try {
    const response = await fetch(createOrderUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
      body: JSON.stringify(data),
    });

    const newOrder = await response.json();
    if (newOrder.status !== 201) {
      // eslint-disable-next-line no-return-assign
      return errorDisplay.textContent = newOrder.message;
    }
    // eslint-disable-next-line no-return-assign
    return window.location.href = `./orderdetail.html?orderid=${newOrder.data.id}`;
  } catch (error) {
    // eslint-disable-next-line no-return-assign
    return errorDisplay.textContent = error.message;
  }
});
