/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable no-alert */
const confirmAction = (btn, msg) => {
  const btnClick = document.querySelector(`#${btn}`);
  const modal = document.querySelector('.modal');

  btnClick.addEventListener('click', () => {
    const h4 = document.querySelector('.modal h4');

    h4.innerHTML = `Are you sure you want to ${msg}?`;
    modal.style.display = 'block';
  });

  const yes = document.querySelector('#yes');
  const no = document.querySelector('#no');

  yes.addEventListener('click', () => {
    alert(`You agreed to ${msg}`);
    modal.style.display = 'none';
  });

  no.addEventListener('click', () => {
    alert('Alright, that\'s a no');
    modal.style.display = 'none';
  });
};

const filterTable = (table) => {
  let status;
  const search = document.querySelector('.search');
  const filter = search.value.toUpperCase();
  const tr = table.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i += 1) {
    const td = tr[i].getElementsByTagName('td');
    for (let j = 0; j < td.length; j += 1) {
      if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
        status = true;
      }
    }
    if (status) {
      tr[i].style.display = '';
      status = false;
    } else if (tr[i] !== tr[0]) {
      tr[i].style.display = 'none';
    }
  }
};

const displayImages = document.querySelectorAll('.imgslide');
const switchImage = (imgId) => {
  let imgIndex = parseInt(imgId.charAt(imgId.length - 1), 10) - 1;
  if (imgIndex < 0) {
    imgIndex = 0;
  }
  displayImages[imgIndex].classList.add('current');
  for (let i = 0; i < displayImages.length; i += 1) {
    if (i !== imgIndex) {
      displayImages[i].classList.remove('current');
    }
  }
};
const emailIsValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordReset = () => {
  const modal = document.querySelector('.modal');
  modal.style.display = 'block';

  let email = document.getElementById('useremail');
  const subm = document.getElementById('submitForm');
  const cancel = document.getElementById('cancel');

  subm.addEventListener('click', () => {
    email = email.value;
    if (emailIsValid(email)) {
      alert(`Password reset mail has been sent to ${email}`);
      return (modal.style.display = 'none');
    }

    alert('Supply a valid email address');
    return (modal.style.display = 'none');
  });

  cancel.addEventListener('click', () => {
    alert('Ok good');
    return (modal.style.display = 'none');
  });
};
