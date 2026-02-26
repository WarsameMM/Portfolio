/**
 * Name: Warsame Mahdi
 * Date: October 8, 2025
 * Section: CSE 154 AL
 *TA: Tia-Jane Zhang Fowler
 * This is the JS to implement the UI for my Choose Your Own Adventure game. It
 * handles button clicks to reveal different stories based on the user's
 * choices.
 */
"use strict";
(function() {
  window.addEventListener("load", init);
  let button1, button2, button3;

  /** this function adds functionality to each button. */
  async function init() {
    await setIntro();
    button1 = qs(".btn-1");
    button2 = qs(".btn-2");
    button1.addEventListener("click", buttonClicked);
    button2.addEventListener("click", buttonClicked);
    let buttons = qsa(".btn-1");
    for (let i = 0; i < buttons.length; i++) {
      button1 = buttons[i];
      button1.addEventListener("click", buttonClicked);
    }
    buttons = qsa(".btn-2");
    for (let i = 0; i < buttons.length; i++) {
      button2 = buttons[i];
      button2.addEventListener("click", buttonClicked);
    }
    buttons = qsa(".btn-3");
    for (let i = 0; i < buttons.length; i++) {
      button3 = buttons[i];
      button3.addEventListener("click", () => {
        window.location.reload();
      });
    }
  }

  /**
   * this function changes the intro of the game based on if the user has
   * inputted a name and if the name is accessible
   */
  async function setIntro() {
    let intro = document.createElement("p");
    try {
      let name = await fetch("/name/get");
      statusCheck(name);
      name = await name.text();
      if (name !== "") {
        intro.textContent = "you are a Neaderthal named " + name + "thunk ";
      } else {
        intro.textContent = "you are a Neanderthal ";
      }
    } catch (err) {
      intro.textContent = "you are a Neanderthal that forgot their name ";
    }
    intro.textContent += qs("#intro p").textContent;
    id("intro").replaceChild(intro, qs("#intro p"));
  }

  /**
   * this function makes the button clicked reveal the appropriate next story decision
   * highlighting the option chose while crossing out the one not chosen. Also removes previous
   * buttons from the screen.
   * @param {event} evn the button that was clicked.
   */
  function buttonClicked(evn) {
    let chosen = evn.currentTarget;
    let notChosen;
    let targetId = chosen.getAttribute("data-target");
    let curr = chosen.parentElement;
    let next = id(targetId);
    next.classList.remove("invis");
    if (chosen.classList.contains("btn-1")) {
      curr.querySelector(".choice1").classList.add("chosen");
      curr.querySelector(".choice2").classList.add("notChosen");
      notChosen = curr.querySelector(".btn-2");
    } else {
      curr.querySelector(".choice2").classList.add("chosen");
      curr.querySelector(".choice1").classList.add("notChosen");
      notChosen = curr.querySelector(".btn-1");
    }
    curr.removeChild(chosen);
    curr.removeChild(notChosen);
    if (targetId === "cave" || targetId === "leave" || targetId === "hut") {
      updateBackground(targetId);
    }
  }

  /**
   * This function changes the background image based on the user's choice.
   * @param {string} targetId the id of the current story segment.
   */
  function updateBackground(targetId) {
    if (targetId === "cave" || targetId === "leave") {
      qs("body").style.backgroundImage = "url('img/background2.png')";
    } else if (targetId === "hut") {
      qs("body").style.backgroundImage = "url('img/background3.png')";
    }
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

  /**
   * shortcut for querySelectorAll.
   * @param {string} selector the selector to query all instances of.
   * @return {NodeList} all elements that match the selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();