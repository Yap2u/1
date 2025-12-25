document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle ---
    const menuButton = document.querySelector('.w-nav-button');
    const navMenu = document.querySelector('.w-nav-menu');
    const navWrapper = document.querySelector('.w-nav');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = menuButton.classList.contains('w--open');
            
            if (isOpen) {
                menuButton.classList.remove('w--open');
                navMenu.classList.remove('w--open');
                if (navWrapper) navWrapper.classList.remove('w--open');
                navMenu.style.display = ''; // Revert to CSS
            } else {
                menuButton.classList.add('w--open');
                navMenu.classList.add('w--open');
                if (navWrapper) navWrapper.classList.add('w--open');
                navMenu.style.display = 'block'; // Force show
            }
        });
    }

    // --- Dropdown Toggle ---
    // Webflow's dropdowns with data-hover="true" are meant for hover.
    // We will add click functionality.
    const dropdownToggles = document.querySelectorAll('.w-dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const dropdown = this.closest('.w-dropdown');
            const list = dropdown.querySelector('.w-dropdown-list');
            
            // Safety check: if dropdown has no list, do nothing
            if (!list) return;
            
            const isOpen = dropdown.classList.contains('w--open');

            // Close all other dropdowns
            document.querySelectorAll('.w-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('w--open');
                    const dList = d.querySelector('.w-dropdown-list');
                    if (dList) {
                        dList.classList.remove('w--open');
                        dList.style.display = '';
                    }
                }
            });

            // Toggle the current one
            if (isOpen) {
                dropdown.classList.remove('w--open');
                list.classList.remove('w--open');
                list.style.display = '';
            } else {
                dropdown.classList.add('w--open');
                list.classList.add('w--open');
                list.style.display = 'block'; // Force show
            }
        });
    });

    // --- Close menus when clicking outside ---
    document.addEventListener('click', function(e) {
        // Close mobile menu
        if (navMenu && navMenu.classList.contains('w--open') && 
            !navMenu.contains(e.target) && 
            !menuButton.contains(e.target)) {
            
            menuButton.classList.remove('w--open');
            navMenu.classList.remove('w--open');
            if (navWrapper) navWrapper.classList.remove('w--open');
            navMenu.style.display = '';
        }

        // Close dropdowns
        document.querySelectorAll('.w-dropdown.w--open').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('w--open');
                const list = dropdown.querySelector('.w-dropdown-list');
                if (list) {
                    list.classList.remove('w--open');
                    list.style.display = '';
                }
            }
        });
    });

    // --- FAQ Accordion ---
    const faqToggles = document.querySelectorAll('.faq_dropdown-item');
    
    faqToggles.forEach(toggle => {
        toggle.style.cursor = 'pointer'; 

        // Initialize: Close all answers by default
        const initialAnswer = toggle.nextElementSibling;
        const initialIcon = toggle.querySelector('.accordion-icon_component');
        if (initialAnswer) initialAnswer.style.display = 'none';
        if (initialIcon) initialIcon.style.transform = 'rotate(0deg)';
        
        toggle.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon_component');
            
            if (answer) {
                const isVisible = answer.style.display === 'block' || getComputedStyle(answer).display === 'block';
                answer.style.display = isVisible ? 'none' : 'block';
                
                if (icon) icon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(45deg)';
            }
        });
    });

    // --- Tabs Functionality (Orçamento, Link das Aulas, etc.) ---
    const tabs = document.querySelectorAll('.w-tabs');
    
    tabs.forEach(tabContainer => {
        // Find the menu and content for this specific tab container
        // We iterate children to avoid selecting nested tab elements from other tabs
        let tabMenu = null;
        let tabContent = null;
        
        for (let i = 0; i < tabContainer.children.length; i++) {
            const child = tabContainer.children[i];
            if (child.classList.contains('w-tab-menu')) tabMenu = child;
            if (child.classList.contains('w-tab-content')) tabContent = child;
        }

        if (!tabMenu || !tabContent) return;

        const tabLinks = Array.from(tabMenu.querySelectorAll('.w-tab-link'));
        const tabPanes = Array.from(tabContent.children).filter(child => child.classList.contains('w-tab-pane'));

        // Initialize: Ensure only active tab is visible based on HTML classes
        tabPanes.forEach(pane => {
            if (pane.classList.contains('w--tab-active')) {
                pane.style.display = 'block';
                pane.style.opacity = '1';
            } else {
                pane.style.display = 'none';
                pane.style.opacity = '0';
            }
        });

        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 1. Handle Links: Switch active class
                tabLinks.forEach(l => l.classList.remove('w--current'));
                this.classList.add('w--current');
                
                // 2. Handle Panes: Show matching content
                const targetTabName = this.getAttribute('data-w-tab');
                
                tabPanes.forEach(pane => {
                    if (pane.getAttribute('data-w-tab') === targetTabName) {
                        pane.classList.add('w--tab-active');
                        pane.style.display = 'block';
                        // Small delay to allow display:block to apply before opacity transition
                        requestAnimationFrame(() => {
                            pane.style.opacity = '1';
                        });
                    } else {
                        pane.classList.remove('w--tab-active');
                        pane.style.display = 'none';
                        pane.style.opacity = '0';
                    }
                });
            });
        });
    });

    // --- Testimonials Lightbox ---
    const lightboxLinks = document.querySelectorAll('.w-lightbox');

    lightboxLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const scriptTag = this.querySelector('script.w-json');
            if (!scriptTag) return;

            try {
                const data = JSON.parse(scriptTag.textContent);
                const videoItem = data.items && data.items[0];
                if (!videoItem || !videoItem.html) return;

                // Create lightbox elements
                const lightboxOverlay = document.createElement('div');
                lightboxOverlay.className = 'local-lightbox-overlay';
                lightboxOverlay.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.85); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; opacity: 0; transition: opacity 0.3s ease;
                `;

                const lightboxContent = document.createElement('div');
                lightboxContent.className = 'local-lightbox-content';
                lightboxContent.style.cssText = `
                    position: relative; width: 90%; max-width: 940px; cursor: default;
                `;

                const videoWrapper = document.createElement('div');
                videoWrapper.style.cssText = `position: relative; width: 100%; height: 0; padding-bottom: 56.25%;`; // 16:9
                videoWrapper.innerHTML = videoItem.html;
                const iframe = videoWrapper.querySelector('iframe');
                if (iframe) {
                    iframe.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;`;
                }
                
                const closeButton = document.createElement('div');
                closeButton.innerHTML = '&times;';
                closeButton.style.cssText = `position: absolute; top: -35px; right: 0; font-size: 35px; color: white; cursor: pointer; line-height: 1; font-weight: bold;`;

                // Assemble and append to body
                lightboxContent.appendChild(videoWrapper);
                lightboxContent.appendChild(closeButton);
                lightboxOverlay.appendChild(lightboxContent);
                document.body.appendChild(lightboxOverlay);

                // Trigger fade-in
                requestAnimationFrame(() => { lightboxOverlay.style.opacity = '1'; });

                // Close functionality
                const closeLightbox = () => {
                    // Check if the overlay is still in the DOM before trying to remove it
                    if (lightboxOverlay.parentNode) {
                        document.body.removeChild(lightboxOverlay);
                    }
                };
                lightboxOverlay.addEventListener('click', closeLightbox);
                closeButton.addEventListener('click', closeLightbox);
                lightboxContent.addEventListener('click', (ev) => ev.stopPropagation());

            } catch (error) {
                console.error('Error creating lightbox:', error);
            }
        });
    });
});