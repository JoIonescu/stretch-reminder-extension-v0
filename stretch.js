document.addEventListener("DOMContentLoaded", () => {

let seconds = 60;
let running = true;

const timerText = document.getElementById("timer");
const pauseBtn = document.getElementById("pauseBtn");
const skipBtn = document.getElementById("skipBtn");
const snoozeBtn = document.getElementById("snoozeBtn");
const circle = document.getElementById("progressCircle");
const sound = document.getElementById("stretchSound");
const stretchText = document.getElementById("stretchText");
const doneMessage = document.getElementById("doneMessage");

const stretches = [

"🧘 Roll your shoulders slowly.",
"🧠 Stretch your neck gently left and right.",
"🙆 Stand up and reach your arms overhead.",
"👀 Look away from the screen and relax your eyes.",
"🚶 Walk around the room for a moment.",
"💪 Stretch your back and open your chest.",
"✋ Shake out your hands and wrists.",
"🌬 Take a deep breath and relax your shoulders."

];

function pickRandomStretch(){
  const index = Math.floor(Math.random() * stretches.length);
  stretchText.textContent = stretches[index];
}

const radius = 90;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = 0;

function updateCircle(){
  const progress = seconds / 60;
  const offset = circumference - progress * circumference;
  circle.style.strokeDashoffset = offset;
}

function updateTimer(){
  timerText.textContent = seconds + "s";
  updateCircle();
}

const interval = setInterval(()=>{

  if(!running) return;

  seconds--;

  updateTimer();

  if(seconds <= 0){

  clearInterval(interval);

  if(sound){
    sound.pause();
  }

  // hide buttons
  pauseBtn.style.display = "none";
  skipBtn.style.display = "none";
  document.getElementById("mainTitle").style.display = "none";

  // remove circle
  document.querySelector(".timer-wrapper").style.display = "none";

  // show success message
  // This makes the emoji 60px while keeping the text relative to the rest of the div
stretchText.innerHTML = "<span style='font-size: 60px;'>👍</span><br><br>Great job!<br>Back to work!";

  setTimeout(()=>{
    window.close();
  },2000);

}

},1000);

pauseBtn.addEventListener("click",()=>{

  running = !running;

  pauseBtn.textContent = running ? "Pause" : "Resume";

});

skipBtn.addEventListener("click",()=>{

  chrome.storage.local.get(["userInterval"],(data)=>{

    if(data.userInterval){

      chrome.runtime.sendMessage({
        type:"startTimer",
        minutes:data.userInterval
      });

    }

    if(sound) sound.pause();

    window.close();

  });

});

snoozeBtn.addEventListener("click",()=>{

  chrome.runtime.sendMessage({
    type:"snoozeTimer"
  });

  if(sound) sound.pause();

  window.close();

});


/* SOUND FIX */

chrome.storage.local.get(["soundEnabled"],(data)=>{

  if(data.soundEnabled && sound){

    // delay so browser allows audio
    setTimeout(()=>{

      sound.currentTime = 0;
      sound.volume = 0.6;

      const playPromise = sound.play();

      if(playPromise !== undefined){
        playPromise.catch(()=>{});
      }

    },1200);

  }

});

pickRandomStretch();
updateTimer();

});