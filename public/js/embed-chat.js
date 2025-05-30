document.addEventListener("DOMContentLoaded", function() {
  // DOM Elements
  const chatWidget = document.getElementById('chatWidget');
  const themeToggle = document.getElementById('themeToggle');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typingIndicator');

  // Bot info from EJS
  const botName = document.querySelector('.bot-name').textContent;
  const botAvatar = document.querySelector('.avatar-emoji').textContent;

  // State
  let isMinimized = false;
  let isTyping = false;
  let messageCount = 0;

  // Initialize
  init();

  function init() {
    setupEventListeners();
    loadThemePreference();
    focusInput();
  }

  function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Minimize toggle
    minimizeBtn.addEventListener('click', toggleMinimize);
    
    // Form submission
    chatForm.addEventListener('submit', handleSubmit);
    
    // Input events
    chatInput.addEventListener('keypress', handleKeyPress);
    chatInput.addEventListener('input', handleInputChange);
    
    // Prevent form submission when disabled
    sendBtn.addEventListener('click', (e) => {
      if (sendBtn.disabled) {
        e.preventDefault();
      }
    });
  }

  function toggleTheme() {
    const currentTheme = chatWidget.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    chatWidget.dataset.theme = newTheme;
    
    // Update theme icon
    const themeIcon = themeToggle.querySelector('.theme-icon');
    themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    
    // Save preference
    localStorage.setItem('chatbot-theme', newTheme);
    
    // Add transition effect
    chatWidget.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      chatWidget.style.transition = '';
    }, 300);
  }

  function loadThemePreference() {
    const savedTheme = localStorage.getItem('chatbot-theme') || 'dark';
    chatWidget.dataset.theme = savedTheme;
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    chatWidget.classList.toggle('minimized', isMinimized);
    
    const minimizeIcon = minimizeBtn.querySelector('.action-icon');
    minimizeIcon.textContent = isMinimized ? '+' : '−';
    
    if (!isMinimized) {
      focusInput();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message || isTyping) return;

    // Add user message
    addMessage(message, 'user');
    
    // Clear input and disable send button
    chatInput.value = '';
    setSendButtonState(false);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Send message to backend
      const response = await sendMessage(message);
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Add bot response
      addMessage(response.reply, 'bot');
      
    } catch (error) {
      hideTypingIndicator();
      addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
      console.error('Chat error:', error);
    }
    
    // Re-enable send button and focus input
    setSendButtonState(true);
    focusInput();
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleInputChange() {
    const hasText = chatInput.value.trim().length > 0;
    setSendButtonState(hasText && !isTyping);
  }

  async function sendMessage(message) {
    // Get bot ID from URL or embedded data
    const botId = window.location.pathname.split('/')[2];
    
    const response = await fetch(`/bot/${botId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  function addMessage(text, sender, isError = false) {
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${sender}`;
    
    if (isError) {
      messageEl.classList.add('error-message');
    }
    
    const avatarEmoji = sender === 'bot' ? botAvatar : '👤';
    
    messageEl.innerHTML = `
      <div class="message-avatar">
        ${avatarEmoji}
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${formatMessage(text)}
        </div>
        <div class="message-time">${timestamp}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageEl);
    scrollToBottom();
    messageCount++;
  }

  function formatMessage(text) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, url => 
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }

  function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    typingIndicator.classList.add('active');
    scrollToBottom();
  }

  function hideTypingIndicator() {
    isTyping = false;
    typingIndicator.classList.remove('active');
  }

  function setSendButtonState(enabled) {
    sendBtn.disabled = !enabled;
    sendBtn.style.opacity = enabled ? '1' : '0.5';
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function focusInput() {
    if (!isMinimized) {
      chatInput.focus();
    }
  }

  // Auto-resize for iframe
  function notifyParentOfResize() {
    if (window.parent !== window) {
      const height = chatWidget.offsetHeight;
      window.parent.postMessage({
        type: 'chatbot-resize',
        height: height
      }, '*');
    }
  }

  // Listen for resize events
  window.addEventListener('resize', notifyParentOfResize);
  
  // Initial resize notification
  setTimeout(notifyParentOfResize, 100);

  // Expose global functions for parent window communication
  window.chatbotAPI = {
    sendMessage: function(message) {
      chatInput.value = message;
      handleSubmit(new Event('submit'));
    },
    
    toggleTheme: toggleTheme,
    
    minimize: function() {
      if (!isMinimized) toggleMinimize();
    },
    
    maximize: function() {
      if (isMinimized) toggleMinimize();
    },
    
    getMessageCount: function() {
      return messageCount;
    }
  };
});