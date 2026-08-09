/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   SALES JAVASCRIPT
   File: js/sales.js

   Features:
   - Load sales
   - Display sales
   - Search sales
   - Filter by date
   - Filter by payment status
   - Record new sale
   - Automatically reduce product stock
   - Calculate totals
   - View invoice
   - Delete sale
   - Export sales to CSV
   - Sales statistics
   - Pagination
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let allSales = [];

let filteredSales = [];

let currentSalesPage = 1;

let salesRowsPerPage = 10;


/* =========================================================
   2. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSales();

    }
);


function initializeSales() {

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not loaded."
        );

        return;

    }


    loadSales();

    loadSaleProducts();

    setupSalesEvents();

    updateSalesStatistics();

}


/* =========================================================
   3. LOAD SALES
========================================================= */

function loadSales() {

    allSales =
        InventoryStorage
            .getSales() || [];


    filteredSales =
        [...allSales];


    sortSales();

    renderSales();

}


/* =========================================================
   4. RENDER SALES
========================================================= */

function renderSales() {

    const tableBody =
        findFirstElement([
            "salesTableBody",
            "saleTableBody",
            "sales-table-body"
        ]);


    if (!tableBody) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredSales.length /
            salesRowsPerPage
        );


    if (
        currentSalesPage >
        totalPages &&
        totalPages > 0
    ) {

        currentSalesPage =
            totalPages;

    }


    const start =
        (
            currentSalesPage -
            1
        ) *
        salesRowsPerPage;


    const end =
        start +
        salesRowsPerPage;


    const salesToShow =
        filteredSales.slice(
            start,
            end
        );


    if (
        salesToShow.length ===
        0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-receipt"></i>

                        <h3>
                            No Sales Found
                        </h3>

                        <p>
                            No sales match your
                            current filters.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        updateSalesPagination();

        return;

    }


    tableBody.innerHTML =
        salesToShow
            .map(
                sale =>
                    createSaleRow(
                        sale
                    )
            )
            .join("");


    updateSalesPagination();

}


/* =========================================================
   5. CREATE SALE ROW
========================================================= */

function createSaleRow(
    sale
) {

    const invoice =
        sale.invoice ||
        sale.invoiceNumber ||
        sale.id ||
        "-";


    const customer =
        sale.customer ||
        "Walk-in Customer";


    const items =
        sale.items ||
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
            sale.total ||
            0
        );


    const paymentMethod =
        sale.paymentMethod ||
        "Cash";


    const paymentStatus =
        sale.paymentStatus ||
        sale.status ||
        "Paid";


    const date =
        formatDate(
            sale.date ||
            sale.createdAt
        );


    return `

        <tr
            data-sale-id="${escapeHTML(
                sale.id
            )}"
        >

            <td>

                <strong>
                    ${escapeHTML(
                        invoice
                    )}
                </strong>

            </td>


            <td>
                ${escapeHTML(
                    customer
                )}
            </td>


            <td>
                ${formatNumber(
                    itemCount
                )}
            </td>


            <td>
                ${formatCurrency(
                    total
                )}
            </td>


            <td>

                <span class="payment-method">

                    ${escapeHTML(
                        paymentMethod
                    )}

                </span>

            </td>


            <td>

                <span
                    class="status-badge ${getPaymentStatusClass(
                        paymentStatus
                    )}"
                >

                    ${escapeHTML(
                        paymentStatus
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
                        title="View Invoice"
                        data-sale-action="view"
                        data-id="${escapeHTML(
                            sale.id
                        )}"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn print-btn"
                        title="Print Invoice"
                        data-sale-action="print"
                        data-id="${escapeHTML(
                            sale.id
                        )}"
                    >

                        <i class="fas fa-print"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Sale"
                        data-sale-action="delete"
                        data-id="${escapeHTML(
                            sale.id
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
   6. LOAD PRODUCTS FOR SALE FORM
========================================================= */

function loadSaleProducts() {

    const products =
        InventoryStorage
            .getProducts() || [];


    const productSelects =
        document.querySelectorAll(
            "#saleProduct, #productSelect, .sale-product-select"
        );


    productSelects.forEach(
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


            products
                .filter(
                    product =>
                        Number(
                            product.stock ||
                            0
                        ) > 0
                )
                .forEach(
                    product => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            product.id;


                        option.textContent =
                            `${product.name} — Stock: ${product.stock}`;


                        select.appendChild(
                            option
                        );

                    }
                );

        }
    );

}


/* =========================================================
   7. SALES EVENTS
========================================================= */

function setupSalesEvents() {

    /*
       Search
    */

    const search =
        findFirstElement([
            "salesSearch",
            "sales-search",
            "searchSales"
        ]);


    if (search) {

        search.addEventListener(
            "input",
            applySalesFilters
        );

    }


    /*
       Payment filter
    */

    const paymentFilter =
        findFirstElement([
            "paymentFilter",
            "payment-filter",
            "salesStatusFilter"
        ]);


    if (paymentFilter) {

        paymentFilter.addEventListener(
            "change",
            applySalesFilters
        );

    }


    /*
       Date filter
    */

    const dateFilter =
        findFirstElement([
            "salesDateFilter",
            "sales-date-filter"
        ]);


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            applySalesFilters
        );

    }


    /*
       Add sale button
    */

    document
        .querySelectorAll(
            "#addSaleBtn, .add-sale-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    openSaleForm
                );

            }
        );


    /*
       Export
    */

    document
        .querySelectorAll(
            "#exportSales, .export-sales"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportSales
                );

            }
        );


    /*
       Clear filters
    */

    document
        .querySelectorAll(
            "#clearSalesFilters, .clear-sales-filters"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    clearSalesFilters
                );

            }
        );


    /*
       Table action buttons
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-sale-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.saleAction;


            const saleId =
                button.dataset.id;


            if (
                action ===
                "view"
            ) {

                viewSale(
                    saleId
                );

            }


            if (
                action ===
                "print"
            ) {

                printSale(
                    saleId
                );

            }


            if (
                action ===
                "delete"
            ) {

                deleteSale(
                    saleId
                );

            }

        }
    );


    /*
       Sale form
    */

    const saleForm =
        document.getElementById(
            "saleForm"
        );


    if (saleForm) {

        saleForm.addEventListener(
            "submit",
            handleSaleSubmit
        );

    }


    /*
       Quantity changes
    */

    document
        .querySelectorAll(
            "#saleQuantity, #quantity"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    calculateSaleTotal
                );

            }
        );


    /*
       Product changes
    */

    document
        .querySelectorAll(
            "#saleProduct, #productSelect"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    updateSaleProductPrice
                );

            }
        );

}


/* =========================================================
   8. APPLY SALES FILTERS
========================================================= */

function applySalesFilters() {

    const search =
        findFirstElement([
            "salesSearch",
            "sales-search",
            "searchSales"
        ]);


    const paymentFilter =
        findFirstElement([
            "paymentFilter",
            "payment-filter",
            "salesStatusFilter"
        ]);


    const dateFilter =
        findFirstElement([
            "salesDateFilter",
            "sales-date-filter"
        ]);


    const searchTerm =
        (
            search?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const paymentStatus =
        paymentFilter?.value ||
        "";


    const selectedDate =
        dateFilter?.value ||
        "";


    filteredSales =
        allSales.filter(
            sale => {

                const searchable =
                    [

                        sale.invoice,

                        sale.invoiceNumber,

                        sale.customer,

                        sale.paymentMethod

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
                    sale.paymentStatus ||
                    sale.status ||
                    "Paid";


                const matchesPayment =
                    !paymentStatus ||
                    status ===
                    paymentStatus;


                let matchesDate =
                    true;


                if (
                    selectedDate
                ) {

                    const saleDate =
                        new Date(
                            sale.date ||
                            sale.createdAt
                        );


                    const formatted =
                        saleDate
                            .toISOString()
                            .split("T")[0];


                    matchesDate =
                        formatted ===
                        selectedDate;

                }


                return (
                    matchesSearch &&
                    matchesPayment &&
                    matchesDate
                );

            }
        );


    currentSalesPage =
        1;


    sortSales();

    renderSales();

}


/* =========================================================
   9. SORT SALES
========================================================= */

function sortSales() {

    filteredSales.sort(
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
   10. OPEN SALE FORM
========================================================= */

function openSaleForm() {

    const modal =
        document.getElementById(
            "saleModal"
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
        "sales.html#new-sale";

}


/* =========================================================
   11. HANDLE SALE FORM
========================================================= */

function handleSaleSubmit(
    event
) {

    event.preventDefault();


    const productId =
        getInputValue([
            "saleProduct",
            "productSelect"
        ]);


    const quantity =
        Number(
            getInputValue([
                "saleQuantity",
                "quantity"
            ])
        );


    const customer =
        getInputValue([
            "saleCustomer",
            "customerName"
        ]) ||
        "Walk-in Customer";


    const paymentMethod =
        getInputValue([
            "paymentMethod"
        ]) ||
        "Cash";


    const paymentStatus =
        getInputValue([
            "paymentStatus"
        ]) ||
        "Paid";


    if (!productId) {

        showMessage(
            "Please select a product.",
            "error"
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        showMessage(
            "Please enter a valid quantity.",
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

        showMessage(
            "Product not found.",
            "error"
        );

        return;

    }


    const currentStock =
        Number(
            product.stock ||
            0
        );


    if (
        quantity >
        currentStock
    ) {

        showMessage(
            `Only ${currentStock} units are available.`,
            "error"
        );

        return;

    }


    const price =
        Number(
            product.sellingPrice ||
            product.price ||
            0
        );


    const subtotal =
        price *
        quantity;


    const tax =
        calculateTax(
            subtotal
        );


    const discount =
        Number(
            getInputValue([
                "saleDiscount",
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


    const sale = {

        id:
            generateSaleId(),

        invoice:
            generateInvoiceNumber(),

        customer:
            customer,

        items: [

            {

                productId:
                    product.id,

                productName:
                    product.name,

                sku:
                    product.sku,

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

        paymentStatus:
            paymentStatus,

        date:
            new Date()
                .toISOString(),

        createdAt:
            new Date()
                .toISOString()

    };


    try {

        /*
           Save sale.
        */

        InventoryStorage
            .addSale(
                sale
            );


        /*
           Reduce inventory.
        */

        InventoryStorage
            .updateProductStock(
                product.id,
                -quantity
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
                        "New Sale",

                    description:
                        `${quantity} × ${product.name} sold for ${formatCurrency(total)}.`,

                    timestamp:
                        new Date()
                            .toISOString()

                });

        }


        showMessage(
            "Sale recorded successfully.",
            "success"
        );


        event.target.reset();


        loadSales();

        loadSaleProducts();

        updateSalesStatistics();


        closeSaleModal();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showMessage(
            "Unable to record sale.",
            "error"
        );

    }

}


/* =========================================================
   12. CALCULATE TAX
========================================================= */

function calculateTax(
    subtotal
) {

    const taxInput =
        findFirstElement([
            "saleTax",
            "tax"
        ]);


    if (!taxInput) {

        return 0;

    }


    const taxValue =
        Number(
            taxInput.value ||
            0
        );


    /*
       If value is 18,
       treat it as 18%.
    */

    return (
        subtotal *
        taxValue /
        100
    );

}


/* =========================================================
   13. CALCULATE SALE TOTAL
========================================================= */

function calculateSaleTotal() {

    const productId =
        getInputValue([
            "saleProduct",
            "productSelect"
        ]);


    const quantity =
        Number(
            getInputValue([
                "saleQuantity",
                "quantity"
            ]) ||
            0
        );


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


    const price =
        Number(
            product.sellingPrice ||
            product.price ||
            0
        );


    const subtotal =
        price *
        quantity;


    const tax =
        calculateTax(
            subtotal
        );


    const discount =
        Number(
            getInputValue([
                "saleDiscount",
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


    setText(
        [
            "saleSubtotal",
            "subtotal"
        ],
        formatCurrency(
            subtotal
        )
    );


    setText(
        [
            "saleTaxAmount",
            "taxAmount"
        ],
        formatCurrency(
            tax
        )
    );


    setText(
        [
            "saleTotal",
            "totalAmount"
        ],
        formatCurrency(
            total
        )
    );

}


/* =========================================================
   14. UPDATE PRODUCT PRICE
========================================================= */

function updateSaleProductPrice() {

    const productId =
        getInputValue([
            "saleProduct",
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


    const price =
        Number(
            product.sellingPrice ||
            product.price ||
            0
        );


    setInputValue(
        [
            "salePrice",
            "price"
        ],
        price
    );


    setText(
        [
            "availableStock",
            "saleAvailableStock"
        ],
        formatNumber(
            product.stock
        )
    );


    calculateSaleTotal();

}


/* =========================================================
   15. VIEW SALE
========================================================= */

function viewSale(
    saleId
) {

    const sale =
        findSaleById(
            saleId
        );


    if (!sale) {

        showMessage(
            "Sale not found.",
            "error"
        );

        return;

    }


    const modal =
        document.getElementById(
            "saleViewModal"
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
                createInvoiceHTML(
                    sale
                );


        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

        return;

    }


    alert(
        createInvoiceText(
            sale
        )
    );

}


/* =========================================================
   16. CREATE INVOICE HTML
========================================================= */

function createInvoiceHTML(
    sale
) {

    const items =
        sale.items || [];


    return `

        <div class="invoice">

            <div class="invoice-header">

                <div>

                    <h2>
                        INVOICE
                    </h2>

                    <p>
                        ${escapeHTML(
                            sale.invoice ||
                            sale.invoiceNumber ||
                            sale.id
                        )}
                    </p>

                </div>


                <div>

                    <p>
                        ${formatDate(
                            sale.date ||
                            sale.createdAt
                        )}
                    </p>

                </div>

            </div>


            <div class="invoice-customer">

                <strong>
                    Customer
                </strong>

                <p>
                    ${escapeHTML(
                        sale.customer ||
                        "Walk-in Customer"
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
                            Qty
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
                                    ${escapeHTML(
                                        item.productName
                                    )}
                                </td>

                                <td>
                                    ${formatNumber(
                                        item.quantity
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        item.price
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
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
                        ${formatCurrency(
                            sale.subtotal
                        )}
                    </strong>

                </p>


                <p>

                    <span>
                        Tax
                    </span>

                    <strong>
                        ${formatCurrency(
                            sale.tax
                        )}
                    </strong>

                </p>


                <p>

                    <span>
                        Discount
                    </span>

                    <strong>
                        ${formatCurrency(
                            sale.discount
                        )}
                    </strong>

                </p>


                <p class="invoice-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatCurrency(
                            sale.total
                        )}
                    </strong>

                </p>

            </div>


            <div class="invoice-payment">

                Payment:
                ${escapeHTML(
                    sale.paymentMethod ||
                    "Cash"
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   17. CREATE INVOICE TEXT
========================================================= */

function createInvoiceText(
    sale
) {

    const items =
        sale.items || [];


    let text =

        `INVOICE\n\n` +

        `Invoice: ${
            sale.invoice ||
            sale.invoiceNumber ||
            sale.id
        }\n` +

        `Customer: ${
            sale.customer ||
            "Walk-in Customer"
        }\n` +

        `Date: ${
            formatDate(
                sale.date ||
                sale.createdAt
            )
        }\n\n`;


    items.forEach(
        item => {

            text +=
                `${item.productName} × ${item.quantity} = ${formatCurrency(item.subtotal)}\n`;

        }
    );


    text +=

        `\nSubtotal: ${formatCurrency(sale.subtotal)}` +

        `\nTax: ${formatCurrency(sale.tax)}` +

        `\nDiscount: ${formatCurrency(sale.discount)}` +

        `\nTotal: ${formatCurrency(sale.total)}`;


    return text;

}


/* =========================================================
   18. PRINT SALE
========================================================= */

function printSale(
    saleId
) {

    const sale =
        findSaleById(
            saleId
        );


    if (!sale) {

        showMessage(
            "Sale not found.",
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

        showMessage(
            "Please allow pop-ups to print the invoice.",
            "warning"
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Invoice ${escapeHTML(
                    sale.invoice ||
                    sale.id
                )}
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
                            INVOICE
                        </h1>

                        <p>
                            ${
                                escapeHTML(
                                    sale.invoice ||
                                    sale.id
                                )
                            }
                        </p>

                    </div>

                    <div>

                        <p>
                            ${
                                formatDate(
                                    sale.date ||
                                    sale.createdAt
                                )
                            }
                        </p>

                    </div>

                </div>


                <h3>
                    Customer
                </h3>

                <p>
                    ${
                        escapeHTML(
                            sale.customer ||
                            "Walk-in Customer"
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
                                sale.items ||
                                []
                            )
                                .map(
                                    item =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(
                                                    item.productName
                                                )}
                                            </td>

                                            <td>
                                                ${item.quantity}
                                            </td>

                                            <td>
                                                ${formatCurrency(
                                                    item.price
                                                )}
                                            </td>

                                            <td>
                                                ${formatCurrency(
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
                            ${formatCurrency(
                                sale.subtotal
                            )}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Tax
                        </span>

                        <strong>
                            ${formatCurrency(
                                sale.tax
                            )}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Discount
                        </span>

                        <strong>
                            ${formatCurrency(
                                sale.discount
                            )}
                        </strong>

                    </p>


                    <p class="total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${formatCurrency(
                                sale.total
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
   19. DELETE SALE
========================================================= */

function deleteSale(
    saleId
) {

    const sale =
        findSaleById(
            saleId
        );


    if (!sale) {

        showMessage(
            "Sale not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete invoice ${
                sale.invoice ||
                sale.id
            }?`
        );


    if (!confirmed) {

        return;

    }


    try {

        /*
           Restore product stock before
           deleting the sale.
        */

        (
            sale.items ||
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
                            Number(
                                item.quantity ||
                                0
                            )
                        );

                }

            }
        );


        InventoryStorage
            .deleteSale(
                saleId
            );


        if (
            typeof InventoryStorage
                .addActivity ===
            "function"
        ) {

            InventoryStorage
                .addActivity({

                    title:
                        "Sale Deleted",

                    description:
                        `Invoice ${
                            sale.invoice ||
                            sale.id
                        } was deleted.`,

                    timestamp:
                        new Date()
                            .toISOString()

                });

        }


        showMessage(
            "Sale deleted successfully.",
            "success"
        );


        loadSales();

        loadSaleProducts();

        updateSalesStatistics();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showMessage(
            "Unable to delete sale.",
            "error"
        );

    }

}


/* =========================================================
   20. SALES STATISTICS
========================================================= */

function updateSalesStatistics() {

    const totalSales =
        allSales.length;


    const totalRevenue =
        allSales.reduce(
            (
                total,
                sale
            ) =>
                total +
                Number(
                    sale.total ||
                    0
                ),
            0
        );


    const paidSales =
        allSales.filter(
            sale =>
                (
                    sale.paymentStatus ||
                    sale.status ||
                    "Paid"
                )
                    .toLowerCase() ===
                "paid"
        );


    const pendingSales =
        allSales.filter(
            sale =>
                (
                    sale.paymentStatus ||
                    sale.status ||
                    ""
                )
                    .toLowerCase() ===
                "pending"
        );


    const averageSale =
        totalSales > 0
            ? totalRevenue /
              totalSales
            : 0;


    setText(
        [
            "totalSales",
            "salesCount"
        ],
        formatNumber(
            totalSales
        )
    );


    setText(
        [
            "salesRevenue",
            "totalRevenue",
            "salesTotal"
        ],
        formatCurrency(
            totalRevenue
        )
    );


    setText(
        [
            "paidSales"
        ],
        formatNumber(
            paidSales.length
        )
    );


    setText(
        [
            "pendingSales"
        ],
        formatNumber(
            pendingSales.length
        )
    );


    setText(
        [
            "averageSale"
        ],
        formatCurrency(
            averageSale
        )
    );

}


/* =========================================================
   21. PAGINATION
========================================================= */

function updateSalesPagination() {

    const pagination =
        findFirstElement([
            "salesPagination",
            "pagination"
        ]);


    if (!pagination) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredSales.length /
            salesRowsPerPage
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
        currentSalesPage ===
        1;


    previous.onclick =
        function () {

            if (
                currentSalesPage >
                1
            ) {

                currentSalesPage--;

                renderSales();

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
            currentSalesPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                currentSalesPage =
                    i;

                renderSales();

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
        currentSalesPage ===
        totalPages;


    next.onclick =
        function () {

            if (
                currentSalesPage <
                totalPages
            ) {

                currentSalesPage++;

                renderSales();

            }

        };


    pagination.appendChild(
        next
    );

}


/* =========================================================
   22. CLEAR FILTERS
========================================================= */

function clearSalesFilters() {

    const search =
        findFirstElement([
            "salesSearch",
            "sales-search",
            "searchSales"
        ]);


    const payment =
        findFirstElement([
            "paymentFilter",
            "payment-filter",
            "salesStatusFilter"
        ]);


    const date =
        findFirstElement([
            "salesDateFilter",
            "sales-date-filter"
        ]);


    if (search) {

        search.value =
            "";

    }


    if (payment) {

        payment.value =
            "";

    }


    if (date) {

        date.value =
            "";

    }


    currentSalesPage =
        1;


    filteredSales =
        [...allSales];


    sortSales();

    renderSales();

}


/* =========================================================
   23. EXPORT SALES
========================================================= */

function exportSales() {

    if (
        filteredSales.length ===
        0
    ) {

        showMessage(
            "No sales available for export.",
            "warning"
        );

        return;

    }


    const headers = [

        "Invoice",

        "Customer",

        "Items",

        "Subtotal",

        "Tax",

        "Discount",

        "Total",

        "Payment Method",

        "Payment Status",

        "Date"

    ];


    const rows =
        filteredSales.map(
            sale => {

                const itemCount =
                    (
                        sale.items ||
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

                    sale.invoice ||
                        sale.invoiceNumber ||
                        sale.id,

                    sale.customer ||
                        "Walk-in Customer",

                    itemCount,

                    sale.subtotal ||
                        0,

                    sale.tax ||
                        0,

                    sale.discount ||
                        0,

                    sale.total ||
                        0,

                    sale.paymentMethod ||
                        "Cash",

                    sale.paymentStatus ||
                        sale.status ||
                        "Paid",

                    formatDate(
                        sale.date ||
                        sale.createdAt
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
        `sales-${getFileDate()}.csv`;


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


    showMessage(
        "Sales exported successfully.",
        "success"
    );

}


/* =========================================================
   24. CLOSE SALE MODAL
========================================================= */

function closeSaleModal() {

    const modal =
        document.getElementById(
            "saleModal"
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
   25. FIND SALE
========================================================= */

function findSaleById(
    saleId
) {

    return allSales.find(
        sale =>
            String(
                sale.id
            ) ===
            String(
                saleId
            )
    );

}


/* =========================================================
   26. GENERATE SALE ID
========================================================= */

function generateSaleId() {

    return (
        "SALE-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() *
            1000
        )
    );

}


/* =========================================================
   27. GENERATE INVOICE NUMBER
========================================================= */

function generateInvoiceNumber() {

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
        `INV-${year}${month}-${random}`
    );

}


/* =========================================================
   28. GET INPUT VALUE
========================================================= */

function getInputValue(
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
   29. SET INPUT VALUE
========================================================= */

function setInputValue(
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
   30. SET TEXT
========================================================= */

function setText(
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
   31. FORMAT NUMBER
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
   32. FORMAT CURRENCY
========================================================= */

function formatCurrency(
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
   33. PAYMENT STATUS CLASS
========================================================= */

function getPaymentStatusClass(
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
        "paid"
    ) {

        return "status-success";

    }


    if (
        value ===
        "pending"
    ) {

        return "status-warning";

    }


    if (
        value ===
        "cancelled" ||
        value ===
        "failed" ||
        value ===
        "unpaid"
    ) {

        return "status-danger";

    }


    return "status-neutral";

}


/* =========================================================
   34. FORMAT DATE
========================================================= */

function formatDate(
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
   35. FILE DATE
========================================================= */

function getFileDate() {

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
   36. SHOW MESSAGE
========================================================= */

function showMessage(
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
   37. ESCAPE HTML
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
   38. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadSales();

            loadSaleProducts();

            updateSalesStatistics();

        }

    },
    60000
);


/* =========================================================
   39. PUBLIC SALES API
========================================================= */

window.InventorySales = {

    initialize:
        initializeSales,

    load:
        loadSales,

    refresh:
        loadSales,

    filter:
        applySalesFilters,

    clearFilters:
        clearSalesFilters,

    view:
        viewSale,

    print:
        printSale,

    delete:
        deleteSale,

    export:
        exportSales,

    recordSale:
        handleSaleSubmit

};


/* =========================================================
   END OF SALES.JS
========================================================= */