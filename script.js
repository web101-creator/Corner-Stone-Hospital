(function () {
  // OPTIONAL: add the hospital's WhatsApp number with country code, no + or spaces.
  // Example: "2348012345678". Leave empty to hide the WhatsApp button.
  var WHATSAPP = "";

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile menu
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 900px)").addEventListener("change", function () { setMenu(false); });

  // Booking form
  var form = document.getElementById("bookForm");
  var panel = document.getElementById("book");
  var confirmBox = document.getElementById("confirm");
  var confirmText = document.getElementById("confirmText");
  var waLink = document.getElementById("waLink");
  var dateInput = document.getElementById("date");
  var deptSelect = document.getElementById("dept");
  var reasonInput = document.getElementById("reason");

  function todayStr() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  dateInput.min = todayStr();

  function setInvalid(name, bad) {
    var f = form.querySelector('[data-field="' + name + '"]');
    if (f) f.classList.toggle("invalid", bad);
    return bad;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form).entries());
    var digits = (data.phone || "").replace(/\D/g, "");

    var bad = [
      setInvalid("name", (data.fullName || "").trim().length < 2),
      setInvalid("phone", digits.length < 7),
      setInvalid("dept", !data.dept),
      setInvalid("date", !data.date || data.date < todayStr())
    ];
    if (bad.some(Boolean)) {
      var first = form.querySelector(".invalid input, .invalid select");
      if (first) first.focus();
      return;
    }

    var niceDate = new Date(data.date + "T00:00").toLocaleDateString(undefined, {
      weekday: "long", day: "numeric", month: "long"
    });
    var firstName = data.fullName.trim().split(/\s+/)[0];

    confirmText.textContent = "Thank you, " + firstName + ". We will call " + data.phone +
      " to confirm your " + data.dept.toLowerCase() + " appointment for " + niceDate +
      " (" + data.time.toLowerCase() + ").";

    if (WHATSAPP) {
      var msg = "Hello Corner Stone Hospital, I would like an appointment.\n" +
        "Name: " + data.fullName + "\nPhone: " + data.phone + "\nService: " + data.dept +
        "\nDate: " + niceDate + " (" + data.time + ")" +
        (data.reason ? "\nReason: " + data.reason : "");
      waLink.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
      waLink.hidden = false;
    }

    panel.classList.add("done");
    confirmBox.classList.add("show");
    confirmBox.focus();
  });

  form.addEventListener("input", function (e) {
    var f = e.target.closest(".field");
    if (f) f.classList.remove("invalid");
  });

  document.getElementById("newRequest").addEventListener("click", function () {
    form.reset();
    panel.classList.remove("done");
    confirmBox.classList.remove("show");
    document.getElementById("fullName").focus();
  });

  // "Request a visit" links pre-fill the service in the form
  document.querySelectorAll("[data-pick]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (panel.classList.contains("done")) document.getElementById("newRequest").click();
      deptSelect.value = el.getAttribute("data-pick");
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { document.getElementById("fullName").focus({ preventScroll: true }); }, 400);
    });
  });
})();
