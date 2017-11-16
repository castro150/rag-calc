'use strict'

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

let calculate = function() {
  let mainStat = parseFloat(readInput('str'));
  let otherStat = parseFloat(readInput('dex'));
  if (readRadioInput('wtype') === 'dex') {
    mainStat = parseFloat(readInput('dex'));
    otherStat = parseFloat(readInput('str'));
  }

  let statusAtk = calculateStatusAtk(mainStat, otherStat);
  let weaponAtk = calculateWeaponAtk(mainStat);
  let extraAtk = parseFloat(readInput('extra', '0'));
  let masteryAtk = parseFloat(readInput('mastery', '0'));
  let buffAtk = parseFloat(readInput('buff', '0'));

  let resultMinus = statusAtk + weaponAtk.weaponAtkMinus + extraAtk + masteryAtk + buffAtk;
  let resultPlus = statusAtk + weaponAtk.weaponAtkPlus + extraAtk + masteryAtk + buffAtk;

  let aspd = parseFloat(readInput('aspd'));
  let dps = calculateAtkSec(aspd) * (resultMinus + resultPlus) / 2;

  writeResult(statusAtk, weaponAtk, resultMinus, resultPlus, dps);
};

let calculateStatusAtk = function(mainStat, otherStat) {
  let baseLevel = parseFloat(readInput('blvl'));
  let luk = parseFloat(readInput('luk'));

  return Math.floor((baseLevel / 4) + mainStat + (otherStat / 5) + (luk / 3));
};

let calculateWeaponAtk = function(mainStat) {
  let weaponLevel = parseFloat(readInput('wlvl'));
  let baseWeaponDamage = parseFloat(readInput('batk'));
  let refinament = parseFloat(readInput('ref'));
  let bonus = parseFloat(readInput('bonus', '0')) / 100;
  let penalty = parseFloat(readInput('penalty', '100')) / 100;

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
