// X Reply Assistant - Popup Script
// Handles popup UI interactions and API key management

class PopupManager {
  constructor() {
    this.apiKey = "";
    this.init();
  }

  init() {
    console.log("X Reply Assistant Popup: Initializing...");
    this.setupEventListeners();
    this.loadInitialState();
  }

  setupEventListeners() {
    // API Key management
    document.getElementById("saveApiKeyBtn").addEventListener("click", () => {
      this.saveApiKey();
    });

    document.getElementById("clearApiKeyBtn").addEventListener("click", () => {
      this.clearApiKey();
    });

    document
      .getElementById("toggleVisibilityBtn")
      .addEventListener("click", () => {
        this.toggleApiKeyVisibility();
      });

    // API Key input
    document.getElementById("apiKeyInput").addEventListener("input", (e) => {
      this.handleApiKeyInput(e.target.value);
    });

    document.getElementById("apiKeyInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.saveApiKey();
      }
    });

    // Footer links
    document.getElementById("helpLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.openHelpPage();
    });

    document.getElementById("privacyLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.openPrivacyPage();
    });

    document.getElementById("feedbackLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.openFeedbackPage();
    });
  }

  async loadInitialState() {
    try {
      // Load API key
      await this.loadApiKey();

      // Update status
      this.updateStatus();

      // Load stats if available
      this.loadStats();
    } catch (error) {
      console.error("Error loading initial state:", error);
      this.showNotification("Error loading extension state", "error");
    }
  }

  async loadApiKey() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getApiKey",
      });

      if (response.success && response.apiKey) {
        this.apiKey = response.apiKey;
        document.getElementById("apiKeyInput").value = this.maskApiKey(
          response.apiKey
        );
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    }
  }

  async saveApiKey() {
    const input = document.getElementById("apiKeyInput");
    const apiKey = input.value.trim();

    if (!apiKey) {
      this.showNotification("Please enter an API key", "error");
      return;
    }

    if (!this.isValidApiKey(apiKey)) {
      this.showNotification("Invalid API key format", "error");
      return;
    }

    try {
      const saveBtn = document.getElementById("saveApiKeyBtn");
      const originalText = saveBtn.textContent;

      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      const response = await chrome.runtime.sendMessage({
        action: "setApiKey",
        apiKey: apiKey,
      });

      if (response.success) {
        this.apiKey = apiKey;
        input.value = this.maskApiKey(apiKey);
        this.showNotification("API key saved successfully!", "success");
        this.updateStatus();
      } else {
        this.showNotification("Failed to save API key", "error");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      this.showNotification("Error saving API key", "error");
    } finally {
      const saveBtn = document.getElementById("saveApiKeyBtn");
      saveBtn.textContent = "Save API Key";
      saveBtn.disabled = false;
    }
  }

  async clearApiKey() {
    if (!confirm("Are you sure you want to clear the API key?")) {
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        action: "setApiKey",
        apiKey: "",
      });

      this.apiKey = "";
      document.getElementById("apiKeyInput").value = "";
      this.showNotification("API key cleared", "warning");
      this.updateStatus();
    } catch (error) {
      console.error("Error clearing API key:", error);
      this.showNotification("Error clearing API key", "error");
    }
  }

  toggleApiKeyVisibility() {
    const input = document.getElementById("apiKeyInput");
    const toggleBtn = document.getElementById("toggleVisibilityBtn");

    if (input.type === "password") {
      if (this.apiKey) {
        input.value = this.apiKey;
      }
      input.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      if (this.apiKey) {
        input.value = this.maskApiKey(this.apiKey);
      }
      input.type = "password";
      toggleBtn.textContent = "👁️";
    }
  }

  handleApiKeyInput(value) {
    // Update save button state
    const saveBtn = document.getElementById("saveApiKeyBtn");
    const isValid = this.isValidApiKey(value);

    saveBtn.disabled = !isValid;

    if (value && !isValid) {
      saveBtn.textContent = "Invalid Key Format";
    } else {
      saveBtn.textContent = "Save API Key";
    }
  }

  isValidApiKey(key) {
    // OpenAI API keys start with 'sk-' and have specific length
    return key && key.startsWith("sk-") && key.length >= 40;
  }

  maskApiKey(key) {
    if (!key || key.length < 10) return key;
    return (
      key.substring(0, 7) +
      "*".repeat(key.length - 14) +
      key.substring(key.length - 7)
    );
  }

  updateStatus() {
    const statusIndicator = document.getElementById("statusIndicator");
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");

    // Reset classes
    statusIndicator.className = "status-indicator";

    if (!this.apiKey) {
      statusIndicator.classList.add("error");
      statusText.textContent = "API key not configured";
    } else {
      statusIndicator.classList.add("success");
      statusText.textContent = "Ready to generate responses";
    }
  }

  async loadStats() {
    try {
      // For now, show mock stats. In a real implementation,
      // these would be loaded from storage
      const statsSection = document.getElementById("statsSection");
      const totalRequests = document.getElementById("totalRequests");
      const todayRequests = document.getElementById("todayRequests");

      // Mock data - replace with actual storage retrieval
      totalRequests.textContent = "0";
      todayRequests.textContent = "0";

      if (this.apiKey) {
        statsSection.style.display = "block";
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    const notificationText = document.getElementById("notificationText");

    // Reset classes
    notification.className = "notification";
    if (type !== "success") {
      notification.classList.add(type);
    }

    notificationText.textContent = message;
    notification.style.display = "block";

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  openHelpPage() {
    chrome.tabs.create({
      url: "https://github.com/x-reply-assistant/help",
    });
  }

  openPrivacyPage() {
    chrome.tabs.create({
      url: "https://github.com/x-reply-assistant/privacy",
    });
  }

  openFeedbackPage() {
    chrome.tabs.create({
      url: "https://github.com/x-reply-assistant/feedback",
    });
  }

  async checkActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const isValidDomain =
        tab.url.includes("x.com") || tab.url.includes("twitter.com");

      if (isValidDomain) {
        this.showNotification("Extension is active on this page", "success");
      } else {
        this.showNotification(
          "Visit X.com or Twitter.com to use this extension",
          "warning"
        );
      }
    } catch (error) {
      console.error("Error checking active tab:", error);
    }
  }
}

// Initialize popup when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new PopupManager();
  });
} else {
  new PopupManager();
}
