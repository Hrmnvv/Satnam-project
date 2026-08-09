/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   DASHBOARD JAVASCRIPT
   File: js/dashboard.js

   Features:
   - Dashboard statistics
   - Total products
   - Total stock
   - Low stock alerts
   - Inventory value
   - Sales revenue
   - Purchase value
   - Recent sales
   - Recent activity
   - Low-stock products
   - Category summary
   - Sales chart
   - Inventory chart
   - Auto refresh
========================================================= */


/* =========================================================
   1. INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboard();

    }
);


function initializeDashboard() {

    /*
       Make sure storage.js is loaded.
    */

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not available. Make sure storage.js is loaded before dashboard.js."
        );

        return;

    }


    loadDashboardStatistics();

    loadRecentSales();

    loadLowStockProducts();

    loadRecentActivity();

    loadCategorySummary();

    createSalesChart();

    createInventoryChart();

    setupDashboardEvents();

    updateDashboardDate();

}


/* =========================================================
   2. DASHBOARD STATISTICS
========================================================= */

function loadDashboardStatistics() {

    const statistics =
        InventoryStorage
            .getInventoryStatistics();


    /*
       Total Products
    */

    setElementText(
        [
            "totalProducts",
            "total-products",
            "productsCount"
        ],
        statistics.totalProducts
    );


    /*
       Total Stock
    */

    setElementText(
        [
            "totalStock",
            "total-stock",
            "stockCount"
        ],
        formatNumber(
            statistics.totalStock
        )
    );


    /*
       Low Stock
    */

    setElementText(
        [
            "lowStock",
            "low-stock",
            "lowStockCount"
        ],
        statistics.lowStock
    );


    /*
       Out of Stock
    */

    setElementText(
        [
            "outOfStock",
            "out-of-stock",
            "outOfStockCount"
        ],
        statistics.outOfStock
    );


    /*
       Inventory Value
    */

    setElementText(
        [
            "inventoryValue",
            "inventory-value"
        ],
        formatCurrency(
            statistics.inventoryValue
        )
    );


    /*
       Sales Revenue
    */

    setElementText(
        [
            "salesRevenue",
            "sales-revenue",
            "totalSalesRevenue"
        ],
        formatCurrency(
            statistics.salesRevenue
        )
    );


    /*
       Total Sales
    */

    setElementText(
        [
            "totalSales",
            "total-sales",
            "salesCount"
        ],
        statistics.totalSales
    );


    /*
       Purchase Value
    */

    setElementText(
        [
            "purchaseValue",
            "purchase-value",
            "totalPurchaseValue"
        ],
        formatCurrency(
            statistics.purchaseValue
        )
    );


    /*
       Total Purchases
    */

    setElementText(
        [
            "totalPurchases",
            "total-purchases",
            "purchasesCount"
        ],
        statistics.totalPurchases
    );


    /*
       Update percentage indicators
    */

    updateStockIndicators(
        statistics
    );

}


/* =========================================================
   3. ELEMENT TEXT HELPER
========================================================= */

function setElementText(
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

                element.textContent =
                    value;

            }

        }
    );

}


/* =========================================================
   4. NUMBER FORMAT
========================================================= */

function formatNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   5. CURRENCY FORMAT
========================================================= */

function formatCurrency(
    amount
) {

    const settings =
        InventoryStorage
            .getSettings();


    const currency =
        settings.currency ||
        "₹";


    return (
        currency +
        Number(amount || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    );

}


/* =========================================================
   6. STOCK INDICATORS
========================================================= */

function updateStockIndicators(
    statistics
) {

    const products =
        InventoryStorage
            .getProducts();


    const totalProducts =
        products.length;


    if (
        totalProducts === 0
    ) {

        return;

    }


    const lowStockPercentage =
        (
            statistics.lowStock /
            totalProducts
        ) * 100;


    const outOfStockPercentage =
        (
            statistics.outOfStock /
            totalProducts
        ) * 100;


    setElementText(
        [
            "lowStockPercentage",
            "low-stock-percentage"
        ],
        `${lowStockPercentage.toFixed(1)}%`
    );


    setElementText(
        [
            "outOfStockPercentage",
            "out-of-stock-percentage"
        ],
        `${outOfStockPercentage.toFixed(1)}%`
    );

}


/* =========================================================
   7. RECENT SALES
========================================================= */

function loadRecentSales() {

    const sales =
        InventoryStorage
            .getSales();


    /*
       Sort newest first.
    */

    const recentSales =
        sales
            .sort(
                (a, b) =>
                    new Date(b.date || b.createdAt) -
                    new Date(a.date || a.createdAt)
            )
            .slice(
                0,
                5
            );


    const container =
        findFirstElement([
            "recentSales",
            "recent-sales",
            "recentSalesTableBody"
        ]);


    if (!container) {

        return;

    }


    /*
       If the element is a table body,
       generate table rows.
    */

    if (
        container.tagName ===
        "TBODY"
    ) {

        container.innerHTML =
            recentSales
                .map(
                    sale =>
                        createSaleRow(
                            sale
                        )
                )
                .join("");


        return;

    }


    /*
       Otherwise generate cards/list.
    */

    container.innerHTML =
        recentSales
            .map(
                sale =>
                    createSaleCard(
                        sale
                    )
            )
            .join("");


}


/* =========================================================
   8. CREATE SALE TABLE ROW
========================================================= */

function createSaleRow(
    sale
) {

    const invoice =
        sale.invoice ||
        sale.id ||
        "-";


    const customer =
        sale.customer ||
        "Walk-in Customer";


    const total =
        formatCurrency(
            sale.total
        );


    const status =
        sale.paymentStatus ||
        sale.status ||
        "Completed";


    const date =
        formatDate(
            sale.date ||
            sale.createdAt
        );


    return `

        <tr>

            <td>
                ${escapeHTML(invoice)}
            </td>

            <td>
                ${escapeHTML(customer)}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${total}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>
            </td>

        </tr>

    `;

}


/* =========================================================
   9. CREATE SALE CARD
========================================================= */

function createSaleCard(
    sale
) {

    const invoice =
        sale.invoice ||
        sale.id ||
        "-";


    const customer =
        sale.customer ||
        "Walk-in Customer";


    const total =
        formatCurrency(
            sale.total
        );


    const status =
        sale.paymentStatus ||
        sale.status ||
        "Completed";


    return `

        <div class="recent-sale-item">

            <div class="sale-info">

                <strong>
                    ${escapeHTML(invoice)}
                </strong>

                <span>
                    ${escapeHTML(customer)}
                </span>

            </div>


            <div class="sale-right">

                <strong>
                    ${total}
                </strong>

                <span class="status-badge ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   10. LOW STOCK PRODUCTS
========================================================= */

function loadLowStockProducts() {

    const products =
        InventoryStorage
            .getProducts();


    const lowStockProducts =
        products
            .filter(
                product =>
                    Number(product.stock || 0)
                    <=
                    Number(product.minStock || 0)
            )
            .sort(
                (a, b) =>
                    Number(a.stock || 0) -
                    Number(b.stock || 0)
            )
            .slice(
                0,
                5
            );


    const container =
        findFirstElement([
            "lowStockProducts",
            "low-stock-products",
            "lowStockTableBody"
        ]);


    if (!container) {

        return;

    }


    if (
        container.tagName ===
        "TBODY"
    ) {

        container.innerHTML =
            lowStockProducts
                .map(
                    product =>
                        createLowStockRow(
                            product
                        )
                )
                .join("");


        return;

    }


    container.innerHTML =
        lowStockProducts
            .map(
                product =>
                    createLowStockCard(
                        product
                    )
            )
            .join("");


}


/* =========================================================
   11. LOW STOCK TABLE ROW
========================================================= */

function createLowStockRow(
    product
) {

    const stock =
        Number(
            product.stock || 0
        );


    const minimum =
        Number(
            product.minStock || 0
        );


    let stockClass =
        "stock-normal";


    if (
        stock <= 0
    ) {

        stockClass =
            "stock-danger";

    } else if (
        stock <= minimum
    ) {

        stockClass =
            "stock-warning";

    }


    return `

        <tr>

            <td>

                <strong>
                    ${escapeHTML(product.name)}
                </strong>

            </td>

            <td>
                ${escapeHTML(product.sku || "-")}
            </td>

            <td>
                ${escapeHTML(product.category || "-")}
            </td>

            <td>

                <span class="${stockClass}">
                    ${formatNumber(stock)}
                </span>

            </td>

            <td>
                ${formatNumber(minimum)}
            </td>

        </tr>

    `;

}


/* =========================================================
   12. LOW STOCK CARD
========================================================= */

function createLowStockCard(
    product
) {

    const stock =
        Number(
            product.stock || 0
        );


    const minimum =
        Number(
            product.minStock || 0
        );


    const stockClass =
        stock <= 0
            ? "danger"
            : "warning";


    return `

        <div class="low-stock-item ${stockClass}">

            <div>

                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <small>
                    ${escapeHTML(product.sku || "-")}
                </small>

            </div>


            <div class="stock-number">

                <strong>
                    ${formatNumber(stock)}
                </strong>

                <small>
                    / ${formatNumber(minimum)}
                </small>

            </div>

        </div>

    `;

}


/* =========================================================
   13. RECENT ACTIVITY
========================================================= */

function loadRecentActivity() {

    const activities =
        InventoryStorage
            .getActivities();


    const recentActivities =
        activities.slice(
            0,
            8
        );


    const container =
        findFirstElement([
            "recentActivity",
            "recent-activity",
            "activityList"
        ]);


    if (!container) {

        return;

    }


    container.innerHTML =
        recentActivities
            .map(
                activity =>
                    createActivityItem(
                        activity
                    )
            )
            .join("");


    if (
        recentActivities.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    No recent activity.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   14. ACTIVITY ITEM
========================================================= */

function createActivityItem(
    activity
) {

    return `

        <div class="activity-item">

            <div class="activity-icon">

                <i class="fas fa-history"></i>

            </div>


            <div class="activity-content">

                <strong>
                    ${escapeHTML(activity.title || "Activity")}
                </strong>

                <p>
                    ${escapeHTML(activity.description || "")}
                </p>

                <small>
                    ${formatDateTime(activity.timestamp)}
                </small>

            </div>

        </div>

    `;

}


/* =========================================================
   15. CATEGORY SUMMARY
========================================================= */

function loadCategorySummary() {

    const products =
        InventoryStorage
            .getProducts();


    const categories =
        InventoryStorage
            .getCategories();


    const container =
        findFirstElement([
            "categorySummary",
            "category-summary",
            "categoryList"
        ]);


    if (!container) {

        return;

    }


    const categoryData =
        categories.map(
            category => {

                const categoryProducts =
                    products.filter(
                        product =>
                            product.category ===
                            category.name
                    );


                const totalStock =
                    categoryProducts.reduce(
                        (sum, product) =>
                            sum +
                            Number(
                                product.stock || 0
                            ),
                        0
                    );


                const inventoryValue =
                    categoryProducts.reduce(
                        (sum, product) =>
                            sum +
                            (
                                Number(product.stock || 0) *
                                Number(product.purchasePrice || 0)
                            ),
                        0
                    );


                return {

                    name:
                        category.name,

                    products:
                        categoryProducts.length,

                    stock:
                        totalStock,

                    value:
                        inventoryValue

                };

            }
        );


    container.innerHTML =
        categoryData
            .map(
                category =>
                    createCategoryItem(
                        category
                    )
            )
            .join("");

}


/* =========================================================
   16. CATEGORY ITEM
========================================================= */

function createCategoryItem(
    category
) {

    return `

        <div class="category-summary-item">

            <div>

                <strong>
                    ${escapeHTML(category.name)}
                </strong>

                <small>
                    ${formatNumber(category.products)}
                    products
                </small>

            </div>


            <div>

                <strong>
                    ${formatNumber(category.stock)}
                </strong>

                <small>
                    units
                </small>

            </div>

        </div>

    `;

}


/* =========================================================
   17. SALES CHART
========================================================= */

function createSalesChart() {

    const canvas =
        findFirstElement([
            "salesChart",
            "sales-chart"
        ]);


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const sales =
        InventoryStorage
            .getSales();


    const monthlyData =
        getMonthlySalesData(
            sales
        );


    /*
       Destroy existing chart.
    */

    if (
        window.inventorySalesChart
    ) {

        window.inventorySalesChart.destroy();

    }


    window.inventorySalesChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        monthlyData.labels,

                    datasets: [

                        {

                            label:
                                "Sales Revenue",

                            data:
                                monthlyData.values,

                            borderWidth:
                                2,

                            fill:
                                true,

                            tension:
                                0.4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            formatCurrency(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function (
                                        value
                                    ) {

                                        return formatCurrency(
                                            value
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   18. MONTHLY SALES DATA
========================================================= */

function getMonthlySalesData(
    sales
) {

    const months = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ];


    const currentYear =
        new Date()
            .getFullYear();


    const values =
        new Array(12)
            .fill(0);


    sales.forEach(
        sale => {

            const date =
                new Date(
                    sale.date ||
                    sale.createdAt
                );


            if (
                date.getFullYear() ===
                currentYear
            ) {

                values[
                    date.getMonth()
                ] +=
                    Number(
                        sale.total || 0
                    );

            }

        }
    );


    return {

        labels:
            months,

        values:
            values

    };

}


/* =========================================================
   19. INVENTORY CHART
========================================================= */

function createInventoryChart() {

    const canvas =
        findFirstElement([
            "inventoryChart",
            "inventory-chart",
            "stockChart"
        ]);


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const products =
        InventoryStorage
            .getProducts();


    const categories =
        InventoryStorage
            .getCategories();


    const labels = [];

    const values = [];


    categories.forEach(
        category => {

            const categoryProducts =
                products.filter(
                    product =>
                        product.category ===
                        category.name
                );


            const stock =
                categoryProducts.reduce(
                    (sum, product) =>
                        sum +
                        Number(
                            product.stock || 0
                        ),
                    0
                );


            labels.push(
                category.name
            );


            values.push(
                stock
            );

        }
    );


    if (
        window.inventoryChart
    ) {

        window.inventoryChart.destroy();

    }


    window.inventoryChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Stock",

                            data:
                                values,

                            borderWidth:
                                1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }

        );

}


/* =========================================================
   20. DASHBOARD EVENTS
========================================================= */

function setupDashboardEvents() {

    /*
       Refresh button
    */

    const refreshButtons =
        document.querySelectorAll(
            "#refreshDashboard, .refresh-dashboard"
        );


    refreshButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    refreshDashboard();

                }
            );

        }
    );


    /*
       Logout buttons
    */

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );


    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    if (
                        typeof logout ===
                        "function"
                    ) {

                        logout();

                    }

                }
            );

        }
    );


    /*
       Notification button
    */

    const notificationButtons =
        document.querySelectorAll(
            ".notification-btn, #notificationBtn"
        );


    notificationButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                showNotifications
            );

        }
    );

}


/* =========================================================
   21. REFRESH DASHBOARD
========================================================= */

function refreshDashboard() {

    loadDashboardStatistics();

    loadRecentSales();

    loadLowStockProducts();

    loadRecentActivity();

    loadCategorySummary();

    createSalesChart();

    createInventoryChart();


    showDashboardMessage(
        "Dashboard updated successfully."
    );

}


/* =========================================================
   22. DASHBOARD MESSAGE
========================================================= */

function showDashboardMessage(
    message
) {

    /*
       Use existing toast function if app.js
       provides one.
    */

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(
            message,
            "success"
        );

        return;

    }


    console.log(
        message
    );

}


/* =========================================================
   23. NOTIFICATIONS
========================================================= */

function showNotifications() {

    const notifications =
        InventoryStorage
            .getNotifications();


    const unread =
        notifications.filter(
            notification =>
                !notification.read
        );


    if (
        unread.length === 0
    ) {

        alert(
            "You have no new notifications."
        );

        return;

    }


    const messages =
        unread
            .slice(0, 5)
            .map(
                notification =>
                    `• ${notification.title}: ${notification.message}`
            )
            .join("\n");


    alert(
        messages
    );


    InventoryStorage
        .markAllNotificationsRead();

}


/* =========================================================
   24. UPDATE DASHBOARD DATE
========================================================= */

function updateDashboardDate() {

    const dateElements =
        document.querySelectorAll(
            "[data-dashboard-date]"
        );


    const today =
        new Date();


    const formatted =
        today.toLocaleDateString(
            "en-IN",
            {

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"

            }
        );


    dateElements.forEach(
        element => {

            element.textContent =
                formatted;

        }
    );

}


/* =========================================================
   25. DATE FORMAT
========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


/* =========================================================
   26. DATE + TIME FORMAT
========================================================= */

function formatDateTime(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =========================================================
   27. STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const value =
        String(status)
            .toLowerCase();


    if (
        value.includes(
            "paid"
        ) ||
        value.includes(
            "completed"
        ) ||
        value.includes(
            "active"
        ) ||
        value.includes(
            "received"
        )
    ) {

        return "status-success";

    }


    if (
        value.includes(
            "pending"
        ) ||
        value.includes(
            "processing"
        )
    ) {

        return "status-warning";

    }


    if (
        value.includes(
            "cancel"
        ) ||
        value.includes(
            "failed"
        ) ||
        value.includes(
            "unpaid"
        )
    ) {

        return "status-danger";

    }


    return "status-neutral";

}


/* =========================================================
   28. FIND FIRST AVAILABLE ELEMENT
========================================================= */

function findFirstElement(
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

            return element;

        }

    }


    return null;

}


/* =========================================================
   29. ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   30. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        /*
           Refresh every 60 seconds
           while dashboard is open.
        */

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadDashboardStatistics();

            loadRecentSales();

            loadLowStockProducts();

            loadRecentActivity();

        }

    },
    60000
);


/* =========================================================
   31. DASHBOARD API
========================================================= */

window.InventoryDashboard = {

    initialize:
        initializeDashboard,

    refresh:
        refreshDashboard,

    loadStatistics:
        loadDashboardStatistics,

    loadRecentSales:
        loadRecentSales,

    loadLowStock:
        loadLowStockProducts,

    loadActivity:
        loadRecentActivity,

    loadCategories:
        loadCategorySummary,

    createSalesChart:
        createSalesChart,

    createInventoryChart:
        createInventoryChart

};


/* =========================================================
   END OF DASHBOARD.JS
========================================================= */