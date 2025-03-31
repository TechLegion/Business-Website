// script.js
function showContactForm() {
    document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
}
// Function to reveal services on scroll
function revealServices() {
    let services = document.querySelectorAll('.service-card');
    let windowHeight = window.innerHeight;

    services.forEach(service => {
        let position = service.getBoundingClientRect().top;
        if (position < windowHeight - 100) {
            service.classList.add('reveal');
        }
    });
}

// Listen for scroll events
window.addEventListener('scroll', revealServices);

// Initial check in case the section is already visible
revealServices();
// Function to reveal the contact form on scroll
function revealContact() {
    let contactForm = document.querySelector('.contact-form');
    let windowHeight = window.innerHeight;
    let position = contactForm.getBoundingClientRect().top;

    if (position < windowHeight - 100) {
        contactForm.classList.add('reveal');
    }
}

// Listen for scroll events
window.addEventListener('scroll', revealContact);

// Initial check in case the section is already visible
revealContact();

function openChatbot() {
    alert("Chatbot feature coming soon! 😊");
}

// Apply fade-in effect when scrolling
document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    });

    elements.forEach(element => observer.observe(element));
});
// Smooth Scroll for Navbar Links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});