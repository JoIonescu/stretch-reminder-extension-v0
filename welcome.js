document.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("startBtn");

  if(startBtn){
    startBtn.addEventListener("click", () => {
      window.close();
    });
  }

});