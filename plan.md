# X (Twitter) Reply Assistant Chrome Extension - Project Plan

## Overview

A Chrome extension that adds three response generation buttons below each tweet in the X feed, using OpenAI GPT-3.5-turbo to generate contextually appropriate replies.

## Core Features

### 1. Button Placement & UI

- Add 3 buttons below each tweet in the main feed: "Casual Response", "Professional Response", "Ask A Question"
- Buttons appear below all tweets except ads and sensitive content
- Clean, non-intrusive design that fits with X's UI

### 2. Response Generation Flow

1. User clicks one of the three buttons
2. Extension extracts main tweet text
3. Sends request to OpenAI API with appropriate prompt
4. Shows generated response in a popup/modal for review
5. User can regenerate if not satisfied
6. User can edit the response before using it
7. User manually copies/posts the response

### 3. Response Types

- **Casual Response**: Friendly, informal tone with emojis
- **Professional Response**: Formal, business-appropriate tone
- **Ask A Question**: Generate thoughtful follow-up questions about the tweet content

### 4. Technical Specifications

- **API**: OpenAI GPT-3.5-turbo (hardcoded for now)
- **API Key**: Developer-provided (no user configuration needed)
- **Content Scope**: Main tweet text only (v0)
- **Network**: Online-only (API dependent)
- **Data Handling**: Temporary API calls, no local storage of tweet content

### 5. User Experience

- Loading indicators during API calls
- Error handling for API failures
- Regenerate button in popup modal
- Edit capability in popup before using response
- Simple, intuitive interface

## Technical Architecture

### Content Script

- Inject buttons into X feed
- Extract tweet content
- Handle button clicks
- Manage popup/modal display

### Background Script

- Handle OpenAI API calls
- Manage API key securely
- Process responses

### Popup/Modal Component

- Display generated responses
- Provide edit and regenerate functionality
- Handle user actions

## Development Phases

1. **Phase 1**: Basic button injection and tweet text extraction
2. **Phase 2**: OpenAI API integration and response generation
3. **Phase 3**: Popup/modal UI for response review and editing
4. **Phase 4**: Error handling and polish
5. **Phase 5**: Testing and refinement

## Future Enhancements (Post-v0)

- Support for full thread context
- Image/media description analysis
- User-customizable prompts
- Additional response categories
- Improved content filtering
