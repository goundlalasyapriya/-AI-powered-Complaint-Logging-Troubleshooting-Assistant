import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogoutIcon, UserCircleIcon, InboxIcon, DocumentReportIcon } from './icons/Icons';
import RepeatingProblemsView from './tech/RepeatingProblemsView';
import SupportInboxView from './tech/SupportInboxView';

type View = 'repeating' | 'inbox';

const TechSupportDashboard: React.FC = () => {
    const { currentUser, logout } = useAppContext();
    const [view, setView] = useState<View>('repeating');

    const SideBarButton: React.FC<{
        label: string;
        icon: React.ReactNode;
        isActive: boolean;
        onClick: () => void;
    }> = ({ label, icon, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="ml-3 font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 flex flex-col shadow-lg">
                <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support Panel</h1>
                </div>
                <nav className="flex-1 mt-4">
                    <SideBarButton label="Repeating Problems" icon={<DocumentReportIcon className="w-6 h-6" />} isActive={view === 'repeating'} onClick={() => setView('repeating')} />
                    <SideBarButton label="Support Inbox" icon={<InboxIcon className="w-6 h-6" />} isActive={view === 'inbox'} onClick={() => setView('inbox')} />
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <UserCircleIcon className="w-10 h-10 text-gray-500" />
                        <div className="ml-3">
                            <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Support Team</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                        <LogoutIcon className="w-5 h-5 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-6 overflow-hidden">
                {view === 'repeating' && <RepeatingProblemsView />}
                {view === 'inbox' && <SupportInboxView />}
            </main>
        </div>
    );
};

export default TechSupportDashboard;
