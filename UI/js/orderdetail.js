const orderId = window.location.href.split('=')[1];
const errorDisplay = document.querySelector('#errorDisplay');

// eslint-disable-next-line consistent-return
window.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault();

  try {
    const orderDetail = await fetch(`https://localhost:5000/api/v1/orders/${orderId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
    });
    const responseToJson = await orderDetail.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;
      document.querySelector('#orderid').textContent = data.id;
      document.querySelector('#buyerid').textContent = data.buyerid;
      document.querySelector('#carid').textContent = data.carid;
      document.querySelector('#carid').parentNode.href = `./details.html?pid=${data.carid}`;
      document.querySelector('#sellerid').textContent = data.sellerid;
      document.querySelector('#priceoffer').textContent = data.priceoffered;
      document.querySelector('#date').textContent = data.date;
      document.querySelector('#status').textContent = data.status;
      document.querySelector('#updated').textContent = data.updated_at;
      // const buyButton = document.querySelector('.txt-center a');
    }
    errorDisplay.textContent = responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
