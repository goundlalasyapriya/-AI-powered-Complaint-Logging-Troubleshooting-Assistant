import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Problem, TechSolution, SupportRequest, ChatMessage } from '../types';
import { INITIAL_USERS, PROBLEMS, TECH_SOLUTIONS, SUPPORT_REQUESTS } from '../constants';

// Custom hook for persistent state
const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // If item exists, parse it. If not, use the initial value.
            // Also handles the case where the stored value is "null".
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};


interface AppContextType {
    currentUser: User | null;
    login: (username: string, password: string, role: UserRole) => { success: boolean; message?: string };
    logout: () => void;
    users: User[];
    addUser: (user: User) => { success: boolean; message: string };
    updateUser: (username: string, updates: Partial<User>) => { success: boolean; message: string };
    deleteUser: (username: string) => void;
    updateUserStatus: (username: string, status: 'active' | 'suspended', suspendedUntil?: number) => void;
    problems: Problem[];
    addProblem: (problem: Problem) => void;
    starredProblems: string[];
    toggleStarProblem: (problemId: string) => void;
    currentUserHistory: Problem[];
    techSolutions: TechSolution[];
    addTechSolution: (solution: TechSolution) => void;
    updateTechSolution: (solution: TechSolution) => void;
    supportRequests: SupportRequest[];
    updateSupportRequestChat: (requestId: string, chatHistory: ChatMessage[]) => void;
    resolveSupportRequest: (requestId: string) => void;
    addSupportRequest: (request: SupportRequest) => void;
    startSupportChat: (requestId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('currentUser', null);
    const [users, setUsers] = usePersistentState<User[]>('users', INITIAL_USERS);
    const [problems, setProblems] = usePersistentState<Problem[]>('problems', PROBLEMS);
    const [techSolutions, setTechSolutions] = usePersistentState<TechSolution[]>('techSolutions', TECH_SOLUTIONS);
    const [supportRequests, setSupportRequests] = usePersistentState<SupportRequest[]>('supportRequests', SUPPORT_REQUESTS);
    const [starredProblems, setStarredProblems] = usePersistentState<Record<string, string[]>>('starredProblems', {});
    const [currentUserHistory, setCurrentUserHistory] = useState<Problem[]>([]);

    useEffect(() => {
        if (currentUser) {
            const history = problems.filter(p => p.submittedBy.username === currentUser.username);
            setCurrentUserHistory(history);
        } else {
            setCurrentUserHistory([]);
        }
    }, [currentUser, problems]);

    const login = (username: string, password: string, role: UserRole): { success: boolean; message?: string } => {
        const user = users.find(u => u.username === username && u.role === role);
        if (user) {
            if (user.status === 'suspended' && user.suspendedUntil && user.suspendedUntil > Date.now()) {
                // If suspension is expired, reactivate them
                if (user.suspendedUntil <= Date.now()) {
                    updateUserStatus(user.username, 'active', undefined);
                } else {
                    return { success: false, message: `Your account is suspended until ${new Date(user.suspendedUntil).toLocaleString()}.` };
                }
            }
            if (user.password === password) {
                const { password: _, ...userWithoutPassword } = user;
                setCurrentUser(userWithoutPassword);
                return { success: true };
            }
        }
        return { success: false, message: 'Invalid credentials or role mismatch.' };
    };

    const logout = () => {
        setCurrentUser(null);
    };
    
    const addUser = (user: User) => {
        if (users.some(u => u.username === user.username)) {
            return { success: false, message: 'Username already exists.' };
        }
        setUsers(prev => [...prev, user]);
        return { success: true, message: 'User added successfully!' };
    };

    const updateUser = (username: string, updates: Partial<User>) => {
        if (updates.username && users.some(u => u.username === updates.username && u.username !== username)) {
            return { success: false, message: 'New username is already taken.' };
        }
        setUsers(prev => prev.map(u => u.username === username ? { ...u, ...updates } : u));
        return { success: true, message: 'User updated successfully!' };
    };
    
    const deleteUser = (username: string) => {
        setUsers(prev => prev.filter(u => u.username !== username));
    };

    const updateUserStatus = (username: string, status: 'active' | 'suspended', suspendedUntil?: number) => {
        setUsers(prev => prev.map(u => u.username === username ? { ...u, status, suspendedUntil } : u));
    };
    
    const addProblem = (problem: Problem) => {
        setProblems(prev => [problem, ...prev]);
    };

    const toggleStarProblem = (problemId: string) => {
        if (!currentUser) return;
        const username = currentUser.username;
        setStarredProblems(prev => {
            const userStars = prev[username] || [];
            const newStars = userStars.includes(problemId)
                ? userStars.filter(id => id !== problemId)
                : [...userStars, problemId];
            return { ...prev, [username]: newStars };
        });
    };

    const addTechSolution = (solution: TechSolution) => {
        setTechSolutions(prev => [...prev, solution]);
    };

    const updateTechSolution = (updatedSolution: TechSolution) => {
        setTechSolutions(prev => prev.map(s => s.id === updatedSolution.id ? updatedSolution : s));
    };

    const updateSupportRequestChat = (requestId: string, chatHistory: ChatMessage[]) => {
        setSupportRequests(prev => prev.map(r => r.id === requestId ? { ...r, chatHistory } : r));
    };
    
    const startSupportChat = (requestId: string) => {
        setSupportRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'active' } : r));
    };

    const resolveSupportRequest = (requestId: string) => {
        setSupportRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'resolved' } : r));
    };

    const addSupportRequest = (request: SupportRequest) => {
        setSupportRequests(prev => [request, ...prev]);
    }

    return (
        <AppContext.Provider value={{
            currentUser, login, logout, users, addUser, updateUser, deleteUser, updateUserStatus, problems, addProblem,
            starredProblems: starredProblems[currentUser?.username || ''] || [], 
            toggleStarProblem, 
            currentUserHistory, techSolutions,
            addTechSolution, updateTechSolution, supportRequests, updateSupportRequestChat,
            resolveSupportRequest, addSupportRequest, startSupportChat
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};