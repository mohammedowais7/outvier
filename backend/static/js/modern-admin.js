// Modern Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeSidebar();
    initializeCharts();
    initializeTables();
    initializeModals();
    initializeAnimations();
    initializeRealTimeUpdates();
});

// Sidebar Navigation
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar .nav-link, .sidebar .nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Add animation
            this.style.transform = 'translateX(5px)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Initialize Charts (using Chart.js if available)
function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            new Chart(userGrowthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'New Users',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        // Activity Distribution Chart
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Projects', 'Events', 'Connections', 'Forum Posts'],
                    datasets: [{
                        data: [30, 25, 20, 25],
                        backgroundColor: [
                            '#667eea',
                            '#764ba2',
                            '#f093fb',
                            '#f5576c'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
}

// Table Enhancements
function initializeTables() {
    const tables = document.querySelectorAll('.table-modern');
    
    tables.forEach(table => {
        // Add hover effects
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.01)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Bulk selection
        const headerCheckbox = table.querySelector('thead input[type="checkbox"]');
        const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
        
        if (headerCheckbox) {
            headerCheckbox.addEventListener('change', function() {
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
        }
    });
}

// Modal Enhancements
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function() {
            this.style.animation = 'fadeIn 0.3s ease-in';
        });
        
        modal.addEventListener('hide.bs.modal', function() {
            this.style.animation = 'fadeOut 0.3s ease-out';
        });
    });
}

// Animation System
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.stats-card, .chart-container, .table-modern');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Real-time Updates
function initializeRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Update activity feed every 60 seconds
    setInterval(updateActivityFeed, 60000);
}

function updateStats() {
    const statsNumbers = document.querySelectorAll('.stats-number');
    
    statsNumbers.forEach(number => {
        const currentValue = parseInt(number.textContent.replace(/,/g, ''));
        const change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and +2
        const newValue = Math.max(0, currentValue + change);
        
        // Animate the number change
        animateNumber(number, currentValue, newValue);
    });
}

function animateNumber(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function updateActivityFeed() {
    const activityFeed = document.querySelector('.activity-feed');
    if (!activityFeed) return;
    
    // Simulate new activity
    const activities = [
        { icon: 'fas fa-user-plus', text: 'New user registered', time: 'just now' },
        { icon: 'fas fa-project-diagram', text: 'Project created', time: 'just now' },
        { icon: 'fas fa-calendar-check', text: 'Event completed', time: 'just now' },
        { icon: 'fas fa-comments', text: 'New forum post', time: 'just now' }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    // Create new activity item
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item slide-in-left';
    activityItem.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <i class="${randomActivity.icon} text-primary"></i>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${randomActivity.text}</h6>
                <p class="text-muted mb-1">System activity detected</p>
            </div>
            <small class="text-muted">${randomActivity.time}</small>
        </div>
    `;
    
    // Add to top of feed
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    // Remove old items if too many
    const items = activityFeed.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Search Functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-box');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const targetTable = this.closest('.container-fluid').querySelector('.table-modern');
            
            if (targetTable) {
                const rows = targetTable.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                        row.classList.add('fade-in');
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    });
}

// Filter Buttons
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Add animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Progress Ring Animation
function animateProgressRing() {
    const progressRings = document.querySelectorAll('.progress-ring-circle');
    
    progressRings.forEach(ring => {
        const radius = ring.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        ring.style.strokeDasharray = `${circumference} ${circumference}`;
        ring.style.strokeDashoffset = circumference;
        
        // Get the target value from data attribute or calculate
        const targetValue = parseInt(ring.dataset.value) || 75;
        const offset = circumference - (targetValue / 100) * circumference;
        
        // Animate to target
        setTimeout(() => {
            ring.style.strokeDashoffset = offset;
        }, 500);
    });
}

// Quick Actions
function initializeQuickActions() {
    const quickActionCards = document.querySelectorAll('.quick-action-card');
    
    quickActionCards.forEach(card => {
        card.addEventListener('click', function() {
            const action = this.querySelector('h6').textContent;
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Handle different actions
            switch(action) {
                case 'Add User':
                    document.getElementById('addUserModal').click();
                    break;
                case 'Create Project':
                    // Navigate to project creation
                    console.log('Navigate to project creation');
                    break;
                case 'Schedule Event':
                    // Navigate to event creation
                    console.log('Navigate to event creation');
                    break;
                case 'View Reports':
                    // Navigate to reports
                    console.log('Navigate to reports');
                    break;
            }
        });
    });
}

// Initialize all search and filter functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeFilters();
    animateProgressRing();
    initializeQuickActions();
});

// Export functions for global use
window.AdminDashboard = {
    updateStats,
    updateActivityFeed,
    animateProgressRing
};
