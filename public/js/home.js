document.addEventListener("DOMContentLoaded", function() {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Typing animation for chat demo
  const typingMessage = document.querySelector('.typing');
  const chatMessages = document.querySelector('.chat-messages');
  
  setTimeout(() => {
    typingMessage.classList.remove('typing');
    
    const newMessage = document.createElement('div');
    newMessage.className = 'message bot-message';
    newMessage.innerHTML = `
      <div class="message-bubble">
        We offer flexible pricing plans starting at $0/month for our Free tier. 
        Our Pro plan at $29/month includes advanced features like AI capabilities and analytics.
        Would you like me to tell you more about what's included in each plan?
      </div>
    `;
    
    chatMessages.appendChild(newMessage);
    newMessage.scrollIntoView({ behavior: 'smooth' });
  }, 2000);

  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // Use cases slider functionality
  const slider = document.getElementById('useCasesSlider');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dotsContainer = document.getElementById('sliderDots');
  
  if (slider && prevBtn && nextBtn && dotsContainer) {
    const slides = slider.querySelectorAll('.use-case-card');
    let currentSlide = 0;
    let slideWidth = 0;
    let slidesToShow = 4;
    
    // Create dots
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'slider-dot';
      if (index === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        goToSlide(index);
      });
      
      dotsContainer.appendChild(dot);
    });
    
    // Update slidesToShow based on screen width
    function updateSlidesToShow() {
      if (window.innerWidth < 480) {
        slidesToShow = 1;
      } else if (window.innerWidth < 768) {
        slidesToShow = 1;
      } else if (window.innerWidth < 1024) {
        slidesToShow = 2;
      } else {
        slidesToShow = 4;
      }
      
      slideWidth = slider.offsetWidth / slidesToShow;
      updateSlider();
    }
    
    // Update slider position
    function updateSlider() {
      slider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      
      // Update dots
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }
    
    // Go to specific slide
    function goToSlide(index) {
      currentSlide = index;
      if (currentSlide < 0) {
        currentSlide = slides.length - slidesToShow;
      } else if (currentSlide > slides.length - slidesToShow) {
        currentSlide = 0;
      }
      updateSlider();
    }
    
    // Event listeners for buttons
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
    
    // Initialize slider
    updateSlidesToShow();
    
    // Update on resize
    window.addEventListener('resize', updateSlidesToShow);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile menu functionality
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }

  // Add parallax effect to hero section
  const heroSection = document.querySelector('.hero');
  
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition < window.innerHeight) {
        heroSection.style.backgroundPosition = `center ${scrollPosition * 0.4}px`;
      }
    });
  }

  // Add scroll-triggered animations for stats
  const stats = document.querySelectorAll('.stat-number');
  
  function animateStats() {
    stats.forEach(stat => {
      const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
      const suffix = stat.textContent.replace(/[0-9]/g, '');
      let current = 0;
      const increment = target / 50;
      const duration = 1500;
      const stepTime = duration / 50;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(counter);
        }
        stat.textContent = Math.floor(current) + suffix;
      }, stepTime);
    });
  }
  
  // Trigger stats animation when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  if (stats.length > 0) {
    observer.observe(document.querySelector('.hero-stats'));
  }
});