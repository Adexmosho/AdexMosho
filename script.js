// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        // Update Nav UI
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Switch Pages
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === target) {
                page.classList.add('active');
            }
        });

        // Trigger haptic-like vibration if supported
        if (window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    });
});

// Three.js 3D Background (Advanced Nature & Tech Theme)
function init3D() {
    const canvas = document.querySelector('#bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(40);

    // Group for Tech (Car) elements
    const techGroup = new THREE.Group();
    // Group for Nature (Herb) elements
    const natureGroup = new THREE.Group();
    scene.add(techGroup);
    scene.add(natureGroup);

    // TECH ELEMENTS: Geometric Floating Nodes (Representing car engineering)
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const techMat = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    for(let i=0; i<15; i++) {
        const cube = new THREE.Mesh(cubeGeo, techMat);
        cube.position.set(
            THREE.MathUtils.randFloatSpread(60),
            THREE.MathUtils.randFloatSpread(100),
            THREE.MathUtils.randFloatSpread(40)
        );
        cube.rotation.set(Math.random(), Math.random(), Math.random());
        techGroup.add(cube);
    }

    // NATURE ELEMENTS: Floating organic shapes (Representing herbs)
    const leafGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 64, 8, 2, 3);
    const natureMat = new THREE.MeshPhongMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.2,
        shininess: 100
    });

    for(let i=0; i<15; i++) {
        const leaf = new THREE.Mesh(leafGeo, natureMat);
        leaf.position.set(
            THREE.MathUtils.randFloatSpread(60),
            THREE.MathUtils.randFloatSpread(100),
            THREE.MathUtils.randFloatSpread(40)
        );
        leaf.rotation.set(Math.random(), Math.random(), Math.random());
        natureGroup.add(leaf);
    }

    // LIGHTING for the 3D materials
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2563eb, 2);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const greenLight = new THREE.PointLight(0x10b981, 2);
    greenLight.position.set(-20, -20, 20);
    scene.add(greenLight);

    // Dynamic Particle System (Pollen/Data dust)
    const partGeo = new THREE.BufferGeometry();
    const partCount = 800;
    const posArray = new Float32Array(partCount * 3);
    const colorArray = new Float32Array(partCount * 3);

    for(let i=0; i<partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 120;
        // Alternating colors between Tech Blue and Nature Green
        if (i % 6 < 3) {
            colorArray[i] = i % 2 === 0 ? 0.14 : 0.38;
        } else {
            colorArray[i] = i % 2 === 0 ? 0.06 : 0.72;
        }
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const partMat = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    function animate() {
        requestAnimationFrame(animate);

        techGroup.rotation.y += 0.002;
        techGroup.children.forEach(c => c.rotation.x += 0.01);

        natureGroup.rotation.y -= 0.001;
        natureGroup.rotation.x += 0.0005;
        natureGroup.children.forEach(c => {
            c.rotation.z += 0.01;
            c.position.y += Math.sin(Date.now() * 0.001) * 0.01;
        });

        particles.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

// Start 3D background
init3D();

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
