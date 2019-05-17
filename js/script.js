function confirmAction(btn, msg) {
  const btnClick = document.querySelector(`#${btn}`);
  const modal = document.querySelector(`.modal`);

  btnClick.addEventListener("click", () => {
    const h4 = document.querySelector(".modal h4");

    h4.innerHTML = `Are you sure you want to ${msg}?`;
    modal.style.display = "block";
  });

  const yes = document.querySelector("#yes");
  const no = document.querySelector("#no");

  yes.addEventListener("click", () => {
    alert(`You agreed to ${msg}`);
    modal.style.display = "none";
  });

  no.addEventListener("click", () => {
    alert(`Alright, that's a no`);
    modal.style.display = "none";
  });
}

function filterTable(table) {
  let status;
  const filter = search.value.toUpperCase();
  const tr = table.getElementsByTagName("tr");

  for (let i = 0; i < tr.length; i++) {
    let td = tr[i].getElementsByTagName("td");
    for (let j = 0; j < td.length; j++) {
      if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
        status = true;
      }
    }
    if (status) {
      tr[i].style.display = "";
      status = false;
    } else {
      if (tr[i] !== tr[0]) {
        tr[i].style.display = "none";
      }
    }
  }
}

const displayImages = document.querySelectorAll(".imgslide");
function switchImage(imgId) {
  const imgIndex = parseInt(imgId.charAt(imgId.length - 1)) - 1;
  if (imgIndex < 0) {
    imgIndex = 0;
  }
  displayImages[imgIndex].classList.add("current");
  for (let i = 0; i < displayImages.length; i++) {
    if (i !== imgIndex) {
      displayImages[i].classList.remove("current");
    }
  }
}

function passwordReset() {
  const modal = document.querySelector(`.modal`);
  modal.style.display = "block";

  let email = document.getElementById("useremail");
  const subm = document.getElementById("submitForm");
  const cancel = document.getElementById("cancel");

  subm.addEventListener("click", () => {
    email = email.value;
    if (emailIsValid(email)) {
      alert(`Password reset mail has been sent to ${email}`);
      return (modal.style.display = "none");
    }

    alert(`Supply a valid email address`);
    return (modal.style.display = "none");
  });

  cancel.addEventListener("click", () => {
    alert(`Ok good`);
    return (modal.style.display = "none");
  });
}

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
