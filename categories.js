/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   CATEGORIES JAVASCRIPT
   File: js/categories.js

   Features:
   - Load categories
   - Display categories
   - Search categories
   - Add category
   - Edit category
   - Delete category
   - Product count per category
   - Active/Inactive status
   - Pagination
   - CSV export
========================================================= */

let allCategories = [];
let filteredCategories = [];
let currentCategoryPage = 1;
let categoriesRowsPerPage = 10;
let editingCategoryId = null;


/* =========================================================
   1. INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeCategories();
});


function initializeCategories() {

    if (typeof InventoryStorage === "undefined") {
        console.error("InventoryStorage is not loaded.");
        return;
    }

    loadCategories();
    setupCategoryEvents();
    updateCategoryStatistics();
}


/* =========================================================
   2. LOAD CATEGORIES
========================================================= */

function loadCategories() {

    allCategories =
        InventoryStorage.getCategories() || [];

    filteredCategories =
        [...allCategories];

    sortCategories();
    renderCategories();
}


/* =========================================================
   3. RENDER CATEGORIES
========================================================= */

function renderCategories() {

    const tableBody =
        findCategoryElement([
            "categoriesTableBody",
            "categoryTableBody",
            "categories-table-body"
        ]);

    if (!tableBody) {
        return;
    }


    const totalPages =
        Math.ceil(
            filteredCategories.length /
            categoriesRowsPerPage
        );


    if (
        currentCategoryPage > totalPages &&
        totalPages > 0
    ) {

        currentCategoryPage =
            totalPages;

    }


    const start =
        (currentCategoryPage - 1) *
        categoriesRowsPerPage;


    const end =
        start + categoriesRowsPerPage;


    const categoriesToShow =
        filteredCategories.slice(
            start,
            end
        );


    if (categoriesToShow.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-tags"></i>

                        <h3>
                            No Categories Found
                        </h3>

                        <p>
                            Add a category or
                            change your search.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        updateCategoryPagination();

        return;
    }


    tableBody.innerHTML =
        categoriesToShow
            .map(
                category =>
                    createCategoryRow(category)
            )
            .join("");


    updateCategoryPagination();
}


/* =========================================================
   4. CREATE CATEGORY ROW
========================================================= */

function createCategoryRow(category) {

    const id =
        category.id || "";


    const name =
        category.name ||
        category.categoryName ||
        "Unnamed Category";


    const description =
        category.description ||
        "-";


    const productCount =
        getCategoryProductCount(
            category.id,
            name
        );


    const status =
        category.status ||
        "Active";


    const createdAt =
        category.createdAt
            ? formatCategoryDate(
                category.createdAt
            )
            : "-";


    return `

        <tr
            data-category-id="${escapeCategoryHTML(id)}"
        >

            <td>

                <div class="category-name-cell">

                    <div class="category-icon">

                        <i class="fas fa-tag"></i>

                    </div>

                    <div>

                        <strong>
                            ${escapeCategoryHTML(name)}
                        </strong>

                        <small>
                            ID:
                            ${escapeCategoryHTML(id)}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                ${escapeCategoryHTML(
                    description
                )}

            </td>


            <td>

                <span class="product-count">

                    ${formatCategoryNumber(
                        productCount
                    )}

                </span>

            </td>


            <td>

                <span
                    class="status-badge ${getCategoryStatusClass(
                        status
                    )}"
                >

                    ${escapeCategoryHTML(
                        status
                    )}

                </span>

            </td>


            <td>

                ${createdAt}

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        title="View Category"
                        data-category-action="view"
                        data-id="${escapeCategoryHTML(id)}"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn edit-btn"
                        title="Edit Category"
                        data-category-action="edit"
                        data-id="${escapeCategoryHTML(id)}"
                    >

                        <i class="fas fa-edit"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Category"
                        data-category-action="delete"
                        data-id="${escapeCategoryHTML(id)}"
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

function setupCategoryEvents() {

    const search =
        findCategoryElement([
            "categorySearch",
            "categoriesSearch",
            "category-search",
            "searchCategories"
        ]);


    if (search) {

        search.addEventListener(
            "input",
            applyCategoryFilters
        );

    }


    const statusFilter =
        findCategoryElement([
            "categoryStatusFilter",
            "categoriesStatusFilter",
            "category-status-filter"
        ]);


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyCategoryFilters
        );

    }


    document
        .querySelectorAll(
            "#addCategoryBtn, .add-category-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    openCategoryForm();

                }
            );

        });


    document
        .querySelectorAll(
            "#exportCategories, .export-categories"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                exportCategories
            );

        });


    document
        .querySelectorAll(
            "#clearCategoryFilters, .clear-category-filters"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                clearCategoryFilters
            );

        });


    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-category-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.categoryAction;


            const categoryId =
                button.dataset.id;


            if (action === "view") {

                viewCategory(
                    categoryId
                );

            }


            if (action === "edit") {

                editCategory(
                    categoryId
                );

            }


            if (action === "delete") {

                deleteCategory(
                    categoryId
                );

            }

        }
    );


    const categoryForm =
        document.getElementById(
            "categoryForm"
        );


    if (categoryForm) {

        categoryForm.addEventListener(
            "submit",
            handleCategorySubmit
        );

    }


    document
        .querySelectorAll(
            "#closeCategoryModal, .close-category-modal"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                closeCategoryModal
            );

        });

}


/* =========================================================
   6. FILTER CATEGORIES
========================================================= */

function applyCategoryFilters() {

    const search =
        findCategoryElement([
            "categorySearch",
            "categoriesSearch",
            "category-search",
            "searchCategories"
        ]);


    const statusFilter =
        findCategoryElement([
            "categoryStatusFilter",
            "categoriesStatusFilter",
            "category-status-filter"
        ]);


    const searchTerm =
        (
            search?.value || ""
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter?.value || "";


    filteredCategories =
        allCategories.filter(
            category => {

                const searchable = [

                    category.name,

                    category.categoryName,

                    category.description

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
                    category.status ||
                    "Active";


                const matchesStatus =
                    !selectedStatus ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    currentCategoryPage = 1;

    sortCategories();

    renderCategories();
}


/* =========================================================
   7. SORT CATEGORIES
========================================================= */

function sortCategories() {

    filteredCategories.sort(
        (a, b) => {

            const nameA =
                (
                    a.name ||
                    a.categoryName ||
                    ""
                ).toLowerCase();


            const nameB =
                (
                    b.name ||
                    b.categoryName ||
                    ""
                ).toLowerCase();


            return nameA.localeCompare(
                nameB
            );

        }
    );
}


/* =========================================================
   8. OPEN CATEGORY FORM
========================================================= */

function openCategoryForm() {

    editingCategoryId = null;


    const form =
        document.getElementById(
            "categoryForm"
        );


    if (form) {

        form.reset();

    }


    setCategoryModalTitle(
        "Add Category"
    );


    const modal =
        document.getElementById(
            "categoryModal"
        );


    if (modal) {

        modal.style.display = "flex";

        modal.classList.add(
            "active"
        );

    }
}


/* =========================================================
   9. EDIT CATEGORY
========================================================= */

function editCategory(categoryId) {

    const category =
        findCategoryById(
            categoryId
        );


    if (!category) {

        showCategoryMessage(
            "Category not found.",
            "error"
        );

        return;
    }


    editingCategoryId =
        categoryId;


    const fields = {

        name:
            category.name ||
            category.categoryName ||
            "",

        description:
            category.description ||
            "",

        status:
            category.status ||
            "Active"

    };


    Object.entries(fields)
        .forEach(
            ([field, value]) => {

                const element =
                    findCategoryElement([
                        `category${capitalizeCategory(
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


    setCategoryModalTitle(
        "Edit Category"
    );


    const modal =
        document.getElementById(
            "categoryModal"
        );


    if (modal) {

        modal.style.display = "flex";

        modal.classList.add(
            "active"
        );

    }
}


/* =========================================================
   10. HANDLE CATEGORY FORM
========================================================= */

function handleCategorySubmit(event) {

    event.preventDefault();


    const name =
        getCategoryInput([
            "categoryName",
            "name"
        ]);


    const description =
        getCategoryInput([
            "categoryDescription",
            "description"
        ]);


    const status =
        getCategoryInput([
            "categoryStatus",
            "status"
        ]) || "Active";


    if (!name) {

        showCategoryMessage(
            "Category name is required.",
            "error"
        );

        return;
    }


    const duplicate =
        allCategories.some(
            category => {

                const categoryName =
                    category.name ||
                    category.categoryName ||
                    "";


                return (

                    categoryName
                        .toLowerCase() ===
                    name.toLowerCase()

                    &&

                    String(
                        category.id
                    ) !==
                    String(
                        editingCategoryId
                    )

                );

            }
        );


    if (duplicate) {

        showCategoryMessage(
            "A category with this name already exists.",
            "error"
        );

        return;
    }


    const categoryData = {

        name: name,

        categoryName: name,

        description: description,

        status: status,

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (editingCategoryId) {

            InventoryStorage.updateCategory(
                editingCategoryId,
                categoryData
            );


            showCategoryMessage(
                "Category updated successfully.",
                "success"
            );

        }
        else {

            categoryData.id =
                generateCategoryId();


            categoryData.createdAt =
                new Date().toISOString();


            InventoryStorage.addCategory(
                categoryData
            );


            if (
                typeof InventoryStorage.addActivity ===
                "function"
            ) {

                InventoryStorage.addActivity({

                    title:
                        "New Category",

                    description:
                        `${name} category was added.`,

                    timestamp:
                        new Date().toISOString()

                });

            }


            showCategoryMessage(
                "Category added successfully.",
                "success"
            );

        }


        editingCategoryId = null;


        loadCategories();

        updateCategoryStatistics();

        closeCategoryModal();


        if (event.target) {

            event.target.reset();

        }

    }
    catch (error) {

        console.error(error);


        showCategoryMessage(
            "Unable to save category.",
            "error"
        );

    }
}


/* =========================================================
   11. VIEW CATEGORY
========================================================= */

function viewCategory(categoryId) {

    const category =
        findCategoryById(
            categoryId
        );


    if (!category) {

        showCategoryMessage(
            "Category not found.",
            "error"
        );

        return;
    }


    const name =
        category.name ||
        category.categoryName ||
        "Unnamed Category";


    const productCount =
        getCategoryProductCount(
            category.id,
            name
        );


    const modal =
        document.getElementById(
            "categoryViewModal"
        );


    const details =
        createCategoryDetailsHTML(
            category,
            productCount
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


        modal.style.display = "flex";

        modal.classList.add(
            "active"
        );


        return;
    }


    alert(
        createCategoryDetailsText(
            category,
            productCount
        )
    );
}


/* =========================================================
   12. CATEGORY DETAILS HTML
========================================================= */

function createCategoryDetailsHTML(
    category,
    productCount
) {

    const name =
        category.name ||
        category.categoryName ||
        "Unnamed Category";


    return `

        <div class="category-details">

            <div class="category-profile">

                <div class="category-large-icon">

                    <i class="fas fa-tag"></i>

                </div>

                <div>

                    <h2>
                        ${escapeCategoryHTML(
                            name
                        )}
                    </h2>

                    <p>
                        Category
                    </p>

                </div>

            </div>


            <div class="category-info-grid">

                <div class="info-item">

                    <span>
                        Category ID
                    </span>

                    <strong>
                        ${escapeCategoryHTML(
                            category.id ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Products
                    </span>

                    <strong>
                        ${formatCategoryNumber(
                            productCount
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Status
                    </span>

                    <strong>

                        <span
                            class="status-badge ${getCategoryStatusClass(
                                category.status
                            )}"
                        >

                            ${escapeCategoryHTML(
                                category.status ||
                                "Active"
                            )}

                        </span>

                    </strong>

                </div>


                <div class="info-item">

                    <span>
                        Created
                    </span>

                    <strong>
                        ${
                            category.createdAt
                                ? formatCategoryDate(
                                    category.createdAt
                                )
                                : "-"
                        }
                    </strong>

                </div>

            </div>


            <div class="category-description">

                <strong>
                    Description
                </strong>

                <p>
                    ${escapeCategoryHTML(
                        category.description ||
                        "No description available."
                    )}
                </p>

            </div>

        </div>

    `;
}


/* =========================================================
   13. CATEGORY DETAILS TEXT
========================================================= */

function createCategoryDetailsText(
    category,
    productCount
) {

    const name =
        category.name ||
        category.categoryName ||
        "Unnamed Category";


    return (

        `CATEGORY DETAILS\n\n` +

        `Name: ${name}\n` +

        `ID: ${
            category.id ||
            "-"
        }\n` +

        `Products: ${productCount}\n` +

        `Status: ${
            category.status ||
            "Active"
        }\n` +

        `Created: ${
            category.createdAt
                ? formatCategoryDate(
                    category.createdAt
                )
                : "-"
        }\n\n` +

        `Description: ${
            category.description ||
            "No description available."
        }`

    );
}


/* =========================================================
   14. DELETE CATEGORY
========================================================= */

function deleteCategory(categoryId) {

    const category =
        findCategoryById(
            categoryId
        );


    if (!category) {

        showCategoryMessage(
            "Category not found.",
            "error"
        );

        return;
    }


    const name =
        category.name ||
        category.categoryName ||
        "this category";


    const productCount =
        getCategoryProductCount(
            category.id,
            name
        );


    let message =
        `Delete category "${name}"?`;


    if (productCount > 0) {

        message +=
            `\n\nThis category currently contains ${productCount} product(s).`;

    }


    message +=
        "\n\nThis action cannot be undone.";


    if (!confirm(message)) {

        return;

    }


    try {

        InventoryStorage.deleteCategory(
            categoryId
        );


        if (
            typeof InventoryStorage.addActivity ===
            "function"
        ) {

            InventoryStorage.addActivity({

                title:
                    "Category Deleted",

                description:
                    `${name} category was removed.`,

                timestamp:
                    new Date().toISOString()

            });

        }


        showCategoryMessage(
            "Category deleted successfully.",
            "success"
        );


        loadCategories();

        updateCategoryStatistics();

    }
    catch (error) {

        console.error(error);


        showCategoryMessage(
            "Unable to delete category.",
            "error"
        );

    }
}


/* =========================================================
   15. CATEGORY PRODUCT COUNT
========================================================= */

function getCategoryProductCount(
    categoryId,
    categoryName
) {

    if (
        typeof InventoryStorage.getProducts !==
        "function"
    ) {

        return 0;

    }


    const products =
        InventoryStorage.getProducts() || [];


    return products.filter(
        product => {

            if (product.categoryId) {

                return (
                    String(
                        product.categoryId
                    ) ===
                    String(
                        categoryId
                    )
                );

            }


            const productCategory =
                product.category ||
                product.categoryName ||
                "";


            return (
                String(
                    productCategory
                ).toLowerCase() ===
                String(
                    categoryName
                ).toLowerCase()
            );

        }
    ).length;
}


/* =========================================================
   16. CATEGORY STATISTICS
========================================================= */

function updateCategoryStatistics() {

    const total =
        allCategories.length;


    const active =
        allCategories.filter(
            category =>
                (
                    category.status ||
                    "Active"
                )
                    .toLowerCase() ===
                "active"
        ).length;


    const inactive =
        allCategories.filter(
            category =>
                (
                    category.status ||
                    ""
                )
                    .toLowerCase() ===
                "inactive"
        ).length;


    let totalProducts = 0;


    if (
        typeof InventoryStorage.getProducts ===
        "function"
    ) {

        totalProducts =
            InventoryStorage
                .getProducts()
                .length;

    }


    setCategoryText(
        [
            "totalCategories",
            "categoriesCount"
        ],
        formatCategoryNumber(
            total
        )
    );


    setCategoryText(
        [
            "activeCategories"
        ],
        formatCategoryNumber(
            active
        )
    );


    setCategoryText(
        [
            "inactiveCategories"
        ],
        formatCategoryNumber(
            inactive
        )
    );


    setCategoryText(
        [
            "categoryProducts",
            "totalCategoryProducts"
        ],
        formatCategoryNumber(
            totalProducts
        )
    );
}


/* =========================================================
   17. PAGINATION
========================================================= */

function updateCategoryPagination() {

    const pagination =
        findCategoryElement([
            "categoriesPagination",
            "categoryPagination"
        ]);


    if (!pagination) {

        return;

    }


    const totalPages =
        Math.ceil(
            filteredCategories.length /
            categoriesRowsPerPage
        );


    pagination.innerHTML = "";


    if (totalPages <= 1) {

        return;

    }


    const previous =
        document.createElement(
            "button"
        );


    previous.innerHTML =
        `<i class="fas fa-chevron-left"></i>`;


    previous.disabled =
        currentCategoryPage === 1;


    previous.onclick =
        function () {

            if (
                currentCategoryPage > 1
            ) {

                currentCategoryPage--;

                renderCategories();

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


        button.textContent = i;


        if (
            i === currentCategoryPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function () {

                currentCategoryPage =
                    i;

                renderCategories();

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
        currentCategoryPage ===
        totalPages;


    next.onclick =
        function () {

            if (
                currentCategoryPage <
                totalPages
            ) {

                currentCategoryPage++;

                renderCategories();

            }

        };


    pagination.appendChild(
        next
    );
}


/* =========================================================
   18. CLEAR FILTERS
========================================================= */

function clearCategoryFilters() {

    const search =
        findCategoryElement([
            "categorySearch",
            "categoriesSearch",
            "category-search",
            "searchCategories"
        ]);


    const status =
        findCategoryElement([
            "categoryStatusFilter",
            "categoriesStatusFilter",
            "category-status-filter"
        ]);


    if (search) {

        search.value = "";

    }


    if (status) {

        status.value = "";

    }


    currentCategoryPage = 1;


    filteredCategories =
        [...allCategories];


    sortCategories();

    renderCategories();
}


/* =========================================================
   19. EXPORT CATEGORIES
========================================================= */

function exportCategories() {

    if (
        filteredCategories.length === 0
    ) {

        showCategoryMessage(
            "No categories available for export.",
            "warning"
        );

        return;

    }


    const headers = [

        "Category ID",

        "Category Name",

        "Description",

        "Products",

        "Status",

        "Created Date"

    ];


    const rows =
        filteredCategories.map(
            category => {

                const name =
                    category.name ||
                    category.categoryName ||
                    "";


                return [

                    category.id || "",

                    name,

                    category.description ||
                        "",

                    getCategoryProductCount(
                        category.id,
                        name
                    ),

                    category.status ||
                        "Active",

                    category.createdAt
                        ? formatCategoryDate(
                            category.createdAt
                        )
                        : ""

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
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    link.download =
        `categories-${getCategoryFileDate()}.csv`;


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


    showCategoryMessage(
        "Categories exported successfully.",
        "success"
    );
}


/* =========================================================
   20. CLOSE CATEGORY MODAL
========================================================= */

function closeCategoryModal() {

    const modal =
        document.getElementById(
            "categoryModal"
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
            "categoryViewModal"
        );


    if (viewModal) {

        viewModal.classList.remove(
            "active"
        );

        viewModal.style.display =
            "none";

    }


    editingCategoryId = null;
}


/* =========================================================
   21. FIND CATEGORY
========================================================= */

function findCategoryById(
    categoryId
) {

    return allCategories.find(
        category =>
            String(
                category.id
            ) ===
            String(
                categoryId
            )
    );
}


/* =========================================================
   22. GENERATE CATEGORY ID
========================================================= */

function generateCategoryId() {

    return (

        "CAT-" +

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
   23. FIND ELEMENT
========================================================= */

function findCategoryElement(
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
   24. GET INPUT
========================================================= */

function getCategoryInput(
    ids
) {

    const element =
        findCategoryElement(
            ids
        );


    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   25. SET TEXT
========================================================= */

function setCategoryText(
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
   26. SET MODAL TITLE
========================================================= */

function setCategoryModalTitle(
    title
) {

    const titleElement =
        findCategoryElement([
            "categoryModalTitle",
            "modalCategoryTitle"
        ]);


    if (titleElement) {

        titleElement.textContent =
            title;

    }
}


/* =========================================================
   27. CAPITALIZE
========================================================= */

function capitalizeCategory(
    text
) {

    if (!text) {

        return "";

    }


    return (

        text.charAt(0).toUpperCase() +

        text.slice(1)

    );
}


/* =========================================================
   28. FORMAT NUMBER
========================================================= */

function formatCategoryNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );
}


/* =========================================================
   29. FORMAT DATE
========================================================= */

function formatCategoryDate(
    date
) {

    const parsed =
        new Date(date);


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
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   30. STATUS CLASS
========================================================= */

function getCategoryStatusClass(
    status
) {

    const value =
        String(
            status ||
            "Active"
        ).toLowerCase();


    if (
        value === "active"
    ) {

        return "status-success";

    }


    if (
        value === "inactive"
    ) {

        return "status-danger";

    }


    if (
        value === "pending"
    ) {

        return "status-warning";

    }


    return "status-neutral";
}


/* =========================================================
   31. FILE DATE
========================================================= */

function getCategoryFileDate() {

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
   32. SHOW MESSAGE
========================================================= */

function showCategoryMessage(
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
   33. ESCAPE HTML
========================================================= */

function escapeCategoryHTML(
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
   34. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadCategories();

            updateCategoryStatistics();

        }

    },
    60000
);


/* =========================================================
   35. PUBLIC API
========================================================= */

window.InventoryCategories = {

    initialize:
        initializeCategories,

    load:
        loadCategories,

    refresh:
        loadCategories,

    filter:
        applyCategoryFilters,

    clearFilters:
        clearCategoryFilters,

    add:
        openCategoryForm,

    edit:
        editCategory,

    view:
        viewCategory,

    delete:
        deleteCategory,

    export:
        exportCategories

};


/* =========================================================
   END OF CATEGORIES.JS
========================================================= */