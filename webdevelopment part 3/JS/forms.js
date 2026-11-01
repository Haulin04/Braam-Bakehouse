/* Braam Bakehouse - enquiry and contact forms.
   1. Client-side validation with an error message under each field.
   2. Enquiry form: works out an estimated cost and availability.
   3. Contact form: compiles the message into an email for the bakery.
   4. AJAX: both forms can be sent in the background with fetch()
      to FormSubmit (https://formsubmit.co), so the page never reloads. */

// The email address that receives both forms. Change it to your own address,
// then submit the form once and click the activation link FormSubmit emails you.
var RECIPIENT_EMAIL = BAKERY.email;
var AJAX_URL = "https://formsubmit.co/ajax/" + RECIPIENT_EMAIL;

// Minimum days' notice for some enquiry types.
// EXAMPLE RULE ONLY - change these numbers to the bakery's real notice period.
var NOTICE_DAYS = { custom: 3, bulk: 2 };
var ENQUIRY_LABELS = {
    custom: "Custom cakes", cupcakes: "Cupcakes", pastries: "Pastries",
    bread: "Bread", bulk: "Bulk orders", other: "Other"
};
var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function twoDigits(n) { return (n < 10 ? "0" : "") + n; }
function value(id) { return document.getElementById(id).value.trim(); }

function addDays(dateText, days) {
    var p = dateText.split("-");
    var d = new Date(p[0], p[1] - 1, Number(p[2]) + days);
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
}

function niceDate(dateText) {
    var p = dateText.split("-");
    var d = new Date(p[0], p[1] - 1, p[2]);
    return DAY_NAMES[d.getDay()] + " " + d.getDate() + " " +
        d.toLocaleString("en-ZA", { month: "long" }) + " " + d.getFullYear();
}

// live "x / 500 characters" counter under text areas
document.querySelectorAll("textarea[maxlength]").forEach(function (area) {
    var counter = document.createElement("p");
    counter.className = "char-count";
    counter.setAttribute("aria-live", "polite");
    area.insertAdjacentElement("afterend", counter);
    function update() { counter.textContent = area.value.length + " / " + area.maxLength + " characters"; }
    area.addEventListener("input", update);
    update();
});

// remove a field's error as soon as the visitor starts fixing it
document.addEventListener("input", function (e) {
    if (e.target.getAttribute && e.target.getAttribute("aria-invalid")) {
        e.target.removeAttribute("aria-invalid");
        var msg = document.getElementById(e.target.id + "-error");
        if (msg) msg.remove();
    }
});

// sends form data in the background (AJAX) and reports back through onDone(ok)
function sendAjax(data, onDone) {
    fetch(AJAX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
    })
        .then(function (res) { return res.json().then(function (body) { return res.ok && String(body.success) === "true"; }); })
        .then(onDone)
        .catch(function () { onDone(false); });
}

/* =================== ENQUIRY FORM =================== */
var enquiryForm = document.getElementById("enquiry-form");
if (enquiryForm) {
    var typeSelect = document.getElementById("en-type");
    var productSelect = document.getElementById("en-product");
    var productGroup = document.getElementById("product-group");
    var dateField = document.getElementById("en-date");
    var result = document.getElementById("enquiry-result");
    dateField.min = todayText();

    // fill the product list to match the chosen enquiry type (DOM manipulation)
    typeSelect.addEventListener("change", function () {
        var type = typeSelect.value;
        var category = type === "custom" ? "cakes" : type;
        var list = PRODUCTS.filter(function (p) { return type === "bulk" || p.category === category; });
        productGroup.hidden = type === "other" || list.length === 0;
        productSelect.innerHTML = '<option value="">Select a product</option>';
        list.forEach(function (p) {
            var opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name + " (" + money(p.price) + (p.unit ? " " + p.unit : "") + ")";
            productSelect.appendChild(opt);
        });
        var hint = document.getElementById("notice-hint");
        hint.textContent = NOTICE_DAYS[type]
            ? ENQUIRY_LABELS[type] + " need at least " + NOTICE_DAYS[type] + " days' notice."
            : "";
    });

    enquiryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        // honeypot: real people never fill in this hidden field, spam bots do
        if (document.getElementById("en-honey").value) return;

        var type = typeSelect.value;
        var qty = Number(value("en-qty"));
        var errors = {};
        if (value("en-name").length < 2 || value("en-name").length > 60) errors["en-name"] = "Please enter your full name (2 to 60 characters).";
        if (!isEmail(value("en-email"))) errors["en-email"] = "Please enter a valid email address, e.g. name@example.com.";
        if (!isSaPhone(value("en-phone"))) errors["en-phone"] = "Please enter a 10-digit South African number, e.g. 061 234 5678.";
        if (!ENQUIRY_LABELS[type]) errors["en-type"] = "Please select an enquiry type.";
        if (type && type !== "other" && !productSelect.value) errors["en-product"] = "Please choose the product you are asking about.";
        if (!Number.isInteger(qty) || qty < 1 || qty > 200) errors["en-qty"] = "Please enter a quantity from 1 to 200.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateField.value)) errors["en-date"] = "Please choose the date you need your order.";
        else if (dateField.value < todayText()) errors["en-date"] = "Please choose today or a future date.";
        if (value("en-notes").length < 10) errors["en-notes"] = "Please tell us a bit more (at least 10 characters).";

        if (!showFieldErrors(enquiryForm, errors)) {
            result.hidden = true;
            return;
        }

        var product = findProduct(productSelect.value);
        var day = new Date(dateField.value + "T12:00:00").getDay();
        var hours = BAKERY.hours[day];
        var earliest = addDays(todayText(), NOTICE_DAYS[type] || 0);
        var available = dateField.value >= earliest;
        var cost = product ? product.price * qty : null;

        var html = "<h2>Your enquiry summary</h2><dl class=\"summary-list\">" +
            "<dt>Enquiry</dt><dd>" + ENQUIRY_LABELS[type] + (product ? " - " + esc(qty + " x " + product.name) : "") + "</dd>" +
            "<dt>Estimated cost</dt><dd>" + (product
                ? "<b>" + money(cost) + "</b> (" + qty + " x " + money(product.price) + ")"
                : "We will send you a quote") + "</dd>" +
            "<dt>Date needed</dt><dd>" + niceDate(dateField.value) + "</dd>" +
            "<dt>Availability</dt><dd>" + (available
                ? '<span class="badge ok">Available</span> Collect between ' + twoDigits(hours[0]) + ":00 and " + twoDigits(hours[1]) + ":00 on that day."
                : '<span class="badge warn">Not available</span> ' + ENQUIRY_LABELS[type] + " need at least " +
                  NOTICE_DAYS[type] + " days' notice. The earliest date is <b>" + niceDate(earliest) + "</b>.") +
            "</dd></dl>";

        if (!available) {
            html += '<button type="button" id="use-earliest">Use ' + niceDate(earliest) + "</button>";
            result.innerHTML = html;
            result.hidden = false;
            result.focus();
            document.getElementById("use-earliest").addEventListener("click", function () {
                dateField.value = earliest;
                enquiryForm.requestSubmit();
            });
            return;
        }

        html += '<p class="send-status" aria-live="polite">Sending your enquiry to the bakery...</p>' +
            '<p class="muted">Final prices are confirmed by the bakery. Submitting an enquiry does not automatically confirm an order.</p>';
        result.innerHTML = html;
        result.hidden = false;
        result.focus();

        var submitBtn = enquiryForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        sendAjax({
            _subject: "New enquiry: " + ENQUIRY_LABELS[type] + " from " + value("en-name"),
            _template: "table",
            _captcha: "false",
            name: value("en-name"),
            email: value("en-email"),
            phone: value("en-phone"),
            enquiry_type: ENQUIRY_LABELS[type],
            product: product ? product.name : "-",
            quantity: qty,
            date_needed: dateField.value,
            estimated_cost: product ? money(cost) : "Quote needed",
            notes: value("en-notes")
        }, function (ok) {
            submitBtn.disabled = false;
            var status = result.querySelector(".send-status");
            if (ok) {
                status.className = "send-status ok";
                status.textContent = "Thank you, " + value("en-name").split(" ")[0] + "! Your enquiry was sent. We will reply to " + value("en-email") + " as soon as possible.";
                keepResult = true;
                enquiryForm.reset();
                keepResult = false;
                productGroup.hidden = true;
            } else {
                status.className = "send-status warn";
                status.innerHTML = 'We could not send your enquiry online right now. Please email it to <a href="mailto:' +
                    RECIPIENT_EMAIL + '">' + RECIPIENT_EMAIL + "</a> or call " + BAKERY.phone + ".";
            }
        });
    });

    var keepResult = false;
    enquiryForm.addEventListener("reset", function () {
        showFieldErrors(enquiryForm, {});
        if (!keepResult) result.hidden = true;
        productGroup.hidden = true;
        document.getElementById("notice-hint").textContent = "";
        setTimeout(function () {
            enquiryForm.querySelectorAll(".char-count").forEach(function (c) {
                c.textContent = "0 / " + c.previousElementSibling.maxLength + " characters";
            });
        });
    });
}

/* =================== CONTACT FORM =================== */
var contactForm = document.getElementById("contact-form");
if (contactForm) {
    var preview = document.getElementById("email-preview");

    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (document.getElementById("ct-honey").value) return;

        var errors = {};
        if (value("ct-name").length < 2 || value("ct-name").length > 60) errors["ct-name"] = "Please enter your full name (2 to 60 characters).";
        if (!isEmail(value("ct-email"))) errors["ct-email"] = "Please enter a valid email address, e.g. name@example.com.";
        if (value("ct-phone") && !isSaPhone(value("ct-phone"))) errors["ct-phone"] = "Please enter a 10-digit South African number, or leave this empty.";
        if (!value("ct-type")) errors["ct-type"] = "Please choose the type of message.";
        if (value("ct-subject").length < 3) errors["ct-subject"] = "Please add a short subject (at least 3 characters).";
        if (value("ct-message").length < 20) errors["ct-message"] = "Please write a message of at least 20 characters.";

        if (!showFieldErrors(contactForm, errors)) {
            preview.hidden = true;
            return;
        }

        // compile everything into one email
        var typeLabel = document.getElementById("ct-type").selectedOptions[0].textContent;
        var subject = "[" + typeLabel + "] " + value("ct-subject");
        var body =
            "Hello Braam Bakehouse,\n\n" + value("ct-message") + "\n\n" +
            "Kind regards,\n" + value("ct-name") + "\n" +
            "Email: " + value("ct-email") + "\n" +
            (value("ct-phone") ? "Phone: " + value("ct-phone") + "\n" : "") +
            "Message type: " + typeLabel;
        var mailto = "mailto:" + RECIPIENT_EMAIL + "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);

        preview.innerHTML =
            "<h2>Your email is ready</h2>" +
            '<p class="muted">Check it below, then send it with your email app.</p>' +
            '<div class="email-card"><p><b>To:</b> ' + RECIPIENT_EMAIL + "</p>" +
            "<p><b>Subject:</b> " + esc(subject) + "</p><pre>" + esc(body) + "</pre></div>" +
            '<div class="btn-row"><a class="btn" id="send-email" href="' + esc(mailto) + '">Send email</a>' +
            '<button type="button" id="send-online" class="btn-outline">No email app? Send online</button>' +
            '<button type="button" id="edit-message" class="link-btn">Edit message</button></div>' +
            '<p class="send-status" aria-live="polite"></p>';
        preview.hidden = false;
        contactForm.hidden = true;
        preview.focus();

        document.getElementById("edit-message").addEventListener("click", function () {
            preview.hidden = true;
            contactForm.hidden = false;
            document.getElementById("ct-message").focus();
        });

        document.getElementById("send-online").addEventListener("click", function (ev) {
            var btn = ev.currentTarget;
            var status = preview.querySelector(".send-status");
            btn.disabled = true;
            status.className = "send-status";
            status.textContent = "Sending...";
            sendAjax({
                _subject: subject,
                _captcha: "false",
                _template: "table",
                name: value("ct-name"),
                email: value("ct-email"),
                phone: value("ct-phone") || "-",
                message_type: typeLabel,
                message: value("ct-message")
            }, function (ok) {
                btn.disabled = false;
                if (ok) {
                    status.className = "send-status ok";
                    status.textContent = "Thank you! Your message was sent to Braam Bakehouse.";
                } else {
                    status.className = "send-status warn";
                    status.textContent = "We could not send it online right now. Please use the Send email button or call " + BAKERY.phone + ".";
                }
            });
        });
    });
}
