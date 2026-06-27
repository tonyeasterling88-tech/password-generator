const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()",
};

const passwordOutput = document.querySelector("#password-output");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const copyStatus = document.querySelector("#copy-status");
const lengthInput = document.querySelector("#length");
const lengthValue = document.querySelector("#length-value");
const strengthMeter = document.querySelector("#strength-meter");
const strengthLabel = document.querySelector("#strength-label");
const strengthNote = document.querySelector("#strength-note");
const optionInputs = [...document.querySelectorAll(".option-card input")];

function secureRandomUint32() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is not available in this browser.");
  }

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

function randomIndex(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) {
    throw new RangeError("randomIndex requires a positive integer below 2^32.");
  }

  const limit = Math.floor(2 ** 32 / max) * max;
  let value = secureRandomUint32();

  while (value >= limit) {
    value = secureRandomUint32();
  }

  return value % max;
}

function shuffle(value) {
  const letters = [...value];

  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
  }

  return letters.join("");
}

function selectedSets() {
  return optionInputs
    .filter((input) => input.checked)
    .map((input) => characterSets[input.id]);
}

function detectedSetCount(password) {
  return [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

function generatePassword() {
  const sets = selectedSets();

  if (!sets.length) {
    optionInputs.find((input) => input.id === "lowercase").checked = true;
    return generatePassword();
  }

  const length = Number(lengthInput.value);
  const allCharacters = sets.join("");
  let password = sets.map((set) => set[randomIndex(set.length)]).join("");

  while (password.length < length) {
    password += allCharacters[randomIndex(allCharacters.length)];
  }

  return shuffle(password.slice(0, length));
}

function scorePassword(password) {
  const variety = detectedSetCount(password);
  const length = password.length;
  let score = 0;

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 18) score += 1;
  if (variety >= 3) score += 1;
  if (variety === 4 && length >= 16) score += 1;

  return Math.max(1, Math.min(5, score));
}

function renderStrength(password) {
  const score = scorePassword(password);
  const segments = [...strengthMeter.children];
  const state =
    score <= 2 ? ["weak", "Weak", "Use more length and character variety."] :
    score === 3 ? ["fair", "Fair", "This is usable, but can be stronger."] :
    score === 4 ? ["strong", "Strong", "Your password is strong. Great job."] :
    ["strong", "Excellent", "Long, varied, and difficult to guess."];

  strengthMeter.className = `strength-meter ${state[0]}`;
  segments.forEach((segment, index) => {
    segment.classList.toggle("active", index < score);
  });
  strengthLabel.textContent = state[1];
  strengthNote.textContent = state[2];
}

function refreshPassword() {
  try {
    const password = generatePassword();
    passwordOutput.value = password;
    lengthValue.textContent = lengthInput.value;
    copyStatus.textContent = "";
    renderStrength(password);
  } catch (error) {
    passwordOutput.value = "Secure generation unavailable";
    copyStatus.textContent = error.message;
    strengthMeter.className = "strength-meter weak";
    [...strengthMeter.children].forEach((segment, index) => {
      segment.classList.toggle("active", index === 0);
    });
    strengthLabel.textContent = "Unavailable";
    strengthNote.textContent = "Use a modern browser with secure randomness.";
  }
}

async function copyPassword() {
  const password = passwordOutput.value;

  if (!password || password === "Secure generation unavailable") {
    copyStatus.textContent = "Generate a password before copying.";
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    copyStatus.textContent = "Copied to clipboard.";
  } catch {
    const helper = document.createElement("textarea");
    helper.value = password;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-999px";
    helper.style.left = "-999px";
    document.body.append(helper);
    helper.select();

    const copied = document.execCommand("copy");
    helper.remove();
    copyStatus.textContent = copied
      ? "Copied to clipboard."
      : "Copy failed. Select the password and copy it manually.";
  }
}

generateButton.addEventListener("click", refreshPassword);
copyButton.addEventListener("click", copyPassword);
lengthInput.addEventListener("input", refreshPassword);
passwordOutput.addEventListener("input", () => {
  copyStatus.textContent = "";
  renderStrength(passwordOutput.value);
});
optionInputs.forEach((input) => input.addEventListener("change", refreshPassword));

refreshPassword();
