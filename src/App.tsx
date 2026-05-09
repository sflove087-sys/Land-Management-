/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  HandCoins, 
  Trash2, 
  Landmark,
  X,
  CreditCard,
  MapPin,
  Phone,
  TreeDeciduous,
  Banknote,
  Calendar,
  Wallet,
  Handshake,
  TrendingUp,
  CircleCheck,
  Printer,
  History,
  CheckCircle2,
  Save,
  FileBarChart,
  CalendarDays,
  FileDown,
  FileText,
  Hash,
  ShieldCheck,
  Shield,
  Info,
  User as UserIcon,
  Gavel,
  ScrollText,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, StatusFilter, INITIAL_USERS, SortConfig } from './types';
import { getDaysLeft, getStatus, formatDate, getTimeRemaining, toBn, downloadCSV } from './utils';
import { ChevronUp, ChevronDown, ArrowUpDown, LogIn, LogOut } from 'lucide-react';
import { db, auth, signInWithGoogle, logout as firebaseLogout } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const ActionSpinner = ({ isSuccess = false }: { isSuccess?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center rounded-[inherit]"
    role="status"
    aria-live="polite"
  >
    <div className="relative w-16 h-16 flex items-center justify-center">
      {isSuccess ? (
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" stroke="#e2136e" />
          <path className="checkmark-check" fill="none" stroke="#e2136e" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      ) : (
        <>
          <div className="absolute inset-0 border-4 border-bkash/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-bkash rounded-full border-t-transparent animate-spin"></div>
          <div className="w-2.5 h-2.5 bg-bkash rounded-full animate-pulse"></div>
        </>
      )}
    </div>
    <div className="mt-6 flex flex-col items-center">
      <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-1">
        {isSuccess ? 'সম্পন্ন হয়েছে' : 'প্রসেসিং হচ্ছে'}
      </p>
      {!isSuccess && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-bkash rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const Countdown = ({ dateStr }: { dateStr: string }) => {
  const { total, days, hours, minutes, seconds } = getTimeRemaining(dateStr);
  
  if (total < 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-sm">
        <Clock className="w-3 h-3" />
        <span className="font-black text-[9px] uppercase tracking-widest">Expired</span>
      </div>
    );
  }

  const units = [
    { label: 'দিন', value: days, active: true },
    { label: 'ঘন্টা', value: hours, active: days === 0 },
    { label: 'মিনিট', value: minutes, active: days === 0 && hours === 0 },
    { label: 'সেকেন্ড', value: seconds, active: false },
  ];

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
            u.label === 'দিন' 
              ? 'border-bkash bg-bkash/5' 
              : u.active ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className={`text-[11px] md:text-[13px] font-black tabular-nums leading-none ${
              u.label === 'দিন' ? 'text-bkash' : u.active ? 'text-slate-800' : 'text-slate-400'
            }`}>
              {toBn(String(u.value).padStart(2, '0'))}
            </span>
            <span className={`text-[5px] md:text-[6px] font-black uppercase tracking-tighter mt-0.5 ${
              u.label === 'দিন' ? 'text-bkash/70' : 'text-slate-400'
            }`}>
              {u.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const showSuccess = async () => {
    setIsSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSuccess(false);
  };
  const [liveTime, setLiveTime] = useState(new Date());
  
  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'card' | 'portfolio'>('details');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectingUser, setCollectingUser] = useState<User | null>(null);
  const [extendMonths, setExtendMonths] = useState<string>('');
  const [collectionAmount, setCollectionAmount] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportRange, setReportRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Live Clock Interval
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      const daysLeft = getDaysLeft(user.expireDate);
      const status = getStatus(daysLeft);
      const matchesFilter = filter === 'all' || status === filter;
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.mobile.includes(search) ||
        user.address.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortConfig.length > 0) {
      result.sort((a, b) => {
        for (const config of sortConfig) {
          const { field, direction } = config;
          const aValue = a[field];
          const bValue = b[field];

          if (aValue === bValue) continue;

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [users, filter, search, sortConfig]);

  const toggleSort = (field: keyof User, isMulti: boolean = false) => {
    setSortConfig(current => {
      const existing = current.find(c => c.field === field);
      
      if (!isMulti) {
        // Single column sort
        if (!existing) return [{ field, direction: 'asc' }];
        if (existing.direction === 'asc') return [{ field, direction: 'desc' }];
        return [];
      } else {
        // Multi column sort (Shift + Click behavior)
        if (!existing) return [...current, { field, direction: 'asc' }];
        if (existing.direction === 'asc') {
          return current.map(c => c.field === field ? { ...c, direction: 'desc' } : c);
        }
        return current.filter(c => c.field === field ? false : true);
      }
    });
  };

  const getSortIcon = (field: keyof User) => {
    const config = sortConfig.find(c => c.field === field);
    const index = sortConfig.findIndex(c => c.field === field);
    
    if (!config) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    
    return (
      <div className="flex items-center gap-1">
        {config.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-bkash" /> : <ChevronDown className="w-3 h-3 text-bkash" />}
        {sortConfig.length > 1 && (
          <span className="text-[7px] bg-bkash/10 text-bkash w-3 h-3 flex items-center justify-center rounded-full">
            {index + 1}
          </span>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    const totalAmount = users.reduce((acc, u) => acc + u.amount, 0);
    const totalCollected = users.reduce((acc, u) => acc + (u.amount - u.pwrBalance), 0);
    const active = users.filter(u => getStatus(getDaysLeft(u.expireDate)) === 'active').length;
    const warning = users.filter(u => getStatus(getDaysLeft(u.expireDate)) === 'warning').length;
    const collectionRate = totalAmount > 0 ? ((totalCollected / totalAmount) * 100).toFixed(1) : '0';

    return { totalAmount, active, warning, collectionRate, totalUsers: users.length };
  }, [users]);

  const handleAddEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;
    
    const formData = new FormData(form);
    setIsProcessing(true);
    
    const userData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      mobile: formData.get('mobile') as string,
      jomirPoriman: formData.get('jomirPoriman') as string,
      amount: parseFloat(formData.get('amount') as string),
      expireDate: formData.get('expireDate') as string,
      pwrBalance: parseFloat(formData.get('pwrBalance') as string),
      chukirdharirName: formData.get('chukirdharirName') as string,
    };

    try {
      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), userData);
      } else {
        await addDoc(collection(db, 'users'), userData);
      }
      setIsProcessing(false);
      await showSuccess();
      setShowAddEditModal(false);
      setEditingUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
      setIsProcessing(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'users', id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processCollection = async () => {
    if (!collectingUser || !extendMonths || !collectionAmount) return;
    setIsProcessing(true);
    
    const months = parseInt(extendMonths);
    const cost = parseFloat(collectionAmount);

    if (cost > collectingUser.pwrBalance) {
      alert(`পাওয়ার ব্যালেন্স অপর্যাপ্ত!\nপ্রয়োজন: ${cost} টাকা\nবর্তমান ব্যালেন্স: ${collectingUser.pwrBalance} টাকা`);
      setIsProcessing(false);
      return;
    }

    const currentExpiry = new Date(collectingUser.expireDate);
    currentExpiry.setMonth(currentExpiry.getMonth() + months);
    const newExpiryDate = currentExpiry.toISOString().split('T')[0];
    
    const newHistoryEntry = {
      date: new Date().toISOString(),
      amount: cost,
      monthsExtended: months,
      newExpiryDate: newExpiryDate
    };

    try {
      const updatedHistory = [...(collectingUser.history || []), newHistoryEntry];
      await updateDoc(doc(db, 'users', collectingUser.id), {
        expireDate: newExpiryDate,
        pwrBalance: collectingUser.pwrBalance - cost,
        history: updatedHistory
      });
      
      setIsProcessing(false);
      setShowCollectionModal(false);
      await showSuccess();
      setCollectingUser(null);
      setExtendMonths('');
      setCollectionAmount('');
      alert(`✅ টাকা সংগ্রহ ও মেয়াদ বৃদ্ধি সম্পন্ন!\n\nসংগ্রহ: ${toBn(cost.toLocaleString())} টাকা\nমেয়াদ বৃদ্ধি: ${toBn(months)} মাস`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${collectingUser.id}`);
      setIsProcessing(false);
    }
  };

  const handleOpenCollection = (user: User) => {
    setCollectingUser(user);
    setShowCollectionModal(true);
  };

  const handlePrint = async () => {
    window.focus();
    window.print();
    setIsProcessing(true);
    await showSuccess();
    setIsProcessing(false);
  };

  const handleLogout = async () => {
    setIsProcessing(true);
    try {
      await firebaseLogout();
      await showSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="spinner mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-[8px] uppercase">অথেন্টিকেশন চেক হচ্ছে...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 border border-slate-100 text-center"
        >
          <div className="bg-bkash w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-bkash/30">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">bKash Manager</h1>
          <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">Administrative Control</p>
          
          <button 
            onClick={async () => {
              setIsProcessing(true);
              try {
                await signInWithGoogle();
                await showSuccess();
              } catch (error: any) {
                console.error("Login failed:", error);
                alert(`Login failed: ${error.message || 'Unknown error'}. Please ensure this domain is added to Firebase Authorized Domains.`);
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isProcessing ? 'Signing In...' : 'Sign In with Google'}
          </button>
          
          <p className="mt-8 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Protected by Firebase Security</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-[10px] bg-slate-50">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          >
            <div className="spinner mb-4"></div>
            <p className="text-slate-500 font-bold tracking-widest text-[8px] uppercase">সিস্টেম লোড হচ্ছে...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-72 h-full bg-white text-slate-800 z-40 hidden lg:block border-r border-slate-100 shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-bkash p-2.5 rounded-2xl shadow-lg shadow-bkash/20">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-bkash tracking-tight">bKash Manager</h2>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Professional System</p>
            </div>
          </div>
        </div>
        
        <nav className="p-6 space-y-2" aria-label="Main Navigation">
          {[
            { id: 'all', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
            { id: 'active', label: 'সক্রিয়', icon: CheckCircle },
            { id: 'expired', label: 'মেয়াদ শেষ', icon: Clock },
            { id: 'warning', label: 'সতর্কতা', icon: AlertTriangle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as StatusFilter)}
              aria-current={filter === item.id ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                filter === item.id 
                  ? 'bg-bkash-light text-bkash shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wide">{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => setShowReportsModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-800"
          >
            <FileBarChart className="w-5 h-5 text-bkash" />
            <span className="text-[8px] uppercase tracking-wide">প্রতিবেদন</span>
          </button>
          
          <div className="pt-8 border-t border-slate-50 mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[8px] text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-10 pb-32 md:pb-10 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 md:mb-10 p-4 md:p-0 bg-white md:bg-transparent rounded-3xl md:rounded-0 shadow-sm md:shadow-none border border-slate-100 md:border-0 overflow-hidden w-full">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-black text-slate-800 leading-none tracking-tighter">ড্যাশবোর্ড</h1>
                <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest truncate hidden sm:block">চুক্তি ও পাওয়ার ব্যালেন্স ট্র্যাকিং</p>
                  <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                  <p className="text-bkash text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {liveTime.toLocaleTimeString('bn-BD')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <button 
                  onClick={handleLogout}
                  aria-label="লগআউট করুন"
                  className="p-3 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-rose-100"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setEditingUser(null); setShowAddEditModal(true); }}
                  aria-label="নতুন এন্ট্রি যোগ করুন"
                  className="p-3 bg-bkash text-white rounded-xl shadow-lg shadow-bkash/20 flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => { setEditingUser(null); setShowAddEditModal(true); }}
              className="hidden md:flex px-6 py-3.5 bg-bkash text-white rounded-2xl font-black shadow-lg shadow-bkash/20 hover:bg-bkash-dark transition-all hover:-translate-y-0.5 items-center gap-2 text-[10px] uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              নতুন এন্ট্রি যোগ করুন
            </button>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6 mb-4 md:mb-10 px-0 sm:px-0">
            {[
              { label: 'মোট চুক্তির টাকা', val: toBn(stats.totalAmount.toLocaleString()) + ' ৳', icon: Banknote, color: 'from-pink-500 to-bkash', action: () => setShowReportsModal(true) },
              { label: 'মোট ইউজার', val: toBn(stats.totalUsers), icon: Users, color: 'from-fuchsia-500 to-pink-600', action: () => { setFilter('all'); window.scrollTo({ top: 800, behavior: 'smooth' }); } },
              { label: 'সক্রিয় ইউজার', val: toBn(stats.active), icon: CircleCheck, color: 'from-emerald-400 to-emerald-600', action: () => { setFilter('active'); window.scrollTo({ top: 800, behavior: 'smooth' }); } },
              { label: 'সতর্কতা (৩০ দিন)', val: toBn(stats.warning), icon: AlertTriangle, color: 'from-amber-400 to-amber-600', action: () => { setFilter('warning'); window.scrollTo({ top: 800, behavior: 'smooth' }); } },
              { label: 'সংগ্রহের হার', val: toBn(stats.collectionRate) + '%', icon: TrendingUp, color: 'from-bkash to-bkash-dark', action: () => setShowReportsModal(true) },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ y: -5, cursor: 'pointer' }}
                onClick={stat.action}
                key={stat.label} 
                className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all group flex flex-col items-center text-center active:scale-95 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-2 shadow-lg shadow-pink-100 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight">{stat.val}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </section>

          {/* Dashboard Controls */}
          <div className="bg-white rounded-[2rem] p-3 md:p-5 mb-8 shadow-xl shadow-slate-100 border border-slate-100 flex flex-col xl:flex-row gap-4 md:gap-6 items-center w-full max-w-full overflow-hidden">
            <div className="flex-1 relative group w-full min-w-0">
              <div className="absolute inset-0 bg-bkash/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10 transition-colors group-focus-within:text-bkash" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="নাম, মোবাইল বা ঠিকানা দিয়ে খুঁজুন..." 
                aria-label="রেকর্ড খুঁজুন"
                className="relative w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/5 transition-all outline-none text-xs font-bold shadow-sm placeholder:text-slate-300 truncate"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto shrink-0 overflow-hidden">
              <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100/50 flex-1 md:flex-initial overflow-x-auto no-scrollbar scroll-smooth">
                {(['all', 'active', 'expired', 'warning'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    aria-pressed={filter === s}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 flex-1 md:flex-none ${
                      filter === s ? 'bg-white shadow-md text-bkash' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    {s === 'all' ? 'সব' : s === 'active' ? 'সক্রিয়' : s === 'expired' ? 'মেয়াদ শেষ' : 'সতর্কতা'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-[1.25rem] shadow-lg shadow-slate-900/10 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="px-3 py-2 flex items-center gap-2 text-slate-400 border-r border-slate-700/50 shrink-0">
                  <ArrowUpDown className="w-3 h-3" />
                  <span className="text-[7px] font-black uppercase tracking-widest hidden sm:inline">Sort By</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'amount', label: 'Ledger' },
                    { key: 'expireDate', label: 'Timeline' },
                  ].map((item) => {
                    const isActive = sortConfig.find(sc => sc.key === item.key);
                    return (
                      <button
                        key={item.key}
                        onClick={(e) => toggleSort(item.key as keyof User, e.shiftKey)}
                        aria-label={`Sort by ${item.label}`}
                        aria-pressed={!!isActive}
                        className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${
                          isActive ? 'bg-bkash text-white shadow-lg shadow-bkash/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                        } flex items-center justify-center gap-2`}
                      >
                        {item.label}
                        {isActive && (
                          isActive.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {filteredUsers.length > 0 ? (
              <>
                {/* Mobile Card View (shown below lg breakpoint) */}
                <div className="grid grid-cols-1 gap-3 lg:hidden">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        key={user.id}
                        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden relative group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-8 rounded-full ${
                              getStatus(getDaysLeft(user.expireDate)) === 'active' ? 'bg-emerald-500' : getStatus(getDaysLeft(user.expireDate)) === 'warning' ? 'bg-amber-500' : 'bg-bkash'
                            }`} />
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-800 uppercase tracking-tight text-[11px] truncate max-w-[170px]">
                                {user.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[9px] text-bkash font-black tracking-widest mt-0.5">
                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                <span>{toBn(user.mobile)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-bkash-light/20 text-bkash px-2.5 py-1 rounded-lg border border-bkash/5 font-black text-[10px]">
                            {toBn(user.pwrBalance.toLocaleString())} ৳
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                          <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-bkash" /> ঠিকানা
                            </p>
                            <p className="text-[9px] font-bold text-slate-600 truncate">{user.address}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-bkash" /> মেয়াদ শেষ
                            </p>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] font-black text-slate-800 leading-none">{formatDate(user.expireDate)}</p>
                              <div className="scale-[0.85] origin-left border-l border-slate-200 pl-3">
                                <Countdown dateStr={user.expireDate} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                          <button 
                            onClick={() => { setViewingUser(user); setViewMode('card'); setShowViewModal(true); }}
                            className="flex-1 py-2.5 bg-bkash/5 text-bkash font-black uppercase tracking-widest text-[7px] rounded-lg flex items-center justify-center gap-1.5 border border-bkash/10"
                          >
                            <CreditCard className="w-3 h-3" /> কার্ড
                          </button>
                          <div className="flex gap-1.5">
                            {[
                              { icon: Eye, color: 'text-slate-400 bg-slate-50 border-slate-100', onClick: () => { setViewingUser(user); setViewMode('details'); setShowViewModal(true); } },
                              { icon: Printer, color: 'text-blue-500 bg-blue-50 border-blue-100', onClick: () => { setViewingUser(user); setViewMode('portfolio'); setShowViewModal(true); } },
                              { icon: HandCoins, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', onClick: () => handleOpenCollection(user) },
                              { icon: Edit, color: 'text-amber-500 bg-amber-50 border-amber-100', onClick: () => { setEditingUser(user); setShowAddEditModal(true); } },
                              { icon: Trash2, color: 'text-rose-500 bg-rose-50 border-rose-100', onClick: () => { setUserToDelete(user); setShowDeleteModal(true); } },
                            ].map((action, i) => (
                              <button
                                key={i}
                                onClick={action.onClick}
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${action.color} active:scale-90`}
                              >
                                <action.icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Desktop Table View (shown lg and above) */}
                <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-collapse border-spacing-0">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100/50">
                          <th className="px-8 py-6 text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-slate-200" />
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">#</span>
                            </div>
                          </th>
                          <th 
                            className="px-4 py-6 text-left cursor-pointer group/th hover:bg-slate-100/50 transition-colors"
                            onClick={(e) => toggleSort('name', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'name')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'name')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('name', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover/th:text-bkash">ব্যবহারকারী তথ্য</span>
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-6 text-center cursor-pointer group/th hover:bg-slate-100/50 transition-colors"
                            onClick={(e) => toggleSort('jomirPoriman', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'jomirPoriman')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'jomirPoriman')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('jomirPoriman', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover/th:text-bkash">জমির পরিমাণ</span>
                              {getSortIcon('jomirPoriman')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-6 text-center cursor-pointer group/th hover:bg-slate-100/50 transition-colors"
                            onClick={(e) => toggleSort('amount', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'amount')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'amount')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('amount', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover/th:text-bkash">ব্যালেন্স / কন্ট্রাক্ট</span>
                              {getSortIcon('amount')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-6 text-center cursor-pointer group/th hover:bg-slate-100/50 transition-colors"
                            onClick={(e) => toggleSort('expireDate', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'expireDate')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'expireDate')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('expireDate', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover/th:text-bkash">সময়সীমা</span>
                              {getSortIcon('expireDate')}
                            </div>
                          </th>
                          <th className="px-8 py-6 text-right">
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">কমান্ডস</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout">
                          {filteredUsers.map((user, idx) => {
                            const daysLeft = getDaysLeft(user.expireDate);
                            const status = getStatus(daysLeft);
                            return (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={user.id} 
                                className="group hover:bg-slate-50/50 transition-all duration-300 relative"
                              >
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-6 rounded-full ${
                                      status === 'active' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-bkash'
                                    }`} />
                                    <span className="text-[9px] font-black text-slate-300 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-6">
                                  <div className="flex flex-col gap-1 max-w-[200px]">
                                    <h4 className="font-extrabold text-slate-800 uppercase tracking-tight text-[11px] group-hover:text-bkash transition-colors truncate">
                                      {user.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{user.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] text-bkash font-black tracking-widest mt-0.5">
                                      <Phone className="w-3 h-3 shrink-0" />
                                      <span>{toBn(user.mobile)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-6 text-center">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                    <span className="font-black text-[10px] uppercase tracking-tighter">{toBn(user.jomirPoriman)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-6">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bkash-light/20 text-bkash rounded-xl border border-bkash/5">
                                      <span className="text-[11px] font-black tabular-nums">{toBn(user.pwrBalance.toLocaleString())} ৳</span>
                                    </div>
                                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">টোটাল: {toBn(user.amount.toLocaleString())} ৳</span>
                                  </div>
                                </td>
                                <td className="px-4 py-6">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 tracking-tight tabular-nums">
                                      <Calendar className="w-3 h-3 text-slate-300" /> {formatDate(user.expireDate)}
                                    </div>
                                    <div className="scale-90 origin-top transition-transform group-hover:scale-100">
                                      <Countdown dateStr={user.expireDate} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <motion.button 
                                      whileHover={{ scale: 1.1, y: -2 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => { setViewingUser(user); setViewMode('card'); setShowViewModal(true); }}
                                      aria-label="কার্ড ভিউ"
                                      className="h-10 px-4 bg-bkash text-white rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-bkash/20"
                                    >
                                      <CreditCard className="w-4 h-4" /> কার্ড
                                    </motion.button>
                                    <div className="flex gap-1.5">
                                      {[
                                        { icon: Eye, label: 'বিস্তারিত তথ্য', color: 'text-slate-400 hover:bg-slate-900 border-slate-100', onClick: () => { setViewingUser(user); setViewMode('details'); setShowViewModal(true); } },
                                        { icon: HandCoins, label: 'টাকা সংগ্রহ', color: 'text-emerald-500 hover:bg-emerald-500 border-emerald-100', onClick: () => handleOpenCollection(user) },
                                        { icon: Edit, label: 'তথ্য সম্পাদন', color: 'text-amber-500 hover:bg-amber-500 border-amber-100', onClick: () => { setEditingUser(user); setShowAddEditModal(true); } },
                                        { icon: Trash2, label: 'ডিলিট করুন', color: 'text-rose-500 hover:bg-rose-50 border-rose-100', onClick: () => { setUserToDelete(user); setShowDeleteModal(true); } },
                                      ].map((action, i) => (
                                        <motion.button 
                                          key={i}
                                          whileHover={{ scale: 1.1, y: -2 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={action.onClick}
                                          aria-label={action.label}
                                          className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all bg-white hover:text-white ${action.color}`}
                                        >
                                          <action.icon className="w-4 h-4" />
                                        </motion.button>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 shadow-inner"
              >
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-bkash/5 rounded-full blur-2xl animate-pulse" />
                  <Search className="w-10 h-10 text-slate-200 relative z-10" />
                </div>
                <h3 className="text-slate-800 font-black uppercase tracking-[0.4em] text-[10px] mb-3">No Records Found</h3>
                <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  We couldn't find any matches for your current search or filters.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <Modal 
            title="ব্যবহারকারী ডিলিট করুন" 
            onClose={() => setShowDeleteModal(false)}
            isLoading={isProcessing}
          >
            <div className="text-center p-4">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">আপনি কি নিশ্চিত?</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
                আপনি <span className="text-rose-600">"{userToDelete.name}"</span> এর সকল তথ্য ডিলিট করতে যাচ্ছেন। এই কাজটি করার পর আর ফিরিয়ে আনা সম্ভব হবে না।
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => deleteUser(userToDelete.id)}
                  disabled={isProcessing}
                  className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ডিলিট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> নিশ্চিত করুন
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-200 active:scale-95 transition-all"
                >
                  বাতিল করুন
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showAddEditModal && (
          <Modal 
            title={editingUser ? "তথ্য সম্পাদন করুন" : "নতুন এন্ট্রি যোগ করুন"} 
            onClose={() => setShowAddEditModal(false)}
            isLoading={isProcessing}
          >
            <form onSubmit={handleAddEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Users className="w-3 h-3" /> পূর্ণ নাম *</label>
                <input name="name" required defaultValue={editingUser?.name} placeholder="যেমন: মোঃ রহিম মিয়া" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Phone className="w-3 h-3" /> মোবাইল নম্বর *</label>
                <input name="mobile" required defaultValue={editingUser?.mobile} placeholder="01XXXXXXXXX" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3" /> ঠিকানা *</label>
                <textarea name="address" rows={2} required defaultValue={editingUser?.address} placeholder="গ্রাম, পোস্ট, জেলা" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all resize-none text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><TreeDeciduous className="w-3 h-3" /> জমির পরিমাণ *</label>
                <input name="jomirPoriman" required defaultValue={editingUser?.jomirPoriman} placeholder="যেমন: ৫ কাঠা, ২ বিঘা" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Banknote className="w-3 h-3" /> চুক্তির পরিমাণ (টাকা) *</label>
                <input type="number" name="amount" required defaultValue={editingUser?.amount} placeholder="যেমন: 50000" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> মেয়াদ শেষের তারিখ *</label>
                <input type="date" name="expireDate" required defaultValue={editingUser?.expireDate} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Wallet className="w-3 h-3" /> পাওয়ার ব্যালেন্স (টাকা) *</label>
                <input type="number" name="pwrBalance" required defaultValue={editingUser?.pwrBalance} placeholder="যেমন: 1000" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-bkash text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-bkash/20 hover:bg-bkash-dark active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <ActionSpinner /> : (
                    <>
                      <Save className="w-4 h-4" /> {editingUser ? "পরিবর্তন সংরক্ষণ" : "নতুন ইউজার যোগ করুন"}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  disabled={isProcessing}
                  onClick={() => setShowAddEditModal(false)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showViewModal && viewingUser && (
          <Modal 
            title="প্রোফাইল ইনফর্মেশন" 
            onClose={() => setShowViewModal(false)}
            isLoading={isProcessing}
            isSuccess={isSuccess}
          >
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 no-print">
              <button 
                onClick={() => setViewMode('details')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'details' ? 'bg-white shadow-sm text-bkash' : 'text-slate-500'
                }`}
              >
                বিস্তারিত তথ্য
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'card' ? 'bg-white shadow-sm text-bkash' : 'text-slate-500'
                }`}
              >
                প্রিন্টেবল কার্ড
              </button>
              <button 
                onClick={() => setViewMode('portfolio')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'portfolio' ? 'bg-white shadow-sm text-bkash' : 'text-slate-500'
                }`}
              >
                পোর্টফোলিও
              </button>
            </div>

            <div id="print-area" className="w-full max-w-full overflow-x-hidden p-1">
              {viewMode === 'details' ? (
                <div id="print-details" className="space-y-6">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200/50">
                      <div className="w-16 h-16 rounded-2xl bg-bkash flex items-center justify-center text-white shadow-xl shadow-bkash/20">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800">{viewingUser.name}</h3>
                        <p className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-widest text-[8px] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-bkash" /> {viewingUser.address}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">মোবাইল নম্বর</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-bkash" /> {toBn(viewingUser.mobile)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">জমির পরিমাণ</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <TreeDeciduous className="w-4 h-4 text-emerald-500" /> {toBn(viewingUser.jomirPoriman)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">চুক্তিধারীর নাম</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2 text-[8px]">
                          <Handshake className="w-4 h-4 text-bkash" /> {viewingUser.chukirdharirName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">চুক্তির টাকা</p>
                        <p className="font-black text-bkash text-[10px]">{toBn(viewingUser.amount.toLocaleString())} ৳</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bkash-light rounded-3xl p-6 border border-bkash/10 flex justify-between items-center">
                    <div>
                      <div className="text-[8px] font-black text-bkash/60 uppercase tracking-widest mb-1">পাওয়ার ব্যালেন্স</div>
                      <div className="text-xl font-black text-bkash">{toBn(viewingUser.pwrBalance.toLocaleString())} ৳</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-black text-bkash/60 uppercase tracking-widest mb-1">মেয়াদ শেষ</div>
                      <div className="text-md font-black text-slate-700">{toBn(formatDate(viewingUser.expireDate))}</div>
                      <div className="mt-2 flex justify-end">
                        <Countdown dateStr={viewingUser.expireDate} />
                      </div>
                    </div>
                  </div>

                  {viewingUser.history && viewingUser.history.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <History className="w-4 h-4 text-bkash" /> লেনদেনের বিস্তারিত ইতিহাস
                      </h4>
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {[...viewingUser.history].reverse().map((h, idx) => (
                          <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-bkash/10 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bkash transition-colors">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-800">{toBn(formatDate(h.date))}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">কালেকশন তারিখ</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                              <div className="text-right">
                                <p className="font-black text-emerald-600 text-[8px]">{toBn(h.amount.toLocaleString())} ৳</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase">সংগৃহীত</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-bkash text-[8px]">+{toBn(h.monthsExtended)} মাস</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase">বৃদ্ধি</p>
                              </div>
                              <div className="text-right hidden sm:block">
                                <p className="font-black text-slate-700 text-[8px]">{toBn(formatDate(h.newExpiryDate))}</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase">নতুন মেয়াদ</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : viewMode === 'card' ? (
                <div id="print-card" className="w-full max-w-sm mx-auto bg-white border-2 border-slate-900 rounded-sm p-4 md:p-6 overflow-hidden">
                  <div className="flex border-b border-slate-900 pb-3 mb-4 justify-between items-center text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">অফিসিয়াল কার্ড</span>
                    </div>
                    <span className="text-[8px] font-black uppercase">আইডি: {toBn(viewingUser.id.slice(-6).toUpperCase())}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight break-words">{viewingUser.name}</h3>
                    <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-slate-100">
                      {[
                        { label: 'মোবাইল', value: toBn(viewingUser.mobile) },
                        { label: 'ঠিকানা', value: viewingUser.address },
                        { label: 'জমির পরিমাণ', value: toBn(viewingUser.jomirPoriman) + ' শতাংশ' },
                        { label: 'ব্যালেন্স', value: toBn(viewingUser.pwrBalance.toLocaleString()) + ' ৳' },
                        { label: 'মেয়াদ শেষ', value: toBn(formatDate(viewingUser.expireDate)) },
                      ].map((item, idx) => (
                        <div key={idx} className="flex border-b border-slate-50 pb-1.5 overflow-hidden">
                          <span className="w-24 shrink-0 text-[8px] font-bold text-slate-400 uppercase">{item.label}:</span>
                          <span className="text-[9px] font-black text-slate-900 flex-1 min-w-0 break-words">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center pt-2">
                       <div className={`px-4 py-1 border border-slate-900 text-[7px] font-black uppercase tracking-[0.2em] ${
                         getDaysLeft(viewingUser.expireDate) < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                         {getDaysLeft(viewingUser.expireDate) < 0 ? 'মেয়াদ উত্তীর্ণ' : 'যাচাইকৃত ইউজার'}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="print-portfolio" className="bg-white min-h-[1100px] p-6 md:p-10 shadow-sm border border-slate-200 rounded-sm">
                  {/* Clean Formal Header */}
                  <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                    <h1 className="text-xl font-black text-slate-900 mb-1 uppercase">জমি বন্ধক ও অঙ্গীকারনামা</h1>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">অফিসিয়াল পোর্টফোলিও রিপোর্ট</p>
                    <div className="flex justify-between items-center mt-6 text-[8px] font-black text-slate-400">
                      <span>দলিল নং: {toBn(viewingUser.id.slice(-8).toUpperCase())}</span>
                      <span>তারিখ: {toBn(new Date().toLocaleDateString('bn-BD'))}</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Section 1: Parties */}
                    <section>
                      <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-900">
                        <span className="text-[9px] font-black">০১.</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">প্রাথমিক তথ্য</h3>
                      </div>
                      
                      <div className="space-y-1 px-4">
                        {[
                          { label: 'প্রথম পক্ষ (ইউজার)', value: viewingUser.name },
                          { label: 'পিতার নাম / স্বামী', value: viewingUser.chukirdharirName || '---' },
                          { label: 'মোবাইল নম্বর', value: toBn(viewingUser.mobile) },
                          { label: 'ঠিকানা', value: viewingUser.address },
                        ].map((item, idx) => (
                          <div key={idx} className="flex border-b border-slate-50 py-1 overflow-hidden">
                            <span className="w-32 shrink-0 text-[9px] font-bold text-slate-400 uppercase">{item.label}:</span>
                            <span className="text-[10px] font-black text-slate-900 break-words flex-1 min-w-0">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section 2: Property */}
                    <section>
                      <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-900">
                        <span className="text-[9px] font-black">০২.</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">সম্পত্তির বিবরণ</h3>
                      </div>
                      
                      <div className="space-y-1 px-4">
                        {[
                          { label: 'জমির পরিমাণ', value: toBn(viewingUser.jomirPoriman) + ' শতাংশ' },
                          { label: 'সম্পত্তির অবস্থান', value: viewingUser.address },
                        ].map((item, idx) => (
                          <div key={idx} className="flex border-b border-slate-50 py-1 overflow-hidden">
                            <span className="w-32 shrink-0 text-[9px] font-bold text-slate-400 uppercase">{item.label}:</span>
                            <span className="text-[10px] font-black text-slate-900 break-words flex-1 min-w-0">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section 3: Financials */}
                    <section>
                      <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-900">
                        <span className="text-[9px] font-black">০৩.</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">আর্থিক স্থিতি</h3>
                      </div>
                      
                      <div className="space-y-1 px-4">
                        {[
                          { label: 'মোট চুক্তির মূল্য', value: toBn(viewingUser.amount.toLocaleString()) + ' ৳' },
                          { label: 'পরিশোধিত টাকা', value: toBn((viewingUser.history || []).reduce((sum, h) => sum + h.amount, 0).toLocaleString()) + ' ৳' },
                          { label: 'পাওয়ার ব্যালেন্স', value: toBn(viewingUser.pwrBalance.toLocaleString()) + ' ৳', highlight: true },
                          { label: 'মেয়াদ শেষ', value: toBn(formatDate(viewingUser.expireDate)) },
                        ].map((item, idx) => (
                          <div key={idx} className={`flex border-b border-slate-50 py-1 overflow-hidden ${item.highlight ? 'bg-slate-50 px-1' : ''}`}>
                            <span className="w-32 shrink-0 text-[9px] font-bold text-slate-400 uppercase">{item.label}:</span>
                            <span className={`text-[10px] font-black flex-1 min-w-0 ${item.highlight ? 'text-slate-900' : 'text-slate-700'}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section 4: History Table */}
                    <section>
                      <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-900">
                        <span className="text-[9px] font-black">০৪.</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">লেনদেনের কিস্তি তালিকা</h3>
                      </div>
                      
                      <div className="px-1 overflow-x-auto">
                        <table className="w-full text-left border border-slate-200 table-fixed">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="w-10 px-2 py-1.5 text-[8px] font-black uppercase border-r border-slate-700 text-center">নং</th>
                              <th className="px-2 py-1.5 text-[8px] font-black uppercase border-r border-slate-700">তারিখ</th>
                              <th className="px-2 py-1.5 text-[8px] font-black uppercase border-r border-slate-700 text-right">আদায়</th>
                              <th className="w-12 px-2 py-1.5 text-[8px] font-black uppercase border-r border-slate-700 text-center">মাস</th>
                              <th className="px-2 py-1.5 text-[8px] font-black uppercase text-right">নতুন মেয়াদ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(viewingUser.history || []).map((h, i) => (
                              <tr key={i} className="border-b border-slate-100">
                                <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-50">{toBn(i + 1)}</td>
                                <td className="px-2 py-1.5 text-[9px] font-bold text-slate-700 border-r border-slate-50">{toBn(formatDate(h.date))}</td>
                                <td className="px-2 py-1.5 text-[9px] font-black text-slate-900 text-right border-r border-slate-50">{toBn(h.amount.toLocaleString())}</td>
                                <td className="px-2 py-1.5 text-[9px] font-bold text-slate-600 text-center border-r border-slate-50">{toBn(h.monthsExtended)}</td>
                                <td className="px-2 py-1.5 text-[9px] font-black text-slate-900 text-right">{toBn(formatDate(h.newExpiryDate))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 5: Signatures */}
                    <div className="mt-16 flex justify-between px-6">
                      <div className="text-center w-32">
                        <div className="border-b border-slate-300 mb-1"></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">ইউজার স্বাক্ষর</p>
                      </div>
                      <div className="text-center w-32">
                        <div className="border-b border-slate-300 mb-1"></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">কর্তৃপক্ষ স্বাক্ষর</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 no-print">
              <button 
                onClick={handlePrint}
                className="flex-1 py-4.5 bg-bkash text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-bkash/30 flex items-center justify-center gap-2 hover:bg-bkash-dark active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" /> {viewMode === 'card' ? 'কার্ড প্রিন্ট করুন' : viewMode === 'portfolio' ? 'পোর্টফোলিও প্রিন্ট করুন' : 'বিস্তারিত প্রিন্ট করুন'}
              </button>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="flex-1 py-4.5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 active:scale-95 transition-all"
              >
                বন্ধ করুন
              </button>
            </div>
          </Modal>
        )}

        {showCollectionModal && collectingUser && (
          <Modal 
            title="টাকা সংগ্রহ ও মেয়াদ বৃদ্ধি" 
            onClose={() => setShowCollectionModal(false)}
            isLoading={isProcessing}
            isSuccess={isSuccess}
          >
            {/* User Info Header */}
            <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-bkash flex items-center justify-center text-white shadow-lg shadow-bkash/10">
                  <Handshake className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-black text-slate-800 uppercase tracking-tight truncate">{collectingUser.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-bkash" /> {collectingUser.address}
                    </p>
                    <p className="text-[8px] font-black text-bkash uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {collectingUser.mobile}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Handshake className="w-3 h-3 text-bkash" /> {collectingUser.chukirdharirName}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <TreeDeciduous className="w-3 h-3 text-bkash" /> জমি: {collectingUser.jomirPoriman}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Banknote className="w-3 h-3 text-bkash" /> চুক্তির পরিমাণ: {toBn(collectingUser.amount.toLocaleString())} ৳
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-bkash-light border border-bkash/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-black text-bkash uppercase tracking-widest mb-1">বর্তমান ব্যালেন্স</p>
                <p className="text-xl font-black text-bkash">{toBn(collectingUser.pwrBalance.toLocaleString())} ৳</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">বর্তমান মেয়াদ</p>
                <p className="text-md font-black text-slate-700">{formatDate(collectingUser.expireDate)}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 tracking-widest"><Calendar className="w-4 h-4 text-bkash" /> কত মাস মেয়াদ বাড়াবেন? *</label>
                <input 
                  type="number" 
                  value={extendMonths}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExtendMonths(val);
                    const months = parseInt(val);
                    if (!isNaN(months) && months > 0) {
                      setCollectionAmount((months * 1000).toString());
                    } else {
                      setCollectionAmount('');
                    }
                  }}
                  placeholder="মাস সংখ্যা লিখুন (যেমন: 3)" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-md font-black text-slate-800 text-center sm:text-left" 
                />
                <p className="text-[8px] font-black text-amber-600 flex items-center justify-center sm:justify-start gap-1 px-1 uppercase tracking-tighter">
                  <AlertTriangle className="w-3 h-3" /> প্রতিটি মাসের জন্য ১০০০ টাকা চার্জ (পরিবর্তনযোগ্য)
                </p>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <label className="text-[8px] font-black text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 tracking-widest"><Banknote className="w-4 h-4 text-emerald-500" /> সংগ্রহের পরিমাণ (টাকা) *</label>
                <input 
                  type="number" 
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(e.target.value)}
                  placeholder="চার্জের পরিমাণ লিখুন" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-md font-black text-emerald-600 text-center sm:text-left" 
                />
              </div>

              {/* Summary / Preview */}
              {extendMonths && collectionAmount && !isNaN(parseInt(extendMonths)) && !isNaN(parseFloat(collectionAmount)) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5"
                >
                  <h4 className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> ট্রানজেকশন প্রিভিউ
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-bold text-emerald-600 uppercase">অবশিষ্ট ব্যালেন্স</p>
                      <p className="text-sm font-black text-emerald-800">{toBn((collectingUser.pwrBalance - parseFloat(collectionAmount)).toLocaleString())} ৳</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-emerald-600 uppercase">নতুন মেয়াদ</p>
                      <p className="text-sm font-black text-emerald-800">
                        {(() => {
                           const d = new Date(collectingUser.expireDate);
                           d.setMonth(d.getMonth() + parseInt(extendMonths));
                           return formatDate(d.toISOString().split('T')[0]);
                        })()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={processCollection}
                  disabled={isProcessing}
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      প্রসেসিং হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> সংগ্রহ সম্পন্ন করুন
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowCollectionModal(false)}
                  disabled={isProcessing}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  বাতিল করুন
                </button>
              </div>

              {/* Improved Collection History Section */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-bkash/5 flex items-center justify-center text-bkash">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[8px] font-black text-slate-800 uppercase tracking-widest">লেনদেনের ইতিহাস</h3>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">পূববর্তী সংগ্রহের রেকর্ডসমূহ</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">মোট: {collectingUser.history?.length || 0}</span>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {collectingUser.history && collectingUser.history.length > 0 ? (
                    [...collectingUser.history].reverse().map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-bkash/20 hover:shadow-lg transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-bkash group-hover:text-white transition-colors duration-300">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-800">{formatDate(item.date)}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">সংগ্রহের তারিখ</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 sm:gap-8">
                            <div className="text-center sm:text-right">
                              <p className="text-[8px] font-black text-emerald-600">{item.amount.toLocaleString()} ৳</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">টাকা</p>
                            </div>
                            <div className="text-center sm:text-right">
                              <p className="text-[8px] font-black text-bkash">+{item.monthsExtended} মাস</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">বর্ধিত</p>
                            </div>
                            <div className="text-center sm:text-right">
                              <p className="text-[8px] font-black text-slate-700">{formatDate(item.newExpiryDate)}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">নতুন মেয়াদ</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-slate-50/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-100">
                        <History className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">কোনো লেনদেনের ইতিহাস পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {showReportsModal && (
          <Modal 
            title="প্রতিবেদন জেনারেট করুন" 
            onClose={() => setShowReportsModal(false)}
            isSuccess={isSuccess}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-bkash" /> শুরু তারিখ
                  </label>
                  <input
                    type="date"
                    value={reportRange.start}
                    onChange={(e) => setReportRange({ ...reportRange, start: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-bkash focus:bg-white outline-none transition-all text-[10px] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-bkash" /> শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={reportRange.end}
                    onChange={(e) => setReportRange({ ...reportRange, end: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-bkash focus:bg-white outline-none transition-all text-[10px] font-bold"
                  />
                </div>
              </div>

              {(() => {
                const start = new Date(reportRange.start);
                const end = new Date(reportRange.end);
                end.setHours(23, 59, 59, 999);

                // Calculate stats for the period
                let periodCollections = 0;
                let periodContracts = 0;
                let activeInPeriod = 0;
                
                const reportData = users.map(user => {
                  const collections = (user.history || []).filter(h => {
                    const hDate = new Date(h.date);
                    return hDate >= start && hDate <= end;
                  });
                  
                  const totalCollected = collections.reduce((sum, h) => sum + h.amount, 0);
                  periodCollections += totalCollected;
                  periodContracts += user.amount;
                  
                  if (getDaysLeft(user.expireDate) >= 0) {
                    activeInPeriod++;
                  }

                  return {
                    'নাম': user.name,
                    'মোবাইল': user.mobile,
                    'ঠিকানা': user.address,
                    'জমির পরিমাণ': user.jomirPoriman,
                    'চুক্তির টাকা': user.amount,
                    'বর্তমান ব্যালেন্স': user.pwrBalance,
                    'মেয়াদ শেষ': user.expireDate,
                    'পিরিয়ডে সংগ্রহ': totalCollected
                  };
                });

                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                        <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">মোট সংগ্রহ</p>
                        <p className="text-sm font-black text-emerald-800">{toBn(periodCollections.toLocaleString())} ৳</p>
                      </div>
                      <div className="bg-bkash-light border border-bkash/10 p-4 rounded-2xl text-center">
                        <p className="text-[7px] font-black text-bkash uppercase tracking-widest mb-1">মোট চুক্তি</p>
                        <p className="text-sm font-black text-bkash">{toBn(periodContracts.toLocaleString())} ৳</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">সক্রিয় ইউজার</p>
                        <p className="text-sm font-black text-slate-800">{toBn(activeInPeriod)}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                      <button
                        onClick={() => downloadCSV(reportData, `Report_${reportRange.start}_to_${reportRange.end}.csv`)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <FileDown className="w-4 h-4" /> CSV এক্সপোর্ট করুন
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-8 right-6 z-30 md:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setEditingUser(null); setShowAddEditModal(true); }}
          aria-label="নতুন এন্ট্রি যোগ করুন"
          className="w-16 h-16 bg-bkash text-white rounded-full shadow-2xl shadow-bkash/40 flex items-center justify-center border-4 border-white"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
}

// Modal Component Helper
function Modal({ title, children, onClose, isLoading, isSuccess }: { title: string, children: React.ReactNode, onClose: () => void, isLoading?: boolean, isSuccess?: boolean }) {
  const modalId = React.useId();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      onClick={isLoading ? undefined : onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 lg:p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && <ActionSpinner isSuccess={isSuccess} />}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center mb-4 sm:mb-8 sticky top-0 bg-white z-10 py-1 sm:py-2 -mt-2"
        >
          <h2 id={modalId} className="text-sm sm:text-lg font-black text-slate-800 tracking-tight">{title}</h2>
          <button 
            disabled={isLoading}
            onClick={onClose} 
            aria-label="Close modal"
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
        </motion.div>
        <div className="pb-4 sm:pb-0">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
