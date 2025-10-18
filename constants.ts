import { User, Problem, TechSolution, UserRole, SupportRequest, MessageSender, ChatMessage } from './types';

export const DEFAULT_ADMIN_USER: User = {
    username: 'admin',
    name: 'Administrator',
    password: 'admin',
    role: UserRole.ADMIN,
    status: 'active',
};

const mockEmployee1: User = { username: 'alice', name: 'Alice', password: 'password', role: UserRole.EMPLOYEE, status: 'active' };
const mockEmployee2: User = { username: 'bob', name: 'Bob', password: 'password', role: UserRole.EMPLOYEE, status: 'active' };
const mockTech1: User = { username: 'charlie', name: 'Charlie', password: 'password', role: UserRole.TECH, status: 'active' };

export const INITIAL_USERS: User[] = [
    DEFAULT_ADMIN_USER,
    mockEmployee1,
    mockEmployee2,
    mockTech1,
];


const initialChatHistory1: ChatMessage[] = [
    { id: 'ch1-1', sender: MessageSender.USER, text: "My printer is not working. It shows 'offline' status.", timestamp: Date.now() - 100000 },
    { id: 'ch1-2', sender: MessageSender.AI, text: "I understand you're having trouble with your printer. Have you tried restarting both the printer and your computer?", timestamp: Date.now() - 90000 },
    { id: 'ch1-3', sender: MessageSender.USER, text: "Yes, I did that, but it didn't help.", timestamp: Date.now() - 80000 },
    { id: 'ch1-4', sender: MessageSender.AI, text: "Okay, let's check the printer's connection. Is it connected via Wi-Fi or a USB cable?", timestamp: Date.now() - 70000 },
];

export const PROBLEMS: Problem[] = [
  { id: 'p1', title: 'Printer Offline', description: 'The office printer constantly shows as offline, preventing printing jobs from completing.', repeatCount: 15, submittedBy: mockEmployee1, submittedAt: Date.now() - 86400000, chatHistory: initialChatHistory1 },
  { id: 'p2', title: 'Cannot Connect to VPN', description: 'Users are unable to connect to the company VPN, getting a "Connection Timed Out" error.', repeatCount: 12, submittedBy: mockEmployee2, submittedAt: Date.now() - 172800000 },
  { id: 'p3', title: 'Slow Wi-Fi Speeds', description: 'Internet connection is extremely slow, especially during peak hours in the afternoon.', repeatCount: 8, submittedBy: mockEmployee1, submittedAt: Date.now() - 259200000 },
  { id: 'p4', title: 'Email Not Syncing on Phone', description: 'Outlook mobile app is not syncing new emails on either iOS or Android devices.', repeatCount: 5, submittedBy: mockEmployee2, submittedAt: Date.now() - 345600000 },
  { id: 'p5', title: 'Forgotten Password Reset', description: 'Users forget their password and the self-service reset tool is not working.', repeatCount: 3, submittedBy: mockEmployee1, submittedAt: Date.now() - 432000000 },
];

export const TECH_SOLUTIONS: TechSolution[] = [
  {
    id: 's1',
    problemId: 'p1',
    solvedBy: mockTech1,
    solvedAt: Date.now() - 500000,
    steps: [
      { id: 's1-1', description: 'Navigate to Control Panel > Devices and Printers.' },
      { id: 's1-2', description: 'Right-click the printer icon and select "Printer properties".' },
      { id: 's1-3', description: 'Go to the "Ports" tab and click "Configure Port".' },
      { id: 's1-4', description: 'Uncheck the "SNMP Status Enabled" box and click OK.' },
    ],
  },
];

export const SUPPORT_REQUESTS: SupportRequest[] = [
    {
        id: 'sr1',
        user: mockEmployee2,
        createdAt: Date.now() - 3600000,
        chatHistory: [
            { id: 'src1-1', sender: MessageSender.USER, text: "Hi, I can't log into my account.", timestamp: Date.now() - 3600000 },
            { id: 'src1-2', sender: MessageSender.AI, text: "I can help with that. Are you seeing any specific error message?", timestamp: Date.now() - 3500000 },
        ],
        status: 'open',
    },
    {
        id: 'sr2',
        user: mockEmployee1,
        createdAt: Date.now() - 7200000,
        chatHistory: [
            { id: 'src2-1', sender: MessageSender.USER, text: "My laptop screen is flickering.", timestamp: Date.now() - 7200000 },
        ],
        status: 'open',
    }
];