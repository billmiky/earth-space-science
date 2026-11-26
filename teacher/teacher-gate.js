/*
 * Teacher area password gate.
 *
 * Loaded synchronously in the <head> of every page under teacher/. It hides the
 * page until the teacher password is entered, then remembers it in this browser
 * (localStorage if "Remember" is ticked, otherwise only for this tab).
 *
 * This is a client-side gate on a static site: it keeps students from casually
 * opening teacher pages, but it is NOT real security. Anyone who reads the page
 * source or requests files (data.js, images) by URL directly can get around it.
 *
 * To change the password, replace HASH with the output of:
 *   printf 'ess-teacher-hub:%s' 'NEW-PASSWORD' | sha256sum
 * and bump VERSION so browsers that remembered the old password are asked again.
 */
(function () {
  "use strict";
  var HASH = "2615ff81363abc6c7b61f88067c4eae311ae05cf5156bb1b4a0f47fb6276ad56";
  var SALT = "ess-teacher-hub:";
  var VERSION = "2";
  var KEY = "essTeacherGate";
  var token = VERSION + ":" + HASH;

  function read(store) {
    try { return window[store].getItem(KEY); } catch (e) { return null; }
  }
  function write(store, value) {
    try { window[store].setItem(KEY, value); } catch (e) { /* storage blocked */ }
  }

  // Sign-out helper any page can call: window.essTeacherSignOut()
  window.essTeacherSignOut = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  if (read("localStorage") === token || read("sessionStorage") === token) return;

  // Hide everything until unlocked. Inserted synchronously, so no flash of content.
  var hide = document.createElement("style");
  hide.id = "tg-hide";
  hide.textContent = "body > *:not(#tg-overlay){display:none !important}";
  document.head.appendChild(hide);

  function toHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }

  function unlock(remember) {
    write(remember ? "localStorage" : "sessionStorage", token);
    var o = document.getElementById("tg-overlay");
    if (o) o.remove();
    hide.remove();
    // Let pages that measure layout on load (dashboards, charts) re-measure.
    window.dispatchEvent(new Event("resize"));
  }

  function build() {
    var o = document.createElement("div");
    o.id = "tg-overlay";
    o.innerHTML =
      '<style>' +
      '#tg-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
      'padding:16px;background:#0f172a;font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0f172a}' +
      '#tg-overlay form{background:#fff;border-radius:14px;padding:24px;width:100%;max-width:380px;box-shadow:0 10px 40px rgba(0,0,0,.35)}' +
      '#tg-overlay h1{font-size:1.3rem;margin:0 0 6px}' +
      '#tg-overlay p{margin:0 0 16px;color:#475569;font-size:.95rem}' +
      '#tg-overlay input[type=password]{box-sizing:border-box;width:100%;min-height:44px;padding:10px 12px;font-size:1rem;' +
      'border:1px solid #cbd5e1;border-radius:8px;color:#0f172a;background:#fff}' +
      '#tg-overlay label.tg-rem{display:flex;align-items:center;gap:8px;margin:12px 0;min-height:44px;color:#334155;font-size:.95rem}' +
      '#tg-overlay label.tg-rem input{width:20px;height:20px}' +
      '#tg-overlay button{width:100%;min-height:44px;border:0;border-radius:8px;background:#2563eb;color:#fff;font-size:1rem;font-weight:600;cursor:pointer}' +
      '#tg-overlay button:focus-visible,#tg-overlay input:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}' +
      '#tg-overlay .tg-err{color:#b91c1c;min-height:1.4em;margin:8px 0 0;font-size:.9rem}' +
      '#tg-overlay a{color:#2563eb}' +
      '</style>' +
      '<form autocomplete="on" novalidate>' +
      '<h1>🔒 Teacher area</h1>' +
      '<p>This part of the site is for teachers. Enter the teacher password to continue.<br>' +
      'Looking for the textbook? <a href="/">Go to the student site</a>.</p>' +
      '<label for="tg-pw" class="tg-sr" style="position:absolute;left:-9999px">Password</label>' +
      '<input id="tg-pw" type="password" name="password" autocomplete="current-password" placeholder="Password" required>' +
      '<label class="tg-rem"><input id="tg-remember" type="checkbox" checked> Remember on this device</label>' +
      '<button type="submit">Unlock</button>' +
      '<p class="tg-err" role="alert" aria-live="assertive"></p>' +
      '</form>';
    document.body.appendChild(o);
    // Keep typing in the password box from triggering page keyboard shortcuts.
    o.addEventListener("keydown", function (e) { e.stopPropagation(); });

    // Point "student site" link at the book root (one level above /teacher/).
    var link = o.querySelector("a");
    var idx = location.pathname.indexOf("/teacher/");
    if (idx >= 0) link.href = location.pathname.slice(0, idx + 1);

    var form = o.querySelector("form");
    var pw = o.querySelector("#tg-pw");
    var err = o.querySelector(".tg-err");
    pw.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!(window.crypto && crypto.subtle && window.TextEncoder)) {
        err.textContent = "This browser can't check the password here. Open the page over https in an up-to-date browser.";
        return;
      }
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + pw.value)).then(function (buf) {
        if (toHex(buf) === HASH) {
          unlock(o.querySelector("#tg-remember").checked);
        } else {
          err.textContent = "That password isn't right. Try again.";
          pw.select();
        }
      });
    });
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
