let currentSlide = 0;
const totalPhotos = 27;
let autoSlideInterval;
let isAutoSlideActive = true;
let musicAudio = null;

const targetDate = new Date('2025-06-07T15:00:00').getTime();

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    createParticles();
    initCarousel();
    startAutoSlide();
    initCountdown();
    initMusicPlayer();
    preloadImages();
    initScrollEffects();
    initEventListeners();
    initIntersectionObserver();
    
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth > 768 ? 60 : 30;
    
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const hue = Math.random() * 360;
        
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${Math.random() * 6}s;
            animation-duration: ${Math.random() * 3 + 3}s;
            background: hsla(${hue}, 70%, 70%, 0.8);
            box-shadow: 0 0 ${size * 2}px hsla(${hue}, 70%, 70%, 0.5);
        `;
        
        particlesContainer.appendChild(particle);
    }
}

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('indicators');
    
    if (!track || !indicators) return;
    
    track.innerHTML = '';
    indicators.innerHTML = '';
    
    for (let i = 1; i <= totalPhotos; i++) {
        createSlide(track, i);
        createIndicator(indicators, i);
    }
    
    updateCarousel();
    initCarouselControls();
}

function createSlide(track, index) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const img = document.createElement('img');
    img.src = `mis50/${index}.jpg`;
    img.alt = `Momento especial ${index}`;
    img.loading = 'lazy';
    
    const placeholder = createImagePlaceholder(index);
    slide.appendChild(placeholder);
    
    img.onload = function() {
        this.style.opacity = '1';
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
    };
    
    img.onerror = function() {
        placeholder.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
                <div>Foto ${index}</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">Imagen no disponible</div>
            </div>
        `;
    };
    
    img.style.cssText = 'opacity: 0; transition: opacity 0.3s ease;';
    slide.appendChild(img);
    track.appendChild(slide);
}

function createImagePlaceholder(index) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
        z-index: 1;
    `;
    
    placeholder.innerHTML = `
        <div style="text-align: center; color: #999;">
            <div class="loading-spinner" style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            "></div>
            <div>Cargando foto ${index}...</div>
        </div>
    `;
    
    return placeholder;
}

function createIndicator(indicators, index) {
    const indicator = document.createElement('div');
    indicator.className = 'indicator';
    indicator.setAttribute('data-slide', index - 1);
    if (index === 1) indicator.classList.add('active');
    
    indicator.addEventListener('click', () => goToSlide(index - 1));
    indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToSlide(index - 1);
        }
    });
    indicator.setAttribute('tabindex', '0');
    indicator.setAttribute('aria-label', `Ir a foto ${index}`);
    
    indicators.appendChild(indicator);
}

function initCarouselControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', toggleAutoSlide);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            if (isAutoSlideActive) stopAutoSlide();
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            if (isAutoSlideActive) startAutoSlide();
        });
        
        initTouchSupport(carouselContainer);
    }
    
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function initTouchSupport(container) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

function handleKeyboardNavigation(e) {
    if (document.activeElement.closest('.carousel-container')) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case ' ':
                e.preventDefault();
                toggleAutoSlide();
                break;
        }
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalPhotos;
    updateCarousel();
    announceSlideChange();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalPhotos) % totalPhotos;
    updateCarousel();
    announceSlideChange();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    announceSlideChange();
}

function announceSlideChange() {
    const announcement = `Foto ${currentSlide + 1} de ${totalPhotos}`;
    const ariaLive = document.getElementById('carousel-aria-live') || createAriaLiveRegion();
    ariaLive.textContent = announcement;
}

function createAriaLiveRegion() {
    const ariaLive = document.createElement('div');
    ariaLive.id = 'carousel-aria-live';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(ariaLive);
    return ariaLive;
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!track) return;
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((indicator, index) => {
        const isActive = index === currentSlide;
        indicator.classList.toggle('active', isActive);
        indicator.setAttribute('aria-selected', isActive);
    });
    
    preloadAdjacentImages();
}

function preloadAdjacentImages() {
    const preloadIndices = [
        (currentSlide - 1 + totalPhotos) % totalPhotos + 1,
        (currentSlide + 1) % totalPhotos + 1
    ];
    
    preloadIndices.forEach(index => {
        const img = new Image();
        img.src = `mis50/${index}.jpg`;
    });
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 3000);
    updatePlayPauseButton(true);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
    updatePlayPauseButton(false);
}

function toggleAutoSlide() {
    isAutoSlideActive = !isAutoSlideActive;
    if (isAutoSlideActive) {
        startAutoSlide();
    } else {
        stopAutoSlide();
    }
}

function updatePlayPauseButton(isPlaying) {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
        playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar slideshow' : 'Reproducir slideshow');
    }
}

function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    if (distance < 0) {
        countdownElement.innerHTML = `
            <div class="countdown-item celebration">
                <div class="countdown-number">🎉</div>
                <div class="countdown-label">¡Es hoy!</div>
            </div>
        `;
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdownElement.innerHTML = `
        <div class="countdown-item">
            <div class="countdown-number">${days}</div>
            <div class="countdown-label">Días</div>
        </div>
        <div class="countdown-item">
            <div class="countdown-number">${hours}</div>
            <div class="countdown-label">Horas</div>
        </div>
        <div class="countdown-item">
            <div class="countdown-number">${minutes}</div>
            <div class="countdown-label">Minutos</div>
        </div>
        <div class="countdown-item">
            <div class="countdown-number">${seconds}</div>
            <div class="countdown-label">Segundos</div>
        </div>
    `;
}

function initMusicPlayer() {
    musicAudio = new Audio();
    musicAudio.loop = true;
    musicAudio.volume = 0.5;
    
    const playlist = [
        'https://www.soundjay.com/misc/sounds/magic-chime-02.mp3',
    ];
    
    if (playlist.length > 0) {
        musicAudio.src = playlist[0];
    }
}

function toggleMusic() {
    const toggleBtn = document.getElementById('musicToggle');
    if (!toggleBtn || !musicAudio) return;
    
    if (musicAudio.paused) {
        musicAudio.play().then(() => {
            toggleBtn.textContent = '⏸️ Pausar Música';
            toggleBtn.setAttribute('aria-label', 'Pausar música');
        }).catch(() => {
            console.log('No se pudo reproducir la música automáticamente');
            toggleBtn.textContent = '🎵 Música no disponible';
        });
    } else {
        musicAudio.pause();
        toggleBtn.textContent = '▶️ Reproducir Música';
        toggleBtn.setAttribute('aria-label', 'Reproducir música');
    }
}

function changeVolume() {
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider && musicAudio) {
        musicAudio.volume = volumeSlider.value;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        section.setAttribute('tabindex', '-1');
        section.focus();
    }
}

function openMap() {
    const address = 'Calle Mina de Plata 118, Col. Frailes';
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
}

function createConfetti() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const confettiCount = window.innerWidth > 768 ? 100 : 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            z-index: 10000;
            pointer-events: none;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
    
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification('¡Felices 50 años! 🎉', 'success');
}

function initScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            const speed = scrolled * 0.3;
            hero.style.transform = `translateY(${speed}px)`;
        }
        
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const speed = (index % 3 + 1) * 0.1;
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
}

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    const elementsToObserve = document.querySelectorAll(
        '.detail-card, .message-card, .section-title, .carousel-container'
    );
    
    elementsToObserve.forEach(el => {
        el.classList.add('animate-target');
        observer.observe(el);
    });
}

function initEventListeners() {
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', changeVolume);
    }
    
    const number50 = document.querySelector('.number-50');
    if (number50) {
        number50.addEventListener('click', createConfetti);
    }
    
    window.addEventListener('online', () => showNotification('Conexión restaurada', 'success'));
    window.addEventListener('offline', () => showNotification('Sin conexión a internet', 'warning'));
}

function preloadImages() {
    const imagesToPreload = Math.min(8, totalPhotos);
    let loadedImages = 0;
    
    for (let i = 1; i <= imagesToPreload; i++) {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            if (loadedImages === imagesToPreload) {
                document.body.classList.add('images-loaded');
            }
        };
        img.src = `mis50/${i}.jpg`;
    }
}

window.addEventListener('resize', debounce(() => {
    updateCarousel();
    createParticles();
}, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});

window.addEventListener('beforeunload', () => {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    if (musicAudio && !musicAudio.paused) {
        musicAudio.pause();
    }
});