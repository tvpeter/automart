const tableToCreate = document.querySelector('table');
const errorDisplay = document.getElementById('errorDisplay');


const generateTableCells = (data) => {
  let sn = 0;
  data.forEach((element) => {
    const row = tableToCreate.insertRow();
    sn += 1;
    const snCell = row.insertCell();
    snCell.textContent = sn;
    const idCell = row.insertCell();
    idCell.innerHTML = `<a href='./orderdetail.html?orderid=${element.id}'>${element.id}</a>`;
    const amountRow = row.insertCell();
    amountRow.textContent = `${element.price_offered}`;
    const dateRow = row.insertCell();
    dateRow.textContent = `${element.updated_at}`;
    const statusRow = row.insertCell();
    statusRow.textContent = `${element.status}`;
  });
};

const generateTable = (data) => {
  const tableHeaders = ['SN', 'Transaction ID', 'Amount', 'Date', 'Status'];

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
    const response = await fetch('https://tvpautomart.herokuapp.com/api/v1/orders/me', {
      method: 'get',
      headers: {
        'Content-Type': 'application/Json',
        'x-auth': `${localStorage.getItem('auth')}`,
      },
    });
    const responseToJson = await response.json();
    if (responseToJson.data.length > 0) {
      const { data } = responseToJson;
      return generateTable(data);
    }

    // eslint-disable-next-line no-return-assign
    return errorDisplay.textContent = responseToJson.error;
  } catch (error) {
    const message = 'There\'s an error loading your data, please retry';
    errorDisplay.textContent = message;
    return errorDisplay;
  }
});
