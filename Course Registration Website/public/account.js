/**
 * Name: Bernie Liu
 * Date: 11/2/2025
 * Section: AC Makiniemi, Rasmus
 * Frontend for the account page.
 * Handles moving courses around and displaying history
 * Also darkmode/lightmode and logging out
 */
"use strict";
(function() {
  const COURSE_API = "/search/";
  window.addEventListener("load", init);

  /**
   * initializes the buttons and uses the local storage to get the user's classes in their cart
   */
  function init() {
    if (window.localStorage.getItem("display-mode") === "dark") {
      qs("body").classList.add("darkmode");
      qs("#toggle-darkmode input").checked = true;
    }
    let classCart = localStorage.getItem("classes");
    if (classCart !== null && classCart !== "[]") {
      classCart = JSON.parse(classCart);
      classCart.forEach(async courseID => {
        id("cart").appendChild(await getCourse(courseID));
      });
      console.log(classCart);
    }
    qs("#toggle-darkmode input").addEventListener("change", toggleDarkMode);
    id("home-btn").addEventListener("click", () => {
      window.location.href = "index.html";
    });
    qs("#logout img").addEventListener("click", logout);
    id("logout").addEventListener("click", logout);
    id("remove").addEventListener("click", removeFromCart);
    id("drop").addEventListener("click", confromDrop);
    qs("#confirm-drop .yes").addEventListener("click", dropCourses);
    qs("#confirm-drop .no").addEventListener("click", dropNo);
    id("enroll").addEventListener("click", confirmEnroll);
    qs("#confirm-enroll .yes").addEventListener("click", enrollCourses);
    qs("#confirm-enroll .no").addEventListener("click", enrollNo);
    id("username").textContent = localStorage.username;
    loadEnrolled();
    id("history-btn").addEventListener("click", loadHistory);
    qsa("#settings #account div img ").forEach( button => {
      button.addEventListener("click", togglePassword);
    });
    id("change-password").addEventListener("submit",  function(evn) {
      evn.preventDefault();
      changePassword()
      id("change-password").reset();
    });
  }

  /**
   * Gets a course with its id and makes a course card
   * @param {int} courseID - the course's id
   * @returns {element} - course card that can be moved around
   */
  async function getCourse(courseID) {
    try {
      handleError("");
      let course = await fetch(COURSE_API + courseID);
      await statusCheck(course);
      course = await course.json();
      return createCourse(course);
    } catch (err) {
      handleError(err);
    }
  }

  async function changePassword() {
    let oldPassword = id("old-password").value.trim();
    let newPassword = id("new-password").value.trim();
    let confirmPassword = id("confirm-password").value.trim();
    if (newPassword === confirmPassword) {
      try {
        let passwordData = new FormData();
        passwordData.append("oldPassword", oldPassword);
        passwordData.append("newPassword", newPassword);
        let passwordChange = await fetch("/account/change-password", {
        method: "POST",
        body : passwordData
      });
      if (passwordData.code != 400) {
        await statusCheck(passwordChange);
        id("changed").textContent = passwordChange;
      } else {
         passwordChange = await passwordChange.text();
         id("err").textContent = passwordChange;
         id("err").classList.remove("hidden");
      }

      } catch {
        id("err").textContent = "Something went wrong with the server. "
          + "Please try again later"
        id("err").classList.remove("hidden");
      }
    } else {
      id("err").classList.remove("hidden");
    }
  }

  /**
   * toggles whether the class is selected or not. If it is, it will have a purple border
   * @param {event} event - the click event
   */
  function selected(event) {
    event.currentTarget.classList.toggle("selected");
  }
  /**
   * Creates a course card that can be selected for future use and have more details shown
   * @param {int} course - the course object to make the card from
   * @returns {DOM element} - a course container with information and buttons
   */
  function createCourse(course) {
    let courseContainer = gen("article");
    courseContainer.classList.add("course");
    courseContainer.addEventListener("click", selected);
    courseContainer.id = course.id;
    let courseName = gen("h3");
    courseName.textContent = course.department + " " + course.code
    courseContainer.append(courseName);
    courseContainer.append(courseDetails(" Course title: ", course.name));
    courseContainer.append(courseDetails("Course ID: ", course.id));
    let professorName = course.professor_first + " " + course.professor_last
    courseContainer.append(courseDetails(" Professor: ", professorName));
     courseContainer.append(courseDetails(" Credits: ", course.credits));
     let seats = course.seats_taken + " out of " + course.max_seats;
     courseContainer.append(courseDetails( " Seats: ", seats));
     let time = '';
     course.days.forEach(day =>{
      time += day
     });
    time += ' ' + convertTime(course.time_start) + " - " + convertTime(course.time_end);
    courseContainer.append(courseDetails(" Time: ", time));
    let detailBtn = gen("button");
    detailBtn.classList.add("detailbtn");
    detailBtn.textContent = "View Details";
    courseContainer.append(detailBtn);
    let courseDesc = gen("div");
    courseDesc.classList.add("details", "hidden");
    let details = gen('p');
    details.textContent =  course.description;
    detailBtn.addEventListener("click", (evn) => {
      evn.stopPropagation();
      toggleDetails(detailBtn);
    });
    courseDesc.append(details);
    courseContainer.append(courseDesc);
    return courseContainer;
  }

  /**
   * helper to add details to a course
   * @param {String} name - Left hand side; describes the detail
   * @param {String} detail - description on RHS
   * @returns {element} - element to add to the course card
   */
  function courseDetails(name, detail) {
    let title = gen("span");
    title.textContent = name;
    let info = gen("p");
    info.append(title);
    info.textContent += detail;
    return info
  }

  /**
   * Takes an integer between 0 and 2400 and converts it to HH:MM AM/PM
   * @param {int} time - integer in military time
   * @returns {String} - formatted time
   */
  function convertTime(time) {
    let meridian;
    if (time >= 1300) {
     time -= 1200;
     meridian = "PM"
    } else {
      meridian = "AM"
    }
    let hours = Math.floor(time / 100);
    let minutes = time % 100
    return `${hours}:${minutes.toString().padStart(2, "0")}${meridian}`
  }

  /**
   * switches between light mode and dark mode
   */
  function toggleDarkMode() {
    if (!qs("body").classList.contains("darkmode")) {
    window.localStorage.setItem("display-mode", "dark");
    } else {
    window.localStorage.setItem("display-mode", "light");
    }
    qs("body").classList.toggle("darkmode");
  }

  /**
   * Removes selected courses from the cart
   */
  function removeFromCart() {
    let classes = qsa("#cart .selected");
    let classCart = localStorage.getItem("classes");
    classCart = JSON.parse(classCart);
    classes.forEach(course => {
      classCart.splice(classCart.indexOf(course.id), 1);
      id("cart").removeChild(course);
    });
    localStorage.setItem("classes", JSON.stringify(classCart));
  }

  /**
   * shows or hides additional details like the full class description
   */
  function toggleDetails(button) {
    let details = button.nextElementSibling;
    if (button.textContent === "View Details") {
      button.textContent = "Hide Details";
    } else {
      button.textContent = "View Details";
    }
    details.classList.toggle("hidden");
  }

  /**
   * Logs the user out in clears out the cookies and classes in storage
   * Redirects to the home page
   */
  async function logout() {
    sessionStorage.clear();
    let cookies = document.cookie;
    try {
      handleError("");
      let res = await fetch("/account/logout", {
        method: "POST",
        credentials: "include"
      });
      await statusCheck(res);
      res = await res.text();
      localStorage.removeItem("classes");
    } catch (error) {
      console.log(error)
      handleError(error);
    }
    let studentID = cookies.split("studentID=")[1].split(";")[0];
    document.cookie = `studentID=${studentID}; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `logged_in=false; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    window.location.href = "index.html";
  }

  /**
   * Drops selected courses from the registered courses
   */
  async function dropCourses () {
    id("confirm-drop").classList.add("hidden");
    let allClasses = qsa("#registered .course");
    for (let c of allClasses) {
      c.addEventListener("click", selected);
    }
    let elements = qsa("#registered .selected");
    let classes = []
    for (let e of elements) {
      classes.push(e.id);
    }
    let params = new FormData();
    params.append("drop", JSON.stringify(classes));
    try {
      handleError("");
      let res = await fetch("/account/drop", {
        method: "POST",
        body : params
      });
      await statusCheck(res);
      res = await res.json();
      for (let e of elements) {
        e.remove();
      }
      id("results2").innerHTML = "";
      if (res.dropped.length > 0) {
        let p1 = gen("p");
        p1.textContent = "Confirmation ID: " + res.confirmation_num;
        let p2 = gen("p") ;
        p2.textContent = "Successfully dropped the following courses: " + res.dropped;
        id("results2").appendChild(p1);
        id("results2").appendChild(p2)
      }
      let res2 = await fetch("/account/enrolled", {
        method: "POST"
      });
      await statusCheck(res2);
      res2 = await res2.json();
      if (res2.length === 0) {
        qs("#registered .empty").classList.remove("hidden");
      }
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * toggles between the password being visible or not
   */
  function togglePassword() {
    let passwordInput = this.parentElement.querySelector('input');
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.src = "img/hide-password.png"
    } else {
      passwordInput.type = "password";
      this.src = "img/show-password.png"
    }
  }

  /**
   * displays the confirmation buttons and what courses the user wants to enroll in
   * Disables selecting/deselecting
   */
  function confirmEnroll() {
    id("confirm-enroll").classList.remove("hidden");
    let p = qs("#confirm-enroll p");
    let elements = qsa("#cart .selected");
    let allClasses = qsa("#cart .course");
    for (let c of allClasses) {
      c.removeEventListener("click", selected);
    }
    let classes = [];
    for (let c of elements) {
      classes.push(c.id);
    }
    p.textContent = "Confrim enrolling in the following: "+ classes;
  }

  /**
   * Deselects the selected courses
   * enables selecting/deselecting
   */
  function enrollNo() {
    let elements = qsa("#cart .selected");
    for (let c of elements) {
      c.classList.remove("selected");
    }
    let allClasses = qsa("#cart .course");
    for (let c of allClasses) {
      c.addEventListener("click", selected);
    }
    id("confirm-enroll").classList.add("hidden");
  }

  /**
   * displays the confirmation buttons and what courses the user wants to drop
   * Disables selecting/deselecting
   */
  function confromDrop() {
    id("confirm-drop").classList.remove("hidden");
    let p = qs("#confirm-drop p");
    let elements = qsa("#registered .selected");
    let classes = [];
    let allClasses = qsa("#registered .course");
    for (let c of allClasses) {
      c.removeEventListener("click", selected);
    }
    for (let c of elements) {
      classes.push(c.id);
    }
    p.textContent = "Confrim dropping the following: "+ classes;
  }

  /**
   * Deselects the selected courses
   * enables selecting/deselecting
   */
  function dropNo() {
    let elements = qsa("#registered .selected");
    for (let c of elements) {
      c.classList.remove("selected");
    }
    let allClasses = qsa("#registered .course");
    for (let c of allClasses) {
      c.addEventListener("click", selected);
    }
    id("confirm-drop").classList.add("hidden");
  }

  /**
   * Adds the selected courses to the user's enrolled courses
   * Moves the courses from the cart section to the registered section
   * Gives a confirmation number and details on why certain courses failed to pass
   */
  async function enrollCourses() {
    id("confirm-enroll").classList.add("hidden");
    let allClasses = qsa("#cart .course");
    for (let c of allClasses) {
      c.addEventListener("click", selected);
    }
    let results = id("results");
    results.innerHTML = "";
    let elements = qsa("#cart .selected");
    let params = new FormData();

    let classes = [];
    for (let c of elements) {
      classes.push(c.id);
    }

    params.append("cart", JSON.stringify(classes));
    try {
      handleError("");
      let res = await fetch("/account/enroll", {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      res = await res.json();
      console.log(res);
      let p1 = gen("p");
      if (res.confirmation) {
        p1.textContent = "Confirmation ID: " + res.confirmation;
      }
      else {
        p1.textContent = "Enroll attempt was unsuccessful"
      }
      let p2 = gen("p");
      p2.textContent = "Successfully enrolled in the following courses: " + res.enrolled;
      results.appendChild(p1);
      results.appendChild(p2);
      if (res.notFound.length > 0) {
        let p = gen("p");
        p.textContent = "The following classes were not found: " +
          res.notFound;
        results.append(p);
      }
      if (res.prereqs.length > 0) {
        let p = gen("p");
        p.textContent = "Unable to enroll in the following due to insufficient prerequirements: " +
          res.prereqs;
        results.append(p);
      }
      if (res.full.length > 0) {
        let p = gen("p");
        p.textContent = "Unable to enroll in the following due to insufficient seats: " +
          res.full;
        results.append(p);
      }
      if (res.timeConflicts.length > 0) {
        let p = gen("p");
        p.textContent = "Unable to enroll in the following due to conflicting times: " +
          res.timeConflicts;
        results.append(p);
      }
      if (res.classStanding.length > 0) {
        let p = gen("p");
        p.textContent = "Unable to enroll in the following due to insufficient class standing: " +
          res.classStanding;
        results.append(p);
      }
      if (res.restricted.length > 0) {
        let p = gen("p");
        p.textContent = "Unable to enroll in the following due to department restrictions: " +
          res.restricted;
        results.append(p);
      }
      if (res.duplicates.length > 0) {
        let p = gen("p");
        p.textContent = "The following classes have already been enrolled: " +
          res.duplicates;
        results.append(p);
      }
      for (let c of res.enrolled) {
        console.log(c)
        let e = id(c);
        id("registered").appendChild(e);
        qs("#registered .empty").classList.add("hidden");
        e.classList.remove("selected");
      }
    } catch (err) {
      handleError(err);

    }
  }

  /**
   * Gets the user's registered classes and displays them on the registered section
   */
  async function loadEnrolled() {
    try {
      handleError("");
      let res = await fetch("/account/enrolled", {
        method: "POST"
      });
      await statusCheck(res);
      res = await res.json();
      for (let c of res) {
        id("registered").appendChild(await getCourse(c.offered_id));
        qs("#registered .empty").classList.add("hidden");
      }
    } catch (error){
      handleError(error);
      let allClasses = qsa("#registered .course");
      for (let c of allClasses) {
        c.disabled=true;
      }
      id("enroll").disabled=true;
      id("remove").disabled=true;
      id("drop").disabled=true;
      id("history-btn").disabled=true;
    }
  }

  /**
   * displays the user's transaction history
   */
  async function loadHistory() {
    id("history-view").innerHTML = "";
    try {
      handleError("");
      let res = await fetch("/account/history",{
        method: "POST"
      });
      await statusCheck(res);
      res = await res.json();
      for (let c of res) {
        let p = gen("p");
        let type = "Dropped";
        if (c.type) {
          type = "Added"
        }
        p.textContent = "Confirmation ID: " + c.transaction_id +" Course ID: " +
          c.offered_id + " Date: " + c.date + " Type: " + type;
        id("history-view").appendChild(p);
      }
      id("history-btn").removeEventListener("click", loadHistory);
      id("history-btn").addEventListener("click", hideHistory);
      id("history-btn").textContent = "Hide Enrollment History";
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * hides the user's transaction history
   */
  function hideHistory() {
    id("history-view").textContent = "";
    id("history-btn").addEventListener("click", loadHistory);
    id("history-btn").removeEventListener("click", hideHistory);
    id("history-btn").textContent = "View Enrollment History";
  }

  /**
   * Displays the error at the top
   * @param {String} error - message to display
   */
  function handleError(error) {
    id("error").textContent = error;
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
   * creates and returns a new empty DOM node representing an element of that type
   * @param {string} tagName - tag for the new node
   * @returns {object} - empty DOM node representing tagName
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();