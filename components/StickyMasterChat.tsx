'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
    role: 'user' | 'model'
    content: string
    buttons?: string[] // Dynamic interactive options
}

export default function StickyMasterChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: "Assalam-o-Alaikum! ⚡ I am **Sticky Master**, your guide to the coolest stickers at StickyBits! Ask me about our anime/pop culture stickers, prices, custom orders, or shipping! How can I help you today? 💖"
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Adjust textarea height dynamically
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
        }
    }, [inputValue])

    const parseMessageButtons = (text: string): { cleanText: string, buttons?: string[] } => {
        const buttonRegex = /\[BUTTONS:\s*([^\]]+)\]/;
        const match = text.match(buttonRegex);
        if (match) {
            const cleanText = text.replace(buttonRegex, '').trim();
            const buttons = match[1].split(',').map(b => b.trim());
            return { cleanText, buttons };
        }
        return { cleanText: text };
    }

    const handleSend = async (textToSend?: string) => {
        const messageText = textToSend || inputValue.trim()
        if (!messageText || isLoading) return

        if (!textToSend) setInputValue('')
        
        // Add user message to state
        setMessages(prev => [...prev, { role: 'user', content: messageText }])
        setIsLoading(true)

        try {
            // Remove options/buttons from previous bot messages to avoid duplicate clicks
            setMessages(prev => prev.map(m => m.buttons ? { ...m, buttons: undefined } : m))

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageText }]
                })
            })

            const data = await response.json()
            if (response.ok && data.reply) {
                const { cleanText, buttons } = parseMessageButtons(data.reply);
                setMessages(prev => [...prev, { role: 'model', content: cleanText, buttons }])
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'model', content: "Oops! I encountered an issue. Please try again or ask me something else! 🥺" }
                ])
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [
                ...prev,
                { role: 'model', content: "Network error! Please check your internet connection and try again. 🌐" }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter, unless Shift or Ctrl is held down
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 font-body">
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-14 h-14 bg-[hsl(var(--primary))] text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 border-2 border-white cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                layoutId="chat-trigger"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                
                {/* Glowing Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-extrabold items-center justify-center">1</span>
                    </span>
                )}
            </motion.button>

            {/* Chat Box Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white border border-black/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
                    >
                        {/* Header */}
                        <div className="bg-[hsl(var(--primary))] text-primary-foreground p-4 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-display font-extrabold text-base tracking-wide flex items-center gap-1">
                                        Sticky Master
                                    </h3>
                                    <span className="text-xs text-white/80 font-medium">Online Guide</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/85 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col space-y-2"
                                >
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm font-medium ${
                                                msg.role === 'user'
                                                    ? 'bg-black text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-black/5 rounded-bl-none'
                                            }`}
                                        >
                                            <p className="whitespace-pre-line">
                                                {msg.content.split('**').map((chunk, i) => (
                                                    i % 2 === 1 ? <strong key={i} className="font-extrabold text-[hsl(var(--primary))]">{chunk}</strong> : chunk
                                                ))}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Render dynamic buttons if present */}
                                    {msg.buttons && msg.buttons.length > 0 && (
                                        <div className="flex flex-wrap gap-2 justify-start pl-2 animate-in fade-in duration-200">
                                            {msg.buttons.map((btnText, btnIdx) => (
                                                <button
                                                    key={btnIdx}
                                                    onClick={() => handleSend(btnText)}
                                                    className="bg-white border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                >
                                                    {btnText}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-500 border border-black/5 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm font-medium">
                                        <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--primary))]" />
                                        Sticky Master is typing...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-black/5 flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Sticky Master..."
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary transition-all font-semibold resize-none max-h-24 overflow-y-auto"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/90] text-primary-foreground p-3 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center justify-center h-[42px] w-[42px] mb-0.5"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
