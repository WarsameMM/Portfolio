/**
 * Name: Warsame Mahdi
 * Date: November 8th, 2025
 * Section: CSE 154 AL
 * TA: Tia-Jane Zhang Fowler
 * This is the JS to implement the website portfolio. It links each website button
 * to its corresponding website, sets up the functionality of both adding a name
 * and changing the given name and allows the user to add a unique background to
 * the list used for the DND character generator.
 */
"use strict";
(function() {
  window.addEventListener("load", init);
  window.addEventListener("load", clearName);
  const USERERROR = 400;

  /**
   * this function sets up the functionality of all the website buttons, the
   * name form and the background adder.
   */
  function init() {
    qs("section #addname form").addEventListener("submit", function(evn) {
      evn.preventDefault();
      submitName();
      qs("section #addname form").reset();
    });
    qs("section #addbg form").addEventListener("submit", function(evn) {
      evn.preventDefault();
      submitBackground();
      qs("section #addbg form").reset();
    });
    id("btn-1").addEventListener("click", () => {
      window.location.href = "about.html";
    });
    id("btn-2").addEventListener("click", () => {
      window.location.href = "cyoagame.html";
    });
    id("btn-3").addEventListener("click", () => {
      window.location.href = "dnd.html";
    });
  }

  /**
   * This function clears the name given to the API and allows the user to
   * submit a new one.
   */
  async function resubmitName() {
    await clearName();
    qs("section #addname").classList.remove("invis");
    id("rename").classList.add("invis");
    let defaultHeader = document.createElement("h2");
    defaultHeader.textContent = "Welcome!";
    qs("header").replaceChild(defaultHeader, qs("header h2"));
  }

  /**
   * this function clears the name from the api.
   * @returns {String} a message confirming the name was cleared
   */
  async function clearName() {
    try {
      let response = await fetch("/name/clear", {method: "POST", body: null});
      statusCheck(response);
      return await response.text();
    } catch (err) {
      qs("section #addname p").textContent =
        "There was an error when trying to clear the name.";
      qs("section #addname p").classList.add("error");
    }
  }

  /** This function allows the user to submit a name to the API. */
  async function submitName() {
    try {
      let data = new FormData(qs("section #addname form"));
      let name = await fetch("/name/submit", {method: "POST", body: data});
      statusCheck(name);
      name = await name.text();
      qs("section #addname").classList.add("invis");
      id("rename").classList.remove("invis");
      name = "Welcome " + name + "!";
      qs("header h2").textContent = name;
      qs("header h2").addEventListener("dblclick", resubmitName);
      qs("header h2").addEventListener('mouseenter', () => {
        qs("header h2").textContent = 'Change Name?';
      });
      qs("header h2").addEventListener('mouseleave', () => {
        qs("header h2").textContent = name;
      });
    } catch (err) {
      qs("section #addname p").textContent =
        "There was an error when trying to submit the name.";
      qs("section #addname form").classList.add("invis");
      qs("section #addname p").classList.add("error");
    }
  }

  /**
   * This function allows the user to submit a unique background to the API.
   */
  async function submitBackground() {
    try {
      let data = new FormData(qs("section #addbg form"));
      let message = await fetch("/backgrounds/add", {method: "POST", body: data});
      if (message.status !== USERERROR) {
        statusCheck(message);
      }
      qs("section #addbg p").textContent = await message.text();
    } catch (err) {
      qs("section #addbg p").textContent = "Adding backgrounds is currently not working";
      qs("section #addbg form").classList.add("invis");
      qs("section #addbg p").classList.add("error");
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
})();