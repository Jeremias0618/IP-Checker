// ===== SISTEMA DE NOTIFICACIONES =====
let notificationTimeout;

function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Limpiar notificación anterior si existe
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icono según tipo
    let icon = 'fas fa-info-circle';
    switch(type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-times-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
    }
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar al contenedor
    container.appendChild(notification);
    
    // Auto-remover después del tiempo especificado
    notificationTimeout = setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
    
    // Mostrar notificación del sistema si está habilitado
    if (window.appState && window.appState.systemConfig && window.appState.systemConfig.notifications) {
        showSystemNotification(message, type);
    }
}

function showSystemNotification(message, type) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    const title = 'IP Checker Pro';
    const options = {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ip-checker-notification'
    };
    
    new Notification(title, options);
}

// ===== SISTEMA DE MODALES =====
let currentModalCallback = null;

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirm = document.getElementById('modal-confirm');
    
    if (!modal || !modalTitle || !modalMessage || !modalConfirm) return;
    
    // Configurar contenido
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Configurar callback
    currentModalCallback = onConfirm;
    
    // Configurar botón de confirmación
    modalConfirm.onclick = () => {
        if (currentModalCallback) {
            currentModalCallback();
        }
        hideModal();
    };
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Enfocar en el botón de confirmación
    setTimeout(() => {
        modalConfirm.focus();
    }, 100);
}

function hideModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.remove('active');
        currentModalCallback = null;
    }
}

// ===== EFECTOS VISUALES =====
function addPulseEffect(element) {
    if (!element) return;
    
    element.classList.add('pulse');
    setTimeout(() => {
        element.classList.remove('pulse');
    }, 1000);
}

function addGlowEffect(element, color = 'var(--primary)') {
    if (!element) return;
    
    element.style.boxShadow = `0 0 20px ${color}`;
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 2000);
}

function addSlideInEffect(element) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.5s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 100);
}

// ===== ANIMACIONES DE CARGA =====
function showLoading(element, message = 'Cargando...') {
    if (!element) return;
    
    const originalContent = element.innerHTML;
    element.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span>${message}</span>
        </div>
    `;
    
    // Guardar contenido original para restaurarlo
    element.dataset.originalContent = originalContent;
}

function hideLoading(element) {
    if (!element) return;
    
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
    }
}

// ===== EFECTOS DE HOVER =====
function setupHoverEffects() {
    // Efectos en botones
    const buttons = document.querySelectorAll('.pro-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            addGlowEffect(button);
        });
    });
    
    // Efectos en tarjetas
    const cards = document.querySelectorAll('.pro-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===== EFECTOS DE TYPING =====
function typeWriter(element, text, speed = 50) {
    if (!element) return;
    
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===== EFECTOS DE PARTÍCULAS =====
function createParticleEffect(x, y, color = 'var(--primary)') {
    const particle = document.createElement('div');
    particle.className = 'effect-particle';
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: particle-fade 1s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    // Remover después de la animación
    setTimeout(() => {
        if (particle.parentElement) {
            particle.remove();
        }
    }, 1000);
}

// ===== EFECTOS DE CLICK =====
function addClickEffect(event) {
    const x = event.clientX;
    const y = event.clientY;
    createParticleEffect(x, y);
}

// ===== EFECTOS DE SCROLL =====
function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación al hacer scroll
    const animatedElements = document.querySelectorAll('.pro-card, .nav-btn, .logo-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// ===== EFECTOS DE FOCUS =====
function setupFocusEffects() {
    const focusableElements = document.querySelectorAll('button, input, select, a');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            addGlowEffect(element, 'var(--primary)');
        });
        
        element.addEventListener('blur', () => {
            element.style.boxShadow = '';
        });
    });
}

// ===== EFECTOS DE ESTADO =====
function updateElementState(element, state) {
    if (!element) return;
    
    // Remover estados anteriores
    element.classList.remove('loading', 'success', 'error', 'warning');
    
    // Agregar nuevo estado
    element.classList.add(state);
    
    // Icono según estado
    let icon = '';
    switch(state) {
        case 'loading':
            icon = 'fas fa-spinner fa-spin';
            break;
        case 'success':
            icon = 'fas fa-check';
            break;
        case 'error':
            icon = 'fas fa-times';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
    }
    
    if (icon) {
        const iconElement = element.querySelector('i');
        if (iconElement) {
            iconElement.className = icon;
        }
    }
}

// ===== EFECTOS DE PROGRESS =====
function createProgressBar(container, progress = 0) {
    if (!container) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
        <div class="progress-fill" style="width: ${progress}%"></div>
        <span class="progress-text">${progress}%</span>
    `;
    
    container.appendChild(progressBar);
    
    return {
        update: (newProgress) => {
            const fill = progressBar.querySelector('.progress-fill');
            const text = progressBar.querySelector('.progress-text');
            
            if (fill && text) {
                fill.style.width = `${newProgress}%`;
                text.textContent = `${newProgress}%`;
            }
        },
        remove: () => {
            if (progressBar.parentElement) {
                progressBar.remove();
            }
        }
    };
}

// ===== EFECTOS DE TOOLTIP =====
function createTooltip(element, text) {
    if (!element) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    element.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
        if (tooltip.parentElement) {
            tooltip.remove();
        }
    });
}

// ===== EFECTOS DE DRAG =====
function setupDragEffects() {
    const draggableElements = document.querySelectorAll('.ip-item');
    
    draggableElements.forEach(element => {
        element.draggable = true;
        
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.ip);
            element.style.opacity = '0.5';
        });
        
        element.addEventListener('dragend', () => {
            element.style.opacity = '1';
        });
    });
}

// ===== EFECTOS DE KEYBOARD =====
function setupKeyboardEffects() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K para buscar
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('ip-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + S para guardar configuración
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveBtn = document.getElementById('save-config');
            if (saveBtn) {
                saveBtn.click();
            }
        }
    });
}

// ===== EFECTOS DE RESPONSIVE =====
function setupResponsiveEffects() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleResize(e) {
        if (e.matches) {
            // Efectos para móvil
            document.body.classList.add('mobile');
        } else {
            // Efectos para desktop
            document.body.classList.remove('mobile');
        }
    }
    
    mediaQuery.addListener(handleResize);
    handleResize(mediaQuery);
}

// ===== EFECTOS DE PERFORMANCE =====
function setupPerformanceEffects() {
    // Throttle para eventos de scroll
    let ticking = false;
    
    function updateOnScroll() {
        ticking = false;
        // Efectos de scroll aquí
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
    
    // Debounce para búsquedas
    let searchTimeout;
    
    function debounceSearch(func, delay) {
        return function(...args) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // Aplicar debounce a búsquedas
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounceSearch(() => {
            // Lógica de búsqueda aquí
        }, 300));
    });
}

// ===== INICIALIZACIÓN DE EFECTOS =====
document.addEventListener('DOMContentLoaded', () => {
    setupHoverEffects();
    setupScrollEffects();
    setupFocusEffects();
    setupDragEffects();
    setupKeyboardEffects();
    setupResponsiveEffects();
    setupPerformanceEffects();
    
    // Agregar efecto de click global
    document.addEventListener('click', addClickEffect);
});

// ===== EXPORTAR FUNCIONES =====
window.showNotification = showNotification;
window.showConfirmModal = showConfirmModal;
window.hideModal = hideModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.addPulseEffect = addPulseEffect;
window.addGlowEffect = addGlowEffect;
window.addSlideInEffect = addSlideInEffect;
window.typeWriter = typeWriter;
window.createParticleEffect = createParticleEffect;
window.updateElementState = updateElementState;
window.createProgressBar = createProgressBar;
window.createTooltip = createTooltip; 