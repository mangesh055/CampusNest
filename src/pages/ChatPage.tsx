import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, Video, Info, Search, Circle, Smile, Image, Paperclip, MessageSquare } from 'lucide-react'
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
  
  const [chats, setChats] = useState<ChatChannel[]>(() => {
    const saved = localStorage.getItem('campusnest-chats')
    if (saved) return JSON.parse(saved)
    return initialChats
  })
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    localStorage.setItem('campusnest-chats', JSON.stringify(chats))
  }, [chats])

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
    } else if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id)
    }
  }, [searchParams])

  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find(c => c.id === activeChatId)

  const prevChatIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (activeChat) {
      if (prevChatIdRef.current === activeChat.id) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      prevChatIdRef.current = activeChat.id
    }
  }, [activeChat?.id, activeChat?.messages.length])

  const sendMessage = () => {
    if (!inputMsg.trim() || !activeChatId) return
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
            unread: activeChatId !== chat.id, // Only mark unread if not currently viewing
            messages: [...chat.messages, replyMsg]
          }
        }
        return chat
      }))
    }, 1500)
  }

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 pt-16 flex overflow-hidden">
      <div className="w-full h-full bg-white dark:bg-slate-900 flex border-t border-slate-200 dark:border-slate-800">
        {/* Contacts Sidebar */}
        <div className="w-[350px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#111b21] h-full">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#202c33] flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
              {getInitials(user?.email || 'User')}
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-[#aebac1]">
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><Circle className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><MessageSquare className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><Info className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-2 bg-white dark:bg-[#111b21]">
            <div className="relative flex items-center bg-slate-100 dark:bg-[#202c33] rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-500 dark:text-[#aebac1] mr-3" />
              <input 
                type="text" 
                placeholder="Search or start new chat" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-[#8696a0]" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111b21]">
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id)
                  setChats(p => p.map(c => c.id === chat.id ? { ...c, unread: false } : c))
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${activeChatId === chat.id ? 'bg-slate-100 dark:bg-[#2a3942]' : 'hover:bg-slate-50 dark:hover:bg-[#202c33]'}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                  {getInitials(chat.name)}
                </div>
                <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/50 pb-3 -mb-3">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`font-medium text-base truncate ${chat.unread ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-900 dark:text-[#e9edef]'}`}>{chat.name}</p>
                    <p className={`text-xs ${chat.unread ? 'text-emerald-500 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-[#8696a0]'}`}>10:06 AM</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate ${chat.unread ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-[#8696a0]'}`}>{chat.lastMessage}</p>
                    {chat.unread && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredChats.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">
                No chats found.
              </div>
            )}
          </div>
        </div>

        {/* Message Window */}
        <div className="flex-1 flex flex-col relative bg-[#efeae2] dark:bg-[#0b141a]">
          {/* Subtle Background Pattern overlay (optional CSS pattern effect) */}
          <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {activeChat ? (
            <>
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#202c33] flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {getInitials(activeChat.name)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-[#e9edef] text-base leading-tight">{activeChat.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-[#8696a0]">
                      {activeChat.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-[#aebac1]">
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><Search className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-[#2a3942] rounded-full transition-colors"><Info className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-2 custom-scrollbar z-10 flex flex-col">
                <div className="text-center my-4">
                  <span className="bg-[#ffeecd] dark:bg-[#182229] text-slate-700 dark:text-[#ffd279] text-xs px-3 py-1.5 rounded-lg shadow-sm">
                    Messages are end-to-end encrypted. No one outside of this chat, not even CampusNest, can read or listen to them.
                  </span>
                </div>
                {activeChat.messages.map((msg, idx) => {
                  const isMe = msg.sender_id === 'user'
                  const prevMsg = idx > 0 ? activeChat.messages[idx - 1] : null
                  const showTail = !prevMsg || prevMsg.sender_id !== msg.sender_id
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1 }}
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showTail ? 'mt-2' : 'mt-0.5'}`}
                    >
                      <div className={`relative max-w-[65%] px-3 py-1.5 shadow-sm text-sm ${
                        isMe 
                          ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg ' + (showTail ? 'rounded-tr-none' : '')
                          : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-lg ' + (showTail ? 'rounded-tl-none' : '')
                      }`}>
                        {/* WhatsApp Bubble Tail */}
                        {showTail && (
                          <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2 bg-[#d9fdd3] dark:bg-[#005c4b]' : '-left-2 bg-white dark:bg-[#202c33]'} `} style={{ clipPath: isMe ? 'polygon(0 0, 0% 100%, 100% 0)' : 'polygon(0 0, 100% 100%, 100% 0)' }}></div>
                        )}
                        <p className="leading-relaxed pr-10 whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                        <span className="text-[10px] text-slate-500 dark:text-[#8696a0] absolute bottom-1 right-2">
                          {msg.timestamp.split(' ')[0]} {/* Simplified time */}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-[#202c33] flex items-center gap-3 z-10">
                <button className="text-slate-500 dark:text-[#aebac1] hover:text-slate-700 dark:hover:text-white transition-colors"><Smile className="w-6 h-6" /></button>
                <button className="text-slate-500 dark:text-[#aebac1] hover:text-slate-700 dark:hover:text-white transition-colors"><Paperclip className="w-6 h-6" /></button>
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg flex items-center px-4 py-2 shadow-sm">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-[#8696a0] p-0"
                  />
                </div>
                {inputMsg.trim() ? (
                  <button 
                    onClick={sendMessage} 
                    className="text-[#00a884] hover:text-[#008f6f] transition-colors"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                ) : (
                  <button className="text-slate-500 dark:text-[#aebac1] hover:text-slate-700 dark:hover:text-white transition-colors">
                    <Circle className="w-6 h-6" /> {/* Placeholder for microphone */}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center border-b-[6px] border-[#00a884] bg-slate-50 dark:bg-[#222e35] z-10">
              <div className="w-80 h-40 bg-slate-200 dark:bg-[#2a3942] rounded-2xl mb-8 flex flex-col items-center justify-center">
                <MessageSquare className="w-12 h-12 text-slate-400 dark:text-[#8696a0]" />
              </div>
              <h2 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4">CampusNest Web</h2>
              <p className="text-sm text-[#8696a0] max-w-md mx-auto leading-relaxed">
                Send and receive messages without keeping your phone online.<br/>
                Use CampusNest on up to 4 linked devices and 1 phone.
              </p>
              <p className="text-xs text-[#8696a0] absolute bottom-10 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-[#8696a0] rounded-sm flex items-center justify-center"><span className="w-1 h-1 bg-white dark:bg-[#222e35] rounded-full"></span></span> End-to-end encrypted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
