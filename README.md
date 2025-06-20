# X Reply Assistant

A Chrome extension that adds AI-powered response generation buttons to X (Twitter) using OpenAI GPT-3.5-turbo.

## Features

- 🤖 **AI-Powered Responses**: Generate intelligent responses using OpenAI GPT-3.5-turbo
- 😊 **Casual Responses**: Friendly, conversational replies with emojis
- 💼 **Professional Responses**: Business-appropriate, formal replies
- ❓ **Thoughtful Questions**: Engaging follow-up questions to continue conversations
- 🎨 **Native Integration**: Seamlessly integrated into X's interface
- 🔒 **Secure**: API keys are stored securely in Chrome's storage
- ⚡ **Fast**: Optimized for quick response generation
- 🌙 **Dark Mode**: Supports both light and dark themes

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "X Reply Assistant"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder

## Setup

1. **Get OpenAI API Key**:

   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure Extension**:

   - Click the extension icon in Chrome toolbar
   - Paste your OpenAI API key
   - Click "Save API Key"

3. **Start Using**:
   - Visit [x.com](https://x.com) or [twitter.com](https://twitter.com)
   - Look for AI response buttons below tweets
   - Click to generate responses!

## How to Use

1. **Navigate to X/Twitter**: Open x.com or twitter.com in your browser
2. **Find Tweets**: Scroll through your feed and find tweets you want to respond to
3. **Click Response Type**: Choose from three response options:
   - 😊 **Casual**: Friendly, informal responses with emojis
   - 💼 **Professional**: Business-appropriate, formal responses
   - ❓ **Question**: Thoughtful follow-up questions
4. **Review & Edit**: The generated response appears in a modal where you can edit it
5. **Use Response**: Copy the response or use it directly

## Response Types

### Casual Responses

- Conversational tone
- Uses emojis appropriately
- Feels like a friend responding
- Perfect for personal interactions

### Professional Responses

- Formal, business-appropriate language
- Respectful and constructive
- Suitable for professional networking
- No emojis or casual language

### Thoughtful Questions

- Engaging follow-up questions
- Encourages further discussion
- Shows genuine interest
- Helps continue conversations

## Privacy & Security

- **API Key Security**: Your OpenAI API key is stored securely in Chrome's local storage
- **No Data Collection**: We don't collect or store any of your tweets or responses
- **Local Processing**: All processing happens locally in your browser
- **No Analytics**: No tracking or analytics are performed

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension manifest
- **Content Script**: Injects buttons into X's interface
- **Background Service Worker**: Handles API calls to OpenAI
- **Popup Interface**: Configuration and settings panel

### Technologies Used

- Vanilla JavaScript (ES6+)
- Chrome Extensions API
- OpenAI GPT-3.5-turbo API
- CSS3 with modern features
- Webpack for bundling

### Browser Support

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Chrome browser

### Setup

```bash
# Clone the repository
git clone https://github.com/x-reply-assistant/extension
cd extension

# Install dependencies
npm install

# Start development build (with watch)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Project Structure

```
src/
├── background/          # Background service worker
│   └── background.js
├── content/            # Content script for X integration
│   ├── content.js
│   └── content.css
├── popup/              # Extension popup interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── assets/            # Icons and static assets

dist/                  # Built extension (ready for Chrome)
manifest.json         # Extension manifest
package.json         # Project dependencies
webpack.config.js    # Build configuration
```

## API Costs

The extension uses OpenAI's GPT-3.5-turbo model. Costs are typically:

- **GPT-3.5-turbo**: ~$0.002 per 1,000 tokens
- **Average Response**: ~100-150 tokens
- **Estimated Cost**: <$0.0003 per response

## Troubleshooting

### Extension Not Working

1. Check if your API key is valid
2. Ensure you're on x.com or twitter.com
3. Refresh the page
4. Check Chrome Developer Console for errors

### API Errors

- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests, wait a moment
- **Quota Exceeded**: Check your OpenAI billing

### Buttons Not Appearing

1. Make sure the extension is enabled
2. Refresh the page
3. Check if you're viewing the main feed (not individual tweet pages)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Bug Reports

Use our [Issue Tracker](https://github.com/x-reply-assistant/extension/issues) to report bugs.

### Feature Requests

Have an idea? Open a [Feature Request](https://github.com/x-reply-assistant/extension/issues/new?template=feature_request.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension is not affiliated with X (Twitter) or OpenAI. Use responsibly and in accordance with both platforms' terms of service.

## Support

- 📧 Email: support@x-reply-assistant.com
- 💬 GitHub Issues: [Report a Bug](https://github.com/x-reply-assistant/extension/issues)
- 📖 Documentation: [Full Docs](https://docs.x-reply-assistant.com)

---

Made with ❤️ by the X Reply Assistant Team
