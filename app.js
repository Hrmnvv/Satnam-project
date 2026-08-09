/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   MAIN APPLICATION JAVASCRIPT
   File: js/app.js
========================================================= */


/* =========================================================
   1. APPLICATION INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});


function initializeApp() {

    setupNavigation();
    setupMobileSidebar();
    setupDropdowns();
    setupModals();
    setupGlobalButtons();
    setupNotifications();
    setupCurrentPage();
    setupTooltips();
    setupKeyboardShortcuts();

    console.log("Inventory Management System initialized successfully.");
}


/* =========================================================
   2. NAVIGATION
========================================================= */

function setupNavigation() {

    const navigationLinks = document.querySelectorAll(
        ".sidebar-link[data-page]"
    );

    navigationLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const page = this.dataset.page;

            if (!page) {
                return;
            }

            event.preventDefault();

            navigateTo(page);

        });

    });

}


/**
 * Navigate to another page.
 *
 * Example:
 * navigateTo("products");
 * navigateTo("dashboard");
 */

function navigateTo(page) {

    const pageMap = {
        dashboard: "dashboard.html",
        products: "products.html",
        "add-product": "add-product.html",
        sales: "sales.html",
        purchases: "purchases.html",
        suppliers: "suppliers.html",
        customers: "customers.html",
        categories: "categories.html",
        reports: "reports.html",
        settings: "settings.html"
    };

    if (!pageMap[page]) {
        console.warn("Unknown page:", page);
        return;
    }

    const currentPath = window.location.pathname;

    let destination;

    if (currentPath.includes("/pages/")) {
        destination = pageMap[page];
    } else {
        destination = `pages/${pageMap[page]}`;
    }

    window.location.href = destination;
}


/* =========================================================
   3. ACTIVE SIDEBAR LINK
========================================================= */

function setupCurrentPage() {

    const currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const links = document.querySelectorAll(
        ".sidebar-link[data-page]"
    );

    links.forEach(link => {

        const page = link.dataset.page;

        const pageMap = {
            dashboard: "dashboard.html",
            products: "products.html",
            "add-product": "add-product.html",
            sales: "sales.html",
            purchases: "purchases.html",
            suppliers: "suppliers.html",
            customers: "customers.html",
            categories: "categories.html",
            reports: "reports.html",
            settings: "settings.html"
        };

        if (pageMap[page] === currentFile) {
            link.classList.add("active");
        }

    });

}


/* =========================================================
   4. MOBILE SIDEBAR
========================================================= */

function setupMobileSidebar() {

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    const menuButtons = document.querySelectorAll(
        ".menu-toggle, #menuToggle"
    );

    if (!sidebar) {
        return;
    }

    menuButtons.forEach(button => {

        button.addEventListener("click", () => {

            sidebar.classList.toggle("mobile-open");

            if (overlay) {
                overlay.classList.toggle("active");
            }

        });

    });


    if (overlay) {

        overlay.addEventListener("click", closeMobileSidebar);

    }


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMobileSidebar();
        }

    });

}


function closeMobileSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

}


/* =========================================================
   5. DROPDOWNS
========================================================= */

function setupDropdowns() {

    const dropdownButtons =
        document.querySelectorAll("[data-dropdown]");

    dropdownButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            const dropdownId =
                button.dataset.dropdown;

            const dropdown =
                document.getElementById(dropdownId);

            if (!dropdown) {
                return;
            }

            closeAllDropdowns(dropdown);

            dropdown.classList.toggle("show");

        });

    });


    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

}


function closeAllDropdowns(except = null) {

    const dropdowns =
        document.querySelectorAll(".dropdown-menu");

    dropdowns.forEach(dropdown => {

        if (dropdown !== except) {
            dropdown.classList.remove("show");
        }

    });

}


/* =========================================================
   6. MODAL SYSTEM
========================================================= */

function setupModals() {

    document.addEventListener("click", event => {

        const openButton =
            event.target.closest("[data-modal]");

        if (openButton) {

            const modalId =
                openButton.dataset.modal;

            openModal(modalId);

        }


        const closeButton =
            event.target.closest("[data-modal-close]");

        if (closeButton) {

            const modal =
                closeButton.closest(".modal-overlay");

            if (modal) {
                closeModal(modal);
            }

        }

    });


    document.addEventListener("click", event => {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            closeModal(event.target);

        }

    });

}


function openModal(modalId) {

    const modal =
        document.getElementById(modalId);

    if (!modal) {
        console.warn("Modal not found:", modalId);
        return;
    }

    modal.classList.add("show");

    document.body.classList.add("modal-open");

}


function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    if (
        !document.querySelector(
            ".modal-overlay.show"
        )
    ) {
        document.body.classList.remove("modal-open");
    }

}


function closeAllModals() {

    document
        .querySelectorAll(".modal-overlay.show")
        .forEach(modal => {

            modal.classList.remove("show");

        });

    document.body.classList.remove("modal-open");

}


/* =========================================================
   7. GLOBAL BUTTONS
========================================================= */

function setupGlobalButtons() {

    document.addEventListener("click", event => {

        const logoutButton =
            event.target.closest(
                "[data-action='logout'], #logoutBtn"
            );

        if (logoutButton) {

            event.preventDefault();

            handleLogout();

        }


        const backButton =
            event.target.closest(
                "[data-action='back']"
            );

        if (backButton) {

            event.preventDefault();

            window.history.back();

        }


        const printButton =
            event.target.closest(
                "[data-action='print']"
            );

        if (printButton) {

            event.preventDefault();

            window.print();

        }

    });

}


/* =========================================================
   8. LOGOUT
========================================================= */

function handleLogout() {

    const confirmLogout =
        window.confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmLogout) {
        return;
    }


    /*
       auth.js will also handle authentication
       when it is included in the project.
    */

    localStorage.removeItem("ims_current_user");
    localStorage.removeItem("ims_session");


    window.location.href =
        "../index.html";

}


/* =========================================================
   9. NOTIFICATION SYSTEM
========================================================= */

function setupNotifications() {

    const notificationButtons =
        document.querySelectorAll(
            "[data-notifications], #notificationBtn"
        );

    notificationButtons.forEach(button => {

        button.addEventListener("click", () => {

            showNotificationPanel();

        });

    });

}


function showNotificationPanel() {

    const existing =
        document.getElementById(
            "notificationPanel"
        );

    if (existing) {

        existing.classList.toggle("show");

        return;

    }


    const panel =
        document.createElement("div");

    panel.id =
        "notificationPanel";

    panel.className =
        "notification-panel";


    panel.innerHTML = `
        <div class="notification-panel-header">
            <strong>Notifications</strong>

            <button
                type="button"
                class="notification-close"
                onclick="closeNotificationPanel()">
                &times;
            </button>
        </div>

        <div class="notification-panel-body">

            <div class="notification-item">
                <div class="notification-icon warning">
                    <i class="fas fa-box"></i>
                </div>

                <div>
                    <strong>Low Stock Alert</strong>
                    <p>Some products are running low.</p>
                </div>
            </div>

            <div class="notification-item">
                <div class="notification-icon success">
                    <i class="fas fa-check"></i>
                </div>

                <div>
                    <strong>System Ready</strong>
                    <p>Inventory system is running normally.</p>
                </div>
            </div>

        </div>
    `;


    document.body.appendChild(panel);


    requestAnimationFrame(() => {

        panel.classList.add("show");

    });

}


function closeNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    if (!panel) {
        return;
    }

    panel.classList.remove("show");

    setTimeout(() => {

        panel.remove();

    }, 200);

}


/* =========================================================
   10. TOAST NOTIFICATIONS
========================================================= */

function showToast(
    message,
    type = "success",
    duration = 3000
) {

    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(container);

    }


    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;


    let icon =
        "fa-check-circle";

    if (type === "error") {
        icon = "fa-times-circle";
    }

    if (type === "warning") {
        icon = "fa-exclamation-triangle";
    }

    if (type === "info") {
        icon = "fa-info-circle";
    }


    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${escapeHTML(message)}</span>

        <button
            type="button"
            class="toast-close"
            aria-label="Close">
            &times;
        </button>
    `;


    container.appendChild(toast);


    requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    const close =
        toast.querySelector(
            ".toast-close"
        );

    close.addEventListener(
        "click",
        () => removeToast(toast)
    );


    const timeout =
        setTimeout(
            () => removeToast(toast),
            duration
        );


    toast.dataset.timeout =
        timeout;

}


function removeToast(toast) {

    if (!toast) {
        return;
    }


    if (toast.dataset.timeout) {

        clearTimeout(
            Number(toast.dataset.timeout)
        );

    }


    toast.classList.remove("show");


    setTimeout(() => {

        toast.remove();

    }, 250);

}


/* =========================================================
   11. CONFIRMATION DIALOG
========================================================= */

function confirmAction(
    message,
    callback
) {

    const confirmed =
        window.confirm(message);

    if (confirmed && typeof callback === "function") {

        callback();

    }

}


/* =========================================================
   12. FORM SUBMIT PREVENTION
========================================================= */

document.addEventListener(
    "submit",
    event => {

        const form =
            event.target;

        if (
            form.dataset.noDefault === "true"
        ) {
            return;
        }


        /*
           Individual modules such as products.js,
           sales.js and purchases.js can override
           this behavior.
        */

    }
);


/* =========================================================
   13. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   14. CURRENCY FORMATTER
========================================================= */

function formatCurrency(
    amount,
    currency = "₹"
) {

    const number =
        Number(amount) || 0;

    return (
        currency +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


/* =========================================================
   15. NUMBER FORMATTER
========================================================= */

function formatNumber(number) {

    return (
        Number(number) || 0
    ).toLocaleString("en-IN");

}


/* =========================================================
   16. DATE FORMATTER
========================================================= */

function formatDate(
    date,
    options = {}
) {

    if (!date) {
        return "-";
    }


    const dateObject =
        new Date(date);


    if (
        Number.isNaN(
            dateObject.getTime()
        )
    ) {
        return "-";
    }


    const defaultOptions = {

        day: "2-digit",
        month: "short",
        year: "numeric"

    };


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            ...defaultOptions,
            ...options
        }
    );

}


/* =========================================================
   17. DEBOUNCE
========================================================= */

function debounce(
    callback,
    delay = 300
) {

    let timeout;


    return function (...args) {

        clearTimeout(timeout);


        timeout =
            setTimeout(
                () => callback.apply(this, args),
                delay
            );

    };

}


/* =========================================================
   18. THROTTLE
========================================================= */

function throttle(
    callback,
    delay = 300
) {

    let lastCall = 0;


    return function (...args) {

        const now =
            Date.now();


        if (
            now - lastCall >= delay
        ) {

            lastCall = now;

            callback.apply(
                this,
                args
            );

        }

    };

}


/* =========================================================
   19. ELEMENT HELPERS
========================================================= */

function getElement(selector) {

    return document.querySelector(
        selector
    );

}


function getElements(selector) {

    return document.querySelectorAll(
        selector
    );

}


function showElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "";

}


function hideElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "none";

}


function toggleElement(element) {

    if (!element) {
        return;
    }


    if (
        element.style.display === "none"
    ) {

        showElement(element);

    } else {

        hideElement(element);

    }

}


/* =========================================================
   20. EMPTY STATE
========================================================= */

function createEmptyState(
    message = "No data available",
    icon = "fa-inbox"
) {

    return `
        <div class="table-empty">

            <div class="table-empty-icon">
                <i class="fas ${icon}"></i>
            </div>

            <h3>${escapeHTML(message)}</h3>

            <p>
                There is currently no information
                to display here.
            </p>

        </div>
    `;

}


/* =========================================================
   21. LOADING STATE
========================================================= */

function createLoadingState(
    message = "Loading..."
) {

    return `
        <div class="table-loading">

            <div class="table-spinner"></div>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>
    `;

}


/* =========================================================
   22. URL QUERY PARAMETERS
========================================================= */

function getQueryParam(
    parameter
) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        parameter
    );

}


/* =========================================================
   23. SET QUERY PARAMETER
========================================================= */

function updateQueryParameter(
    key,
    value
) {

    const url =
        new URL(
            window.location.href
        );


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        url.searchParams.delete(
            key
        );

    } else {

        url.searchParams.set(
            key,
            value
        );

    }


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* =========================================================
   24. SCROLL TO TOP
========================================================= */

function scrollToTop(
    smooth = true
) {

    window.scrollTo({

        top: 0,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* =========================================================
   25. TOOLTIPS
========================================================= */

function setupTooltips() {

    const elements =
        document.querySelectorAll(
            "[data-tooltip]"
        );


    elements.forEach(element => {

        element.addEventListener(
            "mouseenter",
            () => {

                const text =
                    element.dataset.tooltip;

                if (!text) {
                    return;
                }

                element.setAttribute(
                    "title",
                    text
                );

            }
        );

    });

}


/* =========================================================
   26. KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            /*
               Ctrl + K
               Focus global search
            */

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                const search =
                    document.querySelector(
                        "#globalSearch, .search-box input, .table-search input"
                    );

                if (search) {
                    search.focus();
                }

            }


            /*
               Escape
               Close modal/sidebar
            */

            if (
                event.key === "Escape"
            ) {

                closeAllModals();
                closeMobileSidebar();
                closeAllDropdowns();

            }

        }
    );

}


/* =========================================================
   27. LOCAL STORAGE HELPERS
========================================================= */

function saveToLocalStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "LocalStorage save error:",
            error
        );

        return false;

    }

}


function getFromLocalStorage(
    key,
    defaultValue = null
) {

    try {

        const value =
            localStorage.getItem(key);


        if (value === null) {
            return defaultValue;
        }


        return JSON.parse(value);

    } catch (error) {

        console.error(
            "LocalStorage read error:",
            error
        );

        return defaultValue;

    }

}


function removeFromLocalStorage(
    key
) {

    try {

        localStorage.removeItem(
            key
        );

        return true;

    } catch (error) {

        console.error(
            "LocalStorage remove error:",
            error
        );

        return false;

    }

}


/* =========================================================
   28. APPLICATION EVENTS
========================================================= */

function emitAppEvent(
    eventName,
    data = {}
) {

    const event =
        new CustomEvent(
            eventName,
            {
                detail: data
            }
        );


    document.dispatchEvent(
        event
    );

}


/* =========================================================
   29. WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    debounce(() => {

        /*
           Close mobile sidebar when
           screen becomes desktop sized.
        */

        if (
            window.innerWidth > 768
        ) {

            closeMobileSidebar();

        }

    }, 200)
);


/* =========================================================
   30. GLOBAL APPLICATION OBJECT
========================================================= */

window.InventoryApp = {

    navigateTo,

    openModal,

    closeModal,

    closeAllModals,

    showToast,

    removeToast,

    confirmAction,

    formatCurrency,

    formatNumber,

    formatDate,

    escapeHTML,

    debounce,

    throttle,

    getElement,

    getElements,

    showElement,

    hideElement,

    toggleElement,

    createEmptyState,

    createLoadingState,

    getQueryParam,

    updateQueryParameter,

    scrollToTop,

    saveToLocalStorage,

    getFromLocalStorage,

    removeFromLocalStorage,

    emitAppEvent

};


/* =========================================================
   END OF APP.JS
========================================================= */