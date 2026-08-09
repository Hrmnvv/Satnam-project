/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   PRODUCTS JAVASCRIPT
   File: js/products.js

   Features:
   - Load products
   - Display products in table
   - Search products
   - Filter by category
   - Filter by stock status
   - Sort products
   - Pagination
   - Delete products
   - Edit products
   - View product details
   - Add product navigation
   - Export products
   - Stock status
   - Product statistics
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let allProducts = [];

let filteredProducts = [];

let currentPage = 1;

let rowsPerPage = 10;

let currentSort =
    "name";

let currentSortDirection =
    "asc";


/* =========================================================
   2. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeProducts();

    }
);


function initializeProducts() {

    if (
        typeof InventoryStorage ===
        "undefined"
    ) {

        console.error(
            "InventoryStorage is not loaded."
        );

        return;

    }


    loadProducts();

    loadCategories();

    setupProductEvents();

    setupSearch();

    setupFilters();

    setupSorting();

    updateProductStatistics();

}


/* =========================================================
   3. LOAD PRODUCTS
========================================================= */

function loadProducts() {

    allProducts =
        InventoryStorage
            .getProducts() || [];


    filteredProducts =
        [...allProducts];


    sortProducts();

    renderProducts();

}


/* =========================================================
   4. RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const tableBody =
        findProductTableBody();


    if (!tableBody) {

        console.warn(
            "Product table body not found."
        );

        return;

    }


    /*
       Calculate pagination.
    */

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            rowsPerPage
        );


    if (
        currentPage >
        totalPages &&
        totalPages > 0
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (
            currentPage -
            1
        ) *
        rowsPerPage;


    const endIndex =
        startIndex +
        rowsPerPage;


    const productsToShow =
        filteredProducts.slice(
            startIndex,
            endIndex
        );


    /*
       Empty state.
    */

    if (
        productsToShow.length ===
        0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-box-open"></i>

                        <h3>
                            No Products Found
                        </h3>

                        <p>
                            Try changing your search
                            or filter options.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        updatePagination();

        return;

    }


    /*
       Generate rows.
    */

    tableBody.innerHTML =
        productsToShow
            .map(
                product =>
                    createProductRow(
                        product
                    )
            )
            .join("");


    updatePagination();

}


/* =========================================================
   5. CREATE PRODUCT ROW
========================================================= */

function createProductRow(
    product
) {

    const stock =
        Number(
            product.stock || 0
        );


    const minimumStock =
        Number(
            product.minStock || 0
        );


    const sellingPrice =
        Number(
            product.sellingPrice ||
            product.price ||
            0
        );


    const purchasePrice =
        Number(
            product.purchasePrice ||
            0
        );


    const stockStatus =
        getStockStatus(
            stock,
            minimumStock
        );


    const productImage =
        product.image ||
        "../assets/images/logo.png";


    return `

        <tr
            data-product-id="${escapeHTML(
                product.id
            )}"
        >

            <!-- PRODUCT -->

            <td>

                <div class="product-cell">

                    <img
                        src="${escapeHTML(
                            productImage
                        )}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                        class="product-image"
                        onerror="this.style.display='none'"
                    >

                    <div>

                        <strong>
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                product.sku ||
                                "-"
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <!-- SKU -->

            <td>

                ${escapeHTML(
                    product.sku ||
                    "-"
                )}

            </td>


            <!-- CATEGORY -->

            <td>

                ${escapeHTML(
                    product.category ||
                    "-"
                )}

            </td>


            <!-- PURCHASE PRICE -->

            <td>

                ${formatCurrency(
                    purchasePrice
                )}

            </td>


            <!-- SELLING PRICE -->

            <td>

                ${formatCurrency(
                    sellingPrice
                )}

            </td>


            <!-- STOCK -->

            <td>

                <strong>
                    ${formatNumber(
                        stock
                    )}
                </strong>

            </td>


            <!-- STATUS -->

            <td>

                <span
                    class="stock-badge ${stockStatus.className}"
                >

                    ${stockStatus.label}

                </span>

            </td>


            <!-- SUPPLIER -->

            <td>

                ${escapeHTML(
                    product.supplier ||
                    "-"
                )}

            </td>


            <!-- ACTIONS -->

            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        title="View Product"
                        data-action="view"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn edit-btn"
                        title="Edit Product"
                        data-action="edit"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <i class="fas fa-edit"></i>

                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Product"
                        data-action="delete"
                        data-id="${escapeHTML(
                            product.id
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
   6. STOCK STATUS
========================================================= */

function getStockStatus(
    stock,
    minimumStock
) {

    stock =
        Number(stock || 0);


    minimumStock =
        Number(
            minimumStock || 0
        );


    if (
        stock <= 0
    ) {

        return {

            label:
                "Out of Stock",

            className:
                "out-of-stock"

        };

    }


    if (
        stock <= minimumStock
    ) {

        return {

            label:
                "Low Stock",

            className:
                "low-stock"

        };

    }


    return {

        label:
            "In Stock",

        className:
            "in-stock"

    };

}


/* =========================================================
   7. SEARCH
========================================================= */

function setupSearch() {

    const searchInput =
        findFirstElement([
            "productSearch",
            "product-search",
            "searchProducts",
            "search"
        ]);


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "input",
        function () {

            applyFilters();

        }
    );

}


/* =========================================================
   8. FILTERS
========================================================= */

function setupFilters() {

    const categoryFilter =
        findFirstElement([
            "categoryFilter",
            "category-filter",
            "productCategoryFilter"
        ]);


    const stockFilter =
        findFirstElement([
            "stockFilter",
            "stock-filter",
            "stockStatusFilter"
        ]);


    const supplierFilter =
        findFirstElement([
            "supplierFilter",
            "supplier-filter"
        ]);


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                applyFilters();

            }
        );

    }


    if (stockFilter) {

        stockFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                applyFilters();

            }
        );

    }


    if (supplierFilter) {

        supplierFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                applyFilters();

            }
        );

    }

}


/* =========================================================
   9. APPLY FILTERS
========================================================= */

function applyFilters() {

    const searchInput =
        findFirstElement([
            "productSearch",
            "product-search",
            "searchProducts",
            "search"
        ]);


    const categoryFilter =
        findFirstElement([
            "categoryFilter",
            "category-filter",
            "productCategoryFilter"
        ]);


    const stockFilter =
        findFirstElement([
            "stockFilter",
            "stock-filter",
            "stockStatusFilter"
        ]);


    const supplierFilter =
        findFirstElement([
            "supplierFilter",
            "supplier-filter"
        ]);


    const searchTerm =
        (
            searchInput
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const category =
        categoryFilter
            ?.value ||
        "";


    const stockStatus =
        stockFilter
            ?.value ||
        "";


    const supplier =
        supplierFilter
            ?.value ||
        "";


    filteredProducts =
        allProducts.filter(
            product => {

                /*
                   Search
                */

                const searchableText =
                    [

                        product.name,

                        product.sku,

                        product.category,

                        product.supplier,

                        product.description

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );


                /*
                   Category
                */

                const matchesCategory =
                    !category ||
                    product.category ===
                    category;


                /*
                   Supplier
                */

                const matchesSupplier =
                    !supplier ||
                    product.supplier ===
                    supplier;


                /*
                   Stock status
                */

                let matchesStock =
                    true;


                const stock =
                    Number(
                        product.stock ||
                        0
                    );


                const minimum =
                    Number(
                        product.minStock ||
                        0
                    );


                if (
                    stockStatus ===
                    "in-stock"
                ) {

                    matchesStock =
                        stock >
                        minimum;

                }


                if (
                    stockStatus ===
                    "low-stock"
                ) {

                    matchesStock =
                        stock > 0 &&
                        stock <= minimum;

                }


                if (
                    stockStatus ===
                    "out-of-stock"
                ) {

                    matchesStock =
                        stock <= 0;

                }


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesSupplier &&
                    matchesStock
                );

            }
        );


    currentPage =
        1;


    sortProducts();

    renderProducts();

}


/* =========================================================
   10. LOAD CATEGORIES
========================================================= */

function loadCategories() {

    const categories =
        InventoryStorage
            .getCategories() || [];


    const categoryFilters =
        document.querySelectorAll(
            "#categoryFilter, #category-filter, #productCategoryFilter"
        );


    categoryFilters.forEach(
        select => {

            /*
               Keep first default option.
            */

            const firstOption =
                select.querySelector(
                    "option"
                );


            select.innerHTML = "";


            if (firstOption) {

                select.appendChild(
                    firstOption
                );

            } else {

                select.innerHTML = `
                    <option value="">
                        All Categories
                    </option>
                `;

            }


            categories.forEach(
                category => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        category.name;


                    option.textContent =
                        category.name;


                    select.appendChild(
                        option
                    );

                }
            );

        }
    );

}


/* =========================================================
   11. SORTING
========================================================= */

function setupSorting() {

    const sortSelect =
        findFirstElement([
            "productSort",
            "product-sort",
            "sortProducts"
        ]);


    if (!sortSelect) {

        return;

    }


    sortSelect.addEventListener(
        "change",
        function () {

            currentSort =
                this.value;

            currentPage =
                1;

            sortProducts();

            renderProducts();

        }
    );


    /*
       Sort table headers.
    */

    document
        .querySelectorAll(
            "[data-sort]"
        )
        .forEach(
            header => {

                header.addEventListener(
                    "click",
                    function () {

                        const sortField =
                            this.dataset.sort;


                        if (
                            currentSort ===
                            sortField
                        ) {

                            currentSortDirection =
                                currentSortDirection ===
                                "asc"
                                    ? "desc"
                                    : "asc";

                        } else {

                            currentSort =
                                sortField;

                            currentSortDirection =
                                "asc";

                        }


                        sortProducts();

                        renderProducts();

                    }
                );

            }
        );

}


/* =========================================================
   12. SORT PRODUCTS
========================================================= */

function sortProducts() {

    const multiplier =
        currentSortDirection ===
        "asc"
            ? 1
            : -1;


    filteredProducts.sort(
        (
            a,
            b
        ) => {

            let valueA;

            let valueB;


            switch (
                currentSort
            ) {

                case "price":

                    valueA =
                        Number(
                            a.sellingPrice ||
                            a.price ||
                            0
                        );

                    valueB =
                        Number(
                            b.sellingPrice ||
                            b.price ||
                            0
                        );

                    break;


                case "stock":

                    valueA =
                        Number(
                            a.stock ||
                            0
                        );

                    valueB =
                        Number(
                            b.stock ||
                            0
                        );

                    break;


                case "category":

                    valueA =
                        String(
                            a.category ||
                            ""
                        ).toLowerCase();

                    valueB =
                        String(
                            b.category ||
                            ""
                        ).toLowerCase();

                    break;


                case "createdAt":

                    valueA =
                        new Date(
                            a.createdAt ||
                            0
                        ).getTime();

                    valueB =
                        new Date(
                            b.createdAt ||
                            0
                        ).getTime();

                    break;


                case "name":

                default:

                    valueA =
                        String(
                            a.name ||
                            ""
                        ).toLowerCase();

                    valueB =
                        String(
                            b.name ||
                            ""
                        ).toLowerCase();

                    break;

            }


            if (
                valueA <
                valueB
            ) {

                return -1 *
                    multiplier;

            }


            if (
                valueA >
                valueB
            ) {

                return 1 *
                    multiplier;

            }


            return 0;

        }
    );

}


/* =========================================================
   13. PAGINATION
========================================================= */

function updatePagination() {

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            rowsPerPage
        );


    const pagination =
        findFirstElement([
            "pagination",
            "productPagination"
        ]);


    if (!pagination) {

        return;

    }


    pagination.innerHTML = "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    /*
       Previous
    */

    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.innerHTML =
        `<i class="fas fa-chevron-left"></i>`;


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderProducts();

            }

        }
    );


    pagination.appendChild(
        previousButton
    );


    /*
       Page numbers
    */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            page;


        if (
            page ===
            currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderProducts();

            }
        );


        pagination.appendChild(
            button
        );

    }


    /*
       Next
    */

    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.innerHTML =
        `<i class="fas fa-chevron-right"></i>`;


    nextButton.disabled =
        currentPage ===
        totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderProducts();

            }

        }
    );


    pagination.appendChild(
        nextButton
    );


    /*
       Page information
    */

    const pageInfo =
        document.createElement(
            "span"
        );


    pageInfo.className =
        "pagination-info";


    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;


    pagination.appendChild(
        pageInfo
    );

}


/* =========================================================
   14. PRODUCT EVENTS
========================================================= */

function setupProductEvents() {

    /*
       Event delegation for table actions.
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const productId =
                button.dataset.id;


            if (
                action ===
                "view"
            ) {

                viewProduct(
                    productId
                );

            }


            if (
                action ===
                "edit"
            ) {

                editProduct(
                    productId
                );

            }


            if (
                action ===
                "delete"
            ) {

                deleteProduct(
                    productId
                );

            }

        }
    );


    /*
       Add Product buttons.
    */

    document
        .querySelectorAll(
            "#addProductBtn, .add-product-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            "add-product.html";

                    }
                );

            }
        );


    /*
       Export button.
    */

    document
        .querySelectorAll(
            "#exportProducts, .export-products"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    exportProducts
                );

            }
        );


    /*
       Clear filters.
    */

    document
        .querySelectorAll(
            "#clearFilters, .clear-filters"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    clearFilters
                );

            }
        );


    /*
       Rows per page.
    */

    const rowsSelect =
        findFirstElement([
            "rowsPerPage",
            "rows-per-page"
        ]);


    if (rowsSelect) {

        rowsSelect.addEventListener(
            "change",
            function () {

                rowsPerPage =
                    Number(
                        this.value
                    ) || 10;


                currentPage =
                    1;


                renderProducts();

            }
        );

    }

}


/* =========================================================
   15. VIEW PRODUCT
========================================================= */

function viewProduct(
    productId
) {

    const product =
        findProductById(
            productId
        );


    if (!product) {

        showMessage(
            "Product not found.",
            "error"
        );

        return;

    }


    /*
       If a product details modal exists,
       use it.
    */

    const modal =
        document.getElementById(
            "productModal"
        );


    if (modal) {

        showProductModal(
            product,
            modal
        );

        return;

    }


    /*
       Otherwise show details.
    */

    const details = [

        `Product: ${product.name || "-"}`,

        `SKU: ${product.sku || "-"}`,

        `Category: ${product.category || "-"}`,

        `Stock: ${product.stock || 0}`,

        `Minimum Stock: ${product.minStock || 0}`,

        `Purchase Price: ${formatCurrency(product.purchasePrice || 0)}`,

        `Selling Price: ${formatCurrency(product.sellingPrice || product.price || 0)}`,

        `Supplier: ${product.supplier || "-"}`

    ];


    alert(
        details.join("\n")
    );

}


/* =========================================================
   16. PRODUCT MODAL
========================================================= */

function showProductModal(
    product,
    modal
) {

    const modalBody =
        modal.querySelector(
            ".modal-body"
        );


    if (!modalBody) {

        return;

    }


    modalBody.innerHTML = `

        <div class="product-details">

            <h2>
                ${escapeHTML(
                    product.name
                )}
            </h2>

            <div class="detail-grid">

                <div>
                    <strong>SKU</strong>
                    <span>
                        ${escapeHTML(
                            product.sku || "-"
                        )}
                    </span>
                </div>

                <div>
                    <strong>Category</strong>
                    <span>
                        ${escapeHTML(
                            product.category || "-"
                        )}
                    </span>
                </div>

                <div>
                    <strong>Stock</strong>
                    <span>
                        ${formatNumber(
                            product.stock
                        )}
                    </span>
                </div>

                <div>
                    <strong>Minimum Stock</strong>
                    <span>
                        ${formatNumber(
                            product.minStock
                        )}
                    </span>
                </div>

                <div>
                    <strong>Purchase Price</strong>
                    <span>
                        ${formatCurrency(
                            product.purchasePrice
                        )}
                    </span>
                </div>

                <div>
                    <strong>Selling Price</strong>
                    <span>
                        ${formatCurrency(
                            product.sellingPrice ||
                            product.price
                        )}
                    </span>
                </div>

                <div>
                    <strong>Supplier</strong>
                    <span>
                        ${escapeHTML(
                            product.supplier || "-"
                        )}
                    </span>
                </div>

                <div>
                    <strong>Status</strong>
                    <span>
                        ${
                            getStockStatus(
                                product.stock,
                                product.minStock
                            ).label
                        }
                    </span>
                </div>

            </div>

            <div class="product-description">

                <strong>
                    Description
                </strong>

                <p>
                    ${escapeHTML(
                        product.description ||
                        "No description available."
                    )}
                </p>

            </div>

        </div>

    `;


    modal.classList.add(
        "active"
    );


    modal.style.display =
        "flex";

}


/* =========================================================
   17. EDIT PRODUCT
========================================================= */

function editProduct(
    productId
) {

    const product =
        findProductById(
            productId
        );


    if (!product) {

        showMessage(
            "Product not found.",
            "error"
        );

        return;

    }


    /*
       Save ID for add-product.html
    */

    localStorage.setItem(
        "editingProductId",
        product.id
    );


    window.location.href =
        "add-product.html";

}


/* =========================================================
   18. DELETE PRODUCT
========================================================= */

function deleteProduct(
    productId
) {

    const product =
        findProductById(
            productId
        );


    if (!product) {

        showMessage(
            "Product not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        InventoryStorage
            .deleteProduct(
                productId
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
                        "Product Deleted",

                    description:
                        `${product.name} was deleted from inventory.`,

                    timestamp:
                        new Date().toISOString()

                });

        }


        showMessage(
            "Product deleted successfully.",
            "success"
        );


        loadProducts();

        updateProductStatistics();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showMessage(
            "Unable to delete product.",
            "error"
        );

    }

}


/* =========================================================
   19. FIND PRODUCT
========================================================= */

function findProductById(
    productId
) {

    return allProducts.find(
        product =>
            String(product.id) ===
            String(productId)
    );

}


/* =========================================================
   20. PRODUCT STATISTICS
========================================================= */

function updateProductStatistics() {

    const totalProducts =
        allProducts.length;


    const totalStock =
        allProducts.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(
                    product.stock || 0
                ),
            0
        );


    const lowStock =
        allProducts.filter(
            product =>
                Number(
                    product.stock || 0
                ) > 0 &&
                Number(
                    product.stock || 0
                ) <=
                Number(
                    product.minStock || 0
                )
        ).length;


    const outOfStock =
        allProducts.filter(
            product =>
                Number(
                    product.stock || 0
                ) <= 0
        ).length;


    const inventoryValue =
        allProducts.reduce(
            (
                total,
                product
            ) =>
                total +
                (
                    Number(
                        product.stock || 0
                    ) *
                    Number(
                        product.purchasePrice ||
                        0
                    )
                ),
            0
        );


    setText(
        [
            "totalProducts",
            "productCount",
            "productsCount"
        ],
        formatNumber(
            totalProducts
        )
    );


    setText(
        [
            "totalStock",
            "stockCount"
        ],
        formatNumber(
            totalStock
        )
    );


    setText(
        [
            "lowStock",
            "lowStockCount"
        ],
        formatNumber(
            lowStock
        )
    );


    setText(
        [
            "outOfStock",
            "outOfStockCount"
        ],
        formatNumber(
            outOfStock
        )
    );


    setText(
        [
            "inventoryValue"
        ],
        formatCurrency(
            inventoryValue
        )
    );


    /*
       Display filtered count.
    */

    setText(
        [
            "filteredProductCount"
        ],
        formatNumber(
            filteredProducts.length
        )
    );

}


/* =========================================================
   21. CLEAR FILTERS
========================================================= */

function clearFilters() {

    const searchInput =
        findFirstElement([
            "productSearch",
            "product-search",
            "searchProducts",
            "search"
        ]);


    const categoryFilter =
        findFirstElement([
            "categoryFilter",
            "category-filter",
            "productCategoryFilter"
        ]);


    const stockFilter =
        findFirstElement([
            "stockFilter",
            "stock-filter",
            "stockStatusFilter"
        ]);


    const supplierFilter =
        findFirstElement([
            "supplierFilter",
            "supplier-filter"
        ]);


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (categoryFilter) {

        categoryFilter.value =
            "";

    }


    if (stockFilter) {

        stockFilter.value =
            "";

    }


    if (supplierFilter) {

        supplierFilter.value =
            "";

    }


    currentPage =
        1;


    filteredProducts =
        [...allProducts];


    sortProducts();

    renderProducts();

}


/* =========================================================
   22. EXPORT PRODUCTS
========================================================= */

function exportProducts() {

    if (
        filteredProducts.length ===
        0
    ) {

        showMessage(
            "There are no products to export.",
            "warning"
        );

        return;

    }


    const headers = [

        "Product Name",

        "SKU",

        "Category",

        "Purchase Price",

        "Selling Price",

        "Stock",

        "Minimum Stock",

        "Supplier",

        "Status"

    ];


    const rows =
        filteredProducts.map(
            product => {

                const status =
                    getStockStatus(
                        product.stock,
                        product.minStock
                    ).label;


                return [

                    product.name,

                    product.sku,

                    product.category,

                    product.purchasePrice,

                    product.sellingPrice ||
                        product.price,

                    product.stock,

                    product.minStock,

                    product.supplier,

                    status

                ];

            }
        );


    const csvData =
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
                csvData
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
        `inventory-products-${getFileDate()}.csv`;


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
        "Products exported successfully.",
        "success"
    );

}


/* =========================================================
   23. FILE DATE
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
   24. FORMAT NUMBER
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
   25. FORMAT CURRENCY
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
   26. SET TEXT
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
   27. FIND FIRST ELEMENT
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
   28. FIND TABLE BODY
========================================================= */

function findProductTableBody() {

    return findFirstElement([

        "productsTableBody",

        "productTableBody",

        "productsTable",

        "productTable"

    ]);

}


/* =========================================================
   29. SHOW MESSAGE
========================================================= */

function showMessage(
    message,
    type = "info"
) {

    /*
       Use global toast from app.js
       if available.
    */

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


    /*
       Fallback.
    */

    console.log(
        `[${type.toUpperCase()}] ${message}`
    );

}


/* =========================================================
   30. ESCAPE HTML
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
   31. AUTO REFRESH
========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadProducts();

            updateProductStatistics();

        }

    },
    60000
);


/* =========================================================
   32. PUBLIC PRODUCTS API
========================================================= */

window.InventoryProducts = {

    initialize:
        initializeProducts,

    load:
        loadProducts,

    refresh:
        loadProducts,

    search:
        applyFilters,

    clearFilters:
        clearFilters,

    view:
        viewProduct,

    edit:
        editProduct,

    delete:
        deleteProduct,

    export:
        exportProducts

};


/* =========================================================
   END OF PRODUCTS.JS
========================================================= */