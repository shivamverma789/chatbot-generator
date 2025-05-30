// Register Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Password toggle functionality
  const passwordToggle = document.getElementById("passwordToggle")
  const passwordInput = document.getElementById("password")
  const toggleIcon = passwordToggle.querySelector(".toggle-icon")

  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    // Toggle icon
    toggleIcon.textContent = type === "password" ? "👁️" : "🙈"
  })

  // Password strength meter
  const password = document.getElementById("password")
  const confirmPassword = document.getElementById("confirmPassword")
  const strengthMeter = document.querySelectorAll(".strength-segment")
  const strengthText = document.querySelector(".strength-text")

  password.addEventListener("input", () => {
    const val = password.value
    const result = calculatePasswordStrength(val)

    // Reset all segments
    strengthMeter.forEach(segment => {
      segment.className = "strength-segment"
    })

    // Update strength meter based on score
    if (val.length > 0) {
      for (let i = 0; i < result.score; i++) {
        if (result.score === 1) {
          strengthMeter[i].classList.add("weak")
        } else if (result.score <= 3) {
          strengthMeter[i].classList.add("medium")
        } else {
          strengthMeter[i].classList.add("strong")
        }
      }
      strengthText.textContent = result.message
    } else {
      strengthText.textContent = "Password strength"
    }
  })

  // Calculate password strength
  function calculatePasswordStrength(password) {
    let score = 0
    let message = ""

    // Length check
    if (password.length > 8) {
      score += 1
    }

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Determine message based on score
    if (score === 0 || password.length < 6) {
      message = "Too weak"
      score = 1
    } else if (score === 1) {
      message = "Weak"
    } else if (score === 2) {
      message = "Medium"
    } else if (score === 3) {
      message = "Strong"
    } else {
      message = "Very strong"
    }

    return { score, message }
  }

  // Password match validation
  confirmPassword.addEventListener("input", () => {
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords don't match")
    } else {
      confirmPassword.setCustomValidity("")
    }
  })

  // Form submission handling
  const registerForm = document.getElementById("registerForm")
  const registerButton = document.getElementById("registerButton")
  const buttonText = registerButton.querySelector(".button-text")

  registerForm.addEventListener("submit", (e) => {
    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      e.preventDefault()
      showFieldError(confirmPassword, "Passwords don't match")
      return
    }

    // Add loading state
    registerButton.disabled = true
    registerButton.classList.add("loading")
    buttonText.textContent = "Creating Account..."

    // Add spinner
    const spinner = document.createElement("div")
    spinner.className = "spinner"
    spinner.innerHTML = "⟳"
    spinner.style.cssText = `
            display: inline-block;
            margin-left: 0.5rem;
            animation: spin 1s linear infinite;
        `
    buttonText.appendChild(spinner)

    // Note: Remove this timeout in production - let the form submit naturally
    // This is just for demo purposes
    setTimeout(() => {
      registerButton.disabled = false
      registerButton.classList.remove("loading")
      buttonText.textContent = "Create Account"
      if (spinner.parentNode) {
        spinner.remove()
      }
    }, 2000)
  })

  // Add CSS for spinner animation
  const style = document.createElement("style")
  style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .register-button.loading {
            opacity: 0.8;
            cursor: not-allowed;
        }
    `
  document.head.appendChild(style)

  // Social login buttons
  const googleBtn = document.querySelector(".google-btn")
  const githubBtn = document.querySelector(".github-btn")

  googleBtn.addEventListener("click", () => {
    // Handle Google login
    console.log("Google login clicked")
    // window.location.href = '/auth/google';
  })

  githubBtn.addEventListener("click", () => {
    // Handle GitHub login
    console.log("GitHub login clicked")
    // window.location.href = '/auth/github';
  })

  // Form validation
  const emailInput = document.getElementById("email")
  const firstNameInput = document.getElementById("firstName")
  const lastNameInput = document.getElementById("lastName")

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function showFieldError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }

    // Add new error
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.textContent = message
    errorDiv.style.cssText = `
            color: var(--bot-error);
            font-size: 0.75rem;
            margin-top: 0.25rem;
            animation: shake 0.5s ease;
        `
    field.parentNode.appendChild(errorDiv)

    // Add shake animation
    field.style.animation = "shake 0.5s ease"
    setTimeout(() => {
      field.style.animation = ""
    }, 500)
  }

  function clearFieldError(field) {
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }
  }

  // Real-time validation
  emailInput.addEventListener("blur", function () {
    if (this.value && !validateEmail(this.value)) {
      showFieldError(this, "Please enter a valid email address")
    } else {
      clearFieldError(this)
    }
  })

  password.addEventListener("blur", function () {
    if (this.value && this.value.length < 6) {
      showFieldError(this, "Password must be at least 6 characters")
    } else {
      clearFieldError(this)
    }
  })

  confirmPassword.addEventListener("blur", function () {
    if (this.value && this.value !== password.value) {
      showFieldError(this, "Passwords don't match")
    } else {
      clearFieldError(this)
    }
  })

  // Clear errors on input
  const inputs = [emailInput, password, confirmPassword, firstNameInput, lastNameInput]
  inputs.forEach(input => {
    input.addEventListener("input", function () {
      clearFieldError(this)
    })
  })

  // Add shake animation CSS
  const shakeStyle = document.createElement("style")
  shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `
  document.head.appendChild(shakeStyle)
})