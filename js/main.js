/**
 * ============================================
 * MAIN DOCUMENTATION SCRIPT
 * ============================================
 * Gestion de la navigation, recherche, table des matières,
 * et autres fonctionnalités interactives
 */

(function() {
    'use strict';

    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollToTop();
        initTableOfContents();
        initCodeBlocks();
        initSearch();
        initSmoothScroll();
        initActiveSectionHighlight();
        initAnimations();
    });

    // ============================================
    // NAVIGATION
    // ============================================
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offset = 100; // Offset for sticky navbar
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without triggering scroll
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }

    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    function initScrollToTop() {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top';
        scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
        document.body.appendChild(scrollTopBtn);

        let ticking = false;
        
        function updateScrollButton() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollButton);
                ticking = true;
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // TABLE OF CONTENTS - Enhanced
    // ============================================
    function initTableOfContents() {
        const docContent = document.querySelector('.doc-content');
        if (!docContent) return;

        const headings = docContent.querySelectorAll('h2, h3, h4');
        if (headings.length === 0) return;

        // Check if TOC already exists
        if (document.querySelector('.toc')) return;

        const toc = document.createElement('div');
        toc.className = 'toc';
        toc.innerHTML = '<h3><i class="fas fa-list"></i> Table des Matières</h3><ul></ul>';

        const tocList = toc.querySelector('ul');
        let currentH2 = null;
        let currentH3 = null;

        headings.forEach((heading, index) => {
            // Add ID if not present
            if (!heading.id) {
                heading.id = heading.textContent
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
            }

            // Add scroll-margin to headings for better scroll positioning
            heading.style.scrollMarginTop = '120px';

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent.trim();
            link.setAttribute('data-heading-id', heading.id);
            
            // Add smooth scroll behavior
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 120;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL
                    if (history.pushState) {
                        history.pushState(null, null, this.getAttribute('href'));
                    }
                }
            });

            if (heading.tagName === 'H2') {
                currentH2 = listItem;
                currentH3 = null;
                listItem.className = 'toc-h2';
                listItem.appendChild(link);
                tocList.appendChild(listItem);
            } else if (heading.tagName === 'H3' && currentH2) {
                currentH3 = listItem;
                let subList = currentH2.querySelector('ul');
                if (!subList) {
                    subList = document.createElement('ul');
                    currentH2.appendChild(subList);
                }
                listItem.className = 'toc-h3';
                listItem.appendChild(link);
                subList.appendChild(listItem);
            } else if (heading.tagName === 'H4' && currentH3) {
                let subSubList = currentH3.querySelector('ul');
                if (!subSubList) {
                    subSubList = document.createElement('ul');
                    currentH3.appendChild(subSubList);
                }
                listItem.className = 'toc-h4';
                listItem.appendChild(link);
                subSubList.appendChild(listItem);
            }
        });

        // Insert TOC after doc-header or at the beginning of doc-content
        const docHeader = document.querySelector('.doc-header');
        if (docHeader) {
            docHeader.insertAdjacentElement('afterend', toc);
        } else {
            docContent.insertBefore(toc, docContent.firstChild);
        }

        // Highlight active TOC item on scroll
        highlightActiveTOCItem();
    }
    
    // ============================================
    // TOC SCROLL SPY - Enhanced
    // ============================================
    function initTOCScrollSpy() {
        const tocLinks = document.querySelectorAll('.toc a');
        const sections = document.querySelectorAll('h2[id], h3[id], h4[id]');

        let ticking = false;
        let currentActive = null;

        function updateActiveTOC() {
            const scrollY = window.pageYOffset;
            const offset = 200;

            let currentId = '';
            let currentElement = null;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - offset;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    if (!currentElement || sectionTop > currentElement.offsetTop) {
                        currentId = sectionId;
                        currentElement = section;
                    }
                }
            });

            // Update active states
            if (currentId !== currentActive) {
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');
                    if (href && href === `#${currentId}`) {
                        link.classList.add('active');
                        
                        // Scroll TOC item into view if needed
                        const toc = link.closest('.toc');
                        if (toc) {
                            const tocRect = toc.getBoundingClientRect();
                            const linkRect = link.getBoundingClientRect();
                            
                            if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
                                link.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest'
                                });
                            }
                        }
                    }
                });
                currentActive = currentId;
            }

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateActiveTOC);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateActiveTOC();
    }

    // ============================================
    // ACTIVE SECTION HIGHLIGHT
    // ============================================
    function initActiveSectionHighlight() {
        const sections = document.querySelectorAll('section[id], h2[id], h3[id]');
        const navLinks = document.querySelectorAll('.nav-menu a, .toc a');

        let ticking = false;

        function updateActiveSection() {
            const scrollY = window.pageYOffset;
            const offset = 150;

            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - offset;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentSection = sectionId;
                }
            });

            // Update active states
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const targetId = href.substring(1);
                    if (targetId === currentSection) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateActiveSection);
                ticking = true;
            }
        });

        // Initial call
        updateActiveSection();
    }

    function highlightActiveTOCItem() {
        // This function is now handled by initTOCScrollSpy
        // Keeping for backward compatibility
        initTOCScrollSpy();
    }

    // ============================================
    // CODE BLOCKS
    // ============================================
    function initCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach((block, index) => {
            const pre = block.parentElement;
            if (!pre) return;

            // Make pre relative for button positioning
            pre.style.position = 'relative';
            pre.style.paddingTop = '3rem';

            // Create copy button
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.innerHTML = '<i class="fas fa-copy"></i> <span>Copier</span>';
            button.title = 'Copier le code';
            button.setAttribute('aria-label', 'Copier le code');
            
            pre.appendChild(button);
            
            button.addEventListener('click', async function() {
                const codeText = block.textContent;
                
                try {
                    await navigator.clipboard.writeText(codeText);
                    
                    // Visual feedback
                    button.innerHTML = '<i class="fas fa-check"></i> <span>Copié!</span>';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i> <span>Copier</span>';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = codeText;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        button.innerHTML = '<i class="fas fa-check"></i> <span>Copié!</span>';
                        button.classList.add('copied');
                        setTimeout(() => {
                            button.innerHTML = '<i class="fas fa-copy"></i> <span>Copier</span>';
                            button.classList.remove('copied');
                        }, 2000);
                    } catch (fallbackErr) {
                        button.innerHTML = '<i class="fas fa-times"></i> <span>Erreur</span>';
                        setTimeout(() => {
                            button.innerHTML = '<i class="fas fa-copy"></i> <span>Copier</span>';
                        }, 2000);
                    }
                    
                    document.body.removeChild(textArea);
                }
            });
        });
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    function initSearch() {
        // Create search container if it doesn't exist
        let searchContainer = document.querySelector('.search-container');
        const docContent = document.querySelector('.doc-content');
        
        if (!searchContainer && docContent) {
            searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
                <i class="fas fa-search search-icon"></i>
                <input type="text" 
                       id="search-input" 
                       class="search-input" 
                       placeholder="Rechercher dans la documentation...">
            `;
            
            const docHeader = document.querySelector('.doc-header');
            if (docHeader) {
                docHeader.insertAdjacentElement('afterend', searchContainer);
            } else {
                docContent.insertBefore(searchContainer, docContent.firstChild);
            }
        }

        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        let searchResults = [];

        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value.trim().toLowerCase();

            if (searchTerm.length < 2) {
                clearHighlights();
                return;
            }

            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 300);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearHighlights();
            }
        });

        function performSearch(term) {
            clearHighlights();
            searchResults = [];

            if (!docContent) return;

            // Search in headings
            const headings = docContent.querySelectorAll('h2, h3, h4, h5');
            headings.forEach(heading => {
                const text = heading.textContent.toLowerCase();
                if (text.includes(term)) {
                    searchResults.push({
                        element: heading,
                        type: 'heading'
                    });
                    highlightText(heading, term);
                }
            });

            // Search in paragraphs
            const paragraphs = docContent.querySelectorAll('p, li');
            paragraphs.forEach(para => {
                const text = para.textContent.toLowerCase();
                if (text.includes(term)) {
                    searchResults.push({
                        element: para,
                        type: 'content'
                    });
                    highlightText(para, term);
                }
            });

            // Scroll to first result
            if (searchResults.length > 0) {
                const firstResult = searchResults[0].element;
                firstResult.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        function highlightText(element, term) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const regex = new RegExp(`(${term})`, 'gi');
                if (regex.test(text)) {
                    const highlightedText = text.replace(regex, '<mark class="highlight">$1</mark>');
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = highlightedText;
                    textNode.parentNode.replaceChild(wrapper, textNode);
                }
            });
        }

        function clearHighlights() {
            const highlights = docContent.querySelectorAll('.highlight, mark.highlight');
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            });
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    function initAnimations() {
        // Fade in cards on load
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe sections
            document.querySelectorAll('section, .card, .doc-content h2, .doc-content h3').forEach(el => {
                observer.observe(el);
            });
        }
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
        }
    });

    // ============================================
    // PRINT OPTIMIZATION
    // ============================================
    window.addEventListener('beforeprint', function() {
        // Expand all code blocks for printing
        document.querySelectorAll('pre').forEach(pre => {
            pre.style.maxHeight = 'none';
            pre.style.overflow = 'visible';
        });
    });

    // ============================================
    // PERFORMANCE: Debounce function
    // ============================================
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

    // ============================================
    // UTILITY: Get element offset
    // ============================================
    function getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

})();
