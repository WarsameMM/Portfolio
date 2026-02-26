/**
 * Name: Warsame Mahdi
 * Date: October 22, 2025
 * Section: CSE 154 AL
 * TA: Tia-Jane Zhang Fowler
 * This is the JS to implement the DND character generator. When the user clicks
 * the generate character button, it pulls from the DND api to generate a random
 * race, class, background and stats for a character, also listing its proficiencies
 * and starting equipment options. The user has the choice to regenerate the character,
 * reroll its ability scores, or generate a random spell from their characters class.
 */
"use strict";
(function() {
  window.addEventListener("load", init);
  const DND_API_URL = "https://www.dnd5eapi.co";
  const MIN_SCORE = 8;
  const DICE_SIDES = 6;
  const NOOUTPUT = 204;
  let character = {
    race: "",
    class: "",
    background: "",
    stats: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0
    },
    proficiencies: [],
    startingEquipment: []
  };

  /** This function sets up the functionality of the generate character and reroll stats buttons */
  function init() {
    id("btn-1").addEventListener("click", firstCharacter);
    id("btn-2").addEventListener("click", rerollStats);
    id("btn-3").addEventListener("click", displayRandomSpell);
  }

  /**
   * This function handles the first generate character button click. It reveals the
   * reroll stats button and makes the first button say "Regenerate Character".
   */
  async function firstCharacter() {
    await characterGenerator();
    if (!id("character").contains(qs(".error"))) {
      id("btn-2").classList.remove("invis");
      id("spell").classList.remove("invis");
      id("btn-1").textContent = "Regenerate Character";
      qs("h2").textContent = "Here is your generated character:";
      id("btn-1").removeEventListener("click", firstCharacter);
      id("btn-1").addEventListener("click", characterGenerator);
    }
  }

  /**
   * This async function is the character generator. It randomly picks a race, class
   * and background from the DND api, randomly generates its ability scores and
   * gets that characters proficiencies and equipment/equipment choices. Will
   * disable button and display text if an error occurs
   */
  async function characterGenerator() {
    try {
      character.race = randomGenerator(await fetchDetails("races"));
      character.class = randomGenerator(await fetchDetails("classes"));
      character.background = randomGenerator(await fetchBackgrounds());
      let proficiencyList = await fetchFeatures("proficiencies");
      character.proficiencies = [];
      for (let i = 0; i < proficiencyList.count; i++) {
        character.proficiencies.push(proficiencyList.results[i]);
      }
      statGenerator();
      displayCharacter();
    } catch (err) {
      throwError(id("character"), id("btn-1"));
    }
  }

  /**
   * This function fetches a list of backgrounds from an API.
   * @return {Object} A list of backgrounds from the API.
   */
  async function fetchBackgrounds() {
    let backgrounds = await fetch("/backgrounds/get");
    if (backgrounds.status === NOOUTPUT) {
      let background = [
        {"name": "Accolyte"}
      ];
      return background;
    }
    await statusCheck(backgrounds);
    backgrounds = await backgrounds.json();
    return backgrounds;
  }

  /**
   * This function displays the character for the user. It lists the characters
   * race, class, background, stats, profiencencies and equipment/equipment
   * choices.
   */
  function displayCharacter() {
    id("character").innerHTML = "";
    qs("#spell article").innerHTML = "";
    qs("h2").textContent = "Here is your generated character:";
    let characterInfo = document.createElement("p");
    characterInfo.textContent = "Race: " + character.race.name + "\n" +
      "Class: " + character.class.name + "\n" +
      "Background: " + character.background.name;
    id("character").appendChild(characterInfo);
    id("character").appendChild(displayStats());
    let characterDetails = document.createElement("p");
    characterDetails.textContent = "Proficiencies: \n";
    for (let i = 0; i < character.proficiencies.length; i++) {
      characterDetails.textContent += "- " + character.proficiencies[i].name + "\n";
    }
    id("character").appendChild(characterDetails);
    displayEquipment();
  }

  /** This function rerolls the current characters ability scores when the button is clicked. */
  function rerollStats() {
    statGenerator();
    id("character").replaceChild(displayStats(), qs(".stats"));
  }

  /**
   * This function creates and returns a display of the character's ability scores.
   * @return {Element} the element containing the character's ability scores.
   */
  function displayStats() {
    let statInfo = document.createElement("p");
    statInfo.classList.add("stats");
    statInfo.textContent = `Ability Scores:
    STR: ${character.stats.STR}
    DEX: ${character.stats.DEX}
    CON: ${character.stats.CON}
    INT: ${character.stats.INT}
    WIS: ${character.stats.WIS}
    CHA: ${character.stats.CHA}`;
    return statInfo;
  }

  /** This function displays the characters equipment and equipment choices.*/
  async function displayEquipment() {
    character.startingEquipment = [];
    let equipment = await fetchFeatures("starting-equipment");
    for (let i = 0; i < equipment.starting_equipment.length; i++) {
      character.startingEquipment.push(equipment.starting_equipment[i]);
    }
    let equipInfo = document.createElement("p");
    equipInfo.textContent = "Starting Equipment: \n";
    for (let i = 0; i < character.startingEquipment.length; i++) {
      equipInfo.textContent += "- " + character.startingEquipment[i].equipment.name + "\n";
    }
    let equipChoices = equipment.starting_equipment_options;
    equipInfo.textContent += "Equipment Choices: \n";
    for (let i = 0; i < equipChoices.length; i++) {
      if (equipChoices[i].from["option_set_type"] === "options_array") {
        equipInfo.textContent += `Choose ${equipChoices[i].choose} from the following:
        -  ${equipChoices[i].desc}\n`;
      } else {
        equipInfo.textContent += await equipmentCategory(equipChoices[i]);
      }
    }
    id("character").appendChild(equipInfo);
  }

  /**
   * This function handles equipment choices that are of the equipment categories type.
   * It fetches the equipment in that category and returns a string listing them.
   * @param {Object} equipCategory the equipment choice object from the api
   * @return {string} the string listing the equipment in that category.
   */
  async function equipmentCategory(equipCategory) {
    let categoryList =
    `Choose ${equipCategory.choose} of the ${equipCategory.from.equipment_category.name} :\n`;
    let category = await fetch(DND_API_URL +
      equipCategory.from.equipment_category.url);
    await statusCheck(category);
    category = await category.json();
    for (let i = 0; i < category.equipment.length; i++) {
      categoryList += `- ${category.equipment[i].name}\n`;
    }
    return categoryList;
  }

  /** This function displays a random spell for the character's class when the button is clicked. */
  async function displayRandomSpell() {
    try {
      qs("#spell article").innerHTML = "";
      let spells = await fetchFeatures("spells");
      let spellDisplay = document.createElement("p");
      if (spells.count < 1) {
        spellDisplay.textContent += "The " + character.class.name + " class has no spells.";
      } else {
        let spell = randomGenerator(spells.results);
        let spellInfo = await fetch(DND_API_URL + "/api/2014/spells/" + spell.index);
        await statusCheck(spellInfo);
        spellInfo = await spellInfo.json();
        spellDisplay.textContent += "Name: " + spellInfo.name + "\n" +
        "Description:" + spellInfo.desc + "\n" +
        "Duration: " + spellInfo.duration + "\n" +
        "Range: " + spellInfo.range + "\n" +
        "level: " + spellInfo.level + ". " + spellInfo.higher_level + "\n" +
        "School: " + spellInfo.school.name;
      }
      qs("#spell article").appendChild(spellDisplay);
    } catch (err) {
      throwError(qs("#spell article"), id("btn-3"));
    }
  }

  /**
   * This function displays an error message in the given text box and disables the button.
   * @param {Element} textBox the text box to display the error message in
   * @param {Element} button the button to disable
   */
  function throwError(textBox, button) {
    textBox.innerHTML = "";
    let errorMessage = document.createElement("p");
    errorMessage.classList.add("error");
    errorMessage.textContent = "The button is currently not working.";
    button.disabled = true;
    textBox.appendChild(errorMessage);
  }

  /**
   * This function fetches details from the DND api given a feature type.
   * @param {string} feature the feature type to fetch from the api
   * @return {Object} the results object from the fetched feature type.
   */
  async function fetchDetails(feature) {
    feature = await fetch(DND_API_URL + "/api/2014/" + feature);
    await statusCheck(feature);
    feature = await feature.json();
    return feature.results;
  }

  /**
   * This function fetches specific features of the character's class from the DND api.
   * @param {string} feature the specific feature to fetch from the api
   * @return {Object} the fetched detail object from the api.
   */
  async function fetchFeatures(feature) {
    feature = await fetch(DND_API_URL + "/api/2014/classes/" +
      character.class.index + "/" + feature);
    await statusCheck(feature);
    feature = await feature.json();
    return feature;
  }

  /**
   * This function returns a random element from an array of results.
   * @param {Array} results the array of results to pick a random element from
   * @return {Object} a random element from the results array.
   */
  function randomGenerator(results) {
    return results[Math.floor(Math.random() * results.length)];
  }

  /** This function generates random ability scores for the character, with a minimum of 8. */
  function statGenerator() {
    character.stats.STR = rollDice();
    character.stats.DEX = rollDice();
    character.stats.CON = rollDice();
    character.stats.INT = rollDice();
    character.stats.WIS = rollDice();
    character.stats.CHA = rollDice();
  }

  /**
   * This function rolls 3d6 until the score is at least the minimum score of 8.
   * @return {number} the rolled score.
   */
  function rollDice() {
    let score = 0;
    while (score < MIN_SCORE) {
      score = 0;
      for (let i = 0; i < 3; i++) {
        score += Math.floor(Math.random() * DICE_SIDES) + 1;
      }
    }
    return score;
  }

  /**
   * This function checks the status of a fetch request.
   * @param {Response} res the fetch request to check
   * @return {Response} the response if ok
   * @throws {Error} if the response is not ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * shortcut for getElementbyId.
   * @param {string} id the id of the element to get
   * @return {Element} the element with the given id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * shortcut for querySelector.
   * @param {string} selector the selector to query the first instance of.
   * @return {Element} the first element that matches the selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();