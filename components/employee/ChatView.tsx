
import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { PaperAirplaneIcon, PaperClipIcon, SparklesIcon, XIcon, ShieldExclamationIcon } from '../icons/Icons';
import { ChatMessage, MessageSender, Problem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { generateContentStream } from '../../services/geminiService';

interface ChatViewProps {
    initialMessages?: ChatMessage[];
    onEscalate: (chatHistory: ChatMessage[]) => void;
}

const AI_SYSTEM_INSTRUCTION = "You are a helpful technical assistant. Your goal is to provide a clear, step-by-step, numbered list to solve the user's problem. Do not include any introductory or concluding conversational text, greetings, or pleasantries. Only provide the direct steps to follow.";

const ChatView: React.FC<ChatViewProps> = ({ initialMessages, onEscalate }) => {
    const { currentUser, addProblem } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' && !imageFile) return;

        setIsLoading(true);
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: MessageSender.USER,
            text: input,
            timestamp: Date.now(),
            image: imagePreview || undefined,
        };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Create a placeholder for the AI response
        const aiMessageId = `msg-ai-${Date.now()}`;
        const aiMessagePlaceholder: ChatMessage = {
            id: aiMessageId,
            sender: MessageSender.AI,
            text: '',
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessagePlaceholder]);
        
        setInput('');
        setImageFile(null);
        setImagePreview(null);
        
        try {
            const stream = await generateContentStream(input, imageFile, AI_SYSTEM_INSTRUCTION);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
                ));
            }

            // After successful response, check if this is a new problem to log
            if (updatedMessages.length === 1 && currentUser) { // If it's the first user message of a new chat
                const newProblem: Problem = {
                    id: `p-${Date.now()}`,
                    title: input.length > 50 ? input.substring(0, 47) + '...' : input,
                    description: input,
                    repeatCount: 1,
                    submittedBy: currentUser,
                    submittedAt: Date.now(),
                    chatHistory: [...updatedMessages, { ...aiMessagePlaceholder, text: fullResponse }]
                };
                addProblem(newProblem);
            }
        } catch (error) {
            console.error(error);
             setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">How can I help you today?</p>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender !== MessageSender.USER && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === MessageSender.USER ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                            {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-48" />}
                            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{__html: marked.parse(msg.text)}}></div>
                        </div>
                         {msg.sender === MessageSender.USER && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">{currentUser?.name.charAt(0)}</div>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {messages.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={() => onEscalate(messages)}
                        className="flex items-center px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        <ShieldExclamationIcon className="w-5 h-5 mr-2" />
                        Escalate to Tech Support
                    </button>
                </div>
            )}
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <PaperClipIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 relative">
                        {imagePreview && (
                             <div className="absolute bottom-12 left-0 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-md">
                                 <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
                                 <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                                     <XIcon className="w-4 h-4" />
                                 </button>
                             </div>
                        )}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 text-white bg-blue-600 rounded-full disabled:bg-blue-300 dark:disabled:bg-blue-800 hover:bg-blue-700">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;