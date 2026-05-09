// Central state for phases, wheel level, score slots, and final result.
window.NomiBagi = window.NomiBagi || {};

window.NomiBagi.PHASES = {
  READY: "ready",
  FIRST_SPIN: "firstSpin",
  UPGRADE: "upgrade",
  SUPER_UPGRADE: "superUpgrade",
  SECOND_SPIN: "secondSpin",
  FINAL: "final"
};

window.NomiBagi.createWheelSlots = function createWheelSlots(multiplier = 1) {
  const baseScores = [10, 15, 20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 100];

  return baseScores.map((score, index) => {
    const isNomi = index % 2 === 0;

    return {
      id: `${isNomi ? "nomi" : "bagi"}-${index + 1}-x${multiplier}`,
      resultId: isNomi ? "nomi" : "bagi",
      label: isNomi ? "노미" : "바기",
      image: isNomi ? "assets/images/mushvenom.png" : "assets/images/ibaksa.png",
      placeholder: isNomi ? "노" : "바",
      score: score * multiplier,
      angle: index * 22.5,
      level: multiplier === 1 ? "base" : multiplier === 3 ? "upgrade" : "super"
    };
  });
};

window.NomiBagi.baseSlots = window.NomiBagi.createWheelSlots(1);
window.NomiBagi.upgradeSlots = window.NomiBagi.createWheelSlots(3);
window.NomiBagi.superSlots = window.NomiBagi.createWheelSlots(9);

window.NomiBagi.getStoredSpinCount = function getStoredSpinCount() {
  const storedCount = window.localStorage.getItem("nomiBagiSpinCount");
  const parsedCount = Number.parseInt(storedCount, 10);

  return Number.isFinite(parsedCount) ? parsedCount : 0;
};

window.NomiBagi.gameState = {
  phase: window.NomiBagi.PHASES.READY,
  mode: "kids",
  wheelLevel: "base",
  rotation: 0,
  spinning: false,
  spinCount: window.NomiBagi.getStoredSpinCount(),
  firstResult: null,
  finalResult: null,
  resultGrade: null,
  bonusChance: 0.3,
  secondUpgradeChance: 0.3,
  slots: [...window.NomiBagi.baseSlots]
};

window.NomiBagi.setWheelLevel = function setWheelLevel(level) {
  const { gameState, baseSlots, upgradeSlots, superSlots } = window.NomiBagi;

  gameState.wheelLevel = level;

  if (level === "super") {
    gameState.slots = [...superSlots];
    return;
  }

  gameState.slots = level === "upgrade" ? [...upgradeSlots] : [...baseSlots];
};

window.NomiBagi.resetGame = function resetGame() {
  const { PHASES, gameState, setWheelLevel } = window.NomiBagi;

  gameState.phase = PHASES.READY;
  gameState.mode = "kids";
  gameState.rotation = 0;
  gameState.spinning = false;
  gameState.firstResult = null;
  gameState.finalResult = null;
  gameState.resultGrade = null;
  setWheelLevel("base");
};

window.NomiBagi.setPhase = function setPhase(phase) {
  window.NomiBagi.gameState.phase = phase;
};

window.NomiBagi.setMode = function setMode(mode) {
  window.NomiBagi.gameState.mode = mode;
};

window.NomiBagi.setSpinning = function setSpinning(isSpinning) {
  window.NomiBagi.gameState.spinning = isSpinning;
};

window.NomiBagi.setFirstResult = function setFirstResult(option) {
  window.NomiBagi.gameState.firstResult = option;
};

window.NomiBagi.setFinalResult = function setFinalResult(option) {
  window.NomiBagi.gameState.finalResult = option;
};

window.NomiBagi.setResultGrade = function setResultGrade(grade) {
  window.NomiBagi.gameState.resultGrade = grade;
};

window.NomiBagi.incrementSpinCount = function incrementSpinCount() {
  const { gameState } = window.NomiBagi;

  gameState.spinCount += 1;
  window.localStorage.setItem("nomiBagiSpinCount", String(gameState.spinCount));

  return gameState.spinCount;
};
