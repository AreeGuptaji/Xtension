// X Reply Assistant - Content Script
// Detects tweets and injects AI response generation buttons

class XReplyAssistant {
  constructor() {
    this.processedTweets = new Set();
    this.observer = null;
    this.init();
  }

  init() {
    console.log("X Reply Assistant: Initializing...");
    this.setupObserver();
    this.processTweets();
  }

  setupObserver() {
    // Observer for dynamic content loading (infinite scroll)
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        this.processTweets();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  processTweets() {
    // Find all tweet articles on the page
    const tweets = document.querySelectorAll(
      'article[data-testid="tweet"]:not([data-reply-assistant-processed])'
    );

    tweets.forEach((tweet) => {
      if (!this.processedTweets.has(tweet)) {
        this.processedTweets.add(tweet);
        this.addReplyButtons(tweet);
        tweet.setAttribute("data-reply-assistant-processed", "true");
      }
    });
  }

  addReplyButtons(tweetElement) {
    // Extract tweet content
    const tweetText = this.extractTweetText(tweetElement);
    if (!tweetText || this.shouldSkipTweet(tweetElement)) {
      return;
    }

    // Find the action bar (like, retweet, share buttons)
    const actionBar = tweetElement.querySelector('[role="group"]');
    if (!actionBar) {
      return;
    }

    // Create container for our buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "reply-assistant-container";
    buttonContainer.innerHTML = `
      <div class="reply-assistant-buttons">
        <button class="reply-assistant-btn casual" data-type="casual" title="Generate Casual Response">
          😊 Casual
        </button>
        <button class="reply-assistant-btn professional" data-type="professional" title="Generate Professional Response">
          💼 Professional
        </button>
        <button class="reply-assistant-btn question" data-type="question" title="Ask A Question">
          ❓ Question
        </button>
      </div>
    `;

    // Add event listeners
    const buttons = buttonContainer.querySelectorAll(".reply-assistant-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleButtonClick(button, tweetText, tweetElement);
      });
    });

    // Insert after the action bar
    actionBar.parentNode.insertBefore(buttonContainer, actionBar.nextSibling);
  }

  extractTweetText(tweetElement) {
    // Try multiple selectors to find tweet text
    const textSelectors = [
      '[data-testid="tweetText"]',
      "[lang]", // Tweet text usually has lang attribute
      'span[dir="auto"]', // Fallback for tweet text
    ];

    for (const selector of textSelectors) {
      const textElement = tweetElement.querySelector(selector);
      if (textElement && textElement.textContent.trim()) {
        // Get the full text content, excluding any nested elements we don't want
        const text = textElement.textContent.trim();
        if (text.length > 10) {
          // Minimum length check
          return text;
        }
      }
    }

    return null;
  }

  shouldSkipTweet(tweetElement) {
    // Skip promoted tweets, sensitive content, etc.
    const promotedIndicator = tweetElement.querySelector(
      '[data-testid="promotedIndicator"]'
    );
    const sensitiveWarning = tweetElement.querySelector(
      '[data-testid="tweetSensitiveWarning"]'
    );

    return !!(promotedIndicator || sensitiveWarning);
  }

  async handleButtonClick(button, tweetText, tweetElement) {
    const responseType = button.dataset.type;

    // Show loading state
    const originalText = button.textContent;
    button.textContent = "⏳ Generating...";
    button.disabled = true;

    try {
      // Send message to background script for API call
      const response = await chrome.runtime.sendMessage({
        action: "generateResponse",
        tweetText: tweetText,
        responseType: responseType,
      });

      if (response.success) {
        this.showResponseModal(
          response.content,
          tweetText,
          responseType,
          tweetElement
        );
      } else {
        this.showError(response.error || "Failed to generate response");
      }
    } catch (error) {
      console.error("Error generating response:", error);
      this.showError("Network error. Please try again.");
    } finally {
      // Restore button state
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  showResponseModal(
    generatedResponse,
    originalTweet,
    responseType,
    tweetElement
  ) {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.className = "reply-assistant-modal";
    modal.innerHTML = `
      <div class="reply-assistant-modal-content">
        <div class="reply-assistant-modal-header">
          <h3>AI Generated ${this.capitalize(responseType)} Response</h3>
          <button class="reply-assistant-close-btn">&times;</button>
        </div>
        <div class="reply-assistant-modal-body">
          <div class="original-tweet">
            <h4>Original Tweet:</h4>
            <p>${originalTweet}</p>
          </div>
          <div class="generated-response">
            <h4>Generated Response:</h4>
            <textarea class="response-textarea" rows="4">${generatedResponse}</textarea>
            <div class="character-count">${generatedResponse.length}/280</div>
          </div>
          <div class="modal-actions">
            <button class="regenerate-btn">🔄 Regenerate</button>
            <button class="copy-btn">📋 Copy</button>
            <button class="use-btn">💬 Use Response</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners for modal
    this.setupModalEventListeners(
      modal,
      originalTweet,
      responseType,
      tweetElement
    );
  }

  setupModalEventListeners(modal, originalTweet, responseType, tweetElement) {
    const closeBtn = modal.querySelector(".reply-assistant-close-btn");
    const regenerateBtn = modal.querySelector(".regenerate-btn");
    const copyBtn = modal.querySelector(".copy-btn");
    const useBtn = modal.querySelector(".use-btn");
    const textarea = modal.querySelector(".response-textarea");
    const charCount = modal.querySelector(".character-count");

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Character count update
    textarea.addEventListener("input", () => {
      const count = textarea.value.length;
      charCount.textContent = `${count}/280`;
      charCount.style.color = count > 280 ? "#ff0000" : "#657786";
    });

    // Regenerate response
    regenerateBtn.addEventListener("click", async () => {
      regenerateBtn.textContent = "⏳ Regenerating...";
      regenerateBtn.disabled = true;

      try {
        const response = await chrome.runtime.sendMessage({
          action: "generateResponse",
          tweetText: originalTweet,
          responseType: responseType,
        });

        if (response.success) {
          textarea.value = response.content;
          charCount.textContent = `${response.content.length}/280`;
        }
      } catch (error) {
        console.error("Error regenerating response:", error);
      } finally {
        regenerateBtn.textContent = "🔄 Regenerate";
        regenerateBtn.disabled = false;
      }
    });

    // Copy to clipboard
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy";
        }, 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    });

    // Use response (future integration with X's reply interface)
    useBtn.addEventListener("click", () => {
      // For now, just copy and close
      navigator.clipboard.writeText(textarea.value);
      modal.remove();
      // Future: Integrate with X's reply composer
    });
  }

  showError(message) {
    // Simple error notification
    const notification = document.createElement("div");
    notification.className = "reply-assistant-error";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new XReplyAssistant();
  });
} else {
  new XReplyAssistant();
}
