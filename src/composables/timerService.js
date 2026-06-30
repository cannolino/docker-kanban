import { ref } from 'vue';

export function createTimerService() {
  const activeTimers = ref({});
  const timerInterval = ref(null);

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function startTimer(cardId) {
    if (activeTimers.value[cardId]) return;

    const startTime = new Date();
    activeTimers.value[cardId] = {
      startTime: startTime.getTime(),
      startTimeFormatted: formatDate(startTime),
      elapsed: 0,
      running: true
    };

    // Start interval to update timer
    if (!timerInterval.value) {
      timerInterval.value = setInterval(() => {
        Object.keys(activeTimers.value).forEach(cardId => {
          if (activeTimers.value[cardId].running) {
            activeTimers.value[cardId].elapsed = Math.floor((Date.now() - activeTimers.value[cardId].startTime) / 1000);
          }
        });
      }, 1000);
    }
  }

  function stopTimer(cardId) {
    if (!activeTimers.value[cardId]) return;

    const timer = activeTimers.value[cardId];
    timer.running = false;
    timer.endTime = new Date();
    timer.endTimeFormatted = formatDate(timer.endTime);
    timer.duration = timer.elapsed;

    // Clean up if no timers are running
    if (Object.values(activeTimers.value).every(t => !t.running)) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }

    return {
      startTime: timer.startTime,
      startTimeFormatted: timer.startTimeFormatted,
      endTime: timer.endTime.getTime(),
      endTimeFormatted: timer.endTimeFormatted,
      duration: timer.duration,
      durationFormatted: formatTime(timer.duration)
    };
  }

  function getTimerInfo(cardId) {
    const timer = activeTimers.value[cardId];
    if (!timer) return null;

    return {
      ...timer,
      formattedTime: formatTime(timer.elapsed)
    };
  }

  function cleanupTimer(cardId) {
    if (activeTimers.value[cardId]) {
      delete activeTimers.value[cardId];
      if (Object.keys(activeTimers.value).length === 0 && timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
    }
  }

  return {
    activeTimers,
    timerInterval,
    startTimer,
    stopTimer,
    getTimerInfo,
    cleanupTimer
  };
}