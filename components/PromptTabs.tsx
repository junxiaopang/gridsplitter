import React, { useState } from 'react';
import { Icons } from './Icon';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../contexts/AppContext';

interface PromptTabsProps {
  className?: string;
}

export const PromptTabs: React.FC<PromptTabsProps> = ({ className }) => {
  const { t, language } = useApp();
  const [activeTab, setActiveTab] = useState<string>('p1');
  const [copied, setCopied] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic content based on language
  const getContent = (tabId: string) => {
    if (tabId === 'ai') return aiPrompt;
    if (tabId === 'p1') return t('prompt_p1_content');
    if (tabId === 'p2') return t('prompt_p2_content');
    return '';
  };

  const currentContent = getContent(activeTab);

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeminiGenerate = async () => {
    if (!customKeyword.trim()) return;
    setIsGenerating(true);
    
    try {
      if (!process.env.API_KEY) {
        setAiPrompt(t('ai_key_hint'));
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash';
      
      const langInstruction = language === 'zh' ? '输出语言为中文。' : 'Output language must be English.';
      
      const prompt = `You are an expert Prompt Engineer for Midjourney/DALL-E.
      Based on the user topic: "${customKeyword}", write a detailed sticker pack generation prompt.
      
      Requirements:
      1. Style description (e.g., Q-version, Line style, 3D render).
      2. Layout requirements (Recommend 3x3 or 4x6 or 3x8 grid).
      3. Specific character expression/action descriptions.
      4. Must include text: "Generated image must be 4K resolution, 16:9".
      5. Must include text: "Do not copy original image".
      6. ${langInstruction}
      
      Directly output the prompt content without conversational filler.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      setAiPrompt(response.text || t('ai_fail'));
    } catch (error) {
      console.error(error);
      setAiPrompt(t('ai_fail'));
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'p1', label: t('preset_line') },
    { id: 'p2', label: t('preset_3d') }
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Segmented Control */}
      <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex mb-4 border border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <a
          href="http://prompts.kkkm.cn"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('btn_more')}
        </a>
      </div>
      <div className="relative group flex-1">
        <textarea
          readOnly
          value={currentContent}
          className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          placeholder={activeTab === 'ai' ? t('ai_placeholder') : ""}
        />
        {currentContent && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur shadow-sm border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all opacity-0 group-hover:opacity-100"
            title="Copy"
          >
            {copied ? <Icons.Check className="w-3.5 h-3.5 text-green-500" /> : <Icons.Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};