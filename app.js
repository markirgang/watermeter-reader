// State Management
let tenants = [];
let readings = [];
let editingTenantId = null;
let customBuildings = [];
let customTenantNames = [];
let customAddresses = [];
let modalMode = ''; // 'building', 'tenantName', 'address', 'syncSettings'

// Cloud Sync Settings
let syncUrl = localStorage.getItem('aquameter_sync_url') || 'https://script.google.com/macros/s/AKfycbz_opCeoA-eC1otn6iU_VTZZLvNneEEx6ch64Fz4D4-gVpOFbpC6_ufckMDssWwqzja/exec';
let syncToken = localStorage.getItem('aquameter_sync_token') || 'Herc@5100';
let autoSyncEnabled = localStorage.getItem('aquameter_auto_sync') === 'true';
let isSyncingInProgress = false;

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

// DOM Elements - Edit Reading Modal
const editReadingModal = document.getElementById('editReadingModal');
const editReadingForm = document.getElementById('editReadingForm');
const closeEditReadingModalBtn = document.getElementById('closeEditReadingModalBtn');
const cancelEditReadingModalBtn = document.getElementById('cancelEditReadingModalBtn');

// DOM Elements - Readings Tab
const readingForm = document.getElementById('readingForm');
const readingBuildingSelect = document.getElementById('readingBuildingSelect');
const readingTenantSelect = document.getElementById('readingTenantSelect');
const refBuilding = document.getElementById('refBuilding');
const refSubmeterId = document.getElementById('refSubmeterId');
const refUnitType = document.getElementById('refUnitType');
const readingPrevInput = document.getElementById('readingPrev');
const readingPrevDateInput = document.getElementById('readingPrevDate');
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
const takeoffBuildingFilter = document.getElementById('takeoffBuildingFilter');
const takeoffTenantFilter = document.getElementById('takeoffTenantFilter');
const takeoffTableBody = document.getElementById('takeoffTableBody');
const exportExcelBtnReadings = document.getElementById('exportExcelBtnReadings');
const exportExcelBtnTakeoff = document.getElementById('exportExcelBtnTakeoff');
const importExcelBtnReadings = document.getElementById('importExcelBtnReadings');
const importExcelBtnTakeoff = document.getElementById('importExcelBtnTakeoff');
const importExcelFileInput = document.getElementById('importExcelFileInput');

// DOM Elements - Backups
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupBtn = document.getElementById('importBackupBtn');
const backupFileInput = document.getElementById('backupFileInput');

// DOM Elements - Cloud Sync
const syncStatusBadge = document.getElementById('syncStatusBadge');
const syncSettingsBtn = document.getElementById('syncSettingsBtn');
const syncSettingsModal = document.getElementById('syncSettingsModal');
const syncSettingsForm = document.getElementById('syncSettingsForm');
const syncUrlInput = document.getElementById('syncUrlInput');
const syncTokenInput = document.getElementById('syncTokenInput');
const autoSyncCheckbox = document.getElementById('autoSyncCheckbox');
const syncModalStatus = document.getElementById('syncModalStatus');
const testSyncBtn = document.getElementById('testSyncBtn');
const closeSyncModalBtn = document.getElementById('closeSyncModalBtn');

// DOM Elements - Toast Container
const toastContainer = document.getElementById('toastContainer');

// Flatpickr instances
let tenantInitialDatePicker;
let readingPrevDatePicker;
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
    
    readingPrevDatePicker = flatpickr("#readingPrevDate", {
        defaultDate: today,
        dateFormat: "Y-m-d",
        theme: "dark",
        clickOpens: false // Start disabled
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
        
        // Run data migration for building IDs
        migrateBuildingsData();
    } catch (e) {
        showToast('Error loading saved data from browser storage.', 'error');
        tenants = [];
        readings = [];
        customBuildings = [];
        customTenantNames = [];
        customAddresses = [];
    }
}

function migrateBuildingsData() {
    let updated = false;
    
    // Clean up customBuildings just in case any entries are strings (convert them to objects)
    // and normalize property casing
    customBuildings = customBuildings.map(b => {
        if (typeof b === 'string') {
            updated = true;
            return {
                id: 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                address1: b,
                address2: '', city: '', state: '', zipCode: ''
            };
        }
        
        const normalized = { ...b };
        
        // Normalize id / ID / Id -> id
        if (b.ID !== undefined && b.id === undefined) {
            normalized.id = b.ID;
            delete normalized.ID;
            updated = true;
        }
        if (b.Id !== undefined && b.id === undefined) {
            normalized.id = b.Id;
            delete normalized.Id;
            updated = true;
        }
        
        // Normalize zipCode / zipcode -> zipCode
        if (b.zipcode !== undefined && b.zipCode === undefined) {
            normalized.zipCode = b.zipcode;
            delete normalized.zipcode;
            updated = true;
        }
        
        return normalized;
    });

    // Normalize case-insensitive property keys for tenants
    tenants = tenants.map(t => {
        const normalized = { ...t };

        // Normalize id / ID / Id -> id
        if (t.ID !== undefined && t.id === undefined) {
            normalized.id = t.ID;
            delete normalized.ID;
            updated = true;
        }
        if (t.Id !== undefined && t.id === undefined) {
            normalized.id = t.Id;
            delete normalized.Id;
            updated = true;
        }

        // Normalize buildingId / buildingID / buildingid -> buildingId
        if (t.buildingid !== undefined && t.buildingId === undefined) {
            normalized.buildingId = t.buildingid;
            delete normalized.buildingid;
            updated = true;
        }
        if (t.buildingID !== undefined && t.buildingId === undefined) {
            normalized.buildingId = t.buildingID;
            delete normalized.buildingID;
            updated = true;
        }

        // Normalize unitType / unittype -> unitType
        if (t.unittype !== undefined && t.unitType === undefined) {
            normalized.unitType = t.unittype;
            delete normalized.unittype;
            updated = true;
        }

        // Normalize initialReading / initialreading -> initialReading
        if (t.initialreading !== undefined && t.initialReading === undefined) {
            normalized.initialReading = t.initialreading;
            delete normalized.initialreading;
            updated = true;
        }

        // Normalize initialDate / initialdate -> initialDate
        if (t.initialdate !== undefined && t.initialDate === undefined) {
            normalized.initialDate = t.initialdate;
            delete normalized.initialdate;
            updated = true;
        }

        // Normalize currentReading / currentreading -> currentReading
        if (t.currentreading !== undefined && t.currentReading === undefined) {
            normalized.currentReading = t.currentreading;
            delete normalized.currentreading;
            updated = true;
        }

        // Normalize currentDate / currentdate -> currentDate
        if (t.currentdate !== undefined && t.currentDate === undefined) {
            normalized.currentDate = t.currentdate;
            delete normalized.currentdate;
            updated = true;
        }

        return normalized;
    });

    // Normalize case-insensitive property keys for readings
    readings = readings.map(r => {
        const normalized = { ...r };

        // Normalize id / ID / Id -> id
        if (r.ID !== undefined && r.id === undefined) {
            normalized.id = r.ID;
            delete normalized.ID;
            updated = true;
        }
        if (r.Id !== undefined && r.id === undefined) {
            normalized.id = r.Id;
            delete normalized.Id;
            updated = true;
        }

        // Normalize tenantId / tenantID / tenantid -> tenantId
        if (r.tenantid !== undefined && r.tenantId === undefined) {
            normalized.tenantId = r.tenantid;
            delete normalized.tenantid;
            updated = true;
        }
        if (r.tenantID !== undefined && r.tenantId === undefined) {
            normalized.tenantId = r.tenantID;
            delete normalized.tenantID;
            updated = true;
        }

        // Normalize unitType / unittype -> unitType
        if (r.unittype !== undefined && r.unitType === undefined) {
            normalized.unitType = r.unittype;
            delete normalized.unittype;
            updated = true;
        }

        // Normalize prevReading / prevreading -> prevReading
        if (r.prevreading !== undefined && r.prevReading === undefined) {
            normalized.prevReading = r.prevreading;
            delete normalized.prevreading;
            updated = true;
        }

        // Normalize currReading / currreading -> currReading
        if (r.currreading !== undefined && r.currReading === undefined) {
            normalized.currReading = r.currreading;
            delete normalized.currreading;
            updated = true;
        }

        return normalized;
    });

    // Migrate building addresses to building IDs with robust matching
    tenants.forEach(t => {
        if (t.building && !t.buildingId) {
            // Find existing building with same formatted address or address1 line case-insensitively
            let b = customBuildings.find(item => {
                const formatted = formatBuildingAddress(item);
                const tBuildingStr = (t.building || '').toString().toLowerCase();
                return formatted === t.building || 
                       item.address1 === t.building || 
                       formatted.toLowerCase() === tBuildingStr ||
                       item.address1.toLowerCase() === tBuildingStr;
            });
            if (!b) {
                b = {
                    id: 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    address1: t.building,
                    address2: '', city: '', state: '', zipCode: ''
                };
                customBuildings.push(b);
            }
            t.buildingId = b.id;
            updated = true;
        }
    });

    // Migrate customTenantNames strings to objects
    if (customTenantNames && customTenantNames.length > 0) {
        customTenantNames = customTenantNames.map(n => {
            if (typeof n === 'string') {
                updated = true;
                const matchingTenant = tenants.find(t => t.name === n);
                if (matchingTenant) {
                    return {
                        name: n,
                        address: matchingTenant.address || '',
                        submeter: matchingTenant.submeter || '',
                        unitType: matchingTenant.unitType || 'cf',
                        rate: matchingTenant.rate !== undefined ? matchingTenant.rate : 0.05,
                        initialReading: matchingTenant.initialReading !== undefined ? matchingTenant.initialReading : 0
                    };
                } else {
                    return {
                        name: n,
                        address: '',
                        submeter: '',
                        unitType: 'cf',
                        rate: 0.05,
                        initialReading: 0
                    };
                }
            }
            return n;
        });
    }

    if (updated) {
        saveData();
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

function registerDeletion(id) {
    if (!id) return;
    try {
        const stored = localStorage.getItem('aquameter_deleted_ids');
        const deletedIds = stored ? JSON.parse(stored) : [];
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('aquameter_deleted_ids', JSON.stringify(deletedIds));
        }
    } catch (e) {
        console.error('Error registering deletion for sync:', e);
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
    cancelEditTenantBtn.addEventListener('click', () => resetTenantForm(false));
    tenantSearchInput.addEventListener('input', renderTenants);

    // Modal buttons & submission
    addBuildingBtn.addEventListener('click', () => openModal('building'));
    addTenantBtn.addEventListener('click', () => openModal('tenantName'));
    addAddressBtn.addEventListener('click', () => openModal('address'));
    


    const editBuildingBtn = document.getElementById('editBuildingBtn');
    const editTenantNameBtn = document.getElementById('editTenantNameBtn');
    const editAddressBtn = document.getElementById('editAddressBtn');
    
    const deleteBuildingBtn = document.getElementById('deleteBuildingBtn');
    const deleteTenantNameBtn = document.getElementById('deleteTenantNameBtn');

    if (editBuildingBtn) {
        editBuildingBtn.addEventListener('click', () => openModal('editBuilding'));
    }
    if (editTenantNameBtn) {
        editTenantNameBtn.addEventListener('click', () => openModal('editTenantName'));
    }
    if (editAddressBtn) {
        editAddressBtn.addEventListener('click', () => openModal('editAddress'));
    }

    if (deleteBuildingBtn) {
        deleteBuildingBtn.addEventListener('click', deleteBuilding);
    }
    if (deleteTenantNameBtn) {
        deleteTenantNameBtn.addEventListener('click', deleteTenantName);
    }

    
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
        updateEditButtonsState();
    });



    // Building filter for tenant form
    tenantBuildingInput.addEventListener('change', () => {
        populateTenantFormDropdowns();
        renderTenants();
        updateEditButtonsState();
    });

    tenantNameInput.addEventListener('change', () => {
        const selectedName = tenantNameInput.value;
        const currentBuildingId = tenantBuildingInput.value;
        if (selectedName) {
            const existingTenant = tenants.find(t => t.name === selectedName && t.buildingId === currentBuildingId);
            if (existingTenant) {

                tenantAddressInput.value = existingTenant.address || '';
                tenantSubmeterInput.value = existingTenant.submeter || '';
                tenantUnitSelect.value = existingTenant.unitType || 'cf';
                tenantRateInput.value = existingTenant.rate || '';
                tenantInitialReadingInput.value = existingTenant.initialReading || 0;
                
                if (tenantInitialDatePicker) {
                    tenantInitialDatePicker.setDate(existingTenant.initialDate);
                } else {
                    tenantInitialDateInput.value = existingTenant.initialDate;
                }
                
                renderTenants();
                showToast(`Auto-populated details for "${selectedName}".`, 'info');
            } else {
                // If not found in this building, check customTenantNames for the template
                const tenantObj = customTenantNames.find(t => (typeof t === 'string' ? t : t.name) === selectedName);
                if (tenantObj && typeof tenantObj === 'object') {

                    tenantAddressInput.value = tenantObj.address || '';
                    tenantSubmeterInput.value = tenantObj.submeter || generateSubmeterId(tenantObj.address) || '';
                    tenantUnitSelect.value = tenantObj.unitType || 'cf';
                    tenantRateInput.value = tenantObj.rate !== undefined ? tenantObj.rate : '';
                    tenantInitialReadingInput.value = tenantObj.initialReading !== undefined ? tenantObj.initialReading : 0;
                    showToast(`Auto-populated profile details for "${selectedName}".`, 'info');
                }
            }
        }
        updateEditButtonsState();
    });

    // Building filter for readings tab
    readingBuildingSelect.addEventListener('change', () => {
        populateTenantDropdown(readingBuildingSelect.value);
    });

    // Reading form submission
    readingTenantSelect.addEventListener('change', handleReadingTenantChange);
    readingForm.addEventListener('submit', handleReadingSubmit);
    readingSearchInput.addEventListener('input', renderReadings);

    // Reading History Ledger Filter dropdowns
    const readingBuildingFilter = document.getElementById('readingBuildingFilter');
    const readingTenantFilter = document.getElementById('readingTenantFilter');
    if (readingBuildingFilter) {
        readingBuildingFilter.addEventListener('change', () => {
            updateReadingTenantFilter();
            renderReadings();
        });
    }
    if (readingTenantFilter) {
        readingTenantFilter.addEventListener('change', renderReadings);
    }

    // Takeoff Filters
    takeoffStartDate.addEventListener('change', renderTakeoff);
    takeoffEndDate.addEventListener('change', renderTakeoff);
    takeoffBuildingFilter.addEventListener('change', () => {
        updateTakeoffTenantFilter();
        renderTakeoff();
    });
    takeoffTenantFilter.addEventListener('change', renderTakeoff);
    if (exportExcelBtnReadings) {
        exportExcelBtnReadings.addEventListener('click', () => exportToExcel('readings'));
    }
    if (exportExcelBtnTakeoff) {
        exportExcelBtnTakeoff.addEventListener('click', () => exportToExcel('takeoff'));
    }

    // Backups
    exportBackupBtn.addEventListener('click', handleExportBackup);
    importBackupBtn.addEventListener('click', () => backupFileInput.click());
    backupFileInput.addEventListener('change', handleImportBackup);
    if (importExcelBtnReadings) {
        importExcelBtnReadings.addEventListener('click', () => importExcelFileInput.click());
    }
    if (importExcelBtnTakeoff) {
        importExcelBtnTakeoff.addEventListener('click', () => importExcelFileInput.click());
    }
    if (importExcelFileInput) {
        importExcelFileInput.addEventListener('change', handleImportExcel);
    }

    // Cloud Sync
    if (syncSettingsBtn) {
        syncSettingsBtn.addEventListener('click', openSyncSettingsModal);
    }
    if (closeSyncModalBtn) {
        closeSyncModalBtn.addEventListener('click', closeSyncSettingsModal);
    }
    if (syncSettingsForm) {
        syncSettingsForm.addEventListener('submit', handleSyncSettingsSave);
    }
    if (testSyncBtn) {
        testSyncBtn.addEventListener('click', () => syncWithCloud(true));
    }
    if (syncSettingsModal) {
        syncSettingsModal.addEventListener('click', (e) => {
            if (e.target === syncSettingsModal) {
                closeSyncSettingsModal();
            }
        });
    }

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

    // Edit Reading Modal event listeners
    if (closeEditReadingModalBtn) {
        closeEditReadingModalBtn.addEventListener('click', closeEditReadingModal);
    }
    if (cancelEditReadingModalBtn) {
        cancelEditReadingModalBtn.addEventListener('click', closeEditReadingModal);
    }
    if (editReadingModal) {
        editReadingModal.addEventListener('click', (e) => {
            if (e.target === editReadingModal) {
                closeEditReadingModal();
            }
        });
    }
    if (editReadingForm) {
        editReadingForm.addEventListener('submit', handleEditReadingSubmit);
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
    const buildingId = tenantBuildingInput.value.trim();
    const buildingObj = findBuildingById(buildingId);
    const building = buildingObj ? formatBuildingAddress(buildingObj) : '';
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
    const isDuplicate = tenants.some(t => (t.submeter || '').toString().toLowerCase() === submeter.toLowerCase() && t.id !== id);
    if (isDuplicate) {
        showToast('Use the edit button as the tenant with this water meter number already exists.', 'error');
        return;
    }

    if (editingTenantId) {
        // Edit mode
        const index = tenants.findIndex(t => t.id === editingTenantId);
        if (index !== -1) {
            // Validate compatibility of the new initial reading/date with the first reading
            const firstReading = readings
                .filter(r => r.tenantId === editingTenantId)
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            if (firstReading) {
                if (initialReading > firstReading.currReading) {
                    showToast(`Initial reading cannot be higher than the tenant's first recorded reading (${firstReading.currReading.toFixed(2)}).`, 'error');
                    return;
                }
                if (new Date(initialDate) > new Date(firstReading.date)) {
                    showToast(`Initial date cannot be later than the tenant's first recorded reading date (${formatDate(firstReading.date)}).`, 'error');
                    return;
                }
            }

            const oldTenant = tenants[index];
            tenants[index] = {
                ...oldTenant,
                buildingId,
                building,
                name,

                address,
                submeter,
                unitType,
                rate,
                initialReading,
                initialDate,
                currentReading: readings.some(r => r.tenantId === editingTenantId) ? oldTenant.currentReading : initialReading,
                currentDate: readings.some(r => r.tenantId === editingTenantId) ? oldTenant.currentDate : initialDate,
                synced: false
            };

            // Recalculate reading history in case initial reading/date or rate changed
            recalculateTenantHistory(editingTenantId);
            showToast('Tenant information updated successfully.', 'success');
        }
    } else {
        // Create mode
        const newTenant = {
            id: 'tenant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            buildingId,
            building,
            name,

            address,
            submeter,
            unitType,
            rate,
            initialReading,
            initialDate,
            currentReading: initialReading,
            currentDate: initialDate,
            synced: false
        };
        tenants.push(newTenant);
        showToast('New tenant added successfully.', 'success');
    }

    // Update/add in customTenantNames to keep profile metadata linked
    const tData = {
        name: name,

        address: address,
        submeter: submeter,
        unitType: unitType,
        rate: rate,
        initialReading: initialReading
    };
    const nameIdx = customTenantNames.findIndex(t => (typeof t === 'string' ? t : t.name) === name);
    if (nameIdx !== -1) {
        customTenantNames[nameIdx] = tData;
    } else {
        customTenantNames.push(tData);
    }

    saveData();
    resetTenantForm(true);
    renderAll();
    
    if (autoSyncEnabled && syncUrl) {
        syncWithCloud();
    }
}

function editTenant(id) {
    const tenant = findTenantById(id);
    if (!tenant) return;

    editingTenantId = tenant.id;
    tenantIdInput.value = tenant.id;
    tenantBuildingInput.value = tenant.buildingId || '';
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
    const tenant = findTenantById(id);
    if (!tenant) return;

    if (confirm(`Are you sure you want to delete "${tenant.name}"? This will also delete their entire reading history.`)) {
        // Register deletions for sync
        const tenantReadingIds = readings.filter(r => r.tenantId === id).map(r => r.id);
        registerDeletion(id);
        tenantReadingIds.forEach(rid => registerDeletion(rid));

        // Delete readings
        readings = readings.filter(r => r.tenantId !== id);
        // Delete tenant
        tenants = tenants.filter(t => t.id !== id);
        
        saveData();
        renderAll();
        showToast('Tenant and related reading history deleted.', 'success');
        if (autoSyncEnabled && syncUrl) {
            syncWithCloud();
        }
    }
}

function resetTenantForm(keepBuilding = false) {
    const savedBuilding = keepBuilding ? tenantBuildingInput.value : '';
    
    editingTenantId = null;
    tenantForm.reset();
    tenantIdInput.value = '';
    
    if (keepBuilding && savedBuilding) {
        tenantBuildingInput.value = savedBuilding;
        populateTenantFormDropdowns();
    } else {
        tenantBuildingInput.value = '';
        populateTenantFormDropdowns();
    }
    
    tenantFormTitle.innerHTML = `<i data-lucide="user-plus"></i> Building and Tenant Select`;
    saveTenantBtn.innerHTML = `<i data-lucide="save"></i> Save Tenant`;
    cancelEditTenantBtn.style.display = 'none';
    
    const today = new Date().toISOString().split('T')[0];
    if (tenantInitialDatePicker) {
        tenantInitialDatePicker.setDate(today);
    } else {
        tenantInitialDateInput.value = today;
    }
    lucide.createIcons();
    updateEditButtonsState();
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
    const selectedBuildingId = tenantBuildingInput.value;
    const filter = tenantSearchInput.value.toLowerCase();
    
    // If no building is selected, show an empty state prompting them to select a building
    if (!selectedBuildingId) {
        tenantTableBody.innerHTML = `
            <tr>
                <td colspan="12">
                    <div class="empty-state" style="text-align: center; padding: 2.5rem 1.5rem;">
                        <i data-lucide="building" style="width: 48px; height: 48px; margin: 0 auto 1rem auto; display: block; color: var(--primary); opacity: 0.6;"></i>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Select a building / property on the left to view active tenants.</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    const filteredTenants = tenants.filter(t => {
        // Must match selected building ID
        if (t.buildingId !== selectedBuildingId) return false;
        
        // Search filter matching
        const tName = (t.name || '').toString().toLowerCase();
        const tSubmeter = (t.submeter || '').toString().toLowerCase();
        const tAddress = (t.address || '').toString().toLowerCase();
        
        return tName.includes(filter) || 
               tSubmeter.includes(filter) ||
               tAddress.includes(filter);
    });

    tenantTableBody.innerHTML = '';

    if (filteredTenants.length === 0) {
        tenantTableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    <div class="empty-state" style="text-align: center; padding: 2.5rem 1.5rem;">
                        <i data-lucide="users" style="width: 48px; height: 48px; margin: 0 auto 1rem auto; display: block; color: var(--text-muted); opacity: 0.5;"></i>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">${tenants.length === 0 ? 'No tenants registered yet. Add one using the form on the left!' : 'No matching tenants found.'}</p>
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
            <td style="text-align: center;">
                <button class="action-btn edit" onclick="editTenant('${tenant.id}')" title="Edit Tenant" style="margin: 0 auto;">
                    <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
            <td style="text-align: center;">
                <button class="action-btn delete" onclick="deleteTenant('${tenant.id}')" title="Delete Tenant" style="margin: 0 auto;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
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
    
    const buildingsMap = new Map();
    tenants.forEach(t => {
        if (t.buildingId) {
            let bObj = findBuildingById(t.buildingId);
            if (!bObj) {
                bObj = {
                    id: t.buildingId,
                    address1: t.building || 'Unknown Building',
                    address2: '', city: '', state: '', zipCode: ''
                };
            }
            const normId = bObj.id.toString().trim().toLowerCase();
            buildingsMap.set(normId, bObj);
        }
    });
    
    const sortedBuildings = Array.from(buildingsMap.values()).sort((a, b) => {
        const addrA = formatBuildingAddress(a);
        const addrB = formatBuildingAddress(b);
        return addrA.localeCompare(addrB, undefined, {numeric: true, sensitivity: 'base'});
    });
    
    sortedBuildings.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = formatBuildingAddress(b);
        readingBuildingSelect.appendChild(option);
    });
    
    const currentBuildingNorm = currentBuilding ? currentBuilding.toString().trim().toLowerCase() : '';
    if (currentBuilding && Array.from(buildingsMap.keys()).includes(currentBuildingNorm)) {
        // Find the actual building object to get its correct casing for value
        const matchedBuilding = Array.from(buildingsMap.values()).find(b => b.id.toString().trim().toLowerCase() === currentBuildingNorm);
        readingBuildingSelect.value = matchedBuilding.id;
        populateTenantDropdown(matchedBuilding.id);
    } else {
        readingTenantSelect.innerHTML = '<option value="" disabled selected>Choose a tenant...</option>';
        readingTenantSelect.disabled = true;
        resetReadingFormFields(true);
    }
}

function populateTenantDropdown(selectedBuildingId) {
    const currentSelection = readingTenantSelect.value;
    readingTenantSelect.innerHTML = '<option value="" disabled selected>Choose a tenant...</option>';
    
    if (!selectedBuildingId) {
        readingTenantSelect.disabled = true;
        resetReadingFormFields(true);
        return;
    }
    
    readingTenantSelect.disabled = false;
    
    const normBuildingId = selectedBuildingId.toString().trim().toLowerCase();
    const filteredTenants = tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === normBuildingId);
    const sortedTenants = [...filteredTenants].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedTenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = `${tenant.name} (${tenant.submeter})`;
        readingTenantSelect.appendChild(option);
    });

    const currentSelectionNorm = currentSelection ? currentSelection.toString().trim().toLowerCase() : '';
    if (currentSelection && filteredTenants.some(t => t.id && t.id.toString().trim().toLowerCase() === currentSelectionNorm)) {
        const matchedTenant = filteredTenants.find(t => t.id.toString().trim().toLowerCase() === currentSelectionNorm);
        readingTenantSelect.value = matchedTenant.id;
        handleReadingTenantChange();
    } else {
        resetReadingFormFields(false);
    }
}

function handleReadingTenantChange() {
    const tenantId = readingTenantSelect.value;
    const tenant = findTenantById(tenantId);

    if (!tenant) {
        resetReadingFormFields(false);
        return;
    }

    // Populate Previous and current reading details
    refBuilding.textContent = tenant.building || 'N/A';
    refBuilding.title = tenant.building || 'N/A';
    refSubmeterId.textContent = tenant.submeter;
    refUnitType.textContent = tenant.unitType.toUpperCase();

    readingPrevInput.value = tenant.currentReading;
    readingPrevInput.disabled = false;
    readingPrevDateInput.disabled = false;

    if (readingPrevDatePicker) {
        readingPrevDatePicker.set('clickOpens', true);
        readingPrevDatePicker.setDate(tenant.currentDate);
    } else {
        readingPrevDateInput.value = tenant.currentDate;
    }

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

    readingPrevInput.value = '';
    readingPrevInput.disabled = true;
    
    const today = new Date().toISOString().split('T')[0];
    if (readingPrevDatePicker) {
        readingPrevDatePicker.set('clickOpens', false);
        readingPrevDatePicker.setDate(today);
    } else {
        readingPrevDateInput.value = today;
    }
    readingPrevDateInput.disabled = true;

    readingCurrentInput.value = '';
    readingCurrentInput.disabled = true;
    readingCommentsInput.value = '';
    readingCommentsInput.disabled = true;
    saveReadingBtn.disabled = true;

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
    const tenant = findTenantById(tenantId);
    if (!tenant) return;

    const prevReading = parseFloat(readingPrevInput.value);
    const prevDate = readingPrevDateInput.value;
    const currReading = parseFloat(readingCurrentInput.value);
    const date = readingDateInput.value;
    const comments = readingCommentsInput.value.trim();

    // Strict validation
    if (currReading < prevReading) {
        showToast(`Current reading (${currReading}) cannot be lower than the previous reading (${prevReading}).`, 'error');
        return;
    }

    if (new Date(date) < new Date(prevDate)) {
        showToast(`Reading date cannot be earlier than the previous reading date (${formatDate(prevDate)}).`, 'error');
        return;
    }

    // Step 1: Update the historical previous reading or tenant initial state
    const tenantReadings = readings
        .filter(r => r.tenantId === tenant.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    if (tenantReadings.length > 0) {
        const latestHistoryReading = tenantReadings[tenantReadings.length - 1];
        
        // Check that this edited previous value is compatible with the reading before it (if any)
        const prevPrevReadingVal = tenantReadings.length > 1 ? tenantReadings[tenantReadings.length - 2].currReading : tenant.initialReading;
        const prevPrevDateVal = tenantReadings.length > 1 ? tenantReadings[tenantReadings.length - 2].date : tenant.initialDate;
        
        if (prevReading < prevPrevReadingVal) {
            showToast(`Previous reading cannot be lower than the reading before it (${prevPrevReadingVal.toFixed(2)}).`, 'error');
            return;
        }
        if (new Date(prevDate) < new Date(prevPrevDateVal)) {
            showToast(`Previous date cannot be earlier than the date before it (${formatDate(prevPrevDateVal)}).`, 'error');
            return;
        }
        
        latestHistoryReading.currReading = prevReading;
        latestHistoryReading.date = prevDate;
    } else {
        // No historical readings, so previous reading maps to the tenant's initialReading
        tenant.initialReading = prevReading;
        tenant.initialDate = prevDate;
    }

    // Recalculate baseline sequence
    recalculateTenantHistory(tenantId);

    // Step 2: Create and push the new reading
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
        comments,
        synced: false
    };

    readings.push(newReading);

    // Recalculate everything to update current values and apply save
    recalculateTenantHistory(tenantId);

    saveData();
    resetReadingFormFields(true);
    populateReadingBuildingDropdown(); // Redraw references
    renderAll();
    closeReadingModal();
    showToast(`Reading recorded. Consumption: ${consumed.toFixed(2)} ${tenant.unitType.toUpperCase()}.`, 'success');
    
    if (autoSyncEnabled && syncUrl) {
        syncWithCloud();
    }
}

function deleteReading(readingId) {
    const reading = readings.find(r => r.id === readingId);
    if (!reading) return;

    if (confirm('Are you sure you want to delete this meter reading?')) {
        const tenant = findTenantById(reading.tenantId);
        
        // Register deletion for sync
        registerDeletion(readingId);

        // Remove reading
        readings = readings.filter(r => r.id !== readingId);
        
        // If the deleted reading was the latest reading for this tenant, we need to roll back the tenant's current status
        if (tenant) {
            const normTenantId = tenant.id ? tenant.id.toString().trim().toLowerCase() : '';
            const tenantReadings = readings
                .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // descending date order

            if (tenantReadings.length > 0) {
                tenant.currentReading = tenantReadings[0].currReading;
                tenant.currentDate = tenantReadings[0].date;
            } else {
                // Roll back to initial values
                tenant.currentReading = tenant.initialReading;
                tenant.currentDate = tenant.initialDate;
            }
            tenant.synced = false; // Mark tenant as unsynced
        }

        saveData();
        renderAll();
        showToast('Reading deleted and tenant status rolled back.', 'success');
        if (autoSyncEnabled && syncUrl) {
            syncWithCloud();
        }
    }
}

function renderReadings() {
    const filter = readingSearchInput.value.toLowerCase();
    const selectedBuilding = document.getElementById('readingBuildingFilter') ? document.getElementById('readingBuildingFilter').value : '';
    const selectedTenantId = document.getElementById('readingTenantFilter') ? document.getElementById('readingTenantFilter').value : '';
    
    // Sort readings by date descending
    const sortedReadings = [...readings].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredReadings = sortedReadings.filter(r => {
        const tenant = findTenantById(r.tenantId);
        
        // Filter by building
        if (selectedBuilding) {
            if (!tenant || !tenant.buildingId) return false;
            if (tenant.buildingId.toString().trim().toLowerCase() !== selectedBuilding.toString().trim().toLowerCase()) {
                return false;
            }
        }
        
        // Filter by tenant
        if (selectedTenantId) {
            if (!r.tenantId || r.tenantId.toString().trim().toLowerCase() !== selectedTenantId.toString().trim().toLowerCase()) {
                return false;
            }
        }
        
        const name = tenant && tenant.name ? tenant.name.toString().toLowerCase() : '';
        const submeter = tenant && tenant.submeter ? tenant.submeter.toString().toLowerCase() : '';
        const comments = r.comments ? r.comments.toString().toLowerCase() : '';
        
        return name.includes(filter) || submeter.includes(filter) || comments.includes(filter);
    });

    readingTableBody.innerHTML = '';

    if (filteredReadings.length === 0) {
        readingTableBody.innerHTML = `
            <tr>
                <td colspan="11">
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
        const tenant = findTenantById(reading.tenantId);
        const tenantName = tenant ? tenant.name : 'Unknown Tenant';
        const submeter = tenant ? tenant.submeter : 'N/A';

        // Find prior date dynamically
        const normTenantId = reading.tenantId ? reading.tenantId.toString().trim().toLowerCase() : '';
        const allTenantReadingsChronological = readings
            .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const currentIdx = allTenantReadingsChronological.findIndex(r => r.id === reading.id);
        const priorDateVal = currentIdx > 0 ? allTenantReadingsChronological[currentIdx - 1].date : (tenant ? tenant.initialDate : '');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--text-primary);">${escapeHTML(tenantName)}</strong></td>
            <td><code>${escapeHTML(submeter)}</code></td>
            <td>${formatDate(priorDateVal)}</td>
            <td>${reading.prevReading.toFixed(2)}</td>
            <td>${formatDate(reading.date)}</td>
            <td>${reading.currReading.toFixed(2)}</td>
            <td><strong style="color: var(--primary);">${reading.consumed.toFixed(2)}</strong></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${reading.unitType === 'gal' ? 'Gallons' : 'Cubic Feet'}</span></td>
            <td><strong style="color: var(--success);">$${reading.cost.toFixed(2)}</strong></td>
            <td><span class="helper-text" style="display: inline-block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(reading.comments)}">${escapeHTML(reading.comments) || '-'}</span></td>
            <td>
                <div class="action-btn-group" style="justify-content: center;">
                    <button class="action-btn edit" onclick="openEditReadingModal('${reading.id}')" title="Edit Reading">
                        <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                    </button>
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

// --- READING LEDGER FILTERS ---
function populateReadingFilters() {
    const readingBuildingFilter = document.getElementById('readingBuildingFilter');
    const readingTenantFilter = document.getElementById('readingTenantFilter');
    if (!readingBuildingFilter || !readingTenantFilter) return;

    const currentBuildingSelection = readingBuildingFilter.value;
    const currentTenantSelection = readingTenantFilter.value;

    // Get unique buildings from all active tenants
    const buildingsMap = new Map();
    tenants.forEach(t => {
        if (t.buildingId) {
            let bObj = findBuildingById(t.buildingId);
            if (!bObj) {
                bObj = { id: t.buildingId, address1: t.building || 'Unknown Building', address2: '', city: '', state: '', zipCode: '' };
            }
            const normId = bObj.id.toString().trim().toLowerCase();
            buildingsMap.set(normId, bObj);
        }
    });
    const sortedBuildings = Array.from(buildingsMap.values()).sort((a, b) => {
        const addrA = formatBuildingAddress(a);
        const addrB = formatBuildingAddress(b);
        return addrA.localeCompare(addrB, undefined, {numeric: true, sensitivity: 'base'});
    });

    // Populate Building Dropdown
    readingBuildingFilter.innerHTML = '<option value="">All Buildings</option>';
    sortedBuildings.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = formatBuildingAddress(b);
        readingBuildingFilter.appendChild(option);
    });

    // Restore selection if valid
    const currentBuildingSelectionNorm = currentBuildingSelection ? currentBuildingSelection.toString().trim().toLowerCase() : '';
    if (currentBuildingSelection && Array.from(buildingsMap.keys()).includes(currentBuildingSelectionNorm)) {
        const matchedBuilding = Array.from(buildingsMap.values()).find(b => b.id.toString().trim().toLowerCase() === currentBuildingSelectionNorm);
        readingBuildingFilter.value = matchedBuilding.id;
    }

    // Populate Tenant Dropdown based on selected building
    updateReadingTenantFilter();

    // Restore tenant selection if valid for this building
    const selectedBuildingId = readingBuildingFilter.value;
    const selectedBuildingIdNorm = selectedBuildingId ? selectedBuildingId.toString().trim().toLowerCase() : '';
    const filteredTenants = selectedBuildingId 
        ? tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === selectedBuildingIdNorm)
        : tenants;
    const currentTenantSelectionNorm = currentTenantSelection ? currentTenantSelection.toString().trim().toLowerCase() : '';
    if (currentTenantSelection && filteredTenants.some(t => t.id && t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm)) {
        const matchedTenant = filteredTenants.find(t => t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm);
        readingTenantFilter.value = matchedTenant.id;
    }
}

function updateReadingTenantFilter() {
    const readingBuildingFilter = document.getElementById('readingBuildingFilter');
    const readingTenantFilter = document.getElementById('readingTenantFilter');
    if (!readingTenantFilter || !readingBuildingFilter) return;

    const currentTenantSelection = readingTenantFilter.value;
    const selectedBuildingId = readingBuildingFilter.value;

    const selectedBuildingIdNorm = selectedBuildingId ? selectedBuildingId.toString().trim().toLowerCase() : '';
    const filteredTenants = selectedBuildingId 
        ? tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === selectedBuildingIdNorm)
        : tenants;

    // Sort tenants by name
    const sortedTenants = [...filteredTenants].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));

    readingTenantFilter.innerHTML = '<option value="">All Tenants</option>';
    sortedTenants.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = `${t.name} (${t.submeter})`;
        readingTenantFilter.appendChild(option);
    });

    const currentTenantSelectionNorm = currentTenantSelection ? currentTenantSelection.toString().trim().toLowerCase() : '';
    if (currentTenantSelection && filteredTenants.some(t => t.id && t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm)) {
        const matchedTenant = filteredTenants.find(t => t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm);
        readingTenantFilter.value = matchedTenant.id;
    }
}

// --- TAKEOFF FILTERS POPULATION ---
function populateTakeoffFilters() {
    if (!takeoffBuildingFilter || !takeoffTenantFilter) return;

    const currentBuildingSelection = takeoffBuildingFilter.value;
    const currentTenantSelection = takeoffTenantFilter.value;

    // Get unique buildings from all active tenants
    const buildingsMap = new Map();
    tenants.forEach(t => {
        if (t.buildingId) {
            let bObj = findBuildingById(t.buildingId);
            if (!bObj) {
                bObj = { id: t.buildingId, address1: t.building || 'Unknown Building', address2: '', city: '', state: '', zipCode: '' };
            }
            const normId = bObj.id.toString().trim().toLowerCase();
            buildingsMap.set(normId, bObj);
        }
    });
    const sortedBuildings = Array.from(buildingsMap.values()).sort((a, b) => {
        const addrA = formatBuildingAddress(a);
        const addrB = formatBuildingAddress(b);
        return addrA.localeCompare(addrB, undefined, {numeric: true, sensitivity: 'base'});
    });

    // Populate Building Dropdown
    takeoffBuildingFilter.innerHTML = '<option value="">All Buildings</option>';
    sortedBuildings.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = formatBuildingAddress(b);
        takeoffBuildingFilter.appendChild(option);
    });

    // Restore selection if valid
    const currentBuildingSelectionNorm = currentBuildingSelection ? currentBuildingSelection.toString().trim().toLowerCase() : '';
    if (currentBuildingSelection && Array.from(buildingsMap.keys()).includes(currentBuildingSelectionNorm)) {
        const matchedBuilding = Array.from(buildingsMap.values()).find(b => b.id.toString().trim().toLowerCase() === currentBuildingSelectionNorm);
        takeoffBuildingFilter.value = matchedBuilding.id;
    }

    // Populate Tenant Dropdown based on selected building
    updateTakeoffTenantFilter();

    // Restore tenant selection if valid for this building
    const selectedBuildingId = takeoffBuildingFilter.value;
    const selectedBuildingIdNorm = selectedBuildingId ? selectedBuildingId.toString().trim().toLowerCase() : '';
    const filteredTenants = selectedBuildingId 
        ? tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === selectedBuildingIdNorm)
        : tenants;
    const currentTenantSelectionNorm = currentTenantSelection ? currentTenantSelection.toString().trim().toLowerCase() : '';
    if (currentTenantSelection && filteredTenants.some(t => t.id && t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm)) {
        const matchedTenant = filteredTenants.find(t => t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm);
        takeoffTenantFilter.value = matchedTenant.id;
    }
}

function updateTakeoffTenantFilter() {
    if (!takeoffTenantFilter) return;

    const currentTenantSelection = takeoffTenantFilter.value;
    const selectedBuildingId = takeoffBuildingFilter.value;

    const selectedBuildingIdNorm = selectedBuildingId ? selectedBuildingId.toString().trim().toLowerCase() : '';
    const filteredTenants = selectedBuildingId 
        ? tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === selectedBuildingIdNorm)
        : tenants;
    const sortedTenants = [...filteredTenants].sort((a, b) => a.name.localeCompare(b.name));

    takeoffTenantFilter.innerHTML = '<option value="">All Tenants</option>';
    sortedTenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = `${tenant.name} (${tenant.submeter})`;
        takeoffTenantFilter.appendChild(option);
    });

    // Restore tenant selection if valid for this building
    const currentTenantSelectionNorm = currentTenantSelection ? currentTenantSelection.toString().trim().toLowerCase() : '';
    if (currentTenantSelection && filteredTenants.some(t => t.id && t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm)) {
        const matchedTenant = filteredTenants.find(t => t.id.toString().trim().toLowerCase() === currentTenantSelectionNorm);
        takeoffTenantFilter.value = matchedTenant.id;
    } else {
        takeoffTenantFilter.value = "";
    }
}

// --- TAKEOFF & EXCEL SUMMARY LOGIC ---
function renderTakeoff() {
    const start = takeoffStartDate.value;
    const end = takeoffEndDate.value;

    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const selectedBuilding = takeoffBuildingFilter ? takeoffBuildingFilter.value : '';
    const selectedTenantId = takeoffTenantFilter ? takeoffTenantFilter.value : '';

    // Filter tenants based on building/tenant dropdown filters
    const filteredTenants = tenants.filter(t => {
        const matchesBuilding = !selectedBuilding || t.buildingId === selectedBuilding;
        const matchesTenant = !selectedTenantId || t.id === selectedTenantId;
        return matchesBuilding && matchesTenant;
    });

    // Calculate Dashboard Stats from readings in range for the filtered tenants
    const filteredTenantIds = new Set(filteredTenants.map(t => t.id));
    const periodReadings = readings.filter(r => {
        const d = new Date(r.date);
        return d >= startDate && d <= endDate && filteredTenantIds.has(r.tenantId);
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

    statTotalTenants.textContent = filteredTenants.length;
    statTotalGallons.textContent = `${totalGallons.toLocaleString(undefined, {maximumFractionDigits: 2})} gal`;
    statTotalCF.textContent = `${totalCF.toLocaleString(undefined, {maximumFractionDigits: 2})} cf`;
    statTotalBilled.textContent = `$${totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Render Takeoff Table
    // The takeoff lists all tenants and calculates their net billing/consumption based on readings in the period.
    takeoffTableBody.innerHTML = '';

    if (tenants.length === 0) {
        takeoffTableBody.innerHTML = `
            <tr>
                <td colspan="12">
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

    if (filteredTenants.length === 0) {
        takeoffTableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    <div class="empty-state">
                        <i data-lucide="calculator" style="width: 48px; height: 48px;"></i>
                        <p>No tenants found matching the active filters.</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    filteredTenants.forEach(tenant => {
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
async function exportToExcel(source = 'takeoff') {
    if (tenants.length === 0) {
        showToast('No tenant data available to export.', 'error');
        return;
    }

    try {
        const start = takeoffStartDate ? takeoffStartDate.value : '';
        const end = takeoffEndDate ? takeoffEndDate.value : '';
        const startDate = start ? new Date(start) : new Date();
        const endDate = end ? new Date(end) : new Date();

        let selectedBuilding = '';
        let selectedTenantId = '';

        if (source === 'readings') {
            const readingBuildingFilter = document.getElementById('readingBuildingFilter');
            const readingTenantFilter = document.getElementById('readingTenantFilter');
            selectedBuilding = readingBuildingFilter ? readingBuildingFilter.value : '';
            selectedTenantId = readingTenantFilter ? readingTenantFilter.value : '';
        } else {
            selectedBuilding = takeoffBuildingFilter ? takeoffBuildingFilter.value : '';
            selectedTenantId = takeoffTenantFilter ? takeoffTenantFilter.value : '';
        }

        // Filter tenants based on active filters
        const filteredTenants = tenants.filter(t => {
            const matchesBuilding = !selectedBuilding || t.buildingId === selectedBuilding;
            const matchesTenant = !selectedTenantId || t.id === selectedTenantId;
            return matchesBuilding && matchesTenant;
        });

        const filteredTenantIds = new Set(filteredTenants.map(t => t.id ? t.id.toString().trim().toLowerCase() : ''));

        // --- 1. BILLING TAKEOFF SHEET DATA ---
        const takeoffData = [];
        filteredTenants.forEach(tenant => {
            const normTenantId = tenant.id ? tenant.id.toString().trim().toLowerCase() : '';
            const tenantPeriodReadings = readings
                .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId && new Date(r.date) >= startDate && new Date(r.date) <= endDate)
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
                    .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId && new Date(r.date) < startDate)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastValue = historicReadings.length > 0 ? historicReadings[0].currReading : tenant.initialReading;
                startRead = lastValue;
                endRead = lastValue;
            }

            takeoffData.push({
                'Store Name': tenant.name,
                'Building': tenant.building || 'N/A',
                'Submeter ID': tenant.submeter,
                'Unit Type': (tenant.unitType || 'cf').toUpperCase(),
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
        const directoryData = filteredTenants.map(t => ({
            'Store Name': t.name,
            'Building': t.building || 'N/A',
            'Unit Address': t.address,
            'Submeter ID': t.submeter,
            'Unit Type': (t.unitType || 'cf').toUpperCase(),
            'Billing Rate ($/unit)': t.rate,
            'Current Reading Value': t.currentReading,
            'Last Reading Date': t.currentDate
        }));

        // --- 3. READING HISTORY SHEET DATA ---
        const historyData = readings
            .filter(r => r.tenantId && filteredTenantIds.has(r.tenantId.toString().trim().toLowerCase()))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(r => {
                const tenant = findTenantById(r.tenantId);
                return {
                    'Reading Date': r.date,
                    'Store Name': tenant ? tenant.name : 'Unknown',
                    'Submeter ID': tenant ? tenant.submeter : 'N/A',
                    'Unit Type': (r.unitType || (tenant ? tenant.unitType : '') || 'cf').toUpperCase(),
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
        XLSX.utils.book_append_sheet(wb, wsTakeoff, 'Billing Takeoff');
        XLSX.utils.book_append_sheet(wb, wsDirectory, 'Tenant Directory');
        XLSX.utils.book_append_sheet(wb, wsHistory, 'All Reading Logs');

        // Write workbook to file and trigger browser download
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const fileName = `WaterMeterReadings_${dateStr}.xlsx`;

        let saved = false;
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    startIn: 'desktop',
                    types: [{
                        description: 'Excel Workbook',
                        accept: {
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                        }
                    }]
                });
                const writable = await handle.createWritable();
                const u8arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                await writable.write(u8arr);
                await writable.close();
                showToast(`Excel workbook exported successfully: ${fileName}`, 'success');
                saved = true;
            } catch (err) {
                if (err.name === 'AbortError') {
                    showToast('Export cancelled by user.', 'info');
                    return;
                }
                console.warn('File System Access API failed or is restricted. Falling back to standard download method.', err);
            }
        }

        if (!saved) {
            // Fallback for browsers that don't support showSaveFilePicker or if it fails/is restricted
            XLSX.writeFile(wb, fileName);
            showToast(`Excel workbook exported successfully: ${fileName}`, 'success');
        }
    } catch (error) {
        console.error(error);
        showToast('Failed to export Excel file: ' + (error.message || error), 'error');
    }
}

// --- DATA BACKUP & RESTORE (JSON) ---
function handleExportBackup() {
    if (tenants.length === 0 && readings.length === 0) {
        showToast('No data to backup.', 'error');
        return;
    }

    try {
        const dataStr = JSON.stringify({
            tenants,
            readings,
            customBuildings: customBuildings || [],
            customTenantNames: customTenantNames || [],
            customAddresses: customAddresses || []
        }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `WaterMeterProBackup_${new Date().toISOString().split('T')[0]}.json`;
        
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
                if (Array.isArray(importedData.customBuildings)) customBuildings = importedData.customBuildings;
                if (Array.isArray(importedData.customTenantNames)) customTenantNames = importedData.customTenantNames;
                if (Array.isArray(importedData.customAddresses)) customAddresses = importedData.customAddresses;
                
                // Run migration to normalize / upgrade structures
                migrateBuildingsData();

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

function handleImportExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetDirectory = workbook.Sheets['Tenant Directory'];
            const sheetHistory = workbook.Sheets['All Reading Logs'];

            if (!sheetDirectory) {
                showToast('Import failed: "Tenant Directory" sheet not found in workbook.', 'error');
                return;
            }

            const directoryRows = XLSX.utils.sheet_to_json(sheetDirectory);
            const historyRows = sheetHistory ? XLSX.utils.sheet_to_json(sheetHistory) : [];

            if (directoryRows.length === 0) {
                showToast('Import failed: No tenant data found in "Tenant Directory".', 'error');
                return;
            }

            const importedTenants = [];
            const importedBuildings = [];
            const buildingsMap = new Map(); // formattedAddress -> id

            directoryRows.forEach(row => {
                const name = row['Store Name'] || '';
                const buildingAddress = row['Building'] || '';
                const address = row['Unit Address'] || '';
                const submeter = row['Submeter ID'] || '';
                const unitType = (row['Unit Type'] || 'cf').toString().toLowerCase().trim();
                const rate = parseFloat(row['Billing Rate ($/unit)']) || 0;
                const currentReading = parseFloat(row['Current Reading Value']) || 0;
                const currentDate = row['Last Reading Date'] || '';

                if (!name) return;

                // Resolve or create building
                let buildingId = '';
                if (buildingAddress && buildingAddress !== 'N/A') {
                    if (!buildingsMap.has(buildingAddress)) {
                        const bId = 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                        buildingsMap.set(buildingAddress, bId);
                        const parts = buildingAddress.split(',').map(p => p.trim());
                        importedBuildings.push({
                            id: bId,
                            address1: parts[0] || buildingAddress,
                            address2: '',
                            city: parts[1] || '',
                            state: parts[2] ? parts[2].split(' ')[0] : '',
                            zipCode: parts[2] ? parts[2].split(' ')[1] : ''
                        });
                    }
                    buildingId = buildingsMap.get(buildingAddress);
                }

                importedTenants.push({
                    id: 'tenant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    buildingId,
                    building: buildingAddress === 'N/A' ? '' : buildingAddress,
                    name,
                    address,
                    submeter,
                    unitType: unitType === 'gal' ? 'gal' : 'cf',
                    rate,
                    initialReading: currentReading, // fallback
                    initialDate: currentDate,        // fallback
                    currentReading,
                    currentDate,
                    synced: false
                });
            });

            const importedReadings = [];
            historyRows.forEach(row => {
                const readingDate = row['Reading Date'] || '';
                const storeName = row['Store Name'] || '';
                const submeter = row['Submeter ID'] || '';
                const unitType = (row['Unit Type'] || 'cf').toString().toLowerCase().trim();
                const prevReading = parseFloat(row['Previous Reading']) || 0;
                const currReading = parseFloat(row['Current Reading']) || 0;
                const consumed = parseFloat(row['Consumed']) || 0;
                const rate = parseFloat(row['Rate Applied']) || 0;
                const cost = parseFloat(row['Cost Calculated']) || 0;
                const comments = row['Comments'] || '';

                const tenant = importedTenants.find(t => t.name === storeName && t.submeter === submeter);
                if (tenant) {
                    importedReadings.push({
                        id: 'reading_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        tenantId: tenant.id,
                        date: readingDate,
                        unitType: unitType === 'gal' ? 'gal' : 'cf',
                        prevReading,
                        currReading,
                        consumed,
                        rate,
                        cost,
                        comments
                    });
                }
            });

            // Adjust tenant initial readings/dates based on readings history
            importedTenants.forEach(tenant => {
                const tenantReadings = importedReadings
                    .filter(r => r.tenantId === tenant.id)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (tenantReadings.length > 0) {
                    tenant.initialReading = tenantReadings[0].prevReading;
                    tenant.initialDate = tenantReadings[0].date;
                    const latest = tenantReadings[tenantReadings.length - 1];
                    tenant.currentReading = latest.currReading;
                    tenant.currentDate = latest.date;
                }
            });

            // Rebuild custom metadata collections
            const newCustomTenantNames = importedTenants.map(t => ({
                name: t.name,
                address: t.address,
                submeter: t.submeter,
                unitType: t.unitType,
                rate: t.rate,
                initialReading: t.initialReading
            }));

            const newCustomAddresses = [];
            const seenAddresses = new Set();
            importedTenants.forEach(t => {
                if (t.address && !seenAddresses.has(t.address)) {
                    seenAddresses.add(t.address);
                    newCustomAddresses.push({
                        id: 'address_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        address1: t.address,
                        premises: '',
                        contact: '',
                        email: '',
                        storeNumber: ''
                    });
                }
            });

            // Commit to active state
            tenants = importedTenants;
            readings = importedReadings;
            if (importedBuildings.length > 0) customBuildings = importedBuildings;
            if (newCustomTenantNames.length > 0) customTenantNames = newCustomTenantNames;
            if (newCustomAddresses.length > 0) customAddresses = newCustomAddresses;

            saveData();
            renderAll();
            showToast(`Data imported successfully from Excel! Loaded ${tenants.length} tenants and ${readings.length} readings.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to parse Excel file: ' + (error.message || error), 'error');
        }
        // Reset file input
        importExcelFileInput.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function updateEditButtonsState() {
    const editBuildingBtn = document.getElementById('editBuildingBtn');
    const editTenantNameBtn = document.getElementById('editTenantNameBtn');
    const editAddressBtn = document.getElementById('editAddressBtn');
    
    const deleteBuildingBtn = document.getElementById('deleteBuildingBtn');
    const deleteTenantNameBtn = document.getElementById('deleteTenantNameBtn');
    
    if (editBuildingBtn) {
        editBuildingBtn.disabled = !tenantBuildingInput.value;
    }
    if (editTenantNameBtn) {
        editTenantNameBtn.disabled = !tenantNameInput.value;
    }
    if (editAddressBtn) {
        editAddressBtn.disabled = !tenantAddressInput.value;
    }
    if (deleteBuildingBtn) {
        deleteBuildingBtn.disabled = !tenantBuildingInput.value;
    }
    if (deleteTenantNameBtn) {
        deleteTenantNameBtn.disabled = !tenantNameInput.value;
    }
}

function formatBuildingAddress(b) {
    if (!b) return '';
    if (typeof b === 'string') return b;
    return `${b.address1}${b.address2 ? ' ' + b.address2 : ''}, ${b.city}, ${b.state} ${b.zipCode}`;
}

function formatUnitAddress(a) {
    if (!a) return '';
    if (typeof a === 'string') return a;
    return `${a.address1} (Store: ${a.storeNumber}, Premises: ${a.premises}, Contact: ${a.contact}, Email: ${a.email})`;
}

function deleteBuilding() {
    const buildingId = tenantBuildingInput.value;
    if (!buildingId) {
        showToast('Please select a building to delete.', 'error');
        return;
    }
    const building = findBuildingById(buildingId);
    if (!building) return;

    const normBuildingId = buildingId ? buildingId.toString().trim().toLowerCase() : '';
    const hasTenants = tenants.some(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === normBuildingId);
    let confirmMsg = `Are you sure you want to delete the building "${formatBuildingAddress(building)}"?`;
    if (hasTenants) {
        confirmMsg += `\n\nWARNING: Deleting this building will also delete all associated active tenants and their reading history!`;
    }

    if (confirm(confirmMsg)) {
        if (hasTenants) {
            // Find all tenants in this building
            const tenantsToDelete = tenants.filter(t => t.buildingId && t.buildingId.toString().trim().toLowerCase() === normBuildingId);
            tenantsToDelete.forEach(t => {
                const normTenantId = t.id ? t.id.toString().trim().toLowerCase() : '';
                // Register deletions for sync
                const tenantReadingIds = readings.filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId).map(r => r.id);
                registerDeletion(t.id);
                tenantReadingIds.forEach(rid => registerDeletion(rid));
                
                // Remove readings
                readings = readings.filter(r => !r.tenantId || r.tenantId.toString().trim().toLowerCase() !== normTenantId);
            });
            // Remove tenants
            tenants = tenants.filter(t => !t.buildingId || t.buildingId.toString().trim().toLowerCase() !== normBuildingId);
        }

        // Delete from customBuildings
        customBuildings = customBuildings.filter(b => !b.id || b.id.toString().trim().toLowerCase() !== normBuildingId);

        saveData();
        tenantBuildingInput.value = '';
        populateTenantFormDropdowns();
        renderAll();

        showToast('Building and associated data deleted successfully.', 'success');
        if (autoSyncEnabled && syncUrl) {
            syncWithCloud();
        }
    }
}



function deleteTenantName() {
    const selectedName = tenantNameInput.value;
    if (!selectedName) {
        showToast('Please select a store/tenant name to delete.', 'error');
        return;
    }

    const hasActiveTenants = tenants.some(t => t.name === selectedName);
    let confirmMsg = `Are you sure you want to delete the tenant name "${selectedName}" from the list?`;
    if (hasActiveTenants) {
        confirmMsg += `\n\nWARNING: Deleting this tenant name will also delete all associated active tenants and their reading history!`;
    }

    if (confirm(confirmMsg)) {
        if (hasActiveTenants) {
            const tenantsToDelete = tenants.filter(t => t.name === selectedName);
            tenantsToDelete.forEach(t => {
                // Register deletions for sync
                const tenantReadingIds = readings.filter(r => r.tenantId === t.id).map(r => r.id);
                registerDeletion(t.id);
                tenantReadingIds.forEach(rid => registerDeletion(rid));
                
                // Remove readings
                readings = readings.filter(r => r.tenantId !== t.id);
            });
            // Remove tenants
            tenants = tenants.filter(t => t.name !== selectedName);
        }

        // Delete from customTenantNames
        customTenantNames = customTenantNames.filter(n => (typeof n === 'string' ? n : n.name) !== selectedName);

        saveData();
        tenantNameInput.value = '';
        populateTenantFormDropdowns();
        renderAll();

        showToast('Tenant name and associated data deleted successfully.', 'success');
        if (autoSyncEnabled && syncUrl) {
            syncWithCloud();
        }
    }
}

// --- DROPDOWNS & MODAL ENGINE ---
function populateTenantFormDropdowns() {
    const selectedBuildingId = tenantBuildingInput.value;

    const buildingsMap = new Map();
    customBuildings.forEach(b => {
        if (b && b.id) {
            buildingsMap.set(b.id, b);
        }
    });
    tenants.forEach(t => {
        if (t.buildingId && !buildingsMap.has(t.buildingId)) {
            buildingsMap.set(t.buildingId, {
                id: t.buildingId,
                address1: t.building || 'Unknown Building',
                address2: '', city: '', state: '', zipCode: ''
            });
        }
    });
    const sortedBuildings = Array.from(buildingsMap.values()).sort((a, b) => {
        const addrA = formatBuildingAddress(a);
        const addrB = formatBuildingAddress(b);
        return addrA.localeCompare(addrB, undefined, {numeric: true, sensitivity: 'base'});
    });
    
    const namesSet = new Set();
    const addressesSet = new Set();

    // Filter store names, addresses, and companies by the currently selected building ID, if any
    tenants.forEach(t => {
        if (!selectedBuildingId || t.buildingId === selectedBuildingId) {
            if (t.name) namesSet.add(t.name);
            if (t.address) addressesSet.add(t.address);
        }
    });

    // Custom items added via plus button are filtered if a building is selected
    customTenantNames.forEach(n => {
        if (!n) return;
        const nameVal = typeof n === 'string' ? n : n.name;
        if (selectedBuildingId) {
            const assignedToThisBuilding = tenants.some(t => t.name === nameVal && t.buildingId === selectedBuildingId);
            const assignedToOtherBuildings = tenants.some(t => t.name === nameVal && t.buildingId !== selectedBuildingId);
            if (assignedToOtherBuildings && !assignedToThisBuilding) {
                return;
            }
        }
        namesSet.add(nameVal);
    });
    customAddresses.forEach(a => {
        if (!a) return;
        const addrStr = typeof a === 'string' ? a : formatUnitAddress(a);
        if (selectedBuildingId) {
            const assignedToThisBuilding = tenants.some(t => t.address === addrStr && t.buildingId === selectedBuildingId);
            const assignedToOtherBuildings = tenants.some(t => t.address === addrStr && t.buildingId !== selectedBuildingId);
            if (assignedToOtherBuildings && !assignedToThisBuilding) {
                return;
            }
        }
        addressesSet.add(addrStr);
    });


    const sortedNames = Array.from(namesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
    const sortedAddresses = Array.from(addressesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));

    const updateSelect = (selectEl, optionsList, defaultText, isOptional = false) => {
        const currentValue = selectEl.value;
        const disabledAttr = isOptional ? '' : 'disabled';
        selectEl.innerHTML = `<option value="" ${disabledAttr} selected>${defaultText}</option>`;
        
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

    const updateBuildingSelect = (selectEl, buildingsList, defaultText) => {
        const currentValue = selectEl.value;
        selectEl.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        
        buildingsList.forEach(b => {
            const option = document.createElement('option');
            option.value = b.id;
            option.textContent = formatBuildingAddress(b);
            selectEl.appendChild(option);
        });
        
        const currentValueNorm = currentValue ? currentValue.toString().trim().toLowerCase() : '';
        if (currentValue && buildingsList.some(b => b.id && b.id.toString().trim().toLowerCase() === currentValueNorm)) {
            const matchedBuilding = buildingsList.find(b => b.id.toString().trim().toLowerCase() === currentValueNorm);
            selectEl.value = matchedBuilding.id;
        }
    };

    updateBuildingSelect(tenantBuildingInput, sortedBuildings, 'Select Property...');
    updateSelect(tenantNameInput, sortedNames, 'Select Store...');
    updateSelect(tenantAddressInput, sortedAddresses, 'Select Address...');
    updateEditButtonsState();
}

function setRequiredForGroup(groupId, isRequired) {
    const group = document.getElementById(groupId);
    if (!group) return;
    const inputs = group.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.required = isRequired;
    });
}



function openModal(mode) {
    modalMode = mode;
    
    // Hide all modal fields groups first
    document.getElementById('tenantNameModalFields').style.display = 'none';
    document.getElementById('buildingModalFields').style.display = 'none';
    document.getElementById('unitAddressModalFields').style.display = 'none';
    
    // Unset required attribute for all groups
    setRequiredForGroup('tenantNameModalFields', false);
    setRequiredForGroup('buildingModalFields', false);
    setRequiredForGroup('unitAddressModalFields', false);
    
    let title = '';
    let icon = '';
    
    if (mode === 'building') {
        title = 'Add Building / Property';
        icon = 'building';
        document.getElementById('buildingModalFields').style.display = 'block';
        setRequiredForGroup('buildingModalFields', true);
        
        // Address 2 is optional
        document.getElementById('buildingAddress2').required = false;
        
        // Clear values
        document.getElementById('buildingAddress1').value = '';
        document.getElementById('buildingAddress2').value = '';
        document.getElementById('buildingCity').value = '';
        document.getElementById('buildingState').value = '';
        document.getElementById('buildingZip').value = '';
        
        setTimeout(() => document.getElementById('buildingAddress1').focus(), 100);
    } else if (mode === 'editBuilding') {
        const selectedVal = tenantBuildingInput.value; // buildingId
        const b = findBuildingById(selectedVal) || { address1: selectedVal };
        
        title = 'Edit Building / Property';
        icon = 'building';
        document.getElementById('buildingModalFields').style.display = 'block';
        setRequiredForGroup('buildingModalFields', true);
        document.getElementById('buildingAddress2').required = false;
        
        document.getElementById('buildingAddress1').value = b.address1 || '';
        document.getElementById('buildingAddress2').value = b.address2 || '';
        document.getElementById('buildingCity').value = b.city || '';
        document.getElementById('buildingState').value = b.state || '';
        document.getElementById('buildingZip').value = b.zipCode || '';
        
        setTimeout(() => document.getElementById('buildingAddress1').focus(), 100);
    } else if (mode === 'tenantName') {
        title = 'Add Store / Tenant Name';
        icon = 'store';
        document.getElementById('tenantNameModalFields').style.display = 'block';
        setRequiredForGroup('tenantNameModalFields', true);
        
        // Submeter is optional
        document.getElementById('modalTenantSubmeter').required = false;
        
        // Populate Address Dropdown in modal
        const populateModalAddressDropdown = () => {
            const addressesSet = new Set();
            tenants.forEach(t => {
                if (t.address) addressesSet.add(t.address);
            });
            customAddresses.forEach(a => {
                if (!a) return;
                const addrStr = typeof a === 'string' ? a : formatUnitAddress(a);
                addressesSet.add(addrStr);
            });
            const sortedAddresses = Array.from(addressesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
            
            const modalTenantAddressSelect = document.getElementById('modalTenantAddress');
            if (modalTenantAddressSelect) {
                modalTenantAddressSelect.innerHTML = '<option value="" disabled selected>Select Address...</option>';
                sortedAddresses.forEach(addr => {
                    const option = document.createElement('option');
                    option.value = addr;
                    option.textContent = addr;
                    modalTenantAddressSelect.appendChild(option);
                });
            }
        };
        populateModalAddressDropdown();

        // Clear values
        document.getElementById('modalTenantNameValue').value = '';

        document.getElementById('modalTenantAddress').value = '';
        document.getElementById('modalTenantSubmeter').value = '';
        document.getElementById('modalTenantUnit').value = 'cf';
        document.getElementById('modalTenantRate').value = '';
        document.getElementById('modalTenantInitialReading').value = '0';
        
        setTimeout(() => document.getElementById('modalTenantNameValue').focus(), 100);
    } else if (mode === 'editTenantName') {
        const selectedVal = tenantNameInput.value;
        const tenantObj = customTenantNames.find(t => (typeof t === 'string' ? t : t.name) === selectedVal);
        
        title = 'Edit Store / Tenant Name';
        icon = 'store';
        document.getElementById('tenantNameModalFields').style.display = 'block';
        setRequiredForGroup('tenantNameModalFields', true);
        
        // Submeter is optional
        document.getElementById('modalTenantSubmeter').required = false;
        
        // Populate Address Dropdown in modal
        const populateModalAddressDropdown = () => {
            const addressesSet = new Set();
            tenants.forEach(t => {
                if (t.address) addressesSet.add(t.address);
            });
            customAddresses.forEach(a => {
                if (!a) return;
                const addrStr = typeof a === 'string' ? a : formatUnitAddress(a);
                addressesSet.add(addrStr);
            });
            const sortedAddresses = Array.from(addressesSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
            
            const modalTenantAddressSelect = document.getElementById('modalTenantAddress');
            if (modalTenantAddressSelect) {
                modalTenantAddressSelect.innerHTML = '<option value="" disabled selected>Select Address...</option>';
                sortedAddresses.forEach(addr => {
                    const option = document.createElement('option');
                    option.value = addr;
                    option.textContent = addr;
                    modalTenantAddressSelect.appendChild(option);
                });
            }
        };
        populateModalAddressDropdown();

        document.getElementById('modalTenantNameValue').value = selectedVal || '';
        if (tenantObj && typeof tenantObj === 'object') {

            document.getElementById('modalTenantAddress').value = tenantObj.address || '';
            document.getElementById('modalTenantSubmeter').value = tenantObj.submeter || '';
            document.getElementById('modalTenantUnit').value = tenantObj.unitType || 'cf';
            document.getElementById('modalTenantRate').value = tenantObj.rate !== undefined ? tenantObj.rate : '';
            document.getElementById('modalTenantInitialReading').value = tenantObj.initialReading !== undefined ? tenantObj.initialReading : '0';
        } else {

            document.getElementById('modalTenantAddress').value = '';
            document.getElementById('modalTenantSubmeter').value = '';
            document.getElementById('modalTenantUnit').value = 'cf';
            document.getElementById('modalTenantRate').value = '';
            document.getElementById('modalTenantInitialReading').value = '0';
        }
        
        setTimeout(() => document.getElementById('modalTenantNameValue').focus(), 100);
    } else if (mode === 'address') {
        title = 'Add Unit Address';
        icon = 'map-pin';
        document.getElementById('unitAddressModalFields').style.display = 'block';
        setRequiredForGroup('unitAddressModalFields', true);
        
        // Clear values
        document.getElementById('unitAddress1').value = '';
        document.getElementById('unitPremises').value = '';
        document.getElementById('unitContact').value = '';
        document.getElementById('unitEmail').value = '';
        document.getElementById('unitStoreNumber').value = '';
        
        setTimeout(() => document.getElementById('unitAddress1').focus(), 100);
    } else if (mode === 'editAddress') {
        const selectedVal = tenantAddressInput.value;
        const a = customAddresses.find(item => formatUnitAddress(item) === selectedVal) || { address1: selectedVal };
        
        title = 'Edit Unit Address';
        icon = 'map-pin';
        document.getElementById('unitAddressModalFields').style.display = 'block';
        setRequiredForGroup('unitAddressModalFields', true);
        
        document.getElementById('unitAddress1').value = a.address1 || '';
        document.getElementById('unitPremises').value = a.premises || '';
        document.getElementById('unitContact').value = a.contact || '';
        document.getElementById('unitEmail').value = a.email || '';
        document.getElementById('unitStoreNumber').value = a.storeNumber || '';
        
        setTimeout(() => document.getElementById('unitAddress1').focus(), 100);
    }

    modalTitle.innerHTML = `<i data-lucide="${icon}"></i> ${title}`;
    addOptionModal.classList.add('active');
    addOptionModal.setAttribute('aria-hidden', 'false');
    
    lucide.createIcons();
}

function closeModal() {
    addOptionModal.classList.remove('active');
    addOptionModal.setAttribute('aria-hidden', 'true');
    modalMode = '';
    
    // Clear all fields
    document.getElementById('modalTenantNameValue').value = '';
    document.getElementById('modalTenantAddress').value = '';
    document.getElementById('modalTenantSubmeter').value = '';
    document.getElementById('modalTenantUnit').value = 'cf';
    document.getElementById('modalTenantRate').value = '';
    document.getElementById('modalTenantInitialReading').value = '0';
    document.getElementById('buildingAddress1').value = '';
    document.getElementById('buildingAddress2').value = '';
    document.getElementById('buildingCity').value = '';
    document.getElementById('buildingState').value = '';
    document.getElementById('buildingZip').value = '';
    document.getElementById('unitAddress1').value = '';
    document.getElementById('unitPremises').value = '';
    document.getElementById('unitContact').value = '';
    document.getElementById('unitEmail').value = '';
    document.getElementById('unitStoreNumber').value = '';
}

function closeReadingModal() {
    if (logReadingModal) {
        logReadingModal.classList.remove('active');
        logReadingModal.setAttribute('aria-hidden', 'true');
    }
}

let editReadingDatePicker;

function openEditReadingModal(readingId) {
    const reading = readings.find(r => r.id === readingId);
    if (!reading) return;

    const tenant = findTenantById(reading.tenantId);
    const tenantName = tenant ? tenant.name : 'Unknown Tenant';

    document.getElementById('editReadingId').value = reading.id;
    document.getElementById('editReadingTenantId').value = reading.tenantId;
    document.getElementById('editReadingTenantName').value = tenantName;
    document.getElementById('editReadingPrev').value = reading.prevReading;
    document.getElementById('editReadingCurrent').value = reading.currReading;
    document.getElementById('editReadingComments').value = reading.comments || '';

    // Initialize/update Flatpickr for the edit modal
    if (editReadingDatePicker) {
        editReadingDatePicker.setDate(reading.date);
    } else {
        editReadingDatePicker = flatpickr("#editReadingDate", {
            defaultDate: reading.date,
            dateFormat: "Y-m-d",
            theme: "dark"
        });
    }

    const editReadingModal = document.getElementById('editReadingModal');
    editReadingModal.classList.add('active');
    editReadingModal.setAttribute('aria-hidden', 'false');
    
    lucide.createIcons();
}

function closeEditReadingModal() {
    const editReadingModal = document.getElementById('editReadingModal');
    if (editReadingModal) {
        editReadingModal.classList.remove('active');
        editReadingModal.setAttribute('aria-hidden', 'true');
    }
}

function handleEditReadingSubmit(e) {
    e.preventDefault();

    const readingId = document.getElementById('editReadingId').value;
    const tenantId = document.getElementById('editReadingTenantId').value;
    const newCurrVal = parseFloat(document.getElementById('editReadingCurrent').value);
    const newPrevVal = parseFloat(document.getElementById('editReadingPrev').value);
    const newDate = document.getElementById('editReadingDate').value;
    const newComments = document.getElementById('editReadingComments').value.trim();

    const tenant = findTenantById(tenantId);
    if (!tenant) return;

    // Validation
    const normTenantId = tenantId ? tenantId.toString().trim().toLowerCase() : '';
    const tenantReadings = readings
        .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    const currentIndex = tenantReadings.findIndex(r => r.id === readingId);
    if (currentIndex === -1) return;

    if (newCurrVal < newPrevVal) {
        showToast(`Current reading value cannot be lower than the previous reading value (${newPrevVal.toFixed(2)}).`, 'error');
        return;
    }

    // Validate newPrevVal against preceding reading if any
    const beforePrevVal = currentIndex > 1 ? tenantReadings[currentIndex - 2].currReading : tenant.initialReading;
    if (currentIndex > 0 && newPrevVal < beforePrevVal) {
        showToast(`Previous reading cannot be lower than the preceding reading value (${beforePrevVal.toFixed(2)}).`, 'error');
        return;
    }

    // Validate newCurrVal against subsequent reading if any
    const nextReadingVal = currentIndex < tenantReadings.length - 1 ? tenantReadings[currentIndex + 1].currReading : null;
    if (nextReadingVal !== null && newCurrVal > nextReadingVal) {
        showToast(`Current reading cannot be higher than the subsequent reading value (${nextReadingVal.toFixed(2)}).`, 'error');
        return;
    }

    // Date validation
    const prevDateVal = currentIndex > 0 ? tenantReadings[currentIndex - 1].date : tenant.initialDate;
    const nextDateVal = currentIndex < tenantReadings.length - 1 ? tenantReadings[currentIndex + 1].date : null;

    if (new Date(newDate) < new Date(prevDateVal)) {
        showToast(`Reading date cannot be earlier than the previous reading date (${formatDate(prevDateVal)}).`, 'error');
        return;
    }
    if (nextDateVal !== null && new Date(newDate) > new Date(nextDateVal)) {
        showToast(`Reading date cannot be later than the subsequent reading date (${formatDate(nextDateVal)}).`, 'error');
        return;
    }

    // Update cascading values:
    if (currentIndex > 0) {
        // Update preceding reading's current reading
        const prevReadingRecord = tenantReadings[currentIndex - 1];
        prevReadingRecord.currReading = newPrevVal;
        prevReadingRecord.synced = false;
    } else {
        // Update tenant's initial reading
        tenant.initialReading = newPrevVal;
        tenant.synced = false;
    }

    // Update reading fields
    const reading = readings.find(r => r.id === readingId);
    if (reading) {
        reading.currReading = newCurrVal;
        reading.prevReading = newPrevVal;
        reading.date = newDate;
        reading.comments = newComments;
        reading.synced = false;
    }

    // Recalculate history to cascade values
    recalculateTenantHistory(tenantId);
    
    closeEditReadingModal();
    showToast('Reading updated and history recalculated successfully.', 'success');
    
    if (autoSyncEnabled && syncUrl) {
        syncWithCloud();
    }
}

function recalculateTenantHistory(tenantId) {
    const tenant = findTenantById(tenantId);
    if (!tenant) return;

    const normTenantId = tenantId ? tenantId.toString().trim().toLowerCase() : '';
    // Get all readings for this tenant, sorted chronologically
    const tenantReadings = readings
        .filter(r => r.tenantId && r.tenantId.toString().trim().toLowerCase() === normTenantId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let prevReading = tenant.initialReading;
    let prevDate = tenant.initialDate;

    tenantReadings.forEach(reading => {
        reading.prevReading = prevReading;
        reading.consumed = reading.currReading - prevReading;
        reading.cost = reading.consumed * (reading.rate !== undefined ? reading.rate : tenant.rate);
        
        prevReading = reading.currReading;
        prevDate = reading.date;
    });

    // Update tenant's current reference point
    tenant.currentReading = prevReading;
    tenant.currentDate = prevDate;
    tenant.synced = false;

    saveData();
    renderAll();
}

function handleModalSubmit(e) {
    e.preventDefault();
    
    if (modalMode === 'building' || modalMode === 'editBuilding') {
        const address1 = document.getElementById('buildingAddress1').value.trim();
        const address2 = document.getElementById('buildingAddress2').value.trim();
        const city = document.getElementById('buildingCity').value.trim();
        const state = document.getElementById('buildingState').value.trim();
        const zipCode = document.getElementById('buildingZip').value.trim();
        
        const buildingId = tenantBuildingInput.value; // selected building ID
        let oldFormattedAddress = '';
        let buildingObj;
        
        if (modalMode === 'editBuilding') {
            const existing = findBuildingById(buildingId);
            if (existing) {
                oldFormattedAddress = formatBuildingAddress(existing);
                buildingObj = existing;
                buildingObj.address1 = address1;
                buildingObj.address2 = address2;
                buildingObj.city = city;
                buildingObj.state = state;
                buildingObj.zipCode = zipCode;
            } else {
                buildingObj = {
                    id: 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    address1, address2, city, state, zipCode
                };
                customBuildings.push(buildingObj);
            }
        } else {
            buildingObj = {
                id: 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                address1, address2, city, state, zipCode
            };
            customBuildings.push(buildingObj);
        }
        
        const formattedAddress = formatBuildingAddress(buildingObj);
        
        if (modalMode === 'editBuilding' && oldFormattedAddress && oldFormattedAddress !== formattedAddress) {
            // Update tenants using this building ID
            tenants.forEach(t => {
                if (t.buildingId === buildingObj.id) {
                    t.building = formattedAddress;
                    t.synced = false;
                }
            });
        }
        
        saveData();
        populateTenantFormDropdowns();
        tenantBuildingInput.value = buildingObj.id;
        populateTenantFormDropdowns(); // Re-run to filter other dropdowns for this building
        
        // Trigger active tenants list filter update
        renderTenants();
        updateEditButtonsState();
        
        showToast(modalMode === 'editBuilding' ? 'Property address updated successfully.' : `Property "${formattedAddress}" added successfully.`, 'success');
    } else if (modalMode === 'tenantName' || modalMode === 'editTenantName') {
        const value = document.getElementById('modalTenantNameValue').value.trim();
        if (!value) return;
        
        const addressVal = document.getElementById('modalTenantAddress').value;
        const submeterVal = document.getElementById('modalTenantSubmeter').value.trim();
        const unitTypeVal = document.getElementById('modalTenantUnit').value;
        const rateVal = parseFloat(document.getElementById('modalTenantRate').value) || 0;
        const initialReadingVal = parseFloat(document.getElementById('modalTenantInitialReading').value) || 0;

        const tenantData = {
            name: value,
            address: addressVal,
            submeter: submeterVal,
            unitType: unitTypeVal,
            rate: rateVal,
            initialReading: initialReadingVal
        };

        const selectedVal = tenantNameInput.value;
        const oldName = modalMode === 'editTenantName' ? selectedVal : '';
        
        if (modalMode === 'editTenantName') {
            const idx = customTenantNames.findIndex(t => (typeof t === 'string' ? t : t.name) === oldName);
            if (idx !== -1) {
                customTenantNames[idx] = tenantData;
            } else {
                customTenantNames.push(tenantData);
            }
            // Update tenants using old name or new name
            tenants.forEach(t => {
                if (t.name === oldName || t.name === value) {
                    t.name = value;
                    t.address = addressVal;
                    t.submeter = submeterVal || generateSubmeterId(addressVal);
                    t.unitType = unitTypeVal;
                    t.rate = rateVal;
                    t.initialReading = initialReadingVal;
                    t.synced = false;
                }
            });
        } else {
            const idx = customTenantNames.findIndex(t => (typeof t === 'string' ? t : t.name) === value);
            if (idx !== -1) {
                customTenantNames[idx] = tenantData;
            } else {
                customTenantNames.push(tenantData);
            }
        }
        
        saveData();
        populateTenantFormDropdowns();
        tenantNameInput.value = value;
        
        // Auto-populate the main form immediately
        tenantAddressInput.value = addressVal;
        tenantSubmeterInput.value = submeterVal || generateSubmeterId(addressVal);
        tenantUnitSelect.value = unitTypeVal;
        tenantRateInput.value = rateVal;
        tenantInitialReadingInput.value = initialReadingVal;
        
        updateEditButtonsState();
        showToast(modalMode === 'editTenantName' ? 'Tenant profile updated successfully.' : `Tenant "${value}" added successfully.`, 'success');
    } else if (modalMode === 'address' || modalMode === 'editAddress') {
        const address1 = document.getElementById('unitAddress1').value.trim();
        const premises = document.getElementById('unitPremises').value.trim();
        const contact = document.getElementById('unitContact').value.trim();
        const email = document.getElementById('unitEmail').value.trim();
        const storeNumber = document.getElementById('unitStoreNumber').value.trim();
        
        const selectedVal = tenantAddressInput.value;
        const oldFormattedAddress = modalMode === 'editAddress' ? selectedVal : '';
        
        let addressObj;
        if (modalMode === 'editAddress') {
            const existing = customAddresses.find(a => formatUnitAddress(a) === selectedVal);
            if (existing) {
                addressObj = existing;
                addressObj.address1 = address1;
                addressObj.premises = premises;
                addressObj.contact = contact;
                addressObj.email = email;
                addressObj.storeNumber = storeNumber;
            } else {
                addressObj = {
                    id: 'address_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    address1, premises, contact, email, storeNumber
                };
                customAddresses.push(addressObj);
            }
        } else {
            addressObj = {
                id: 'address_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                address1, premises, contact, email, storeNumber
            };
            customAddresses.push(addressObj);
        }
        
        const formattedAddress = formatUnitAddress(addressObj);
        
        if (modalMode === 'editAddress' && oldFormattedAddress && oldFormattedAddress !== formattedAddress) {
            // Update tenants using old address
            tenants.forEach(t => {
                if (t.address === oldFormattedAddress) {
                    t.address = formattedAddress;
                    t.synced = false;
                }
            });
        }
        
        saveData();
        populateTenantFormDropdowns();
        tenantAddressInput.value = formattedAddress;
        if (!tenantSubmeterInput.value) {
            tenantSubmeterInput.value = generateSubmeterId(formattedAddress);
        }
        updateEditButtonsState();
    }
    
    closeModal();
}

// --- RENDERING MANAGER ---
function renderAll() {
    migrateBuildingsData();
    populateTenantFormDropdowns();
    renderTenants();
    populateReadingBuildingDropdown();
    populateReadingFilters();
    renderReadings();
    populateTakeoffFilters();
    renderTakeoff();
    updateSyncStatusUI();
}

// --- CLOUD SYNC ENGINE ---
function openSyncSettingsModal() {
    modalMode = 'syncSettings';
    syncUrlInput.value = syncUrl;
    syncTokenInput.value = syncToken;
    autoSyncCheckbox.checked = autoSyncEnabled;
    
    // Clear status
    syncModalStatus.style.display = 'none';
    syncModalStatus.textContent = '';
    syncModalStatus.className = '';
    
    syncSettingsModal.classList.add('active');
    syncSettingsModal.setAttribute('aria-hidden', 'false');
    
    lucide.createIcons();
}

function closeSyncSettingsModal() {
    syncSettingsModal.classList.remove('active');
    syncSettingsModal.setAttribute('aria-hidden', 'true');
    modalMode = '';
}

function handleSyncSettingsSave(e) {
    e.preventDefault();
    
    syncUrl = syncUrlInput.value.trim();
    syncToken = syncTokenInput.value.trim();
    autoSyncEnabled = autoSyncCheckbox.checked;
    
    localStorage.setItem('aquameter_sync_url', syncUrl);
    localStorage.setItem('aquameter_sync_token', syncToken);
    localStorage.setItem('aquameter_auto_sync', autoSyncEnabled ? 'true' : 'false');
    
    closeSyncSettingsModal();
    updateSyncStatusUI();
    showToast('Sync settings saved.', 'success');
}

function updateSyncStatusUI() {
    if (!syncStatusBadge) return;
    
    // Check if there are unsynced items or deleted items
    const hasUnsyncedTenants = tenants.some(t => t.synced === false);
    const hasUnsyncedReadings = readings.some(r => r.synced === false);
    
    let deletedIds = [];
    try {
        const stored = localStorage.getItem('aquameter_deleted_ids');
        deletedIds = stored ? JSON.parse(stored) : [];
    } catch (e) {}

    const hasPendingSync = hasUnsyncedTenants || hasUnsyncedReadings || deletedIds.length > 0;

    syncStatusBadge.className = 'sync-status';
    
    if (isSyncingInProgress) {
        syncStatusBadge.classList.add('syncing');
        syncStatusBadge.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i> Syncing...';
        syncStatusBadge.title = 'Synchronizing database with Google Sheets';
    } else if (!syncUrl) {
        syncStatusBadge.classList.add('local-only');
        syncStatusBadge.innerHTML = '<i data-lucide="cloud-off"></i> Local Mode';
        syncStatusBadge.title = 'No cloud sync configured. Data is saved locally in this browser.';
    } else if (hasPendingSync) {
        syncStatusBadge.classList.add('sync-pending');
        syncStatusBadge.innerHTML = '<i data-lucide="alert-circle"></i> Sync Pending';
        syncStatusBadge.title = 'You have unsynced changes. Click Cloud Sync to synchronize.';
    } else {
        syncStatusBadge.classList.add('synced');
        syncStatusBadge.innerHTML = '<i data-lucide="cloud"></i> Synced';
        syncStatusBadge.title = 'Data is synchronized with Google Sheets!';
    }
    
    lucide.createIcons();
}

async function syncWithCloud(isManual = false) {
    if (!syncUrl) {
        if (isManual) {
            showToast('Please configure a Sync Web App URL first.', 'error');
            openSyncSettingsModal();
        }
        return;
    }

    if (isSyncingInProgress) return;
    
    isSyncingInProgress = true;
    updateSyncStatusUI();
    
    if (isManual && syncModalStatus) {
        syncModalStatus.style.display = 'block';
        syncModalStatus.className = 'sync-status syncing';
        syncModalStatus.style.background = 'rgba(59, 130, 246, 0.1)';
        syncModalStatus.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        syncModalStatus.style.color = '#3b82f6';
        syncModalStatus.textContent = 'Connecting to Google Sheets and sending changes...';
        lucide.createIcons();
    }

    try {
        // Retrieve unsynced records
        const unsyncedTenants = tenants.filter(t => t.synced === false);
        const unsyncedReadings = readings.filter(r => r.synced === false);
        
        let deletedIds = [];
        try {
            const stored = localStorage.getItem('aquameter_deleted_ids');
            deletedIds = stored ? JSON.parse(stored) : [];
        } catch (e) {}

        const response = await fetch(syncUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify({
                token: syncToken,
                tenants: unsyncedTenants,
                readings: unsyncedReadings,
                deletedIds: deletedIds
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown sync error');
        }

        // Merge tenants
        if (data.tenants) {
            const remoteTenants = data.tenants.map(t => ({ ...t, synced: true }));
            
            const localUnsyncedMap = new Map();
            tenants.forEach(t => {
                if (t.synced === false) localUnsyncedMap.set(t.id, t);
            });

            const mergedTenants = [];
            remoteTenants.forEach(t => {
                const remoteId = t.id || t.ID || t.Id;
                if (remoteId && localUnsyncedMap.has(remoteId)) {
                    const localObj = localUnsyncedMap.get(remoteId);
                    localObj.synced = true;
                    mergedTenants.push(localObj);
                    localUnsyncedMap.delete(remoteId);
                } else {
                    mergedTenants.push(t);
                }
            });
            localUnsyncedMap.forEach(t => mergedTenants.push(t));
            tenants = mergedTenants;
        }

        // Merge readings
        if (data.readings) {
            const remoteReadings = data.readings.map(r => ({ ...r, synced: true }));
            
            const localUnsyncedMap = new Map();
            readings.forEach(r => {
                if (r.synced === false) localUnsyncedMap.set(r.id, r);
            });

            const mergedReadings = [];
            remoteReadings.forEach(r => {
                const remoteId = r.id || r.ID || r.Id;
                if (remoteId && localUnsyncedMap.has(remoteId)) {
                    const localObj = localUnsyncedMap.get(remoteId);
                    localObj.synced = true;
                    mergedReadings.push(localObj);
                    localUnsyncedMap.delete(remoteId);
                } else {
                    mergedReadings.push(r);
                }
            });
            localUnsyncedMap.forEach(r => mergedReadings.push(r));
            readings = mergedReadings;
        }

        // Clear deleted IDs queue
        localStorage.setItem('aquameter_deleted_ids', JSON.stringify([]));

        // Save merged state
        saveData();
        
        // Re-populate dropdowns and re-render
        renderAll();

        if (isManual && syncModalStatus) {
            syncModalStatus.className = 'sync-status synced';
            syncModalStatus.style.background = 'rgba(34, 197, 94, 0.1)';
            syncModalStatus.style.border = '1px solid rgba(34, 197, 94, 0.2)';
            syncModalStatus.style.color = '#22c55e';
            syncModalStatus.textContent = 'Sync completed successfully!';
            lucide.createIcons();
        }

        showToast('Sync with Google Sheets successful!', 'success');
    } catch (error) {
        console.error('Sync failed:', error);
        
        if (isManual && syncModalStatus) {
            syncModalStatus.className = 'sync-status error';
            syncModalStatus.style.background = 'rgba(239, 68, 68, 0.1)';
            syncModalStatus.style.border = '1px solid rgba(239, 68, 68, 0.2)';
            syncModalStatus.style.color = '#ef4444';
            syncModalStatus.textContent = `Sync failed: ${error.message}`;
            lucide.createIcons();
        }
        
        showToast(`Sync failed: ${error.message || 'Offline'}`, 'error');
    } finally {
        isSyncingInProgress = false;
        updateSyncStatusUI();
    }
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

// --- ID LOOKUP HELPERS ---
function findTenantById(tenantId) {
    if (!tenantId) return null;
    const norm = tenantId.toString().trim().toLowerCase();
    return tenants.find(t => t.id && t.id.toString().trim().toLowerCase() === norm) || null;
}

function findBuildingById(buildingId) {
    if (!buildingId) return null;
    const norm = buildingId.toString().trim().toLowerCase();
    return customBuildings.find(b => b.id && b.id.toString().trim().toLowerCase() === norm) || null;
}
