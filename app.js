/**
 * Mahinda College Science Section Result System
 * Premium Dashboard Application
 */

// Firebase Configuration - Replace with your config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase (commented out until config is provided)
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// Mock Data for Demonstration
const mockStudents = [
    { id: '1', name: 'Kasun Perera', adNo: 'M2024001', class: 'M1', section: 'Maths', maths: 95, physics: 88, chemistry: 92, english: 85, year: 2024 },
    { id: '2', name: 'Nimal Silva', adNo: 'M2024002', class: 'M1', section: 'Maths', maths: 88, physics: 92, chemistry: 85, english: 78, year: 2024 },
    { id: '3', name: 'Sunil Fernando', adNo: 'M2024003', class: 'M2', section: 'Maths', maths: 92, physics: 85, chemistry: 88, english: 82, year: 2024 },
    { id: '4', name: 'Amara Jayasinghe', adNo: 'B2024001', class: 'B1', section: 'Bio', maths: 85, physics: 90, chemistry: 95, english: 88, year: 2024 },
    { id: '5', name: 'Dilani Wickrama', adNo: 'B2024002', class: 'B1', section: 'Bio', maths: 90, physics: 88, chemistry: 92, english: 85, year: 2024 },
    { id: '6', name: 'Ruwan Kumara', adNo: 'M2024004', class: 'M3', section: 'Maths', maths: 78, physics: 82, chemistry: 80, english: 75, year: 2024 },
    { id: '7', name: 'Chamari Athapattu', adNo: 'B2024003', class: 'B2', section: 'Bio', maths: 92, physics: 94, chemistry: 96, english: 90, year: 2024 },
    { id: '8', name: 'Lakmal Bandara', adNo: 'M2024005', class: 'M4', section: 'Maths', maths: 85, physics: 78, chemistry: 82, english: 80, year: 2024 },
];

// State Management
let students = [];
let currentPage = 'dashboard';
let scoreChartInstance = null;
let sectionChartInstance = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupKeyboardShortcuts();
    calculateAllStats();
    renderDashboard();
    renderStudents();
    renderLeaderboard();
});

function initializeApp() {
    // Load data (Firebase or Mock)
    students = [...mockStudents];
    
    // Animate entrance
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// Calculation Functions
function calculateStudentStats(student) {
    const mainSubject = student.section === 'Maths' ? student.maths : student.biology || student.maths;
    const total = mainSubject + student.physics + student.chemistry; // Excluding English
    const average = total / 3;
    
    return {
        ...student,
        total,
        average: Math.round(average * 100) / 100,
        bestMark: Math.max(mainSubject, student.physics, student.chemistry)
    };
}

function calculateZScore(studentAvg, allAverages) {
    const mean = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;
    const variance = allAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allAverages.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    return ((studentAvg - mean) / stdDev).toFixed(2);
}

function calculateAllStats() {
    const allAverages = students.map(s => {
        const stats = calculateStudentStats(s);
        return stats.average;
    });
    
    students = students.map((student, index) => {
        const stats = calculateStudentStats(student);
        const zScore = calculateZScore(stats.average, allAverages);
        
        return {
            ...stats,
            zScore: parseFloat(zScore),
            rank: index + 1 // Temporary rank
        };
    }).sort((a, b) => b.average - a.average).map((s, i) => ({ ...s, rank: i + 1 }));
}

// Navigation
function navigateTo(page) {
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(page).classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        students: 'Student Lookup',
        leaderboard: 'Leaderboard',
        analysis: 'Analysis'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    currentPage = page;
    
    // Refresh charts if dashboard
    if (page === 'dashboard') {
        setTimeout(initCharts, 100);
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Dashboard Rendering
function renderDashboard() {
    // Update stats
    animateValue('statTotalStudents', 0, students.length, 1000);
    animateValue('statTotalEntries', 0, students.length * 3, 1000); // Mock calculation
    animateValue('statAvgScore', 0, Math.round(students.reduce((a, s) => a + s.average, 0) / students.length), 1000);
    
    // Render top performers
    const top3 = students.slice(0, 3);
    const podiumClasses = ['podium-2', 'podium-1', 'podium-3']; // 2nd, 1st, 3rd order
    const medals = ['🥈', '🥇', '🥉'];
    
    const topPerformersHTML = top3.map((student, index) => `
        <div class="podium-card rounded-2xl p-6 text-center ${podiumClasses[index]} transform transition hover:scale-105">
            <div class="text-4xl mb-2">${medals[index]}</div>
            <div class="w-16 h-16 mx-auto mb-3 rounded-full avatar-circle flex items-center justify-center text-black font-bold text-xl">
                ${student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h4 class="font-semibold text-lg mb-1">${student.name}</h4>
            <p class="text-gray-400 text-sm mb-3">${student.class} • ${student.section}</p>
            <div class="flex justify-center gap-4 text-sm">
                <div>
                    <span class="block text-2xl font-bold gold-text">${student.average}%</span>
                    <span class="text-gray-500">Average</span>
                </div>
                <div>
                    <span class="block text-2xl font-bold text-blue-400">${student.zScore}</span>
                    <span class="text-gray-500">Z-Score</span>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('topPerformers').innerHTML = topPerformersHTML;
    
    // Initialize charts
    setTimeout(initCharts, 300);
}

function initCharts() {
    // Score Distribution Chart
    const scoreCtx = document.getElementById('scoreChart');
    if (!scoreCtx) return;
    
    if (scoreChartInstance) {
        scoreChartInstance.destroy();
    }
    
    const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        'Below 60': 0
    };
    
    students.forEach(s => {
        if (s.average >= 90) scoreRanges['90-100']++;
        else if (s.average >= 80) scoreRanges['80-89']++;
        else if (s.average >= 70) scoreRanges['70-79']++;
        else if (s.average >= 60) scoreRanges['60-69']++;
        else scoreRanges['Below 60']++;
    });
    
    const gradient = scoreCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#D4AF37');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.2)');
    
    scoreChartInstance = new Chart(scoreCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(scoreRanges),
            datasets: [{
                label: 'Students',
                data: Object.values(scoreRanges),
                backgroundColor: gradient,
                borderColor: '#D4AF37',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    });
    
    // Section Comparison Chart
    const sectionCtx = document.getElementById('sectionChart');
    if (!sectionCtx) return;
    
    if (sectionChartInstance) {
        sectionChartInstance.destroy();
    }
    
    const mathsAvg = students.filter(s => s.section === 'Maths').reduce((a, s) => a + s.average, 0) / students.filter(s => s.section === 'Maths').length || 0;
    const bioAvg = students.filter(s => s.section === 'Bio').reduce((a, s) => a + s.average, 0) / students.filter(s => s.section === 'Bio').length || 0;
    
    sectionChartInstance = new Chart(sectionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Mathematics', 'Biology'],
            datasets: [{
                data: [mathsAvg.toFixed(1), bioAvg.toFixed(1)],
                backgroundColor: [
                    'rgba(212, 175, 55, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', padding: 20 }
                }
            }
        }
    });
}

// Students Page Rendering
function renderStudents() {
    const grid = document.getElementById('studentGrid');
    const loading = document.getElementById('loadingStudents');
    
    if (loading) loading.style.display = 'none';
    
    const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';
    const sectionFilter = document.getElementById('filterSection')?.value || '';
    const classFilter = document.getElementById('filterClass')?.value || '';
    
    let filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm) || 
                             s.adNo.toLowerCase().includes(searchTerm);
        const matchesSection = !sectionFilter || s.section === sectionFilter;
        const matchesClass = !classFilter || s.class === classFilter;
        return matchesSearch && matchesSection && matchesClass;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>No students found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(student => `
        <div class="student-card glass-card rounded-2xl p-6 cursor-pointer">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full avatar-circle flex items-center justify-center text-black font-bold">
                        ${student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h4 class="font-semibold text-white">${student.name}</h4>
                        <p class="text-xs text-gray-400">${student.adNo}</p>
                    </div>
                </div>
                <div class="rank-badge rounded-full px-3 py-1 text-xs font-bold text-yellow-500">
                    #${student.rank}
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-white/5 rounded-lg p-2 text-center">
                    <span class="block text-lg font-bold text-white">${student.average}%</span>
                    <span class="text-xs text-gray-500">Average</span>
                </div>
                <div class="bg-white/5 rounded-lg p-2 text-center">
                    <span class="block text-lg font-bold text-blue-400">${student.zScore}</span>
                    <span class="text-xs text-gray-500">Z-Score</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                <span class="text-gray-400">${student.class} • ${student.section}</span>
                <span class="text-green-400 font-medium">Best: ${student.bestMark}</span>
            </div>
        </div>
    `).join('');
}

function clearFilters() {
    document.getElementById('studentSearch').value = '';
    document.getElementById('filterSection').value = '';
    document.getElementById('filterClass').value = '';
    renderStudents();
}

// Leaderboard Rendering
function renderLeaderboard() {
    const container = document.getElementById('leaderboardList');
    
    container.innerHTML = students.map((student, index) => `
        <div class="flex items-center gap-4 p-4 rounded-xl ${index < 3 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5 border border-white/5'} hover:bg-white/10 transition">
            <div class="flex-shrink-0 w-10 h-10 rounded-full ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'} flex items-center justify-center font-bold">
                ${index + 1}
            </div>
            <div class="flex-shrink-0 w-12 h-12 rounded-full avatar-circle flex items-center justify-center text-black font-bold text-sm">
                ${student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="flex-1">
                <h4 class="font-semibold ${index < 3 ? 'text-yellow-400' : 'text-white'}">${student.name}</h4>
                <p class="text-sm text-gray-400">${student.class} • ${student.adNo}</p>
            </div>
            <div class="text-right">
                <span class="block text-xl font-bold ${index < 3 ? 'text-yellow-400' : 'text-white'}">${student.average}%</span>
                <span class="text-xs text-gray-500">Z-Score: ${student.zScore}</span>
            </div>
        </div>
    `).join('');
}

// Admin Panel
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    document.getElementById('sName').focus();
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    document.getElementById('studentForm').reset();
}

function saveStudent(e) {
    e.preventDefault();
    
    const newStudent = {
        id: Date.now().toString(),
        name: document.getElementById('sName').value,
        adNo: document.getElementById('sAdNo').value,
        class: document.getElementById('sClass').value,
        section: document.getElementById('sSection').value,
        year: parseInt(document.getElementById('sYear').value),
        maths: parseInt(document.getElementById('sMain').value) || 0,
        physics: parseInt(document.getElementById('sPhysics').value) || 0,
        chemistry: parseInt(document.getElementById('sChemistry').value) || 0,
        english: parseInt(document.getElementById('sEnglish').value) || 0
    };
    
    // Add to Firebase (commented out until Firebase is configured)
    // db.collection('students').add(newStudent);
    
    // Add to local array
    students.push(newStudent);
    calculateAllStats();
    
    // Refresh displays
    renderDashboard();
    renderStudents();
    renderLeaderboard();
    
    showToast('Student added successfully!');
    closeAdminModal();
}

// Utility Functions
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Event Listeners
function setupEventListeners() {
    // Search inputs
    document.getElementById('studentSearch')?.addEventListener('input', renderStudents);
    document.getElementById('filterSection')?.addEventListener('change', renderStudents);
    document.getElementById('filterClass')?.addEventListener('change', renderStudents);
    document.getElementById('globalSearch')?.addEventListener('input', (e) => {
        if (currentPage !== 'students') navigateTo('students');
        document.getElementById('studentSearch').value = e.target.value;
        renderStudents();
    });
    
    // Form submission
    document.getElementById('studentForm')?.addEventListener('submit', saveStudent);
    
    // Close modal on outside click
    document.getElementById('adminModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAdminModal();
    });
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+A for Admin
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            openAdminModal();
        }
        
        // Ctrl+S to save in modal
        if (e.ctrlKey && e.key === 's' && !document.getElementById('adminModal').classList.contains('hidden')) {
            e.preventDefault();
            document.getElementById('studentForm').dispatchEvent(new Event('submit'));
        }
        
        // / to focus search
        if (e.key === '/' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            const searchInput = currentPage === 'students' 
                ? document.getElementById('studentSearch')
                : document.getElementById('globalSearch');
            searchInput?.focus();
        }
        
        // Enter to next field in form
        if (e.key === 'Enter' && !document.getElementById('adminModal').classList.contains('hidden')) {
            const form = document.getElementById('studentForm');
            const inputs = Array.from(form.querySelectorAll('input, select'));
            const currentIndex = inputs.indexOf(document.activeElement);
            if (currentIndex < inputs.length - 1) {
                e.preventDefault();
                inputs[currentIndex + 1].focus();
            }
        }
        
        // ESC to close modal
        if (e.key === 'Escape') {
            closeAdminModal();
        }
    });
}

// Firebase Integration (Ready to use when configured)
async function loadFromFirebase() {
    try {
        const snapshot = await db.collection('students').get();
        students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        calculateAllStats();
        renderDashboard();
        renderStudents();
        renderLeaderboard();
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        showToast('Error loading data. Using offline mode.');
    }
}

async function saveToFirebase(student) {
    try {
        await db.collection('students').add(student);
        showToast('Saved to cloud successfully!');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        showToast('Error saving to cloud.');
    }
}
