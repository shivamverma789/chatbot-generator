document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const toggleSidebarBtn = document.getElementById("toggleSidebar")
  const chatSidebar = document.querySelector(".chat-sidebar")
  const chatForm = document.getElementById("chat-form")
  const userInput = document.getElementById("user-input")
  const chatMessages = document.getElementById("chat-messages")
  const typingIndicator = document.getElementById("typingIndicator")
  const messageStatus = document.getElementById("messageStatus")
  const rateBot = document.getElementById("rateBot")
  const ratingModal = document.getElementById("ratingModal")
  const closeModal = document.querySelector(".close-modal")
  const stars = document.querySelectorAll(".star")
  const submitRating = document.querySelector(".submit-rating")
  const clearChat = document.getElementById("clearChat")
  const saveChat = document.getElementById("saveChat")
  const exportChat = document.getElementById("exportChat")
  const refreshChat = document.getElementById("refreshChat")
  const promptButtons = document.querySelectorAll(".prompt-btn")
  const sendButton = document.querySelector(".send-button")

  // State management
  let isTyping = false
  let chatHistory = []
  let currentRating = 0
  let conversationId = generateConversationId()

  // Create sidebar backdrop for mobile
  const sidebarBackdrop = document.createElement("div")
  sidebarBackdrop.className = "sidebar-backdrop"
  document.body.appendChild(sidebarBackdrop)

  // Initialize chat
  init()

  function init() {
    setupEventListeners()
    loadChatHistory()
    updateSendButtonState()
    handleScreenSizeChange(window.matchMedia("(max-width: 768px)"))

    // Auto-focus input field
    userInput.focus()

    // Load bot information
    loadBotInfo()
  }

  function setupEventListeners() {
    // Sidebar toggle
    toggleSidebarBtn.addEventListener("click", toggleSidebar)
    sidebarBackdrop.addEventListener("click", toggleSidebar)

    // Form submission
    chatForm.addEventListener("submit", handleFormSubmit)

    // Input events
    userInput.addEventListener("input", handleInputChange)
    userInput.addEventListener("keydown", handleKeyDown)

    // Suggested prompts
    promptButtons.forEach((button) => {
      button.addEventListener("click", handlePromptClick)
    })

    // Chat actions
    clearChat.addEventListener("click", handleClearChat)
    saveChat.addEventListener("click", handleSaveChat)
    exportChat.addEventListener("click", handleExportChat)
    refreshChat.addEventListener("click", handleRefreshChat)

    // Rating modal
    rateBot.addEventListener("click", showRatingModal)
    closeModal.addEventListener("click", hideRatingModal)
    ratingModal.addEventListener("click", handleModalBackdropClick)
    submitRating.addEventListener("click", handleSubmitRating)

    // Star rating
    stars.forEach((star, index) => {
      star.addEventListener("click", () => setRating(index + 1))
      star.addEventListener("mouseenter", () => highlightStars(index + 1))
      star.addEventListener("mouseleave", () => highlightStars(currentRating))
    })

    // Screen size changes
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)")
    mobileMediaQuery.addListener(handleScreenSizeChange)

    // Hamburger menu
    const hamburger = document.getElementById("hamburger")
    const mobileMenu = document.getElementById("mobileMenu")
    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", toggleMobileMenu)
    }

    // Prevent form submission on empty input
    sendButton.addEventListener("click", (e) => {
      if (!userInput.value.trim()) {
        e.preventDefault()
        userInput.focus()
      }
    })

    // Auto-resize input on mobile
    if (window.innerWidth <= 768) {
      userInput.addEventListener("focus", () => {
        setTimeout(() => {
          scrollToBottom()
        }, 300)
      })
    }
  }

  // Sidebar functionality
  function toggleSidebar() {
    const isActive = chatSidebar.classList.toggle("active")
    sidebarBackdrop.classList.toggle("active", isActive)

    // Update toggle button icon
    const icon = toggleSidebarBtn.querySelector(".control-icon")
    icon.textContent = isActive ? "▶" : "◀"

    // Save sidebar state
    localStorage.setItem("sidebarOpen", isActive)
  }

  function handleScreenSizeChange(mediaQuery) {
    if (mediaQuery.matches) {
      // Mobile view - ensure sidebar is hidden initially
      chatSidebar.classList.remove("active")
      sidebarBackdrop.classList.remove("active")
      toggleSidebarBtn.querySelector(".control-icon").textContent = "◀"
    } else {
      // Desktop view - remove backdrop and restore sidebar state
      sidebarBackdrop.classList.remove("active")
      const savedState = localStorage.getItem("sidebarOpen")
      if (savedState === "true") {
        chatSidebar.classList.add("active")
      }
    }
  }

  // Form handling
  function handleFormSubmit(e) {
    e.preventDefault()
    const message = userInput.value.trim()

    if (message && !isTyping) {
      sendMessage(message)
    }
  }

  function handleInputChange() {
    updateSendButtonState()

    // Show typing indicator to bot (in a real app, this would notify the server)
    clearTimeout(window.typingTimeout)
    window.typingTimeout = setTimeout(() => {
      // User stopped typing
    }, 1000)
  }

  function handleKeyDown(e) {
    // Send message on Enter (but not Shift+Enter for line breaks)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleFormSubmit(e)
    }
  }

  function updateSendButtonState() {
    const hasText = userInput.value.trim().length > 0
    sendButton.disabled = !hasText || isTyping
    sendButton.style.opacity = sendButton.disabled ? "0.5" : "1"
  }

  // Message handling
  function sendMessage(message) {
    addUserMessage(message)
    userInput.value = ""
    updateSendButtonState()

    // Add to chat history
    chatHistory.push({
      type: "user",
      message: message,
      timestamp: new Date().toISOString(),
    })

    saveChatHistory()
    simulateBotResponse(message)
  }

  function addUserMessage(message) {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const messageDiv = document.createElement("div")
    messageDiv.className = "message message-user"
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">${escapeHtml(message)}</div>
        <span class="message-time">${timestamp}</span>
      </div>
      <div class="message-avatar">
        <span>👤</span>
      </div>
    `

    chatMessages.appendChild(messageDiv)
    scrollToBottom()
  }

  function addBotMessage(message, isTyping = false) {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const avatarEmoji = document.querySelector(".avatar-emoji").textContent

    const messageDiv = document.createElement("div")
    messageDiv.className = "message message-bot"

    if (isTyping) {
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <span>${avatarEmoji}</span>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `
    } else {
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <span>${avatarEmoji}</span>
        </div>
        <div class="message-content">
          <div class="message-bubble">${formatBotMessage(message)}</div>
          <span class="message-time">${timestamp}</span>
        </div>
      `
    }

    chatMessages.appendChild(messageDiv)
    scrollToBottom()
    return messageDiv
  }

  function simulateBotResponse(userMessage) {
    if (isTyping) return

    isTyping = true
    updateSendButtonState()

    // Show typing indicator
    const typingMessage = addBotMessage("", true)
    messageStatus.textContent = "Bot is typing..."

    // Simulate response time based on message complexity
    const responseTime = Math.min(3000, Math.max(1000, userMessage.length * 50))

    setTimeout(() => {
      // Remove typing indicator
      typingMessage.remove()

      // Generate and add bot response
      const botResponse = generateBotResponse(userMessage)
      addBotMessage(botResponse)

      // Add to chat history
      chatHistory.push({
        type: "bot",
        message: botResponse,
        timestamp: new Date().toISOString(),
      })

      saveChatHistory()

      isTyping = false
      updateSendButtonState()
      messageStatus.textContent = "Message delivered"

      // Clear status after 3 seconds
      setTimeout(() => {
        messageStatus.textContent = ""
      }, 3000)
    }, responseTime)
  }

  function generateBotResponse(userMessage) {
    const botName = document.querySelector(".bot-name").textContent
    const botType = document.querySelector(".detail-value").textContent
    const botTone = document.querySelectorAll(".detail-value")[1].textContent.toLowerCase()
    const botGoal = document.querySelectorAll(".detail-value")[2].textContent

    // Convert message to lowercase for pattern matching
    const msg = userMessage.toLowerCase()

    // Greeting responses
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      const greetings = [
        `Hello! I'm ${botName}, your ${botTone} ${botType.toLowerCase()} assistant. How can I help you today?`,
        `Hi there! Great to meet you. I'm here to provide ${botTone} assistance with ${botType.toLowerCase()} matters.`,
        `Hey! Welcome to our chat. I'm ${botName} and I'm excited to help you out.`,
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    // Help and capability responses
    if (msg.includes("help") || msg.includes("what can you do") || msg.includes("capabilities")) {
      return `I'm designed to help with ${botType.toLowerCase()} related questions and tasks. My goal is to ${botGoal.toLowerCase()}. I can provide information, answer questions, and assist you in a ${botTone} manner. What specific area would you like help with?`
    }

    // About responses
    if (msg.includes("about") || msg.includes("who are you") || msg.includes("tell me about yourself")) {
      return `I'm ${botName}, a ${botTone} ${botType.toLowerCase()} chatbot. My primary goal is to ${botGoal.toLowerCase()}. I'm here to make your experience as smooth and helpful as possible. Is there something specific you'd like to know about me or how I can assist you?`
    }

    // Thank you responses
    if (msg.includes("thank") || msg.includes("thanks")) {
      const thankResponses = [
        "You're very welcome! I'm glad I could help.",
        "Happy to assist! Is there anything else you need?",
        "My pleasure! Feel free to ask if you have more questions.",
        "You're welcome! That's what I'm here for.",
      ]
      return thankResponses[Math.floor(Math.random() * thankResponses.length)]
    }

    // Goodbye responses
    if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("see you")) {
      const goodbyes = [
        "Goodbye! It was great chatting with you. Feel free to come back anytime!",
        "See you later! Don't hesitate to reach out if you need more help.",
        "Take care! I'll be here whenever you need assistance.",
      ]
      return goodbyes[Math.floor(Math.random() * goodbyes.length)]
    }

    // Question responses
    if (msg.includes("?")) {
      const questionResponses = [
        `That's a great question! As a ${botTone} ${botType.toLowerCase()}, I'd be happy to help you with that.`,
        `I understand you're looking for information about that. Let me provide you with some helpful details.`,
        `Thanks for asking! Based on my knowledge in ${botType.toLowerCase()}, here's what I can tell you.`,
      ]
      return questionResponses[Math.floor(Math.random() * questionResponses.length)]
    }

    // Default responses based on bot type and tone
    const defaultResponses = {
      professional: [
        `I appreciate your message. As a ${botType.toLowerCase()} specialist, I'm here to provide you with accurate and helpful information.`,
        `Thank you for reaching out. I'm committed to helping you achieve your goals in a professional manner.`,
        `I understand your inquiry. Let me provide you with the most relevant information I can.`,
      ],
      friendly: [
        `Thanks for your message! I love helping people with ${botType.toLowerCase()} questions.`,
        `That's interesting! I'm always excited to chat about ${botType.toLowerCase()} topics.`,
        `Great to hear from you! I'm here to make your experience as pleasant as possible.`,
      ],
      casual: [
        `Hey, thanks for the message! I'm here to help out with whatever you need.`,
        `Cool! I'm always up for a good conversation about ${botType.toLowerCase()} stuff.`,
        `No worries! I'm here to make things easy for you.`,
      ],
      formal: [
        `I acknowledge your inquiry and am prepared to assist you with ${botType.toLowerCase()} matters.`,
        `Thank you for your communication. I shall endeavor to provide you with comprehensive assistance.`,
        `I am at your service for any ${botType.toLowerCase()} related questions or concerns.`,
      ],
      humorous: [
        `Ha! You know what they say about ${botType.toLowerCase()} - it's always an adventure! 😄`,
        `Well, that's a fun question! I promise to keep things light while still being helpful.`,
        `You've come to the right bot! I like to think I'm the fun one in the ${botType.toLowerCase()} world. 😊`,
      ],
      empathetic: [
        `I understand this might be important to you, and I want to make sure I provide the best help possible.`,
        `I can sense you're looking for support, and I'm here to listen and assist you thoughtfully.`,
        `Thank you for trusting me with your question. I'll do my best to provide caring and helpful guidance.`,
      ],
    }

    const toneResponses = defaultResponses[botTone] || defaultResponses.friendly
    return toneResponses[Math.floor(Math.random() * toneResponses.length)]
  }

  // Prompt handling
  function handlePromptClick(e) {
    const promptText = e.target.textContent.trim()
    userInput.value = promptText

    // On mobile, close sidebar after selecting a prompt
    if (window.innerWidth <= 768) {
      toggleSidebar()
    }

    // Focus on input and trigger send
    userInput.focus()
    setTimeout(() => {
      sendMessage(promptText)
    }, 100)
  }

  // Chat actions
  function handleClearChat() {
    if (confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      // Keep the welcome message, remove the rest
      const welcome = document.querySelector(".chat-welcome")
      chatMessages.innerHTML = ""
      if (welcome) {
        chatMessages.appendChild(welcome.cloneNode(true))
      }

      // Clear chat history
      chatHistory = []
      saveChatHistory()

      // Reset conversation ID
      conversationId = generateConversationId()

      showNotification("Chat cleared successfully", "success")
    }
  }

  function handleSaveChat() {
    if (chatHistory.length === 0) {
      showNotification("No messages to save", "warning")
      return
    }

    // In a real app, this would save to server
    const chatData = {
      conversationId: conversationId,
      botName: document.querySelector(".bot-name").textContent,
      timestamp: new Date().toISOString(),
      messages: chatHistory,
    }

    // Save to localStorage as backup
    const savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]")
    savedChats.push(chatData)
    localStorage.setItem("savedChats", JSON.stringify(savedChats))

    showNotification("Chat saved successfully!", "success")
  }

  function handleExportChat() {
    if (chatHistory.length === 0) {
      showNotification("No messages to export", "warning")
      return
    }

    const botName = document.querySelector(".bot-name").textContent
    const exportDate = new Date().toLocaleDateString()
    let chatText = `Chat Export - ${botName}\nDate: ${exportDate}\nConversation ID: ${conversationId}\n\n`

    chatHistory.forEach((entry) => {
      const sender = entry.type === "user" ? "You" : botName
      const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      chatText += `[${time}] ${sender}: ${entry.message}\n\n`
    })

    // Create and download file
    const blob = new Blob([chatText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat_export_${botName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification("Chat exported successfully!", "success")
  }

  function handleRefreshChat() {
    if (confirm("Refresh the chat? This will reload the page and you may lose unsaved changes.")) {
      window.location.reload()
    }
  }

  // Rating modal
  function showRatingModal() {
    ratingModal.classList.add("active")
    document.body.style.overflow = "hidden" // Prevent background scrolling
  }

  function hideRatingModal() {
    ratingModal.classList.remove("active")
    document.body.style.overflow = "" // Restore scrolling
    resetRating()
  }

  function handleModalBackdropClick(e) {
    if (e.target === ratingModal) {
      hideRatingModal()
    }
  }

  function setRating(rating) {
    currentRating = rating
    highlightStars(rating)
  }

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.classList.toggle("active", index < rating)
    })
  }

  function resetRating() {
    currentRating = 0
    highlightStars(0)
    document.querySelector(".feedback-text").value = ""
  }

  function handleSubmitRating() {
    if (currentRating === 0) {
      showNotification("Please select a star rating before submitting", "warning")
      return
    }

    const feedback = document.querySelector(".feedback-text").value.trim()
    const ratingData = {
      rating: currentRating,
      feedback: feedback,
      conversationId: conversationId,
      timestamp: new Date().toISOString(),
    }

    // In a real app, this would be sent to the server
    console.log("Rating submitted:", ratingData)

    // Save rating locally
    const ratings = JSON.parse(localStorage.getItem("botRatings") || "[]")
    ratings.push(ratingData)
    localStorage.setItem("botRatings", JSON.stringify(ratings))

    hideRatingModal()
    showNotification("Thank you for your feedback!", "success")
  }

  // Utility functions
  function formatBotMessage(message) {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    let formatted = message.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
    )

    // Replace line breaks with <br> tags
    formatted = formatted.replace(/\n/g, "<br>")

    // Replace **bold** with <strong> tags
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Replace *italic* with <em> tags
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

    return formatted
  }

  function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function generateConversationId() {
    return "conv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    document.querySelectorAll(".notification").forEach((n) => n.remove())

    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `

    document.body.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = "slideOutRight 0.3s ease"
        setTimeout(() => notification.remove(), 300)
      }
    }, 5000)
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "✅",
      warning: "⚠️",
      error: "❌",
      info: "ℹ️",
    }
    return icons[type] || icons.info
  }

  function getNotificationColor(type) {
    const colors = {
      success: "#2cb67d",
      warning: "#ff9500",
      error: "#ef4565",
      info: "#7f5af0",
    }
    return colors[type] || colors.info
  }

  // Chat history management
  function saveChatHistory() {
    localStorage.setItem(`chatHistory_${conversationId}`, JSON.stringify(chatHistory))
  }

  function loadChatHistory() {
    const saved = localStorage.getItem(`chatHistory_${conversationId}`)
    if (saved) {
      chatHistory = JSON.parse(saved)
      // Optionally restore messages to UI
      // restoreChatMessages()
    }
  }

  function loadBotInfo() {
    // Get bot information from the page
    const botName = document.querySelector(".bot-name")?.textContent
    const botType = document.querySelector(".detail-value")?.textContent

    if (botName && botType) {
      console.log(`Chat initialized with ${botName} (${botType})`)
    }
  }

  // Mobile menu toggle
  function toggleMobileMenu() {
    const hamburger = document.getElementById("hamburger")
    const mobileMenu = document.getElementById("mobileMenu")

    hamburger.classList.toggle("active")
    mobileMenu.classList.toggle("active")
  }

  // Add CSS animations for notifications
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      margin-left: auto;
    }
    
    .notification-close:hover {
      opacity: 0.8;
    }
  `
  document.head.appendChild(style)

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    saveChatHistory()
  })
})
