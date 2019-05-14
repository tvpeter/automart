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
