document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Mobile Menu Toggle
    // -------------------------------------------------------------
    const mobileMenuBtn = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a');
    const headerCta = document.querySelector('.header-cta');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            let icon = mobileMenuBtn.querySelector('i');
            
            if (isActive) {
                navMenu.classList.remove('active');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                navMenu.style.height = '0';
                
                if (headerCta) {
                    setTimeout(() => { headerCta.style.display = 'none'; }, 200);
                }
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                
                if (window.innerWidth <= 1024 && headerCta) { 
                    headerCta.style.display = 'flex'; 
                    navMenu.appendChild(headerCta); 
                }
                
                navMenu.classList.add('active');
                navMenu.style.height = 'calc(100vh - 76px)';
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navMenu.style.height = '0';
                
                if (mobileMenuBtn) {
                    let icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                
                if (headerCta) {
                    setTimeout(() => { headerCta.style.display = 'none'; }, 200);
                }
            }
        });
    });

    // -------------------------------------------------------------
    // Sticky Header & Scroll Reveal Animations
    // -------------------------------------------------------------
    const header = document.querySelector('header');
    const reveals = document.querySelectorAll('.reveal');
    
    function checkScroll() {
        // Header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Reveal animations
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Init on load


    // -------------------------------------------------------------
    // Review Carousel Auto-Slide
    // -------------------------------------------------------------
    const sliderWrapper = document.querySelector('.review-slider-wrapper');
    if (sliderWrapper) {
        const slides = sliderWrapper.querySelectorAll('.review-slide');
        let currentIndex = 0;
        let slideInterval;
        
        // Initial Active Class
        if(slides.length > 0) slides[0].classList.add('is-active');

        function updateSliderActiveState() {
           slides.forEach((slide, index) => {
               if(index === currentIndex) {
                   slide.classList.add('is-active');
               } else {
                   slide.classList.remove('is-active');
               }
           });
        }

        function scrollToSlide(index) {
            if(slides.length === 0) return;
            // Loop logic
            if(index >= slides.length) {
                index = 0;
                // Instant scroll back to 0 looks visually bad if we don't have infinite loop setup,
                // but for simple layout it's expected.
            } else if (index < 0) {
                index = slides.length - 1;
            }
            
            currentIndex = index;
            updateSliderActiveState();
            
            const targetSlide = slides[currentIndex];
            sliderWrapper.scrollTo({
               left: targetSlide.offsetLeft - sliderWrapper.offsetLeft - 20,
               behavior: 'smooth'
            });
        }

        function startAutoSlide() {
            slideInterval = setInterval(() => {
                scrollToSlide(currentIndex + 1);
            }, 5000); // 5 seconds
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        // Handle manual swipe/scroll interactions pausing auto-slide
        sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
        sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        sliderWrapper.addEventListener('touchstart', stopAutoSlide);
        sliderWrapper.addEventListener('touchend', startAutoSlide);
        
        // Update active class based on manual scroll position
        sliderWrapper.addEventListener('scroll', () => {
            const wrapperCenter = sliderWrapper.offsetWidth / 2;
            let closestSlideIndex = 0;
            let minDistance = Infinity;

            slides.forEach((slide, index) => {
                const slideCenter = slide.offsetLeft - sliderWrapper.scrollLeft + (slide.offsetWidth / 2);
                const distance = Math.abs(wrapperCenter - slideCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSlideIndex = index;
                }
            });

            if(closestSlideIndex !== currentIndex) {
                currentIndex = closestSlideIndex;
                updateSliderActiveState();
            }
        });

        startAutoSlide();
    }


    // -------------------------------------------------------------
    // Custom Multi-Select Dropdown Logic
    // -------------------------------------------------------------
    const multiSelectContainers = document.querySelectorAll('.multi-select-container');

    multiSelectContainers.forEach(container => {
        const display = container.querySelector('.multi-select-display');
        const dropdown = container.querySelector('.multi-select-dropdown');
        const options = container.querySelectorAll('.ms-option');
        const realInput = container.querySelector('input[type="hidden"]'); // stores comma separated values
        
        let selectedOptions = [];

        // Toggle dropdown open/close
        display.addEventListener('click', (e) => {
            if(!e.target.closest('.remove-tag')) { // Prevents opening if clicking X on a tag
                container.classList.toggle('open');
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if(!container.contains(e.target)) {
                container.classList.remove('open');
            }
        });

        // Handle Selection
        options.forEach(option => {
             option.addEventListener('click', () => {
                 const checkbox = option.querySelector('.ms-checkbox');
                 const value = option.getAttribute('data-value');
                 
                 checkbox.checked = !checkbox.checked; // Toggle check
                 
                 if(checkbox.checked) {
                     // Add to selected array if not exists
                     if(!selectedOptions.includes(value)) {
                         selectedOptions.push(value);
                     }
                 } else {
                     // Remove from selected array
                     selectedOptions = selectedOptions.filter(item => item !== value);
                 }
                 
                 updateDisplay();
             });
        });

        function updateDisplay() {
            // Clear current display content
            display.innerHTML = '';
            
            if(selectedOptions.length === 0) {
               display.innerHTML = '<span class="multi-select-placeholder">Select category...</span>';
               if(realInput) realInput.value = '';
               return;
            }

            // Create Tags
            selectedOptions.forEach(val => {
                const tag = document.createElement('span');
                tag.className = 'selected-tag';
                tag.innerHTML = `${val} <i class="fa-solid fa-xmark remove-tag" data-val="${val}"></i>`;
                display.appendChild(tag);
            });

            // Update Real Input for form submission
            if(realInput) realInput.value = selectedOptions.join(', ');

            // Attach Remove Handlers to new tags
            const removeButtons = display.querySelectorAll('.remove-tag');
            removeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent opening dropdown
                    const valToRemove = btn.getAttribute('data-val');
                    
                    // Uncheck corresponding checkbox in dropdown
                    const optionToUncheck = container.querySelector(`.ms-option[data-value="${valToRemove}"] .ms-checkbox`);
                    if(optionToUncheck) optionToUncheck.checked = false;

                    // Remove from array and update display
                    selectedOptions = selectedOptions.filter(item => item !== valToRemove);
                    updateDisplay();
                });
            });
        }
    });

    // -------------------------------------------------------------
    // Handle WhatsApp Forms Submission
    // -------------------------------------------------------------
    const waForms = document.querySelectorAll('.wa-form');
    
    waForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect fields (handle multi-select inputs gracefully if present)
            const name = form.querySelector('[name="patientName"]')?.value || '';
            const age = form.querySelector('[name="age"]')?.value || '';
            const gender = form.querySelector('[name="gender"]')?.value || '';
            const mobile = form.querySelector('[name="mobile"]')?.value || '';
            const address = form.querySelector('[name="address"]')?.value || '';
            
            // Handles both standard select AND custom hidden input from multi-select
            const service = form.querySelector('[name="service"]')?.value || ''; 
            
            const date = form.querySelector('[name="date"]')?.value || '';
            const time = form.querySelector('[name="time"]')?.value || '';
            const message = form.querySelector('[name="message"]')?.value || '';
            
            const waNumber = "917780315365"; 
            
            // Ensure service is selected if mandatory
            if(form.querySelector('.multi-select-container') && service.trim() === '') {
                alert("Please select at least one service category.");
                return;
            }

            // Format WhatsApp Message
            let waText = `*New Booking Request - Keerthi Clinical Laboratory*%0A`;
            waText += `-----------------------------------%0A`;
            waText += `*Patient Name:* ${name}%0A`;
            waText += `*Age/Gender:* ${age} / ${gender}%0A`;
            waText += `*Mobile:* ${mobile}%0A`;
            waText += `*Address:* ${address}%0A`;
            waText += `*Services Required:* ${service}%0A`; // Multiple handles nicely as csv string
            waText += `*Date:* ${date}%0A`;
            
            if (time) waText += `*Time Preference:* ${time}%0A`;
            
            if (message && message.trim() !== '') {
                waText += `*Additional Notes:* ${message}%0A`;
            }
            
            // Redirect to WhatsApp
            const waLink = `https://wa.me/${waNumber}?text=${waText}`;
            window.open(waLink, '_blank');
        });
    });
});
