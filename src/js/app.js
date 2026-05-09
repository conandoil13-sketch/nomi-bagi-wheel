// App controller: connects DOM, state, wheel spins, themes, and final result flow.
const {
  PHASES,
  gameState,
  resetGame,
  setFinalResult,
  setFirstResult,
  setMode,
  setPhase,
  setResultGrade,
  setSpinning,
  setWheelLevel,
  incrementSpinCount,
  applyImageFallback,
  burst,
  flashWheelSwap,
  playSound,
  resetWheel,
  shouldEnterBonus,
  shouldEnterSecondUpgrade,
  showBonusCutscene,
  spinWheel
} = window.NomiBagi;

const root = document.querySelector("[data-app]");
const wheel = document.querySelector("[data-wheel]");
const spinButton = document.querySelector("[data-spin-button]");
const modeLabel = document.querySelector("[data-mode-label]");
const spinCount = document.querySelector("[data-spin-count]");
const roundLabel = document.querySelector("[data-round-label]");
const message = document.querySelector("[data-message]");
const result = document.querySelector("[data-result]");
const effectsLayer = document.querySelector("[data-effects]");
const backdrop = document.querySelector("[data-backdrop]");
const wheelLabel = document.querySelector("[data-wheel-label]");
const wheelSegments = document.querySelector("[data-wheel-segments]");
const bonusBanner = document.querySelector("[data-bonus-banner]");

const backgrounds = {
  kids: "assets/images/bg-kids.png",
  pachinko: "assets/images/bg-pachinko.png"
};

const CHARACTER_IMAGES = {
  nomi: "assets/images/mushvenom.png",
  bagi: "assets/images/ibaksa.png"
};
const COPY_SPIN = "돌려 돌려 돌림판 이젠 나의 보너스 타임";
const COPY_LIFE = "보니 하니 본의 아니게 이뤄져 버린 나의 삶";

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function setTheme(mode) {
  setMode(mode);
  document.body.classList.toggle("theme-kids", mode === "kids");
  document.body.classList.toggle("theme-pachinko", mode === "pachinko");
  root.classList.toggle("is-upgrade-wheel", gameState.wheelLevel === "upgrade");
  root.classList.toggle("is-super-wheel", gameState.wheelLevel === "super");
  applyImageFallback(backdrop, backgrounds[mode], "");
}

function syncButton() {
  spinButton.disabled = gameState.spinning;
  spinButton.textContent = gameState.phase === PHASES.FINAL ? "다시 돌리기" : "돌려보기";
  root.classList.toggle("is-spinning", gameState.spinning);
}

function syncSpinCount() {
  spinCount.textContent = `누적 ${gameState.spinCount}회`;
}

function getFeaturedCharacterId() {
  return gameState.spinCount % 2 === 0 ? "bagi" : "nomi";
}

function getPortraitSrc(characterId = getFeaturedCharacterId()) {
  return CHARACTER_IMAGES[characterId] || CHARACTER_IMAGES.nomi;
}

function setBonusVisible(isVisible) {
  bonusBanner.hidden = !isVisible;
  bonusBanner.setAttribute("aria-hidden", String(!isVisible));
  root.classList.toggle("is-bonus", isVisible);
}

function paintStatus({ modeText, roundText, bodyText, resultText, labelText, portraitId }) {
  modeLabel.textContent = modeText;
  roundLabel.textContent = roundText;
  message.textContent = bodyText;
  result.textContent = resultText;
  wheelLabel.textContent = labelText;
  applyImageFallback(wheelLabel, getPortraitSrc(portraitId), "");
}

function showReady() {
  setWheelLevel("base");
  renderWheelSlots();
  setTheme("kids");
  setBonusVisible(false);
  resetWheel(wheel);
  paintStatus({
    modeText: "키즈 돌림판",
    roundText: "대기 중",
    bodyText: COPY_LIFE,
    resultText: COPY_SPIN,
    labelText: "READY"
  });
  syncButton();
}

function showBonus() {
  setTheme("pachinko");
  setBonusVisible(true);
  paintStatus({
    modeText: "PACHINKO BONUS",
    roundText: "업그레이드 돌림판",
    bodyText: COPY_SPIN,
    resultText: "777 UPGRADE!",
    labelText: "777"
  });
  playSound("bonus");
  burst(effectsLayer, 46);
}

function showSuperBonus() {
  setTheme("pachinko");
  setBonusVisible(true);
  paintStatus({
    modeText: "BLUE NEON JACKPOT",
    roundText: "2차 업그레이드",
    bodyText: COPY_LIFE,
    resultText: "SUPER 777!",
    labelText: "MAX"
  });
  playSound("bonus");
  burst(effectsLayer, 64);
}

function getResultGrade(finalPick) {
  const level = gameState.wheelLevel;
  const score = finalPick.score;

  if (level === "super") {
    if (score >= 720) {
      return { rank: "SSS", title: COPY_SPIN, className: "grade-sss" };
    }
    if (score >= 450) {
      return { rank: "SS", title: COPY_LIFE, className: "grade-ss" };
    }
    return { rank: "S", title: COPY_SPIN, className: "grade-s" };
  }

  if (level === "upgrade") {
    if (score >= 240) {
      return { rank: "A+", title: COPY_SPIN, className: "grade-a-plus" };
    }
    if (score >= 150) {
      return { rank: "A", title: COPY_LIFE, className: "grade-a" };
    }
    return { rank: "B+", title: COPY_SPIN, className: "grade-b-plus" };
  }

  if (score >= 80) {
    return { rank: "B", title: COPY_LIFE, className: "grade-b" };
  }
  if (score >= 40) {
    return { rank: "C", title: COPY_SPIN, className: "grade-c" };
  }

  return { rank: "D", title: COPY_LIFE, className: "grade-d" };
}

function renderFinalResult(finalPick) {
  const grade = gameState.resultGrade;

  result.innerHTML = `
    <span class="grade-badge ${grade.className}">${grade.rank}</span>
    <span class="result__main">${finalPick.label} ${finalPick.score}점 확정!</span>
    <span class="result__sub">${grade.title}</span>
  `;
}

function showFinal(finalPick) {
  const upgraded = gameState.wheelLevel === "upgrade" || gameState.wheelLevel === "super";
  const grade = getResultGrade(finalPick);

  setPhase(PHASES.FINAL);
  setSpinning(false);
  setBonusVisible(false);
  setTheme(upgraded ? "pachinko" : "kids");
  setResultGrade(grade);
  paintStatus({
    modeText: upgraded ? "FINAL RESULT" : "기본 결과",
    roundText: "최종 결과",
    bodyText: upgraded ? COPY_SPIN : COPY_LIFE,
    resultText: "",
    labelText: `${finalPick.score}`,
    portraitId: finalPick.resultId
  });
  renderFinalResult(finalPick);
  playSound("result");
  burst(effectsLayer, upgraded ? 58 : 20);
  syncButton();
}

async function runSpinRound(phase, extraTurns, options = {}) {
  setPhase(phase);
  setSpinning(true);
  syncButton();
  playSound("spin");

  return spinWheel({
    wheelElement: wheel,
    minTurns: extraTurns,
    slots: gameState.slots,
    power: options.power,
    upgradeCheck: options.upgradeCheck,
    onUpgradeHit: options.onUpgradeHit
  });
}

async function startGame() {
  incrementSpinCount();
  syncSpinCount();
  setBonusVisible(false);
  setWheelLevel("base");
  renderWheelSlots();
  setTheme("kids");
  paintStatus({
    modeText: "키즈 돌림판",
    roundText: "1차 회전",
    bodyText: COPY_SPIN,
    resultText: "회전 중",
    labelText: "GO!"
  });

  let upgradeWon = false;
  const firstSpin = await runSpinRound(PHASES.FIRST_SPIN, 5, {
    upgradeCheck: () => {
      upgradeWon = shouldEnterBonus();
      paintStatus({
        modeText: upgradeWon ? "UPGRADE HIT" : "키즈 돌림판",
        roundText: "확률 판정",
        bodyText: upgradeWon ? COPY_SPIN : COPY_LIFE,
        resultText: upgradeWon ? "UPGRADE!" : "계속 회전",
        labelText: upgradeWon ? "UP!" : "GO!"
      });
      return upgradeWon;
    },
    onUpgradeHit: async () => {
      setPhase(PHASES.UPGRADE);
      await showBonusCutscene({
        portraitSrc: getPortraitSrc("nomi")
      });
      setWheelLevel("upgrade");
      setTheme("pachinko");
      renderWheelSlots();
      setBonusVisible(true);
      paintStatus({
        modeText: "PACHINKO BONUS",
        roundText: "업그레이드 발생",
        bodyText: COPY_SPIN,
        resultText: "777 UPGRADE!",
        labelText: "UP!"
      });
      playSound("bonus");
      burst(effectsLayer, 42);
      await flashWheelSwap(wheel);
    }
  });

  if (!upgradeWon) {
    const firstPick = firstSpin.result;

    setFirstResult(firstPick);
    setFinalResult(firstPick);
    showFinal(firstPick);
    return;
  }

  showBonus(null);
  await wait(1050);

  paintStatus({
    modeText: "PACHINKO BONUS",
    roundText: "강화 회전",
    bodyText: COPY_LIFE,
    resultText: "DOUBLE CHANCE",
    labelText: "777"
  });

  let secondUpgradeWon = false;
  const upgradedSpin = await runSpinRound(PHASES.SECOND_SPIN, 8, {
    power: "rush",
    upgradeCheck: () => {
      secondUpgradeWon = shouldEnterSecondUpgrade();
      paintStatus({
        modeText: secondUpgradeWon ? "SECOND UPGRADE HIT" : "PACHINKO BONUS",
        roundText: "2차 판정",
        bodyText: secondUpgradeWon ? COPY_SPIN : COPY_LIFE,
        resultText: secondUpgradeWon ? "BLUE JACKPOT!" : "결과 대기",
        labelText: secondUpgradeWon ? "2UP" : "777"
      });
      return secondUpgradeWon;
    },
    onUpgradeHit: async () => {
      setPhase(PHASES.SUPER_UPGRADE);
      await showBonusCutscene({
        portraitSrc: getPortraitSrc("bagi"),
        variant: "super",
        steps: [
          { label: "어라?", delay: 420, duration: 380, className: "is-curious" },
          { label: "더블 찬스?", delay: 0, duration: 520, className: "is-chance" },
          { label: "SUPER BONUS!!!", delay: 0, duration: 780, className: "is-bonus-hit" }
        ]
      });
      setWheelLevel("super");
      setTheme("pachinko");
      renderWheelSlots();
      setBonusVisible(true);
      showSuperBonus();
      await flashWheelSwap(wheel);
    }
  });

  if (!secondUpgradeWon) {
    const finalPick = upgradedSpin.result;

    setFinalResult(finalPick);
    showFinal(finalPick);
    return;
  }

  await wait(920);
  paintStatus({
    modeText: "BLUE NEON JACKPOT",
    roundText: "최종 슈퍼 회전",
    bodyText: COPY_SPIN,
    resultText: "MAX RUSH",
    labelText: "MAX"
  });

  const finalSpin = await runSpinRound(PHASES.SECOND_SPIN, 9, { power: "rush" });
  const finalPick = finalSpin.result;

  setFinalResult(finalPick);
  showFinal(finalPick);
}

function renderWheelSlots() {
  wheelSegments.innerHTML = "";
  root.classList.toggle("is-upgrade-wheel", gameState.wheelLevel === "upgrade");
  root.classList.toggle("is-super-wheel", gameState.wheelLevel === "super");

  gameState.slots.forEach((slot) => {
    const segment = document.createElement("div");
    const portrait = document.createElement("span");
    const label = document.createElement("strong");
    const score = document.createElement("span");

    segment.className = `wheel__segment wheel__segment--${slot.resultId}`;
    segment.style.setProperty("--slot-angle", `${slot.angle}deg`);
    portrait.className = "wheel__portrait";
    score.className = "wheel__score";
    label.textContent = slot.label;
    score.textContent = `${slot.score}점`;

    segment.append(portrait, label, score);
    wheelSegments.append(segment);

    applyImageFallback(
      portrait,
      slot.image,
      slot.placeholder
    );
  });
}

spinButton.addEventListener("click", () => {
  if (gameState.spinning) {
    return;
  }

  playSound("click");

  if (gameState.phase === PHASES.FINAL) {
    resetGame();
    showReady();
    return;
  }

  startGame();
});

renderWheelSlots();
showReady();
syncSpinCount();
