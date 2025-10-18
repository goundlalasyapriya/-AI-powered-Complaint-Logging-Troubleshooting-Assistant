import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SupportRequest } from '../../types';
import SupportChatView from '../shared/SupportChatView';

const SupportInboxView: React.FC = () => {
    const { supportRequests, resolveSupportRequest, currentUser, startSupportChat } = useAppContext();
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);

    const openRequests = useMemo(() => {
        return supportRequests.filter(r => r.status === 'open' || r.status === 'active');
    }, [supportRequests]);

    const handleSelectRequest = (request: SupportRequest) => {
        setSelectedRequest(request);
    };

    const handleCloseChat = () => {
        setSelectedRequest(null);
    };

    const handleResolve = () => {
        if (selectedRequest) {
            resolveSupportRequest(selectedRequest.id);
            setSelectedRequest(null);
        }
    }

    if (!currentUser) return null;

    return (
        <div className="h-full flex gap-6">
            <div className="w-1/3 h-full flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Support Inbox ({openRequests.length})</h1>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
                    {openRequests.length > 0 ? openRequests.map(request => (
                        <div
                            key={request.id}
                            onClick={() => handleSelectRequest(request)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedRequest?.id === request.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                            <div className="flex justify-between items-center">
                               <p className={`font-semibold ${selectedRequest?.id === request.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    Chat with {request.user.name}
                                </p>
                                {request.status === 'active' && <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">Active</span>}
                            </div>
                            <p className={`text-xs mt-1 ${selectedRequest?.id === request.id ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                Requested at {new Date(request.createdAt).toLocaleString()}
                            </p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 pt-8">No open support requests.</p>
                    )}
                </div>
            </div>
            <div className="w-2/3 h-full">
                {selectedRequest ? (
                    selectedRequest.status === 'active' ? (
                        <SupportChatView 
                            request={selectedRequest} 
                            currentUser={currentUser} 
                            onClose={handleCloseChat} 
                            onResolve={handleResolve}
                        />
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md text-center p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Request from {selectedRequest.user.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">Review the initial AI chat history and start a new chat to resolve the issue.</p>
                            <button 
                                onClick={() => startSupportChat(selectedRequest.id)}
                                className="px-6 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                                Start Chat
                            </button>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
                        <p>Select a request to view the chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportInboxView;