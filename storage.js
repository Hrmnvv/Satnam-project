/* =========================================================
   INVENTORY MANAGEMENT SYSTEM
   LOCAL STORAGE DATABASE
   File: js/storage.js

   This file manages:
   - Products
   - Sales
   - Purchases
   - Suppliers
   - Customers
   - Categories
   - Notifications
   - Application settings
========================================================= */


/* =========================================================
   1. DATABASE CONFIGURATION
========================================================= */

const IMS_DB = {

    version: 1,

    keys: {

        products: "ims_products",

        sales: "ims_sales",

        purchases: "ims_purchases",

        suppliers: "ims_suppliers",

        customers: "ims_customers",

        categories: "ims_categories",

        notifications: "ims_notifications",

        settings: "ims_settings",

        activity: "ims_activity",

        initialized: "ims_database_initialized"

    }

};


/* =========================================================
   2. DEFAULT DATA
========================================================= */

const DEFAULT_CATEGORIES = [

    {
        id: "CAT-001",
        name: "Electronics",
        description: "Electronic devices and accessories",
        status: "Active",
        createdAt: "2026-01-10T10:00:00"
    },

    {
        id: "CAT-002",
        name: "Office Supplies",
        description: "Stationery and office products",
        status: "Active",
        createdAt: "2026-01-12T10:00:00"
    },

    {
        id: "CAT-003",
        name: "Furniture",
        description: "Office and household furniture",
        status: "Active",
        createdAt: "2026-01-15T10:00:00"
    },

    {
        id: "CAT-004",
        name: "Computer Accessories",
        description: "Computer peripherals and accessories",
        status: "Active",
        createdAt: "2026-01-18T10:00:00"
    }

];


const DEFAULT_SUPPLIERS = [

    {
        id: "SUP-001",
        name: "Tech World Supplies",
        contactPerson: "Rahul Sharma",
        phone: "9876543210",
        email: "techworld@example.com",
        address: "Chandigarh, Punjab",
        gst: "03ABCDE1234F1Z5",
        status: "Active",
        createdAt: "2026-01-10T10:00:00"
    },

    {
        id: "SUP-002",
        name: "Global Office Mart",
        contactPerson: "Aman Verma",
        phone: "9876501234",
        email: "globaloffice@example.com",
        address: "Mohali, Punjab",
        gst: "03BCDEF2345G1Z6",
        status: "Active",
        createdAt: "2026-01-12T10:00:00"
    },

    {
        id: "SUP-003",
        name: "Digital Solutions",
        contactPerson: "Simran Kaur",
        phone: "9812345678",
        email: "digitalsolutions@example.com",
        address: "Ludhiana, Punjab",
        gst: "03CDEFG3456H1Z7",
        status: "Active",
        createdAt: "2026-01-15T10:00:00"
    }

];


const DEFAULT_CUSTOMERS = [

    {
        id: "CUS-001",
        name: "Arjun Enterprises",
        phone: "9876543211",
        email: "arjun@example.com",
        address: "Amritsar, Punjab",
        totalPurchases: 45000,
        status: "Active",
        createdAt: "2026-01-10T10:00:00"
    },

    {
        id: "CUS-002",
        name: "Punjab Traders",
        phone: "9876543212",
        email: "punjabtraders@example.com",
        address: "Jalandhar, Punjab",
        totalPurchases: 32500,
        status: "Active",
        createdAt: "2026-01-15T10:00:00"
    },

    {
        id: "CUS-003",
        name: "City Electronics",
        phone: "9876543213",
        email: "cityelectronics@example.com",
        address: "Chandigarh, Punjab",
        totalPurchases: 58700,
        status: "Active",
        createdAt: "2026-01-20T10:00:00"
    }

];


const DEFAULT_PRODUCTS = [

    {
        id: "PRD-001",
        name: "Wireless Keyboard",
        sku: "KB-WRL-001",
        category: "Computer Accessories",
        supplier: "Tech World Supplies",
        purchasePrice: 850,
        sellingPrice: 1299,
        stock: 45,
        minStock: 10,
        unit: "Piece",
        description: "Wireless keyboard with USB receiver",
        status: "Active",
        createdAt: "2026-02-01T10:00:00",
        updatedAt: "2026-02-01T10:00:00"
    },

    {
        id: "PRD-002",
        name: "Wireless Mouse",
        sku: "MS-WRL-001",
        category: "Computer Accessories",
        supplier: "Tech World Supplies",
        purchasePrice: 500,
        sellingPrice: 799,
        stock: 62,
        minStock: 15,
        unit: "Piece",
        description: "Ergonomic wireless mouse",
        status: "Active",
        createdAt: "2026-02-02T10:00:00",
        updatedAt: "2026-02-02T10:00:00"
    },

    {
        id: "PRD-003",
        name: "USB-C Cable",
        sku: "USB-C-001",
        category: "Electronics",
        supplier: "Digital Solutions",
        purchasePrice: 180,
        sellingPrice: 349,
        stock: 8,
        minStock: 15,
        unit: "Piece",
        description: "High-speed USB-C charging cable",
        status: "Active",
        createdAt: "2026-02-03T10:00:00",
        updatedAt: "2026-02-03T10:00:00"
    },

    {
        id: "PRD-004",
        name: "Office Chair",
        sku: "CHR-OFF-001",
        category: "Furniture",
        supplier: "Global Office Mart",
        purchasePrice: 4500,
        sellingPrice: 6999,
        stock: 18,
        minStock: 5,
        unit: "Piece",
        description: "Ergonomic office chair",
        status: "Active",
        createdAt: "2026-02-05T10:00:00",
        updatedAt: "2026-02-05T10:00:00"
    },

    {
        id: "PRD-005",
        name: "A4 Notebook",
        sku: "NOTE-A4-001",
        category: "Office Supplies",
        supplier: "Global Office Mart",
        purchasePrice: 65,
        sellingPrice: 99,
        stock: 120,
        minStock: 30,
        unit: "Piece",
        description: "A4 ruled notebook",
        status: "Active",
        createdAt: "2026-02-06T10:00:00",
        updatedAt: "2026-02-06T10:00:00"
    },

    {
        id: "PRD-006",
        name: "Bluetooth Speaker",
        sku: "SPK-BT-001",
        category: "Electronics",
        supplier: "Digital Solutions",
        purchasePrice: 1200,
        sellingPrice: 1899,
        stock: 6,
        minStock: 10,
        unit: "Piece",
        description: "Portable Bluetooth speaker",
        status: "Active",
        createdAt: "2026-02-08T10:00:00",
        updatedAt: "2026-02-08T10:00:00"
    }

];


const DEFAULT_SALES = [

    {
        id: "SAL-1001",
        invoice: "INV-2026-001",
        customer: "Arjun Enterprises",
        customerId: "CUS-001",

        items: [
            {
                productId: "PRD-001",
                productName: "Wireless Keyboard",
                quantity: 2,
                price: 1299,
                total: 2598
            }
        ],

        subtotal: 2598,
        tax: 467.64,
        discount: 0,
        total: 3065.64,

        paymentMethod: "UPI",
        paymentStatus: "Paid",
        status: "Completed",

        date: "2026-08-01T11:30:00",

        createdAt: "2026-08-01T11:30:00"

    },

    {
        id: "SAL-1002",
        invoice: "INV-2026-002",
        customer: "Punjab Traders",
        customerId: "CUS-002",

        items: [
            {
                productId: "PRD-005",
                productName: "A4 Notebook",
                quantity: 20,
                price: 99,
                total: 1980
            }
        ],

        subtotal: 1980,
        tax: 356.40,
        discount: 0,
        total: 2336.40,

        paymentMethod: "Cash",
        paymentStatus: "Paid",
        status: "Completed",

        date: "2026-08-03T14:20:00",

        createdAt: "2026-08-03T14:20:00"

    }

];


const DEFAULT_PURCHASES = [

    {
        id: "PUR-1001",
        billNumber: "PUR-2026-001",
        supplier: "Tech World Supplies",
        supplierId: "SUP-001",

        items: [
            {
                productId: "PRD-001",
                productName: "Wireless Keyboard",
                quantity: 20,
                price: 850,
                total: 17000
            }
        ],

        subtotal: 17000,
        tax: 3060,
        discount: 0,
        total: 20060,

        paymentMethod: "Bank Transfer",
        paymentStatus: "Paid",
        status: "Received",

        date: "2026-07-28T10:30:00",

        createdAt: "2026-07-28T10:30:00"

    },

    {
        id: "PUR-1002",
        billNumber: "PUR-2026-002",
        supplier: "Global Office Mart",
        supplierId: "SUP-002",

        items: [
            {
                productId: "PRD-005",
                productName: "A4 Notebook",
                quantity: 100,
                price: 65,
                total: 6500
            }
        ],

        subtotal: 6500,
        tax: 1170,
        discount: 0,
        total: 7670,

        paymentMethod: "Cash",
        paymentStatus: "Paid",
        status: "Received",

        date: "2026-07-30T12:15:00",

        createdAt: "2026-07-30T12:15:00"

    }

];


/* =========================================================
   3. BASIC STORAGE FUNCTIONS
========================================================= */

function storageGet(
    key,
    defaultValue = []
) {

    try {

        const data =
            localStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Storage read error:",
            error
        );

        return defaultValue;

    }

}


function storageSet(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Storage write error:",
            error
        );

        return false;

    }

}


function storageRemove(key) {

    try {

        localStorage.removeItem(key);

        return true;

    } catch (error) {

        console.error(
            "Storage delete error:",
            error
        );

        return false;

    }

}


/* =========================================================
   4. DATABASE INITIALIZATION
========================================================= */

function initializeDatabase() {

    const alreadyInitialized =
        localStorage.getItem(
            IMS_DB.keys.initialized
        );


    /*
       Don't overwrite existing user data.
    */

    if (alreadyInitialized === "true") {

        return;

    }


    storageSet(
        IMS_DB.keys.products,
        DEFAULT_PRODUCTS
    );

    storageSet(
        IMS_DB.keys.sales,
        DEFAULT_SALES
    );

    storageSet(
        IMS_DB.keys.purchases,
        DEFAULT_PURCHASES
    );

    storageSet(
        IMS_DB.keys.suppliers,
        DEFAULT_SUPPLIERS
    );

    storageSet(
        IMS_DB.keys.customers,
        DEFAULT_CUSTOMERS
    );

    storageSet(
        IMS_DB.keys.categories,
        DEFAULT_CATEGORIES
    );

    storageSet(
        IMS_DB.keys.notifications,
        []
    );

    storageSet(
        IMS_DB.keys.activity,
        []
    );

    storageSet(
        IMS_DB.keys.settings,
        getDefaultSettings()
    );


    localStorage.setItem(
        IMS_DB.keys.initialized,
        "true"
    );


    console.log(
        "Inventory database initialized."
    );

}


/* =========================================================
   5. DEFAULT SETTINGS
========================================================= */

function getDefaultSettings() {

    return {

        companyName:
            "Inventory Management System",

        currency:
            "₹",

        currencyCode:
            "INR",

        taxRate:
            18,

        lowStockThreshold:
            10,

        dateFormat:
            "DD/MM/YYYY",

        darkMode:
            false,

        notifications:
            true,

        emailNotifications:
            false,

        autoBackup:
            false

    };

}


/* =========================================================
   6. GENERATE UNIQUE ID
========================================================= */

function generateId(prefix) {

    const timestamp =
        Date.now()
            .toString()
            .slice(-7);

    const random =
        Math.floor(
            Math.random() * 1000
        )
        .toString()
        .padStart(3, "0");


    return `${prefix}-${timestamp}${random}`;

}


/* =========================================================
   7. PRODUCTS
========================================================= */

function getProducts() {

    return storageGet(
        IMS_DB.keys.products,
        []
    );

}


function getProductById(id) {

    return getProducts()
        .find(product =>
            product.id === id
        );

}


function getProductBySKU(sku) {

    return getProducts()
        .find(product =>
            product.sku.toLowerCase() ===
            sku.toLowerCase()
        );

}


function saveProducts(products) {

    return storageSet(
        IMS_DB.keys.products,
        products
    );

}


function addProduct(product) {

    const products =
        getProducts();


    const newProduct = {

        ...product,

        id:
            product.id ||
            generateId("PRD"),

        createdAt:
            product.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    products.push(
        newProduct
    );


    saveProducts(products);

    addActivity(
        "Product Added",
        `${newProduct.name} was added to inventory.`
    );


    return newProduct;

}


function updateProduct(
    id,
    updatedData
) {

    const products =
        getProducts();


    const index =
        products.findIndex(
            product =>
                product.id === id
        );


    if (index === -1) {
        return null;
    }


    products[index] = {

        ...products[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    saveProducts(products);


    addActivity(
        "Product Updated",
        `${products[index].name} was updated.`
    );


    return products[index];

}


function deleteProduct(id) {

    const products =
        getProducts();


    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {
        return false;
    }


    const filtered =
        products.filter(
            item =>
                item.id !== id
        );


    saveProducts(filtered);


    addActivity(
        "Product Deleted",
        `${product.name} was removed from inventory.`
    );


    return true;

}


/* =========================================================
   8. SALES
========================================================= */

function getSales() {

    return storageGet(
        IMS_DB.keys.sales,
        []
    );

}


function getSaleById(id) {

    return getSales()
        .find(sale =>
            sale.id === id
        );

}


function saveSales(sales) {

    return storageSet(
        IMS_DB.keys.sales,
        sales
    );

}


function addSale(sale) {

    const sales =
        getSales();


    const newSale = {

        ...sale,

        id:
            sale.id ||
            generateId("SAL"),

        createdAt:
            new Date().toISOString()

    };


    sales.push(
        newSale
    );


    saveSales(sales);


    addActivity(
        "Sale Created",
        `${newSale.invoice || newSale.id} was created.`
    );


    return newSale;

}


function updateSale(
    id,
    updatedData
) {

    const sales =
        getSales();


    const index =
        sales.findIndex(
            sale =>
                sale.id === id
        );


    if (index === -1) {
        return null;
    }


    sales[index] = {

        ...sales[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    saveSales(sales);


    return sales[index];

}


function deleteSale(id) {

    const sales =
        getSales();


    const filtered =
        sales.filter(
            sale =>
                sale.id !== id
        );


    if (
        filtered.length ===
        sales.length
    ) {

        return false;

    }


    saveSales(filtered);

    return true;

}


/* =========================================================
   9. PURCHASES
========================================================= */

function getPurchases() {

    return storageGet(
        IMS_DB.keys.purchases,
        []
    );

}


function getPurchaseById(id) {

    return getPurchases()
        .find(purchase =>
            purchase.id === id
        );

}


function savePurchases(
    purchases
) {

    return storageSet(
        IMS_DB.keys.purchases,
        purchases
    );

}


function addPurchase(
    purchase
) {

    const purchases =
        getPurchases();


    const newPurchase = {

        ...purchase,

        id:
            purchase.id ||
            generateId("PUR"),

        createdAt:
            new Date().toISOString()

    };


    purchases.push(
        newPurchase
    );


    savePurchases(
        purchases
    );


    addActivity(
        "Purchase Created",
        `${newPurchase.billNumber || newPurchase.id} was created.`
    );


    return newPurchase;

}


function updatePurchase(
    id,
    updatedData
) {

    const purchases =
        getPurchases();


    const index =
        purchases.findIndex(
            purchase =>
                purchase.id === id
        );


    if (index === -1) {
        return null;
    }


    purchases[index] = {

        ...purchases[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    savePurchases(
        purchases
    );


    return purchases[index];

}


function deletePurchase(id) {

    const purchases =
        getPurchases();


    const filtered =
        purchases.filter(
            purchase =>
                purchase.id !== id
        );


    if (
        filtered.length ===
        purchases.length
    ) {

        return false;

    }


    savePurchases(
        filtered
    );


    return true;

}


/* =========================================================
   10. SUPPLIERS
========================================================= */

function getSuppliers() {

    return storageGet(
        IMS_DB.keys.suppliers,
        []
    );

}


function getSupplierById(id) {

    return getSuppliers()
        .find(supplier =>
            supplier.id === id
        );

}


function saveSuppliers(
    suppliers
) {

    return storageSet(
        IMS_DB.keys.suppliers,
        suppliers
    );

}


function addSupplier(
    supplier
) {

    const suppliers =
        getSuppliers();


    const newSupplier = {

        ...supplier,

        id:
            supplier.id ||
            generateId("SUP"),

        createdAt:
            new Date().toISOString()

    };


    suppliers.push(
        newSupplier
    );


    saveSuppliers(
        suppliers
    );


    addActivity(
        "Supplier Added",
        `${newSupplier.name} was added.`
    );


    return newSupplier;

}


function updateSupplier(
    id,
    updatedData
) {

    const suppliers =
        getSuppliers();


    const index =
        suppliers.findIndex(
            supplier =>
                supplier.id === id
        );


    if (index === -1) {
        return null;
    }


    suppliers[index] = {

        ...suppliers[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    saveSuppliers(
        suppliers
    );


    return suppliers[index];

}


function deleteSupplier(id) {

    const suppliers =
        getSuppliers();


    const filtered =
        suppliers.filter(
            supplier =>
                supplier.id !== id
        );


    if (
        filtered.length ===
        suppliers.length
    ) {

        return false;

    }


    saveSuppliers(
        filtered
    );


    return true;

}


/* =========================================================
   11. CUSTOMERS
========================================================= */

function getCustomers() {

    return storageGet(
        IMS_DB.keys.customers,
        []
    );

}


function getCustomerById(id) {

    return getCustomers()
        .find(customer =>
            customer.id === id
        );

}


function saveCustomers(
    customers
) {

    return storageSet(
        IMS_DB.keys.customers,
        customers
    );

}


function addCustomer(
    customer
) {

    const customers =
        getCustomers();


    const newCustomer = {

        ...customer,

        id:
            customer.id ||
            generateId("CUS"),

        totalPurchases:
            Number(
                customer.totalPurchases
            ) || 0,

        createdAt:
            new Date().toISOString()

    };


    customers.push(
        newCustomer
    );


    saveCustomers(
        customers
    );


    addActivity(
        "Customer Added",
        `${newCustomer.name} was added.`
    );


    return newCustomer;

}


function updateCustomer(
    id,
    updatedData
) {

    const customers =
        getCustomers();


    const index =
        customers.findIndex(
            customer =>
                customer.id === id
        );


    if (index === -1) {
        return null;
    }


    customers[index] = {

        ...customers[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    saveCustomers(
        customers
    );


    return customers[index];

}


function deleteCustomer(id) {

    const customers =
        getCustomers();


    const filtered =
        customers.filter(
            customer =>
                customer.id !== id
        );


    if (
        filtered.length ===
        customers.length
    ) {

        return false;

    }


    saveCustomers(
        filtered
    );


    return true;

}


/* =========================================================
   12. CATEGORIES
========================================================= */

function getCategories() {

    return storageGet(
        IMS_DB.keys.categories,
        []
    );

}


function getCategoryById(id) {

    return getCategories()
        .find(category =>
            category.id === id
        );

}


function saveCategories(
    categories
) {

    return storageSet(
        IMS_DB.keys.categories,
        categories
    );

}


function addCategory(
    category
) {

    const categories =
        getCategories();


    const newCategory = {

        ...category,

        id:
            category.id ||
            generateId("CAT"),

        status:
            category.status ||
            "Active",

        createdAt:
            new Date().toISOString()

    };


    categories.push(
        newCategory
    );


    saveCategories(
        categories
    );


    addActivity(
        "Category Added",
        `${newCategory.name} was added.`
    );


    return newCategory;

}


function updateCategory(
    id,
    updatedData
) {

    const categories =
        getCategories();


    const index =
        categories.findIndex(
            category =>
                category.id === id
        );


    if (index === -1) {
        return null;
    }


    categories[index] = {

        ...categories[index],

        ...updatedData,

        id: id,

        updatedAt:
            new Date().toISOString()

    };


    saveCategories(
        categories
    );


    return categories[index];

}


function deleteCategory(id) {

    const categories =
        getCategories();


    const filtered =
        categories.filter(
            category =>
                category.id !== id
        );


    if (
        filtered.length ===
        categories.length
    ) {

        return false;

    }


    saveCategories(
        filtered
    );


    return true;

}


/* =========================================================
   13. NOTIFICATIONS
========================================================= */

function getNotifications() {

    return storageGet(
        IMS_DB.keys.notifications,
        []
    );

}


function addNotification(
    notification
) {

    const notifications =
        getNotifications();


    const newNotification = {

        id:
            generateId("NOT"),

        title:
            notification.title ||
            "Notification",

        message:
            notification.message ||
            "",

        type:
            notification.type ||
            "info",

        read:
            false,

        createdAt:
            new Date().toISOString()

    };


    notifications.unshift(
        newNotification
    );


    /*
       Keep only latest 50 notifications.
    */

    storageSet(
        IMS_DB.keys.notifications,
        notifications.slice(0, 50)
    );


    return newNotification;

}


function markNotificationRead(
    id
) {

    const notifications =
        getNotifications();


    const notification =
        notifications.find(
            item =>
                item.id === id
        );


    if (!notification) {
        return false;
    }


    notification.read =
        true;


    storageSet(
        IMS_DB.keys.notifications,
        notifications
    );


    return true;

}


function markAllNotificationsRead() {

    const notifications =
        getNotifications();


    notifications.forEach(
        notification => {

            notification.read =
                true;

        }
    );


    return storageSet(
        IMS_DB.keys.notifications,
        notifications
    );

}


/* =========================================================
   14. ACTIVITY LOG
========================================================= */

function getActivities() {

    return storageGet(
        IMS_DB.keys.activity,
        []
    );

}


function addActivity(
    title,
    description
) {

    const activities =
        getActivities();


    activities.unshift({

        id:
            generateId("ACT"),

        title:
            title,

        description:
            description,

        timestamp:
            new Date().toISOString()

    });


    /*
       Keep latest 100 activities.
    */

    storageSet(
        IMS_DB.keys.activity,
        activities.slice(0, 100)
    );

}


/* =========================================================
   15. SETTINGS
========================================================= */

function getSettings() {

    return storageGet(
        IMS_DB.keys.settings,
        getDefaultSettings()
    );

}


function saveSettings(
    settings
) {

    return storageSet(
        IMS_DB.keys.settings,
        settings
    );

}


function updateSettings(
    updatedSettings
) {

    const settings =
        getSettings();


    const newSettings = {

        ...settings,

        ...updatedSettings

    };


    saveSettings(
        newSettings
    );


    addActivity(
        "Settings Updated",
        "System settings were updated."
    );


    return newSettings;

}


/* =========================================================
   16. INVENTORY STATISTICS
========================================================= */

function getInventoryStatistics() {

    const products =
        getProducts();


    const sales =
        getSales();


    const purchases =
        getPurchases();


    const activeProducts =
        products.filter(
            product =>
                product.status === "Active"
        );


    const lowStockProducts =
        products.filter(
            product =>
                Number(product.stock) <=
                Number(product.minStock)
        );


    const outOfStockProducts =
        products.filter(
            product =>
                Number(product.stock) <= 0
        );


    const totalStock =
        products.reduce(
            (sum, product) =>
                sum +
                Number(product.stock || 0),
            0
        );


    const inventoryValue =
        products.reduce(
            (sum, product) =>
                sum +
                (
                    Number(product.stock || 0) *
                    Number(product.purchasePrice || 0)
                ),
            0
        );


    const salesRevenue =
        sales.reduce(
            (sum, sale) =>
                sum +
                Number(sale.total || 0),
            0
        );


    const purchaseValue =
        purchases.reduce(
            (sum, purchase) =>
                sum +
                Number(purchase.total || 0),
            0
        );


    return {

        totalProducts:
            products.length,

        activeProducts:
            activeProducts.length,

        totalStock,

        lowStock:
            lowStockProducts.length,

        outOfStock:
            outOfStockProducts.length,

        inventoryValue,

        totalSales:
            sales.length,

        salesRevenue,

        totalPurchases:
            purchases.length,

        purchaseValue

    };

}


/* =========================================================
   17. SEARCH FUNCTIONS
========================================================= */

function searchProducts(
    query
) {

    const products =
        getProducts();


    const search =
        String(query)
            .trim()
            .toLowerCase();


    if (!search) {
        return products;
    }


    return products.filter(
        product =>

            String(product.name)
                .toLowerCase()
                .includes(search)

            ||

            String(product.sku)
                .toLowerCase()
                .includes(search)

            ||

            String(product.category)
                .toLowerCase()
                .includes(search)

            ||

            String(product.supplier)
                .toLowerCase()
                .includes(search)

    );

}


function searchCustomers(
    query
) {

    const customers =
        getCustomers();


    const search =
        String(query)
            .trim()
            .toLowerCase();


    if (!search) {
        return customers;
    }


    return customers.filter(
        customer =>

            String(customer.name)
                .toLowerCase()
                .includes(search)

            ||

            String(customer.phone)
                .toLowerCase()
                .includes(search)

            ||

            String(customer.email)
                .toLowerCase()
                .includes(search)

    );

}


function searchSuppliers(
    query
) {

    const suppliers =
        getSuppliers();


    const search =
        String(query)
            .trim()
            .toLowerCase();


    if (!search) {
        return suppliers;
    }


    return suppliers.filter(
        supplier =>

            String(supplier.name)
                .toLowerCase()
                .includes(search)

            ||

            String(supplier.contactPerson)
                .toLowerCase()
                .includes(search)

            ||

            String(supplier.phone)
                .toLowerCase()
                .includes(search)

    );

}


/* =========================================================
   18. STOCK MANAGEMENT
========================================================= */

function increaseStock(
    productId,
    quantity
) {

    const product =
        getProductById(productId);


    if (!product) {
        return null;
    }


    const newStock =
        Number(product.stock || 0) +
        Number(quantity || 0);


    return updateProduct(
        productId,
        {
            stock: newStock
        }
    );

}


function decreaseStock(
    productId,
    quantity
) {

    const product =
        getProductById(productId);


    if (!product) {
        return null;
    }


    const currentStock =
        Number(product.stock || 0);


    const amount =
        Number(quantity || 0);


    if (
        amount > currentStock
    ) {

        return {

            success: false,

            message:
                `Insufficient stock for ${product.name}.`

        };

    }


    const newStock =
        currentStock - amount;


    const updated =
        updateProduct(
            productId,
            {
                stock: newStock
            }
        );


    /*
       Automatically create low-stock
       notification.
    */

    if (
        newStock <=
        Number(product.minStock || 0)
    ) {

        addNotification({

            title:
                "Low Stock Alert",

            message:
                `${product.name} has only ${newStock} units remaining.`,

            type:
                "warning"

        });

    }


    return {

        success: true,

        product: updated

    };

}


/* =========================================================
   19. BACKUP DATABASE
========================================================= */

function exportDatabase() {

    const database = {

        version:
            IMS_DB.version,

        exportedAt:
            new Date().toISOString(),

        products:
            getProducts(),

        sales:
            getSales(),

        purchases:
            getPurchases(),

        suppliers:
            getSuppliers(),

        customers:
            getCustomers(),

        categories:
            getCategories(),

        notifications:
            getNotifications(),

        activities:
            getActivities(),

        settings:
            getSettings()

    };


    return database;

}


/* =========================================================
   20. DOWNLOAD BACKUP
========================================================= */

function downloadDatabaseBackup() {

    const database =
        exportDatabase();


    const json =
        JSON.stringify(
            database,
            null,
            2
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
        `inventory-backup-${new Date()
            .toISOString()
            .split("T")[0]
        }.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   21. RESTORE DATABASE
========================================================= */

function restoreDatabase(
    database
) {

    if (
        !database ||
        typeof database !== "object"
    ) {

        return {

            success: false,

            message:
                "Invalid backup file."

        };

    }


    try {

        if (database.products) {

            storageSet(
                IMS_DB.keys.products,
                database.products
            );

        }


        if (database.sales) {

            storageSet(
                IMS_DB.keys.sales,
                database.sales
            );

        }


        if (database.purchases) {

            storageSet(
                IMS_DB.keys.purchases,
                database.purchases
            );

        }


        if (database.suppliers) {

            storageSet(
                IMS_DB.keys.suppliers,
                database.suppliers
            );

        }


        if (database.customers) {

            storageSet(
                IMS_DB.keys.customers,
                database.customers
            );

        }


        if (database.categories) {

            storageSet(
                IMS_DB.keys.categories,
                database.categories
            );

        }


        if (database.notifications) {

            storageSet(
                IMS_DB.keys.notifications,
                database.notifications
            );

        }


        if (database.activities) {

            storageSet(
                IMS_DB.keys.activity,
                database.activities
            );

        }


        if (database.settings) {

            storageSet(
                IMS_DB.keys.settings,
                database.settings
            );

        }


        localStorage.setItem(
            IMS_DB.keys.initialized,
            "true"
        );


        addActivity(
            "Database Restored",
            "Inventory database was restored from a backup."
        );


        return {

            success: true,

            message:
                "Database restored successfully."

        };

    } catch (error) {

        console.error(
            "Database restore error:",
            error
        );


        return {

            success: false,

            message:
                "Unable to restore database."

        };

    }

}


/* =========================================================
   22. RESET DATABASE
========================================================= */

function resetDatabase() {

    /*
       Remove all application data.
    */

    Object.values(
        IMS_DB.keys
    ).forEach(key => {

        storageRemove(key);

    });


    /*
       Recreate the default database.
    */

    initializeDatabase();


    return true;

}


/* =========================================================
   23. DATABASE SIZE
========================================================= */

function getDatabaseSize() {

    let totalSize = 0;


    Object.values(
        IMS_DB.keys
    ).forEach(key => {

        const value =
            localStorage.getItem(
                key
            );


        if (value) {

            totalSize +=
                value.length;

        }

    });


    /*
       Convert approximately to KB.
    */

    return (
        totalSize / 1024
    ).toFixed(2);

}


/* =========================================================
   24. AUTOMATIC LOW STOCK CHECK
========================================================= */

function checkLowStock() {

    const products =
        getProducts();


    products.forEach(
        product => {

            const stock =
                Number(
                    product.stock || 0
                );


            const minimum =
                Number(
                    product.minStock || 0
                );


            if (
                stock <= minimum
            ) {

                const existing =
                    getNotifications()
                        .some(
                            notification =>

                                notification.message
                                    .includes(
                                        product.name
                                    )
                                &&
                                !notification.read
                        );


                if (!existing) {

                    addNotification({

                        title:
                            stock <= 0
                                ? "Out of Stock"
                                : "Low Stock Alert",

                        message:
                            stock <= 0
                                ? `${product.name} is out of stock.`
                                : `${product.name} has only ${stock} units remaining.`,

                        type:
                            stock <= 0
                                ? "danger"
                                : "warning"

                    });

                }

            }

        }
    );

}


/* =========================================================
   25. INITIALIZE DATABASE
========================================================= */

initializeDatabase();

checkLowStock();


/* =========================================================
   26. GLOBAL STORAGE API
========================================================= */

window.InventoryStorage = {

    /*
       Products
    */

    getProducts,

    getProductById,

    getProductBySKU,

    saveProducts,

    addProduct,

    updateProduct,

    deleteProduct,


    /*
       Sales
    */

    getSales,

    getSaleById,

    saveSales,

    addSale,

    updateSale,

    deleteSale,


    /*
       Purchases
    */

    getPurchases,

    getPurchaseById,

    savePurchases,

    addPurchase,

    updatePurchase,

    deletePurchase,


    /*
       Suppliers
    */

    getSuppliers,

    getSupplierById,

    saveSuppliers,

    addSupplier,

    updateSupplier,

    deleteSupplier,


    /*
       Customers
    */

    getCustomers,

    getCustomerById,

    saveCustomers,

    addCustomer,

    updateCustomer,

    deleteCustomer,


    /*
       Categories
    */

    getCategories,

    getCategoryById,

    saveCategories,

    addCategory,

    updateCategory,

    deleteCategory,


    /*
       Notifications
    */

    getNotifications,

    addNotification,

    markNotificationRead,

    markAllNotificationsRead,


    /*
       Activity
    */

    getActivities,

    addActivity,


    /*
       Settings
    */

    getSettings,

    saveSettings,

    updateSettings,


    /*
       Statistics
    */

    getInventoryStatistics,


    /*
       Search
    */

    searchProducts,

    searchCustomers,

    searchSuppliers,


    /*
       Stock
    */

    increaseStock,

    decreaseStock,


    /*
       Backup
    */

    exportDatabase,

    downloadDatabaseBackup,

    restoreDatabase,

    resetDatabase,

    getDatabaseSize,

    checkLowStock,


    /*
       Raw storage helpers
    */

    storageGet,

    storageSet,

    storageRemove,


    /*
       Database information
    */

    database: IMS_DB

};


/* =========================================================
   END OF STORAGE.JS
========================================================= */