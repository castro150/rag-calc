'use strict'

let baseLevel, str, dex, luk, weaponLevel, baseWeaponDamage, refinament;
let bonus, penalty, extraAtk, masteryAtk, buffAtk, aspd;

let readInput = function(id, def = '1') {
  return document.getElementById(id).value || def;
};

let readRadioInput = function(name) {
  let radios = document.getElementsByName(name);
  let checked = Array.from(radios).filter((radio) => {
    return radio.checked
  });
  return checked[0].value;
};

let readValues = function() {
  baseLevel = parseFloat(readInput('blvl'));
  str = parseFloat(readInput('str'));
  dex = parseFloat(readInput('dex'));
  luk = parseFloat(readInput('luk'));

  weaponLevel = parseFloat(readInput('wlvl'));
  baseWeaponDamage = parseFloat(readInput('batk'));
  refinament = parseFloat(readInput('ref'));
  bonus = parseFloat(readInput('bonus', '0')) / 100;
  penalty = parseFloat(readInput('penalty', '100')) / 100;

  extraAtk = parseFloat(readInput('extra', '0'));
  masteryAtk = parseFloat(readInput('mastery', '0'));
  buffAtk = parseFloat(readInput('buff', '0'));

  aspd = parseFloat(readInput('aspd'));
};

let calculate = function() {
  readValues();

  let mainStat = str;
  let otherStat = dex;
  if (readRadioInput('wtype') === 'dex') {
    mainStat = dex;
    otherStat = str;
  }

  let statusAtk = calculateStatusAtk(mainStat, otherStat);
  let weaponAtk = calculateWeaponAtk(mainStat);

  let resultMinus = statusAtk + weaponAtk.weaponAtkMinus + extraAtk + masteryAtk + buffAtk;
  let resultPlus = statusAtk + weaponAtk.weaponAtkPlus + extraAtk + masteryAtk + buffAtk;

  let dps = calculateAtkSec(aspd) * (resultMinus + resultPlus) / 2;

  writeResult(statusAtk, weaponAtk, resultMinus, resultPlus, dps);
};

let calculateStatusAtk = function(mainStat, otherStat) {
  return Math.floor((baseLevel / 4) + mainStat + (otherStat / 5) + (luk / 3));
};

let calculateWeaponAtk = function(mainStat) {
  let variance = 0.05 * weaponLevel * baseWeaponDamage;
  let statBonus = baseWeaponDamage * mainStat / 200;

  let weaponAtkMinus = Math.floor((baseWeaponDamage - variance + statBonus + refinament) * (bonus + 1) * penalty);
  let weaponAtkPlus = Math.floor((baseWeaponDamage + variance + statBonus + refinament) * (bonus + 1) * penalty);
  return {
    weaponAtkMinus,
    weaponAtkPlus
  };
};

let calculateAtkSec = function(aspd) {
  return 50 / (200 - aspd);
};

let writeValue = function(id, value) {
  document.getElementById(id).innerHTML = value;
};

let writeResult = function(statusAtk, weaponAtk, resultMinus, resultPlus, dps) {
  writeValue('satk', statusAtk);
  writeValue('watak', weaponAtk.weaponAtkMinus + ' - ' + weaponAtk.weaponAtkPlus);
  writeValue('result', resultMinus + ' - ' + resultPlus);
  writeValue('dps', dps);
};
