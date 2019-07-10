const errorDisplay = document.getElementById('errorDisplay');


const tableToCreate = document.querySelector('table');


const generateTableCells = (data) => {
  let sn = 0;
  data.forEach((element) => {
    const row = tableToCreate.insertRow();
    sn += 1;
    const snCell = row.insertCell();
    snCell.textContent = sn;
    const idCell = row.insertCell();
    idCell.innerHTML = `<a href='./updatead.html'>${element.id}</a>`;
    const modelCell = row.insertCell();
    modelCell.textContent = element.model;
    const stateCell = row.insertCell();
    stateCell.textContent = element.state;
    const cState = row.insertCell();
    cState.innerHTML = '<button><a href=\'./updatestatus.html\'>Change</a></button>';
    const statusCell = row.insertCell();
    statusCell.textContent = element.status;
    const priceCell = row.insertCell();
    priceCell.textContent = `N${element.price}`;
  });
};

const generateTable = (data) => {
  const tableHeaders = ['SN', 'AD ID', 'NAME', 'STATE', 'CHANGE STATE', 'TRANSACTION ID', 'PRICE'];

  const thead = tableToCreate.createTHead();
  const row = thead.insertRow();

  tableHeaders.forEach((header) => {
    const th = document.createElement('th');
    const text = document.createTextNode(header);
    th.appendChild(text);
    row.appendChild(th);
  });

  generateTableCells(data);
};

window.addEventListener('DOMContentLoaded', async (event) => {
  event.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/v1/ads/me', {
      method: 'get',
      headers: {
        'Content-Type': 'application/Json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
    });
    const responseToJson = await response.json();
    if (responseToJson.status === 200) {
      const { data } = responseToJson;
      return generateTable(data);
    }
    // eslint-disable-next-line no-return-assign
    return errorDisplay.textContent = responseToJson.message;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
