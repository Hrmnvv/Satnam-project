/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   CUSTOMERS JAVASCRIPT
   File: js/customers.js

   Features:
   - Load customers
   - Display customers
   - Search customers
   - Filter customers
   - Add customer
   - Edit customer
   - Delete customer
   - View customer details
   - Customer statistics
   - Purchase/order count
   - CSV export
   - Pagination
========================================================= */

let allCustomers = [];
let filteredCustomers = [];
let currentCustomerPage = 1;
let customersRowsPerPage = 10;
let editingCustomerId = null;


/* =========================================================
   1. INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeCustomers();
});


function initializeCustomers() {

    if (typeof InventoryStorage === "undefined") {
        console.error("InventoryStorage is not loaded.");
        return;
    }

    loadCustomers();
    setupCustomerEvents();
    updateCustomerStatistics();
}


/* =========================================================
   2. LOAD CUSTOMERS
========================================================= */

function loadCustomers() {

    allCustomers =
        InventoryStorage.getCustomers() || [];

    filteredCustomers =
        [...allCustomers];

    sortCustomers();
    renderCustomers();
}


/* =========================================================
   3. RENDER CUSTOMERS
========================================================= */

function renderCustomers() {

    const tableBody = findCustomerElement([
        "customersTableBody",
        "customerTableBody",
        "customers-table-body"
    ]);

    if (!tableBody) {
        return;
    }

    const totalPages = Math.ceil(
        filteredCustomers.length /
        customersRowsPerPage
    );

    if (
        currentCustomerPage > totalPages &&
        totalPages > 0
    ) {
        currentCustomerPage = totalPages;
    }

    const start =
        (currentCustomerPage - 1) *
        customersRowsPerPage;

    const end =
        start + customersRowsPerPage;

    const customersToShow =
        filteredCustomers.slice(
            start,
            end
        );

    if (customersToShow.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">

                    <div class="empty-state">

                        <i class="fas fa-users"></i>

                        <h3>
                            No Customers Found
                        </h3>

                        <p>
                            Add a customer or
                            change your search.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        updateCustomerPagination();
        return;
    }

    tableBody.innerHTML =
        customersToShow
            .map(customer =>
                createCustomerRow(customer)
            )
            .join("");

    updateCustomerPagination();
}


/* =========================================================
   4. CREATE CUSTOMER ROW
========================================================= */

function createCustomerRow(customer) {

    const id =
        customer.id || "";

    const name =
        customer.name ||
        customer.customerName ||
        "Unnamed Customer";

    const phone =
        customer.phone ||
        customer.contact ||
        customer.mobile ||
        "-";

    const email =
        customer.email ||
        "-";

    const address =
        customer.address ||
        "-";

    const city =
        customer.city ||
        "-";

    const orderCount =
        getCustomerOrderCount(
            customer.id,
            name
        );

    const totalSpent =
        getCustomerTotalSpent(
            customer.id,
            name
        );

    return `
        <tr
            data-customer-id="${escapeCustomerHTML(id)}"
        >

            <td>

                <div class="customer-name-cell">

                    <div class="customer-avatar">

                        ${getCustomerInitials(name)}

                    </div>

                    <div>

                        <strong>
                            ${escapeCustomerHTML(name)}
                        </strong>

                        <small>
                            ID:
                            ${escapeCustomerHTML(id)}
                        </small>

                    </div>

                </div>

            </td>

            <td>
                ${escapeCustomerHTML(phone)}
            </td>

            <td>
                ${escapeCustomerHTML(email)}
            </td>

            <td>
                ${escapeCustomerHTML(address)}
            </td>

            <td>
                ${escapeCustomerHTML(city)}
            </td>

            <td>
                ${formatCustomerCurrency(totalSpent)}
            </td>

            <td>
                ${formatCustomerNumber(orderCount)}
            </td>

            <td>

                <span
                    class="status-badge ${getCustomerStatusClass(
                        customer.status
                    )}"
                >
                    ${escapeCustomerHTML(
                        customer.status || "Active"
                    )}
                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        title="View Customer"
                        data-customer-action="view"
                        data-id="${escapeCustomerHTML(id)}"
                    >
                        <i class="fas fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="action-btn edit-btn"
                        title="Edit Customer"
                        data-customer-action="edit"
                        data-id="${escapeCustomerHTML(id)}"
                    >
                        <i class="fas fa-edit"></i>
                    </button>

                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Customer"
                        data-customer-action="delete"
                        data-id="${escapeCustomerHTML(id)}"
                    >
                        <i class="fas fa-trash"></i>
                    </button>

                </div>

            </td>

        </tr>
    `;
}


/* =========================================================
   5. SETUP EVENTS
========================================================= */

function setupCustomerEvents() {

    const search = findCustomerElement([
        "customerSearch",
        "customersSearch",
        "customer-search",
        "searchCustomers"
    ]);

    if (search) {

        search.addEventListener(
            "input",
            applyCustomerFilters
        );

    }


    const statusFilter =
        findCustomerElement([
            "customerStatusFilter",
            "customersStatusFilter",
            "customer-status-filter"
        ]);

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyCustomerFilters
        );

    }


    document
        .querySelectorAll(
            "#addCustomerBtn, .add-customer-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {
                    openCustomerForm();
                }
            );

        });


    document
        .querySelectorAll(
            "#exportCustomers, .export-customers"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                exportCustomers
            );

        });


    document
        .querySelectorAll(
            "#clearCustomerFilters, .clear-customer-filters"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                clearCustomerFilters
            );

        });


    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-customer-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.customerAction;

            const customerId =
                button.dataset.id;

            if (action === "view") {
                viewCustomer(customerId);
            }

            if (action === "edit") {
                editCustomer(customerId);
            }

            if (action === "delete") {
                deleteCustomer(customerId);
            }

        }
    );


    const customerForm =
        document.getElementById(
            "customerForm"
        );

    if (customerForm) {

        customerForm.addEventListener(
            "submit",
            handleCustomerSubmit
        );

    }


    document
        .querySelectorAll(
            "#closeCustomerModal, .close-customer-modal"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                closeCustomerModal
            );

        });

}


/* =========================================================
   6. FILTER CUSTOMERS
========================================================= */

function applyCustomerFilters() {

    const search =
        findCustomerElement([
            "customerSearch",
            "customersSearch",
            "customer-search",
            "searchCustomers"
        ]);

    const statusFilter =
        findCustomerElement([
            "customerStatusFilter",
            "customersStatusFilter",
            "customer-status-filter"
        ]);

    const searchTerm =
        (
            search?.value || ""
        )
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter?.value || "";

    filteredCustomers =
        allCustomers.filter(customer => {

            const searchable = [
                customer.name,
                customer.customerName,
                customer.email,
                customer.phone,
                customer.contact,
                customer.mobile,
                customer.address,
                customer.city,
                customer.state
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchTerm ||
                searchable.includes(searchTerm);

            const status =
                customer.status || "Active";

            const matchesStatus =
                !selectedStatus ||
                status === selectedStatus;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    currentCustomerPage = 1;

    sortCustomers();
    renderCustomers();
}


/* =========================================================
   7. SORT CUSTOMERS
========================================================= */

function sortCustomers() {

    filteredCustomers.sort(
        (a, b) => {

            const nameA =
                (
                    a.name ||
                    a.customerName ||
                    ""
                ).toLowerCase();

            const nameB =
                (
                    b.name ||
                    b.customerName ||
                    ""
                ).toLowerCase();

            return nameA.localeCompare(nameB);
        }
    );
}


/* =========================================================
   8. OPEN CUSTOMER FORM
========================================================= */

function openCustomerForm() {

    editingCustomerId = null;

    const form =
        document.getElementById(
            "customerForm"
        );

    if (form) {
        form.reset();
    }

    setCustomerModalTitle(
        "Add Customer"
    );

    const modal =
        document.getElementById(
            "customerModal"
        );

    if (modal) {

        modal.style.display = "flex";
        modal.classList.add("active");

    }
}


/* =========================================================
   9. EDIT CUSTOMER
========================================================= */

function editCustomer(customerId) {

    const customer =
        findCustomerById(customerId);

    if (!customer) {

        showCustomerMessage(
            "Customer not found.",
            "error"
        );

        return;
    }

    editingCustomerId =
        customerId;

    const fields = {

        name:
            customer.name ||
            customer.customerName ||
            "",

        email:
            customer.email ||
            "",

        phone:
            customer.phone ||
            customer.contact ||
            customer.mobile ||
            "",

        address:
            customer.address ||
            "",

        city:
            customer.city ||
            "",

        state:
            customer.state ||
            "",

        country:
            customer.country ||
            "India",

        status:
            customer.status ||
            "Active",

        notes:
            customer.notes ||
            ""

    };


    Object.entries(fields)
        .forEach(
            ([field, value]) => {

                const element =
                    findCustomerElement([
                        `customer${capitalizeCustomer(field)}`,
                        field
                    ]);

                if (element) {
                    element.value = value;
                }

            }
        );


    setCustomerModalTitle(
        "Edit Customer"
    );


    const modal =
        document.getElementById(
            "customerModal"
        );

    if (modal) {

        modal.style.display = "flex";
        modal.classList.add("active");

    }
}


/* =========================================================
   10. HANDLE CUSTOMER FORM
========================================================= */

function handleCustomerSubmit(event) {

    event.preventDefault();


    const name =
        getCustomerInput([
            "customerName",
            "name"
        ]);


    const email =
        getCustomerInput([
            "customerEmail",
            "email"
        ]);


    const phone =
        getCustomerInput([
            "customerPhone",
            "phone",
            "contact",
            "mobile"
        ]);


    const address =
        getCustomerInput([
            "customerAddress",
            "address"
        ]);


    const city =
        getCustomerInput([
            "customerCity",
            "city"
        ]);


    const state =
        getCustomerInput([
            "customerState",
            "state"
        ]);


    const country =
        getCustomerInput([
            "customerCountry",
            "country"
        ]) || "India";


    const status =
        getCustomerInput([
            "customerStatus",
            "status"
        ]) || "Active";


    const notes =
        getCustomerInput([
            "customerNotes",
            "notes"
        ]);


    if (!name) {

        showCustomerMessage(
            "Customer name is required.",
            "error"
        );

        return;
    }


    if (
        email &&
        !isValidCustomerEmail(email)
    ) {

        showCustomerMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    if (
        phone &&
        phone.replace(/\D/g, "").length < 7
    ) {

        showCustomerMessage(
            "Please enter a valid phone number.",
            "error"
        );

        return;
    }


    const customerData = {

        name: name,

        customerName: name,

        email: email,

        phone: phone,

        contact: phone,

        address: address,

        city: city,

        state: state,

        country: country,

        status: status,

        notes: notes,

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (editingCustomerId) {

            InventoryStorage.updateCustomer(
                editingCustomerId,
                customerData
            );

            showCustomerMessage(
                "Customer updated successfully.",
                "success"
            );

        } else {

            customerData.id =
                generateCustomerId();

            customerData.createdAt =
                new Date().toISOString();

            InventoryStorage.addCustomer(
                customerData
            );


            if (
                typeof InventoryStorage.addActivity ===
                "function"
            ) {

                InventoryStorage.addActivity({

                    title:
                        "New Customer",

                    description:
                        `${name} was added as a customer.`,

                    timestamp:
                        new Date().toISOString()

                });

            }


            showCustomerMessage(
                "Customer added successfully.",
                "success"
            );
        }


        editingCustomerId = null;

        loadCustomers();

        updateCustomerStatistics();

        closeCustomerModal();

        event.target.reset();

    }
    catch (error) {

        console.error(error);

        showCustomerMessage(
            "Unable to save customer.",
            "error"
        );

    }
}


/* =========================================================
   11. VIEW CUSTOMER
========================================================= */

function viewCustomer(customerId) {

    const customer =
        findCustomerById(customerId);

    if (!customer) {

        showCustomerMessage(
            "Customer not found.",
            "error"
        );

        return;
    }


    const orderCount =
        getCustomerOrderCount(
            customer.id,
            customer.name
        );


    const totalSpent =
        getCustomerTotalSpent(
            customer.id,
            customer.name
        );


    const modal =
        document.getElementById(
            "customerViewModal"
        );


    const details =
        createCustomerDetailsHTML(
            customer,
            orderCount,
            totalSpent
        );


    if (
        modal &&
        modal.querySelector(".modal-body")
    ) {

        modal
            .querySelector(".modal-body")
            .innerHTML =
                details;

        modal.style.display = "flex";
        modal.classList.add("active");

        return;
    }


    alert(
        createCustomerDetailsText(
            customer,
            orderCount,
            totalSpent
        )
    );
}


/* =========================================================
   12. CUSTOMER DETAILS HTML
========================================================= */

function createCustomerDetailsHTML(
    customer,
    orderCount,
    totalSpent
) {

    const name =
        customer.name ||
        customer.customerName ||
        "Unnamed Customer";


    return `

        <div class="customer-details">

            <div class="customer-profile">

                <div class="customer-large-avatar">

                    ${getCustomerInitials(name)}

                </div>

                <div>

                    <h2>
                        ${escapeCustomerHTML(name)}
                    </h2>

                    <p>
                        Customer
                    </p>

                </div>

            </div>


            <div class="customer-info-grid">

                <div class="info-item">

                    <span>
                        Phone
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.phone ||
                            customer.contact ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Email
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.email ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Address
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.address ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Location
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            [
                                customer.city,
                                customer.state,
                                customer.country
                            ]
                                .filter(Boolean)
                                .join(", ") ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Status
                    </span>

                    <strong>

                        <span
                            class="status-badge ${getCustomerStatusClass(
                                customer.status
                            )}"
                        >
                            ${escapeCustomerHTML(
                                customer.status ||
                                "Active"
                            )}
                        </span>

                    </strong>

                </div>

            </div>


            <div class="customer-stat-grid">

                <div class="stat-box">

                    <strong>
                        ${formatCustomerNumber(
                            orderCount
                        )}
                    </strong>

                    <span>
                        Orders
                    </span>

                </div>


                <div class="stat-box">

                    <strong>
                        ${formatCustomerCurrency(
                            totalSpent
                        )}
                    </strong>

                    <span>
                        Total Spent
                    </span>

                </div>

            </div>


            ${
                customer.notes
                    ? `
                        <div class="customer-notes">

                            <strong>
                                Notes
                            </strong>

                            <p>
                                ${escapeCustomerHTML(
                                    customer.notes
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

        </div>

    `;
}


/* =========================================================
   13. CUSTOMER DETAILS TEXT
========================================================= */

function createCustomerDetailsText(
    customer,
    orderCount,
    totalSpent
) {

    const name =
        customer.name ||
        customer.customerName ||
        "Unnamed Customer";


    return (

        `CUSTOMER DETAILS\n\n` +

        `Name: ${name}\n` +

        `Phone: ${
            customer.phone ||
            customer.contact ||
            "-"
        }\n` +

        `Email: ${
            customer.email ||
            "-"
        }\n` +

        `Address: ${
            customer.address ||
            "-"
        }\n` +

        `Location: ${
            [
                customer.city,
                customer.state,
                customer.country
            ]
                .filter(Boolean)
                .join(", ") ||
            "-"
        }\n` +

        `Status: ${
            customer.status ||
            "Active"
        }\n\n` +

        `Orders: ${orderCount}\n` +

        `Total Spent: ₹${totalSpent.toFixed(2)}`

    );
}


/* =========================================================
   14. DELETE CUSTOMER
========================================================= */

function deleteCustomer(customerId) {

    const customer =
        findCustomerById(customerId);

    if (!customer) {

        showCustomerMessage(
            "Customer not found.",
            "error"
        );

        return;
    }


    const name =
        customer.name ||
        customer.customerName ||
        "this customer";


    const orderCount =
        getCustomerOrderCount(
            customer.id,
            name
        );


    let message =
        `Delete customer "${name}"?`;


    if (orderCount > 0) {

        message +=
            `\n\nThis customer has ${orderCount} recorded order(s).`;

    }


    if (!confirm(message)) {
        return;
    }


    try {

        InventoryStorage.deleteCustomer(
            customerId
        );


        if (
            typeof InventoryStorage.addActivity ===
            "function"
        ) {

            InventoryStorage.addActivity({

                title:
                    "Customer Deleted",

                description:
                    `${name} was removed from customers.`,

                timestamp:
                    new Date().toISOString()

            });

        }


        showCustomerMessage(
            "Customer deleted successfully.",
            "success"
        );


        loadCustomers();

        updateCustomerStatistics();

    }
    catch (error) {

        console.error(error);

        showCustomerMessage(
            "Unable to delete customer.",
            "error"
        );

    }
}


/* =========================================================
   15. CUSTOMER STATISTICS
========================================================= */

function updateCustomerStatistics() {

    const total =
        allCustomers.length;


    const active =
        allCustomers.filter(
            customer =>
                (
                    customer.status ||
                    "Active"
                )
                    .toLowerCase() ===
                "active"
        ).length;


    const inactive =
        allCustomers.filter(
            customer =>
                (
                    customer.status ||
                    ""
                )
                    .toLowerCase() ===
                "inactive"
        ).length;


    let totalOrders = 0;


    if (
        typeof InventoryStorage.getSales ===
        "function"
    ) {

        totalOrders =
            InventoryStorage
                .getSales()
                .length;

    }
    else if (
        typeof InventoryStorage.getOrders ===
        "function"
    ) {

        totalOrders =
            InventoryStorage
                .getOrders()
                .length;

    }


    setCustomerText(
        [
            "totalCustomers",
            "customersCount"
        ],
        formatCustomerNumber(total)
    );


    setCustomerText(
        [
            "activeCustomers"
        ],
        formatCustomerNumber(active)
    );


    setCustomerText(
        [
            "inactiveCustomers"
        ],
        formatCustomerNumber(inactive)
    );


    setCustomerText(
        [
            "customerOrders",
            "totalCustomerOrders"
        ],
        formatCustomerNumber(totalOrders)
    );
}


/* =========================================================
   16. CUSTOMER ORDER COUNT
========================================================= */

function getCustomerOrderCount(
    customerId,
    customerName
) {

    let orders = [];


    if (
        typeof InventoryStorage.getSales ===
        "function"
    ) {

        orders =
            InventoryStorage.getSales() || [];

    }
    else if (
        typeof InventoryStorage.getOrders ===
        "function"
    ) {

        orders =
            InventoryStorage.getOrders() || [];

    }
    else {

        return 0;

    }


    return orders.filter(order => {

        if (order.customerId) {

            return (
                String(order.customerId) ===
                String(customerId)
            );

        }


        const name =
            order.customer ||
            order.customerName ||
            "";


        return (
            String(name).toLowerCase() ===
            String(customerName).toLowerCase()
        );

    }).length;
}


/* =========================================================
   17. CUSTOMER TOTAL SPENT
========================================================= */

function getCustomerTotalSpent(
    customerId,
    customerName
) {

    let orders = [];


    if (
        typeof InventoryStorage.getSales ===
        "function"
    ) {

        orders =
            InventoryStorage.getSales() || [];

    }
    else if (
        typeof InventoryStorage.getOrders ===
        "function"
    ) {

        orders =
            InventoryStorage.getOrders() || [];

    }
    else {

        return 0;

    }


    return orders.reduce(
        (total, order) => {

            let belongsToCustomer =
                false;


            if (order.customerId) {

                belongsToCustomer =
                    String(order.customerId) ===
                    String(customerId);

            }
            else {

                const name =
                    order.customer ||
                    order.customerName ||
                    "";

                belongsToCustomer =
                    String(name).toLowerCase() ===
                    String(customerName).toLowerCase();

            }


            if (!belongsToCustomer) {
                return total;
            }


            const amount =
                Number(
                    order.total ||
                    order.totalAmount ||
                    order.grandTotal ||
                    order.amount ||
                    0
                );


            return total + amount;

        },
        0
    );
}


/* =========================================================
   18. PAGINATION
========================================================= */

function updateCustomerPagination() {

    const pagination =
        findCustomerElement([
            "customersPagination",
            "customerPagination"
        ]);


    if (!pagination) {
        return;
    }


    const totalPages =
        Math.ceil(
            filteredCustomers.length /
            customersRowsPerPage
        );


    pagination.innerHTML = "";


    if (totalPages <= 1) {
        return;
    }


    const previous =
        document.createElement("button");


    previous.innerHTML =
        `<i class="fas fa-chevron-left"></i>`;


    previous.disabled =
        currentCustomerPage === 1;


    previous.onclick =
        function () {

            if (
                currentCustomerPage > 1
            ) {

                currentCustomerPage--;

                renderCustomers();

            }

        };


    pagination.appendChild(previous);


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement("button");


        button.textContent = i;


        if (
            i === currentCustomerPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                currentCustomerPage = i;

                renderCustomers();

            };


        pagination.appendChild(button);

    }


    const next =
        document.createElement("button");


    next.innerHTML =
        `<i class="fas fa-chevron-right"></i>`;


    next.disabled =
        currentCustomerPage ===
        totalPages;


    next.onclick =
        function () {

            if (
                currentCustomerPage <
                totalPages
            ) {

                currentCustomerPage++;

                renderCustomers();

            }

        };


    pagination.appendChild(next);
}


/* =========================================================
   19. CLEAR FILTERS
========================================================= */

function clearCustomerFilters() {

    const search =
        findCustomerElement([
            "customerSearch",
            "customersSearch",
            "customer-search",
            "searchCustomers"
        ]);


    const status =
        findCustomerElement([
            "customerStatusFilter",
            "customersStatusFilter",
            "customer-status-filter"
        ]);


    if (search) {
        search.value = "";
    }


    if (status) {
        status.value = "";
    }


    currentCustomerPage = 1;

    filteredCustomers =
        [...allCustomers];

    sortCustomers();

    renderCustomers();
}


/* =========================================================
   20. EXPORT CUSTOMERS
========================================================= */

function exportCustomers() {

    if (
        filteredCustomers.length === 0
    ) {

        showCustomerMessage(
            "No customers available for export.",
            "warning"
        );

        return;
    }


    const headers = [

        "Customer ID",

        "Name",

        "Phone",

        "Email",

        "Address",

        "City",

        "State",

        "Country",

        "Status",

        "Orders",

        "Total Spent"

    ];


    const rows =
        filteredCustomers.map(
            customer => {

                const name =
                    customer.name ||
                    customer.customerName ||
                    "";


                const orderCount =
                    getCustomerOrderCount(
                        customer.id,
                        name
                    );


                const totalSpent =
                    getCustomerTotalSpent(
                        customer.id,
                        name
                    );


                return [

                    customer.id || "",

                    name,

                    customer.phone ||
                        customer.contact ||
                        "",

                    customer.email || "",

                    customer.address || "",

                    customer.city || "",

                    customer.state || "",

                    customer.country || "",

                    customer.status ||
                        "Active",

                    orderCount,

                    totalSpent.toFixed(2)

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
                                    value ?? ""
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
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `customers-${getCustomerFileDate()}.csv`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    showCustomerMessage(
        "Customers exported successfully.",
        "success"
    );
}


/* =========================================================
   21. CLOSE MODALS
========================================================= */

function closeCustomerModal() {

    const modal =
        document.getElementById(
            "customerModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

        modal.style.display = "none";

    }


    const viewModal =
        document.getElementById(
            "customerViewModal"
        );


    if (viewModal) {

        viewModal.classList.remove(
            "active"
        );

        viewModal.style.display = "none";

    }


    editingCustomerId = null;
}


/* =========================================================
   22. FIND CUSTOMER
========================================================= */

function findCustomerById(
    customerId
) {

    return allCustomers.find(
        customer =>
            String(customer.id) ===
            String(customerId)
    );
}


/* =========================================================
   23. GENERATE CUSTOMER ID
========================================================= */

function generateCustomerId() {

    return (
        "CUS-" +
        Date.now()
            .toString(36)
            .toUpperCase() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );
}


/* =========================================================
   24. FIND ELEMENT
========================================================= */

function findCustomerElement(ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;
}


/* =========================================================
   25. GET INPUT
========================================================= */

function getCustomerInput(ids) {

    const element =
        findCustomerElement(ids);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   26. SET TEXT
========================================================= */

function setCustomerText(
    ids,
    value
) {

    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    });
}


/* =========================================================
   27. SET MODAL TITLE
========================================================= */

function setCustomerModalTitle(title) {

    const titleElement =
        findCustomerElement([
            "customerModalTitle",
            "modalCustomerTitle"
        ]);


    if (titleElement) {

        titleElement.textContent =
            title;

    }
}


/* =========================================================
   28. CAPITALIZE
========================================================= */

function capitalizeCustomer(text) {

    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   29. CUSTOMER INITIALS
========================================================= */

function getCustomerInitials(name) {

    const words =
        String(name || "")
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   30. VALIDATE EMAIL
========================================================= */

function isValidCustomerEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* =========================================================
   31. FORMAT NUMBER
========================================================= */

function formatCustomerNumber(number) {

    return Number(
        number || 0
    ).toLocaleString("en-IN");
}


/* =========================================================
   32. FORMAT CURRENCY
========================================================= */

function formatCustomerCurrency(amount) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   33. STATUS CLASS
========================================================= */

function getCustomerStatusClass(status) {

    const value =
        String(
            status || "Active"
        ).toLowerCase();


    if (value === "active") {
        return "status-success";
    }


    if (value === "inactive") {
        return "status-danger";
    }


    if (value === "pending") {
        return "status-warning";
    }


    return "status-neutral";
}


/* =========================================================
   34. FILE DATE
========================================================= */

function getCustomerFileDate() {

    const date = new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(2, "0"),

        String(
            date.getDate()
        ).padStart(2, "0")

    ].join("-");
}


/* =========================================================
   35. SHOW MESSAGE
========================================================= */

function showCustomerMessage(
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
   36. ESCAPE HTML
========================================================= */

function escapeCustomerHTML(value) {

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
   37. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadCustomers();

            updateCustomerStatistics();

        }

    },
    60000
);


/* =========================================================
   38. PUBLIC API
========================================================= */

window.InventoryCustomers = {

    initialize:
        initializeCustomers,

    load:
        loadCustomers,

    refresh:
        loadCustomers,

    filter:
        applyCustomerFilters,

    clearFilters:
        clearCustomerFilters,

    add:
        openCustomerForm,

    edit:
        editCustomer,

    view:
        viewCustomer,

    delete:
        deleteCustomer,

    export:
        exportCustomers

};


/* =========================================================
   END OF CUSTOMERS.JS
========================================================= */