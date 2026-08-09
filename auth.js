/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   AUTHENTICATION JAVASCRIPT
   File: js/auth.js
========================================================= */


/* =========================================================
   1. AUTHENTICATION CONFIGURATION
========================================================= */

const AUTH_CONFIG = {

    /*
       Demo login credentials.

       You can change these later.
       Since this is a frontend-only project,
       credentials are stored locally.
    */

    username: "admin",

    password: "admin123",

    sessionKey: "ims_session",

    userKey: "ims_current_user"

};


/* =========================================================
   2. INITIALIZE AUTHENTICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAuthentication();

    }
);


function initializeAuthentication() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /*
       If we are on the login page,
       don't protect the page.
    */

    if (
        currentPage === "" ||
        currentPage === "index.html"
    ) {

        setupLoginForm();

        redirectIfAlreadyLoggedIn();

        return;

    }


    /*
       Every other page requires login.
    */

    protectPage();

}


/* =========================================================
   3. LOGIN FORM
========================================================= */

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


/* =========================================================
   4. LOGIN PROCESS
========================================================= */

function handleLogin(event) {

    event.preventDefault();


    const usernameInput =
        document.getElementById(
            "username"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const rememberInput =
        document.getElementById(
            "rememberMe"
        );


    if (
        !usernameInput ||
        !passwordInput
    ) {

        console.error(
            "Login form fields were not found."
        );

        return;

    }


    const username =
        usernameInput.value.trim();


    const password =
        passwordInput.value;


    const rememberMe =
        rememberInput
            ? rememberInput.checked
            : false;


    clearLoginErrors();


    /*
       Basic validation
    */

    if (!username) {

        showLoginError(
            "Please enter your username."
        );

        usernameInput.focus();

        return;

    }


    if (!password) {

        showLoginError(
            "Please enter your password."
        );

        passwordInput.focus();

        return;

    }


    /*
       Check credentials
    */

    if (
        username !== AUTH_CONFIG.username ||
        password !== AUTH_CONFIG.password
    ) {

        showLoginError(
            "Invalid username or password."
        );

        passwordInput.value = "";

        passwordInput.focus();

        return;

    }


    /*
       Create user session
    */

    const user = {

        id: 1,

        username: username,

        name: "Administrator",

        role: "Administrator",

        loginTime:
            new Date().toISOString()

    };


    createSession(
        user,
        rememberMe
    );


    /*
       Show success message
    */

    showLoginSuccess(
        "Login successful. Redirecting..."
    );


    /*
       Redirect to dashboard
    */

    setTimeout(() => {

        window.location.href =
            "pages/dashboard.html";

    }, 500);

}


/* =========================================================
   5. CREATE SESSION
========================================================= */

function createSession(
    user,
    rememberMe = false
) {

    const session = {

        user: user,

        authenticated: true,

        createdAt:
            new Date().toISOString(),

        expiresAt:
            rememberMe
                ? null
                : Date.now() +
                  (8 * 60 * 60 * 1000)

    };


    try {

        localStorage.setItem(
            AUTH_CONFIG.sessionKey,
            JSON.stringify(session)
        );


        localStorage.setItem(
            AUTH_CONFIG.userKey,
            JSON.stringify(user)
        );


        /*
           Save a simple flag as well.
           This can be useful to other modules.
        */

        localStorage.setItem(
            "ims_authenticated",
            "true"
        );


    } catch (error) {

        console.error(
            "Unable to create session:",
            error
        );

    }

}


/* =========================================================
   6. GET CURRENT SESSION
========================================================= */

function getSession() {

    try {

        const session =
            localStorage.getItem(
                AUTH_CONFIG.sessionKey
            );


        if (!session) {
            return null;
        }


        return JSON.parse(
            session
        );

    } catch (error) {

        console.error(
            "Unable to read session:",
            error
        );

        return null;

    }

}


/* =========================================================
   7. GET CURRENT USER
========================================================= */

function getCurrentUser() {

    const session =
        getSession();


    if (
        session &&
        session.user
    ) {

        return session.user;

    }


    try {

        const user =
            localStorage.getItem(
                AUTH_CONFIG.userKey
            );


        if (!user) {
            return null;
        }


        return JSON.parse(
            user
        );

    } catch (error) {

        return null;

    }

}


/* =========================================================
   8. CHECK AUTHENTICATION
========================================================= */

function isAuthenticated() {

    const session =
        getSession();


    if (!session) {
        return false;
    }


    if (
        session.authenticated !== true
    ) {

        return false;

    }


    /*
       If expiresAt is null,
       the user selected "Remember Me".
    */

    if (
        session.expiresAt !== null &&
        Date.now() > session.expiresAt
    ) {

        logout(false);

        return false;

    }


    return true;

}


/* =========================================================
   9. PROTECT INTERNAL PAGES
========================================================= */

function protectPage() {

    if (
        !isAuthenticated()
    ) {

        redirectToLogin();

        return;

    }


    /*
       Display logged-in user information.
    */

    populateUserInformation();

}


/* =========================================================
   10. REDIRECT TO LOGIN
========================================================= */

function redirectToLogin() {

    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes("/pages/")
    ) {

        window.location.href =
            "../index.html";

    } else {

        window.location.href =
            "index.html";

    }

}


/* =========================================================
   11. REDIRECT IF ALREADY LOGGED IN
========================================================= */

function redirectIfAlreadyLoggedIn() {

    if (
        isAuthenticated()
    ) {

        /*
           Prevent dashboard from repeatedly
           redirecting when the user opens index.html.
        */

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentPage === "index.html"
        ) {

            window.location.href =
                "pages/dashboard.html";

        }

    }

}


/* =========================================================
   12. LOGOUT
========================================================= */

function logout(
    redirect = true
) {

    try {

        localStorage.removeItem(
            AUTH_CONFIG.sessionKey
        );

        localStorage.removeItem(
            AUTH_CONFIG.userKey
        );

        localStorage.removeItem(
            "ims_authenticated"
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    if (redirect) {

        redirectToLogin();

    }

}


/* =========================================================
   13. LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    let errorElement =
        document.getElementById(
            "loginError"
        );


    /*
       If the login page doesn't already
       contain an error element, create one.
    */

    if (!errorElement) {

        errorElement =
            document.createElement(
                "div"
            );

        errorElement.id =
            "loginError";

        errorElement.className =
            "login-message error";


        const form =
            document.getElementById(
                "loginForm"
            );


        if (form) {

            form.prepend(
                errorElement
            );

        }

    }


    errorElement.textContent =
        message;


    errorElement.style.display =
        "block";


    errorElement.setAttribute(
        "role",
        "alert"
    );

}


/* =========================================================
   14. CLEAR LOGIN ERRORS
========================================================= */

function clearLoginErrors() {

    const errorElement =
        document.getElementById(
            "loginError"
        );


    if (errorElement) {

        errorElement.textContent =
            "";

        errorElement.style.display =
            "none";

    }


    const successElement =
        document.getElementById(
            "loginSuccess"
        );


    if (successElement) {

        successElement.textContent =
            "";

        successElement.style.display =
            "none";

    }

}


/* =========================================================
   15. LOGIN SUCCESS MESSAGE
========================================================= */

function showLoginSuccess(
    message
) {

    let successElement =
        document.getElementById(
            "loginSuccess"
        );


    if (!successElement) {

        successElement =
            document.createElement(
                "div"
            );

        successElement.id =
            "loginSuccess";

        successElement.className =
            "login-message success";


        const form =
            document.getElementById(
                "loginForm"
            );


        if (form) {

            form.prepend(
                successElement
            );

        }

    }


    successElement.textContent =
        message;


    successElement.style.display =
        "block";

}


/* =========================================================
   16. SHOW USER INFORMATION
========================================================= */

function populateUserInformation() {

    const user =
        getCurrentUser();


    if (!user) {
        return;
    }


    /*
       User name
    */

    document
        .querySelectorAll(
            "[data-user-name]"
        )
        .forEach(element => {

            element.textContent =
                user.name ||
                user.username;

        });


    /*
       Username
    */

    document
        .querySelectorAll(
            "[data-username]"
        )
        .forEach(element => {

            element.textContent =
                user.username;

        });


    /*
       User role
    */

    document
        .querySelectorAll(
            "[data-user-role]"
        )
        .forEach(element => {

            element.textContent =
                user.role ||
                "Administrator";

        });


    /*
       User initials
    */

    document
        .querySelectorAll(
            "[data-user-initials]"
        )
        .forEach(element => {

            element.textContent =
                getUserInitials(
                    user.name ||
                    user.username
                );

        });

}


/* =========================================================
   17. USER INITIALS
========================================================= */

function getUserInitials(
    name
) {

    if (!name) {
        return "AD";
    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   18. CHANGE PASSWORD
========================================================= */

function changePassword(
    currentPassword,
    newPassword
) {

    /*
       Frontend-only demo implementation.

       In a real production application,
       passwords must NEVER be stored directly
       in JavaScript or localStorage.
    */

    if (
        currentPassword !==
        AUTH_CONFIG.password
    ) {

        return {

            success: false,

            message:
                "Current password is incorrect."

        };

    }


    if (
        !newPassword ||
        newPassword.length < 6
    ) {

        return {

            success: false,

            message:
                "New password must contain at least 6 characters."

        };

    }


    AUTH_CONFIG.password =
        newPassword;


    /*
       Store the changed password locally
       for this demo application.
    */

    localStorage.setItem(
        "ims_demo_password",
        newPassword
    );


    return {

        success: true,

        message:
            "Password changed successfully."

    };

}


/* =========================================================
   19. LOAD SAVED DEMO PASSWORD
========================================================= */

function loadSavedPassword() {

    const savedPassword =
        localStorage.getItem(
            "ims_demo_password"
        );


    if (savedPassword) {

        AUTH_CONFIG.password =
            savedPassword;

    }

}


loadSavedPassword();


/* =========================================================
   20. SESSION INFORMATION
========================================================= */

function getSessionTimeRemaining() {

    const session =
        getSession();


    if (
        !session ||
        session.expiresAt === null
    ) {

        return null;

    }


    const remaining =
        session.expiresAt -
        Date.now();


    if (remaining <= 0) {

        logout(false);

        return 0;

    }


    return remaining;

}


/* =========================================================
   21. SESSION EXPIRATION CHECK
========================================================= */

setInterval(() => {

    if (
        isAuthenticated()
    ) {

        const remaining =
            getSessionTimeRemaining();


        if (
            remaining !== null &&
            remaining <= 0
        ) {

            alert(
                "Your session has expired. Please login again."
            );


            logout();

        }

    }

}, 60000);


/* =========================================================
   22. AUTHENTICATION API
========================================================= */

window.InventoryAuth = {

    login: handleLogin,

    logout,

    isAuthenticated,

    getSession,

    getCurrentUser,

    createSession,

    changePassword,

    getSessionTimeRemaining,

    getUserInitials

};


/* =========================================================
   END OF AUTH.JS
========================================================= */