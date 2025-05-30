document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  initializeNavbar()
  initializeFilters()
  initializeAnimations()
  initializeLoadMore()
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

function initializeFilters() {
  const searchInput = document.getElementById("searchInput")
  const typeFilter = document.getElementById("typeFilter")
  const sortFilter = document.getElementById("sortFilter")
  const botsGrid = document.getElementById("botsGrid")

  if (!searchInput || !typeFilter || !sortFilter || !botsGrid) return

  // Search functionality
  searchInput.addEventListener("input", debounce(filterBots, 300))

  // Filter functionality
  typeFilter.addEventListener("change", filterBots)
  sortFilter.addEventListener("change", sortBots)

  function filterBots() {
    const searchTerm = searchInput.value.toLowerCase().trim()
    const selectedType = typeFilter.value
    const botCards = botsGrid.querySelectorAll(".bot-card")

    botCards.forEach((card) => {
      const botName = card.dataset.name || ""
      const botType = card.dataset.type || ""
      const botDescription = card.querySelector(".bot-description")?.textContent.toLowerCase() || ""

      const matchesSearch = searchTerm === "" || botName.includes(searchTerm) || botDescription.includes(searchTerm)

      const matchesType = selectedType === "" || botType === selectedType

      if (matchesSearch && matchesType) {
        card.classList.remove("hidden")
        card.style.animation = "card-fade-in 0.6s ease forwards"
      } else {
        card.classList.add("hidden")
      }
    })

    // Show/hide no results message
    updateNoResultsMessage()
  }

  function sortBots() {
    const sortValue = sortFilter.value
    const botCards = Array.from(botsGrid.querySelectorAll(".bot-card"))

    botCards.sort((a, b) => {
      switch (sortValue) {
        case "newest":
          return new Date(b.dataset.created) - new Date(a.dataset.created)
        case "oldest":
          return new Date(a.dataset.created) - new Date(b.dataset.created)
        case "name":
          return (a.dataset.name || "").localeCompare(b.dataset.name || "")
        default:
          return 0
      }
    })

    // Re-append sorted cards
    botCards.forEach((card) => {
      botsGrid.appendChild(card)
    })

    // Re-animate cards
    botCards.forEach((card, index) => {
      if (!card.classList.contains("hidden")) {
        card.style.animation = "none"
        card.style.opacity = "0"
        card.style.transform = "translateY(20px)"

        setTimeout(() => {
          card.style.animation = "card-fade-in 0.6s ease forwards"
        }, index * 100)
      }
    })
  }

  function updateNoResultsMessage() {
    const visibleCards = botsGrid.querySelectorAll(".bot-card:not(.hidden)")
    const existingMessage = botsGrid.querySelector(".no-results")

    if (visibleCards.length === 0 && !botsGrid.querySelector(".no-bots")) {
      if (!existingMessage) {
        const noResultsDiv = document.createElement("div")
        noResultsDiv.className = "no-results"
        noResultsDiv.style.gridColumn = "1 / -1"
        noResultsDiv.style.textAlign = "center"
        noResultsDiv.style.padding = "3rem 2rem"
        noResultsDiv.style.color = "var(--explore-text-secondary)"
        noResultsDiv.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.7;">🔍</div>
          <h3 style="color: var(--explore-text-primary); margin-bottom: 0.5rem;">No Bots Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        `
        botsGrid.appendChild(noResultsDiv)
      }
    } else if (existingMessage) {
      existingMessage.remove()
    }
  }
}

function initializeAnimations() {
  // Animate cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "card-fade-in 0.6s ease forwards"
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe all bot cards
  const botCards = document.querySelectorAll(".bot-card")
  botCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
    observer.observe(card)
  })

  // Add hover effects to chat buttons
  const chatButtons = document.querySelectorAll(".chat-btn")
  chatButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-2px) scale(1.05)"
    })

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0) scale(1)"
    })
  })

  // Add click ripple effect to cards
  const cards = document.querySelectorAll(".bot-card")
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking on a button or link
      if (e.target.closest(".chat-btn")) return

      const ripple = document.createElement("div")
      const rect = card.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(127, 90, 240, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
      `

      card.style.position = "relative"
      card.appendChild(ripple)

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

function initializeLoadMore() {
  const loadMoreBtn = document.getElementById("loadMoreBtn")

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      // Simulate loading more bots
      loadMoreBtn.disabled = true
      loadMoreBtn.innerHTML = `
        <span>Loading...</span>
        <div class="btn-glow"></div>
      `

      // In a real application, you would make an AJAX request here
      setTimeout(() => {
        loadMoreBtn.disabled = false
        loadMoreBtn.innerHTML = `
          <span>Load More Bots</span>
          <div class="btn-glow"></div>
        `

        // Show notification
        showNotification("More bots loaded!", "success")
      }, 2000)
    })
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

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
      notification.style.background = "var(--explore-success)"
      break
    case "error":
      notification.style.background = "var(--explore-error)"
      break
    default:
      notification.style.background = "var(--explore-accent)"
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

// Initialize tooltips for bot features
function initializeTooltips() {
  const featureTags = document.querySelectorAll(".feature-tag")

  featureTags.forEach((tag) => {
    tag.addEventListener("mouseenter", (e) => {
      const tooltip = document.createElement("div")
      tooltip.className = "tooltip"
      tooltip.textContent = `Feature: ${tag.textContent}`
      tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
      `

      document.body.appendChild(tooltip)

      const rect = tag.getBoundingClientRect()
      tooltip.style.left = rect.left + "px"
      tooltip.style.top = rect.bottom + 5 + "px"

      tag.addEventListener("mouseleave", () => {
        tooltip.remove()
      })
    })
  })
}

// Call tooltip initialization
setTimeout(initializeTooltips, 1000)
