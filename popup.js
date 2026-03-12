const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const intervalSelect = document.getElementById("interval");
const countdown = document.getElementById("countdown");
const soundToggle = document.getElementById("soundToggle");

let timerInterval = null;

chrome.storage.local.get(["interval","startTime","soundEnabled"],(data)=>{

  if(data.interval){
    intervalSelect.value = data.interval;
  }

  soundToggle.checked = data.soundEnabled || false;

  if(data.interval && data.startTime){
    startCountdown();
  }

});

soundToggle.addEventListener("change",()=>{

  chrome.storage.local.set({
    soundEnabled: soundToggle.checked
  });

});

startBtn.addEventListener("click",()=>{

  const minutes = parseInt(intervalSelect.value);

  chrome.runtime.sendMessage({
    type:"startTimer",
    minutes:minutes
  });

  chrome.storage.local.set({
    interval:minutes,
    startTime:Date.now()
  });

  startCountdown();

});

stopBtn.addEventListener("click",()=>{

  chrome.runtime.sendMessage({
    type:"stopTimer"
  });

  chrome.storage.local.remove(["startTime","interval"]);

  clearInterval(timerInterval);

  countdown.textContent="Timer inactive";

});

function startCountdown(){

  if(timerInterval) clearInterval(timerInterval);

  timerInterval=setInterval(()=>{

    chrome.storage.local.get(["interval","startTime"],(data)=>{

      if(!data || !data.interval || !data.startTime){
        countdown.textContent="Timer inactive";
        return;
      }

      const elapsed=(Date.now()-data.startTime)/1000;
      const total=data.interval*60;
      const remaining=Math.max(0,total-elapsed);

      const minutes=Math.floor(remaining/60);
      const seconds=Math.floor(remaining%60);

      countdown.textContent =
      `${minutes}:${seconds.toString().padStart(2,"0")}`;

    });

  },1000);

}