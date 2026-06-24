// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        // Update nav state
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Show the selected page
        pages.forEach(page => {
            page.classList.toggle('active', page.id === target);
        });

        if (window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    });
});

// Scroll Auto-Hide Logic for Header and Bottom Nav
const contentArea = document.querySelector('#content');
const header = document.querySelector('header');
const bottomNav = document.querySelector('.bottom-nav');
let isScrolling;

contentArea.addEventListener('scroll', () => {
    // Hide tabs when scrolling starts
    header.classList.add('nav-hidden');
    bottomNav.classList.add('nav-hidden');

    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);

    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(() => {
        // Show tabs when scrolling stops
        header.classList.remove('nav-hidden');
        bottomNav.classList.remove('nav-hidden');
    }, 150); // 150ms after scrolling stops
}, { passive: true });

// Pull to Refresh Logic (Reduced Sensitivity)
const pullRefresh = document.querySelector('#pull-to-refresh');
let touchStart = 0;
let touchDiff = 0;

contentArea.addEventListener('touchstart', (e) => {
    touchStart = e.touches[0].clientY;
});

contentArea.addEventListener('touchmove', (e) => {
    if (contentArea.scrollTop === 0) {
        let currentTouch = e.touches[0].clientY;
        // Apply a resistance factor (0.4) so it moves slower than the finger
        touchDiff = (currentTouch - touchStart) * 0.4;

        if (touchDiff > 0 && touchDiff < 150) {
            pullRefresh.style.transform = `translateY(${touchDiff}px)`;
        }
    }
}, { passive: true });

contentArea.addEventListener('touchend', () => {
    // Increased threshold from 70 to 110 for reduced sensitivity
    if (touchDiff > 110 && contentArea.scrollTop === 0) {
        pullRefresh.style.transform = 'translateY(100px)';

        if (window.navigator.vibrate) window.navigator.vibrate(20);

        setTimeout(() => {
            window.location.reload();
        }, 800);
    } else {
        pullRefresh.style.transform = 'translateY(0)';
    }
    touchDiff = 0;
});

// Service Worker Registration (deferred to idle to avoid blocking startup)
if ('serviceWorker' in navigator) {
    const registerSW = () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(registerSW, { timeout: 5000 });
    } else {
        // Fallback: register a few seconds after load
        window.addEventListener('load', () => setTimeout(registerSW, 3000));
    }
}

// PWA Install Logic
let deferredPrompt;
const installBanner = document.querySelector('#install-banner');
const installBtn = document.querySelector('#install-btn');
const installClose = document.querySelector('#install-close');
const profileInstallRow = document.querySelector('#profile-install-row');
const profileInstallBtn = document.querySelector('#profile-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Show the custom install banner
    setTimeout(() => {
        installBanner.classList.add('show');
    }, 2000); // Show after 2 seconds

    // Show the install button in profile
    if (profileInstallRow) profileInstallRow.style.display = 'flex';
});

async function triggerInstall() {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        // Hide the banner and profile row
        installBanner.classList.remove('show');
        if (profileInstallRow) profileInstallRow.style.display = 'none';
    }
}

installBtn.addEventListener('click', triggerInstall);
if (profileInstallBtn) profileInstallBtn.addEventListener('click', triggerInstall);

installClose.addEventListener('click', () => {
    installBanner.classList.remove('show');
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    installBanner.classList.remove('show');
    if (profileInstallRow) profileInstallRow.style.display = 'none';
    deferredPrompt = null;
    console.log('PWA was installed');
});

// Defer heavy loading until the page is interactive and add deferred image loading
window.addEventListener('DOMContentLoaded', () => {
    // Delay non-blocking initialization slightly after DOM readiness
    setTimeout(() => {
        // Defer remote images: replace src with tiny placeholder and load when visible
        try {
            const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"></svg>';
            document.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.startsWith('https://') && !img.hasAttribute('data-src')) {
                    img.setAttribute('data-src', src);
                    img.setAttribute('src', placeholder);
                    img.loading = 'lazy';
                    img.classList.add('defer-img');
                }
            });

            if ('IntersectionObserver' in window) {
                const io = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            const dataSrc = el.getAttribute('data-src');
                            if (dataSrc) {
                                el.src = dataSrc;
                                el.removeAttribute('data-src');
                            }
                            obs.unobserve(el);
                        }
                    });
                }, { rootMargin: '200px' });

                document.querySelectorAll('img.defer-img').forEach(i => io.observe(i));
            } else {
                // Fallback: load deferred images after a short delay
                setTimeout(() => {
                    document.querySelectorAll('img.defer-img').forEach(i => {
                        const ds = i.getAttribute('data-src');
                        if (ds) i.src = ds;
                    });
                }, 600);
            }
        } catch (e) {
            console.warn('Deferred image loader failed', e);
        }
    }, 250);
});

// Card 3D Tilt Effect - Refined
document.querySelectorAll('.card, .floating-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
    });
});

// Startup Tab Switch Logic
const startupTabs = document.querySelectorAll('.startup-tab');
const startupPanels = document.querySelectorAll('.startup-panel');

startupTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');

        startupTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        startupPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === target);
        });

        if (window.navigator.vibrate) window.navigator.vibrate(10);
    });
});

// Profile Tabs Switch Logic
const profileTabs = document.querySelectorAll('.profile-tab');
const tabContents = document.querySelectorAll('.tab-content');

profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Update Tab UI
        profileTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update Content visibility
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${targetTab}`) {
                content.classList.add('active');
            }
        });

        if (window.navigator.vibrate) window.navigator.vibrate(5);
    });
});

// Product Detail Overlay Logic
const clickableProducts = document.querySelectorAll('.clickable-product');
const detailOverlay = document.querySelector('#product-detail-overlay');
const closeDetailBtn = document.querySelector('.close-detail');

clickableProducts.forEach(product => {
    product.addEventListener('click', () => {
        const brand = product.getAttribute('data-brand');
        const title = product.getAttribute('data-title');
        const price = product.getAttribute('data-price');
        const img = product.getAttribute('data-img');
        const desc = product.getAttribute('data-desc');
        const specs = product.getAttribute('data-specs');

        // Update UI
        document.querySelector('#detail-brand').textContent = brand;
        document.querySelector('#detail-title').textContent = title;
        document.querySelector('#detail-price').textContent = price;
        document.querySelector('#detail-img').src = img;
        document.querySelector('#detail-desc').textContent = desc;

        // Handle Specs
        const specsContainer = document.querySelector('#detail-specs');
        specsContainer.innerHTML = '';
        if (specs) {
            specs.split('|').forEach(spec => {
                const chip = document.createElement('div');
                chip.className = 'spec-chip';
                // Add icons based on common spec types
                let icon = '<i class="fas fa-info-circle"></i>';
                if (spec.includes('Petrol') || spec.includes('Electric')) icon = '<i class="fas fa-gas-pump"></i>';
                if (spec.includes('Auto') || spec.includes('Manual')) icon = '<i class="fas fa-cog"></i>';
                if (spec.includes('HP')) icon = '<i class="fas fa-bolt"></i>';

                chip.innerHTML = `${icon} ${spec.trim()}`;
                specsContainer.appendChild(chip);
            });
        }

        // Show Overlay
        detailOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll

        if (window.navigator.vibrate) window.navigator.vibrate(10);
    });
});

closeDetailBtn.addEventListener('click', () => {
    detailOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
});

// Advanced Filter Drawer Logic
const filterIcon = document.querySelector('.filter-icon');
const filterDrawer = document.querySelector('#filter-drawer');
const closeDrawerBtn = document.querySelector('.close-drawer');
const applyFiltersBtn = document.querySelector('#apply-filters');
const resetFiltersBtn = document.querySelector('#reset-filters');
const chipSelects = document.querySelectorAll('.chip-select');
const optionBtns = document.querySelectorAll('.option-btn');

filterIcon.addEventListener('click', () => {
    filterDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.navigator.vibrate) window.navigator.vibrate(10);
});

closeDrawerBtn.addEventListener('click', () => {
    filterDrawer.classList.remove('active');
    document.body.style.overflow = '';
});

// Toggle Chips
chipSelects.forEach(chip => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        if (window.navigator.vibrate) window.navigator.vibrate(5);
    });
});

// Single select for Sort options
optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        optionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.navigator.vibrate) window.navigator.vibrate(5);
    });
});

resetFiltersBtn.addEventListener('click', () => {
    chipSelects.forEach(c => c.classList.remove('active'));
    optionBtns.forEach(b => b.classList.remove('active'));
    optionBtns[0].classList.add('active');
    document.querySelectorAll('.price-inputs input').forEach(i => i.value = '');
    if (window.navigator.vibrate) window.navigator.vibrate(20);
});

applyFiltersBtn.addEventListener('click', () => {
    applyFiltersBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    setTimeout(() => {
        applyFiltersBtn.innerHTML = 'Apply Filters';
        filterDrawer.classList.remove('active');
        document.body.style.overflow = '';
        if (window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
    }, 800);
});

// Link "Chat with Agent" button to Chat Page
const chatWithAgentBtn = document.querySelector('.secondary-action');
chatWithAgentBtn.addEventListener('click', () => {
    const productName = document.querySelector('#detail-title').textContent;
    const productImg = document.querySelector('#detail-img').src;

    detailOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Switch to Chat Tab
    const chatNavItem = document.querySelector('.nav-item[data-target="chat"]');
    if (chatNavItem) chatNavItem.click();

    // Open specific room
    openChatRoom(productName, productImg);
});

// Product Category Filtering
const categoryChips = document.querySelectorAll('.category-chip');
const carCards = document.querySelectorAll('.car-compact');

categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const category = chip.textContent.trim();

        // Update Active UI
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // Filter Cards
        carCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');

            if (category === 'All' || cardCategory === category) {
                card.style.display = 'block';
                // Add a small fade-in animation
                card.style.animation = 'none';
                card.offsetHeight; // trigger reflow
                card.style.animation = 'fadeIn 0.4s ease-out';
            } else {
                card.style.display = 'none';
            }
        });

        if (window.navigator.vibrate) window.navigator.vibrate(5);
    });
});

// Close on background click
detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) {
        detailOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Chat Functionality (Restructured for Conversion Rooms)
const chatListView = document.querySelector('#chat-list-view');
const chatRoomView = document.querySelector('#chat-room-view');
const chatItems = document.querySelectorAll('.chat-item');
const chatBackBtn = document.querySelector('#chat-back');
const sendMessageBtn = document.querySelector('#send-message');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('#chat-messages');

function appendMessage(text, type) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="msg-content">${text}</div>
        <span class="msg-time">${time}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function openChatRoom(productName, productImg) {
    document.querySelector('#room-product-title').textContent = productName;
    document.querySelector('#room-product-img').src = productImg;

    // Clear previous messages and add welcome
    chatMessages.innerHTML = `<div class="message-date">Today</div>`;
    appendMessage(`Hello! I see you are interested in ${productName}. How can I assist you?`, 'received');

    chatListView.classList.remove('active');
    chatRoomView.classList.add('active');
}

chatItems.forEach(item => {
    item.addEventListener('click', () => {
        const product = item.getAttribute('data-product');
        const img = item.querySelector('img').src;
        openChatRoom(product, img);
    });
});

chatBackBtn.addEventListener('click', () => {
    chatRoomView.classList.remove('active');
    chatListView.classList.add('active');
});

sendMessageBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text) {
        appendMessage(text, 'sent');
        chatInput.value = '';

        setTimeout(() => {
            appendMessage("Our experts are reviewing your inquiry. We'll respond in a moment.", 'received');
        }, 1500);

        if (window.navigator.vibrate) window.navigator.vibrate(5);
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

/* -------------------- Admin Console (localStorage-backed) -------------------- */
// Basic storage helpers
const STORAGE_KEYS = { ADS: 'adex_ads_v1', USERS: 'adex_users_v1', MESSAGES: 'adex_msgs_v1' };

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('load error', e); }
    return fallback;
}

function saveToStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('save error', e); }
}

// Seed default data if missing
function seedFrontendData() {
    const existing = loadFromStorage(STORAGE_KEYS.ADS, null);
    if (!existing) {
        const seedAds = [
            { id: 'ad-1', title: 'Sample Car A', desc: 'A beautiful car', img: 'lib/porsche.jpg' },
            { id: 'ad-2', title: 'Sample Herb B', desc: 'Organic herbal remedy', img: 'lib/herb.jpg' }
        ];
        saveToStorage(STORAGE_KEYS.ADS, seedAds);
    }

    const users = loadFromStorage(STORAGE_KEYS.USERS, null);
    if (!users) {
        const seedUsers = Array.from({ length: 8 }).map((_, i) => ({ id: `u-${i+1}`, name: `User ${i+1}`, email: `user${i+1}@example.com` }));
        saveToStorage(STORAGE_KEYS.USERS, seedUsers);
    }

    const msgs = loadFromStorage(STORAGE_KEYS.MESSAGES, null);
    if (!msgs) {
        const seedMsgs = [{ id: 'm-1', from: 'web_user@site', to: 'admin', text: 'Is this still available?', time: Date.now() }];
        saveToStorage(STORAGE_KEYS.MESSAGES, seedMsgs);
    }
}

function renderSiteAds() {
    const ads = loadFromStorage(STORAGE_KEYS.ADS, []);
    const grid = document.querySelector('.car-grid-3');
    if (!grid) return;
    // replace existing cards with serialized ads
    grid.innerHTML = '';
    ads.forEach(ad => {
        const card = document.createElement('div');
        card.className = 'card car-compact clickable-product';
        card.setAttribute('data-brand', 'Adex');
        card.setAttribute('data-title', ad.title);
        card.setAttribute('data-price', '₦--');
        card.setAttribute('data-img', ad.img || 'Adewale.jpeg');
        card.setAttribute('data-desc', ad.desc);
        card.innerHTML = `
            <div class="car-img-container"><img loading="lazy" src="${ad.img || 'Adewale.jpeg'}" alt="${ad.title}"></div>
            <div class="car-info-compact"><span class="brand">Adex</span><h4>${ad.title}</h4><p class="price-sm">₦--</p></div>
        `;
        grid.appendChild(card);
        // attach click behavior
        card.addEventListener('click', () => {
            const clickEv = new Event('click');
            card.dispatchEvent(clickEv);
        });
    });
}

function renderAdminAdsList() {
    const adminList = document.querySelector('#admin-ads-list');
    if (!adminList) return;
    const ads = loadFromStorage(STORAGE_KEYS.ADS, []);
    adminList.innerHTML = '';
    ads.forEach(ad => {
        const el = document.createElement('div');
        el.className = 'admin-ad-row';
        el.innerHTML = `<strong>${ad.title}</strong><div>${ad.desc}</div><div style="margin-top:6px;"><button class='btn-glow admin-del' data-id='${ad.id}'>Delete</button></div>`;
        adminList.appendChild(el);
    });
    document.querySelectorAll('.admin-del').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.getAttribute('data-id');
        const list = loadFromStorage(STORAGE_KEYS.ADS, []).filter(a => a.id !== id);
        saveToStorage(STORAGE_KEYS.ADS, list);
        renderAdminAdsList(); renderSiteAds();
    }));
}

function renderAdminUsers() {
    const el = document.querySelector('#admin-users-list');
    if (!el) return;
    const users = loadFromStorage(STORAGE_KEYS.USERS, []);
    el.innerHTML = '';
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = 'admin-user-row';
        row.innerHTML = `<strong>${u.name}</strong> — ${u.email} <button class='btn-glow admin-user-del' data-id='${u.id}'>Remove</button>`;
        el.appendChild(row);
    });
    document.querySelectorAll('.admin-user-del').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.getAttribute('data-id');
        const list = loadFromStorage(STORAGE_KEYS.USERS, []).filter(x => x.id !== id);
        saveToStorage(STORAGE_KEYS.USERS, list);
        renderAdminUsers();
    }));
}

function renderAdminMessages() {
    const el = document.querySelector('#admin-msg-list');
    if (!el) return;
    const msgs = loadFromStorage(STORAGE_KEYS.MESSAGES, []);
    el.innerHTML = '';
    msgs.forEach(m => {
        const row = document.createElement('div');
        row.className = 'admin-msg-row';
        row.innerHTML = `<div><strong>${m.from}</strong>: ${m.text}</div><div style="margin-top:6px;"><button class='btn-glow admin-reply' data-id='${m.id}'>Reply</button></div>`;
        el.appendChild(row);
    });
    document.querySelectorAll('.admin-reply').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.getAttribute('data-id');
        document.querySelector('#admin-msg-reply').dataset.replyTo = id;
        document.querySelector('#admin-msg-reply').focus();
    }));
}

// Admin form handlers
document.addEventListener('DOMContentLoaded', () => {
    seedFrontendData();
    renderSiteAds(); renderAdminAdsList(); renderAdminUsers(); renderAdminMessages();

    const postBtn = document.querySelector('#admin-post-ad');
    if (postBtn) postBtn.addEventListener('click', () => {
        const title = document.querySelector('#admin-ad-title').value.trim();
        const desc = document.querySelector('#admin-ad-desc').value.trim();
        const img = document.querySelector('#admin-ad-img').value.trim();
        if (!title) return alert('Title required');
        const ads = loadFromStorage(STORAGE_KEYS.ADS, []);
        const id = `ad-${Date.now()}`;
        ads.unshift({ id, title, desc, img });
        saveToStorage(STORAGE_KEYS.ADS, ads);
        document.querySelector('#admin-ad-title').value = '';
        document.querySelector('#admin-ad-desc').value = '';
        document.querySelector('#admin-ad-img').value = '';
        renderAdminAdsList(); renderSiteAds();
        alert('Ad posted locally. To sync across devices, connect a backend.');
    });

    const sendReply = document.querySelector('#admin-send-reply');
    if (sendReply) sendReply.addEventListener('click', () => {
        const replyEl = document.querySelector('#admin-msg-reply');
        const replyTo = replyEl.dataset.replyTo;
        const text = replyEl.value.trim();
        if (!text) return;
        const msgs = loadFromStorage(STORAGE_KEYS.MESSAGES, []);
        msgs.push({ id: `m-${Date.now()}`, from: 'admin', to: replyTo || 'web', text, time: Date.now() });
        saveToStorage(STORAGE_KEYS.MESSAGES, msgs);
        replyEl.value = '';
        renderAdminMessages();
        alert('Reply added locally. Implement backend to deliver to website users.');
    });

    // Admin tab switching
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(t => t.addEventListener('click', () => {
        adminTabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        const target = t.getAttribute('data-admin');
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`#admin-${target}`).classList.add('active');
    }));
});

/* -------------------- End Admin Console -------------------- */
