/**
 * Google Form Submission Handler
 * Submits form data to Google Forms using urlencoded POST and hidden iframe fallback.
 */

const FormSubmitter = {
  submitResponse(answers, variant, onComplete) {
    const entry = CONFIG.entryIds;
    const params = new URLSearchParams();

    const addParam = (name, value) => {
      if (name && value !== undefined && value !== null && value !== "") {
        params.append(name, value);
      }
    };

    // 1. Build Form URL parameters
    addParam(entry.interest, answers.interest);
    addParam(entry.dates, answers.dates);
    addParam(entry.customDate, answers.customDate);
    addParam(entry.availability, answers.availability);
    addParam(entry.bringingGuests, answers.bringingGuests);
    addParam(entry.guestCount, answers.guestCount);
    addParam(entry.drinking, answers.drinking);

    // Multi-select drinks
    if (Array.isArray(answers.drinkChoices)) {
      answers.drinkChoices.forEach(drink => addParam(entry.drinkChoices, drink));
    }

    // Multi-select activities
    if (Array.isArray(answers.activities)) {
      answers.activities.forEach(act => addParam(entry.activities, act));
    }

    // Friends-only fields
    if (variant === "friends") {
      addParam(entry.stayingOver, answers.stayingOver);
      addParam(entry.costSharing, answers.costSharing);
    }

    // Contact details
    addParam(entry.name, answers.name);
    addParam(entry.whatsapp, answers.whatsapp);
    addParam(entry.specialRequests, answers.specialRequests);

    // 2. Submit using fetch with no-cors mode
    fetch(CONFIG.formAction, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    }).then(() => {
      console.log("Fetch submit sent.");
    }).catch(err => {
      console.warn("Fetch submit fallback:", err);
    });

    // 3. Dual-submit via hidden form + target iframe for maximum browser compatibility
    let iframe = document.getElementById("hidden-google-form-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "hidden-google-form-iframe";
      iframe.name = "hidden-google-form-iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.action = CONFIG.formAction;
    form.method = "POST";
    form.target = "hidden-google-form-iframe";
    form.style.display = "none";

    params.forEach((value, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);

    try {
      form.submit();
    } catch (e) {
      console.warn("Form submit trigger error:", e);
    }

    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, 600);
  }
};
