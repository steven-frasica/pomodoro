// Cache the timer display elements once so we can update them efficiently.
// This avoids querying the DOM again on every animation frame.
const timerMilliSeconds = document.querySelector('.timer__milliseconds')
const timerSeconds = document.querySelector('.timer__seconds')
const timerMinutes = document.querySelector('.timer__minutes')

// Cache the buttons so we can enable and disable them as the timer state changes.
const startButton = document.querySelector('.stopwatch__start')
const stopButton = document.querySelector('.stopwatch__stop')
const resetButton = document.querySelector('.stopwatch__reset')

// requestAnimationFrame gives back an id that lets us stop the animation loop later.
let cancelId;

// This holds the exact moment the current timer run started.
// We use a real timestamp so the countdown stays accurate.
let startTime;

// If the user pauses the timer, we store how much time has already elapsed here.
// That is what makes pause/resume possible.
let savedTime = 0;

// 25 minutes expressed in milliseconds.
// Working in milliseconds makes the math easy because Date.now() also uses milliseconds.
const countdown = 25 * 60 * 1000

function startTimer() {
  // Update the button states so the user cannot start the timer more than once.
  startButton.disabled = true
  stopButton.disabled = false
  resetButton.disabled = false

  // Record when this run started.
  // updateTimer compares the current time to this timestamp to measure elapsed time.
  startTime = Date.now();

  // Start the browser-driven animation loop.
  // updateTimer will run on the next repaint and then schedule itself again.
  cancelId = requestAnimationFrame(updateTimer)
}

function stopTimer() {
  // Restore the button states for a paused timer.
  startButton.disabled = false
  stopButton.disabled = true
  resetButton.disabled = false

  // Save the elapsed time from this run before stopping.
  // Example: if 10 seconds have passed, savedTime becomes 10000.
  // When the user starts again, the timer resumes instead of restarting.
  savedTime += Date.now() - startTime;

  // Stop the animation loop so updateTimer no longer runs.
  cancelAnimationFrame(cancelId)
}

function resetTimer() {
  // Reset all internal time tracking.
  // The next time startTimer runs, it will begin from a fresh 25-minute countdown.
  startTime = Date.now();
  savedTime = 0;

  // Reset the displayed clock values back to the starting state.
  timerMilliSeconds.innerHTML = "000"
  timerSeconds.innerHTML = "00";
  timerMinutes.innerHTML = "25";
}

function updateTimer() {
  // Total elapsed time is:
  // time from the current run + any time saved from earlier runs.
  // This is the core of the pause/resume behavior.
  let millisElapsed = Date.now() - startTime + savedTime
  
  // Convert elapsed time into remaining countdown time.
  let millisLeft = countdown - millisElapsed

  // Prevent the timer from going negative and stop the loop when time is up.
  if (millisLeft < 0) {
    millisLeft = 0;
    cancelAnimationFrame(cancelId)
    cancelId = null
  }

  // Break the remaining time into units that are easier to display.
  let secondsLeft = millisLeft / 1000
  let minutesLeft = secondsLeft / 60

  // Build the actual values we want to show on screen.
  // - milliseconds are the remainder after full seconds
  // - seconds are kept in the 0-59 range
  // - minutes are whole minutes remaining
  let millisText = millisLeft % 1000;
  let secondsText = Math.floor(secondsLeft) % 60;
  let minutesText = Math.floor(minutesLeft);

  // padStart keeps the display in digital clock format.
  // For example, 5 becomes "05" and 7 becomes "007".
  if (minutesText.toString().length < 2) {
    minutesText = minutesText.toString().padStart(2, '0')
  }
  if (secondsText.toString().length < 2) {
    secondsText = secondsText.toString().padStart(2, '0')
  }
  if (millisText.toString().length < 3) {
    millisText = millisText.toString().padStart(3, '0')
  }

  timerMilliSeconds.innerHTML = millisText
  timerSeconds.innerHTML = secondsText;
  timerMinutes.innerHTML = minutesText;

  // Keep the animation loop running only while the timer is active.
  if (cancelId) {
    cancelId = requestAnimationFrame(updateTimer)
  }
}