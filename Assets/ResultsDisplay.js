// ResultsDisplay.js
// @input Component.Text resultsText
// @input Component.Text severityText

var COLORS = {
    0: new vec4(0.18, 0.85, 0.40, 1.0),   // green  — Normal
    1: new vec4(1.00, 0.80, 0.10, 1.0),   // yellow — Slight
    2: new vec4(1.00, 0.50, 0.05, 1.0),   // orange — Mild
    3: new vec4(0.92, 0.18, 0.18, 1.0),   // red    — Moderate/Severe
};

var LABELS = ["NORMAL", "SLIGHT", "MILD", "MODERATE / SEVERE"];

print("[RD] ResultsDisplay loaded. severityText=" + (script.severityText ? "OK" : "NULL") + " resultsText=" + (script.resultsText ? "OK" : "NULL"));

global.showResults = function () {
    var r = global.assessmentResults;
    if (!r) {
        print("[RD] showResults: assessmentResults is empty");
        return;
    }

    print("[RD] showResults called — score: " + r.updrs_score);
    print("[RD] severityText=" + (script.severityText ? "OK" : "NULL") + " resultsText=" + (script.resultsText ? "OK" : "NULL"));

    var score = r.updrs_score;
    var color = COLORS[score] || new vec4(1, 1, 1, 1);
    var label = LABELS[score] || "UNKNOWN";

    if (script.severityText) {
        script.severityText.text = label;
        script.severityText.textFill.color = color;
        script.severityText.getSceneObject().enabled = true;
    }

    if (script.resultsText) {
        script.resultsText.text =
            "UPDRS  " + score + " / 3\n\n"         +
            "Frequency    " + r.frequency + " Hz\n" +
            "Intensity    " + r.intensity + "\n"    +
            "FI Value     " + r.fi_value  + "\n"    +
            "Peaks        " + r.peaks     + "\n"    +
            "Detection    " + r.detection_rate + "%";
        script.resultsText.textFill.color = new vec4(1, 1, 1, 1);
        script.resultsText.getSceneObject().enabled = true;
    }
};

global.hideResults = function () {
    if (script.severityText) script.severityText.getSceneObject().enabled = false;
    if (script.resultsText)  script.resultsText.getSceneObject().enabled  = false;
};
