# 💬 Conversation Management - ChatGPT Style

## Overview

The AI dashboard now features a ChatGPT-style conversation management system with a sidebar that lets you:
- View all your conversations
- Switch between conversations
- Create new conversations
- Rename conversations
- Delete conversations
- Search conversations

## 🎨 Features

### 1. **Conversation Sidebar**
- **Desktop**: Permanent sidebar on the left (280px width)
- **Mobile**: Slide-out offcanvas menu (toggle with hamburger icon)
- Shows all conversations with:
  - Title
  - Last updated time (e.g., "5m ago", "2h ago", "3d ago")
  - Message count badge
  - Hover actions (rename, delete)

### 2. **Conversation Actions**

#### Create New Conversation
```javascript
- Click "New Conversation" button
- Creates a fresh conversation with welcome message
- Automatically switches to the new conversation
```

#### Switch Conversations
```javascript
- Click on any conversation in the sidebar
- Loads all previous messages
- Maintains conversation context
```

#### Rename Conversation
```javascript
- Hover over conversation → Click edit icon
- Enter new title in modal
- Press Enter or click "Save"
```

#### Delete Conversation
```javascript
- Hover over conversation → Click delete icon
- Confirm deletion in modal
- If deleting active conversation, creates a new one automatically
```

#### Search Conversations
```javascript
- Type in search box at top of sidebar
- Real-time search across conversation titles
- Clears when search box is empty
```

## 📡 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/conversations` | List all conversations |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `POST` | `/api/conversations` | Create new conversation |
| `PATCH` | `/api/conversations/:id/title` | Rename conversation |
| `DELETE` | `/api/conversations/:id` | Delete conversation |
| `GET` | `/api/conversations/search?q=term` | Search conversations |
| `GET` | `/api/conversations/stats` | Get statistics |

## 🗂️ File Structure

```
src/
├── components/
│   └── ConversationSidebar/
│       ├── index.jsx          # Main sidebar component
│       └── styles.css         # Sidebar-specific styles
├── lib/
│   └── api/
│       └── conversations.js    # API utility functions
└── app/
    └── (admin)/
        └── dashboard/
            └── page.jsx        # Updated dashboard with sidebar
```

## 🔧 API Utility Functions

### In `src/lib/api/conversations.js`:

```javascript
// Get all conversations
getAllConversations()

// Get specific conversation with messages
getConversation(conversationId)

// Create new conversation
createConversation({ title: 'My conversation' })

// Rename conversation
renameConversation(conversationId, 'New Title')

// Delete conversation
deleteConversation(conversationId)

// Search conversations
searchConversations('search query')

// Get statistics
getConversationStats()
```

## 💡 Usage Example

```javascript
import ConversationSidebar from '@/components/ConversationSidebar';
import { getConversation } from '@/lib/api/conversations';

function MyComponent() {
  const [currentConversationId, setCurrentConversationId] = useState('');

  const handleConversationSelect = async (conversation) => {
    const data = await getConversation(conversation.id);
    // Load messages...
    setCurrentConversationId(conversation.id);
  };

  const handleNewConversation = (conversation) => {
    // Reset chat...
    setCurrentConversationId(conversation.id);
  };

  return (
    <div className="d-flex">
      <ConversationSidebar
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        isMobile={false}
      />
      {/* Your main content */}
    </div>
  );
}
```

## 📱 Responsive Design

### Desktop (>= 992px)
- Sidebar always visible on the left
- Fixed width: 280px
- Conversations list scrollable

### Mobile (< 992px)
- Sidebar hidden by default
- Hamburger menu button in header
- Offcanvas slide-out from left
- Full-screen overlay
- Auto-closes after selecting conversation

## 🎨 Styling

The sidebar uses:
- Bootstrap React components (Offcanvas, ListGroup, etc.)
- Custom CSS for hover effects and transitions
- Active conversation highlighting
- Smooth animations

## 🔄 State Management

### Conversation State
```javascript
const [conversationId, setConversationId] = useState('');
const [messages, setMessages] = useState([]);
const [showSidebar, setShowSidebar] = useState(false); // Mobile only
const [isMobile, setIsMobile] = useState(false);
```

### Persistence
- Current conversation ID saved to `localStorage`
- Restored on page reload
- Messages loaded from backend when switching conversations

## 🚀 Future Enhancements

Potential features to add:
- [ ] Conversation folders/categories
- [ ] Pin important conversations
- [ ] Export conversation to PDF/text
- [ ] Share conversation link
- [ ] Conversation templates
- [ ] Bulk delete conversations
- [ ] Archive conversations
- [ ] Conversation tags

## 🐛 Troubleshooting

### Sidebar not showing
- Check if `isMobile` is correctly detecting screen size
- Verify `ConversationSidebar` is imported correctly
- Check browser console for errors

### Conversations not loading
- Verify backend API endpoints are accessible
- Check authentication token is valid
- Review network tab in DevTools for API responses

### Search not working
- Ensure search query is properly encoded
- Check backend search implementation
- Verify debouncing if needed

## 📝 Notes

- All conversations are user-specific (filtered by authenticated user)
- Deleting a conversation is permanent
- Search is case-insensitive
- Time formatting uses relative times (e.g., "2h ago")
- Conversation titles can be updated at any time

**Enjoy your new ChatGPT-style conversation management!** 🎉

