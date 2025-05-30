document.addEventListener("DOMContentLoaded", function() {
  // DOM Elements
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typingIndicator');
  const messageStatus = document.getElementById('messageStatus');
  const clearChatBtn = document.getElementById('clearChat');
  const saveChatBtn = document.getElementById('saveChat');
  const rateBotBtn = document.getElementById('rateBot');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const refreshChatBtn = document.getElementById('refreshChat');
  const exportChatBtn = document.getElementById('exportChat');
  const promptBtns = document.querySelectorAll('.prompt-btn');
  const ratingModal = document.getElementById('ratingModal');
  const closeModalBtn = document.querySelector('.close-modal');
  const stars = document.querySelectorAll('.star');
  const submitRatingBtn = document.querySelector('.submit-rating');
  const chatSidebar = document.querySelector('.chat-sidebar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const attachButton = document.getElementById('attachButton');
  const emojiButton = document.getElementById('emojiButton');

  // Bot info
  const botName = document.querySelector('.bot-name').textContent;
  const botType = document.querySelector('.detail-value').textContent;
  const botAvatar = document.querySelector('.avatar-emoji').textContent;

  // State
  let isTyping = false;
  let currentRating = 0;
  let messageCount = 0;
  let conversationHistory = [];

  // Initialize
  init();

  function init() {
    setupEventListeners();
    focusInput();
  }

  function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Chat actions
    clearChatBtn.addEventListener('click', clearChat);
    saveChatBtn.addEventListener('click', saveChat);
    rateBotBtn.addEventListener('click', openRatingModal);
    
    // Chat controls
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    refreshChatBtn.addEventListener('click', refreshChat);
    exportChatBtn.addEventListener('click', exportChat);
    
    // Suggested prompts
    promptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent;
        focusInput();
      });
    });
    
    // Rating modal
    closeModalBtn.addEventListener('click', closeRatingModal);
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        setRating(rating);
      });
    });
    submitRatingBtn.addEventListener('click', submitRating);
    
    // Mobile menu
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
    }
    
    // Input actions
    attachButton.addEventListener('click', handleAttachment);
    emojiButton.addEventListener('click', handleEmoji);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === ratingModal) {
        closeRatingModal();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key closes modal
      if (e.key === 'Escape' && ratingModal.classList.contains('active')) {
        closeRatingModal();
      }
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    
    // Clear input and update state
    input.value = '';
    messageCount++;
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Send message to backend
      const response = await sendMessage(message);
      
      // Hide typing indicator after a delay
      setTimeout(() => {
        hideTypingIndicator();
        
        // Add bot response to UI
        addMessage(response.reply, 'bot');
        
        // Update conversation history
        conversationHistory.push({ role: 'bot', content: response.reply });
        
        // Update message status
        updateMessageStatus('Message delivered');
      }, calculateTypingDelay(response.reply));
    } catch (error) {
      hideTypingIndicator();
      showErrorMessage(error.message || 'Failed to get response');
      updateMessageStatus('Error: Message not delivered');
    }
  }

  async function sendMessage(message) {
    try {
      // Get bot ID from URL
      const botId = window.location.pathname.split('/')[2];
      
      // Send message to backend
      const res = await fetch(`/bot/${botId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  function addMessage(text, sender) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${sender}`;
    
    // Create avatar based on sender
    const avatarEmoji = sender === 'bot' ? botAvatar : '👤';
    
    messageEl.innerHTML = `
      <div class="message-avatar">
        ${avatarEmoji}
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${formatMessageText(text)}
        </div>
        <div class="message-time">${timestamp}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageEl);
    scrollToBottom();
  }

  function formatMessageText(text) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }

  function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    
    // Show typing status
    typingIndicator.classList.add('active');
    
    // Create typing indicator in chat
    const typingEl = document.createElement('div');
    typingEl.className = 'message message-bot typing-message';
    typingEl.id = 'typingMessage';
    
    typingEl.innerHTML = `
      <div class="message-avatar">
        ${botAvatar}
      </div>
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    
    chatMessages.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    isTyping = false;
    typingIndicator.classList.remove('active');
    
    const typingMessage = document.getElementById('typingMessage');
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  function showErrorMessage(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'message system-message error-message';
    
    errorEl.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">
          <p>⚠️ ${message}</p>
          <p>Please try again or refresh the page.</p>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(errorEl);
    scrollToBottom();
  }

  function updateMessageStatus(status) {
    messageStatus.textContent = status;
    
    // Clear status after 5 seconds
    setTimeout(() => {
      messageStatus.textContent = '';
    }, 5000);
  }

  function calculateTypingDelay(text) {
    // Calculate a realistic typing delay based on message length
    const baseDelay = 500; // minimum delay in ms
    const charsPerSecond = 20; // average typing speed
    
    return Math.min(baseDelay + (text.length / charsPerSecond) * 1000, 3000);
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function focusInput() {
    input.focus();
  }

  function clearChat() {
    // Confirm before clearing
    if (conversationHistory.length > 1 && !confirm('Are you sure you want to clear the chat history?')) {
      return;
    }
    
    // Keep only the welcome message
    const welcomeMessage = chatMessages.querySelector('.chat-welcome');
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
      chatMessages.appendChild(welcomeMessage);
    }
    
    // Reset state
    conversationHistory = [];
    messageCount = 0;
    updateMessageStatus('Chat cleared');
  }

  function saveChat() {
    // Create chat transcript
    let transcript = `Chat with ${botName} - ${new Date().toLocaleString()}\n\n`;
    
    conversationHistory.forEach(msg => {
      transcript += `${msg.role === 'user' ? 'You' : botName}: ${msg.content}\n\n`;
    });
    
    // Create blob and download
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-with-${botName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateMessageStatus('Chat saved to downloads');
  }

  function openRatingModal() {
    ratingModal.classList.add('active');
  }

  function closeRatingModal() {
    ratingModal.classList.remove('active');
  }

  function setRating(rating) {
    currentRating = rating;
    
    // Update stars UI
    stars.forEach(star => {
      if (parseInt(star.dataset.rating) <= rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  function submitRating() {
    if (currentRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    const feedback = document.querySelector('.feedback-text').value;
    
    // In a real app, send this to the backend
    console.log('Rating:', currentRating, 'Feedback:', feedback);
    
    // Show confirmation
    alert(`Thank you for your ${currentRating}-star rating!`);
    
    // Close modal and reset
    closeRatingModal();
    currentRating = 0;
    document.querySelector('.feedback-text').value = '';
    stars.forEach(star => star.classList.remove('active'));
  }

  function toggleSidebar() {
    chatSidebar.classList.toggle('active');
    
    // Update button icon
    const icon = toggleSidebarBtn.querySelector('.control-icon');
    icon.textContent = chatSidebar.classList.contains('active') ? '◀' : '▶';
  }

  function refreshChat() {
    // Show loading state
    refreshChatBtn.classList.add('loading');
    refreshChatBtn.querySelector('.control-icon').textContent = '⏳';
    
    // Simulate refresh (in a real app, reconnect to the backend)
    setTimeout(() => {
      refreshChatBtn.classList.remove('loading');
      refreshChatBtn.querySelector('.control-icon').textContent = '🔄';
      updateMessageStatus('Chat refreshed');
    }, 1000);
  }

  function exportChat() {
    // Create chat export in JSON format
    const exportData = {
      bot: {
        name: botName,
        type: botType
      },
      timestamp: new Date().toISOString(),
      messages: conversationHistory
    };
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateMessageStatus('Chat exported as JSON');
  }

  function handleAttachment() {
    // In a real app, open file picker
    alert('File attachment feature would open a file picker here');
  }

  function handleEmoji() {
    // In a real app, open emoji picker
    alert('Emoji picker would open here');
  }

  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(44, 182, 125, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(44, 182, 125, 0); }
      100% { box-shadow: 0 0 0 0 rgba(44, 182, 125, 0); }
    }
    
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
});