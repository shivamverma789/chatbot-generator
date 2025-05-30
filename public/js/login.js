document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  initializeNavbar()
  initializeForm()
  initializePasswordToggle()
  initializeAnimations()
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
}

function initializeForm() {
  const loginForm = document.getElementById("loginForm")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const loginButton = document.getElementById("loginButton")

  if (!loginForm) return

  // Real-time validation
  emailInput.addEventListener("blur", () => validateEmail(emailInput))
  passwordInput.addEventListener("blur", () => validatePassword(passwordInput))

  // Input focus effects
  const inputs = document.querySelectorAll(".form-input")
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("input-focused")
    })

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("input-focused")
    })
  })

  // Form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    let isValid = true

    // Validate email
    if (!validateEmail(emailInput)) {
      isValid = false
    }

    // Validate password
    if (!validatePassword(passwordInput)) {
      isValid = false
    }

    if (isValid) {
      submitForm(loginForm, loginButton)
    } else {
      // Scroll to first error
      const firstError = document.querySelector(".input-error")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  })

  // Social login buttons
  const socialButtons = document.querySelectorAll(".social-btn")
  socialButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const provider = this.classList.contains("google-btn") ? "google" : "github"
      handleSocialLogin(provider)
    })
  })
}

function validateEmail(input) {
  const email = input.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (email === "") {
    showInputError(input, "Email is required")
    return false
  } else if (!emailRegex.test(email)) {
    showInputError(input, "Please enter a valid email address")
    return false
  } else {
    removeInputError(input)
    showInputSuccess(input)
    return true
  }
}

function validatePassword(input) {
  const password = input.value

  if (password === "") {
    showInputError(input, "Password is required")
    return false
  } else if (password.length < 6) {
    showInputError(input, "Password must be at least 6 characters")
    return false
  } else {
    removeInputError(input)
    showInputSuccess(input)
    return true
  }
}

function showInputError(input, message) {
  const container = input.parentElement
  const formGroup = container.parentElement

  removeInputMessages(formGroup)

  const errorElement = document.createElement("div")
  errorElement.className = "input-error"
  errorElement.textContent = message
  errorElement.style.cssText = `
    color: var(--login-error);
    font-size: 0.85rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: rgba(239, 69, 101, 0.1);
    border-radius: 6px;
    border-left: 3px solid var(--login-error);
    animation: error-shake 0.5s ease;
  `

  formGroup.appendChild(errorElement)
  input.style.borderColor = "var(--login-error)"
  input.style.boxShadow = "0 0 0 3px rgba(239, 69, 101, 0.15)"
}

function showInputSuccess(input) {
  const container = input.parentElement
  const formGroup = container.parentElement

  removeInputMessages(formGroup)

  input.style.borderColor = "var(--login-success)"
  input.style.boxShadow = "0 0 0 3px rgba(44, 182, 125, 0.15)"
}

function removeInputError(input) {
  const container = input.parentElement
  const formGroup = container.parentElement

  removeInputMessages(formGroup)

  input.style.borderColor = ""
  input.style.boxShadow = ""
}

function removeInputMessages(formGroup) {
  const existingMessages = formGroup.querySelectorAll(".input-error, .input-success")
  existingMessages.forEach((msg) => msg.remove())
}

function submitForm(form, button) {
  const originalText = button.innerHTML

  // Show loading state
  button.classList.add("loading")
  button.disabled = true
  button.innerHTML = `
    <span class="button-text">Signing In...</span>
    <div class="button-glow"></div>
  `

  // Simulate form submission delay
  setTimeout(() => {
    // In a real application, you would submit the form here
    form.submit()
  }, 1000)

  // Reset button after timeout (fallback)
  setTimeout(() => {
    if (button.disabled) {
      button.classList.remove("loading")
      button.disabled = false
      button.innerHTML = originalText
    }
  }, 5000)
}

function initializePasswordToggle() {
  const passwordToggle = document.getElementById("passwordToggle")
  const passwordInput = document.getElementById("password")

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      const icon = this.querySelector(".toggle-icon")
      icon.textContent = type === "password" ? "👁️" : "🙈"

      // Add animation
      this.style.transform = "scale(0.9)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  }
}

function handleSocialLogin(provider) {
  showNotification(`Redirecting to ${provider} login...`, "info")

  // In a real application, you would redirect to the OAuth provider
  setTimeout(() => {
    window.location.href = `/auth/${provider}`
  }, 1000)
}

function initializeAnimations() {
  // Add stagger animation to form groups
  const formGroups = document.querySelectorAll(".form-group")
  formGroups.forEach((group, index) => {
    group.style.animationDelay = `${0.2 + index * 0.2}s`
  })

  // Add hover effects to feature items
  const featureItems = document.querySelectorAll(".feature-item")
  featureItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(10px) scale(1.02)"
    })

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0) scale(1)"
    })
  })

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll(".login-button, .social-btn")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("div")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
      `

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
      notification.style.background = "var(--login-success)"
      break
    case "error":
      notification.style.background = "var(--login-error)"
      break
    default:
      notification.style.background = "var(--login-accent)"
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

// Handle form auto-fill detection
window.addEventListener("load", () => {
  const inputs = document.querySelectorAll(".form-input")
  inputs.forEach((input) => {
    if (input.value) {
      input.parentElement.classList.add("input-filled")
    }
  })
})
