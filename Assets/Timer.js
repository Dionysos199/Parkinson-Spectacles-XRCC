// @input float holdDuration = 2.0
// @input string triggerName = "Recording_Start"

// @input SceneObject recordingTimer
// @input Component.Text timerText
// @input SceneObject handTriggerObject
// @input SceneObject redHand
// @input SceneObject greenHand
// @input Component.Text recordingCountdownText

var holdTimer = 0;
var isHolding = false;
var triggered = false;
var recordingTimeLeft = 0;
var recordingDuration = 10.0;

// Debounce: gesture must be absent for this long before holdTimer resets
var GESTURE_END_GRACE = 0.35;
var gestureEndPending = false;
var gestureEndTimer = 0;

var onEnableEvent = script.createEvent("TurnOnEvent");
onEnableEvent.bind(function() {
    isHolding = false;
    holdTimer = 0;
    triggered = false;
    gestureEndPending = false;
    gestureEndTimer = 0;
    if (script.timerText) script.timerText.text = script.holdDuration.toFixed(1);
    if (script.redHand) script.redHand.enabled = true;
    if (script.greenHand) script.greenHand.enabled = false;
});

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function(eventData) {
    var dt = getDeltaTime();

    // Grace period countdown — only reset holdTimer after sustained gesture absence
    if (gestureEndPending) {
        gestureEndTimer -= dt;
        if (gestureEndTimer <= 0) {
            gestureEndPending = false;
            isHolding = false;
            holdTimer = 0;
            triggered = false;
            if (script.timerText) script.timerText.text = script.holdDuration.toFixed(1);
            print("Gesture hold broken");
        }
    }

    if (isHolding && !triggered) {
        holdTimer += dt;

        if (holdTimer >= script.holdDuration) {
            triggered = true;
            if (script.timerText) script.timerText.text = "0.0";
            global.behaviorSystem.sendCustomTrigger(script.triggerName);
            print("Recording triggered!");
        } else {
            if (script.timerText) script.timerText.text = (script.holdDuration - holdTimer).toFixed(1);
        }
    }

    if (recordingActive) {
        recordingTimeLeft -= dt;
        if (script.recordingCountdownText) {
            if (recordingTimeLeft > 0) {
                script.recordingCountdownText.text = recordingTimeLeft.toFixed(1) + "s";
            } else {
                script.recordingCountdownText.text = "Processing...";
            }
        }
    }
});

var recordingActive = false;

// Call this when gesture starts
script.onGestureStart = function() {
    if (recordingActive) return;
    // Cancel any pending reset from a brief flicker
    gestureEndPending = false;
    gestureEndTimer = 0;
    isHolding = true;
    triggered = false;
    if (script.greenHand) script.greenHand.enabled = true;
    if (script.redHand) script.redHand.enabled = false;
}

// Call this when gesture ends — starts grace period instead of resetting immediately
script.onGestureEnd = function() {
    gestureEndPending = true;
    gestureEndTimer = GESTURE_END_GRACE;
    if (script.redHand) script.redHand.enabled = true;
    if (script.greenHand) script.greenHand.enabled = false;
}

// Expose functions for HandJointDataCollector to call
script.setRecordingActive = function(val) {
    recordingActive = val;
    if (script.handTriggerObject) script.handTriggerObject.enabled = !val;
    if (script.redHand) script.redHand.enabled = !val;
    if (script.greenHand) script.greenHand.enabled = !val;
    if (script.recordingTimer) script.recordingTimer.enabled = val;
    if (script.timerText) script.timerText.enabled = !val;
    if (script.recordingCountdownText) {
        script.recordingCountdownText.enabled = val;
        if (val) {
            recordingTimeLeft = recordingDuration;
            script.recordingCountdownText.text = recordingDuration.toFixed(1) + "s";
        } else {
            script.recordingCountdownText.text = "";
        }
    }
}
