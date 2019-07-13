/* eslint-disable consistent-return */
const errorDisplay = document.querySelector('#errorDisplay');
window.addEventListener('DOMContentLoaded', async (e, id) => {
  e.preventDefault();

  try {
    const adDetail = await fetch(`http://localhost:5000/api/v1/car/${id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(adDetail);
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
