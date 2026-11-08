/* ==========================================================================
   contact.js — accessible, client-side contact form validation
   ========================================================================== */
(function () {
  "use strict";

  var form = document.querySelector("#contact-form");
  if (!form) {
    return;
  }

  var successPanel = document.querySelector("#contact-success");
  var successName = document.querySelector("#success-name");
  var successRef = document.querySelector("#success-ref");
  var messageInput = form.elements.message;
  var charCount = document.querySelector("#message-count");
  var submitButton = form.querySelector('button[type="submit"]');

  var fields = ["name", "email", "phone", "message"];

  function fieldWrap(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function errorNode(name) {
    return document.querySelector("#" + name + "-error");
  }

  function setFieldState(name, message) {
    var wrap = fieldWrap(name);
    var input = form.elements[name];
    var error = errorNode(name);

    if (!wrap || !input || !error) {
      return;
    }

    wrap.classList.toggle("has-error", Boolean(message));
    wrap.classList.toggle("is-valid", !message && input.value.trim() !== "");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
  }

  var validators = {
    name: function (value) {
      var trimmed = value.trim();
      if (!trimmed) {
        return "Please enter your name.";
      }
      if (trimmed.length < 2) {
        return "Your name should be at least 2 characters.";
      }
      return "";
    },

    email: function (value) {
      var trimmed = value.trim();
      if (!trimmed) {
        return "Please enter your email address.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        return "Enter a valid email, for example name@example.com.";
      }
      return "";
    },

    phone: function (value) {
      var trimmed = value.trim();
      if (!trimmed) {
        return "Please enter your phone number.";
      }
      if (!/^\d+$/.test(trimmed)) {
        return "Phone number must contain digits only — no spaces, + or dashes.";
      }
      if (trimmed.length < 7 || trimmed.length > 15) {
        return "Phone number must be between 7 and 15 digits.";
      }
      return "";
    },

    message: function (value) {
      var trimmed = value.trim();
      if (!trimmed) {
        return "Please write a short message.";
      }
      if (trimmed.length < 10) {
        return "Your message should be at least 10 characters.";
      }
      return "";
    }
  };

  function validateField(name) {
    var input = form.elements[name];
    if (!input || !validators[name]) {
      return true;
    }
    var message = validators[name](input.value);
    setFieldState(name, message);
    return !message;
  }

  function updateCharCount() {
    if (!messageInput || !charCount) {
      return;
    }
    charCount.textContent = messageInput.value.length + " / 600";
  }

  /* ---------- Live validation ---------- */
  fields.forEach(function (name) {
    var input = form.elements[name];
    if (!input) {
      return;
    }

    input.addEventListener("blur", function () {
      validateField(name);
    });

    input.addEventListener("input", function () {
      var wrap = fieldWrap(name);
      if (
        form.getAttribute("data-submitted") === "true" ||
        (wrap && wrap.classList.contains("has-error"))
      ) {
        validateField(name);
      }
    });
  });

  if (messageInput) {
    messageInput.addEventListener("input", updateCharCount);
    updateCharCount();
  }

  /* Phone hint: quietly reject pasted non-digits after the field is blurred. */
  var phoneInput = form.elements.phone;
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      if (phoneInput.value && !/^\d*$/.test(phoneInput.value)) {
        setFieldState(
          "phone",
          "Phone number must contain digits only — no spaces, + or dashes."
        );
      }
    });
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.setAttribute("data-submitted", "true");

    var isValid = true;
    var firstInvalid = null;

    fields.forEach(function (name) {
      var fieldValid = validateField(name);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalid) {
          firstInvalid = form.elements[name];
        }
      }
    });

    if (!isValid) {
      if (successPanel) {
        successPanel.classList.remove("is-visible");
      }
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    var name = form.elements.name.value.trim();
    var reference = "ME-" + String(Date.now()).slice(-6);

    if (successName) {
      successName.textContent = name;
    }
    if (successRef) {
      successRef.textContent = reference;
    }
    if (successPanel) {
      successPanel.classList.add("is-visible");
      successPanel.focus({ preventScroll: true });
      successPanel.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest"
      });
    }

    form.reset();
    form.removeAttribute("data-submitted");
    updateCharCount();

    fields.forEach(function (fieldName) {
      setFieldState(fieldName, "");
    });

    if (submitButton) {
      var originalMarkup = submitButton.innerHTML;
      submitButton.textContent = "Message validated ✓";
      submitButton.disabled = true;
      window.setTimeout(function () {
        submitButton.innerHTML = originalMarkup;
        submitButton.disabled = false;
      }, 2600);
    }
  });
})();
