const signupUrl = '/api/v1/auth/signup';
const form = document.getElementById('form1');
const display = document.getElementById('errorDisplay');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { elements } = form;
  const formdata = {
    first_name: elements.namedItem('firstname').value,
    last_name: elements.namedItem('lastname').value,
    email: elements.namedItem('email').value,
    phone: elements.namedItem('phone').value,
    account_number: elements.namedItem('account').value,
    bank: elements.namedItem('bank').value,
    address: elements.namedItem('address').value,
    password: elements.namedItem('password').value,
    password_confirmation: elements.namedItem('password_confirmation').value,
  };

  try {
    const response = await fetch(signupUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formdata),
    });
    const responseToJson = await response.json();
    if (responseToJson.status !== 201) {
      display.textContent = responseToJson.message;
    } else {
      window.location.href = '/userprofile';
    }
  } catch (error) {
    display.textContent = error.message;
  }
});
