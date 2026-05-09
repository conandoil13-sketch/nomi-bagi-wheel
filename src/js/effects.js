// Visual and audio helpers with graceful fallbacks for missing assets.
window.NomiBagi = window.NomiBagi || {};

window.NomiBagi.soundPaths = {
  spin: "assets/sounds/spin.mp3",
  bonus: "assets/sounds/bonus.mp3",
  result: "assets/sounds/result.mp3",
  click: "assets/sounds/click.mp3"
};

window.NomiBagi.playSound = function playSound(name) {
  const src = window.NomiBagi.soundPaths[name];

  if (!src) {
    return;
  }

  const audio = new Audio(src);
  audio.volume = 0.52;
  audio.play().catch(() => {
    // Missing files or blocked autoplay should never interrupt the wheel.
  });
};

window.NomiBagi.burst = function burst(container, count = 18) {
  if (!container) {
    return;
  }

  const colors = ["#ffd447", "#ff4f9a", "#49d6e9", "#a8ff78", "#ffffff"];

  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${35 + Math.random() * 55}%`;
    spark.style.setProperty("--spark-color", colors[i % colors.length]);
    container.append(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
};

window.NomiBagi.applyImageFallback = function applyImageFallback(element, src, placeholder) {
  if (!element) {
    return;
  }

  element.dataset.placeholder = placeholder;

  const image = new Image();
  image.onload = () => {
    element.classList.add("has-image");
    element.style.backgroundImage = `url("${src}")`;
  };
  image.onerror = () => {
    element.classList.remove("has-image");
    element.style.backgroundImage = "";
  };
  image.src = src;
};

window.NomiBagi.showBonusCutscene = function showBonusCutscene(options = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    const portrait = document.createElement("div");
    const text = document.createElement("div");
    const steps = options.steps || [
      { label: "어라?", delay: 500, duration: 430, className: "is-curious" },
      { label: "찬스?", delay: 0, duration: 480, className: "is-chance" },
      { label: "BONUS TIME!!!", delay: 0, duration: 760, className: "is-bonus-hit" }
    ];
    let index = 0;

    overlay.className = options.variant === "super"
      ? "bonus-cutscene bonus-cutscene--super"
      : "bonus-cutscene";
    portrait.className = "bonus-cutscene__portrait";
    text.className = "bonus-cutscene__text";
    window.NomiBagi.applyImageFallback(
      portrait,
      options.portraitSrc || "assets/images/mushvenom.png",
      ""
    );
    overlay.append(portrait, text);
    document.body.append(overlay);

    const finish = () => {
      overlay.classList.add("is-leaving");
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, 180);
    };

    const showStep = () => {
      const step = steps[index];

      if (!step) {
        finish();
        return;
      }

      text.className = `bonus-cutscene__text ${step.className}`;
      text.textContent = step.label;
      overlay.classList.toggle("is-shaking", index > 0);

      window.setTimeout(() => {
        index += 1;
        showStep();
      }, step.duration);
    };

    window.setTimeout(showStep, steps[0].delay);
  });
};
