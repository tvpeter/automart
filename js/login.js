const signInUrl = '/api/v1/auth/signin';
const loginForm = document.getElementById('loginForm');
const displayError = document.getElementById('errorDisplay');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const { elements } = loginForm;
  const data = {
    email: elements.namedItem('email').value,
    password: elements.namedItem('password').value,
  };

  try {
    const response = await fetch(signInUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseToJson = await response.json();
    if (responseToJson.status !== 200) {
      displayError.textContent = responseToJson.message;
    } else {
      window.location.href = '/profile';
    }
  } catch (error) {
    displayError.textContent = error.message;
  }
});
