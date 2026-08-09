/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   SETTINGS JAVASCRIPT
   File: js/settings.js

   Features:
   - User profile settings
   - Company settings
   - Currency settings
   - Theme settings
   - Notification settings
   - Auto-save settings
   - Backup data
   - Restore data
   - Export data
   - Reset system
   - Clear all data
========================================================= */


/* =========================================================
   1. GLOBAL SETTINGS
========================================================= */

let inventorySettings = {

    companyName:
        "My Inventory Store",

    companyEmail:
        "",

    companyPhone:
        "",

    companyAddress:
        "",

    currency:
        "INR",

    currencySymbol:
        "₹",

    dateFormat:
        "DD/MM/YYYY",

    lowStockAlert:
        true,

    salesNotifications:
        true,

    purchaseNotifications:
        true,

    emailNotifications:
        false,

    darkMode:
        false,

    compactMode:
        false

};


/* =========================================================
   2. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSettings();

    }
);


function initializeSettings() {

    loadSettings();

    populateSettingsForm();

    setupSettingsEvents();

    applySettingsToPage();

}


/* =========================================================
   3. LOAD SETTINGS
========================================================= */

function loadSettings() {

    try {

        const savedSettings =
            localStorage.getItem(
                "inventorySettings"
            );


        if (savedSettings) {

            const parsed =
                JSON.parse(
                    savedSettings
                );


            inventorySettings = {

                ...inventorySettings,

                ...parsed

            };

        }

    }
    catch (error) {

        console.error(
            "Unable to load settings:",
            error
        );

    }

}


/* =========================================================
   4. SAVE SETTINGS
========================================================= */

function saveSettings() {

    try {

        localStorage.setItem(
            "inventorySettings",
            JSON.stringify(
                inventorySettings
            )
        );


        applySettingsToPage();


        showSettingsMessage(
            "Settings saved successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Unable to save settings:",
            error
        );


        showSettingsMessage(
            "Unable to save settings.",
            "error"
        );

    }

}


/* =========================================================
   5. POPULATE FORM
========================================================= */

function populateSettingsForm() {

    setSettingsValue(
        [
            "companyName",
            "storeName",
            "businessName"
        ],
        inventorySettings.companyName
    );


    setSettingsValue(
        [
            "companyEmail",
            "storeEmail"
        ],
        inventorySettings.companyEmail
    );


    setSettingsValue(
        [
            "companyPhone",
            "storePhone"
        ],
        inventorySettings.companyPhone
    );


    setSettingsValue(
        [
            "companyAddress",
            "storeAddress"
        ],
        inventorySettings.companyAddress
    );


    setSettingsValue(
        [
            "currency"
        ],
        inventorySettings.currency
    );


    setSettingsValue(
        [
            "dateFormat"
        ],
        inventorySettings.dateFormat
    );


    setSettingsChecked(
        [
            "lowStockAlert",
            "lowStockNotifications"
        ],
        inventorySettings.lowStockAlert
    );


    setSettingsChecked(
        [
            "salesNotifications"
        ],
        inventorySettings.salesNotifications
    );


    setSettingsChecked(
        [
            "purchaseNotifications"
        ],
        inventorySettings.purchaseNotifications
    );


    setSettingsChecked(
        [
            "emailNotifications"
        ],
        inventorySettings.emailNotifications
    );


    setSettingsChecked(
        [
            "darkMode"
        ],
        inventorySettings.darkMode
    );


    setSettingsChecked(
        [
            "compactMode"
        ],
        inventorySettings.compactMode
    );

}


/* =========================================================
   6. SETUP EVENTS
========================================================= */

function setupSettingsEvents() {

    const form =
        document.getElementById(
            "settingsForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            handleSettingsSubmit
        );

    }


    document
        .querySelectorAll(
            "#saveSettings, .save-settings"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    saveSettingsFromForm
                );

            }
        );


    document
        .querySelectorAll(
            "#resetSettings, .reset-settings"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    resetSettings
                );

            }
        );


    document
        .querySelectorAll(
            "#backupData, .backup-data"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    backupInventoryData
                );

            }
        );


    document
        .querySelectorAll(
            "#restoreData, .restore-data"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    openRestoreFile
                );

            }
        );


    document
        .querySelectorAll(
            "#exportData, .export-data"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportInventoryData
                );

            }
        );


    document
        .querySelectorAll(
            "#clearData, .clear-data"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    clearInventoryData
                );

            }
        );


    document
        .querySelectorAll(
            "#resetSystem, .reset-system"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    resetSystem
                );

            }
        );


    document
        .querySelectorAll(
            "#darkMode, #themeToggle"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "change",
                    handleThemeChange
                );

            }
        );


    const restoreInput =
        document.getElementById(
            "restoreFile"
        );


    if (restoreInput) {

        restoreInput.addEventListener(
            "change",
            handleRestoreFile
        );

    }

}


/* =========================================================
   7. HANDLE SETTINGS FORM
========================================================= */

function handleSettingsSubmit(
    event
) {

    event.preventDefault();

    saveSettingsFromForm();

}


/* =========================================================
   8. SAVE SETTINGS FROM FORM
========================================================= */

function saveSettingsFromForm() {

    inventorySettings.companyName =
        getSettingsValue([
            "companyName",
            "storeName",
            "businessName"
        ]);


    inventorySettings.companyEmail =
        getSettingsValue([
            "companyEmail",
            "storeEmail"
        ]);


    inventorySettings.companyPhone =
        getSettingsValue([
            "companyPhone",
            "storePhone"
        ]);


    inventorySettings.companyAddress =
        getSettingsValue([
            "companyAddress",
            "storeAddress"
        ]);


    inventorySettings.currency =
        getSettingsValue([
            "currency"
        ]) || "INR";


    inventorySettings.dateFormat =
        getSettingsValue([
            "dateFormat"
        ]) ||
        "DD/MM/YYYY";


    inventorySettings.currencySymbol =
        getCurrencySymbol(
            inventorySettings.currency
        );


    inventorySettings.lowStockAlert =
        getSettingsChecked([
            "lowStockAlert",
            "lowStockNotifications"
        ]);


    inventorySettings.salesNotifications =
        getSettingsChecked([
            "salesNotifications"
        ]);


    inventorySettings.purchaseNotifications =
        getSettingsChecked([
            "purchaseNotifications"
        ]);


    inventorySettings.emailNotifications =
        getSettingsChecked([
            "emailNotifications"
        ]);


    inventorySettings.darkMode =
        getSettingsChecked([
            "darkMode"
        ]);


    inventorySettings.compactMode =
        getSettingsChecked([
            "compactMode"
        ]);


    saveSettings();

}


/* =========================================================
   9. APPLY SETTINGS TO PAGE
========================================================= */

function applySettingsToPage() {

    const root =
        document.documentElement;


    if (
        inventorySettings.darkMode
    ) {

        document.body.classList.add(
            "dark-mode"
        );

        root.classList.add(
            "dark-mode"
        );

    }
    else {

        document.body.classList.remove(
            "dark-mode"
        );

        root.classList.remove(
            "dark-mode"
        );

    }


    if (
        inventorySettings.compactMode
    ) {

        document.body.classList.add(
            "compact-mode"
        );

    }
    else {

        document.body.classList.remove(
            "compact-mode"
        );

    }


    document
        .querySelectorAll(
            "[data-company-name]"
        )
        .forEach(
            element => {

                element.textContent =
                    inventorySettings.companyName;

            }
        );


    document
        .querySelectorAll(
            "[data-currency-symbol]"
        )
        .forEach(
            element => {

                element.textContent =
                    inventorySettings.currencySymbol;

            }
        );


    document
        .querySelectorAll(
            "[data-company-email]"
        )
        .forEach(
            element => {

                element.textContent =
                    inventorySettings.companyEmail;

            }
        );


    document
        .querySelectorAll(
            "[data-company-phone]"
        )
        .forEach(
            element => {

                element.textContent =
                    inventorySettings.companyPhone;

            }
        );

}


/* =========================================================
   10. THEME CHANGE
========================================================= */

function handleThemeChange(
    event
) {

    inventorySettings.darkMode =
        event.target.checked;


    saveSettingsSilently();

}


/* =========================================================
   11. RESET SETTINGS
========================================================= */

function resetSettings() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all settings to their default values?"
        );


    if (!confirmed) {

        return;

    }


    inventorySettings = {

        companyName:
            "My Inventory Store",

        companyEmail:
            "",

        companyPhone:
            "",

        companyAddress:
            "",

        currency:
            "INR",

        currencySymbol:
            "₹",

        dateFormat:
            "DD/MM/YYYY",

        lowStockAlert:
            true,

        salesNotifications:
            true,

        purchaseNotifications:
            true,

        emailNotifications:
            false,

        darkMode:
            false,

        compactMode:
            false

    };


    localStorage.setItem(
        "inventorySettings",
        JSON.stringify(
            inventorySettings
        )
    );


    populateSettingsForm();

    applySettingsToPage();


    showSettingsMessage(
        "Settings restored to default.",
        "success"
    );

}


/* =========================================================
   12. BACKUP INVENTORY DATA
========================================================= */

function backupInventoryData() {

    const backup = {

        application:
            "Inventory Management System",

        version:
            "1.0.0",

        exportedAt:
            new Date().toISOString(),

        settings:
            inventorySettings,

        data: {

            products:
                getStorageData(
                    "products"
                ),

            sales:
                getStorageData(
                    "sales"
                ),

            purchases:
                getStorageData(
                    "purchases"
                ),

            suppliers:
                getStorageData(
                    "suppliers"
                ),

            customers:
                getStorageData(
                    "customers"
                ),

            categories:
                getStorageData(
                    "categories"
                )

        }

    };


    downloadJSON(
        backup,
        `inventory-backup-${getSettingsFileDate()}.json`
    );


    showSettingsMessage(
        "Backup created successfully.",
        "success"
    );

}


/* =========================================================
   13. EXPORT INVENTORY DATA
========================================================= */

function exportInventoryData() {

    const data = {

        products:
            getStorageData(
                "products"
            ),

        sales:
            getStorageData(
                "sales"
            ),

        purchases:
            getStorageData(
                "purchases"
            ),

        suppliers:
            getStorageData(
                "suppliers"
            ),

        customers:
            getStorageData(
                "customers"
            ),

        categories:
            getStorageData(
                "categories"
            )

    };


    downloadJSON(
        data,
        `inventory-data-${getSettingsFileDate()}.json`
    );


    showSettingsMessage(
        "Inventory data exported successfully.",
        "success"
    );

}


/* =========================================================
   14. OPEN RESTORE FILE
========================================================= */

function openRestoreFile() {

    const input =
        document.getElementById(
            "restoreFile"
        );


    if (input) {

        input.click();

        return;

    }


    const hiddenInput =
        document.createElement(
            "input"
        );


    hiddenInput.type =
        "file";


    hiddenInput.accept =
        ".json";


    hiddenInput.addEventListener(
        "change",
        handleRestoreFile
    );


    hiddenInput.click();

}


/* =========================================================
   15. HANDLE RESTORE FILE
========================================================= */

function handleRestoreFile(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const backup =
                    JSON.parse(
                        reader.result
                    );


                restoreInventoryData(
                    backup
                );

            }
            catch (error) {

                console.error(
                    error
                );


                showSettingsMessage(
                    "Invalid backup file.",
                    "error"
                );

            }

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   16. RESTORE INVENTORY DATA
========================================================= */

function restoreInventoryData(
    backup
) {

    const confirmed =
        confirm(
            "Restoring this backup will replace your current inventory data. Continue?"
        );


    if (!confirmed) {

        return;

    }


    try {

        if (
            backup.settings
        ) {

            inventorySettings = {

                ...inventorySettings,

                ...backup.settings

            };


            localStorage.setItem(
                "inventorySettings",
                JSON.stringify(
                    inventorySettings
                )
            );

        }


        const data =
            backup.data ||
            backup;


        restoreStorageData(
            "products",
            data.products
        );


        restoreStorageData(
            "sales",
            data.sales
        );


        restoreStorageData(
            "purchases",
            data.purchases
        );


        restoreStorageData(
            "suppliers",
            data.suppliers
        );


        restoreStorageData(
            "customers",
            data.customers
        );


        restoreStorageData(
            "categories",
            data.categories
        );


        populateSettingsForm();

        applySettingsToPage();


        showSettingsMessage(
            "Backup restored successfully. Reloading...",
            "success"
        );


        setTimeout(
            function () {

                window.location.reload();

            },
            1200
        );

    }
    catch (error) {

        console.error(
            error
        );


        showSettingsMessage(
            "Unable to restore backup.",
            "error"
        );

    }

}


/* =========================================================
   17. CLEAR INVENTORY DATA
========================================================= */

function clearInventoryData() {

    const confirmed =
        confirm(
            "WARNING: This will delete your products, sales, purchases, suppliers, customers and categories. Continue?"
        );


    if (!confirmed) {

        return;

    }


    const secondConfirmation =
        confirm(
            "Are you absolutely sure? This action cannot be undone."
        );


    if (!secondConfirmation) {

        return;

    }


    const keys = [

        "products",

        "sales",

        "purchases",

        "suppliers",

        "customers",

        "categories"

    ];


    keys.forEach(
        key => {

            localStorage.removeItem(
                key
            );

        }
    );


    showSettingsMessage(
        "All inventory data has been cleared.",
        "success"
    );


    setTimeout(
        function () {

            window.location.reload();

        },
        1000
    );

}


/* =========================================================
   18. RESET ENTIRE SYSTEM
========================================================= */

function resetSystem() {

    const confirmed =
        confirm(
            "This will reset the entire Inventory Management System. All data and settings will be deleted. Continue?"
        );


    if (!confirmed) {

        return;

    }


    const secondConfirmation =
        confirm(
            "FINAL WARNING: All stored data will be permanently removed."
        );


    if (!secondConfirmation) {

        return;

    }


    localStorage.clear();


    sessionStorage.clear();


    showSettingsMessage(
        "System reset completed. Reloading...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
                "../index.html";

        },
        1000
    );

}


/* =========================================================
   19. GET STORAGE DATA
========================================================= */

function getStorageData(
    key
) {

    try {

        const data =
            localStorage.getItem(
                key
            );


        if (!data) {

            return [];

        }


        return JSON.parse(
            data
        );

    }
    catch (error) {

        console.error(
            `Unable to read ${key}`,
            error
        );


        return [];

    }

}


/* =========================================================
   20. RESTORE STORAGE DATA
========================================================= */

function restoreStorageData(
    key,
    data
) {

    if (
        data === undefined
    ) {

        return;

    }


    localStorage.setItem(
        key,
        JSON.stringify(
            data
        )
    );

}


/* =========================================================
   21. DOWNLOAD JSON
========================================================= */

function downloadJSON(
    data,
    filename
) {

    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   22. GET SETTINGS VALUE
========================================================= */

function getSettingsValue(
    ids
) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            return element.value.trim();

        }

    }


    return "";

}


/* =========================================================
   23. GET CHECKBOX VALUE
========================================================= */

function getSettingsChecked(
    ids
) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            return element.checked;

        }

    }


    return false;

}


/* =========================================================
   24. SET SETTINGS VALUE
========================================================= */

function setSettingsValue(
    ids,
    value
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    value || "";

            }

        }
    );

}


/* =========================================================
   25. SET CHECKBOX
========================================================= */

function setSettingsChecked(
    ids,
    value
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.checked =
                    Boolean(
                        value
                    );

            }

        }
    );

}


/* =========================================================
   26. GET CURRENCY SYMBOL
========================================================= */

function getCurrencySymbol(
    currency
) {

    const currencies = {

        INR:
            "₹",

        USD:
            "$",

        EUR:
            "€",

        GBP:
            "£",

        AUD:
            "A$",

        CAD:
            "C$",

        SGD:
            "S$",

        JPY:
            "¥"

    };


    return (
        currencies[currency] ||
        currency
    );

}


/* =========================================================
   27. FILE DATE
========================================================= */

function getSettingsFileDate() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


/* =========================================================
   28. SAVE SILENTLY
========================================================= */

function saveSettingsSilently() {

    try {

        localStorage.setItem(
            "inventorySettings",
            JSON.stringify(
                inventorySettings
            )
        );


        applySettingsToPage();

    }
    catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   29. SHOW MESSAGE
========================================================= */

function showSettingsMessage(
    message,
    type = "info"
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(
            message,
            type
        );

        return;

    }


    console.log(
        `[${type.toUpperCase()}] ${message}`
    );

}


/* =========================================================
   30. PUBLIC API
========================================================= */

window.InventorySettings = {

    initialize:
        initializeSettings,

    load:
        loadSettings,

    save:
        saveSettings,

    reset:
        resetSettings,

    backup:
        backupInventoryData,

    restore:
        openRestoreFile,

    export:
        exportInventoryData,

    clearData:
        clearInventoryData,

    resetSystem:
        resetSystem,

    get:
        function () {

            return {
                ...inventorySettings
            };

        }

};


/* =========================================================
   END OF SETTINGS.JS
========================================================= */