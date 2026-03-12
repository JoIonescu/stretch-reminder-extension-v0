const ALARM_NAME = "stretchAlarm";

let countdownInterval = null;


/* ---------------------------------- */
/* RECOVER MISSED STRETCH AFTER SLEEP */
/* ---------------------------------- */

function recoverMissedStretch() {

  chrome.storage.local.get(["interval","startTime"], (data) => {

    if(!data || !data.interval || !data.startTime) return;

    const elapsed = (Date.now() - data.startTime) / 1000;
    const total = data.interval * 60;

    if(elapsed >= total){

      chrome.windows.create({
        url: "stretch.html",
        type: "popup",
        width: 700,
        height: 600
      });

      chrome.storage.local.set({
        startTime: Date.now()
      });

    }

  });

}

recoverMissedStretch();


/* ---------------- */
/* CREATE MAIN TIMER */
/* ---------------- */

function createAlarm(minutes) {

  chrome.alarms.clear(ALARM_NAME, () => {

    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });

    chrome.storage.local.set({
      interval: minutes,
      userInterval: minutes,
      startTime: Date.now()
    });

    startBadgeCountdown();

  });

}


/* ------------------- */
/* BADGE COUNTDOWN LOGIC */
/* ------------------- */

function startBadgeCountdown() {

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {

    chrome.storage.local.get(["interval","startTime"], (data) => {

      if (!data || !data.interval || !data.startTime) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }

      const elapsed = (Date.now() - data.startTime) / 1000;
      const total = data.interval * 60;
      const remaining = Math.max(0, total - elapsed);

      const minutesLeft = Math.ceil(remaining / 60);

      let badgeColor = "#4CAF50";

      if (minutesLeft <= 5) badgeColor = "#E53935";
      else if (minutesLeft <= 10) badgeColor = "#FDD835";

      chrome.action.setBadgeBackgroundColor({ color: badgeColor });

      chrome.action.setBadgeText({
        text: minutesLeft.toString()
      });

    });

  },1000);

}


/* ---------------- */
/* SMART IDLE CHECK */
/* ---------------- */

function openStretchIfActive(){

  chrome.idle.queryState(60, (state)=>{

    if(state === "active"){

      chrome.windows.create({
        url: "stretch.html",
        type:"popup",
        width:700,
        height:600
      });

      chrome.storage.local.set({
        startTime: Date.now()
      });

    } else {

      // user idle → check again in 1 minute
      setTimeout(openStretchIfActive,60000);

    }

  });

}


/* ---------------- */
/* EXTENSION INSTALL */
/* ---------------- */

chrome.runtime.onInstalled.addListener(() => {

  chrome.storage.local.remove(["startTime","interval"]);

  chrome.windows.create({
    url: "welcome.html",
    type: "popup",
    width: 500,
    height: 500
  });

});


/* ---------------- */
/* CHROME STARTUP */
/* ---------------- */

chrome.runtime.onStartup.addListener(() => {

  chrome.storage.local.get(["interval","startTime"], (data)=>{

    if(data.interval && data.startTime){
      startBadgeCountdown();
    }

  });

});


/* ---------------- */
/* ALARM TRIGGER */
/* ---------------- */

chrome.alarms.onAlarm.addListener((alarm) => {

  if (alarm.name === ALARM_NAME) {

    openStretchIfActive();

  }

});


/* ---------------- */
/* MESSAGE HANDLER */
/* ---------------- */

chrome.runtime.onMessage.addListener((request) => {

  if (request.type === "startTimer") {
    createAlarm(request.minutes);
  }

  if (request.type === "stopTimer") {

    chrome.alarms.clear(ALARM_NAME);

    chrome.storage.local.remove(["startTime","interval"]);

    chrome.action.setBadgeText({ text: "" });

  }

  if (request.type === "snoozeTimer") {

    chrome.storage.local.get(["userInterval"], () => {

      chrome.alarms.clear(ALARM_NAME, () => {

        chrome.alarms.create(ALARM_NAME, {
          delayInMinutes: 5
        });

        chrome.storage.local.set({
          interval: 5,
          startTime: Date.now()
        });

        startBadgeCountdown();

      });

    });

  }

});