/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   PURCHASES JAVASCRIPT
   File: js/purchases.js

   Features:
   - Load purchases
   - Display purchases
   - Search purchases
   - Filter purchases
   - Add new purchase
   - Automatically increase product stock
   - Calculate purchase totals
   - View purchase details
   - Delete purchase
   - Restore stock when purchase is deleted
   - Export purchases to CSV
   - Purchase statistics
   - Pagination
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let allPurchases = [];

let filteredPurchases = [];

let currentPurchasePage = 1;

let purchasesRowsPerPage = 10;


/* =========================================================
   2. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializePurchases();

    }
);


function initializePurchases() {

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not loaded."
        );

        return;

    }


    loadPurchases();

    loadPurchaseProducts();

    setupPurchaseEvents();

    updatePurchaseStatistics();

}


/* =========================================================
   3. LOAD PURCHASES
========================================================= */

function loadPurchases() {

    allPurchases =
        InventoryStorage
            .getPurchases() || [];


    filteredPurchases =
        [...allPurchases];


    sortPurchases();

    renderPurchases();

}


/* =========================================================
   4. RENDER PURCHASES
========================================================= */

function renderPurchases() {

    const tableBody =
        findFirstElement([
            "purchasesTableBody",
            "purchaseTableBody",
            "purchases-table-body"
        ]);


    if (!tableBody) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredPurchases.length /
            purchasesRowsPerPage
        );


    if (
        currentPurchasePage >
        totalPages &&
        totalPages > 0
    ) {

        currentPurchasePage =
            totalPages;

    }


    const start =
        (
            currentPurchasePage -
            1
        ) *
        purchasesRowsPerPage;


    const end =
        start +
        purchasesRowsPerPage;


    const purchasesToShow =
        filteredPurchases.slice(
            start,
            end
        );


    if (
        purchasesToShow.length ===
        0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-shopping-cart"></i>

                        <h3>
                            No Purchases Found
                        </h3>

                        <p>
                            No purchases match
                            your current filters.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        updatePurchasePagination();

        return;

    }


    tableBody.innerHTML =
        purchasesToShow
            .map(
                purchase =>
                    createPurchaseRow(
                        purchase
                    )
            )
            .join("");


    updatePurchasePagination();

}


/* =========================================================
   5. CREATE PURCHASE ROW
========================================================= */

function createPurchaseRow(
    purchase
) {

    const invoice =
        purchase.invoice ||
        purchase.invoiceNumber ||
        purchase.purchaseNumber ||
        purchase.id ||
        "-";


    const supplier =
        purchase.supplier ||
        purchase.supplierName ||
        "Unknown Supplier";


    const items =
        purchase.items ||
        [];


    const itemCount =
        items.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity ||
                    0
                ),
            0
        );


    const total =
        Number(
            purchase.total ||
            0
        );


    const paymentMethod =
        purchase.paymentMethod ||
        "Cash";


    const status =
        purchase.status ||
        purchase.paymentStatus ||
        "Completed";


    const date =
        formatPurchaseDate(
            purchase.date ||
            purchase.createdAt
        );


    return `

        <tr
            data-purchase-id="${escapePurchaseHTML(
                purchase.id
            )}"
        >

            <td>

                <strong>
                    ${escapePurchaseHTML(
                        invoice
                    )}
                </strong>

            </td>


            <td>
                ${escapePurchaseHTML(
                    supplier
                )}
            </td>


            <td>
                ${formatPurchaseNumber(
                    itemCount
                )}
            </td>


            <td>
                ${formatPurchaseCurrency(
                    total
                )}
            </td>


            <td>
                ${escapePurchaseHTML(
                    paymentMethod
                )}
            </td>


            <td>

                <span
                    class="status-badge ${getPurchaseStatusClass(
                        status
                    )}"
                >

                    ${escapePurchaseHTML(
                        status
                    )}

                </span>

            </td>


            <td>
                ${date}
            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        title="View Purchase"
                        data-purchase-action="view"
                        data-id="${escapePurchaseHTML(
                            purchase.id
                        )}"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn print-btn"
                        title="Print Purchase"
                        data-purchase-action="print"
                        data-id="${escapePurchaseHTML(
                            purchase.id
                        )}"
                    >

                        <i class="fas fa-print"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Purchase"
                        data-purchase-action="delete"
                        data-id="${escapePurchaseHTML(
                            purchase.id
                        )}"
                    >

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   6. LOAD PRODUCTS
========================================================= */

function loadPurchaseProducts() {

    const products =
        InventoryStorage
            .getProducts() || [];


    const selects =
        document.querySelectorAll(
            "#purchaseProduct, #productSelect, .purchase-product-select"
        );


    selects.forEach(
        select => {

            const firstOption =
                select.querySelector(
                    "option"
                );


            select.innerHTML =
                "";


            if (firstOption) {

                select.appendChild(
                    firstOption
                );

            } else {

                select.innerHTML = `

                    <option value="">
                        Select Product
                    </option>

                `;

            }


            products.forEach(
                product => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        product.id;


                    option.textContent =
                        product.name;


                    select.appendChild(
                        option
                    );

                }
            );

        }
    );

}


/* =========================================================
   7. PURCHASE EVENTS
========================================================= */

function setupPurchaseEvents() {

    /*
       Search
    */

    const search =
        findFirstElement([
            "purchaseSearch",
            "purchasesSearch",
            "purchase-search",
            "searchPurchases"
        ]);


    if (search) {

        search.addEventListener(
            "input",
            applyPurchaseFilters
        );

    }


    /*
       Status filter
    */

    const statusFilter =
        findFirstElement([
            "purchaseStatusFilter",
            "purchasesStatusFilter",
            "purchase-status-filter"
        ]);


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyPurchaseFilters
        );

    }


    /*
       Date filter
    */

    const dateFilter =
        findFirstElement([
            "purchaseDateFilter",
            "purchasesDateFilter",
            "purchase-date-filter"
        ]);


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            applyPurchaseFilters
        );

    }


    /*
       Add purchase button
    */

    document
        .querySelectorAll(
            "#addPurchaseBtn, .add-purchase-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    openPurchaseForm
                );

            }
        );


    /*
       Export
    */

    document
        .querySelectorAll(
            "#exportPurchases, .export-purchases"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportPurchases
                );

            }
        );


    /*
       Clear filters
    */

    document
        .querySelectorAll(
            "#clearPurchaseFilters, .clear-purchase-filters"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    clearPurchaseFilters
                );

            }
        );


    /*
       Table buttons
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-purchase-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset
                    .purchaseAction;


            const purchaseId =
                button.dataset.id;


            if (
                action ===
                "view"
            ) {

                viewPurchase(
                    purchaseId
                );

            }


            if (
                action ===
                "print"
            ) {

                printPurchase(
                    purchaseId
                );

            }


            if (
                action ===
                "delete"
            ) {

                deletePurchase(
                    purchaseId
                );

            }

        }
    );


    /*
       Purchase form
    */

    const purchaseForm =
        document.getElementById(
            "purchaseForm"
        );


    if (purchaseForm) {

        purchaseForm.addEventListener(
            "submit",
            handlePurchaseSubmit
        );

    }


    /*
       Product changes
    */

    document
        .querySelectorAll(
            "#purchaseProduct, #productSelect"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    updatePurchaseProduct
                );

            }
        );


    /*
       Quantity / price changes
    */

    document
        .querySelectorAll(
            "#purchaseQuantity, #purchasePrice, #quantity, #price"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    calculatePurchaseTotal
                );

            }
        );

}


/* =========================================================
   8. APPLY FILTERS
========================================================= */

function applyPurchaseFilters() {

    const search =
        findFirstElement([
            "purchaseSearch",
            "purchasesSearch",
            "purchase-search",
            "searchPurchases"
        ]);


    const statusFilter =
        findFirstElement([
            "purchaseStatusFilter",
            "purchasesStatusFilter",
            "purchase-status-filter"
        ]);


    const dateFilter =
        findFirstElement([
            "purchaseDateFilter",
            "purchasesDateFilter",
            "purchase-date-filter"
        ]);


    const searchTerm =
        (
            search?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter?.value ||
        "";


    const selectedDate =
        dateFilter?.value ||
        "";


    filteredPurchases =
        allPurchases.filter(
            purchase => {

                const searchable =
                    [

                        purchase.invoice,

                        purchase.invoiceNumber,

                        purchase.purchaseNumber,

                        purchase.supplier,

                        purchase.supplierName,

                        purchase.paymentMethod

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    searchable.includes(
                        searchTerm
                    );


                const status =
                    purchase.status ||
                    purchase.paymentStatus ||
                    "Completed";


                const matchesStatus =
                    !selectedStatus ||
                    status ===
                    selectedStatus;


                let matchesDate =
                    true;


                if (
                    selectedDate
                ) {

                    const purchaseDate =
                        new Date(
                            purchase.date ||
                            purchase.createdAt
                        );


                    if (
                        !Number.isNaN(
                            purchaseDate.getTime()
                        )
                    ) {

                        const formatted =
                            purchaseDate
                                .toISOString()
                                .split(
                                    "T"
                                )[0];


                        matchesDate =
                            formatted ===
                            selectedDate;

                    }

                }


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );

            }
        );


    currentPurchasePage =
        1;


    sortPurchases();

    renderPurchases();

}


/* =========================================================
   9. SORT PURCHASES
========================================================= */

function sortPurchases() {

    filteredPurchases.sort(
        (
            a,
            b
        ) =>
            new Date(
                b.date ||
                b.createdAt
            ) -
            new Date(
                a.date ||
                a.createdAt
            )
    );

}


/* =========================================================
   10. OPEN PURCHASE FORM
========================================================= */

function openPurchaseForm() {

    const modal =
        document.getElementById(
            "purchaseModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

        return;

    }


    window.location.href =
        "purchases.html#new-purchase";

}


/* =========================================================
   11. HANDLE PURCHASE FORM
========================================================= */

function handlePurchaseSubmit(
    event
) {

    event.preventDefault();


    const productId =
        getPurchaseInput([
            "purchaseProduct",
            "productSelect"
        ]);


    const quantity =
        Number(
            getPurchaseInput([
                "purchaseQuantity",
                "quantity"
            ])
        );


    const price =
        Number(
            getPurchaseInput([
                "purchasePrice",
                "price"
            ])
        );


    const supplier =
        getPurchaseInput([
            "purchaseSupplier",
            "supplierName"
        ]) ||
        "Unknown Supplier";


    const paymentMethod =
        getPurchaseInput([
            "paymentMethod"
        ]) ||
        "Cash";


    const status =
        getPurchaseInput([
            "purchaseStatus",
            "status"
        ]) ||
        "Completed";


    if (!productId) {

        showPurchaseMessage(
            "Please select a product.",
            "error"
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        showPurchaseMessage(
            "Please enter a valid quantity.",
            "error"
        );

        return;

    }


    if (
        price < 0 ||
        Number.isNaN(
            price
        )
    ) {

        showPurchaseMessage(
            "Please enter a valid purchase price.",
            "error"
        );

        return;

    }


    const product =
        InventoryStorage
            .getProducts()
            .find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
            );


    if (!product) {

        showPurchaseMessage(
            "Product not found.",
            "error"
        );

        return;

    }


    const subtotal =
        quantity *
        price;


    const tax =
        calculatePurchaseTax(
            subtotal
        );


    const discount =
        Number(
            getPurchaseInput([
                "purchaseDiscount",
                "discount"
            ]) ||
            0
        );


    const total =
        Math.max(
            0,
            subtotal +
            tax -
            discount
        );


    const purchase = {

        id:
            generatePurchaseId(),

        invoice:
            generatePurchaseNumber(),

        supplier:
            supplier,

        items: [

            {

                productId:
                    product.id,

                productName:
                    product.name,

                sku:
                    product.sku ||
                    "",

                quantity:
                    quantity,

                price:
                    price,

                subtotal:
                    subtotal

            }

        ],

        subtotal:
            subtotal,

        tax:
            tax,

        discount:
            discount,

        total:
            total,

        paymentMethod:
            paymentMethod,

        status:
            status,

        date:
            new Date()
                .toISOString(),

        createdAt:
            new Date()
                .toISOString()

    };


    try {

        /*
           Save purchase.
        */

        InventoryStorage
            .addPurchase(
                purchase
            );


        /*
           Increase stock.
        */

        InventoryStorage
            .updateProductStock(
                product.id,
                quantity
            );


        /*
           Record activity.
        */

        if (
            typeof InventoryStorage
                .addActivity ===
            "function"
        ) {

            InventoryStorage
                .addActivity({

                    title:
                        "New Purchase",

                    description:
                        `${quantity} × ${product.name} purchased for ${formatPurchaseCurrency(total)}.`,

                    timestamp:
                        new Date()
                            .toISOString()

                });

        }


        showPurchaseMessage(
            "Purchase recorded successfully.",
            "success"
        );


        event.target.reset();


        loadPurchases();

        loadPurchaseProducts();

        updatePurchaseStatistics();


        closePurchaseModal();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showPurchaseMessage(
            "Unable to record purchase.",
            "error"
        );

    }

}


/* =========================================================
   12. CALCULATE TAX
========================================================= */

function calculatePurchaseTax(
    subtotal
) {

    const taxInput =
        findFirstElement([
            "purchaseTax",
            "tax"
        ]);


    if (!taxInput) {

        return 0;

    }


    const taxRate =
        Number(
            taxInput.value ||
            0
        );


    return (
        subtotal *
        taxRate /
        100
    );

}


/* =========================================================
   13. CALCULATE PURCHASE TOTAL
========================================================= */

function calculatePurchaseTotal() {

    const quantity =
        Number(
            getPurchaseInput([
                "purchaseQuantity",
                "quantity"
            ]) ||
            0
        );


    const price =
        Number(
            getPurchaseInput([
                "purchasePrice",
                "price"
            ]) ||
            0
        );


    const subtotal =
        quantity *
        price;


    const tax =
        calculatePurchaseTax(
            subtotal
        );


    const discount =
        Number(
            getPurchaseInput([
                "purchaseDiscount",
                "discount"
            ]) ||
            0
        );


    const total =
        Math.max(
            0,
            subtotal +
            tax -
            discount
        );


    setPurchaseText(
        [
            "purchaseSubtotal",
            "subtotal"
        ],
        formatPurchaseCurrency(
            subtotal
        )
    );


    setPurchaseText(
        [
            "purchaseTaxAmount",
            "taxAmount"
        ],
        formatPurchaseCurrency(
            tax
        )
    );


    setPurchaseText(
        [
            "purchaseTotal",
            "totalAmount"
        ],
        formatPurchaseCurrency(
            total
        )
    );

}


/* =========================================================
   14. UPDATE PURCHASE PRODUCT
========================================================= */

function updatePurchaseProduct() {

    const productId =
        getPurchaseInput([
            "purchaseProduct",
            "productSelect"
        ]);


    const product =
        InventoryStorage
            .getProducts()
            .find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
            );


    if (!product) {

        return;

    }


    const purchasePrice =
        Number(
            product.purchasePrice ||
            product.costPrice ||
            product.price ||
            0
        );


    setPurchaseInputValue(
        [
            "purchasePrice",
            "price"
        ],
        purchasePrice
    );


    setPurchaseText(
        [
            "productSKU",
            "purchaseProductSKU"
        ],
        product.sku ||
        "-"
    );


    calculatePurchaseTotal();

}


/* =========================================================
   15. VIEW PURCHASE
========================================================= */

function viewPurchase(
    purchaseId
) {

    const purchase =
        findPurchaseById(
            purchaseId
        );


    if (!purchase) {

        showPurchaseMessage(
            "Purchase not found.",
            "error"
        );

        return;

    }


    const modal =
        document.getElementById(
            "purchaseViewModal"
        );


    if (
        modal &&
        modal.querySelector(
            ".modal-body"
        )
    ) {

        modal
            .querySelector(
                ".modal-body"
            )
            .innerHTML =
                createPurchaseDetailsHTML(
                    purchase
                );


        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

        return;

    }


    alert(
        createPurchaseDetailsText(
            purchase
        )
    );

}


/* =========================================================
   16. PURCHASE DETAILS HTML
========================================================= */

function createPurchaseDetailsHTML(
    purchase
) {

    const items =
        purchase.items ||
        [];


    return `

        <div class="invoice">

            <div class="invoice-header">

                <div>

                    <h2>
                        PURCHASE
                    </h2>

                    <p>
                        ${escapePurchaseHTML(
                            purchase.invoice ||
                            purchase.invoiceNumber ||
                            purchase.id
                        )}
                    </p>

                </div>


                <div>

                    <p>
                        ${formatPurchaseDate(
                            purchase.date ||
                            purchase.createdAt
                        )}
                    </p>

                </div>

            </div>


            <div class="invoice-customer">

                <strong>
                    Supplier
                </strong>

                <p>
                    ${escapePurchaseHTML(
                        purchase.supplier ||
                        purchase.supplierName ||
                        "Unknown Supplier"
                    )}
                </p>

            </div>


            <table class="invoice-table">

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${items.map(
                        item =>
                            `

                            <tr>

                                <td>
                                    ${escapePurchaseHTML(
                                        item.productName
                                    )}
                                </td>

                                <td>
                                    ${formatPurchaseNumber(
                                        item.quantity
                                    )}
                                </td>

                                <td>
                                    ${formatPurchaseCurrency(
                                        item.price
                                    )}
                                </td>

                                <td>
                                    ${formatPurchaseCurrency(
                                        item.subtotal
                                    )}
                                </td>

                            </tr>

                            `
                    ).join("")}

                </tbody>

            </table>


            <div class="invoice-summary">

                <p>

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatPurchaseCurrency(
                            purchase.subtotal
                        )}
                    </strong>

                </p>


                <p>

                    <span>
                        Tax
                    </span>

                    <strong>
                        ${formatPurchaseCurrency(
                            purchase.tax
                        )}
                    </strong>

                </p>


                <p>

                    <span>
                        Discount
                    </span>

                    <strong>
                        ${formatPurchaseCurrency(
                            purchase.discount
                        )}
                    </strong>

                </p>


                <p class="invoice-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatPurchaseCurrency(
                            purchase.total
                        )}
                    </strong>

                </p>

            </div>


            <div class="invoice-payment">

                Payment Method:
                ${escapePurchaseHTML(
                    purchase.paymentMethod ||
                    "Cash"
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   17. PURCHASE DETAILS TEXT
========================================================= */

function createPurchaseDetailsText(
    purchase
) {

    let text =

        `PURCHASE\n\n` +

        `Purchase: ${
            purchase.invoice ||
            purchase.invoiceNumber ||
            purchase.id
        }\n` +

        `Supplier: ${
            purchase.supplier ||
            purchase.supplierName ||
            "Unknown Supplier"
        }\n` +

        `Date: ${
            formatPurchaseDate(
                purchase.date ||
                purchase.createdAt
            )
        }\n\n`;


    (
        purchase.items ||
        []
    ).forEach(
        item => {

            text +=
                `${item.productName} × ${item.quantity} = ${formatPurchaseCurrency(item.subtotal)}\n`;

        }
    );


    text +=

        `\nSubtotal: ${formatPurchaseCurrency(purchase.subtotal)}` +

        `\nTax: ${formatPurchaseCurrency(purchase.tax)}` +

        `\nDiscount: ${formatPurchaseCurrency(purchase.discount)}` +

        `\nTotal: ${formatPurchaseCurrency(purchase.total)}`;


    return text;

}


/* =========================================================
   18. PRINT PURCHASE
========================================================= */

function printPurchase(
    purchaseId
) {

    const purchase =
        findPurchaseById(
            purchaseId
        );


    if (!purchase) {

        showPurchaseMessage(
            "Purchase not found.",
            "error"
        );

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        showPurchaseMessage(
            "Please allow pop-ups to print the purchase.",
            "warning"
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Purchase ${
                    escapePurchaseHTML(
                        purchase.invoice ||
                        purchase.id
                    )
                }
            </title>


            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:
                        40px;

                    color:
                        #222;

                }


                .invoice {

                    max-width:
                        800px;

                    margin:
                        auto;

                }


                .invoice-header {

                    display:
                        flex;

                    justify-content:
                        space-between;

                    border-bottom:
                        2px solid #222;

                    padding-bottom:
                        20px;

                    margin-bottom:
                        25px;

                }


                table {

                    width:
                        100%;

                    border-collapse:
                        collapse;

                    margin-top:
                        25px;

                }


                th,
                td {

                    border:
                        1px solid #ddd;

                    padding:
                        10px;

                    text-align:
                        left;

                }


                th {

                    background:
                        #f5f5f5;

                }


                .summary {

                    margin-top:
                        25px;

                    margin-left:
                        auto;

                    width:
                        300px;

                }


                .summary p {

                    display:
                        flex;

                    justify-content:
                        space-between;

                }


                .total {

                    font-size:
                        20px;

                    border-top:
                        2px solid #222;

                    padding-top:
                        10px;

                }

            </style>

        </head>


        <body>

            <div class="invoice">

                <div class="invoice-header">

                    <div>

                        <h1>
                            PURCHASE
                        </h1>

                        <p>
                            ${
                                escapePurchaseHTML(
                                    purchase.invoice ||
                                    purchase.invoiceNumber ||
                                    purchase.id
                                )
                            }
                        </p>

                    </div>


                    <div>

                        <p>
                            ${
                                formatPurchaseDate(
                                    purchase.date ||
                                    purchase.createdAt
                                )
                            }
                        </p>

                    </div>

                </div>


                <h3>
                    Supplier
                </h3>


                <p>
                    ${
                        escapePurchaseHTML(
                            purchase.supplier ||
                            purchase.supplierName ||
                            "Unknown Supplier"
                        )
                    }
                </p>


                <table>

                    <thead>

                        <tr>

                            <th>
                                Product
                            </th>

                            <th>
                                Quantity
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            (
                                purchase.items ||
                                []
                            )
                                .map(
                                    item =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapePurchaseHTML(
                                                    item.productName
                                                )}
                                            </td>

                                            <td>
                                                ${item.quantity}
                                            </td>

                                            <td>
                                                ${formatPurchaseCurrency(
                                                    item.price
                                                )}
                                            </td>

                                            <td>
                                                ${formatPurchaseCurrency(
                                                    item.subtotal
                                                )}
                                            </td>

                                        </tr>

                                        `
                                )
                                .join("")
                        }

                    </tbody>

                </table>


                <div class="summary">

                    <p>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${formatPurchaseCurrency(
                                purchase.subtotal
                            )}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Tax
                        </span>

                        <strong>
                            ${formatPurchaseCurrency(
                                purchase.tax
                            )}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Discount
                        </span>

                        <strong>
                            ${formatPurchaseCurrency(
                                purchase.discount
                            )}
                        </strong>

                    </p>


                    <p class="total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${formatPurchaseCurrency(
                                purchase.total
                            )}
                        </strong>

                    </p>

                </div>

            </div>


            <script>

                window.onload =
                    function () {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* =========================================================
   19. DELETE PURCHASE
========================================================= */

function deletePurchase(
    purchaseId
) {

    const purchase =
        findPurchaseById(
            purchaseId
        );


    if (!purchase) {

        showPurchaseMessage(
            "Purchase not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete purchase ${
                purchase.invoice ||
                purchase.id
            }?`
        );


    if (!confirmed) {

        return;

    }


    try {

        /*
           Remove the purchased
           quantity from inventory.
        */

        (
            purchase.items ||
            []
        ).forEach(
            item => {

                if (
                    typeof InventoryStorage
                        .updateProductStock ===
                    "function"
                ) {

                    InventoryStorage
                        .updateProductStock(
                            item.productId,
                            -Number(
                                item.quantity ||
                                0
                            )
                        );

                }

            }
        );


        InventoryStorage
            .deletePurchase(
                purchaseId
            );


        if (
            typeof InventoryStorage
                .addActivity ===
            "function"
        ) {

            InventoryStorage
                .addActivity({

                    title:
                        "Purchase Deleted",

                    description:
                        `Purchase ${
                            purchase.invoice ||
                            purchase.id
                        } was deleted.`,

                    timestamp:
                        new Date()
                            .toISOString()

                });

        }


        showPurchaseMessage(
            "Purchase deleted successfully.",
            "success"
        );


        loadPurchases();

        loadPurchaseProducts();

        updatePurchaseStatistics();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showPurchaseMessage(
            "Unable to delete purchase.",
            "error"
        );

    }

}


/* =========================================================
   20. PURCHASE STATISTICS
========================================================= */

function updatePurchaseStatistics() {

    const totalPurchases =
        allPurchases.length;


    const totalCost =
        allPurchases.reduce(
            (
                total,
                purchase
            ) =>
                total +
                Number(
                    purchase.total ||
                    0
                ),
            0
        );


    const completed =
        allPurchases.filter(
            purchase =>
                (
                    purchase.status ||
                    purchase.paymentStatus ||
                    "Completed"
                )
                    .toLowerCase() ===
                "completed"
        );


    const pending =
        allPurchases.filter(
            purchase =>
                (
                    purchase.status ||
                    purchase.paymentStatus ||
                    ""
                )
                    .toLowerCase() ===
                "pending"
        );


    const averagePurchase =
        totalPurchases > 0
            ? totalCost /
              totalPurchases
            : 0;


    setPurchaseText(
        [
            "totalPurchases",
            "purchasesCount"
        ],
        formatPurchaseNumber(
            totalPurchases
        )
    );


    setPurchaseText(
        [
            "purchaseCost",
            "totalPurchaseCost",
            "purchasesTotal"
        ],
        formatPurchaseCurrency(
            totalCost
        )
    );


    setPurchaseText(
        [
            "completedPurchases"
        ],
        formatPurchaseNumber(
            completed.length
        )
    );


    setPurchaseText(
        [
            "pendingPurchases"
        ],
        formatPurchaseNumber(
            pending.length
        )
    );


    setPurchaseText(
        [
            "averagePurchase"
        ],
        formatPurchaseCurrency(
            averagePurchase
        )
    );

}


/* =========================================================
   21. PAGINATION
========================================================= */

function updatePurchasePagination() {

    const pagination =
        findFirstElement([
            "purchasesPagination",
            "purchasePagination",
            "pagination"
        ]);


    if (!pagination) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredPurchases.length /
            purchasesRowsPerPage
        );


    pagination.innerHTML =
        "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    const previous =
        document.createElement(
            "button"
        );


    previous.innerHTML =
        `<i class="fas fa-chevron-left"></i>`;


    previous.disabled =
        currentPurchasePage ===
        1;


    previous.onclick =
        function () {

            if (
                currentPurchasePage >
                1
            ) {

                currentPurchasePage--;

                renderPurchases();

            }

        };


    pagination.appendChild(
        previous
    );


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            i;


        if (
            i ===
            currentPurchasePage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                currentPurchasePage =
                    i;

                renderPurchases();

            };


        pagination.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.innerHTML =
        `<i class="fas fa-chevron-right"></i>`;


    next.disabled =
        currentPurchasePage ===
        totalPages;


    next.onclick =
        function () {

            if (
                currentPurchasePage <
                totalPages
            ) {

                currentPurchasePage++;

                renderPurchases();

            }

        };


    pagination.appendChild(
        next
    );

}


/* =========================================================
   22. CLEAR FILTERS
========================================================= */

function clearPurchaseFilters() {

    const search =
        findFirstElement([
            "purchaseSearch",
            "purchasesSearch",
            "purchase-search",
            "searchPurchases"
        ]);


    const status =
        findFirstElement([
            "purchaseStatusFilter",
            "purchasesStatusFilter",
            "purchase-status-filter"
        ]);


    const date =
        findFirstElement([
            "purchaseDateFilter",
            "purchasesDateFilter",
            "purchase-date-filter"
        ]);


    if (search) {

        search.value =
            "";

    }


    if (status) {

        status.value =
            "";

    }


    if (date) {

        date.value =
            "";

    }


    currentPurchasePage =
        1;


    filteredPurchases =
        [...allPurchases];


    sortPurchases();

    renderPurchases();

}


/* =========================================================
   23. EXPORT PURCHASES
========================================================= */

function exportPurchases() {

    if (
        filteredPurchases.length ===
        0
    ) {

        showPurchaseMessage(
            "No purchases available for export.",
            "warning"
        );

        return;

    }


    const headers = [

        "Purchase Number",

        "Supplier",

        "Items",

        "Subtotal",

        "Tax",

        "Discount",

        "Total",

        "Payment Method",

        "Status",

        "Date"

    ];


    const rows =
        filteredPurchases.map(
            purchase => {

                const itemCount =
                    (
                        purchase.items ||
                        []
                    ).reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.quantity ||
                                0
                            ),
                        0
                    );


                return [

                    purchase.invoice ||
                        purchase.invoiceNumber ||
                        purchase.id,

                    purchase.supplier ||
                        purchase.supplierName ||
                        "Unknown Supplier",

                    itemCount,

                    purchase.subtotal ||
                        0,

                    purchase.tax ||
                        0,

                    purchase.discount ||
                        0,

                    purchase.total ||
                        0,

                    purchase.paymentMethod ||
                        "Cash",

                    purchase.status ||
                        purchase.paymentStatus ||
                        "Completed",

                    formatPurchaseDate(
                        purchase.date ||
                        purchase.createdAt
                    )

                ];

            }
        );


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
                                    value ??
                                    ""
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
            [
                csv
            ],
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
        `purchases-${getPurchaseFileDate()}.csv`;


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


    showPurchaseMessage(
        "Purchases exported successfully.",
        "success"
    );

}


/* =========================================================
   24. CLOSE MODAL
========================================================= */

function closePurchaseModal() {

    const modal =
        document.getElementById(
            "purchaseModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    modal.style.display =
        "none";

}


/* =========================================================
   25. FIND PURCHASE
========================================================= */

function findPurchaseById(
    purchaseId
) {

    return allPurchases.find(
        purchase =>
            String(
                purchase.id
            ) ===
            String(
                purchaseId
            )
    );

}


/* =========================================================
   26. GENERATE PURCHASE ID
========================================================= */

function generatePurchaseId() {

    return (
        "PUR-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() *
            1000
        )
    );

}


/* =========================================================
   27. GENERATE PURCHASE NUMBER
========================================================= */

function generatePurchaseNumber() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const random =
        Math.floor(
            Math.random() *
            9000
        ) +
        1000;


    return (
        `PUR-${year}${month}-${random}`
    );

}


/* =========================================================
   28. FIND FIRST ELEMENT
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
   29. GET INPUT
========================================================= */

function getPurchaseInput(
    ids
) {

    const element =
        findFirstElement(
            ids
        );


    return element
        ? element.value
        : "";

}


/* =========================================================
   30. SET INPUT VALUE
========================================================= */

function setPurchaseInputValue(
    ids,
    value
) {

    const element =
        findFirstElement(
            ids
        );


    if (element) {

        element.value =
            value;

    }

}


/* =========================================================
   31. SET TEXT
========================================================= */

function setPurchaseText(
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
   32. FORMAT NUMBER
========================================================= */

function formatPurchaseNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   33. FORMAT CURRENCY
========================================================= */

function formatPurchaseCurrency(
    amount
) {

    let currency =
        "₹";


    if (
        typeof InventoryStorage !==
        "undefined" &&
        typeof InventoryStorage
            .getSettings ===
        "function"
    ) {

        const settings =
            InventoryStorage
                .getSettings();


        currency =
            settings.currency ||
            "₹";

    }


    return (
        currency +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        )
    );

}


/* =========================================================
   34. STATUS CLASS
========================================================= */

function getPurchaseStatusClass(
    status
) {

    const value =
        String(
            status ||
            ""
        )
            .toLowerCase();


    if (
        value ===
        "completed" ||
        value ===
        "paid" ||
        value ===
        "received"
    ) {

        return "status-success";

    }


    if (
        value ===
        "pending" ||
        value ===
        "processing"
    ) {

        return "status-warning";

    }


    if (
        value ===
        "cancelled" ||
        value ===
        "failed"
    ) {

        return "status-danger";

    }


    return "status-neutral";

}


/* =========================================================
   35. FORMAT DATE
========================================================= */

function formatPurchaseDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
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
   36. FILE DATE
========================================================= */

function getPurchaseFileDate() {

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
   37. MESSAGE
========================================================= */

function showPurchaseMessage(
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
   38. ESCAPE HTML
========================================================= */

function escapePurchaseHTML(
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
   39. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadPurchases();

            loadPurchaseProducts();

            updatePurchaseStatistics();

        }

    },
    60000
);


/* =========================================================
   40. PUBLIC PURCHASE API
========================================================= */

window.InventoryPurchases = {

    initialize:
        initializePurchases,

    load:
        loadPurchases,

    refresh:
        loadPurchases,

    filter:
        applyPurchaseFilters,

    clearFilters:
        clearPurchaseFilters,

    view:
        viewPurchase,

    print:
        printPurchase,

    delete:
        deletePurchase,

    export:
        exportPurchases,

    recordPurchase:
        handlePurchaseSubmit

};


/* =========================================================
   END OF PURCHASES.JS
========================================================= */