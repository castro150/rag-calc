// TODO
// colocar efeito do EDP

'use strict'

let baseLevel, str, dex, luk, rbonus, rpenalty, weaponLevel, baseWeaponDamage, refinament;
let bonus, penalty, em, equipAtk, masteryAtk, buffAtk, ammunAtk, aspd, critChance, bcrit;
let skillMult, skillBonus, hdef, sdef, mainStat, otherStat;

let REFINAMENT_TABLE = [];

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
  baseLevel = parseInt(readInput('blvl'));
  str = parseInt(readInput('str'));
  dex = parseInt(readInput('dex'));
  luk = parseInt(readInput('luk'));

  rbonus = (parseFloat(readInput('rbonus', '0')) / 100) + 1;
  rpenalty = parseFloat(readInput('rpenality', '100')) / 100;

  weaponLevel = parseInt(readInput('wlvl'));
  baseWeaponDamage = parseInt(readInput('batk'));
  refinament = parseInt(readInput('ref', '0'));
  bonus = parseFloat(readInput('bonus', '0')) / 100;
  penalty = parseFloat(readInput('penalty', '100')) / 100;
  em = (parseFloat(readInput('em', '0')) / 100) + 1;

  equipAtk = parseFloat(readInput('equip', '0'));
  masteryAtk = parseFloat(readInput('mastery', '0'));
  buffAtk = parseFloat(readInput('buff', '0'));
  ammunAtk = parseFloat(readInput('ammun', '0'));

  aspd = parseFloat(readInput('aspd'));
  critChance = parseFloat(readInput('crit', '0')) / 100;
  bcrit = (parseFloat(readInput('bcrit', '0')) / 100) + 1;

  skillMult = (parseFloat(readInput('smult', '100')) / 100);
  skillBonus = (parseFloat(readInput('sbonus', '0')) / 100) + 1;

  hdef = parseInt(readInput('hdef', '0'));
  sdef = parseInt(readInput('sdef', '0'));

  mainStat = str;
  otherStat = dex;
  if (readRadioInput('wtype') === 'dex') {
    mainStat = dex;
    otherStat = str;
  }
};

let calculate = function() {
  readValues();

  let statusAtk = calculateStatusAtk();
  let weaponAtk = calculateWeaponAtk();
  let finalEquipAtk = equipAtk * em * (bonus + 1) * penalty;

  let totalAtkMinus = (statusAtk * 2) + weaponAtk.weaponAtkMinus + finalEquipAtk + masteryAtk + buffAtk + ammunAtk;
  let totalAtkPlus = (statusAtk * 2) + weaponAtk.weaponAtkPlus + finalEquipAtk + masteryAtk + buffAtk + ammunAtk;

  let result = {};
  result.minus = Math.floor(calculateWithDef(totalAtkMinus));
  result.plus = Math.floor(calculateWithDef(totalAtkPlus));

  let critResult = {};
  let critDmg = 1.4 * bcrit;
  critResult.minus = Math.floor(calculateWithDef(totalAtkMinus) * critDmg);
  critResult.plus = Math.floor(calculateWithDef(totalAtkPlus) * critDmg);

  let skillResult = {
    minus: '',
    plus: ''
  };
  if (skillMult > 1 || skillBonus > 1) {
    skillResult.minus = Math.floor(calculateWithDef(totalAtkMinus * skillMult * skillBonus));
    skillResult.plus = Math.floor(calculateWithDef(totalAtkPlus * skillMult * skillBonus));
  }

  let dps = calculateDps(result, critResult);

  writeResult(statusAtk, weaponAtk, result, critResult, dps, skillResult);
};

let calculateStatusAtk = function() {
  return Math.floor((baseLevel / 4) + mainStat + (otherStat / 5) + (luk / 3));
};

let calculateWeaponAtk = function() {
  let variance = 0.05 * weaponLevel * baseWeaponDamage;
  let statBonus = baseWeaponDamage * mainStat / 200;

  let refMinus = 0;
  let refPlus = 0;
  if (refinament > 0) {
    refMinus = REFINAMENT_TABLE[weaponLevel - 1][refinament - 1][0];
    refPlus = REFINAMENT_TABLE[weaponLevel - 1][refinament - 1][1];
  }

  let weaponAtkMinus = Math.floor((baseWeaponDamage * em - variance + statBonus * em + refMinus * em) * (bonus + 1) * penalty);
  let weaponAtkPlus = Math.floor((baseWeaponDamage * em + variance + statBonus * em + refPlus * em) * (bonus + 1) * penalty);

  return {
    weaponAtkMinus,
    weaponAtkPlus
  };
};

let calculateWithDef = function(atk) {
  let hardDefMult = calculateHardDefMult();
  return atk * rbonus * rpenalty * hardDefMult - sdef;
};

let calculateHardDefMult = function() {
  return (4000 + hdef) / (4000 + hdef * 10);
};

let calculateDps = function(atk, critAtk) {
  let withoutCrit = calculateAtkSec(aspd) * (atk.minus + atk.plus) / 2;
  let withCrit = calculateAtkSec(aspd) * (critAtk.minus + critAtk.plus) / 2
  return withoutCrit * (1 - critChance) + withCrit * critChance;
};

let calculateAtkSec = function(aspd) {
  return 50 / (200 - aspd);
};

let writeValue = function(id, value) {
  document.getElementById(id).innerHTML = value;
};

let writeResult = function(statusAtk, weaponAtk, result, critResult, dps, skillResult) {
  writeValue('satk', statusAtk);
  writeValue('watak', weaponAtk.weaponAtkMinus + ' - ' + weaponAtk.weaponAtkPlus);
  writeValue('result', result.minus + ' - ' + result.plus);
  writeValue('cresult', critResult.minus + ' - ' + critResult.plus);
  writeValue('dps', dps);
  writeValue('sresult', skillResult.minus + ' - ' + skillResult.plus);
};

let createRefinamentTable = function() {
  REFINAMENT_TABLE[0] = [];
  for (let i = 0; i < 20; i++) {
    refinament = [(i + 1) * 2, (i + 1) * 2];
    if (i > 6) {
      refinament[1] = refinament[1] + (i - 6) * 2;
    }
    if (i > 14) {
      refinament[0] = refinament[0] + (i - 14) * 12;
      refinament[1] = refinament[1] + (i - 14) * 12;
    }
    REFINAMENT_TABLE[0].push(refinament);
  }
  REFINAMENT_TABLE[1] = [];
  for (let i = 0; i < 20; i++) {
    refinament = [(i + 1) * 3, (i + 1) * 3];
    if (i > 5) {
      refinament[1] = refinament[1] + (i - 5) * 5;
    }
    if (i > 14) {
      refinament[0] = refinament[0] + (i - 14) * 24;
      refinament[1] = refinament[1] + (i - 14) * 24;
    }
    REFINAMENT_TABLE[1].push(refinament);
  }
  REFINAMENT_TABLE[2] = [];
  for (let i = 0; i < 20; i++) {
    refinament = [(i + 1) * 5, (i + 1) * 5];
    if (i > 4) {
      refinament[1] = refinament[1] + (i - 4) * 8;
    }
    if (i > 14) {
      refinament[0] = refinament[0] + (i - 14) * 36;
      refinament[1] = refinament[1] + (i - 14) * 36;
    }
    REFINAMENT_TABLE[2].push(refinament);
  }
  REFINAMENT_TABLE[3] = [];
  for (let i = 0; i < 20; i++) {
    refinament = [(i + 1) * 7, (i + 1) * 7];
    if (i > 3) {
      refinament[1] = refinament[1] + (i - 3) * 14;
    }
    if (i > 14) {
      refinament[0] = refinament[0] + (i - 14) * 48;
      refinament[1] = refinament[1] + (i - 14) * 48;
    }
    REFINAMENT_TABLE[3].push(refinament);
  }
};
createRefinamentTable();
