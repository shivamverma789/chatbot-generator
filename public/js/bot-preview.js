document.addEventListener("DOMContentLoaded", function() {
  // Mobile menu functionality
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }

  // Chat preview animation
  const typingMessage = document.querySelector('.typing');
  const chatMessages = document.getElementById('chatMessages');
  
  if (typingMessage && chatMessages) {
    setTimeout(() => {
      // Remove typing indicator
      typingMessage.classList.remove('typing');
      
      // Get bot name from the page
      const botName = document.querySelector('.bot-name').textContent;
      const botType = document.querySelector('.bot-type').textContent;
      
      // Create a new message
      const newMessage = document.createElement('div');
      newMessage.className = 'message bot-message';
      
      // Determine response based on bot type
      let responseText = '';
      switch (botType.toLowerCase()) {
        case 'customer support':
          responseText = `I can help you with product inquiries, order tracking, returns, and general support. Just let me know what you need assistance with!`;
          break;
        case 'sales':
          responseText = `I can provide information about our products, pricing, promotions, and help you find the perfect solution for your needs.`;
          break;
        case 'technical':
          responseText = `I can assist with troubleshooting, technical specifications, setup guides, and answer any technical questions you might have.`;
          break;
        case 'educational':
          responseText = `I can explain concepts, provide learning resources, quiz you on topics, and help with your educational journey.`;
          break;
        default:
          responseText = `I can assist with a variety of tasks related to ${botType}. Feel free to ask me anything specific you'd like to know!`;
      }
      
      // Add the message content
      newMessage.innerHTML = `
        <div class="message-bubble">
          <p>${responseText}</p>
        </div>
        <div class="message-time">Just now</div>
      `;
      
      // Add to chat
      chatMessages.appendChild(newMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
  }

  // Copy link button functionality
  const copyLinkBtn = document.getElementById('copyLink');
  
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      // Get current URL
      const currentUrl = window.location.href;
      
      // Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = currentUrl;
      document.body.appendChild(tempInput);
      
      // Select and copy
      tempInput.select();
      document.execCommand('copy');
      
      // Remove the temporary input
      document.body.removeChild(tempInput);
      
      // Change button text temporarily
      const originalText = copyLinkBtn.textContent;
      copyLinkBtn.textContent = 'Link Copied!';
      
      setTimeout(() => {
        copyLinkBtn.textContent = originalText;
      }, 2000);
    });
  }

  // Clone bot button functionality
  const cloneBtn = document.getElementById('cloneBot');
  
  if (cloneBtn) {
    cloneBtn.addEventListener('click', () => {
      // Get bot ID from URL
      const botId = window.location.pathname.split('/').pop();
      
      // Show loading state
      const originalText = cloneBtn.innerHTML;
      cloneBtn.innerHTML = '<span class="btn-icon">⏳</span> Cloning...';
      cloneBtn.disabled = true;
      
      // Simulate API call (replace with actual API call)
      setTimeout(() => {
        // Reset button
        cloneBtn.innerHTML = '<span class="btn-icon">✅</span> Cloned!';
        
        // Redirect after a delay (or show success message)
        setTimeout(() => {
          // In a real app, redirect to the new cloned bot
          // window.location.href = `/my-bots`;
          cloneBtn.innerHTML = originalText;
          cloneBtn.disabled = false;
        }, 1500);
      }, 1000);
    });
  }

  // Social share buttons
  const twitterBtn = document.querySelector('.twitter');
  const facebookBtn = document.querySelector('.facebook');
  
  if (twitterBtn) {
    twitterBtn.addEventListener('click', () => {
      const botName = document.querySelector('.bot-name').textContent;
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this amazing ${botName} chatbot I found!`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    });
  }
  
  if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    });
  }

  // Similar bots click handler
  const similarBotCards = document.querySelectorAll('.similar-bot-card');
  
  similarBotCards.forEach(card => {
    card.addEventListener('click', () => {
      // In a real app, this would navigate to the bot's page
      const botName = card.querySelector('h4').textContent;
      alert(`Navigating to ${botName} (This is just a preview)`);
    });
  });
});