import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogoutIcon, UserCircleIcon, PlusIcon, TrashIcon, EllipsisVerticalIcon, BanIcon, PencilIcon } from './icons/Icons';
import { User, UserRole } from '../types';
import { DEFAULT_ADMIN_USER } from '../constants';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout, users, addUser, deleteUser, updateUserStatus, updateUser } = useAppContext();
  
  // State for adding a user
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // State for user management menus and modals
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [suspendDays, setSuspendDays] = useState<number>(7);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // State for the edit form
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [editMessage, setEditMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveUserMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingUser) {
        setEditName(editingUser.name);
        setEditUsername(editingUser.username);
        setEditRole(editingUser.role);
        setEditPassword('');
        setEditMessage(null);
    }
  }, [editingUser]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
        setMessage({ type: 'error', text: 'All fields are required.' });
        return;
    }

    const newUser: User = { name, username, password, role, status: 'active' };
    const result = addUser(newUser);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
        setName('');
        setUsername('');
        setPassword('');
        setRole(UserRole.EMPLOYEE);
        setTimeout(() => setMessage(null), 3000);
    }
  };
  
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName || !editUsername) {
        setEditMessage({ type: 'error', text: 'Name and Username are required.'});
        return;
    }
    
    const updates: Partial<User> = {
        name: editName,
        username: editUsername,
        role: editRole,
    };

    if (editPassword) {
        updates.password = editPassword;
    }

    const result = updateUser(editingUser.username, updates);
    setEditMessage({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
        setTimeout(() => {
            setEditingUser(null);
        }, 1500);
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
        deleteUser(userToDelete.username);
        setUserToDelete(null);
    }
  };

  const handleSuspendUser = () => {
    if (userToSuspend) {
        const suspendedUntil = Date.now() + suspendDays * 24 * 60 * 60 * 1000;
        updateUserStatus(userToSuspend.username, 'suspended', suspendedUntil);
        setUserToSuspend(null);
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, <strong>{currentUser?.name}</strong>!</span>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <LogoutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value={UserRole.EMPLOYEE}>Employee</option>
                        <option value={UserRole.TECH}>Tech Support</option>
                    </select>
                </div>
                <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add User
                </button>
                {message && <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Existing Users ({users.length})</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {users.map(user => (
                    <div key={user.username} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={() => user.username !== DEFAULT_ADMIN_USER.username && setEditingUser(user)}>
                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {user.status === 'suspended' && (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Suspended
                                </span>
                            )}
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">{getRoleDisplayName(user.role)}</span>
                            {user.username !== DEFAULT_ADMIN_USER.username && (
                                <div ref={user.username === activeUserMenu ? menuRef : null} className="relative">
                                    <button onClick={() => setActiveUserMenu(prev => prev === user.username ? null : user.username)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {activeUserMenu === user.username && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-600">
                                            <button onClick={() => { setEditingUser(user); setActiveUserMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                                <PencilIcon className="w-4 h-4 mr-2"/> Edit User
                                            </button>
                                            <button onClick={() => { setUserToSuspend(user); setActiveUserMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                                <BanIcon className="w-4 h-4 mr-2"/> Suspend User
                                            </button>
                                            <button onClick={() => { setUserToDelete(user); setActiveUserMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                                                <TrashIcon className="w-4 h-4 mr-2"/> Delete User
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
        
        {/* Modals */}
        {editingUser && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form onSubmit={handleUpdateUser} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
                    <h3 className="text-lg font-bold mb-2">Edit User: {editingUser.name}</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password (optional)</label>
                        <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Leave blank to keep current password" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value={UserRole.EMPLOYEE}>Employee</option>
                            <option value={UserRole.TECH}>Tech Support</option>
                        </select>
                    </div>
                    {editMessage && <p className={`text-sm ${editMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{editMessage.text}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-blue-600 hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        )}

        {userToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete user <strong>{userToDelete.name}</strong> (@{userToDelete.username})? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleDeleteUser} className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-red-600 hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </div>
        )}

        {userToSuspend && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold mb-2">Suspend User</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">How many days would you like to suspend <strong>{userToSuspend.name}</strong> for?</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suspension Duration (days)</label>
                        <input type="number" value={suspendDays} onChange={e => setSuspendDays(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setUserToSuspend(null)} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleSuspendUser} className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-yellow-500 hover:bg-yellow-600">Suspend</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;