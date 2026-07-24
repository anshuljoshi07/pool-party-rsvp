/**
 * Application Engine for Pool Party RSVP Wizard
 * Features: Audio synthesizer, interactive particle confetti, lightbox photo modal, 3D tilt
 */

class RSVPApp {
  constructor() {
    this.variant = this.detectVariant();
    this.questions = this.loadQuestions();
    this.currentStep = -1; // -1 = Hero Screen, 0..N-1 = Questions, N = Success
    this.answers = {};
    
    this.photosList = [
      { src: "./assets/opulent_farms.png", caption: "Opulent Farms, Gurugram 🏊", tag: "Venue" },
      { src: "./assets/photo_wolfpack.jpg", caption: "The Legendary Wolfpack 🕺🎉", tag: "Party Squad" },
      { src: "./assets/photo_unicorn.png", caption: "Unicorn Party Survivor 🦄", tag: "The Hangover" },
      { src: "./assets/photo_group.jpg", caption: "Floor Circle Party Vibe ✨", tag: "Wild Night" },
      { src: "./assets/photo_aftermath.jpg", caption: "Living Room Aftermath 🌅", tag: "Morning After" }
    ];

    this.initDOM();
    this.bindEvents();
    this.initLightbox();
    this.renderHeader();
    this.renderHero();
  }

  updateBgGraphic(src) {
    const bg = document.getElementById("bg-graphic-overlay");
    if (bg && src) {
      bg.style.backgroundImage = `url('${src}')`;
    }
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
    this.btnMusic = document.getElementById("btn-toggle-music");
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

    // Music equalizer toggle button
    if (this.btnMusic) {
      this.btnMusic.addEventListener("click", () => {
        if (window.partyAudio) {
          const playing = window.partyAudio.togglePlay();
          this.btnMusic.classList.toggle("playing", playing);
        }
      });
    }
  }

  initLightbox() {
    this.lightboxModal = document.getElementById("lightbox-modal");
    this.lightboxImg = document.getElementById("lightbox-img");
    this.lightboxCaption = document.getElementById("lightbox-caption");
    this.lightboxClose = document.getElementById("lightbox-close");
    this.lightboxBackdrop = document.getElementById("lightbox-backdrop");

    if (this.lightboxClose) {
      this.lightboxClose.addEventListener("click", () => this.closeLightbox());
      this.lightboxBackdrop.addEventListener("click", () => this.closeLightbox());
    }

    // Delegation for clicking any polaroid to open lightbox
    document.addEventListener("click", (e) => {
      const polaroid = e.target.closest(".polaroid-card");
      if (polaroid && !e.target.closest(".polaroid-controls")) {
        const img = polaroid.querySelector("img");
        const cap = polaroid.querySelector(".polaroid-caption");
        if (img) {
          this.openLightbox(img.src, cap ? cap.innerText : "");
        }
      }
    });
  }

  openLightbox(src, caption) {
    if (!this.lightboxModal) return;
    this.lightboxImg.src = src;
    this.lightboxCaption.innerText = caption || "";
    this.lightboxModal.classList.add("active");
  }

  closeLightbox() {
    if (!this.lightboxModal) return;
    this.lightboxModal.classList.remove("active");
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
    this.heroPhotos = this.photosList;
    this.activePhotoIdx = 0;

    this.updateBgGraphic(this.heroPhotos[0].src);
    
    this.heroSection.innerHTML = `
      <div class="hero-card">
        <div class="brand-badge">${heroData.badge}</div>
        
        <h1 class="hero-title">${heroData.title}</h1>

        <div class="polaroid-wrapper">
          <div class="polaroid-card" id="hero-polaroid">
            <div class="polaroid-tape"></div>
            <div class="polaroid-tag-badge" id="polaroid-tag">Venue</div>
            <div class="polaroid-img-box">
              <img src="${this.heroPhotos[0].src}" id="hero-polaroid-img" alt="Party Gallery" />
            </div>
            <div class="polaroid-caption" id="hero-polaroid-caption">${this.heroPhotos[0].caption}</div>

            <!-- Polaroid Navigation Controls -->
            <div class="polaroid-controls">
              <button class="polaroid-arrow" id="polaroid-prev" title="Previous Photo">❮</button>
              <div class="polaroid-dots" id="polaroid-dots">
                ${this.heroPhotos.map((_, i) => `<span class="dot ${i===0?'active':''}" data-idx="${i}"></span>`).join('')}
              </div>
              <button class="polaroid-arrow" id="polaroid-next" title="Next Photo">❯</button>
            </div>
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

    // Bind Polaroid Carousel Controls
    const polaroidCard = document.getElementById("hero-polaroid");
    const polaroidImg = document.getElementById("hero-polaroid-img");
    const polaroidCaption = document.getElementById("hero-polaroid-caption");
    const polaroidTag = document.getElementById("polaroid-tag");
    const dotsContainer = document.getElementById("polaroid-dots");

    const updatePhoto = (idx) => {
      this.activePhotoIdx = (idx + this.heroPhotos.length) % this.heroPhotos.length;
      const photo = this.heroPhotos[this.activePhotoIdx];

      this.updateBgGraphic(photo.src);

      polaroidCard.classList.add("photo-swap");
      setTimeout(() => {
        polaroidImg.src = photo.src;
        polaroidCaption.innerText = photo.caption;
        polaroidTag.innerText = photo.tag;
        polaroidCard.classList.remove("photo-swap");
      }, 150);

      dotsContainer.querySelectorAll(".dot").forEach((d, i) => {
        d.classList.toggle("active", i === this.activePhotoIdx);
      });
    };

    document.getElementById("polaroid-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      updatePhoto(this.activePhotoIdx - 1);
    });

    document.getElementById("polaroid-next").addEventListener("click", (e) => {
      e.stopPropagation();
      updatePhoto(this.activePhotoIdx + 1);
    });

    dotsContainer.querySelectorAll(".dot").forEach(dot => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(dot.getAttribute("data-idx"));
        updatePhoto(idx);
      });
    });

    // Auto rotate photos every 4 seconds
    this.photoInterval = setInterval(() => {
      if (this.currentStep === -1 && document.getElementById("hero-polaroid")) {
        updatePhoto(this.activePhotoIdx + 1);
      }
    }, 4000);

    document.getElementById("btn-start-rsvp").addEventListener("click", () => {
      if (window.partyAudio) window.partyAudio.playPop();
      if (this.photoInterval) clearInterval(this.photoInterval);
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

    // Active looping photo for this question
    const photo = this.photosList[this.currentStep % this.photosList.length];
    this.updateBgGraphic(photo.src);

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
          if (window.partyAudio) window.partyAudio.playPop();
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
          if (window.partyAudio) window.partyAudio.playPop();
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
          if (window.partyAudio) window.partyAudio.playPop();
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
          if (window.partyAudio) window.partyAudio.playPop();
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
      if (window.partyAudio) window.partyAudio.playPop();
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
        if (window.partyAudio) window.partyAudio.playPop();
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

    // Play Victory Fanfare & Confetti Burst
    if (window.partyAudio) window.partyAudio.playFanfare();
    if (window.particleEngine) window.particleEngine.burstConfetti();

    this.successSection.innerHTML = `
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h2 style="font-family:var(--font-heading); font-size:32px; color:var(--primary-cyan);">RSVP Submitted!</h2>
        <p style="color:var(--text-muted); font-size:16px; max-width:440px; line-height:1.65;">
          Thanks for filling this in! If we hit the numbers needed to book Opulent Farms, I'll update everyone on WhatsApp soon.
        </p>

        <!-- Hangover Movie Style End Credit Memories Polaroid Gallery Grid -->
        <div class="memories-container">
          <h3 class="memories-title">
            📸 Party Memories Incoming...
          </h3>

          <div class="memories-grid">
            <div class="polaroid-card memory-polaroid" style="transform:rotate(-3deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box">
                <img src="./assets/photo_unicorn.png" alt="Unicorn Hangover" />
              </div>
              <div class="polaroid-caption">Party Survivor 🦄</div>
            </div>

            <div class="polaroid-card memory-polaroid" style="transform:rotate(2deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box">
                <img src="./assets/photo_wolfpack.jpg" alt="Wolfpack Squad" />
              </div>
              <div class="polaroid-caption">Wolfpack Squad 🕺</div>
            </div>

            <div class="polaroid-card memory-polaroid" style="transform:rotate(-2deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box">
                <img src="./assets/photo_group.jpg" alt="Chill Session" />
              </div>
              <div class="polaroid-caption">Summer Vibes ☀️</div>
            </div>

            <div class="polaroid-card memory-polaroid" style="transform:rotate(3deg);">
              <div class="polaroid-tape"></div>
              <div class="polaroid-img-box">
                <img src="./assets/photo_aftermath.jpg" alt="Living Room Aftermath" />
              </div>
              <div class="polaroid-caption">The Aftermath 🌅</div>
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
