/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
const postResource = async (postUrl, data, destination, errorElement, statusCode) => {
  try {
    const response = await fetch(postUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseToJson = await response.json();
    if (responseToJson.status !== statusCode) {
      // eslint-disable-next-line no-return-assign
      return (`${errorElement.textContent = responseToJson.message}`);
    }
    localStorage.setItem('name', responseToJson.data.first_name);
    localStorage.setItem('uid', responseToJson.data.id);
    localStorage.setItem('auth', responseToJson.data.token);
    // eslint-disable-next-line no-return-assign
    return window.location.href = destination;
  } catch (error) {
    // eslint-disable-next-line no-return-assign
    return (`${errorElement.textContent = error.message}`);
  }
};
