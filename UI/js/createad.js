/* eslint-disable no-return-assign */

const createadUrl = 'https://tvpautomart.herokuapp.com/api/v1/car';
const displayError = document.getElementById('errorDisplay');
const createadForm = document.getElementById('createadForm');

createadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { elements } = createadForm;
  const data = new FormData();
  data.append('state', elements.namedItem('state').value.toString());
  data.append('price', elements.namedItem('price').value.toString());
  data.append('manufacturer', elements.namedItem('manufacturer').value.toString());
  data.append('model', elements.namedItem('model').value.toString());
  data.append('body_type', elements.namedItem('bodytype').value.toString());
  data.append('description', elements.namedItem('description').value.toString());
  data.append('img', elements.namedItem('img').files[0]);

  try {
    const response = await fetch(createadUrl, {
      method: 'post',
      headers: {
        'x-auth': `${localStorage.getItem('auth')}`,
      },
      body: data,
    });
    const responseToJson = await response.json();
    if (responseToJson.status !== 201) {
      return displayError.textContent = responseToJson.message;
    }
    return (window.location.href = './userads.html');
  } catch (error) {
    return displayError.textContent = error.message;
  }
});
