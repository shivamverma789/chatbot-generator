document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  initializeNavbar()
  initializeFormAnimations()
  initializeFormValidation()
  initializeInteractiveElements()
})

function initializeNavbar() {
  const hamburger = document.getElementById("hamburger")
  const mobileMenu = document.getElementById("mobileMenu")

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      mobileMenu.classList.toggle("active")
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove("active")
        mobileMenu.classList.remove("active")
      }
    })

    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll("a")
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        mobileMenu.classList.remove("active")
      })
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        hamburger.classList.remove("active")
        mobileMenu.classList.remove("active")
      }
    })
  }

  // Set active navigation item based on current page
  setActiveNavItem()
}

function setActiveNavItem() {
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll(".navbar-nav a, .mobile-menu a")

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active")
    }
  })
}

function initializeFormAnimations() {
  // Animate form groups on load
  const formGroups = document.querySelectorAll(".bot-form-group")

  formGroups.forEach((group, index) => {
    setTimeout(
      () => {
        group.classList.add("visible")
      },
      100 + index * 150,
    )
  })

  // Add floating animation to the bot icon
  const botIcon = document.querySelector(".bot-icon")
  if (botIcon) {
    botIcon.addEventListener("mouseenter", () => {
      botIcon.style.animation = "none"
      botIcon.style.transform = "scale(1.1) rotate(10deg)"
    })

    botIcon.addEventListener("mouseleave", () => {
      botIcon.style.animation = "bot-float 3s ease-in-out infinite"
      botIcon.style.transform = ""
    })
  }
}

function initializeFormValidation() {
  const botForm = document.getElementById("botCreatorForm")
  const nameInput = document.getElementById("name")
  const toneInput = document.getElementById("tone")
  const typeSelect = document.getElementById("type")

  if (!botForm) return

  // Real-time validation
  nameInput.addEventListener("blur", () => validateField(nameInput, "Bot name is required"))
  toneInput.addEventListener("blur", () => validateField(toneInput, "Tone/Personality is required"))

  // Form submission
  botForm.addEventListener("submit", (e) => {
    e.preventDefault()

    let isValid = true

    // Validate required fields
    if (!validateField(nameInput, "Bot name is required")) {
      isValid = false
    }

    if (!validateField(toneInput, "Tone/Personality is required")) {
      isValid = false
    }

    // Additional validation rules
    if (nameInput.value.trim().length < 3) {
      showError(nameInput, "Bot name must be at least 3 characters long")
      isValid = false
    }

    if (toneInput.value.trim().length < 3) {
      showError(toneInput, "Tone description must be at least 3 characters long")
      isValid = false
    }

    if (isValid) {
      submitForm(botForm)
    } else {
      // Scroll to first error
      const firstError = document.querySelector(".bot-error-message")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  })
}

function validateField(input, errorMessage) {
  const value = input.value.trim()

  if (value === "") {
    showError(input, errorMessage)
    return false
  } else {
    removeError(input)
    showSuccess(input)
    return true
  }
}

function showError(input, message) {
  const formGroup = input.parentElement
  removeMessages(formGroup)

  const errorElement = document.createElement("div")
  errorElement.className = "bot-error-message"
  errorElement.textContent = message
  formGroup.appendChild(errorElement)

  input.style.borderColor = "var(--bot-error)"
  input.style.boxShadow = "0 0 0 3px rgba(239, 69, 101, 0.15)"
}

function showSuccess(input) {
  const formGroup = input.parentElement
  removeMessages(formGroup)

  input.style.borderColor = "var(--bot-success)"
  input.style.boxShadow = "0 0 0 3px rgba(44, 182, 125, 0.15)"
}

function removeError(input) {
  const formGroup = input.parentElement
  removeMessages(formGroup)

  input.style.borderColor = ""
  input.style.boxShadow = ""
}

function removeMessages(formGroup) {
  const existingMessages = formGroup.querySelectorAll(".bot-error-message, .bot-success-message")
  existingMessages.forEach((msg) => msg.remove())
}

function submitForm(form) {
  const submitBtn = form.querySelector(".bot-submit-button")
  const originalText = submitBtn.innerHTML

  // Show loading state
  submitBtn.classList.add("loading")
  submitBtn.disabled = true
  submitBtn.innerHTML = `
    <span>Creating Bot...</span>
    <div class="button-glow-effect"></div>
  `

  // Simulate form submission delay
  setTimeout(() => {
    // In a real application, you would submit the form here
    // For now, we'll just reset the button after 2 seconds
    form.submit()
  }, 1000)

  // Reset button after timeout (fallback)
  setTimeout(() => {
    if (submitBtn.disabled) {
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false
      submitBtn.innerHTML = originalText
    }
  }, 5000)
}

function initializeInteractiveElements() {
  // Input focus effects
  const inputs = document.querySelectorAll(".bot-input, .bot-select")
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("input-focused")
      removeError(this)
    })

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("input-focused")
    })
  })

  // Type selection effects
  const typeSelect = document.getElementById("type")
  if (typeSelect) {
    typeSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex].value

      // Reset styles
      this.style.borderColor = ""
      this.style.boxShadow = ""

      // Add visual feedback based on selection
      switch (selectedOption) {
        case "image_analyzer":
          this.style.borderColor = "var(--bot-success)"
          this.style.boxShadow = "0 0 0 3px rgba(44, 182, 125, 0.15)"
          break
        case "document_bot":
          this.style.borderColor = "#ff8906"
          this.style.boxShadow = "0 0 0 3px rgba(255, 137, 6, 0.15)"
          break
        default:
          this.style.borderColor = "var(--bot-accent)"
          this.style.boxShadow = "0 0 0 3px rgba(127, 90, 240, 0.15)"
      }

      // Add a subtle animation
      this.style.transform = "scale(1.02)"
      setTimeout(() => {
        this.style.transform = ""
      }, 200)
    })
  }

  // Radio button animations
  const radioContainers = document.querySelectorAll(".bot-radio-container")
  radioContainers.forEach((container) => {
    container.addEventListener("click", function () {
      // Add ripple effect
      const ripple = document.createElement("div")
      ripple.style.position = "absolute"
      ripple.style.borderRadius = "50%"
      ripple.style.background = "rgba(127, 90, 240, 0.3)"
      ripple.style.transform = "scale(0)"
      ripple.style.animation = "ripple 0.6s linear"
      ripple.style.left = "10px"
      ripple.style.top = "10px"
      ripple.style.width = "20px"
      ripple.style.height = "20px"

      this.style.position = "relative"
      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })

  // Add ripple animation CSS
  const style = document.createElement("style")
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}

// Utility function to show notifications
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `

  switch (type) {
    case "success":
      notification.style.background = "var(--bot-success)"
      break
    case "error":
      notification.style.background = "var(--bot-error)"
      break
    default:
      notification.style.background = "var(--bot-accent)"
  }

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}
