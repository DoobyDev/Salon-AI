const HOME_VISIBLE_SELECTORS = [
  ".top-lexi-marquee",
  ".hero.home-conversion-stage",
  "#dashboards",
  "#join",
  ".frontdesk-section",
  "#footerPolicies"
];

function ensureHomeShell(main) {
  let shell = document.getElementById("homepageResetShell");
  if (shell) return shell;
  shell = document.createElement("div");
  shell.id = "homepageResetShell";
  shell.className = "homepage-reset-shell";

  const hero = document.createElement("section");
  hero.id = "homepageResetHero";
  hero.className = "homepage-reset-hero";

  const proof = document.createElement("section");
  proof.id = "homepageResetProof";
  proof.className = "homepage-reset-proof";

  const conversion = document.createElement("section");
  conversion.id = "homepageResetConversion";
  conversion.className = "homepage-reset-conversion";

  const vault = document.createElement("div");
  vault.id = "homepageResetVault";
  vault.className = "homepage-reset-vault";
  vault.hidden = true;
  vault.setAttribute("aria-hidden", "true");

  shell.append(hero, proof, conversion, vault);
  main.prepend(shell);
  return shell;
}

function showHomeNode(node, target) {
  if (!(node instanceof HTMLElement) || !(target instanceof HTMLElement)) return;
  node.hidden = false;
  node.style.removeProperty("display");
  node.removeAttribute("aria-hidden");
  target.appendChild(node);
}

function hideHomeNode(node, vault) {
  if (!(node instanceof HTMLElement) || !(vault instanceof HTMLElement)) return;
  node.hidden = true;
  node.style.display = "none";
  node.setAttribute("aria-hidden", "true");
  vault.appendChild(node);
}

function applyHomepageReset() {
  const main = document.getElementById("home");
  if (!(main instanceof HTMLElement)) return;
  const shell = ensureHomeShell(main);
  const hero = document.getElementById("homepageResetHero");
  const proof = document.getElementById("homepageResetProof");
  const conversion = document.getElementById("homepageResetConversion");
  const vault = document.getElementById("homepageResetVault");
  if (!(hero instanceof HTMLElement) || !(proof instanceof HTMLElement) || !(conversion instanceof HTMLElement) || !(vault instanceof HTMLElement)) return;

  const visibleNodes = HOME_VISIBLE_SELECTORS.map((selector) => document.querySelector(selector)).filter((node) => node instanceof HTMLElement);
  const visibleSet = new Set(visibleNodes);
  const allChildren = Array.from(main.children).filter((node) => node instanceof HTMLElement && node.id !== "homepageResetShell");

  allChildren.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (visibleSet.has(node)) return;
    hideHomeNode(node, vault);
  });

  const heroNodes = [document.querySelector(".top-lexi-marquee"), document.querySelector(".hero.home-conversion-stage")];
  heroNodes.forEach((node) => {
    if (node instanceof HTMLElement) showHomeNode(node, hero);
  });

  const proofNodes = [document.getElementById("dashboards"), document.querySelector(".frontdesk-section")];
  proofNodes.forEach((node) => {
    if (node instanceof HTMLElement) showHomeNode(node, proof);
  });

  const conversionNodes = [document.getElementById("join")];
  conversionNodes.forEach((node) => {
    if (node instanceof HTMLElement) showHomeNode(node, conversion);
  });

  main.setAttribute("data-home-reset-active", "true");
  document.body?.setAttribute("data-home-reset-active", "true");
}

function runHomepageReset() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyHomepageReset);
  });
  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(applyHomepageReset);
    });
  }, 600);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runHomepageReset, { once: true });
} else {
  runHomepageReset();
}
