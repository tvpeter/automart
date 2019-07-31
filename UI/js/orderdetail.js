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

      if (localStorage.getItem('uid') === data.seller_id && data.status !== 'completed') {
        const div = document.createElement('div');
        div.classList.add('row');

        const input = document.createElement('input');
        input.type = 'submit';
        input.className = 'btn';
        input.id = 'acceptOffer';
        input.value = 'accept';
        div.appendChild(input);

        const rejectButton = document.createElement('input');
        rejectButton.type = 'submit';
        rejectButton.classList.add('btn');
        rejectButton.value = 'reject';
        rejectButton.id = 'rejectOffer';
        div.appendChild(rejectButton);

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


const rejectOffer = document.querySelector('#rejectOffer');

// eslint-disable-next-line consistent-return
rejectOffer.addEventListener('click', async (event) => {
  event.preventDefault();
  console.log('clicked');
  try {
    const rejectsOffer = await fetch(`https://tvpautomart.herokuapp.com/api/v1/order/${orderId}/status`, {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
      body: JSON.stringify({ status: 'rejected' }),
    });

    const response = await rejectsOffer.json();

    if (response.status === 200) {
      window.location.reload();
    }
    errorDisplay.textContent = response.error;
  } catch (error) {
    const message = 'There\'s an error, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
