const errorDisplay = document.getElementById('errorDisplay');

window.addEventListener('DOMContentLoaded', async (event) => {
  event.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/v1/ads/me', {
      method: 'get',
      headers: {
        'Content-Type': 'application/Json',
      },
    });
    const responseToJson = await response.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;
      return data;
    }
    return responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
