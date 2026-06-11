import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Phone, Video, Info, Search, Circle, Smile, Image, Paperclip } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getInitials } from '../lib/utils'
import { mockMesses } from '../data/mockData'

interface Message {
  id: string
  sender_id: string
  text: string
  timestamp: string
}

interface ChatChannel {
  id: string
  name: string
  role: string
  avatar?: string
  lastMessage: string
  unread: boolean
  messages: Message[]
}

const initialChats: ChatChannel[] = [
  {
    id: 'c1',
    name: 'Suresh Kumar (Sunshine PG)',
    role: 'Property Owner',
    lastMessage: 'Sure, you can visit tomorrow at 4 PM.',
    unread: true,
    messages: [
      { id: '1', sender_id: 'user', text: 'Hello! Is the shared room still available?', timestamp: '10:00 AM' },
      { id: '2', sender_id: 'c1', text: 'Yes, we have 2 sharing beds available.', timestamp: '10:02 AM' },
      { id: '3', sender_id: 'user', text: 'Great. Can I come for a physical visit?', timestamp: '10:05 AM' },
      { id: '4', sender_id: 'c1', text: 'Sure, you can visit tomorrow at 4 PM.', timestamp: '10:06 AM' },
    ]
  },
  {
    id: 'c2',
    name: 'Lalita Sharma (Maa Ki Rasoi)',
    role: 'Mess Owner',
    lastMessage: 'Yes, we serve pure veg food.',
    unread: false,
    messages: [
      { id: '1', sender_id: 'user', text: 'Do you offer dinner-only subscription?', timestamp: 'Yesterday' },
      { id: '2', sender_id: 'c2', text: 'Yes, it is ₹1800 per month.', timestamp: 'Yesterday' },
      { id: '3', sender_id: 'user', text: 'Are meals pure veg?', timestamp: 'Yesterday' },
      { id: '4', sender_id: 'c2', text: 'Yes, we serve pure veg food.', timestamp: 'Yesterday' },
    ]
  },
]

export default function ChatPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const targetOwner = searchParams.get('owner')
  const [chats, setChats] = useState<ChatChannel[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState('c1')

  useEffect(() => {
    const ownerId = searchParams.get('owner')
    const messId = searchParams.get('mess')
    const propertyId = searchParams.get('property')
    
    if (ownerId) {
      const exists = chats.some(c => c.id === ownerId)
      if (!exists) {
        let targetName = 'Property Owner'
        let entityName = ''
        
        if (messId) {
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.startsWith('campusnest-mess-profile-')) {
                const messVal = localStorage.getItem(key)
                if (messVal) {
                  const parsed = JSON.parse(messVal)
                  if (parsed.id === messId) {
                    entityName = parsed.name
                    break
                  }
                }
              }
            }
            if (!entityName) {
              const baseMess = mockMesses.find(m => m.id === messId)
              if (baseMess) entityName = baseMess.name
            }
            targetName = 'Mess Owner'
          } catch (e) {}
        } else if (propertyId) {
          try {
            const savedProps = localStorage.getItem('campus-nest-properties')
            if (savedProps) {
              const parsedProps = JSON.parse(savedProps)
              const found = parsedProps.find((p: any) => p.id === propertyId)
              if (found) entityName = found.title
            }
          } catch (e) {}
        }

        const newChannel: ChatChannel = {
          id: ownerId,
          name: entityName ? `Owner of ${entityName}` : `Business Owner (${targetName})`,
          role: targetName,
          lastMessage: 'Hello! I am interested in subscribing/booking.',
          unread: false,
          messages: [
            { id: `init-${Date.now()}`, sender_id: 'user', text: `Hello! I am interested in your listing: ${entityName || 'services'}.`, timestamp: 'Just now' }
          ]
        }
        
        setChats(prev => [newChannel, ...prev])
        setActiveChatId(ownerId)
      } else {
        setActiveChatId(ownerId)
      }
    }
  }, [searchParams])

  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  const sendMessage = () => {
    if (!inputMsg.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      sender_id: 'user',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: inputMsg,
          messages: [...chat.messages, newMsg]
        }
      }
      return chat
    }))
    setInputMsg('')

    // Simulate reply
    setTimeout(() => {
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender_id: activeChatId,
        text: 'Thanks for reaching out! Let me check and get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: replyMsg.text,
            messages: [...chat.messages, replyMsg]
          }
        }
        return chat
      }))
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 flex">
      <div className="max-w-6xl w-full mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex h-[calc(100vh-120px)] shadow-lg">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:white mb-3">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search contacts..." className="input-field pl-9 py-1.5 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id)
                  setChats(p => p.map(c => c.id === chat.id ? { ...c, unread: false } : c))
                }}
                className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${activeChatId === chat.id ? 'bg-brand-50 dark:bg-brand-950/20 border-l-4 border-brand-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                  {getInitials(chat.name)}
                  <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 fill-emerald-500 stroke-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{chat.name}</p>
                    {chat.unread && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-1">{chat.role}</p>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Window */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                {getInitials(activeChat.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{activeChat.name}</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Phone className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Video className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Info className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
            {activeChat.messages.map(msg => {
              const isMe = msg.sender_id === 'user'
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] text-right mt-1 opacity-70`}>{msg.timestamp}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><Paperclip className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><Image className="w-4 h-4" /></button>
            <input
              type="text"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 input-field py-2"
            />
            <button onClick={sendMessage} className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-glow">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
