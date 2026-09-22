import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Camera, Image as ImageIcon, Trash2, 
  RotateCcw, Bot, User, Utensils, Plus, Check, X, ArrowDown
} from 'lucide-react';
import { ChatMessage, MealType, PantryIngredient, UserGoals } from '../types';
import { processImageFile } from '../utils/storage';
import { 
  hapticLight, hapticMedium, hapticSelection, 
  hapticSuccess, hapticWarning 
} from '../utils/haptics';

interface GeminiChatViewProps {
  pantryIngredients: PantryIngredient[];
  goals: UserGoals;
  remainingCalories: number;
  initialPrompt?: string;
  onLogMeal: (item: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingAmount: number;
    servingUnit: string;
    mealType: MealType;
  }) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    text: `Hello! I'm your **iOS Chef & Nutrition AI**. I have direct access to your saved ingredients pantry and daily calorie targets.\n\nAsk me for custom recipes using what you have at home, calorie estimations, or meal plans!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({
  pantryIngredients,
  goals,
  remainingCalories,
  initialPrompt,
  onLogMeal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_chat_history');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [loggedRecipeTitle, setLoggedRecipeTitle] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Persist chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }, [messages]);

  // Trigger initial prompt if passed from pantry
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(`I have ${initialPrompt} in my pantry. What delicious recipe can I make with it and what are the calories?`);
    }
  }, [initialPrompt]);

  // Photo attachment
  const handleImageSelect = async (file: File) => {
    try {
      hapticMedium();
      const base64 = await processImageFile(file);
      setAttachedImage(base64);
    } catch (err) {
      console.error('Error processing photo for chat:', err);
    }
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : input;
    if ((!textToSend.trim() && !attachedImage) || isSending) return;

    hapticMedium();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'user',
      text: textToSend.trim(),
      imageBase64: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setAttachedImage(null);
    setIsSending(true);

    try {
      // Build pantry context for Gemini
      const pantryContext = pantryIngredients.map((ing) => ({
        name: ing.name,
        category: ing.category,
        quantity: ing.quantity,
        calories: ing.calories,
      }));

      // Send to server-side Gemini endpoint
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
            imageBase64: m.imageBase64,
          })),
          pantryContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await res.json();
      hapticSuccess();

      const modelMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Here is your recipe advice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      hapticWarning();
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: 'Sorry, I had trouble connecting to the Gemini service. Please make sure your server is running and your GEMINI_API_KEY is configured.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    hapticWarning();
    if (window.confirm('Clear all conversation history?')) {
      setMessages(INITIAL_MESSAGES);
      try {
        localStorage.removeItem('ios_calorie_chat_history');
      } catch {}
    }
  };

  // Quick prompt presets
  const quickPrompts = [
    'What can I cook with my saved ingredients?',
    'High-protein dinner under 500 kcal',
    'Quick 15-minute healthy lunch',
    'How do I budget my remaining calories today?',
  ];

  // Quick extract and log a recipe mentioned in message
  const handleQuickLogRecipe = (recipeText: string) => {
    hapticSuccess();
    // Parse title and calories if available
    let title = 'AI Suggested Meal';
    let calories = 450;
    let protein = 30;
    let carbs = 40;
    let fat = 15;

    const titleMatch = recipeText.match(/\*\*([^*]+)\*\*/);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/Recipe:?/i, '').trim();
    }

    const calMatch = recipeText.match(/(\d+)\s*(?:kcal|calories)/i);
    if (calMatch) {
      calories = parseInt(calMatch[1], 10);
    }

    const pMatch = recipeText.match(/(\d+)\s*g\s*protein/i);
    if (pMatch) protein = parseInt(pMatch[1], 10);

    const cMatch = recipeText.match(/(\d+)\s*g\s*carbs/i);
    if (cMatch) carbs = parseInt(cMatch[1], 10);

    const fMatch = recipeText.match(/(\d+)\s*g\s*fat/i);
    if (fMatch) fat = parseInt(fMatch[1], 10);

    onLogMeal({
      name: title,
      calories,
      protein,
      carbs,
      fat,
      servingAmount: 1,
      servingUnit: 'serving',
      mealType: 'dinner',
    });

    setLoggedRecipeTitle(title);
    setTimeout(() => setLoggedRecipeTitle(null), 3000);
  };

  return (
    <div className="flex flex-col h-[78vh] max-h-[750px] pb-20 select-none">
      {/* Top Header Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-4 border border-white/70 shadow-sm relative overflow-hidden shrink-0 mb-3">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl liquid-droplet-dark text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Gemini Chef AI
                </h2>
                <span className="px-2 py-0.5 rounded-full liquid-glass-subtle text-[9px] font-bold text-neutral-700 border border-white/60">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Pantry aware ({pantryIngredients.length} ingredients) • {remainingCalories} kcal left today
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="w-8 h-8 rounded-full liquid-droplet flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Thread Box */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1 py-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasRecipeLikelihood = !isUser && (msg.text.includes('Ingredients') || msg.text.includes('kcal') || msg.text.includes('Recipe'));

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[86%]">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full liquid-droplet-dark text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-[22px] text-xs leading-relaxed relative overflow-hidden transition-all shadow-sm ${
                    isUser
                      ? 'liquid-droplet-dark text-white rounded-br-sm'
                      : 'liquid-glass liquid-sheen text-neutral-900 border border-white/75 rounded-bl-sm'
                  }`}
                >
                  {/* Top razor specular edge for glass messages */}
                  {!isUser && (
                    <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
                  )}

                  {/* Attached photo thumbnail if user attached one */}
                  {msg.imageBase64 && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/40 max-h-44 w-full bg-black/10">
                      <img
                        src={msg.imageBase64}
                        alt="Attached ingredient"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Message body text */}
                  <div className="whitespace-pre-wrap space-y-1 font-normal">
                    {msg.text}
                  </div>

                  {/* Quick Action: Log Recipe to Diary */}
                  {hasRecipeLikelihood && (
                    <div className="mt-2.5 pt-2 border-t border-white/30 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-neutral-500">
                        Want to eat this?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickLogRecipe(msg.text)}
                        className="px-2.5 py-1 rounded-xl liquid-droplet-dark text-white text-[10px] font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log to Diary</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[9px] text-neutral-400 mt-0.5 px-2">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 pl-2 py-1">
            <div className="w-6 h-6 rounded-full liquid-droplet-dark text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="liquid-glass px-3.5 py-2 rounded-2xl border border-white/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recipe Logged Notification Banner */}
      {loggedRecipeTitle && (
        <div className="mb-2 liquid-droplet-dark text-white px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Added "{loggedRecipeTitle}" to Diary!</span>
          </div>
        </div>
      )}

      {/* Prompt Suggestion Chips */}
      <div className="py-1.5 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              hapticSelection();
              handleSendMessage(p);
            }}
            disabled={isSending}
            className="px-3 py-1 rounded-full liquid-glass-subtle text-[11px] font-semibold text-neutral-700 whitespace-nowrap hover:text-neutral-900 border border-white/60 transition-all active:scale-95 shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="liquid-glass-thick liquid-sheen rounded-[26px] p-2 border border-white/80 shadow-lg relative shrink-0">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* Attached photo preview chip */}
        {attachedImage && (
          <div className="flex items-center justify-between px-2 pb-1.5 mb-1.5 border-b border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/60 bg-black/10">
                <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-neutral-800">Photo attached for Gemini</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full liquid-droplet text-neutral-600 hover:text-neutral-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Photo attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-2xl liquid-droplet flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-95 transition-all shrink-0"
            title="Attach food photo"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
            className="hidden"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask recipes, calories, or meal ideas..."
            disabled={isSending}
            className="flex-1 bg-transparent px-2 text-xs text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSending || (!input.trim() && !attachedImage)}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              isSending || (!input.trim() && !attachedImage)
                ? 'liquid-glass-subtle text-neutral-400 cursor-not-allowed'
                : 'liquid-droplet-dark text-white active:scale-95 shadow-md'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
