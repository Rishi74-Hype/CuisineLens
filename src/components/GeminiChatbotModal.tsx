import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, RefreshCw, Zap, Brain, MessageSquare } from 'lucide-react';
import { AudioTranscriberButton } from './AudioTranscriberButton.tsx';
import { UserProfile } from '../types/nutrition.ts';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello ${userProfile.name || 'there'}! I am your AI Regional Nutritionist & Food Biochemist. I can help analyze authentic culinary fats, calculate glycemic impacts of regional staples, balance your ${userProfile.goal} calorie budget, or discuss phytochemical compounds like curcumin and capsaicin. What can I help you explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState('Regional Culinary Nutritionist & Food Biochemist');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roles = [
    'Regional Culinary Nutritionist & Food Biochemist',
    'Traditional Cooking Fat & Oil Specialist',
    'Metabolic Health & Glycemic Index Coach',
    'Phytochemical & Spice Science Analyst',
  ];

  const quickPrompts = [
    'How do ghee and mustard oil affect lipid profiles vs seed oils?',
    'How can I lower the glycemic spike from eating white basmati rice or tacos?',
    'What digestive enzymes break down lentils and beans to stop bloating?',
    'Does tempering spices (tadka) destroy curcumin or improve bioavailability?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          role: selectedRole,
          cuisineFocus: userProfile.cuisineFocus,
          userGoal: userProfile.goal,
          dailyCalories: userProfile.targetCalories,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || selectedModel,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'No reply generated');
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Sorry, I encountered an issue: ${err.message || 'Please try again'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: `Conversation restarted. How can I help you with your regional meals or nutrition science today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col transition-colors">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Regional Nutritionist Chat
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold">
                  Multi-Turn
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-xs sm:max-w-md">
                {selectedRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model & Persona Controls Bar */}
        <div className="px-5 py-2.5 bg-stone-100/70 dark:bg-stone-850/80 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Model Selector Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-750">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Fast (Lite)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Standard (3.8)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModel('gemini-4-argon')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>Deep STEM (Argon)</span>
            </button>
          </div>

          {/* Persona Role Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    isUser
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-800 dark:bg-stone-750 text-amber-300'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-wrap ${
                    isUser
                      ? 'bg-amber-600 text-white font-medium rounded-tr-xs'
                      : 'bg-stone-100 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-750 rounded-tl-xs'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="mt-1 flex items-center justify-between gap-3 text-[10px] opacity-70 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && <span>{msg.modelUsed}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-2 pl-10 animate-pulse">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
              <span>Thinking with {selectedModel}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-stone-850 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-stone-700 dark:text-stone-300 rounded-lg border border-stone-200 dark:border-stone-750 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar with Microphone Transcribe & Send */}
        <div className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
          {/* Audio Transcriber Microphone */}
          <AudioTranscriberButton
            onTranscribe={(transcription) => {
              setInputText(prev => (prev ? `${prev} ${transcription}` : transcription));
            }}
          />

          <input
            type="text"
            placeholder="Ask about regional foods, cooking fats, or speak with microphone..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
            className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-colors"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isSending || !inputText.trim()}
            className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
