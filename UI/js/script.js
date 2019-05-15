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
