export enum UserRole {
    EMPLOYEE = 'EMPLOYEE',
    TECH = 'TECH',
    ADMIN = 'ADMIN',
}

export interface User {
    username: string;
    name: string;
    password?: string;
    role: UserRole;
    status: 'active' | 'suspended';
    suspendedUntil?: number;
}

export enum MessageSender {
    USER = 'USER',
    AI = 'AI',
    TECH = 'TECH',
}

export interface ChatMessage {
    id: string;
    sender: MessageSender;
    text: string;
    timestamp: number;
    image?: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    repeatCount: number;
    submittedBy: User;
    submittedAt: number;
    chatHistory?: ChatMessage[];
}

export interface SolutionStep {
    id: string;
    description: string;
    imageUrl?: string;
}

export interface TechSolution {
    id: string;
    problemId: string;
    steps: SolutionStep[];
    solvedBy: User;
    solvedAt: number;
}

export interface SupportRequest {
    id:string;
    user: User;
    createdAt: number;
    chatHistory: ChatMessage[];
    status: 'open' | 'active' | 'resolved';
}