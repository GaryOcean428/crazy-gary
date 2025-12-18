import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Chat } from '@/pages/chat'
import { AuthProvider } from '@/contexts/auth-context'

// Mock WebSocket for real-time messaging
vi.mock('@/lib/api-client', () => ({
  WebSocketService: vi.fn(),
}))

// Mock components
vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }) => (
    <input
      {...props}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="chat-input"
    />
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button {...props} onClick={onClick} disabled={disabled} data-testid="chat-send">
      {children}
    </button>
  ),
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Pages - Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Chat Rendering', () => {
    it('should render chat page with layout', () => {
      render(
        <TestWrapper>
          <Chat />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      expect(screen.getByTestId('chat-send')).toBeInTheDocument()
    })

    it('should render chat with messages', () => {
      const messages = [
        { id: 1, text: 'Hello', sender: 'user', timestamp: '2023-01-01' },
        { id: 2, text: 'Hi there!', sender: 'bot', timestamp: '2023-01-01' },
      ]
      
      render(
        <TestWrapper>
          <Chat messages={messages} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there!')).toBeInTheDocument()
    })
  })

  describe('Chat Input', () => {
    it('should handle message input', async () => {
      const user = userEvent.setup()
      const handleInputChange = vi.fn()
      
      render(
        <TestWrapper>
          <Chat onInputChange={handleInputChange} />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      await user.type(input, 'Test message')
      
      expect(input).toHaveValue('Test message')
      expect(handleInputChange).toHaveBeenCalled()
    })

    it('should clear input after sending message', async () => {
      const user = userEvent.setup()
      const handleSendMessage = vi.fn()
      
      render(
        <TestWrapper>
          <Chat onSendMessage={handleSendMessage} />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      const sendButton = screen.getByTestId('chat-send')
      
      await user.type(input, 'Hello')
      await user.click(sendButton)
      
      expect(input).toHaveValue('')
      expect(handleSendMessage).toHaveBeenCalledWith('Hello')
    })

    it('should handle Enter key to send message', async () => {
      const user = userEvent.setup()
      const handleSendMessage = vi.fn()
      
      render(
        <TestWrapper>
          <Chat onSendMessage={handleSendMessage} />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      await user.type(input, 'Hello{enter}')
      
      expect(handleSendMessage).toHaveBeenCalledWith('Hello')
    })

    it('should disable send button when input is empty', () => {
      render(
        <TestWrapper>
          <Chat />
        </TestWrapper>
      )
      
      const sendButton = screen.getByTestId('chat-send')
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has content', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Chat />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      const sendButton = screen.getByTestId('chat-send')
      
      await user.type(input, 'Hello')
      
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Chat Messages', () => {
    it('should display user messages', () => {
      const userMessage = { id: 1, text: 'User message', sender: 'user', timestamp: '2023-01-01' }
      
      render(
        <TestWrapper>
          <Chat messages={[userMessage]} />
        </TestWrapper>
      )
      
      expect(screen.getByText('User message')).toBeInTheDocument()
    })

    it('should display bot messages', () => {
      const botMessage = { id: 1, text: 'Bot response', sender: 'bot', timestamp: '2023-01-01' }
      
      render(
        <TestWrapper>
          <Chat messages={[botMessage]} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Bot response')).toBeInTheDocument()
    })

    it('should show message timestamps', () => {
      const message = { id: 1, text: 'Message', sender: 'user', timestamp: '2023-01-01T10:30:00Z' }
      
      render(
        <TestWrapper>
          <Chat messages={[message]} />
        </TestWrapper>
      )
      
      expect(screen.getByText(/10:30/)).toBeInTheDocument()
    })

    it('should handle message loading states', () => {
      render(
        <TestWrapper>
          <Chat isLoading={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('chat-loading')).toBeInTheDocument()
    })

    it('should show typing indicators', () => {
      render(
        <TestWrapper>
          <Chat isTyping={true} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Bot is typing...')).toBeInTheDocument()
    })
  })

  describe('Chat Features', () => {
    it('should support file uploads', async () => {
      const user = userEvent.setup()
      const handleFileUpload = vi.fn()
      
      render(
        <TestWrapper>
          <Chat onFileUpload={handleFileUpload} />
        </TestWrapper>
      )
      
      const fileInput = screen.getByTestId('file-upload')
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, file)
      
      expect(handleFileUpload).toHaveBeenCalledWith(file)
    })

    it('should support emoji picker', () => {
      render(
        <TestWrapper>
          <Chat showEmojiPicker={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('emoji-picker')).toBeInTheDocument()
    })

    it('should handle message reactions', () => {
      const message = { 
        id: 1, 
        text: 'Message', 
        sender: 'user', 
        timestamp: '2023-01-01',
        reactions: { thumbsUp: 1 }
      }
      
      render(
        <TestWrapper>
          <Chat messages={[message]} />
        </TestWrapper>
      )
      
      expect(screen.getByText('👍 1')).toBeInTheDocument()
    })

    it('should support message threads', () => {
      const threadMessage = { 
        id: 1, 
        text: 'Main message', 
        sender: 'user', 
        timestamp: '2023-01-01',
        replies: [{ id: 2, text: 'Reply', sender: 'user', timestamp: '2023-01-01' }]
      }
      
      render(
        <TestWrapper>
          <Chat messages={[threadMessage]} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Reply')).toBeInTheDocument()
      expect(screen.getByText('1 reply')).toBeInTheDocument()
    })
  })

  describe('Chat History', () => {
    it('should load chat history', () => {
      const history = [
        { id: 1, text: 'Old message', sender: 'user', timestamp: '2023-01-01' },
      ]
      
      render(
        <TestWrapper>
          <Chat chatHistory={history} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Old message')).toBeInTheDocument()
    })

    it('should handle infinite scroll', async () => {
      const user = userEvent.setup()
      const handleLoadMore = vi.fn()
      
      render(
        <TestWrapper>
          <Chat onLoadMore={handleLoadMore} />
        </TestWrapper>
      )
      
      // Simulate scroll to top
      const chatContainer = screen.getByTestId('chat-container')
      fireEvent.scroll(chatContainer, { target: { scrollTop: 0 } })
      
      await waitFor(() => {
        expect(handleLoadMore).toHaveBeenCalled()
      })
    })

    it('should show scroll to bottom button', () => {
      render(
        <TestWrapper>
          <Chat hasNewMessages={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('scroll-to-bottom')).toBeInTheDocument()
    })
  })

  describe('Chat Settings', () => {
    it('should show chat settings panel', () => {
      render(
        <TestWrapper>
          <Chat showSettings={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('chat-settings')).toBeInTheDocument()
    })

    it('should handle theme changes', () => {
      render(
        <TestWrapper>
          <Chat theme="dark" />
        </TestWrapper>
      )
      
      const chatContainer = screen.getByTestId('chat-container')
      expect(chatContainer).toHaveClass('dark')
    })

    it('should handle sound notifications', () => {
      render(
        <TestWrapper>
          <Chat soundEnabled={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('sound-enabled')).toBeInTheDocument()
    })
  })

  describe('Chat Search', () => {
    it('should have search functionality', () => {
      render(
        <TestWrapper>
          <Chat showSearch={true} />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('chat-search')).toBeInTheDocument()
    })

    it('should highlight search results', () => {
      const messages = [
        { id: 1, text: 'Hello world', sender: 'user', timestamp: '2023-01-01' },
      ]
      
      render(
        <TestWrapper>
          <Chat messages={messages} searchQuery="world" />
        </TestWrapper>
      )
      
      const highlighted = screen.getByText('world')
      expect(highlighted).toHaveClass('bg-yellow-200')
    })
  })

  describe('Chat Status', () => {
    it('should show connection status', () => {
      render(
        <TestWrapper>
          <Chat connectionStatus="connected" />
        </TestWrapper>
      )
      
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should show online users', () => {
      const onlineUsers = [
        { id: 1, name: 'User 1', status: 'online' },
        { id: 2, name: 'User 2', status: 'away' },
      ]
      
      render(
        <TestWrapper>
          <Chat onlineUsers={onlineUsers} />
        </TestWrapper>
      )
      
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 2')).toBeInTheDocument()
    })
  })

  describe('Chat Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Chat ariaLabel="Chat interface" />
        </TestWrapper>
      )
      
      const chatContainer = screen.getByTestId('chat-container')
      expect(chatContainer).toHaveAttribute('aria-label', 'Chat interface')
    })

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <Chat />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      input.focus()
      
      expect(input).toHaveFocus()
    })

    it('should announce new messages', () => {
      const newMessage = { id: 1, text: 'New message', sender: 'bot', timestamp: '2023-01-01' }
      
      render(
        <TestWrapper>
          <Chat messages={[newMessage]} announceNewMessages={true} />
        </TestWrapper>
      )
      
      const message = screen.getByText('New message')
      expect(message).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Chat Performance', () => {
    it('should handle large message lists efficiently', () => {
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        text: `Message ${i}`,
        sender: i % 2 === 0 ? 'user' : 'bot',
        timestamp: `2023-01-${String(Math.floor(i / 30) + 1).padStart(2, '0')}`,
      }))
      
      render(
        <TestWrapper>
          <Chat messages={messages} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Message 0')).toBeInTheDocument()
      expect(screen.getByText('Message 999')).toBeInTheDocument()
    })

    it('should virtualize long message lists', () => {
      const messages = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        text: `Message ${i}`,
        sender: 'user',
        timestamp: '2023-01-01',
      }))
      
      render(
        <TestWrapper>
          <Chat messages={messages} virtualize={true} />
        </TestWrapper>
      )
      
      // Only visible messages should be rendered
      expect(screen.getByText('Message 0')).toBeInTheDocument()
    })
  })

  describe('Chat Error Handling', () => {
    it('should handle send message errors', async () => {
      const user = userEvent.setup()
      const handleSendMessage = vi.fn(() => Promise.reject(new Error('Send failed')))
      
      render(
        <TestWrapper>
          <Chat onSendMessage={handleSendMessage} />
        </TestWrapper>
      )
      
      const input = screen.getByTestId('chat-input')
      const sendButton = screen.getByTestId('chat-send')
      
      await user.type(input, 'Hello')
      await user.click(sendButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to send message')).toBeInTheDocument()
      })
    })

    it('should handle connection errors', () => {
      render(
        <TestWrapper>
          <Chat connectionError={new Error('Connection failed')} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
      expect(screen.getByTestId('retry-connection')).toBeInTheDocument()
    })
  })
})
