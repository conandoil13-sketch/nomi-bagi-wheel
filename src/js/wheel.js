// Wheel mechanics and smooth requestAnimationFrame spin animation for the 16-slot score wheel.
window.NomiBagi = window.NomiBagi || {};

window.NomiBagi.SPIN_DURATION = 4300;
window.NomiBagi.activeWheelElement = null;

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const easingFunctions = {
  linear: (t) => t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
  softStop: (t) => 1 - Math.pow(1 - t, 4),
  bounceBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};

function resolveEasing(easing) {
  if (typeof easing === "function") {
    return easing;
  }

  return easingFunctions[easing] || easingFunctions.softStop;
}

function paintRotation(wheelElement, rotation) {
  const hubElement = wheelElement.querySelector("[data-wheel-label]");

  wheelElement.style.transform = `rotate(${rotation}deg) translateZ(0)`;

  if (hubElement) {
    hubElement.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg) translateZ(0)`;
  }
}

window.NomiBagi.getRandomResult = function getRandomResult(options = {}) {
  const slots = options.slots || window.NomiBagi.gameState.slots;
  const index = Math.floor(Math.random() * slots.length);

  return slots[index];
};

window.NomiBagi.calculateTargetRotation = function calculateTargetRotation(result, options = {}) {
  const { gameState } = window.NomiBagi;
  const minTurns = Math.max(5, options.minTurns || gameState.nextSpinTurns || 5);
  const currentNormalized = ((gameState.rotation % 360) + 360) % 360;
  const desiredRotation = (360 - result.angle) % 360;
  const delta = (desiredRotation - currentNormalized + 360) % 360;

  return gameState.rotation + minTurns * 360 + delta;
};

window.NomiBagi.applyWheelRotation = function applyWheelRotation(rotation, duration, easing = "softStop") {
  const { gameState } = window.NomiBagi;
  const wheelElement = window.NomiBagi.activeWheelElement;
  const startRotation = gameState.rotation;
  const distance = rotation - startRotation;
  const ease = resolveEasing(easing);

  gameState.rotation = rotation;

  if (!wheelElement || duration <= 0) {
    if (wheelElement) {
      wheelElement.style.transition = "none";
      paintRotation(wheelElement, rotation);
    }
    return Promise.resolve();
  }

  wheelElement.style.transition = "none";

  return new Promise((resolve) => {
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);
      const nextRotation = startRotation + distance * easedProgress;

      paintRotation(wheelElement, nextRotation);

      if (progress < 1) {
        window.requestAnimationFrame(frame);
        return;
      }

      paintRotation(wheelElement, rotation);
      resolve();
    }

    window.requestAnimationFrame(frame);
  });
};

window.NomiBagi.spinWheel = async function spinWheel(options = {}) {
  const {
    gameState,
    getRandomResult,
    calculateTargetRotation,
    applyWheelRotation
  } = window.NomiBagi;
  const minTurns = Math.max(5, options.minTurns || 5);
  const power = options.power || "normal";
  const result = options.result || getRandomResult({ slots: options.slots });
  const upgradeCheck = options.upgradeCheck;
  const wheelElement = options.wheelElement || window.NomiBagi.activeWheelElement;
  const fastTurns = power === "rush" ? 4.2 : 3.2;
  const settleOvershoot = power === "rush" ? 8 : 6;

  window.NomiBagi.activeWheelElement = wheelElement;

  if (upgradeCheck) {
    await applyWheelRotation(
      gameState.rotation + 360 * fastTurns,
      1250,
      "easeInCubic"
    );

    const shouldUpgrade = upgradeCheck();

    if (shouldUpgrade) {
      if (typeof options.onUpgradeHit === "function") {
        await options.onUpgradeHit();
      }

      await applyWheelRotation(
        gameState.rotation + 360 * 2.65,
        980,
        "linear"
      );

      return {
        result: null,
        upgraded: true
      };
    }
  }

  const targetRotation = calculateTargetRotation(result, { minTurns });

  await applyWheelRotation(
    targetRotation + settleOvershoot,
    power === "rush" ? 3300 : 3600,
    "easeOutQuint"
  );
  await applyWheelRotation(
    targetRotation,
    220,
    "bounceBack"
  );

  return {
    result,
    upgraded: false
  };
};

window.NomiBagi.resetWheel = function resetWheel(wheelElement) {
  const { gameState } = window.NomiBagi;
  const targetWheel = wheelElement || window.NomiBagi.activeWheelElement;

  window.NomiBagi.activeWheelElement = targetWheel;
  gameState.rotation = 0;

  if (!targetWheel) {
    return;
  }

  targetWheel.style.transition = "none";
  paintRotation(targetWheel, 0);
};

window.NomiBagi.flashWheelSwap = async function flashWheelSwap(wheelElement) {
  wheelElement.classList.add("wheel--upgrading");
  await wait(420);
  wheelElement.classList.remove("wheel--upgrading");
};

window.NomiBagi.shouldEnterBonus = function shouldEnterBonus() {
  return Math.random() < window.NomiBagi.gameState.bonusChance;
};

window.NomiBagi.shouldEnterSecondUpgrade = function shouldEnterSecondUpgrade() {
  return Math.random() < window.NomiBagi.gameState.secondUpgradeChance;
};
