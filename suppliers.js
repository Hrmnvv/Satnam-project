/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   SUPPLIERS JAVASCRIPT
   File: js/suppliers.js

   Features:
   - Load suppliers
   - Display suppliers
   - Search suppliers
   - Add supplier
   - Edit supplier
   - Delete supplier
   - View supplier details
   - Supplier statistics
   - Purchase count
   - Pagination
   - CSV export
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let allSuppliers = [];

let filteredSuppliers = [];

let currentSupplierPage = 1;

let suppliersRowsPerPage = 10;

let editingSupplierId = null;


/* =========================================================
   2. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSuppliers();

    }
);


function initializeSuppliers() {

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not loaded."
        );

        return;

    }


    loadSuppliers();

    setupSupplierEvents();

    updateSupplierStatistics();

}


/* =========================================================
   3. LOAD SUPPLIERS
========================================================= */

function loadSuppliers() {

    allSuppliers =
        InventoryStorage
            .getSuppliers() || [];


    filteredSuppliers =
        [...allSuppliers];


    sortSuppliers();

    renderSuppliers();

}


/* =========================================================
   4. RENDER SUPPLIERS
========================================================= */

function renderSuppliers() {

    const tableBody =
        findSupplierElement([
            "suppliersTableBody",
            "supplierTableBody",
            "suppliers-table-body"
        ]);


    if (!tableBody) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredSuppliers.length /
            suppliersRowsPerPage
        );


    if (
        currentSupplierPage >
        totalPages &&
        totalPages > 0
    ) {

        currentSupplierPage =
            totalPages;

    }


    const start =
        (
            currentSupplierPage -
            1
        ) *
        suppliersRowsPerPage;


    const end =
        start +
        suppliersRowsPerPage;


    const suppliersToShow =
        filteredSuppliers.slice(
            start,
            end
        );


    if (
        suppliersToShow.length ===
        0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-truck"></i>

                        <h3>
                            No Suppliers Found
                        </h3>

                        <p>
                            Add a supplier or
                            change your search.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        updateSupplierPagination();

        return;

    }


    tableBody.innerHTML =
        suppliersToShow
            .map(
                supplier =>
                    createSupplierRow(
                        supplier
                    )
            )
            .join("");


    updateSupplierPagination();

}


/* =========================================================
   5. CREATE SUPPLIER ROW
========================================================= */

function createSupplierRow(
    supplier
) {

    const id =
        supplier.id ||
        "";


    const name =
        supplier.name ||
        supplier.supplierName ||
        "Unnamed Supplier";


    const contact =
        supplier.contact ||
        supplier.phone ||
        supplier.mobile ||
        "-";


    const email =
        supplier.email ||
        "-";


    const company =
        supplier.company ||
        supplier.companyName ||
        "-";


    const city =
        supplier.city ||
        supplier.address ||
        "-";


    const productsSupplied =
        getSupplierProductCount(
            supplier.id
        );


    const purchaseCount =
        getSupplierPurchaseCount(
            supplier.id,
            name
        );


    return `

        <tr
            data-supplier-id="${escapeSupplierHTML(
                id
            )}"
        >

            <td>

                <div class="supplier-name-cell">

                    <div class="supplier-avatar">

                        ${getSupplierInitials(
                            name
                        )}

                    </div>

                    <div>

                        <strong>
                            ${escapeSupplierHTML(
                                name
                            )}
                        </strong>

                        <small>
                            ID:
                            ${escapeSupplierHTML(
                                id
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeSupplierHTML(
                    company
                )}
            </td>


            <td>
                ${escapeSupplierHTML(
                    contact
                )}
            </td>


            <td>
                ${escapeSupplierHTML(
                    email
                )}
            </td>


            <td>
                ${escapeSupplierHTML(
                    city
                )}
            </td>


            <td>
                ${formatSupplierNumber(
                    productsSupplied
                )}
            </td>


            <td>
                ${formatSupplierNumber(
                    purchaseCount
                )}
            </td>


            <td>

                <span
                    class="status-badge ${getSupplierStatusClass(
                        supplier.status
                    )}"
                >

                    ${escapeSupplierHTML(
                        supplier.status ||
                        "Active"
                    )}

                </span>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        title="View Supplier"
                        data-supplier-action="view"
                        data-id="${escapeSupplierHTML(
                            id
                        )}"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn edit-btn"
                        title="Edit Supplier"
                        data-supplier-action="edit"
                        data-id="${escapeSupplierHTML(
                            id
                        )}"
                    >

                        <i class="fas fa-edit"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Supplier"
                        data-supplier-action="delete"
                        data-id="${escapeSupplierHTML(
                            id
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
   6. SETUP EVENTS
========================================================= */

function setupSupplierEvents() {

    /*
       Search
    */

    const search =
        findSupplierElement([
            "supplierSearch",
            "suppliersSearch",
            "supplier-search",
            "searchSuppliers"
        ]);


    if (search) {

        search.addEventListener(
            "input",
            applySupplierFilters
        );

    }


    /*
       Status filter
    */

    const statusFilter =
        findSupplierElement([
            "supplierStatusFilter",
            "suppliersStatusFilter",
            "supplier-status-filter"
        ]);


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applySupplierFilters
        );

    }


    /*
       Add supplier
    */

    document
        .querySelectorAll(
            "#addSupplierBtn, .add-supplier-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openSupplierForm();

                    }
                );

            }
        );


    /*
       Export
    */

    document
        .querySelectorAll(
            "#exportSuppliers, .export-suppliers"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportSuppliers
                );

            }
        );


    /*
       Clear filters
    */

    document
        .querySelectorAll(
            "#clearSupplierFilters, .clear-supplier-filters"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    clearSupplierFilters
                );

            }
        );


    /*
       Supplier actions
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-supplier-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset
                    .supplierAction;


            const supplierId =
                button.dataset.id;


            if (
                action ===
                "view"
            ) {

                viewSupplier(
                    supplierId
                );

            }


            if (
                action ===
                "edit"
            ) {

                editSupplier(
                    supplierId
                );

            }


            if (
                action ===
                "delete"
            ) {

                deleteSupplier(
                    supplierId
                );

            }

        }
    );


    /*
       Supplier form
    */

    const supplierForm =
        document.getElementById(
            "supplierForm"
        );


    if (supplierForm) {

        supplierForm.addEventListener(
            "submit",
            handleSupplierSubmit
        );

    }


    /*
       Close modal
    */

    document
        .querySelectorAll(
            "#closeSupplierModal, .close-supplier-modal"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeSupplierModal
                );

            }
        );

}


/* =========================================================
   7. FILTER SUPPLIERS
========================================================= */

function applySupplierFilters() {

    const search =
        findSupplierElement([
            "supplierSearch",
            "suppliersSearch",
            "supplier-search",
            "searchSuppliers"
        ]);


    const statusFilter =
        findSupplierElement([
            "supplierStatusFilter",
            "suppliersStatusFilter",
            "supplier-status-filter"
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


    filteredSuppliers =
        allSuppliers.filter(
            supplier => {

                const searchable =
                    [

                        supplier.name,

                        supplier.supplierName,

                        supplier.company,

                        supplier.companyName,

                        supplier.email,

                        supplier.phone,

                        supplier.contact,

                        supplier.mobile,

                        supplier.city,

                        supplier.address

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
                    supplier.status ||
                    "Active";


                const matchesStatus =
                    !selectedStatus ||
                    status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    currentSupplierPage =
        1;


    sortSuppliers();

    renderSuppliers();

}


/* =========================================================
   8. SORT SUPPLIERS
========================================================= */

function sortSuppliers() {

    filteredSuppliers.sort(
        (
            a,
            b
        ) => {

            const nameA =
                (
                    a.name ||
                    a.supplierName ||
                    ""
                )
                    .toLowerCase();


            const nameB =
                (
                    b.name ||
                    b.supplierName ||
                    ""
                )
                    .toLowerCase();


            return nameA.localeCompare(
                nameB
            );

        }
    );

}


/* =========================================================
   9. OPEN SUPPLIER FORM
========================================================= */

function openSupplierForm() {

    editingSupplierId =
        null;


    const form =
        document.getElementById(
            "supplierForm"
        );


    if (form) {

        form.reset();

    }


    setSupplierModalTitle(
        "Add Supplier"
    );


    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================================
   10. EDIT SUPPLIER
========================================================= */

function editSupplier(
    supplierId
) {

    const supplier =
        findSupplierById(
            supplierId
        );


    if (!supplier) {

        showSupplierMessage(
            "Supplier not found.",
            "error"
        );

        return;

    }


    editingSupplierId =
        supplierId;


    const fields = {

        name:
            supplier.name ||
            supplier.supplierName ||
            "",

        company:
            supplier.company ||
            supplier.companyName ||
            "",

        email:
            supplier.email ||
            "",

        phone:
            supplier.phone ||
            supplier.contact ||
            supplier.mobile ||
            "",

        address:
            supplier.address ||
            "",

        city:
            supplier.city ||
            "",

        state:
            supplier.state ||
            "",

        country:
            supplier.country ||
            "India",

        status:
            supplier.status ||
            "Active",

        gst:
            supplier.gst ||
            supplier.gstNumber ||
            "",

        notes:
            supplier.notes ||
            ""

    };


    Object.entries(
        fields
    ).forEach(
        (
            [
                field,
                value
            ]
        ) => {

            const element =
                findSupplierElement([
                    `supplier${capitalizeSupplier(
                        field
                    )}`,

                    field

                ]);


            if (element) {

                element.value =
                    value;

            }

        }
    );


    setSupplierModalTitle(
        "Edit Supplier"
    );


    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================================
   11. HANDLE FORM SUBMIT
========================================================= */

function handleSupplierSubmit(
    event
) {

    event.preventDefault();


    const name =
        getSupplierInput([
            "supplierName",
            "name"
        ]);


    const company =
        getSupplierInput([
            "supplierCompany",
            "company",
            "companyName"
        ]);


    const email =
        getSupplierInput([
            "supplierEmail",
            "email"
        ]);


    const phone =
        getSupplierInput([
            "supplierPhone",
            "phone",
            "contact",
            "mobile"
        ]);


    const address =
        getSupplierInput([
            "supplierAddress",
            "address"
        ]);


    const city =
        getSupplierInput([
            "supplierCity",
            "city"
        ]);


    const state =
        getSupplierInput([
            "supplierState",
            "state"
        ]);


    const country =
        getSupplierInput([
            "supplierCountry",
            "country"
        ]) ||
        "India";


    const status =
        getSupplierInput([
            "supplierStatus",
            "status"
        ]) ||
        "Active";


    const gst =
        getSupplierInput([
            "supplierGST",
            "gst",
            "gstNumber"
        ]);


    const notes =
        getSupplierInput([
            "supplierNotes",
            "notes"
        ]);


    /*
       Validation
    */

    if (!name) {

        showSupplierMessage(
            "Supplier name is required.",
            "error"
        );

        return;

    }


    if (
        email &&
        !isValidSupplierEmail(
            email
        )
    ) {

        showSupplierMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;

    }


    if (
        phone &&
        phone.replace(
            /\D/g,
            ""
        ).length < 7
    ) {

        showSupplierMessage(
            "Please enter a valid phone number.",
            "error"
        );

        return;

    }


    const supplierData = {

        name:
            name,

        company:
            company,

        email:
            email,

        phone:
            phone,

        contact:
            phone,

        address:
            address,

        city:
            city,

        state:
            state,

        country:
            country,

        status:
            status,

        gst:
            gst,

        gstNumber:
            gst,

        notes:
            notes,

        updatedAt:
            new Date()
                .toISOString()

    };


    try {

        if (
            editingSupplierId
        ) {

            InventoryStorage
                .updateSupplier(
                    editingSupplierId,
                    supplierData
                );


            showSupplierMessage(
                "Supplier updated successfully.",
                "success"
            );

        }
        else {

            supplierData.id =
                generateSupplierId();


            supplierData.createdAt =
                new Date()
                    .toISOString();


            InventoryStorage
                .addSupplier(
                    supplierData
                );


            if (
                typeof InventoryStorage
                    .addActivity ===
                "function"
            ) {

                InventoryStorage
                    .addActivity({

                        title:
                            "New Supplier",

                        description:
                            `${name} was added as a supplier.`,

                        timestamp:
                            new Date()
                                .toISOString()

                    });

            }


            showSupplierMessage(
                "Supplier added successfully.",
                "success"
            );

        }


        editingSupplierId =
            null;


        loadSuppliers();

        updateSupplierStatistics();

        closeSupplierModal();

        event.target.reset();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showSupplierMessage(
            "Unable to save supplier.",
            "error"
        );

    }

}


/* =========================================================
   12. VIEW SUPPLIER
========================================================= */

function viewSupplier(
    supplierId
) {

    const supplier =
        findSupplierById(
            supplierId
        );


    if (!supplier) {

        showSupplierMessage(
            "Supplier not found.",
            "error"
        );

        return;

    }


    const purchaseCount =
        getSupplierPurchaseCount(
            supplier.id,
            supplier.name
        );


    const productCount =
        getSupplierProductCount(
            supplier.id
        );


    const modal =
        document.getElementById(
            "supplierViewModal"
        );


    const details =
        createSupplierDetailsHTML(
            supplier,
            productCount,
            purchaseCount
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
                details;


        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

        return;

    }


    /*
       Fallback
    */

    alert(
        createSupplierDetailsText(
            supplier,
            productCount,
            purchaseCount
        )
    );

}


/* =========================================================
   13. SUPPLIER DETAILS
========================================================= */

function createSupplierDetailsHTML(
    supplier,
    productCount,
    purchaseCount
) {

    const name =
        supplier.name ||
        supplier.supplierName ||
        "Unnamed Supplier";


    return `

        <div class="supplier-details">

            <div class="supplier-profile">

                <div class="supplier-large-avatar">

                    ${getSupplierInitials(
                        name
                    )}

                </div>


                <div>

                    <h2>
                        ${escapeSupplierHTML(
                            name
                        )}
                    </h2>

                    <p>
                        ${escapeSupplierHTML(
                            supplier.company ||
                            supplier.companyName ||
                            "No company"
                        )}
                    </p>

                </div>

            </div>


            <div class="supplier-info-grid">

                <div class="info-item">

                    <span>
                        Phone
                    </span>

                    <strong>
                        ${escapeSupplierHTML(
                            supplier.phone ||
                            supplier.contact ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Email
                    </span>

                    <strong>
                        ${escapeSupplierHTML(
                            supplier.email ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Address
                    </span>

                    <strong>
                        ${escapeSupplierHTML(
                            supplier.address ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Location
                    </span>

                    <strong>

                        ${escapeSupplierHTML(
                            [
                                supplier.city,
                                supplier.state,
                                supplier.country
                            ]
                                .filter(Boolean)
                                .join(
                                    ", "
                                ) ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        GST Number
                    </span>

                    <strong>
                        ${escapeSupplierHTML(
                            supplier.gst ||
                            supplier.gstNumber ||
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
                            class="status-badge ${getSupplierStatusClass(
                                supplier.status
                            )}"
                        >

                            ${escapeSupplierHTML(
                                supplier.status ||
                                "Active"
                            )}

                        </span>

                    </strong>

                </div>

            </div>


            <div class="supplier-stat-grid">

                <div class="stat-box">

                    <strong>
                        ${formatSupplierNumber(
                            productCount
                        )}
                    </strong>

                    <span>
                        Products
                    </span>

                </div>


                <div class="stat-box">

                    <strong>
                        ${formatSupplierNumber(
                            purchaseCount
                        )}
                    </strong>

                    <span>
                        Purchases
                    </span>

                </div>

            </div>


            ${
                supplier.notes
                    ? `

                    <div class="supplier-notes">

                        <strong>
                            Notes
                        </strong>

                        <p>
                            ${escapeSupplierHTML(
                                supplier.notes
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
   14. SUPPLIER DETAILS TEXT
========================================================= */

function createSupplierDetailsText(
    supplier,
    productCount,
    purchaseCount
) {

    const name =
        supplier.name ||
        supplier.supplierName ||
        "Unnamed Supplier";


    return (

        `SUPPLIER DETAILS\n\n` +

        `Name: ${name}\n` +

        `Company: ${
            supplier.company ||
            supplier.companyName ||
            "-"
        }\n` +

        `Phone: ${
            supplier.phone ||
            supplier.contact ||
            "-"
        }\n` +

        `Email: ${
            supplier.email ||
            "-"
        }\n` +

        `Address: ${
            supplier.address ||
            "-"
        }\n` +

        `Location: ${
            [
                supplier.city,
                supplier.state,
                supplier.country
            ]
                .filter(Boolean)
                .join(", ") ||
            "-"
        }\n` +

        `GST: ${
            supplier.gst ||
            supplier.gstNumber ||
            "-"
        }\n` +

        `Status: ${
            supplier.status ||
            "Active"
        }\n\n` +

        `Products: ${productCount}\n` +

        `Purchases: ${purchaseCount}`

    );

}


/* =========================================================
   15. DELETE SUPPLIER
========================================================= */

function deleteSupplier(
    supplierId
) {

    const supplier =
        findSupplierById(
            supplierId
        );


    if (!supplier) {

        showSupplierMessage(
            "Supplier not found.",
            "error"
        );

        return;

    }


    const name =
        supplier.name ||
        supplier.supplierName ||
        "this supplier";


    /*
       Check whether supplier
       has purchases.
    */

    const purchaseCount =
        getSupplierPurchaseCount(
            supplier.id,
            name
        );


    let message =
        `Delete supplier "${name}"?`;


    if (
        purchaseCount > 0
    ) {

        message +=

            `\n\nThis supplier has ${purchaseCount} recorded purchase(s).`;

    }


    if (
        !confirm(
            message
        )
    ) {

        return;

    }


    try {

        InventoryStorage
            .deleteSupplier(
                supplierId
            );


        if (
            typeof InventoryStorage
                .addActivity ===
            "function"
        ) {

            InventoryStorage
                .addActivity({

                    title:
                        "Supplier Deleted",

                    description:
                        `${name} was removed from suppliers.`,

                    timestamp:
                        new Date()
                            .toISOString()

                });

        }


        showSupplierMessage(
            "Supplier deleted successfully.",
            "success"
        );


        loadSuppliers();

        updateSupplierStatistics();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showSupplierMessage(
            "Unable to delete supplier.",
            "error"
        );

    }

}


/* =========================================================
   16. SUPPLIER STATISTICS
========================================================= */

function updateSupplierStatistics() {

    const total =
        allSuppliers.length;


    const active =
        allSuppliers.filter(
            supplier =>
                (
                    supplier.status ||
                    "Active"
                )
                    .toLowerCase() ===
                "active"
        ).length;


    const inactive =
        allSuppliers.filter(
            supplier =>
                (
                    supplier.status ||
                    ""
                )
                    .toLowerCase() ===
                "inactive"
        ).length;


    let totalPurchases =
        0;


    if (
        typeof InventoryStorage
            .getPurchases ===
        "function"
    ) {

        totalPurchases =
            InventoryStorage
                .getPurchases()
                .length;

    }


    setSupplierText(
        [
            "totalSuppliers",
            "suppliersCount"
        ],
        formatSupplierNumber(
            total
        )
    );


    setSupplierText(
        [
            "activeSuppliers"
        ],
        formatSupplierNumber(
            active
        )
    );


    setSupplierText(
        [
            "inactiveSuppliers"
        ],
        formatSupplierNumber(
            inactive
        )
    );


    setSupplierText(
        [
            "supplierPurchases",
            "totalSupplierPurchases"
        ],
        formatSupplierNumber(
            totalPurchases
        )
    );

}


/* =========================================================
   17. SUPPLIER PRODUCT COUNT
========================================================= */

function getSupplierProductCount(
    supplierId
) {

    if (
        typeof InventoryStorage
            .getProducts !==
        "function"
    ) {

        return 0;

    }


    const products =
        InventoryStorage
            .getProducts() || [];


    return products.filter(
        product => {

            const productSupplier =
                product.supplierId ||
                product.supplier ||
                product.supplierName;


            return (
                String(
                    productSupplier
                ) ===
                String(
                    supplierId
                )
            );

        }
    ).length;

}


/* =========================================================
   18. SUPPLIER PURCHASE COUNT
========================================================= */

function getSupplierPurchaseCount(
    supplierId,
    supplierName
) {

    if (
        typeof InventoryStorage
            .getPurchases !==
        "function"
    ) {

        return 0;

    }


    const purchases =
        InventoryStorage
            .getPurchases() || [];


    return purchases.filter(
        purchase => {

            if (
                purchase.supplierId
            ) {

                return (
                    String(
                        purchase.supplierId
                    ) ===
                    String(
                        supplierId
                    )
                );

            }


            const name =
                purchase.supplier ||
                purchase.supplierName ||
                "";


            return (
                String(
                    name
                ).toLowerCase() ===
                String(
                    supplierName
                ).toLowerCase()
            );

        }
    ).length;

}


/* =========================================================
   19. PAGINATION
========================================================= */

function updateSupplierPagination() {

    const pagination =
        findSupplierElement([
            "suppliersPagination",
            "supplierPagination"
        ]);


    if (!pagination) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredSuppliers.length /
            suppliersRowsPerPage
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
        currentSupplierPage ===
        1;


    previous.onclick =
        function () {

            if (
                currentSupplierPage >
                1
            ) {

                currentSupplierPage--;

                renderSuppliers();

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
            currentSupplierPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                currentSupplierPage =
                    i;

                renderSuppliers();

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
        currentSupplierPage ===
        totalPages;


    next.onclick =
        function () {

            if (
                currentSupplierPage <
                totalPages
            ) {

                currentSupplierPage++;

                renderSuppliers();

            }

        };


    pagination.appendChild(
        next
    );

}


/* =========================================================
   20. CLEAR FILTERS
========================================================= */

function clearSupplierFilters() {

    const search =
        findSupplierElement([
            "supplierSearch",
            "suppliersSearch",
            "supplier-search",
            "searchSuppliers"
        ]);


    const status =
        findSupplierElement([
            "supplierStatusFilter",
            "suppliersStatusFilter",
            "supplier-status-filter"
        ]);


    if (search) {

        search.value =
            "";

    }


    if (status) {

        status.value =
            "";

    }


    currentSupplierPage =
        1;


    filteredSuppliers =
        [...allSuppliers];


    sortSuppliers();

    renderSuppliers();

}


/* =========================================================
   21. EXPORT SUPPLIERS
========================================================= */

function exportSuppliers() {

    if (
        filteredSuppliers.length ===
        0
    ) {

        showSupplierMessage(
            "No suppliers available for export.",
            "warning"
        );

        return;

    }


    const headers = [

        "Supplier ID",

        "Name",

        "Company",

        "Phone",

        "Email",

        "Address",

        "City",

        "State",

        "Country",

        "GST",

        "Status",

        "Purchases"

    ];


    const rows =
        filteredSuppliers.map(
            supplier => [

                supplier.id ||
                    "",

                supplier.name ||
                    supplier.supplierName ||
                    "",

                supplier.company ||
                    supplier.companyName ||
                    "",

                supplier.phone ||
                    supplier.contact ||
                    "",

                supplier.email ||
                    "",

                supplier.address ||
                    "",

                supplier.city ||
                    "",

                supplier.state ||
                    "",

                supplier.country ||
                    "",

                supplier.gst ||
                    supplier.gstNumber ||
                    "",

                supplier.status ||
                    "Active",

                getSupplierPurchaseCount(
                    supplier.id,
                    supplier.name
                )

            ]
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
        `suppliers-${getSupplierFileDate()}.csv`;


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


    showSupplierMessage(
        "Suppliers exported successfully.",
        "success"
    );

}


/* =========================================================
   22. CLOSE MODAL
========================================================= */

function closeSupplierModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

        modal.style.display =
            "none";

    }


    const viewModal =
        document.getElementById(
            "supplierViewModal"
        );


    if (viewModal) {

        viewModal.classList.remove(
            "active"
        );

        viewModal.style.display =
            "none";

    }


    editingSupplierId =
        null;

}


/* =========================================================
   23. FIND SUPPLIER
========================================================= */

function findSupplierById(
    supplierId
) {

    return allSuppliers.find(
        supplier =>
            String(
                supplier.id
            ) ===
            String(
                supplierId
            )
    );

}


/* =========================================================
   24. GENERATE SUPPLIER ID
========================================================= */

function generateSupplierId() {

    return (

        "SUP-" +

        Date.now().toString(
            36
        ).toUpperCase() +

        "-" +

        Math.floor(
            Math.random() *
            1000
        )

    );

}


/* =========================================================
   25. GET ELEMENT
========================================================= */

function findSupplierElement(
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
   26. GET INPUT
========================================================= */

function getSupplierInput(
    ids
) {

    const element =
        findSupplierElement(
            ids
        );


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   27. SET TEXT
========================================================= */

function setSupplierText(
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
   28. SET MODAL TITLE
========================================================= */

function setSupplierModalTitle(
    title
) {

    const titleElement =
        findSupplierElement([
            "supplierModalTitle",
            "modalSupplierTitle"
        ]);


    if (titleElement) {

        titleElement.textContent =
            title;

    }

}


/* =========================================================
   29. CAPITALIZE
========================================================= */

function capitalizeSupplier(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   30. INITIALS
========================================================= */

function getSupplierInitials(
    name
) {

    const words =
        String(
            name ||
            ""
        )
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length ===
        1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        words[0][0] +
        words[
            words.length - 1
        ][0]

    ).toUpperCase();

}


/* =========================================================
   31. VALIDATE EMAIL
========================================================= */

function isValidSupplierEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );

}


/* =========================================================
   32. FORMAT NUMBER
========================================================= */

function formatSupplierNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   33. STATUS CLASS
========================================================= */

function getSupplierStatusClass(
    status
) {

    const value =
        String(
            status ||
            "Active"
        )
            .toLowerCase();


    if (
        value ===
        "active"
    ) {

        return "status-success";

    }


    if (
        value ===
        "inactive"
    ) {

        return "status-danger";

    }


    if (
        value ===
        "pending"
    ) {

        return "status-warning";

    }


    return "status-neutral";

}


/* =========================================================
   34. FILE DATE
========================================================= */

function getSupplierFileDate() {

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
   35. MESSAGE
========================================================= */

function showSupplierMessage(
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

function escapeSupplierHTML(
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
   37. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadSuppliers();

            updateSupplierStatistics();

        }

    },
    60000
);


/* =========================================================
   38. PUBLIC API
========================================================= */

window.InventorySuppliers = {

    initialize:
        initializeSuppliers,

    load:
        loadSuppliers,

    refresh:
        loadSuppliers,

    filter:
        applySupplierFilters,

    clearFilters:
        clearSupplierFilters,

    add:
        openSupplierForm,

    edit:
        editSupplier,

    view:
        viewSupplier,

    delete:
        deleteSupplier,

    export:
        exportSuppliers

};


/* =========================================================
   END OF SUPPLIERS.JS
========================================================= */