/**
 * Application Engine for Pool Party RSVP Wizard
 */

class RSVPApp {
  constructor() {
    this.variant = this.detectVariant();
    this.questions = this.loadQuestions();
    this.currentStep = -1; // -1 = Hero Screen, 0..N-1 = Questions, N = Success
    this.answers = {};
    
    this.initDOM();
    this.bindEvents();
    this.renderHeader();
    this.renderHero();
  }

  detectVariant() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || params.get("variant");
    return (type && type.toLowerCase() === "office") ? "office" : "friends";
  }

  loadQuestions() {
    return CONFIG.questions.filter(q => {
      if (this.variant === "office" && q.friendsOnly) {
        return false;
      }
      return true;
    });
  }

  initDOM() {
    this.headerBadge = document.getElementById("header-badge");
    this.btnFriends = document.getElementById("btn-variant-friends");
    this.btnOffice = document.getElementById("btn-variant-office");
    this.heroSection = document.getElementById("hero-section");
    this.wizardSection = document.getElementById("wizard-section");
    this.successSection = document.getElementById("success-section");
    this.questionCard = document.getElementById("question-card");
    this.progressFill = document.getElementById("progress-fill");
    this.progressStepText = document.getElementById("progress-step-text");
    this.progressPercent = document.getElementById("progress-percent");
  }

  bindEvents() {
    // Header variant switchers
    this.btnFriends.addEventListener("click", () => this.switchVariant("friends"));
    this.btnOffice.addEventListener("click", () => this.switchVariant("office"));
  }

  switchVariant(targetVariant) {
    if (this.variant === targetVariant) return;
    const url = new URL(window.location.href);
    url.searchParams.set("type", targetVariant);
    window.location.href = url.toString();
  }

  renderHeader() {
    if (this.variant === "office") {
      this.headerBadge.innerText = "👔 Office Edition";
      this.btnOffice.classList.add("active");
      this.btnFriends.classList.remove("active");
    } else {
      this.headerBadge.innerText = "🎉 Friends Edition";
      this.btnFriends.classList.add("active");
      this.btnOffice.classList.remove("active");
    }
  }

  renderHero() {
    const heroData = CONFIG.hero[this.variant];
    
    this.heroSection.innerHTML = `
      <div class="hero-card">
        <div class="brand-badge">${heroData.badge}</div>
        
        <h1 class="hero-title">${heroData.title}</h1>

        <div class="polaroid-wrapper">
          <div class="polaroid-card">
            <div class="polaroid-tape"></div>
            <div class="polaroid-img-box">
              <img src="./assets/opulent_farms.png" alt="Opulent Farms Pool" />
            </div>
            <div class="polaroid-caption">Opulent Farms, Gurugram 🏊</div>
          </div>
        </div>

        <a href="${CONFIG.mapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-badge">
          <span class="maps-pin">📍</span>
          <span>View Opulent Farms on Google Maps</span>
        </a>

        <div class="hero-body">
          ${heroData.paragraphs.map(p => `<p>${p}</p>`).join("")}
        </div>

        <button class="btn-primary" id="btn-start-rsvp">
          <span>${heroData.ctaText}</span>
        </button>
      </div>
    `;

    document.getElementById("btn-start-rsvp").addEventListener("click", () => {
      this.startWizard();
    });
  }

  startWizard() {
    this.currentStep = 0;
    this.heroSection.style.display = "none";
    this.wizardSection.style.display = "flex";
    this.renderStep();
  }

  renderStep() {
    if (this.currentStep >= this.questions.length) {
      this.submitData();
      return;
    }

    const question = this.questions[this.currentStep];
    const totalSteps = this.questions.length;
    const stepNumber = this.currentStep + 1;
    const percent = Math.round((stepNumber / totalSteps) * 100);

    // Update progress bar
    this.progressFill.style.width = `${percent}%`;
    this.progressStepText.innerText = `Question ${stepNumber} of ${totalSteps}`;
    this.progressPercent.innerText = `${percent}%`;

    // Render Question HTML
    this.questionCard.innerHTML = `
      <div class="question-badge">Question ${stepNumber}</div>
      <h2 class="question-title">${question.title}</h2>
      <p class="question-subtitle">${question.subtitle}</p>
      
      <div class="options-grid" id="options-container">
        ${this.renderOptions(question)}
      </div>

      <div class="wizard-nav">
        <button class="btn-secondary" id="btn-wizard-back">
          Back
        </button>
        <button class="btn-primary" id="btn-wizard-next" style="margin-top:0;">
          <span>${stepNumber === totalSteps ? 'Submit RSVP ✨' : 'Continue →'}</span>
        </button>
      </div>
    `;

    this.bindQuestionEvents(question);
  }

  renderOptions(q) {
    if (q.type === "single" || q.type === "single_with_custom" || q.type === "single_with_count") {
      const selectedVal = this.answers[q.id];
      return q.options.map(opt => {
        const isSelected = selectedVal === opt.value;
        return `
          <div class="option-card ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
            <span class="option-icon">${opt.icon}</span>
            <span class="option-label">${opt.label}</span>
            <div class="radio-indicator"></div>
          </div>
        `;
      }).join("") + (q.type === "single_with_custom" ? `
        <div class="conditional-box" id="custom-date-box" style="display: ${selectedVal === q.customTriggerValue ? 'flex' : 'none'};">
          <input type="text" class="input-field" id="custom-date-input" placeholder="${q.customPlaceholder}" value="${this.answers.customDate || ''}" />
        </div>
      ` : '') + (q.type === "single_with_count" ? `
        <div class="conditional-box" id="guest-count-box" style="display: ${selectedVal === q.triggerValue ? 'flex' : 'none'};">
          <label style="font-size:14px; font-weight:600; color:var(--text-muted);">${q.countLabel}</label>
          <input type="number" class="input-field" id="guest-count-input" min="${q.minCount}" max="${q.maxCount}" value="${this.answers.guestCount || 1}" />
        </div>
      ` : '');
    }

    if (q.type === "drinks_conditional") {
      const selectedVal = this.answers.drinking;
      const isDrinkingYes = selectedVal === "Yes";
      const drinkChoices = this.answers.drinkChoices || [];

      return `
        <div class="options-grid">
          ${q.options.map(opt => `
            <div class="option-card ${selectedVal === opt.value ? 'selected' : ''}" data-drink-status="${opt.value}">
              <span class="option-icon">${opt.icon}</span>
              <span class="option-label">${opt.label}</span>
              <div class="radio-indicator"></div>
            </div>
          `).join("")}
        </div>

        <div class="conditional-box" id="drink-options-box" style="display: ${isDrinkingYes ? 'flex' : 'none'};">
          <label style="font-weight:700; color:var(--primary-cyan); font-size:15px; margin-bottom:4px;">${q.subQuestionTitle}</label>
          <div class="options-grid">
            ${q.drinkOptions.map(d => {
              const isChecked = drinkChoices.includes(d.value);
              return `
                <div class="option-card ${isChecked ? 'selected' : ''}" data-drink-choice="${d.value}">
                  <span class="option-icon">${d.icon}</span>
                  <span class="option-label">${d.label}</span>
                  <div class="checkbox-indicator"></div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    if (q.type === "multi") {
      const selectedArr = this.answers[q.id] || [];
      return q.options.map(opt => {
        const isSelected = selectedArr.includes(opt.value);
        return `
          <div class="option-card ${isSelected ? 'selected' : ''}" data-multi-value="${opt.value}">
            <span class="option-icon">${opt.icon}</span>
            <span class="option-label">${opt.label}</span>
            <div class="checkbox-indicator"></div>
          </div>
        `;
      }).join("");
    }

    if (q.type === "contact_fields") {
      return q.fields.map(f => `
        <div style="display:flex; flex-direction:column; gap:6px; width:100%;">
          <label style="font-size:14px; font-weight:600; color:var(--text-main);">${f.label} ${f.required ? '<span style="color:var(--accent-coral);">*</span>' : ''}</label>
          ${f.type === 'textarea' ? `
            <textarea class="input-field" id="field-${f.id}" placeholder="${f.placeholder}">${this.answers[f.id] || ''}</textarea>
          ` : `
            <input type="${f.type}" class="input-field" id="field-${f.id}" placeholder="${f.placeholder}" value="${this.answers[f.id] || ''}" />
          `}
        </div>
      `).join("");
    }

    return "";
  }

  bindQuestionEvents(q) {
    const container = document.getElementById("options-container");

    // Single Select Option Handling
    if (q.type === "single" || q.type === "single_with_custom" || q.type === "single_with_count") {
      container.querySelectorAll(".option-card[data-value]").forEach(card => {
        card.addEventListener("click", () => {
          container.querySelectorAll(".option-card[data-value]").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          const val = card.getAttribute("data-value");
          this.answers[q.id] = val;

          // Handle Custom Date reveal
          const customBox = document.getElementById("custom-date-box");
          if (customBox) {
            customBox.style.display = (val === q.customTriggerValue) ? "flex" : "none";
          }

          // Handle Guest Count reveal
          const guestBox = document.getElementById("guest-count-box");
          if (guestBox) {
            guestBox.style.display = (val === q.triggerValue) ? "flex" : "none";
          }
        });
      });
    }

    // Drinking Conditional Handling
    if (q.type === "drinks_conditional") {
      container.querySelectorAll(".option-card[data-drink-status]").forEach(card => {
        card.addEventListener("click", () => {
          container.querySelectorAll(".option-card[data-drink-status]").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          const val = card.getAttribute("data-drink-status");
          this.answers.drinking = val;

          const drinkBox = document.getElementById("drink-options-box");
          drinkBox.style.display = (val === "Yes") ? "flex" : "none";
        });
      });

      container.querySelectorAll(".option-card[data-drink-choice]").forEach(card => {
        card.addEventListener("click", () => {
          card.classList.toggle("selected");
          const choices = [];
          container.querySelectorAll(".option-card[data-drink-choice].selected").forEach(c => {
            choices.push(c.getAttribute("data-drink-choice"));
          });
          this.answers.drinkChoices = choices;
        });
      });
    }

    // Multi Select Handling
    if (q.type === "multi") {
      container.querySelectorAll(".option-card[data-multi-value]").forEach(card => {
        card.addEventListener("click", () => {
          card.classList.toggle("selected");
          const choices = [];
          container.querySelectorAll(".option-card[data-multi-value].selected").forEach(c => {
            choices.push(c.getAttribute("data-multi-value"));
          });
          this.answers[q.id] = choices;
        });
      });
    }

    // Navigation Events
    document.getElementById("btn-wizard-back").addEventListener("click", () => {
      if (this.currentStep === 0) {
        this.wizardSection.style.display = "none";
        this.heroSection.style.display = "flex";
        this.currentStep = -1;
      } else {
        this.currentStep--;
        this.renderStep();
      }
    });

    document.getElementById("btn-wizard-next").addEventListener("click", () => {
      if (this.validateCurrentStep(q)) {
        this.currentStep++;
        this.renderStep();
      }
    });
  }

  validateCurrentStep(q) {
    if (q.type === "contact_fields") {
      const nameVal = document.getElementById("field-name").value.trim();
      const phoneVal = document.getElementById("field-whatsapp").value.trim();
      const specVal = document.getElementById("field-specialRequests").value.trim();

      if (!nameVal) {
        alert("Please enter your name!");
        return false;
      }
      if (!phoneVal) {
        alert("Please enter your WhatsApp number!");
        return false;
      }

      this.answers.name = nameVal;
      this.answers.whatsapp = phoneVal;
      this.answers.specialRequests = specVal;
      return true;
    }

    if (q.required) {
      if (q.type === "drinks_conditional") {
        if (!this.answers.drinking) {
          alert("Please select whether you'll be drinking!");
          return false;
        }
      } else if (!this.answers[q.id]) {
        alert("Please make a selection to continue!");
        return false;
      }

      if (q.type === "single_with_custom" && this.answers[q.id] === q.customTriggerValue) {
        const customVal = document.getElementById("custom-date-input").value.trim();
        if (!customVal) {
          alert("Please enter your suggested date!");
          return false;
        }
        this.answers.customDate = customVal;
      }

      if (q.type === "single_with_count" && this.answers[q.id] === q.triggerValue) {
        const countVal = document.getElementById("guest-count-input").value;
        this.answers.guestCount = countVal || "1";
      }
    }

    return true;
  }

  submitData() {
    this.wizardSection.style.display = "none";
    this.successSection.style.display = "flex";

    this.successSection.innerHTML = `
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h2 style="font-family:var(--font-heading); font-size:28px; color:var(--primary-cyan);">RSVP Submitted!</h2>
        <p style="color:var(--text-muted); font-size:15px; max-width:400px; line-height:1.6;">
          Thanks for filling this in! If we hit the numbers needed to book Opulent Farms, I'll update everyone on WhatsApp soon.
        </p>

        <!-- Hangover Movie Style End Credit Memories Polaroid Gallery -->
        <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:20px; margin: 15px 0;">
          <h3 style="font-family:var(--font-handwritten); font-size:28px; color:var(--accent-amber); transform:rotate(-1deg);">
            📸 Party Memories Loading...
          </h3>

          <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px; width:100%;">
            <div class="polaroid-card" style="max-width:260px; transform:rotate(-3deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box" style="aspect-ratio:1/1;">
                <img src="./assets/hangover_1.png" alt="Wolfpack Pool Party" />
              </div>
              <div class="polaroid-caption" style="font-size:20px;">Summer Vibes ☀️</div>
            </div>

            <div class="polaroid-card" style="max-width:260px; transform:rotate(3deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box" style="aspect-ratio:1/1;">
                <img src="./assets/hangover_2.png" alt="Karaoke Night" />
              </div>
              <div class="polaroid-caption" style="font-size:20px;">Legendary Night! 🎤</div>
            </div>
          </div>
        </div>
        
        <a href="${CONFIG.mapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-badge" style="margin-top:10px;">
          <span class="maps-pin">📍</span>
          <span>View Opulent Farms Location</span>
        </a>

        <button class="btn-secondary" id="btn-reset" style="margin-top:15px;">
          Submit Another Response
        </button>
      </div>
    `;

    FormSubmitter.submitResponse(this.answers, this.variant, () => {
      console.log("Submitted to Google Form successfully.");
    });

    document.getElementById("btn-reset").addEventListener("click", () => {
      window.location.reload();
    });
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new RSVPApp();
});
