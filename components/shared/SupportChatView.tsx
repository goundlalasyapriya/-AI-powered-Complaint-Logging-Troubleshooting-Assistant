import React, { useState, useEffect, useRef } from 'react';
import { SupportRequest, User, ChatMessage, MessageSender, UserRole } from '../../types';
import { PaperAirplaneIcon, XIcon, CheckCircleIcon } from '../icons/Icons';
import { useAppContext } from '../../context/AppContext';

interface SupportChatViewProps {
    request: SupportRequest;
    currentUser: User;
    onClose: () => void;
    onResolve: () => void;
}

const SupportChatView: React.FC<SupportChatViewProps> = ({ request, currentUser, onClose, onResolve }) => {
    const { updateSupportRequestChat } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>(request.chatHistory);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        setMessages(request.chatHistory);
    }, [request]);

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: currentUser.role === UserRole.TECH ? MessageSender.TECH : MessageSender.USER,
            text: input,
            timestamp: Date.now(),
        };
        
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        updateSupportRequestChat(request.id, updatedMessages);
        setInput('');
    };

    const renderMessage = (msg: ChatMessage) => {
        const isMyMessage = msg.sender === MessageSender.TECH && currentUser.role === UserRole.TECH || msg.sender === MessageSender.USER && currentUser.role === UserRole.EMPLOYEE;
        
        const getSenderDetails = () => {
            switch(msg.sender) {
                case MessageSender.USER: return { name: request.user.name, initial: request.user.name.charAt(0), color: 'bg-gray-400' };
                case MessageSender.TECH: return { name: 'Support', initial: 'S', color: 'bg-purple-500'};
                case MessageSender.AI: return { name: 'AI Assistant', initial: 'AI', color: 'bg-blue-500' };
                default: return { name: 'System', initial: 'S', color: 'bg-gray-500' };
            }
        }

        const senderDetails = getSenderDetails();

        return (
          <div key={msg.id} className={`flex items-end gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            {!isMyMessage && <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${senderDetails.color}`}>{senderDetails.initial}</div>}
            <div className={`max-w-lg p-3 rounded-2xl ${isMyMessage ? (currentUser.role === UserRole.TECH ? 'bg-purple-600 text-white rounded-br-none' : 'bg-blue-500 text-white rounded-br-none') : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
              <p>{msg.text}</p>
              <p className={`text-xs mt-1 text-right ${isMyMessage ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {isMyMessage && <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${currentUser.role === UserRole.TECH ? 'bg-purple-500' : 'bg-blue-500'}`}>{currentUser.name.charAt(0)}</div>}
          </div>
        );
      };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentUser.role === UserRole.TECH ? `Support Chat with ${request.user.name}` : 'Chat with Tech Support'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Requested at {new Date(request.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {currentUser.role === UserRole.TECH && (
                        <button onClick={onResolve} className="flex items-center px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <CheckCircleIcon className="w-5 h-5 mr-1" />
                            Mark as Resolved
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={currentUser.role === UserRole.TECH ? `Reply to ${request.user.name}...` : 'Type your message to support...'}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={handleSendMessage} className="p-2 text-white bg-purple-600 rounded-full disabled:bg-purple-300 hover:bg-purple-700" disabled={!input.trim()}>
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportChatView;