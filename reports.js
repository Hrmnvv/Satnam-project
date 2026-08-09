/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   REPORTS JAVASCRIPT
   File: js/reports.js

   Features:
   - Sales reports
   - Purchase reports
   - Inventory reports
   - Profit calculation
   - Product performance
   - Category performance
   - Customer performance
   - Date filtering
   - Summary statistics
   - Charts
   - CSV export
   - Print report
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let reportSales = [];
let reportPurchases = [];
let reportProducts = [];
let reportCustomers = [];
let reportCategories = [];

let currentReportPeriod = "30";

let salesChart = null;
let categoryChart = null;
let productChart = null;


/* =========================================================
   2. INITIALIZE REPORTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeReports();

    }
);


function initializeReports() {

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not loaded."
        );

        return;

    }


    loadReportData();

    setupReportEvents();

    applyReportFilter();

    updateReportSummary();

    generateReportTables();

    generateReportCharts();

}


/* =========================================================
   3. LOAD DATA
========================================================= */

function loadReportData() {

    reportSales =
        typeof InventoryStorage.getSales ===
        "function"
            ? InventoryStorage.getSales() || []
            : [];


    reportPurchases =
        typeof InventoryStorage.getPurchases ===
        "function"
            ? InventoryStorage.getPurchases() || []
            : [];


    reportProducts =
        typeof InventoryStorage.getProducts ===
        "function"
            ? InventoryStorage.getProducts() || []
            : [];


    reportCustomers =
        typeof InventoryStorage.getCustomers ===
        "function"
            ? InventoryStorage.getCustomers() || []
            : [];


    reportCategories =
        typeof InventoryStorage.getCategories ===
        "function"
            ? InventoryStorage.getCategories() || []
            : [];

}


/* =========================================================
   4. SETUP EVENTS
========================================================= */

function setupReportEvents() {

    const periodSelect =
        findReportElement([
            "reportPeriod",
            "reportRange",
            "dateRange"
        ]);


    if (periodSelect) {

        periodSelect.addEventListener(
            "change",
            function () {

                currentReportPeriod =
                    this.value;

                applyReportFilter();

            }
        );

    }


    document
        .querySelectorAll(
            ".report-period-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".report-period-btn"
                            )
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );


                        this.classList.add(
                            "active"
                        );


                        currentReportPeriod =
                            this.dataset.period ||
                            "30";


                        applyReportFilter();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "#exportReport, .export-report"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportReport
                );

            }
        );


    document
        .querySelectorAll(
            "#printReport, .print-report"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    printReport
                );

            }
        );


    document
        .querySelectorAll(
            "#refreshReport, .refresh-report"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        loadReportData();

                        applyReportFilter();

                    }
                );

            }
        );

}


/* =========================================================
   5. FILTER DATA
========================================================= */

function applyReportFilter() {

    loadReportData();


    const days =
        getReportDays(
            currentReportPeriod
        );


    if (days === "all") {

        updateReportSummary();

        generateReportTables();

        generateReportCharts();

        return;

    }


    const startDate =
        new Date();


    startDate.setHours(
        0,
        0,
        0,
        0
    );


    startDate.setDate(
        startDate.getDate() -
        Number(days) +
        1
    );


    reportSales =
        filterReportsByDate(
            reportSales,
            startDate
        );


    reportPurchases =
        filterReportsByDate(
            reportPurchases,
            startDate
        );


    updateReportSummary();

    generateReportTables();

    generateReportCharts();

}


/* =========================================================
   6. GET REPORT DAYS
========================================================= */

function getReportDays(
    period
) {

    const value =
        String(
            period || "30"
        ).toLowerCase();


    if (
        value === "all" ||
        value === "all-time"
    ) {

        return "all";

    }


    if (
        value === "7" ||
        value === "week"
    ) {

        return 7;

    }


    if (
        value === "30" ||
        value === "month"
    ) {

        return 30;

    }


    if (
        value === "90" ||
        value === "quarter"
    ) {

        return 90;

    }


    if (
        value === "365" ||
        value === "year"
    ) {

        return 365;

    }


    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 30;

}


/* =========================================================
   7. FILTER BY DATE
========================================================= */

function filterReportsByDate(
    items,
    startDate
) {

    return items.filter(
        item => {

            const date =
                getReportItemDate(
                    item
                );


            if (!date) {

                return false;

            }


            return date >= startDate;

        }
    );
}


/* =========================================================
   8. GET ITEM DATE
========================================================= */

function getReportItemDate(
    item
) {

    const value =
        item.date ||
        item.createdAt ||
        item.saleDate ||
        item.purchaseDate ||
        item.updatedAt;


    if (!value) {

        return null;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   9. CALCULATE SALES
========================================================= */

function calculateReportSales() {

    return reportSales.reduce(
        (
            total,
            sale
        ) => {

            return (
                total +
                getReportAmount(
                    sale
                )
            );

        },
        0
    );

}


/* =========================================================
   10. CALCULATE PURCHASES
========================================================= */

function calculateReportPurchases() {

    return reportPurchases.reduce(
        (
            total,
            purchase
        ) => {

            return (
                total +
                getReportAmount(
                    purchase
                )
            );

        },
        0
    );

}


/* =========================================================
   11. CALCULATE PROFIT
========================================================= */

function calculateReportProfit() {

    const sales =
        calculateReportSales();


    const purchases =
        calculateReportPurchases();


    return sales - purchases;

}


/* =========================================================
   12. CALCULATE ORDERS
========================================================= */

function calculateReportOrders() {

    return reportSales.length;

}


/* =========================================================
   13. CALCULATE LOW STOCK
========================================================= */

function calculateLowStock() {

    return reportProducts.filter(
        product => {

            const quantity =
                Number(
                    product.quantity ||
                    product.stock ||
                    product.currentStock ||
                    0
                );


            const minimum =
                Number(
                    product.minStock ||
                    product.minimumStock ||
                    product.reorderLevel ||
                    10
                );


            return quantity <= minimum;

        }
    ).length;

}


/* =========================================================
   14. CALCULATE OUT OF STOCK
========================================================= */

function calculateOutOfStock() {

    return reportProducts.filter(
        product => {

            const quantity =
                Number(
                    product.quantity ||
                    product.stock ||
                    product.currentStock ||
                    0
                );


            return quantity <= 0;

        }
    ).length;

}


/* =========================================================
   15. UPDATE SUMMARY
========================================================= */

function updateReportSummary() {

    const totalSales =
        calculateReportSales();


    const totalPurchases =
        calculateReportPurchases();


    const profit =
        totalSales -
        totalPurchases;


    const orders =
        calculateReportOrders();


    const lowStock =
        calculateLowStock();


    const outOfStock =
        calculateOutOfStock();


    const averageOrder =
        orders > 0
            ? totalSales / orders
            : 0;


    setReportText(
        [
            "totalSales",
            "reportTotalSales"
        ],
        formatReportCurrency(
            totalSales
        )
    );


    setReportText(
        [
            "totalPurchases",
            "reportTotalPurchases"
        ],
        formatReportCurrency(
            totalPurchases
        )
    );


    setReportText(
        [
            "totalProfit",
            "reportTotalProfit",
            "profit"
        ],
        formatReportCurrency(
            profit
        )
    );


    setReportText(
        [
            "totalOrders",
            "reportTotalOrders"
        ],
        formatReportNumber(
            orders
        )
    );


    setReportText(
        [
            "lowStockProducts",
            "reportLowStock"
        ],
        formatReportNumber(
            lowStock
        )
    );


    setReportText(
        [
            "outOfStockProducts",
            "reportOutOfStock"
        ],
        formatReportNumber(
            outOfStock
        )
    );


    setReportText(
        [
            "averageOrderValue",
            "reportAverageOrder"
        ],
        formatReportCurrency(
            averageOrder
        )
    );


    setReportText(
        [
            "totalProducts",
            "reportTotalProducts"
        ],
        formatReportNumber(
            reportProducts.length
        )
    );


    setReportText(
        [
            "totalCustomers",
            "reportTotalCustomers"
        ],
        formatReportNumber(
            reportCustomers.length
        )
    );


    setReportText(
        [
            "totalCategories",
            "reportTotalCategories"
        ],
        formatReportNumber(
            reportCategories.length
        )
    );

}


/* =========================================================
   16. GENERATE REPORT TABLES
========================================================= */

function generateReportTables() {

    generateTopProductsTable();

    generateCategoryTable();

    generateCustomerTable();

    generateRecentSalesTable();

    generateRecentPurchasesTable();

}


/* =========================================================
   17. TOP PRODUCTS TABLE
========================================================= */

function generateTopProductsTable() {

    const tableBody =
        findReportElement([
            "topProductsTableBody",
            "reportProductsTableBody",
            "productsReportBody"
        ]);


    if (!tableBody) {

        return;

    }


    const productStats = {};


    reportSales.forEach(
        sale => {

            const productId =
                sale.productId ||
                sale.product ||
                sale.productName ||
                "Unknown";


            const productName =
                sale.productName ||
                sale.product ||
                findProductName(
                    productId
                );


            const quantity =
                Number(
                    sale.quantity ||
                    sale.qty ||
                    1
                );


            const amount =
                getReportAmount(
                    sale
                );


            if (!productStats[productId]) {

                productStats[productId] = {

                    name:
                        productName,

                    quantity:
                        0,

                    sales:
                        0

                };

            }


            productStats[productId]
                .quantity += quantity;


            productStats[productId]
                .sales += amount;

        }
    );


    const products =
        Object.values(
            productStats
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.sales -
                    a.sales
            )
            .slice(
                0,
                10
            );


    if (
        products.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="4">
                    No sales data available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        products
            .map(
                (
                    product,
                    index
                ) => `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeReportHTML(
                                product.name
                            )}
                        </td>

                        <td>
                            ${formatReportNumber(
                                product.quantity
                            )}
                        </td>

                        <td>
                            ${formatReportCurrency(
                                product.sales
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   18. CATEGORY TABLE
========================================================= */

function generateCategoryTable() {

    const tableBody =
        findReportElement([
            "categoryReportTableBody",
            "categoriesReportTableBody",
            "categoryTableBody"
        ]);


    if (!tableBody) {

        return;

    }


    const categoryStats = {};


    reportSales.forEach(
        sale => {

            const category =
                sale.category ||
                sale.categoryName ||
                findProductCategory(
                    sale.productId ||
                    sale.product
                ) ||
                "Uncategorized";


            if (!categoryStats[category]) {

                categoryStats[category] = {

                    sales:
                        0,

                    orders:
                        0

                };

            }


            categoryStats[category]
                .sales +=
                getReportAmount(
                    sale
                );


            categoryStats[category]
                .orders++;

        }
    );


    const categories =
        Object.entries(
            categoryStats
        )
            .map(
                (
                    [
                        name,
                        data
                    ]
                ) => ({

                    name,

                    sales:
                        data.sales,

                    orders:
                        data.orders

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.sales -
                    a.sales
            );


    if (
        categories.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="3">
                    No category data available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        categories
            .map(
                category => `

                    <tr>

                        <td>
                            ${escapeReportHTML(
                                category.name
                            )}
                        </td>

                        <td>
                            ${formatReportNumber(
                                category.orders
                            )}
                        </td>

                        <td>
                            ${formatReportCurrency(
                                category.sales
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   19. CUSTOMER TABLE
========================================================= */

function generateCustomerTable() {

    const tableBody =
        findReportElement([
            "customerReportTableBody",
            "customersReportTableBody",
            "customerTableBody"
        ]);


    if (!tableBody) {

        return;

    }


    const customerStats = {};


    reportSales.forEach(
        sale => {

            const customerId =
                sale.customerId ||
                sale.customer ||
                sale.customerName ||
                "Walk-in Customer";


            const customerName =
                sale.customerName ||
                sale.customer ||
                findCustomerName(
                    customerId
                );


            if (!customerStats[customerId]) {

                customerStats[customerId] = {

                    name:
                        customerName,

                    orders:
                        0,

                    spent:
                        0

                };

            }


            customerStats[customerId]
                .orders++;


            customerStats[customerId]
                .spent +=
                getReportAmount(
                    sale
                );

        }
    );


    const customers =
        Object.values(
            customerStats
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.spent -
                    a.spent
            )
            .slice(
                0,
                10
            );


    if (
        customers.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="3">
                    No customer sales data available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        customers
            .map(
                customer => `

                    <tr>

                        <td>
                            ${escapeReportHTML(
                                customer.name
                            )}
                        </td>

                        <td>
                            ${formatReportNumber(
                                customer.orders
                            )}
                        </td>

                        <td>
                            ${formatReportCurrency(
                                customer.spent
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   20. RECENT SALES
========================================================= */

function generateRecentSalesTable() {

    const tableBody =
        findReportElement([
            "recentSalesTableBody",
            "reportRecentSalesBody"
        ]);


    if (!tableBody) {

        return;

    }


    const sales =
        [...reportSales]
            .sort(
                (
                    a,
                    b
                ) =>
                    getReportItemDate(
                        b
                    ) -
                    getReportItemDate(
                        a
                    )
            )
            .slice(
                0,
                10
            );


    if (
        sales.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="5">
                    No sales available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        sales
            .map(
                sale => `

                    <tr>

                        <td>
                            ${escapeReportHTML(
                                sale.id ||
                                sale.saleId ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeReportHTML(
                                sale.customerName ||
                                sale.customer ||
                                "Walk-in Customer"
                            )}
                        </td>

                        <td>
                            ${escapeReportHTML(
                                sale.productName ||
                                sale.product ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatReportCurrency(
                                getReportAmount(
                                    sale
                                )
                            )}
                        </td>

                        <td>
                            ${formatReportDate(
                                getReportItemDate(
                                    sale
                                )
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   21. RECENT PURCHASES
========================================================= */

function generateRecentPurchasesTable() {

    const tableBody =
        findReportElement([
            "recentPurchasesTableBody",
            "reportRecentPurchasesBody"
        ]);


    if (!tableBody) {

        return;

    }


    const purchases =
        [...reportPurchases]
            .sort(
                (
                    a,
                    b
                ) =>
                    getReportItemDate(
                        b
                    ) -
                    getReportItemDate(
                        a
                    )
            )
            .slice(
                0,
                10
            );


    if (
        purchases.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="5">
                    No purchases available.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        purchases
            .map(
                purchase => `

                    <tr>

                        <td>
                            ${escapeReportHTML(
                                purchase.id ||
                                purchase.purchaseId ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeReportHTML(
                                purchase.supplierName ||
                                purchase.supplier ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeReportHTML(
                                purchase.productName ||
                                purchase.product ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatReportCurrency(
                                getReportAmount(
                                    purchase
                                )
                            )}
                        </td>

                        <td>
                            ${formatReportDate(
                                getReportItemDate(
                                    purchase
                                )
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   22. GENERATE CHARTS
========================================================= */

function generateReportCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    generateSalesChart();

    generateCategoryChart();

    generateProductChart();

}


/* =========================================================
   23. SALES CHART
========================================================= */

function generateSalesChart() {

    const canvas =
        findReportElement([
            "salesChart",
            "reportSalesChart"
        ]);


    if (!canvas) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    const salesByDate =
        {};


    reportSales.forEach(
        sale => {

            const date =
                getReportItemDate(
                    sale
                );


            if (!date) {

                return;

            }


            const key =
                date.toISOString()
                    .split("T")[0];


            if (!salesByDate[key]) {

                salesByDate[key] = 0;

            }


            salesByDate[key] +=
                getReportAmount(
                    sale
                );

        }
    );


    const dates =
        Object.keys(
            salesByDate
        ).sort();


    const values =
        dates.map(
            date =>
                salesByDate[date]
        );


    if (salesChart) {

        salesChart.destroy();

    }


    salesChart =
        new Chart(
            context,
            {

                type:
                    "line",

                data: {

                    labels:
                        dates.map(
                            date =>
                                formatShortReportDate(
                                    date
                                )
                        ),

                    datasets: [

                        {

                            label:
                                "Sales",

                            data:
                                values,

                            tension:
                                0.3,

                            fill:
                                true

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }
        );

}


/* =========================================================
   24. CATEGORY CHART
========================================================= */

function generateCategoryChart() {

    const canvas =
        findReportElement([
            "categoryChart",
            "reportCategoryChart"
        ]);


    if (!canvas) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    const categoryStats = {};


    reportSales.forEach(
        sale => {

            const category =
                sale.category ||
                sale.categoryName ||
                findProductCategory(
                    sale.productId ||
                    sale.product
                ) ||
                "Other";


            categoryStats[category] =
                (
                    categoryStats[category] ||
                    0
                ) +
                getReportAmount(
                    sale
                );

        }
    );


    const labels =
        Object.keys(
            categoryStats
        );


    const values =
        Object.values(
            categoryStats
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            context,
            {

                type:
                    "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Sales",

                            data:
                                values

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

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
   25. PRODUCT CHART
========================================================= */

function generateProductChart() {

    const canvas =
        findReportElement([
            "productChart",
            "reportProductChart"
        ]);


    if (!canvas) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    const productStats = {};


    reportSales.forEach(
        sale => {

            const product =
                sale.productName ||
                sale.product ||
                findProductName(
                    sale.productId
                ) ||
                "Unknown";


            const quantity =
                Number(
                    sale.quantity ||
                    sale.qty ||
                    1
                );


            productStats[product] =
                (
                    productStats[product] ||
                    0
                ) +
                quantity;

        }
    );


    const topProducts =
        Object.entries(
            productStats
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1] -
                    a[1]
            )
            .slice(
                0,
                8
            );


    const labels =
        topProducts.map(
            item =>
                item[0]
        );


    const values =
        topProducts.map(
            item =>
                item[1]
        );


    if (productChart) {

        productChart.destroy();

    }


    productChart =
        new Chart(
            context,
            {

                type:
                    "bar",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Units Sold",

                            data:
                                values

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }
        );

}


/* =========================================================
   26. FIND PRODUCT NAME
========================================================= */

function findProductName(
    productId
) {

    const product =
        reportProducts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (!product) {

        return "Unknown Product";

    }


    return (
        product.name ||
        product.productName ||
        "Unknown Product"
    );

}


/* =========================================================
   27. FIND PRODUCT CATEGORY
========================================================= */

function findProductCategory(
    productId
) {

    const product =
        reportProducts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (!product) {

        return null;

    }


    return (
        product.category ||
        product.categoryName ||
        null
    );

}


/* =========================================================
   28. FIND CUSTOMER NAME
========================================================= */

function findCustomerName(
    customerId
) {

    const customer =
        reportCustomers.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    customerId
                )
        );


    if (!customer) {

        return "Walk-in Customer";

    }


    return (
        customer.name ||
        customer.customerName ||
        "Walk-in Customer"
    );

}


/* =========================================================
   29. GET AMOUNT
========================================================= */

function getReportAmount(
    item
) {

    if (!item) {

        return 0;

    }


    const possibleValues = [

        item.total,

        item.totalAmount,

        item.grandTotal,

        item.amount,

        item.saleAmount,

        item.purchaseAmount,

        item.netAmount

    ];


    for (
        const value
        of possibleValues
    ) {

        if (
            value !==
            undefined &&
            value !==
            null &&
            value !== ""
        ) {

            const number =
                Number(
                    String(
                        value
                    )
                        .replace(
                            /[^0-9.-]/g,
                            ""
                        )
                );


            if (
                Number.isFinite(
                    number
                )
            ) {

                return number;

            }

        }

    }


    const quantity =
        Number(
            item.quantity ||
            item.qty ||
            1
        );


    const price =
        Number(
            item.price ||
            item.unitPrice ||
            item.sellingPrice ||
            item.cost ||
            0
        );


    return (
        quantity *
        price
    );

}


/* =========================================================
   30. EXPORT REPORT
========================================================= */

function exportReport() {

    const sales =
        calculateReportSales();


    const purchases =
        calculateReportPurchases();


    const profit =
        sales -
        purchases;


    const orders =
        reportSales.length;


    const lowStock =
        calculateLowStock();


    const outOfStock =
        calculateOutOfStock();


    const headers = [

        "Report",

        "Value"

    ];


    const rows = [

        [
            "Total Sales",
            sales.toFixed(2)
        ],

        [
            "Total Purchases",
            purchases.toFixed(2)
        ],

        [
            "Profit",
            profit.toFixed(2)
        ],

        [
            "Orders",
            orders
        ],

        [
            "Products",
            reportProducts.length
        ],

        [
            "Customers",
            reportCustomers.length
        ],

        [
            "Categories",
            reportCategories.length
        ],

        [
            "Low Stock Products",
            lowStock
        ],

        [
            "Out Of Stock Products",
            outOfStock
        ]

    ];


    const csv =
        [
            headers,
            ...rows
        ]
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
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
        `inventory-report-${getReportFileDate()}.csv`;


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


    showReportMessage(
        "Report exported successfully.",
        "success"
    );

}


/* =========================================================
   31. PRINT REPORT
========================================================= */

function printReport() {

    window.print();

}


/* =========================================================
   32. FIND ELEMENT
========================================================= */

function findReportElement(
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
   33. SET TEXT
========================================================= */

function setReportText(
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
   34. FORMAT NUMBER
========================================================= */

function formatReportNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   35. FORMAT CURRENCY
========================================================= */

function formatReportCurrency(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-IN",
        {

            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                2

        }
    );

}


/* =========================================================
   36. FORMAT DATE
========================================================= */

function formatReportDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parsed =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "-";

    }


    return parsed.toLocaleDateString(
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
   37. SHORT DATE
========================================================= */

function formatShortReportDate(
    date
) {

    const parsed =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "";

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short"

        }
    );

}


/* =========================================================
   38. FILE DATE
========================================================= */

function getReportFileDate() {

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
        )

    ].join("-");

}


/* =========================================================
   39. SHOW MESSAGE
========================================================= */

function showReportMessage(
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
   40. ESCAPE HTML
========================================================= */

function escapeReportHTML(
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
   41. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadReportData();

            applyReportFilter();

        }

    },
    60000
);


/* =========================================================
   42. PUBLIC API
========================================================= */

window.InventoryReports = {

    initialize:
        initializeReports,

    refresh:
        function () {

            loadReportData();

            applyReportFilter();

        },

    filter:
        applyReportFilter,

    export:
        exportReport,

    print:
        printReport

};


/* =========================================================
   END OF REPORTS.JS
========================================================= */