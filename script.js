// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // Here you would normally send this data to a server
        // For now, we'll just show a success message
        alert(`Thank you ${name}! Your message has been received. We'll get back to you soon at ${email}.`);
        
        // Reset form
        contactForm.reset();
    });
}

// Review Form Submission
const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const reviewName = document.getElementById('reviewName').value;
        const rating = document.getElementById('rating').value;
        const reviewMessage = document.getElementById('reviewMessage').value;

        // Here you would normally send this data to a server
        // For now, we'll just show a success message
        alert(`Thank you ${reviewName}! Your ${rating}-star review has been submitted. We appreciate your feedback!`);
        
        // Reset form
        reviewForm.reset();
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add fade-in animation on scroll
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

// Observe elements for fade-in effect
document.querySelectorAll('.dish-card, .step, .info-card, .value-card, .review-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Menu Search Functionality
const menuSearch = document.getElementById('menuSearch');

if (menuSearch) {
    menuSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const dishName = item.querySelector('h4').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (dishName.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
                item.style.animation = 'fadeIn 0.3s ease';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide category headers if all items are hidden
        document.querySelectorAll('.menu-category').forEach(category => {
            const visibleItems = category.querySelectorAll('.menu-item[style*="display: flex"]');
            if (visibleItems.length === 0 && searchTerm !== '') {
                category.style.display = 'none';
            } else {
                category.style.display = 'block';
            }
        });
    });
}