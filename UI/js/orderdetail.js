const orderId = window.location.href.split('=')[1];
const errorDisplay = document.querySelector('#errorDisplay');

// eslint-disable-next-line consistent-return
window.addEventListener('DOMContentLoaded', async (e) => {
  e.preventDefault();

  try {
    const orderDetail = await fetch(`https://tvpautomart.herokuapp.com/api/v1/orders/${orderId}`, {
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
      document.querySelector('#buyerid').textContent = data.buyer_id;
      document.querySelector('#carid').textContent = data.car_id;
      document.querySelector('#carid').parentNode.href = `./details.html?pid=${data.car_id}`;
      document.querySelector('#sellerid').textContent = data.seller_id;
      document.querySelector('#priceoffer').textContent = data.price_offered;
      document.querySelector('#date').textContent = data.date;
      document.querySelector('#status').textContent = data.status;
      document.querySelector('#updated').textContent = data.updated_at;
      // const buyButton = document.querySelector('.txt-center a');

      if (localStorage.getItem('uid') === data.seller_id) {
        const div = document.createElement('div');
        div.classList.add('row');

        const button = document.createElement('button');
        const text = document.createTextNode('Edit');
        button.classList.add('btn');
        button.appendChild(text);
        div.appendChild(button);

        document.querySelector('#orderDetail').appendChild(div);
      }
    }
    errorDisplay.textContent = responseToJson.error;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
