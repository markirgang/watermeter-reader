// State Management
let tenants = [];
let readings = [];
let editingTenantId = null;
let customBuildings = [];
let customTenantNames = [];
let customAddresses = [];
let modalMode = ''; // 'building', 'tenantName', 'address'

// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// DOM Elements - Tenants Tab
const tenantForm = document.getElementById('tenantForm');
const tenantFormTitle = document.getElementById('tenantFormTitle');
const tenantIdInput = document.getElementById('tenantId');
const tenantBuildingInput = document.getElementById('tenantBuilding');
const tenantNameInput = document.getElementById('tenantName');
const tenantAddressInput = document.getElementById('tenantAddress');
const tenantSubmeterInput = document.getElementById('tenantSubmeter');
const tenantUnitSelect = document.getElementById('tenantUnit');
const tenantRateInput = document.getElementById('tenantRate');
const tenantInitialReadingInput = document.getElementById('tenantInitialReading');
const tenantInitialDateInput = document.getElementById('tenantInitialDate');
const saveTenantBtn = document.getElementById('saveTenantBtn');
const cancelEditTenantBtn = document.getElementById('cancelEditTenantBtn');
const tenantTableBody = document.getElementById('tenantTableBody');
const tenantSearchInput = document.getElementById('tenantSearchInput');

// DOM Elements - Modal & Add Buttons
const addOptionModal = document.getElementById('addOptionModal');
const modalTitle = document.getElementById('modalTitle');
const modalInputLabel = document.getElementById('modalInputLabel');
const modalInputIcon = document.getElementById('modalInputIcon');
const modalInputValue = document.getElementById('modalInputValue');
const modalForm = document.getElementById('modalForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

const addBuildingBtn = document.getElementById('addBuildingBtn');
const addTenantBtn = document.getElementById('addTenantBtn');
const addAddressBtn = document.getElementById('addAddressBtn');

// DOM Elements - Reading Modal
const logReadingModal = document.getElementById('logReadingModal');
const openReadingModalBtn = document.getElementById('openReadingModalBtn');
const closeReadingModalBtn = document.getElementById('closeReadingModalBtn');
const cancelReadingModalBtn = document.getElementById('cancelReadingModalBtn');

// DOM Elements - Readings Tab
const readingForm = document.getElementById('readingForm');
const readingBuildingSelect = document.getElementById('readingBuildingSelect');
const readingTenantSelect = document.getElementById('readingTenantSelect');
const refBuilding = document.getElementById('refBuilding');
const refSubmeterId = document.getElementById('refSubmeterId');
const refUnitType = document.getElementById('refUnitType');
const refPrevReading = document.getElementById('refPrevReading');
const refPrevReadingDate = document.getElementById('refPrevReadingDate');
const readingCurrentInput = document.getElementById('readingCurrent');
const readingDateInput = document.getElementById('readingDate');
const readingCommentsInput = document.getElementById('readingComments');
const saveReadingBtn = document.getElementById('saveReadingBtn');
const readingTableBody = document.getElementById('readingTableBody');
const readingSearchInput = document.getElementById('readingSearchInput');

// DOM Elements - Takeoff Tab
const statTotalTenants = document.getElementById('statTotalTenants');
const statTotalGallons = document.getElementById('statTotalGallons');
const statTotalCF = document.getElementById('statTotalCF');
const statTotalBilled = document.getElementById('statTotalBilled');
const takeoffStartDate = document.getElementById('takeoffStartDate');
const takeoffEndDate = document.getElementById('takeoffEndDate');
const takeoffTableBody = document.getElementById('takeoffTableBody');
const exportExcelBtn = document.getElementById('exportExcelBtn');

// DOM Elements - Backups
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupBtn = document.getElementById('importBackupBtn');
const backupFileInput = document.getElementById('backupFileInput');

// DOM Elements - Toast Container
const toastContainer = document.getElementById('toastContainer');

// Flatpickr instances
let tenantInitialDatePicker;
let readingDatePicker;
let takeoffStartDatePicker;
let takeoffEndDatePicker;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Initialize Flatpickr calendar widgets
    tenantInitialDatePicker = flatpickr("#tenantInitialDate", {
        defaultDate: today,
        dateFormat: "Y-m-d",
        theme: "dark"
    });
    
    readingDatePicker = flatpickr("#readingDate", {
        defaultDate: today,
        dateFormat: "Y-m-d",
        theme: "dark",
        clickOpens: false // Start disabled
    });

    takeoffStartDatePicker = flatpickr("#takeoffStartDate", {
        defaultDate: firstDayOfMonth,
        dateFormat: "Y-m-d",
        theme: "dark",
        onChange: function() {
            renderTakeoff();
        }
    });

    takeoffEndDatePicker = flatpickr("#takeoffEndDate", {
        defaultDate: today,
        dateFormat: "Y-m-d",
        theme: "dark",
        onChange: function() {
            renderTakeoff();
        }
    });

    // Load data from LocalStorage
    loadData();

    // Setup Tab listeners
    setupTabs();

    // Setup Event Listeners
    setupEventListeners();

    // Initial renders
    renderAll();
});

// --- STATE STORAGE ---
function loadData() {
    try {
        const storedTenants = localStorage.getItem('aquameter_tenants');
        const storedReadings = localStorage.getItem('aquameter_readings');
        const storedCustomBuildings = localStorage.getItem('aquameter_custom_buildings');
        const storedCustomTenantNames = localStorage.getItem('aquameter_custom_tenant_names');
        const storedCustomAddresses = localStorage.getItem('aquameter_custom_addresses');
        
        tenants = storedTenants ? JSON.parse(storedTenants) : [];
        readings = storedReadings ? JSON.parse(storedReadings) : [];
        customBuildings = storedCustomBuildings ? JSON.parse(storedCustomBuildings) : [];
        customTenantNames = storedCustomTenantNames ? JSON.parse(storedCustomTenantNames) : [];
        customAddresses = storedCustomAddresses ? JSON.parse(storedCustomAddresses) : [];
    } catch (e) {
        showToast('Error loading saved data from browser storage.', 'error');
        tenants = [];
        readings = [];
        customBuildings = [];
        customTenantNames = [];
        customAddresses = [];
    }
}

function saveData() {
    try {
        localStorage.setItem('aquameter_tenants', JSON.stringify(tenants));
        localStorage.setItem('aquameter_readings', JSON.stringify(readings));
        localStorage.setItem('aquameter_custom_buildings', JSON.stringify(customBuildings));
        localStorage.setItem('aquameter_custom_tenant_names', JSON.stringify(customTenantNames));
        localStorage.setItem('aquameter_custom_addresses', JSON.stringify(customAddresses));
    } catch (e) {
        showToast('Storage limit exceeded! Could not save data.', 'error');
    }
}

// --- TAB ROUTING ---
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Toggle active classes on buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Toggle active classes on content sections
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                }
            });

            // Trigger specific updates when switching tabs
            if (targetTab === 'readings') {
                populateReadingBuildingDropdown();
            } else if (targetTab === 'takeoff') {
                renderTakeoff();
            }
        });
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Tenant form submission
    tenantForm.addEventListener('submit', handleTenantSubmit);
    cancelEditTenantBtn.addEventListener('click', resetTenantForm);
    tenantSearchInput.addEventListener('input', renderTenants);

    // Modal buttons & submission
    addBuildingBtn.addEventListener('click', () => openModal('building'));
    addTenantBtn.addEventListener('click', () => openModal('tenantName'));
    addAddressBtn.addEventListener('click', () => openModal('address'));
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    // Close modal if clicking outside the modal-container
    addOptionModal.addEventListener('click', (e) => {
        if (e.target === addOptionModal) {
            closeModal();
        }
    });
    
    modalForm.addEventListener('submit', handleModalSubmit);

    // Auto-generate submeter on address change
    tenantAddressInput.addEventListener('change', () => {
        if (!tenantSubmeterInput.value) {
            tenantSubmeterInput.value = generateSubmeterId(tenantAddressInput.value);
        }
    });

    // Building filter for tenant form
    tenantBuildingInput.addEventListener('change', () => {
        populateTenantFormDropdowns();
    });

    // Building filter for readings tab
    readingBuildingSelect.addEventListener('change', () => {
        populateTenantDropdown(readingBuildingSelect.value);
    });

    // Reading form submission
    readingTenantSelect.addEventListener('change', handleReadingTenantChange);
    readingForm.addEventListener('submit', handleReadingSubmit);
    readingSearchInput.addEventListener('input', renderReadings);

    // Takeoff Filters
    takeoffStartDate.addEventListener('change', renderTakeoff);
    takeoffEndDate.addEventListener('change', renderTakeoff);
    exportExcelBtn.addEventListener('click', exportToExcel);

    // Backups
    exportBackupBtn.addEventListener('click', handleExportBackup);
    importBackupBtn.addEventListener('click', () => backupFileInput.click());
    backupFileInput.addEventListener('change', handleImportBackup);

    // Reading Modal event listeners
    if (openReadingModalBtn) {
        openReadingModalBtn.addEventListener('click', () => {
            logReadingModal.classList.add('active');
            logReadingModal.setAttribute('aria-hidden', 'false');
            populateReadingBuildingDropdown();
            lucide.createIcons();
        });
    }

    if (closeReadingModalBtn) {
        closeReadingModalBtn.addEventListener('click', closeReadingModal);
    }
    if (cancelReadingModalBtn) {
        cancelReadingModalBtn.addEventListener('click', closeReadingModal);
    }

    if (logReadingModal) {
        logReadingModal.addEventListener('click', (e) => {
            if (e.target === logReadingModal) {
                closeReadingModal();
            }
        });
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
        <button class="toast-close"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    // Close on click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'none';
        toast.offsetHeight; // trigger reflow
        toast.remove();
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 4000);
}

// --- UTILITY: AUTO GENERATE SUBMETER ID ---
function generateSubmeterId(address) {
    if (!address) return '';
    // Strip non-alphanumeric, take first 4 characters, uppercase
    const cleanAddress = address.trim().replace(/[^a-zA-Z0-9]/g, '');
    return cleanAddress.substring(0, 4).toUpperCase();
}

// --- TENANT PORTAL LOGIC ---
function handleTenantSubmit(e) {
    e.preventDefault();

    const id = tenantIdInput.value;
    const building = tenantBuildingInput.value.trim();
    const name = tenantNameInput.value.trim();
    const address = tenantAddressInput.value.trim();
    let submeter = tenantSubmeterInput.value.trim();
    const unitType = tenantUnitSelect.value;
    const rate = parseFloat(tenantRateInput.value);
    const initialReading = parseFloat(tenantInitialReadingInput.value);
    const initialDate = tenantInitialDateInput.value;

    if (!submeter) {
        submeter = generateSubmeterId(address);
    }

    // Check for duplicate submeter ID
    const isDuplicate = tenants.some(t => t.submeter.toLowerCase() === submeter.toLowerCase() && t.id !== id);
    if (isDuplicate) {
        showToast(`Submeter ID "${submeter}" is already assigned to another tenant.`, 'error');
        return;
    }

    if (editingTenantId) {
        // Edit mode
        const index = tenants.findIndex(t => t.id === editingTenantId);
        if (index !== -1) {
            // Check if initial reading changed and update initial states
            const oldTenant = tenants[index];
            tenants[index] = {
                ...oldTenant,
                building,
                name,
                address,
                submeter,
                unitType,
                rate,
                initialReading,
                initialDate,
                // If no readings have been logged yet, update the current reading details as well
                currentReading: readings.some(r => r.tenantId === editingTenantId) ? oldTenant.currentReading : initialReading,
                currentDate: readings.some(r => r.tenantId === editingTenantId) ? oldTenant.currentDate : initialDate
            };
            showToast('Tenant information updated successfully.', 'success');
        }
    } else {
        // Create mode
        const newTenant = {
            id: 'tenant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            building,
            name,
            address,
            submeter,
            unitType,
            rate,
            initialReading,
            initialDate,
            currentReading: initialReading,
            currentDate: initialDate
        };
        tenants.push(newTenant);
        showToast('New tenant added successfully.', 'success');
    }

    saveData();
    resetTenantForm();
    renderAll();
}

function editTenant(id) {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    editingTenantId = tenant.id;
    tenantIdInput.value = tenant.id;
    tenantBuildingInput.value = tenant.building || '';
    tenantNameInput.value = tenant.name;
    tenantAddressInput.value = tenant.address;
    tenantSubmeterInput.value = tenant.submeter;
    tenantUnitSelect.value = tenant.unitType;
    tenantRateInput.value = tenant.rate;
    tenantInitialReadingInput.value = tenant.initialReading;
    if (tenantInitialDatePicker) {
        tenantInitialDatePicker.setDate(tenant.initialDate);
    } else {
        tenantInitialDateInput.value = tenant.initialDate;
    }

    // Toggle forms visual indicators
    tenantFormTitle.innerHTML = `<i data-lucide="edit-3"></i> Edit Tenant`;
    saveTenantBtn.innerHTML = `<i data-lucide="save"></i> Update Tenant`;
    cancelEditTenantBtn.style.display = 'inline-flex';
    lucide.createIcons();

    // Scroll to form on mobile
    tenantForm.scrollIntoView({ behavior: 'smooth' });
}

function deleteTenant(id) {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    if (confirm(`Are you sure you want to delete "${tenant.name}"? This will also delete their entire reading history.`)) {
        // Delete readings
        readings = readings.filter(r => r.tenantId !== id);
        // Delete tenant
        tenants = tenants.filter(t => t.id !== id);
        
        saveData();
        renderAll();
        showToast('Tenant and related reading history deleted.', 'success');
    }
}

function resetTenantForm() {
    editingTenantId = null;
    tenantForm.reset();
    tenantIdInput.value = '';
    tenantBuildingInput.value = '';
    
    tenantFormTitle.innerHTML = `<i data-lucide="user-plus"></i> Add New Tenant`;
    saveTenantBtn.innerHTML = `<i data-lucide="save"></i> Save Tenant`;
    cancelEditTenantBtn.style.display = 'none';
    
    const today = new Date().toISOString().split('T')[0];
    if (tenantInitialDatePicker) {
        tenantInitialDatePicker.setDate(today);
    } else {
        tenantInitialDateInput.value = today;
    }
    lucide.createIcons();
}

function getTenantReadingDetails(tenant) {
    const tenantReadings = readings
        .filter(r => r.tenantId === tenant.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological order
        
    let prevReading = tenant.initialReading;
    let currReading = tenant.currentReading;
    
    if (tenantReadings.length > 0) {
        currReading = tenantReadings[tenantReadings.length - 1].currReading;
        if (tenantReadings.length > 1) {
            prevReading = tenantReadings[tenantReadings.length - 2].currReading;
        } else {
            prevReading = tenant.initialReading;
        }
    }
    
    const usage = currReading - prevReading;
    return {
        prevReading,
        currReading,
        usage
    };
}

function renderTenants() {
    const filter = tenantSearchInput.value.toLowerCase();
    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(filter) || 
        (t.building && t.building.toLowerCase().includes(filter)) ||
        t.submeter.toLowerCase().includes(filter) ||
        t.address.toLowerCase().includes(filter)
    );

    tenantTableBody.innerHTML = '';

    if (filteredTenants.length === 0) {
        tenantTableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <i data-lucide="users" style="width: 48px; height: 48px;"></i>
                        <p>${tenants.length === 0 ? 'No tenants registered yet. Add one using the form on the left!' : 'No matching tenants found.'}</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    filteredTenants.forEach(tenant => {
        const { prevReading, currReading, usage } = getTenantReadingDetails(tenant);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--text-primary);">${escapeHTML(tenant.name)}</strong></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${escapeHTML(tenant.building || 'N/A')}</span></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHTML(tenant.address)}</span></td>
            <td><code>${escapeHTML(tenant.submeter)}</code></td>
            <td><span class="badge badge-${tenant.unitType}">${tenant.unitType.toUpperCase()}</span></td>
            <td>$${tenant.rate.toFixed(4)}</td>
            <td>${prevReading.toFixed(2)}</td>
            <td>
                <div style="font-weight: 600;">${currReading.toFixed(2)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${formatDate(tenant.currentDate)}</div>
            </td>
            <td><strong style="color: ${usage > 0 ? 'var(--primary)' : 'var(--text-muted)'};">${usage.toFixed(2)}</strong></td>
            <td>
                <div class="action-btn-group" style="justify-content: center;">
                    <button class="action-btn edit" onclick="editTenant('${tenant.id}')" title="Edit Tenant">
                        <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteTenant('${tenant.id}')" title="Delete Tenant">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </td>
        `;
        tenantTableBody.appendChild(row);
    });

    lucide.createIcons();
}

// --- READINGS LOGIC ---
function populateReadingBuildingDropdown() {
    const currentBuilding = readingBuildingSelect.value;
    readingBuildingSelect.innerHTML = '<option value="" disabled selected>Choose a building...</option>';
    
    const buildingSet = new Set();
    tenants.forEach(t => { if (t.building) buildingSet.add(t.building); });
    const sortedBuildings = Array.from(buildingSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
    
    sortedBuildings.forEach(building => {
        const option = document.createElement('option');
        option.value = building;
        option.textContent = building;
        readingBuildingSelect.appendChild(option);
    });
    
    if (currentBuilding && sortedBuildings.includes(currentBuilding)) {
        readingBuildingSelect.value = currentBuilding;
        populateTenantDropdown(currentBuilding);
    } else {
        readingTenantSelect.innerHTML = '<option value="" disabled selected>Choose a tenant...</option>';
        readingTenantSelect.disabled = true;
        resetReadingFormFields(true);
    }
}

function populateTenantDropdown(selectedBuilding) {
    const currentSelection = readingTenantSelect.value;
    readingTenantSelect.innerHTML = '<option value="" disabled selected>Choose a tenant...</option>';
    
    if (!selectedBuilding) {
        readingTenantSelect.disabled = true;
        resetReadingFormFields(true);
        return;
    }
    
    readingTenantSelect.disabled = false;
    
    // Filter tenants by building
    const filteredTenants = tenants.filter(t => t.building === selectedBuilding);
    const sortedTenants = [...filteredTenants].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedTenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = `${tenant.name} (${tenant.submeter})`;
        readingTenantSelect.appendChild(option);
    });

    if (currentSelection && filteredTenants.some(t => t.id === currentSelection)) {
        readingTenantSelect.value = currentSelection;
        handleReadingTenantChange();
    } else {
        resetReadingFormFields(false);
    }
}

function handleReadingTenantChange() {
    const tenantId = readingTenantSelect.value;
    const tenant = tenants.find(t => t.id === tenantId);

    if (!tenant) {
        resetReadingFormFields(false);
        return;
    }

    // Populate Read-only details
    refBuilding.textContent = tenant.building || 'N/A';
    refBuilding.title = tenant.building || 'N/A';
    refSubmeterId.textContent = tenant.submeter;
    refUnitType.textContent = tenant.unitType.toUpperCase();
    refPrevReading.textContent = tenant.currentReading.toFixed(2);
    refPrevReadingDate.textContent = formatDate(tenant.currentDate);

    // Enable inputs
    readingCurrentInput.disabled = false;
    readingDateInput.disabled = false;
    readingCommentsInput.disabled = false;
    saveReadingBtn.disabled = false;

    if (readingDatePicker) {
        readingDatePicker.set('clickOpens', true);
        readingDatePicker.set('minDate', tenant.currentDate);
        const selected = readingDatePicker.selectedDates[0];
        if (!selected || selected < new Date(tenant.currentDate)) {
            readingDatePicker.setDate(tenant.currentDate);
        }
    }

    // Set min reading and date validation details
    readingCurrentInput.min = tenant.currentReading;
    readingDateInput.min = tenant.currentDate;
}

function resetReadingFormFields(clearSelects = false) {
    refBuilding.textContent = '--';
    refBuilding.title = '--';
    refSubmeterId.textContent = '--';
    refUnitType.textContent = '--';
    refPrevReading.textContent = '--';
    refPrevReadingDate.textContent = '--';

    readingCurrentInput.value = '';
    readingCurrentInput.disabled = true;
    readingCommentsInput.value = '';
    readingCommentsInput.disabled = true;
    saveReadingBtn.disabled = true;

    const today = new Date().toISOString().split('T')[0];
    if (readingDatePicker) {
        readingDatePicker.set('clickOpens', false);
        readingDatePicker.setDate(today);
    } else {
        readingDateInput.value = today;
    }
    readingDateInput.disabled = true;

    if (clearSelects) {
        readingBuildingSelect.value = '';
        readingTenantSelect.innerHTML = '<option value="" disabled selected>Choose a tenant...</option>';
        readingTenantSelect.disabled = true;
    }
}

function handleReadingSubmit(e) {
    e.preventDefault();

    const tenantId = readingTenantSelect.value;
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const currReading = parseFloat(readingCurrentInput.value);
    const date = readingDateInput.value;
    const comments = readingCommentsInput.value.trim();

    // Strict validation
    if (currReading < tenant.currentReading) {
        showToast(`Current reading (${currReading}) cannot be lower than the previous reading (${tenant.currentReading}).`, 'error');
        return;
    }

    if (new Date(date) < new Date(tenant.currentDate)) {
        showToast(`Reading date cannot be earlier than the previous reading date (${formatDate(tenant.currentDate)}).`, 'error');
        return;
    }

    const prevReading = tenant.currentReading;
    const consumed = currReading - prevReading;
    const cost = consumed * tenant.rate;

    const newReading = {
        id: 'reading_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        tenantId,
        date,
        prevReading,
        currReading,
        consumed,
        rate: tenant.rate,
        cost,
        unitType: tenant.unitType,
        comments
    };

    // Add reading to state
    readings.push(newReading);

    // Update tenant's current reference point
    tenant.currentReading = currReading;
    tenant.currentDate = date;

    saveData();
    resetReadingFormFields(true);
    populateReadingBuildingDropdown(); // Redraw references
    renderAll();
    closeReadingModal();
    showToast(`Reading recorded. Consumption: ${consumed.toFixed(2)} ${tenant.unitType.toUpperCase()}.`, 'success');
}

function deleteReading(readingId) {
    const reading = readings.find(r => r.id === readingId);
    if (!reading) return;

    if (confirm('Are you sure you want to delete this meter reading?')) {
        const tenant = tenants.find(t => t.id === reading.tenantId);
        
        // Remove reading
        readings = readings.filter(r => r.id !== readingId);
        
        // If the deleted reading was the latest reading for this tenant, we need to roll back the tenant's current status
        if (tenant) {
            const tenantReadings = readings
                .filter(r => r.tenantId === tenant.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // descending date order

            if (tenantReadings.length > 0) {
                tenant.currentReading = tenantReadings[0].currReading;
                tenant.currentDate = tenantReadings[0].date;
            } else {
                // Roll back to initial values
                tenant.currentReading = tenant.initialReading;
                tenant.currentDate = tenant.initialDate;
            }
        }

        saveData();
        renderAll();
        showToast('Reading deleted and tenant status rolled back.', 'success');
    }
}

function renderReadings() {
    const filter = readingSearchInput.value.toLowerCase();
    
    // Sort readings by date descending
    const sortedReadings = [...readings].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredReadings = sortedReadings.filter(r => {
        const tenant = tenants.find(t => t.id === r.tenantId);
        const name = tenant ? tenant.name.toLowerCase() : '';
        const submeter = tenant ? tenant.submeter.toLowerCase() : '';
        return name.includes(filter) || submeter.includes(filter) || r.comments.toLowerCase().includes(filter);
    });

    readingTableBody.innerHTML = '';

    if (filteredReadings.length === 0) {
        readingTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <i data-lucide="clipboard-list" style="width: 48px; height: 48px;"></i>
                        <p>${readings.length === 0 ? 'No readings logged yet.' : 'No matching readings found.'}</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    filteredReadings.forEach(reading => {
        const tenant = tenants.find(t => t.id === reading.tenantId);
        const tenantName = tenant ? tenant.name : 'Unknown Tenant';
        const submeter = tenant ? tenant.submeter : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(reading.date)}</td>
            <td><strong style="color: var(--text-primary);">${escapeHTML(tenantName)}</strong></td>
            <td><code>${escapeHTML(submeter)}</code></td>
            <td>${reading.prevReading.toFixed(2)}</td>
            <td>${reading.currReading.toFixed(2)}</td>
            <td><strong style="color: var(--primary);">${reading.consumed.toFixed(2)}</strong> <span style="font-size: 0.75rem; color: var(--text-muted);">${reading.unitType.toUpperCase()}</span></td>
            <td><strong style="color: var(--success);">$${reading.cost.toFixed(2)}</strong></td>
            <td><span class="helper-text" style="display: inline-block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(reading.comments)}">${escapeHTML(reading.comments) || '-'}</span></td>
            <td>
                <div class="action-btn-group" style="justify-content: center;">
                    <button class="action-btn delete" onclick="deleteReading('${reading.id}')" title="Delete Reading">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </td>
        `;
        readingTableBody.appendChild(row);
    });

    lucide.createIcons();
}

// --- TAKEOFF & EXCEL SUMMARY LOGIC ---
function renderTakeoff() {
    const start = takeoffStartDate.value;
    const end = takeoffEndDate.value;

    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Calculate Dashboard Stats from readings in range
    const periodReadings = readings.filter(r => {
        const d = new Date(r.date);
        return d >= startDate && d <= endDate;
    });

    let totalGallons = 0;
    let totalCF = 0;
    let totalBilled = 0;

    periodReadings.forEach(r => {
        if (r.unitType === 'gal') {
            totalGallons += r.consumed;
        } else if (r.unitType === 'cf') {
            totalCF += r.consumed;
        }
        totalBilled += r.cost;
    });

    statTotalTenants.textContent = tenants.length;
    statTotalGallons.textContent = `${totalGallons.toLocaleString(undefined, {maximumFractionDigits: 2})} gal`;
    statTotalCF.textContent = `${totalCF.toLocaleString(undefined, {maximumFractionDigits: 2})} cf`;
    statTotalBilled.textContent = `$${totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Render Takeoff Table
    // The takeoff lists all tenants and calculates their net billing/consumption based on readings in the period.
    takeoffTableBody.innerHTML = '';

    if (tenants.length === 0) {
        takeoffTableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <i data-lucide="calculator" style="width: 48px; height: 48px;"></i>
                        <p>Configure tenants in the Tenant Directory tab first to generate a takeoff.</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    tenants.forEach(tenant => {
        // Find all readings for this tenant within the period, sorted chronologically
        const tenantPeriodReadings = periodReadings
            .filter(r => r.tenantId === tenant.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let startRead = 0;
        let endRead = 0;
        let consumption = 0;
        let billedCost = 0;
        let commentsList = [];
        let dateRangeText = 'No data in range';

        if (tenantPeriodReadings.length > 0) {
            // First reading in the period shows where we started
            startRead = tenantPeriodReadings[0].prevReading;
            // Last reading in the period is where we ended
            endRead = tenantPeriodReadings[tenantPeriodReadings.length - 1].currReading;
            
            // Cumulative totals
            tenantPeriodReadings.forEach(r => {
                consumption += r.consumed;
                billedCost += r.cost;
                if (r.comments) commentsList.push(r.comments);
            });

            const firstDate = tenantPeriodReadings[0].date;
            const lastDate = tenantPeriodReadings[tenantPeriodReadings.length - 1].date;
            dateRangeText = `${formatDate(firstDate)} to ${formatDate(lastDate)}`;
        } else {
            // If no readings in the range, let's look for the most recent reading BEFORE the range to serve as the baseline,
            // or use the initial tenant reading if no historical readings exist.
            const historicReadings = readings
                .filter(r => r.tenantId === tenant.id && new Date(r.date) < startDate)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

            const lastReadingValue = historicReadings.length > 0 ? historicReadings[0].currReading : tenant.initialReading;
            startRead = lastReadingValue;
            endRead = lastReadingValue;
            consumption = 0;
            billedCost = 0;
            dateRangeText = 'No new readings';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--text-primary);">${escapeHTML(tenant.name)}</strong></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${escapeHTML(tenant.building || 'N/A')}</span></td>
            <td><code>${escapeHTML(tenant.submeter)}</code></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${dateRangeText}</span></td>
            <td>${startRead.toFixed(2)}</td>
            <td>${endRead.toFixed(2)}</td>
            <td><strong style="color: ${consumption > 0 ? 'var(--primary)' : 'var(--text-muted)'};">${consumption.toFixed(2)}</strong></td>
            <td><span class="badge badge-${tenant.unitType}">${tenant.unitType.toUpperCase()}</span></td>
            <td>$${tenant.rate.toFixed(4)}</td>
            <td><strong style="color: ${billedCost > 0 ? 'var(--success)' : 'var(--text-muted)'};">$${billedCost.toFixed(2)}</strong></td>
            <td><span class="helper-text" style="display: inline-block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(commentsList.join('; '))}">
                ${escapeHTML(commentsList.join('; ')) || '-'}
            </span></td>
        `;
        takeoffTableBody.appendChild(row);
    });

    lucide.createIcons();
}

// --- EXCEL GENERATION ENGINE ---
function exportToExcel() {
    if (tenants.length === 0) {
        showToast('No tenant data available to export.', 'error');
        return;
    }

    try {
        const start = takeoffStartDate.value;
        const end = takeoffEndDate.value;
        const startDate = new Date(start);
        const endDate = new Date(end);

        // --- 1. BILLING TAKEOFF SHEET DATA ---
        const takeoffData = [];
        tenants.forEach(tenant => {
            const tenantPeriodReadings = readings
                .filter(r => r.tenantId === tenant.id && new Date(r.date) >= startDate && new Date(r.date) <= endDate)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            let startRead = tenant.initialReading;
            let endRead = tenant.initialReading;
            let consumption = 0;
            let cost = 0;
            let comments = [];

            if (tenantPeriodReadings.length > 0) {
                startRead = tenantPeriodReadings[0].prevReading;
                endRead = tenantPeriodReadings[tenantPeriodReadings.length - 1].currReading;
                tenantPeriodReadings.forEach(r => {
                    consumption += r.consumed;
                    cost += r.cost;
                    if (r.comments) comments.push(r.comments);
                });
            } else {
                const historicReadings = readings
                    .filter(r => r.tenantId === tenant.id && new Date(r.date) < startDate)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastValue = historicReadings.length > 0 ? historicReadings[0].currReading : tenant.initialReading;
                startRead = lastValue;
                endRead = lastValue;
            }

            takeoffData.push({
                'Store Name': tenant.name,
                'Building': tenant.building || 'N/A',
                'Submeter ID': tenant.submeter,
                'Unit Type': tenant.unitType.toUpperCase(),
                'Billing Start Date': start,
                'Billing End Date': end,
                'Start Reading': startRead,
                'End Reading': endRead,
                'Consumed Amount': consumption,
                'Billing Rate ($)': tenant.rate,
                'Total Cost ($)': cost,
                'Notes / Comments': comments.join('; ')
            });
        });

        // --- 2. TENANT DIRECTORY SHEET DATA ---
        const directoryData = tenants.map(t => ({
            'Store Name': t.name,
            'Building': t.building || 'N/A',
            'Unit Address': t.address,
            'Submeter ID': t.submeter,
            'Unit Type': t.unitType.toUpperCase(),
            'Billing Rate ($/unit)': t.rate,
            'Current Reading Value': t.currentReading,
            'Last Reading Date': t.currentDate
        }));

        // --- 3. READING HISTORY SHEET DATA ---
        const historyData = readings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(r => {
                const tenant = tenants.find(t => t.id === r.tenantId);
                return {
                    'Reading Date': r.date,
                    'Store Name': tenant ? tenant.name : 'Unknown',
                    'Submeter ID': tenant ? tenant.submeter : 'N/A',
                    'Unit Type': r.unitType.toUpperCase(),
                    'Previous Reading': r.prevReading,
                    'Current Reading': r.currReading,
                    'Consumed': r.consumed,
                    'Rate Applied': r.rate,
                    'Cost Calculated': r.cost,
                    'Comments': r.comments
                };
            });

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Convert data arrays to worksheets
        const wsTakeoff = XLSX.utils.json_to_sheet(takeoffData);
        const wsDirectory = XLSX.utils.json_to_sheet(directoryData);
        const wsHistory = XLSX.utils.json_to_sheet(historyData);

        // Basic table styling (auto-sizing columns)
        const setWidths = (ws, data) => {
            if (data.length === 0) return;
            const keys = Object.keys(data[0]);
            ws['!cols'] = keys.map(key => {
                let maxLen = key.toString().length;
                data.forEach(row => {
                    const val = row[key];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, val.toString().length);
                    }
                });
                return { wch: maxLen + 3 }; // Pad column slightly
            });
        };

        setWidths(wsTakeoff, takeoffData);
        setWidths(wsDirectory, directoryData);
        setWidths(wsHistory, historyData);

        // Append sheets to workbook
        XLSX.book_append_sheet(wb, wsTakeoff, 'Billing Takeoff');
        XLSX.book_append_sheet(wb, wsDirectory, 'Tenant Directory');
        XLSX.book_append_sheet(wb, wsHistory, 'All Reading Logs');

        // Write workbook to file and trigger browser download
        const fileName = `WaterMeter_Takeoff_${start}_to_${end}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showToast(`Excel workbook exported successfully: ${fileName}`, 'success');
    } catch (error) {
        console.error(error);
        showToast('Failed to export Excel file.', 'error');
    }
}

// --- DATA BACKUP & RESTORE (JSON) ---
function handleExportBackup() {
    if (tenants.length === 0 && readings.length === 0) {
        showToast('No data to backup.', 'error');
        return;
    }

    try {
        const dataStr = JSON.stringify({ tenants, readings }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `aquameter_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showToast('Backup JSON file downloaded.', 'success');
    } catch (e) {
        showToast('Failed to generate backup file.', 'error');
    }
}

function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate schema roughly
            if (Array.isArray(importedData.tenants) && Array.isArray(importedData.readings)) {
                tenants = importedData.tenants;
                readings = importedData.readings;
                
                saveData();
                renderAll();
                showToast('Database restored successfully from backup!', 'success');
            } else {
                showToast('Invalid backup file structure.', 'error');
            }
        } catch (error) {
            showToast('Failed to parse backup JSON file.', 'error');
        }
        // Reset file input
        backupFileInput.value = '';
    };
    reader.readAsText(file);
}

// --- DROPDOWNS & MODAL ENGINE ---
function populateTenantFormDropdowns() {
    const selectedBuilding = tenantBuildingInput.value;

    const buildingsSet = new Set();
    tenants.forEach(t => { if (t.building) buildingsSet.add(t.building); });
    customBuildings.forEach(b => { if (b) buildingsSet.add(b); });
    const sortedBuildings = Array.from(buildingsSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
    
    const namesSet = new Set();
    const addressesSet = new Set();

    // Filter store names and addresses by the currently selected building, if any
    tenants.forEach(t => {
        if (!selectedBuilding || t.building === selectedBuilding) {
            if (t.name) namesSet.add(t.name);
            if (t.address) addressesSet.add(t.address);
        }
    });

    // Custom items added via plus button are always visible so they can be assigned
    customTenantNames.forEach(n => { if (n) namesSet.add(n); });
    customAddresses.forEach(a => { if (a) addressesSet.add(a); });

    const sortedNames = Array.from(namesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
    const sortedAddresses = Array.from(addressesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));

    const updateSelect = (selectEl, optionsList, defaultText) => {
        const currentValue = selectEl.value;
        selectEl.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        
        optionsList.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            selectEl.appendChild(option);
        });
        
        if (currentValue && optionsList.includes(currentValue)) {
            selectEl.value = currentValue;
        }
    };

    updateSelect(tenantBuildingInput, sortedBuildings, 'Select Property...');
    updateSelect(tenantNameInput, sortedNames, 'Select Store...');
    updateSelect(tenantAddressInput, sortedAddresses, 'Select Address...');
}

function openModal(mode) {
    modalMode = mode;
    modalInputValue.value = '';
    
    let title = '';
    let label = '';
    let icon = '';
    let placeholder = '';
    
    if (mode === 'building') {
        title = 'Add Building / Property';
        label = 'Building / Property Name *';
        icon = 'building';
        placeholder = 'e.g., 4026-4034 White Plains Rd';
    } else if (mode === 'tenantName') {
        title = 'Add Store / Tenant Name';
        label = 'Store / Tenant Name *';
        icon = 'store';
        placeholder = 'e.g., Starbucks Coffee';
    } else if (mode === 'address') {
        title = 'Add Unit Address';
        label = 'Unit Address *';
        icon = 'map-pin';
        placeholder = 'e.g., 104 Main St, Suite B';
    }
    
    modalTitle.innerHTML = `<i data-lucide="${icon}"></i> ${title}`;
    modalInputLabel.textContent = label;
    modalInputIcon.setAttribute('data-lucide', icon);
    modalInputValue.placeholder = placeholder;
    
    addOptionModal.classList.add('active');
    addOptionModal.setAttribute('aria-hidden', 'false');
    
    lucide.createIcons();
    
    setTimeout(() => modalInputValue.focus(), 100);
}

function closeModal() {
    addOptionModal.classList.remove('active');
    addOptionModal.setAttribute('aria-hidden', 'true');
    modalMode = '';
    modalInputValue.value = '';
}

function closeReadingModal() {
    if (logReadingModal) {
        logReadingModal.classList.remove('active');
        logReadingModal.setAttribute('aria-hidden', 'true');
    }
}

function handleModalSubmit(e) {
    e.preventDefault();
    
    const value = modalInputValue.value.trim();
    if (!value) return;
    
    if (modalMode === 'building') {
        if (!customBuildings.includes(value)) {
            customBuildings.push(value);
            saveData();
        }
        populateTenantFormDropdowns();
        tenantBuildingInput.value = value;
        populateTenantFormDropdowns(); // Re-run to filter other dropdowns for this building
        showToast(`Property "${value}" added successfully.`, 'success');
    } else if (modalMode === 'tenantName') {
        if (!customTenantNames.includes(value)) {
            customTenantNames.push(value);
            saveData();
        }
        populateTenantFormDropdowns();
        tenantNameInput.value = value;
        showToast(`Tenant "${value}" added successfully.`, 'success');
    } else if (modalMode === 'address') {
        if (!customAddresses.includes(value)) {
            customAddresses.push(value);
            saveData();
        }
        populateTenantFormDropdowns();
        tenantAddressInput.value = value;
        if (!tenantSubmeterInput.value) {
            tenantSubmeterInput.value = generateSubmeterId(value);
        }
        showToast(`Address "${value}" added successfully.`, 'success');
    }
    
    closeModal();
}

// --- RENDERING MANAGER ---
function renderAll() {
    populateTenantFormDropdowns();
    renderTenants();
    populateReadingBuildingDropdown();
    renderReadings();
    renderTakeoff();
}

// --- FORMATTING UTILITIES ---
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            // Local date construction to avoid timezone shifts
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }
        return new Date(dateStr).toLocaleDateString();
    } catch (e) {
        return dateStr;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
