// Global variables
let currentUser = null;
let transactions = [];
let deleteTargetId = null;
let members = [];
let deleteMemberTargetId = null;

// Check authentication
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Initialize dashboard
function initDashboard() {
    currentUser = checkAuth();
    if (!currentUser) return;

    // Update user info
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');

    if (userNameEl) userNameEl.textContent = currentUser.username;
    if (userRoleEl) {
        userRoleEl.textContent = currentUser.role;
        userRoleEl.className = 'badge ' + (currentUser.role === 'admin' ? 'badge-info' : 'badge-warning');
    }

    // Load data
    loadData();

    // Set up event listeners
    const searchInput = document.getElementById('dashboard-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = transactions.filter(t =>
                t.description.toLowerCase().includes(searchTerm) ||
                t.category.toLowerCase().includes(searchTerm) ||
                t.createdBy.toLowerCase().includes(searchTerm)
            );
            loadTransactionTable(filtered);
        });
    }

    // Close modal on outside click
    const modal = document.getElementById('transaction-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    showToast('success', 'Berhasil logout');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Toast notification
function showToast(type, message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        ${message}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Animate counter
function animateValue(element, start, end, duration, isCurrency) {
    const startTime = Date.now();

    const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = start + (end - start) * progress;

        if (isCurrency) {
            element.textContent = formatCurrency(currentValue);
        } else {
            element.textContent = Math.floor(currentValue);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    animate();
}

// Load data
function loadData() {
    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    transactions = data.transactions || [];
    members = data.members || [];
    updateDashboard();
    updateMemberStats();
    loadMemberTable(members);
}

// Update dashboard
function updateDashboard() {
    // Calculate statistics
    const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentBalance = transactions.length > 0 ?
        transactions[transactions.length - 1].balance : 0;

    // Update stats with animation
    const totalIncomeEl = document.getElementById('dashboard-total-income');
    const totalExpenseEl = document.getElementById('dashboard-total-expense');
    const currentBalanceEl = document.getElementById('dashboard-current-balance');

    if (totalIncomeEl) {
        animateValue(totalIncomeEl, 0, totalIncome, 1000, true);
    }
    if (totalExpenseEl) {
        animateValue(totalExpenseEl, 0, totalExpense, 1000, true);
    }
    if (currentBalanceEl) {
        animateValue(currentBalanceEl, 0, currentBalance, 1000, true);
    }

    // Load table
    loadTransactionTable(transactions);
}

// Load transaction table
function loadTransactionTable(data) {
    const tbody = document.getElementById('dashboard-transaction-body');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Belum ada data transaksi</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'}">
                ${formatCurrency(Math.abs(transaction.amount))}
            </td>
            <td>${formatCurrency(transaction.balance)}</td>
            <td>${transaction.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open modal
function openModal(mode, transactionId = null) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('transaction-form');

    if (mode === 'add') {
        title.textContent = 'Tambah Transaksi';
        form.reset();
        document.getElementById('transaction-id').value = '';
        document.getElementById('modal-date').value = new Date().toISOString().split('T')[0];
    } else {
        title.textContent = 'Edit Transaksi';
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
            document.getElementById('transaction-id').value = transaction.id;
            document.getElementById('modal-date').value = transaction.date;
            document.getElementById('modal-category').value = transaction.category;
            document.getElementById('modal-description').value = transaction.description;
            document.getElementById('modal-amount').value = Math.abs(transaction.amount);
            document.getElementById('modal-type').value = transaction.amount > 0 ? 'income' : 'expense';
        }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('transaction-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Save transaction
function saveTransaction() {
    const id = document.getElementById('transaction-id').value;
    const date = document.getElementById('modal-date').value;
    const category = document.getElementById('modal-category').value;
    const description = document.getElementById('modal-description').value;
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const type = document.getElementById('modal-type').value;

    if (!date || !category || !description || !amount) {
        showToast('error', 'Semua field harus diisi!');
        return;
    }

    const finalAmount = type === 'income' ? amount : -amount;

    const transaction = {
        id: id ? parseInt(id) : Date.now(),
        date,
        description,
        category,
        amount: finalAmount,
        type,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
    };

    // Load current data
    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    if (!data.transactions) data.transactions = [];

    if (id) {
        // Update existing
        const index = data.transactions.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            data.transactions[index] = {
                ...transaction,
                balance: calculateBalanceUpTo(data.transactions, parseInt(id))
            };
        }
        showToast('success', 'Transaksi berhasil diperbarui!');
    } else {
        // Add new
        data.transactions.push(transaction);
        showToast('success', 'Transaksi berhasil ditambahkan!');
    }

    // Recalculate all balances
    data.transactions = recalculateAllBalances(data.transactions);

    // Save to localStorage
    localStorage.setItem('kas_bem_data', JSON.stringify(data));

    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'kas_bem_data',
        newValue: JSON.stringify(data),
        url: window.location.href,
        storageArea: localStorage
    }));

    // Redirect to landing page after save
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Recalculate all transaction balances
function recalculateAllBalances(transactions) {
    // Sort by date
    const sorted = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;

    return sorted.map(transaction => {
        runningBalance += transaction.amount;
        return {
            ...transaction,
            balance: runningBalance
        };
    });
}

// Edit transaction
function editTransaction(id) {
    openModal('edit', id);
}

// Calculate running balance up to a specific transaction
function calculateBalanceUpTo(allTransactions, transactionId) {
    const sortedTransactions = allTransactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .filter(t => {
            const tDate = new Date(t.date);
            const targetDate = new Date(allTransactions.find(tr => tr.id === transactionId)?.date);
            return tDate <= targetDate;
        });

    return sortedTransactions.reduce((balance, t) => balance + t.amount, 0);
}

// Delete modal
function openDeleteModal(id) {
    deleteTargetId = id;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    deleteTargetId = null;
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function confirmDelete() {
    if (!deleteTargetId) return;

    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    if (data.transactions) {
        data.transactions = data.transactions.filter(t => t.id !== deleteTargetId);

        // Recalculate all balances
        data.transactions = recalculateAllBalances(data.transactions);

        localStorage.setItem('kas_bem_data', JSON.stringify(data));

        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'kas_bem_data',
            newValue: JSON.stringify(data),
            url: window.location.href,
            storageArea: localStorage
        }));

        showToast('success', 'Transaksi berhasil dihapus');
        loadData();
    }

    closeDeleteModal();
}

// Refresh data
function refreshData() {
    showToast('info', 'Memuat ulang data...');
    loadData();
    setTimeout(() => {
        showToast('success', 'Data berhasil dimuat ulang!');
    }, 500);
}

// Export to Excel
function exportToExcel() {
    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    const transactions = data.transactions || [];

    if (transactions.length === 0) {
        showToast('info', 'Tidak ada data untuk diekspor');
        return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Deskripsi,Kategori,Jenis,Jumlah,Saldo,Dibuat Oleh\n";

    // Sort by date
    const sorted = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(transaction => {
        const typeLabel = transaction.amount > 0 ? 'Pemasukan' : 'Pengeluaran';
        csvContent += `"${formatDate(transaction.date)}","${transaction.description}","${transaction.category}","${typeLabel}","${formatCurrency(Math.abs(transaction.amount))}","${formatCurrency(transaction.balance || 0)}","${transaction.createdBy}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_keuangan_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Data berhasil diekspor ke CSV');
}

// Member CRUD Functions

// Update member statistics
function updateMemberStats() {
    const totalMembers = members.length;
    const paidMembers = members.filter(m => m.status === 'paid').length;
    const unpaidMembers = members.filter(m => m.status === 'unpaid').length;
    const totalCollected = members.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);

    const totalMembersEl = document.getElementById('total-members');
    const paidMembersEl = document.getElementById('paid-members');
    const unpaidMembersEl = document.getElementById('unpaid-members');
    const totalCollectedEl = document.getElementById('total-collected');

    if (totalMembersEl) {
        animateValue(totalMembersEl, 0, totalMembers, 1000, false);
    }
    if (paidMembersEl) {
        animateValue(paidMembersEl, 0, paidMembers, 1000, false);
    }
    if (unpaidMembersEl) {
        animateValue(unpaidMembersEl, 0, unpaidMembers, 1000, false);
    }
    if (totalCollectedEl) {
        animateValue(totalCollectedEl, 0, totalCollected, 1000, true);
    }
}

// Load member table
function loadMemberTable(data) {
    const tbody = document.getElementById('member-table-body');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Belum ada data anggota</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(member => `
        <tr>
            <td>${member.nim}</td>
            <td>${member.name}</td>
            <td>${member.prodi}</td>
            <td>${formatCurrency(member.amount)}</td>
            <td><span class="badge ${member.status === 'paid' ? 'badge-success' : 'badge-warning'}">${member.status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}</span></td>
            <td>${member.paymentDate ? formatDate(member.paymentDate) : '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editMember(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteMemberModal(${member.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open member modal
function openMemberModal(mode, memberId = null) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');

    if (mode === 'add') {
        title.textContent = 'Tambah Anggota';
        form.reset();
        document.getElementById('member-id').value = '';
        document.getElementById('member-payment-date').value = '';
    } else {
        title.textContent = 'Edit Anggota';
        const member = members.find(m => m.id === memberId);
        if (member) {
            document.getElementById('member-id').value = member.id;
            document.getElementById('member-nim').value = member.nim;
            document.getElementById('member-name').value = member.name;
            document.getElementById('member-prodi').value = member.prodi;
            document.getElementById('member-amount').value = member.amount;
            document.getElementById('member-status').value = member.status;
            document.getElementById('member-payment-date').value = member.paymentDate || '';
        }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close member modal
function closeMemberModal() {
    const modal = document.getElementById('member-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Save member
function saveMember() {
    const id = document.getElementById('member-id').value;
    const nim = document.getElementById('member-nim').value;
    const name = document.getElementById('member-name').value;
    const prodi = document.getElementById('member-prodi').value;
    const amount = parseFloat(document.getElementById('member-amount').value);
    const status = document.getElementById('member-status').value;
    const paymentDate = document.getElementById('member-payment-date').value;

    if (!nim || !name || !prodi || !amount) {
        showToast('error', 'Semua field harus diisi!');
        return;
    }

    const member = {
        id: id ? parseInt(id) : Date.now(),
        nim,
        name,
        prodi,
        amount,
        status,
        paymentDate: status === 'paid' ? paymentDate : '',
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
    };

    // Load current data
    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    if (!data.members) data.members = [];

    if (id) {
        // Update existing
        const index = data.members.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            data.members[index] = member;
        }
        showToast('success', 'Data anggota berhasil diperbarui!');
    } else {
        // Add new
        data.members.push(member);
        showToast('success', 'Data anggota berhasil ditambahkan!');
    }

    // Save to localStorage
    localStorage.setItem('kas_bem_data', JSON.stringify(data));

    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'kas_bem_data',
        newValue: JSON.stringify(data),
        url: window.location.href,
        storageArea: localStorage
    }));

    // Update UI
    members = data.members;
    updateMemberStats();
    loadMemberTable(members);
    closeMemberModal();
}

// Edit member
function editMember(id) {
    openMemberModal('edit', id);
}

// Delete member modal
function openDeleteMemberModal(id) {
    deleteMemberTargetId = id;
    const modal = document.getElementById('delete-member-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDeleteMemberModal() {
    deleteMemberTargetId = null;
    const modal = document.getElementById('delete-member-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function confirmDeleteMember() {
    if (!deleteMemberTargetId) return;

    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    if (data.members) {
        data.members = data.members.filter(m => m.id !== deleteMemberTargetId);

        localStorage.setItem('kas_bem_data', JSON.stringify(data));

        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'kas_bem_data',
            newValue: JSON.stringify(data),
            url: window.location.href,
            storageArea: localStorage
        }));

        showToast('success', 'Data anggota berhasil dihapus');
        members = data.members;
        updateMemberStats();
        loadMemberTable(members);
    }

    closeDeleteMemberModal();
}

// Filter members
function filterMembers() {
    const filter = document.getElementById('payment-filter').value;
    let filtered = members;

    if (filter !== 'all') {
        filtered = members.filter(m => m.status === filter);
    }

    loadMemberTable(filtered);
}

// Filter members by month
function filterMembersByMonth() {
    const filter = document.getElementById('member-month-filter').value;
    let filtered = members;

    if (filter) {
        filtered = members.filter(m => {
            if (!m.paymentDate) return false;
            const date = new Date(m.paymentDate);
            return date.getMonth() === parseInt(filter) - 1;
        });
    }

    loadMemberTable(filtered);
}

// Export members to Excel
function exportMembersToExcel() {
    const data = JSON.parse(localStorage.getItem('kas_bem_data') || '{}');
    const membersData = data.members || [];

    if (membersData.length === 0) {
        showToast('info', 'Tidak ada data anggota untuk diekspor');
        return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "NIM,Nama,Program Studi,Jumlah Kas,Status,Tanggal Bayar,Dibuat Oleh\n";

    membersData.forEach(member => {
        csvContent += `"${member.nim}","${member.name}","${member.prodi}","${formatCurrency(member.amount)}","${member.status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}","${member.paymentDate ? formatDate(member.paymentDate) : '-'}","${member.createdBy}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_anggota_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Data anggota berhasil diekspor ke CSV');
}

// Listen for storage changes from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'kas_bem_data') {
        loadData();
        showToast('info', 'Data diperbarui dari tab lain');
    }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);

// Set up form event listeners
document.getElementById('member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveMember();
});

// Set up search functionality
document.getElementById('member-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm)
    );
    loadMemberTable(filtered);
});

// Set up transaction form event listener
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveTransaction();
});     

// Set up transaction search functionality
document.getElementById('dashboard-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||                                                                                 
        t.category.toLowerCase().includes(searchTerm) ||
        t.createdBy.toLowerCase().includes(searchTerm)
    );
    loadTransactionTable(filtered);
}); 

// Set up transaction form event listener
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveTransaction();
});    

// Set up transaction search functionality
document.getElementById('dashboard-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||                                                                                 
        t.category.toLowerCase().includes(searchTerm) ||
        t.createdBy.toLowerCase().includes(searchTerm)
    );
    loadTransactionTable(filtered);
});

// Set up transaction form event listener
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveTransaction();
}); 
// Set up transaction search functionality
document.getElementById('dashboard-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||                                                                                 
        t.category.toLowerCase().includes(searchTerm) ||
        t.createdBy.toLowerCase().includes(searchTerm)
    );
    loadTransactionTable(filtered);
}); 
// Set up transaction form event listener
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveTransaction();
});