/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  UserCheck,
  Download,
  UserMinus,
  ArrowUpCircle,
  ArrowDownCircle,
  Ban,
  Volume2,
  VolumeX,
  Music,
  Bell,
  BellRing,
  Volume1,
  Settings,
  ToggleLeft,
  ToggleRight,
  Check,
  SlidersHorizontal,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
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

const ActionSpinner = ({ isSuccess = false, isError = false, errorMessage = "" }: { isSuccess?: boolean, isError?: boolean, errorMessage?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center rounded-[inherit]"
    role="status"
    aria-live="polite"
  >
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* 3D Blue Moving Elements */}
      {!isSuccess && !isError && (
        <div className="relative w-full h-full perspective-1000">
          <motion.div
            animate={{ 
              rotateX: [0, 360], 
              rotateY: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 border-[8px] border-blue-500/20 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)] border-t-blue-500"
          />
          <motion.div
            animate={{ 
              rotateX: [360, 0], 
              rotateY: [0, 360],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-4 border-[6px] border-bkash/20 rounded-full shadow-[0_0_30px_rgba(226,19,110,0.3)] border-b-bkash"
          />
          <motion.div
            animate={{ 
              y: [-15, 15, -15],
              rotateX: [0, 45, -45, 0],
              rotateY: [0, 360]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-8 bg-gradient-to-br from-blue-600 via-blue-500 to-bkash rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
          >
            <div className="relative">
               <Landmark className="w-10 h-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]" />
               <motion.div 
                 animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -inset-2 bg-white/20 rounded-full blur-md"
               />
            </div>
          </motion.div>
          
          {/* Orbital dots */}
          {[0, 120, 240].map((angle) => (
            <motion.div
              key={`orbit-${angle}`}
              animate={{ 
                rotate: [angle, angle + 360],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
            </motion.div>
          ))}
        </div>
      )}

      {isSuccess && (
        <div className="relative">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                x: Math.cos(i * 30 * Math.PI / 180) * 80,
                y: Math.sin(i * 30 * Math.PI / 180) * 80,
                rotate: 360
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
              className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-bkash' : i % 3 === 1 ? 'bg-emerald-400' : 'bg-blue-400'}`}
            />
          ))}
          <motion.div 
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 360 }}
            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-4 border-white/20 relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotateZ: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white drop-shadow-md" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {isError && (
        <motion.div 
          initial={{ scale: 0, rotateX: 180 }}
          animate={{ scale: 1, rotateX: 0 }}
          className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(244,63,94,0.4)] border-4 border-white/20"
        >
          <motion.div
            animate={{ x: [-3, 3, -3], rotateZ: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
          >
            <X className="w-12 h-12 text-white drop-shadow-md" />
          </motion.div>
        </motion.div>
      )}
    </div>

    <div className="mt-8 flex flex-col items-center w-full max-w-[240px]">
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-[12px] font-black text-slate-800 uppercase tracking-[0.4em] mb-4"
      >
        {isSuccess ? 'সফল হয়েছে' : isError ? 'ব্যর্থ হয়েছে' : 'প্রসেসিং হচ্ছে'}
      </motion.p>
      
      {!isSuccess && !isError ? (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-bkash via-blue-500 to-emerald-500"
          />
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 left-0 w-1/2 h-full bg-white/30 skew-x-12"
          />
        </div>
      ) : isSuccess ? (
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          className="w-full h-1.5 bg-emerald-500 rounded-full"
        />
      ) : (
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          className="w-full h-1.5 bg-rose-500 rounded-full"
        />
      )}
      
      <div className="mt-4 flex flex-col items-center">
        {(isSuccess || isError) ? (
          <>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-relaxed">
              {isSuccess ? 'ধন্যবাদ, আপনার অনুরোধটি সম্পন্ন হয়েছে' : (errorMessage || 'দুঃখিত, কোনো একটি সমস্যা হয়েছে')}
            </h4>
            {isError && !errorMessage && (
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Error Occurred</p>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-spinner-${i}`}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-slate-300 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const Countdown = ({ dateStr, compact }: { dateStr: string, compact?: boolean }) => {
  const { total, days, hours, minutes, seconds } = getTimeRemaining(dateStr);
  
  if (total < 0) {
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 ${compact ? 'scale-90' : ''}`}>
        <Clock className="w-2.5 h-2.5" />
        <span className="font-extrabold text-[8px] uppercase tracking-tighter">Expired</span>
      </div>
    );
  }

  if (compact) {
    const units = [
      { label: 'দিন', value: days },
      { label: 'ঘন্টা', value: hours },
      { label: 'মিনিট', value: minutes },
    ];
    return (
      <div className="flex items-center gap-1">
        {units.map((u) => (
          <div key={`unit-compact-${u.label}`} className="flex flex-col items-center">
            <span className={`text-[10px] font-black leading-none ${u.label === 'দিন' ? 'text-bkash' : 'text-slate-700'}`}>
              {toBn(String(u.value).padStart(2, '0'))}
            </span>
            <span className="text-[5px] text-slate-400 font-bold uppercase tracking-tighter">{u.label}</span>
          </div>
        ))}
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
      {units.map((u) => (
        <div key={`unit-normal-${u.label}`} className="flex flex-col items-center">
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

const getFriendlyErrorMessage = (error: unknown): string => {
  let message = "একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
  
  try {
    const errorStr = error instanceof Error ? error.message : String(error);
    let originalError = errorStr.toLowerCase();

    if (errorStr.startsWith('{') && errorStr.endsWith('}')) {
      try {
        const errInfo = JSON.parse(errorStr) as FirestoreErrorInfo;
        originalError = errInfo.error.toLowerCase();
      } catch (e) {
        // Not JSON or parse failed, use string as is
      }
    }
    
    if (originalError.includes('permission-denied') || originalError.includes('insufficient permissions')) {
      message = "অ্যাক্সেস রিফিউজ করা হয়েছে। আপনার এই কাজটি করার অনুমতি নেই। এডমিনের সাথে যোগাযোগ করুন।";
    } else if (originalError.includes('quota-exceeded')) {
      message = "ডাটাবেস কোটা শেষ হয়ে গেছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।";
    } else if (originalError.includes('unavailable') || originalError.includes('offline')) {
      message = "সার্ভার বর্তমানে এভেইলএবল নেই। আপনার ইন্টারনেট সংযোগ চেক করুন।";
    } else if (originalError.includes('already-exists')) {
      message = "এই তথ্যটি ডাটাবেসে অলরেডি সংরক্ষিত আছে।";
    } else if (originalError.includes('network-request-failed')) {
      message = "নেটওয়ার্ক কানেকশন ফেইল করেছে। পুনরায় চেষ্টা করুন।";
    } else if (originalError.includes('invalid-argument')) {
      message = "ভুল তথ্য প্রদান করা হয়েছে। ইনপুট চেক করে পুনরায় চেষ্টা করুন।";
    } else if (originalError.includes('not-found')) {
      message = "তথ্যটি পাওয়া যায়নি। ডাটাবেস চেক করে দেখুন।";
    }
  } catch (e) {
    console.error("Error parsing friendly message:", e);
  }
  
  return message;
};

// Sound URLs
const SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
  ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
};

const speak = (text: string, isMuted: boolean, isSpeechEnabled: boolean) => {
  if (isMuted || !isSpeechEnabled || !window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD'; // Bengali (Bangladesh)
  utterance.rate = 0.9; // Slightly slower for better clarity
  utterance.pitch = 1.0;
  
  // Find a Bengali voice if available
  const voices = window.speechSynthesis.getVoices();
  const bnVoice = voices.find(v => v.lang === 'bn-BD') || 
                  voices.find(v => v.lang.includes('bn')) || 
                  voices.find(v => v.lang.includes('BD'));
  
  if (bnVoice) utterance.voice = bnVoice;
  
  window.speechSynthesis.speak(utterance);
};

// Pre-fetch voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => localStorage.getItem('isMusicPlaying') === 'true');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(() => localStorage.getItem('isSpeechEnabled') !== 'false');
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('isMuted', String(isMuted));
    localStorage.setItem('isMusicPlaying', String(isMusicPlaying));
    localStorage.setItem('isSpeechEnabled', String(isSpeechEnabled));
  }, [isMuted, isMusicPlaying, isSpeechEnabled]);

  // Notification State
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, date: string, type: 'warning' | 'alert'}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Unlock audio and preload voices
  useEffect(() => {
    const handleFirstInteraction = () => {
      // Create and play a silent buffer to unlock audio on mobile/strict browsers
      const silentAudio = new Audio();
      silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      silentAudio.play().catch(() => {});
      
      // Load voices for speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
      
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    if (isMuted) return;
    try {
      const audio = new Audio();
      // Set source only when ready to play to avoid early load errors
      audio.src = SOUNDS[type];
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'NotAllowedError') {
            console.warn("Autoplay was prevented. User interaction required.");
          } else {
            console.warn("Audio playback failed:", error.message);
          }
        });
      }
      
      audio.onerror = (e) => {
        console.error("Audio failed to load:", SOUNDS[type], e);
      };
    } catch (err) {
      console.error("Error in playSound:", err);
    }
  }, [isMuted]);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;

    if (isMusicPlaying && !isMuted) {
      if (!bgMusicRef.current) {
        bgMusicRef.current = new Audio();
        bgMusicRef.current.src = SOUNDS.ambient;
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.2;
        
        bgMusicRef.current.onerror = (e) => {
          console.error("Ambient music failed to load:", SOUNDS.ambient, e);
          setIsMusicPlaying(false);
        };
      }
      
      audio = bgMusicRef.current;
      audio.play().catch(error => {
        if (error.name === 'NotAllowedError') {
          console.warn("Ambient music autoplay prevented. Waiting for user interaction.");
          setIsMusicPlaying(false);
        }
      });
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    };
  }, [isMusicPlaying, isMuted]);

  // Reminder Logic
  useEffect(() => {
    if (users.length > 0) {
      const reminders: any[] = [];
      const today = new Date();
      const inSevenDays = new Date();
      inSevenDays.setDate(today.getDate() + 7);

      users.forEach(user => {
        if (!user.isActive) return;
        const expiry = new Date(user.expireDate);
        if (expiry < today) {
          reminders.push({
            id: `exp-over-${user.id}`,
            title: 'চুক্তির মেয়াদ শেষ!',
            message: `${user.name} এর চুক্তির মেয়াদ ইতিমধ্যে শেষ হয়ে গিয়েছে।`,
            date: user.expireDate,
            type: 'alert'
          });
        } else if (expiry <= inSevenDays) {
          reminders.push({
            id: `exp-soon-${user.id}`,
            title: 'মেয়াদ শেষ হতে চলেছে',
            message: `${user.name} এর চুক্তির মেয়াদ আগামী ৭ দিনের মধ্যে শেষ হবে।`,
            date: user.expireDate,
            type: 'warning'
          });
        }
      });
      setNotifications(reminders);
    }
  }, [users]);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
  const [viewMode, setViewMode] = useState<'details' | 'card' | 'portfolio' | 'receipt'>('details');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectingUser, setCollectingUser] = useState<User | null>(null);
  const [extendMonths, setExtendMonths] = useState<string>('');
  const [collectionAmount, setCollectionAmount] = useState<string>('');
  const [collectionTerms, setCollectionTerms] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showExpiredPdfModal, setShowExpiredPdfModal] = useState(false);
  const [showAllUsersPrintModal, setShowAllUsersPrintModal] = useState(false);
  const [printListScope, setPrintListScope] = useState<'all' | 'filtered' | 'active' | 'warning' | 'expired' | 'deactivated'>('all');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printColumns, setPrintColumns] = useState({
    chukirdhari: true,
    address: true,
    land: true,
    contract: true,
    balance: true,
    collected: true,
    expireDate: true,
    status: true
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawingUser, setWithdrawingUser] = useState<User | null>(null);
  const [withdrawMode, setWithdrawMode] = useState<'withdraw' | 'add'>('withdraw');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawPurpose, setWithdrawPurpose] = useState<string>('');
  const [reportRange, setReportRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  // Form Auto-save State
  const [formValues, setFormValues] = useState({
    name: '',
    chukirdharirName: '',
    mobile: '',
    address: '',
    jomirPoriman: '',
    amount: '',
    expireDate: '',
    pwrBalance: '',
    terms: ''
  });
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const initialAddState = useMemo(() => ({
    name: '',
    chukirdharirName: '',
    mobile: '',
    address: '',
    jomirPoriman: '',
    amount: '',
    expireDate: '',
    pwrBalance: '',
    terms: ''
  }), []);

  // Handle opening modal and checking for draft
  useEffect(() => {
    if (showAddEditModal) {
      if (editingUser) {
        const initialState = {
          name: editingUser.name || '',
          chukirdharirName: editingUser.chukirdharirName || '',
          mobile: editingUser.mobile || '',
          address: editingUser.address || '',
          jomirPoriman: editingUser.jomirPoriman || '',
          amount: editingUser.amount?.toString() || '',
          expireDate: editingUser.expireDate || '',
          pwrBalance: editingUser.pwrBalance?.toString() || '',
          terms: editingUser.terms || ''
        };
        setFormValues(initialState);
        
        const draft = localStorage.getItem(`draft_edit_${editingUser.id}`);
        if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            const isDifferent = Object.keys(initialState).some(key => 
              String(parsedDraft[key] || '') !== String((initialState as any)[key] || '')
            );
            if (isDifferent) {
              setShowRestorePrompt(true);
            }
          } catch (e) {
            console.error("Draft parse error", e);
          }
        }
      } else {
        setFormValues(initialAddState);
        const draft = localStorage.getItem('draft_add');
        if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            const hasContent = Object.values(parsedDraft).some(v => v !== '');
            if (hasContent) {
              setShowRestorePrompt(true);
            }
          } catch (e) {
            console.error("Draft parse error", e);
          }
        }
      }
    } else {
      setShowRestorePrompt(false);
    }
  }, [showAddEditModal, editingUser, initialAddState]);

  // Auto-save effect
  useEffect(() => {
    if (showAddEditModal) {
      const timeoutId = setTimeout(() => {
        const draftKey = editingUser ? `draft_edit_${editingUser.id}` : 'draft_add';
        localStorage.setItem(draftKey, JSON.stringify(formValues));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues, showAddEditModal, editingUser]);

  const handleRestoreDraft = () => {
    const draftKey = editingUser ? `draft_edit_${editingUser.id}` : 'draft_add';
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      setFormValues(JSON.parse(draft));
      setShowRestorePrompt(false);
      playSound('success');
      speak("ড্রাফট রিস্টোর করা হয়েছে", isMuted, isSpeechEnabled);
    }
  };

  const handleDiscardDraft = () => {
    const draftKey = editingUser ? `draft_edit_${editingUser.id}` : 'draft_add';
    localStorage.removeItem(draftKey);
    setShowRestorePrompt(false);
    playSound('error');
    speak("ড্রাফট মুছে ফেলা হয়েছে", isMuted, isSpeechEnabled);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const bnToEn = (str: string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.split('').map(c => {
      const idx = bnNums.indexOf(c);
      return idx !== -1 ? idx.toString() : c;
    }).join('');
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      const daysLeft = getDaysLeft(user.expireDate);
      const status = user.isActive === false ? 'deactivated' : getStatus(daysLeft);
      const matchesFilter = filter === 'all' || status === filter;
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        (user.nameBn && user.nameBn.toLowerCase().includes(search.toLowerCase())) ||
        user.mobile.includes(search) ||
        user.chukirdharirName.toLowerCase().includes(search.toLowerCase()) ||
        (user.chukirdharirNameBn && user.chukirdharirNameBn.toLowerCase().includes(search.toLowerCase())) ||
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
            // Natural sort attempt with Bengali number support
            const aEn = bnToEn(aValue);
            const bEn = bnToEn(bValue);
            
            const aNum = parseFloat(aEn.replace(/[^\d.]/g, ''));
            const bNum = parseFloat(bEn.replace(/[^\d.]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
              return direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const comparison = aValue.localeCompare(bValue, 'bn-BD', { numeric: true });
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
    const activeUsers = users.filter(u => u.isActive !== false);
    const totalAmount = users.reduce((acc, u) => acc + u.amount, 0);
    const totalCollected = users.reduce((acc, u) => acc + (u.amount - u.pwrBalance), 0);
    const active = activeUsers.filter(u => getStatus(getDaysLeft(u.expireDate)) === 'active').length;
    const warning = activeUsers.filter(u => getStatus(getDaysLeft(u.expireDate)) === 'warning').length;
    const deactivated = users.filter(u => u.isActive === false).length;
    const collectionRate = totalAmount > 0 ? ((totalCollected / totalAmount) * 100).toFixed(1) : '0';

    return { totalAmount, active, warning, deactivated, collectionRate, totalUsers: users.length };
  }, [users]);

  const printableUsers = useMemo(() => {
    if (printListScope === 'filtered') return filteredUsers;
    if (printListScope === 'all') return users;
    return users.filter(user => {
      const daysLeft = getDaysLeft(user.expireDate);
      const status = user.isActive === false ? 'deactivated' : getStatus(daysLeft);
      return status === printListScope;
    });
  }, [users, filteredUsers, printListScope]);

  const printSummary = useMemo(() => {
    return printableUsers.reduce(
      (acc, u) => {
        acc.totalAmount += u.amount || 0;
        acc.totalBalance += u.pwrBalance || 0;
        acc.totalCollected += u.collectedBalance || 0;
        return acc;
      },
      { totalAmount: 0, totalBalance: 0, totalCollected: 0 }
    );
  }, [printableUsers]);

  const handleAddEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;
    
    const formData = new FormData(form);
    setIsProcessing(true);
    // Artificial delay for user request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const trimmedName = formValues.name.trim();
    const trimmedChukirdhari = formValues.chukirdharirName.trim();
    const userData = {
      name: trimmedName,
      nameBn: editingUser && trimmedName === (editingUser.name || '').trim() ? (editingUser.nameBn || '') : '',
      address: formValues.address || '',
      mobile: formValues.mobile || '',
      jomirPoriman: formValues.jomirPoriman || '',
      amount: parseFloat(formValues.amount) || 0,
      expireDate: formValues.expireDate || '',
      pwrBalance: parseFloat(formValues.pwrBalance) || 0,
      chukirdharirName: trimmedChukirdhari,
      chukirdharirNameBn: editingUser && trimmedChukirdhari === (editingUser.chukirdharirName || '').trim() ? (editingUser.chukirdharirNameBn || '') : '',
      isActive: editingUser ? (editingUser.isActive ?? true) : true,
      withdrawals: editingUser ? (editingUser.withdrawals || []) : [],
      terms: formValues.terms || '',
    };

    try {
      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), userData);
        localStorage.removeItem(`draft_edit_${editingUser.id}`);
      } else {
        await addDoc(collection(db, 'users'), userData);
        localStorage.removeItem('draft_add');
      }
      playSound('success');
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(false);
      setIsProcessing(false);
      setShowAddEditModal(false);
      setEditingUser(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, 'users');
      } catch (loggedError) {
        console.error(loggedError);
      }
      playSound('error');
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsError(false);
      setErrorMessage('');
      setIsProcessing(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!id || isProcessing) return;
    setIsError(false);
    setErrorMessage('');
    setIsSuccess(false);
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'users', id));
      localStorage.removeItem(`draft_edit_${id}`);
      if (viewingUser?.id === id) {
        setViewingUser(null);
        setShowViewModal(false);
      }
      playSound('success');
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
      } catch (loggedError) {
        console.error(loggedError);
      }
      playSound('error');
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsError(false);
      setErrorMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const processCollection = async () => {
    if (!collectingUser || !extendMonths || !collectionAmount) return;
    setIsProcessing(true);
    // Artificial delay for user request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
        collectedBalance: (collectingUser.collectedBalance || 0) + cost,
        expireDate: newExpiryDate || '',
        pwrBalance: (collectingUser.pwrBalance || 0) - cost,
        terms: collectionTerms || '',
        history: updatedHistory
      });
      playSound('success');
      speak("টাকা সংগ্রহ ও মেয়াদ বৃদ্ধি সফল হয়েছে", isMuted, isSpeechEnabled);
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsSuccess(false);
      setIsProcessing(false);
      setShowCollectionModal(false);
      setCollectingUser(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${collectingUser.id}`);
      } catch (loggedError) {
        console.error(loggedError);
      }
      playSound('error');
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsError(false);
      setErrorMessage('');
      setIsProcessing(false);
    }
  };

  const handleOpenCollection = (user: User) => {
    playSound('click');
    if (user.isActive === false) {
      alert("ডিঅ্যাক্টিভেটেড একাউন্টে টাকা সংগ্রহ করা সম্ভব নয়। আগে একাউন্টটি অ্যাক্টিভেট করুন।");
      return;
    }
    setCollectingUser(user);
    setExtendMonths('');
    setCollectionAmount('');
    setCollectionTerms(user.terms || '');
    setShowCollectionModal(true);
  };

  const toggleUserStatus = async (user: User) => {
    setIsProcessing(true);
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: user.isActive === false ? true : false
      });
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(false);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      } catch (loggedError) {
        console.error(loggedError);
      }
      playSound('error');
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsError(false);
      setErrorMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenWithdraw = (user: User) => {
    playSound('click');
    setWithdrawingUser(user);
    setWithdrawMode('withdraw');
    setWithdrawAmount('');
    setWithdrawPurpose('');
    setShowWithdrawModal(true);
  };

  const processWithdrawal = async () => {
    if (!withdrawingUser || !withdrawAmount) return;
    const amountToProcess = parseFloat(withdrawAmount);
    
    if (isNaN(amountToProcess) || amountToProcess <= 0) {
      alert("অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    if (withdrawMode === 'withdraw' && amountToProcess > withdrawingUser.amount) {
      alert("চুক্তির পরিমাণের চেয়ে বেশি টাকা উত্তোলন সম্ভব নয়!");
      return;
    }

    setIsProcessing(true);
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (withdrawMode === 'withdraw') {
        const newWithdrawal = {
          date: new Date().toISOString(),
          amount: amountToProcess,
          purpose: withdrawPurpose || 'চুক্তি ভিত্তিক উত্তোলন'
        };
        const updatedWithdrawals = [...(withdrawingUser.withdrawals || []), newWithdrawal];
        await updateDoc(doc(db, 'users', withdrawingUser.id), {
          amount: (withdrawingUser.amount || 0) - amountToProcess,
          withdrawals: updatedWithdrawals
        });
      } else {
        // Add mode: Increase the amount
        const newHistoryEntry = {
          date: new Date().toISOString(),
          amount: amountToProcess,
          monthsExtended: 0,
          newExpiryDate: withdrawingUser.expireDate || '',
          purpose: withdrawPurpose || 'সরাসরি টাকা বৃদ্ধি'
        };
        // Reuse CollectionHistory structure but we'll add it to history or just update amount
        const updatedHistory = [...(withdrawingUser.history || []), newHistoryEntry] as any;
        await updateDoc(doc(db, 'users', withdrawingUser.id), {
          amount: (withdrawingUser.amount || 0) + amountToProcess,
          history: updatedHistory
        });
      }
      playSound('success');
      speak(withdrawMode === 'withdraw' ? "টাকা উত্তোলন সফল হয়েছে" : "টাকা বৃদ্ধি সফল হয়েছে", isMuted, isSpeechEnabled);
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsSuccess(false);
      setIsProcessing(false);
      setShowWithdrawModal(false);
      setWithdrawingUser(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${withdrawingUser.id}`);
      } catch (loggedError) {
        console.error(loggedError);
      }
      playSound('error');
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsError(false);
      setErrorMessage('');
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    window.focus();
    window.print();
    setIsProcessing(true);
    // Artificial delay for user request
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element || !viewingUser) return;

    setIsProcessing(true);
    try {
      // Small delay to ensure any transient UI states are settled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          // Force some standard colors if oklch is still an issue
          '--color-bkash': '#e2136e',
          '--color-emerald-500': '#10b981',
          '--color-amber-500': '#f59e0b',
          '--color-rose-500': '#f43f5e',
        } as any
      });
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // If the content is longer than one page, we might need multiple pages or scaling
      // For now, we'll scale it to fit the width of A4
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${viewingUser.name}_${viewMode}_${new Date().getTime()}.pdf`);
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadExpiredPDF = async () => {
    const element = document.getElementById('expired-print-area');
    if (!element) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          '--color-bkash': '#e2136e',
          '--color-emerald-500': '#10b981',
          '--color-amber-500': '#f59e0b',
          '--color-rose-500': '#f43f5e',
        } as any
      });
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Expired_Tenures_${new Date().getTime()}.pdf`);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowExpiredPdfModal(false);
      }, 1500);
    } catch (err) {
      console.error('Expired list PDF generation failed:', err);
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintAllUsers = async () => {
    playSound('click');
    window.focus();
    window.print();
  };

  const handleDownloadAllUsersPDF = async () => {
    const element = document.getElementById('all-users-print-area');
    if (!element) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));

      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        style: {
          '--color-bkash': '#e2136e',
          '--color-emerald-500': '#10b981',
          '--color-amber-500': '#f59e0b',
          '--color-rose-500': '#f43f5e',
        } as any
      });

      const pdf = new jsPDF({
        orientation: printOrientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const usableWidth = pdfWidth - margin * 2;
      const renderedHeight = (imgProps.height * usableWidth) / imgProps.width;

      let heightLeft = renderedHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, renderedHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - renderedHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, renderedHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`All_Users_List_${printListScope}_${new Date().toISOString().split('T')[0]}.pdf`);
      playSound('success');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('All users PDF generation failed:', err);
      playSound('error');
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    setIsProcessing(true);
    // Artificial delay for user request
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await firebaseLogout();
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 5000));
      setIsSuccess(false);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      setIsError(true);
      await new Promise(resolve => setTimeout(resolve, 5000));
      setIsError(false);
      setErrorMessage('');
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
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            >
               <div className="pointer-events-auto">
                 <ActionSpinner isSuccess={isSuccess} isError={isError} errorMessage={errorMessage} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              playSound('click');
              setIsProcessing(true);
              // Artificial delay for user request
              await new Promise(resolve => setTimeout(resolve, 1000));
              try {
                await signInWithGoogle();
                speak("স্বাগতম! আপনার সিস্টেমে লগইন সফল হয়েছে।", isMuted, isSpeechEnabled);
                setIsSuccess(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setIsSuccess(false);
              } catch (error: any) {
                const message = getFriendlyErrorMessage(error);
                setErrorMessage(message);
                setIsError(true);
                await new Promise(resolve => setTimeout(resolve, 5000));
                setIsError(false);
                setErrorMessage('');
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
            {isProcessing ? 'লগইন হচ্ছে...' : 'Google দিয়ে লগইন করুন'}
          </button>
          
          <p className="mt-8 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Protected by Firebase Security</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-sm bg-[#f6f7f9] text-slate-900 overflow-x-hidden w-full max-w-full">
      <AnimatePresence>
        {isProcessing && !showAddEditModal && !showDeleteModal && !showCollectionModal && !showReportsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
             <div className="pointer-events-auto">
               <ActionSpinner isSuccess={isSuccess} isError={isError} errorMessage={errorMessage} />
             </div>
          </motion.div>
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          >
            <div className="spinner mb-4"></div>
            <p className="text-slate-500 font-semibold tracking-wider text-xs">সিস্টেম লোড হচ্ছে...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-72 h-full bg-white text-slate-800 z-40 hidden lg:flex flex-col border-r border-slate-200/80">
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-bkash to-bkash-dark p-2.5 rounded-xl shadow-md shadow-bkash/20 shrink-0">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">LandManager Pro</h2>
              <p className="text-[11px] text-slate-500 font-medium truncate">জমি ও চুক্তি ব্যবস্থাপনা</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wide">
            ক্যাটাগরি ফিল্টার
          </div>
          {[
            { id: 'all', label: 'ড্যাশবোর্ড (সব)', icon: LayoutDashboard, count: stats.totalUsers },
            { id: 'active', label: 'সক্রিয় গ্রাহক', icon: CheckCircle, count: stats.active },
            { id: 'warning', label: 'সতর্কতা (৩০ দিন)', icon: AlertTriangle, count: stats.warning },
            { id: 'expired', label: 'মেয়াদ শেষ', icon: Clock, count: users.filter(u => u.isActive !== false && getDaysLeft(u.expireDate) < 0).length },
            { id: 'deactivated', label: 'বন্ধ একাউন্ট', icon: Ban, count: stats.deactivated },
          ].map((item) => {
            const isActiveNav = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setFilter(item.id as StatusFilter);
                  playSound('click');
                }}
                aria-current={isActiveNav ? 'page' : undefined}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left font-semibold text-[13px] ${
                  isActiveNav
                    ? 'bg-bkash-light text-bkash border border-bkash/15 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActiveNav ? 'text-bkash' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className={`text-xs font-bold tabular-nums shrink-0 ${isActiveNav ? 'text-bkash' : 'text-slate-400'}`}>
                  {toBn(item.count)}
                </span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wide">
              রিপোর্ট ও প্রিন্ট
            </div>
            <button
              onClick={() => {
                setPrintListScope('all');
                setShowAllUsersPrintModal(true);
                playSound('pop');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-[13px] text-slate-700 hover:text-bkash hover:bg-bkash-light/60"
            >
              <Printer className="w-4 h-4 text-bkash shrink-0" />
              <span className="truncate">সকল ইউজার তালিকা প্রিন্ট</span>
            </button>

            <button
              onClick={() => {
                setShowReportsModal(true);
                playSound('pop');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <FileBarChart className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">আর্থিক প্রতিবেদন ও CSV</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/70">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser.displayName || 'অ্যাডমিন'}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
          </div>
          <button
            onClick={() => {
              handleLogout();
              playSound('click');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 pb-28 md:pb-10 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 sm:px-6 sm:py-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs w-full">
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  গ্রাহক ও চুক্তি ড্যাশবোর্ড
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                  <span className="hidden sm:inline truncate">চুক্তি ও পাওয়ার ব্যালেন্স ব্যবস্থাপনা</span>
                  <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
                  <span className="text-bkash font-bold tabular-nums flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {liveTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Mobile Quick Print Icon Button */}
              <div className="flex items-center gap-1.5 md:hidden">
                <button
                  onClick={() => {
                    setPrintListScope('all');
                    setShowAllUsersPrintModal(true);
                    playSound('pop');
                  }}
                  aria-label="সকল ইউজার প্রিন্ট"
                  title="সকল ইউজার তালিকা প্রিন্ট"
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-bkash flex items-center justify-center transition-colors"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2">
                {/* Audio Controls */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      playSound('click');
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isMuted ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-bkash hover:bg-white'}`}
                    title={isMuted ? 'সাউন্ড চালু করুন' : 'মিউট করুন'}
                    aria-label={isMuted ? 'সাউন্ড চালু করুন' : 'মিউট করুন'}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                  <button
                    onClick={() => {
                      setIsMusicPlaying(!isMusicPlaying);
                      playSound('click');
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isMusicPlaying ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-bkash hover:bg-white'}`}
                    title={isMusicPlaying ? 'গান বন্ধ করুন' : 'গান শুনুন'}
                    aria-label={isMusicPlaying ? 'গান বন্ধ করুন' : 'গান শুনুন'}
                  >
                    <Music size={15} />
                  </button>
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      playSound('pop');
                    }}
                    aria-label="রিমাইন্ডার নোটিফিকেশন"
                    className={`w-10 h-10 rounded-xl transition-colors border relative flex items-center justify-center ${
                      showNotifications ? 'bg-bkash text-white border-bkash' : 'bg-white text-slate-500 border-slate-200/80 hover:text-bkash hover:border-bkash/30'
                    }`}
                  >
                    {notifications.length > 0 ? <BellRing size={16} /> : <Bell size={16} />}
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                        {toBn(notifications.length)}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-[2000] overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <h3 className="text-xs font-bold text-slate-800">মেয়াদ রিমাইন্ডার</h3>
                          <span className="text-xs font-bold text-bkash tabular-nums">{toBn(notifications.length)} টি</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs font-medium">কোনো নতুন নোটিফিকেশন নেই</div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`p-3 rounded-xl border flex gap-3 ${
                                  notif.type === 'alert' ? 'bg-rose-50/70 border-rose-200/70' : 'bg-amber-50/70 border-amber-200/70'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  notif.type === 'alert' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                  {notif.type === 'alert' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                                  <p className="text-xs text-slate-600 leading-snug mt-0.5">{notif.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings Button */}
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    playSound('pop');
                  }}
                  className="w-10 h-10 rounded-xl transition-colors border border-slate-200/80 bg-white text-slate-500 hover:text-bkash hover:border-bkash/30 flex items-center justify-center"
                  title="সেটিংস"
                  aria-label="সেটিংস"
                >
                  <Settings size={16} />
                </button>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setPrintListScope('all');
                    setShowAllUsersPrintModal(true);
                    playSound('pop');
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center gap-2 text-xs whitespace-nowrap shrink-0 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>সকল তালিকা প্রিন্ট</span>
                </button>

                <button
                  onClick={() => { 
                    setEditingUser(null); 
                    setShowAddEditModal(true);
                    playSound('pop');
                  }}
                  className="px-4 py-2.5 bg-bkash hover:bg-bkash-dark text-white rounded-xl font-bold transition-colors flex items-center gap-2 text-xs whitespace-nowrap shrink-0 shadow-sm shadow-bkash/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন এন্ট্রি</span>
                </button>
              </div>
            </div>
          </header>

          {/* Stats Grid - Balanced 6-column KPI strip */}
          <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6" aria-label="সারসংক্ষেপ পরিসংখ্যান">
            {[
              { label: 'মোট চুক্তির টাকা', val: toBn(stats.totalAmount.toLocaleString()) + ' ৳', icon: Banknote, iconBg: 'bg-pink-50 text-bkash', action: () => setShowReportsModal(true) },
              { label: 'মোট গ্রাহক', val: toBn(stats.totalUsers) + ' জন', icon: Users, iconBg: 'bg-slate-100 text-slate-700', action: () => { setFilter('all'); } },
              { label: 'সক্রিয় গ্রাহক', val: toBn(stats.active) + ' জন', icon: CircleCheck, iconBg: 'bg-emerald-50 text-emerald-600', action: () => { setFilter('active'); } },
              { label: 'সতর্কতা (৩০ দিন)', val: toBn(stats.warning) + ' জন', icon: AlertTriangle, iconBg: 'bg-amber-50 text-amber-600', action: () => { setFilter('warning'); } },
              { label: 'বন্ধ একাউন্ট', val: toBn(stats.deactivated) + ' জন', icon: Ban, iconBg: 'bg-slate-100 text-slate-500', action: () => { setFilter('deactivated'); } },
              { label: 'সংগ্রহের হার', val: toBn(stats.collectionRate) + '%', icon: TrendingUp, iconBg: 'bg-bkash-light text-bkash', action: () => setShowReportsModal(true) },
            ].map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => {
                  stat.action();
                  playSound('click');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-bkash/30 transition-all text-left flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 truncate">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums tracking-tight truncate w-full">
                  {stat.val}
                </div>
              </button>
            ))}
          </section>

          {/* Dashboard Controls */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 mb-6 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row gap-3 sm:gap-4 items-stretch xl:items-center w-full">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="নাম, মোবাইল, চুক্তিধারী বা ঠিকানা দিয়ে খুঁজুন..." 
                aria-label="রেকর্ড খুঁজুন"
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:border-bkash focus:bg-white focus:ring-3 focus:ring-bkash/10 transition-all outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="সার্চ মুছুন"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-2.5 w-full xl:w-auto shrink-0 items-stretch md:items-center">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
                {(['all', 'active', 'expired', 'warning', 'deactivated'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilter(s);
                      playSound('pop');
                    }}
                    aria-pressed={filter === s}
                    className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      filter === s ? 'bg-white shadow-xs text-bkash' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s === 'all' ? 'সব' : s === 'active' ? 'সক্রিয়' : s === 'expired' ? 'মেয়াদ শেষ' : s === 'warning' ? 'সতর্কতা' : 'বন্ধ'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPrintListScope(filter === 'all' && !search && sortConfig.length === 0 ? 'all' : 'filtered');
                    setShowAllUsersPrintModal(true);
                    playSound('pop');
                  }}
                  className="whitespace-nowrap shrink-0 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> তালিকা প্রিন্ট
                </button>

                {filter === 'expired' && (
                  <button
                    onClick={() => {
                      setShowExpiredPdfModal(true);
                      playSound('pop');
                    }}
                    className="whitespace-nowrap shrink-0 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" /> মেয়াদ উত্তীর্ণ PDF
                  </button>
                )}

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
                  <span className="px-2 text-[11px] font-bold text-slate-400 hidden sm:inline whitespace-nowrap">সাজান:</span>
                  {[
                    { key: 'name', label: 'নাম' },
                    { key: 'amount', label: 'টাকা' },
                    { key: 'expireDate', label: 'মেয়াদ' },
                  ].map((item) => {
                    const isActive = sortConfig.find(sc => sc.field === item.key);
                    const index = sortConfig.findIndex(sc => sc.field === item.key);
                    
                    return (
                      <button
                        key={item.key}
                        onClick={(e) => {
                          toggleSort(item.key as keyof User, e.shiftKey);
                          playSound('click');
                        }}
                        aria-label={`Sort by ${item.label}`}
                        aria-pressed={!!isActive}
                        title="Shift + Click দিয়ে মাল্টি-সর্ট করুন"
                        className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isActive ? 'bg-bkash text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {item.label}
                        {isActive && (
                          <span className="flex items-center gap-0.5">
                            {isActive.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {sortConfig.length > 1 && (
                              <span className="text-[10px] px-1 bg-white/20 rounded-full tabular-nums">{index + 1}</span>
                            )}
                          </span>
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
                    {filteredUsers.map((user) => {
                      const daysLeft = getDaysLeft(user.expireDate);
                      const status = user.isActive === false ? 'deactivated' : getStatus(daysLeft);
                      const statusLabel = status === 'active' ? 'সক্রিয়' : status === 'warning' ? 'সতর্কতা' : status === 'deactivated' ? 'বন্ধ' : 'মেয়াদ শেষ';
                      const statusBadgeClass = status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : status === 'deactivated'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200';

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          key={user.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs overflow-hidden"
                        >
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                  {user.name}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${statusBadgeClass}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              {user.nameBn && (
                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user.nameBn}</p>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-bkash font-bold mt-1 tabular-nums">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{toBn(user.mobile)}</span>
                              </div>
                            </div>
                            <div className="bg-bkash-light text-bkash px-3 py-1.5 rounded-xl border border-bkash/15 font-extrabold text-xs tabular-nums shrink-0">
                              {toBn(user.pwrBalance.toLocaleString())} ৳
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-bkash shrink-0" /> ঠিকানা
                              </div>
                              <p className="text-xs font-semibold text-slate-700 truncate">{user.address}</p>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-bkash shrink-0" /> মেয়াদ শেষ
                              </div>
                              <p className="text-xs font-bold text-slate-800 tabular-nums">{formatDate(user.expireDate)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => { setViewingUser(user); setViewMode('card'); setShowViewModal(true); }}
                              className="px-3 py-2 bg-bkash-light text-bkash font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-bkash/15"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> কার্ড
                            </button>
                            <div className="flex gap-1.5">
                              {[
                                { icon: Eye, label: 'বিস্তারিত', color: 'text-slate-600 bg-slate-50 border-slate-200', onClick: () => { setViewingUser(user); setViewMode('details'); setShowViewModal(true); playSound('pop'); } },
                                { icon: ArrowUpCircle, label: 'উত্তোলন', color: 'text-blue-600 bg-blue-50 border-blue-200', onClick: () => handleOpenWithdraw(user) },
                                { icon: user.isActive ? UserMinus : UserCheck, label: user.isActive ? 'ডিঅ্যাক্টিভেট' : 'অ্যাক্টিভেট', color: user.isActive ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200', onClick: () => toggleUserStatus(user) },
                                { icon: HandCoins, label: 'সংগ্রহ', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', onClick: () => handleOpenCollection(user) },
                                { icon: Edit, label: 'সম্পাদন', color: 'text-amber-600 bg-amber-50 border-amber-200', onClick: () => { setEditingUser(user); setShowAddEditModal(true); } },
                                { icon: Trash2, label: 'ডিলিট', color: 'text-rose-600 bg-rose-50 border-rose-200', onClick: () => { setUserToDelete(user); setShowDeleteModal(true); } },
                              ].map((action, i) => (
                                <button
                                  key={i}
                                  onClick={action.onClick}
                                  aria-label={action.label}
                                  title={action.label}
                                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${action.color}`}
                                >
                                  <action.icon className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Desktop Table View (shown lg and above) */}
                <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span>প্রদর্শিত গ্রাহক তালিকা</span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="text-bkash tabular-nums">{toBn(filteredUsers.length)} জন</span>
                    </div>
                    <button
                      onClick={() => {
                        setPrintListScope(filter === 'all' && !search && sortConfig.length === 0 ? 'all' : 'filtered');
                        setShowAllUsersPrintModal(true);
                        playSound('pop');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-bkash flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট / PDF এক্সপোর্ট</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500">
                          <th className="px-5 py-3.5 text-left w-16">ক্রম</th>
                          <th 
                            className="px-4 py-3.5 text-left cursor-pointer hover:text-bkash transition-colors"
                            onClick={(e) => toggleSort('name', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'name')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'name')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('name', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>গ্রাহকের তথ্য</span>
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3.5 text-center cursor-pointer hover:text-bkash transition-colors"
                            onClick={(e) => toggleSort('jomirPoriman', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'jomirPoriman')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'jomirPoriman')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('jomirPoriman', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>জমির পরিমাণ</span>
                              {getSortIcon('jomirPoriman')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3.5 text-right cursor-pointer hover:text-bkash transition-colors"
                            onClick={(e) => toggleSort('amount', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'amount')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'amount')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('amount', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <span>ব্যালেন্স ও চুক্তি</span>
                              {getSortIcon('amount')}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3.5 text-center cursor-pointer hover:text-bkash transition-colors"
                            onClick={(e) => toggleSort('expireDate', e.shiftKey)}
                            aria-sort={sortConfig.find(c => c.field === 'expireDate')?.direction === 'asc' ? 'ascending' : sortConfig.find(c => c.field === 'expireDate')?.direction === 'desc' ? 'descending' : 'none'}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('expireDate', e.shiftKey); } }}
                            tabIndex={0}
                            role="columnheader"
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>সময়সীমা ও অবস্থা</span>
                              {getSortIcon('expireDate')}
                            </div>
                          </th>
                          <th className="px-5 py-3.5 text-right">কমান্ডস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <AnimatePresence mode="popLayout">
                          {filteredUsers.map((user, idx) => {
                            const daysLeft = getDaysLeft(user.expireDate);
                            const status = user.isActive === false ? 'deactivated' : getStatus(daysLeft);
                            const statusLabel = status === 'active' ? 'সক্রিয়' : status === 'warning' ? 'সতর্কতা' : status === 'deactivated' ? 'বন্ধ' : 'মেয়াদ শেষ';
                            const statusBadgeClass = status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : status === 'deactivated'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200';

                            return (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={user.id} 
                                className={`group hover:bg-slate-50/80 transition-colors ${user.isActive === false ? 'opacity-70' : ''}`}
                              >
                                <td className="px-5 py-4 text-xs font-bold text-slate-400 tabular-nums">
                                  {toBn((idx + 1).toString().padStart(2, '0'))}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col gap-0.5 max-w-[230px]">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-bkash transition-colors truncate">
                                        {user.name}
                                      </h4>
                                    </div>
                                    {user.nameBn && (
                                      <p className="text-xs font-medium text-slate-500 truncate">{user.nameBn}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{user.address}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-bkash font-bold tabular-nums">
                                      <Phone className="w-3.5 h-3.5 shrink-0" />
                                      <span>{toBn(user.mobile)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/70 font-bold text-xs tabular-nums">
                                    {toBn(user.jomirPoriman)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-sm font-extrabold text-bkash tabular-nums">
                                      {toBn(user.pwrBalance.toLocaleString())} ৳
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                                      চুক্তি: {toBn(user.amount.toLocaleString())} ৳
                                    </span>
                                    {user.collectedBalance && user.collectedBalance > 0 ? (
                                      <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">
                                        সংগ্রহ: {toBn(user.collectedBalance.toLocaleString())} ৳
                                      </span>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col items-center gap-1.5 min-w-[130px]">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 tabular-nums">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{formatDate(user.expireDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${statusBadgeClass}`}>
                                        {statusLabel}
                                      </span>
                                      {status !== 'expired' && status !== 'deactivated' && (
                                        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                                          ({toBn(daysLeft)} দিন)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => { setViewingUser(user); setViewMode('card'); setShowViewModal(true); playSound('pop'); }}
                                      aria-label="কার্ড ভিউ"
                                      className="h-9 px-3 bg-bkash hover:bg-bkash-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" /> কার্ড
                                    </button>
                                    {[
                                      { icon: Eye, label: 'বিস্তারিত তথ্য', color: 'text-slate-600 hover:bg-slate-900 border-slate-200', onClick: () => { setViewingUser(user); setViewMode('details'); setShowViewModal(true); } },
                                      { icon: ArrowUpCircle, label: 'টাকা উত্তোলন', color: 'text-blue-600 hover:bg-blue-600 border-blue-200', onClick: () => handleOpenWithdraw(user) },
                                      { icon: user.isActive === false ? UserCheck : UserMinus, label: user.isActive === false ? 'অ্যাক্টিভেট' : 'ডিঅ্যাক্টিভেট', color: user.isActive === false ? 'text-emerald-600 hover:bg-emerald-600 border-emerald-200' : 'text-amber-600 hover:bg-amber-600 border-amber-200', onClick: () => toggleUserStatus(user) },
                                      { icon: TrendingUp, label: 'টাকা বাড়ানো / সংগ্রহ', color: 'text-emerald-600 hover:bg-emerald-600 border-emerald-200', onClick: () => handleOpenCollection(user) },
                                      { icon: Edit, label: 'তথ্য সম্পাদন', color: 'text-amber-600 hover:bg-amber-500 border-amber-200', onClick: () => { setEditingUser(user); setShowAddEditModal(true); } },
                                      { icon: Trash2, label: 'ডিলিট করুন', color: 'text-rose-600 hover:bg-rose-600 border-rose-200', onClick: () => { setUserToDelete(user); setShowDeleteModal(true); } },
                                    ].map((action, i) => (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          action.onClick();
                                          playSound('pop');
                                        }}
                                        aria-label={action.label}
                                        title={action.label}
                                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors bg-white hover:text-white ${action.color}`}
                                      >
                                        <action.icon className="w-4 h-4" />
                                      </button>
                                    ))}
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
              <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-1">কোনো তথ্য পাওয়া যায়নি</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto mb-5">
                  আপনার বর্তমান সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো গ্রাহক রেকর্ড নেই।
                </p>
                {(search || filter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    সব রেকর্ড দেখুন
                  </button>
                )}
              </div>
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
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
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
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    deleteUser(userToDelete.id);
                    playSound('click');
                  }}
                  disabled={isProcessing}
                  className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </motion.button>
                <motion.button 
                  whileHover={{ backgroundColor: "#e2e8f0" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    playSound('click');
                  }}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all"
                >
                  বাতিল করুন
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {showExpiredPdfModal && (
          <Modal
            title="মেয়াদ উত্তীর্ণ তালিকা (PDF)"
            onClose={() => setShowExpiredPdfModal(false)}
            isLoading={isProcessing}
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                <div>
                  <h3 className="text-xs font-black text-rose-800 uppercase tracking-tight">মেয়াদ উত্তীর্ণ ইউজার সংখ্যা</h3>
                  <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-0.5">Total Expired Tenures</p>
                </div>
                <div className="text-right">
                  <span className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black">
                    {toBn(users.filter(u => getDaysLeft(u.expireDate) < 0).length)} জন
                  </span>
                </div>
              </div>

              {/* PDF Preview Area */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50/50 p-2">
                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">ডকুমেন্ট প্রিভিউ (Document Preview)</div>
                <div className="max-h-[300px] overflow-y-auto overflow-x-auto p-1 custom-scrollbar">
                  <div 
                    id="expired-print-area" 
                    className="active-print-sheet bg-white p-6 rounded-xl shadow-sm border border-slate-200/50 mx-auto" 
                    style={{ width: '700px' }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 border-b border-rose-200 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h1 className="text-md font-black text-rose-700 leading-tight">মেয়াদ উত্তীর্ণ গ্রাহক তালিকা</h1>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">LAND EXPIRED TENURE SUMMARY</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">তারিখ (Date)</p>
                        <p className="text-[10px] font-black text-slate-800 mt-1">{toBn(new Date().toLocaleDateString('bn-BD'))}</p>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-black text-[8px] uppercase tracking-wider text-left">
                          <th className="py-2 px-1 text-center w-10">ক্রম</th>
                          <th className="py-2 px-1">গ্রাহকের নাম ও মোবাইল</th>
                          <th className="py-2 px-1">ঠিকানা</th>
                          <th className="py-2 px-1 text-right">জমির পরিমাণ</th>
                          <th className="py-2 px-1 text-right">চুক্তির টাকা</th>
                          <th className="py-2 px-1 text-right">শেষ তারিখ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => getDaysLeft(u.expireDate) < 0).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              কোনো মেয়াদ উত্তীর্ণ ইউজার পাওয়া যায়নি
                            </td>
                          </tr>
                        ) : (
                          users.filter(u => getDaysLeft(u.expireDate) < 0).map((u, index) => (
                            <tr key={u.id} className="border-b border-slate-100 text-[10px]">
                              <td className="py-2 px-1 text-center font-bold text-slate-400 tabular-nums">{toBn(index + 1)}</td>
                              <td className="py-2 px-1">
                                <div className="font-extrabold text-slate-800 leading-tight">{u.nameBn || u.name}</div>
                                <div className="text-[8px] text-slate-400 font-bold tabular-nums">{toBn(u.mobile)}</div>
                              </td>
                              <td className="py-2 px-1 text-slate-500 font-medium truncate max-w-[120px]">{u.address}</td>
                              <td className="py-2 px-1 text-right font-extrabold text-slate-600 tabular-nums">{toBn(u.jomirPoriman)}</td>
                              <td className="py-2 px-1 text-right font-black text-rose-600 tabular-nums">{toBn(u.amount.toLocaleString())} ৳</td>
                              <td className="py-2 px-1 text-right font-black text-rose-700 tabular-nums">{toBn(formatDate(u.expireDate))}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Footer note inside preview */}
                    <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px]">
                      <div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest">সিস্টেম রিপোর্ট (System Report)</p>
                        <p className="text-slate-300 font-medium mt-0.5">Automated Tenant Ledger Management</p>
                      </div>
                      <div className="w-32 border-t border-slate-200 pt-1 text-center font-bold text-slate-400 uppercase tracking-widest">
                        অনুমতি স্বাক্ষর
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 no-print">
                <button
                  onClick={() => { playSound('click'); window.focus(); window.print(); }}
                  disabled={users.filter(u => getDaysLeft(u.expireDate) < 0).length === 0}
                  className="py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট
                </button>
                <button
                  onClick={handleDownloadExpiredPDF}
                  disabled={users.filter(u => getDaysLeft(u.expireDate) < 0).length === 0}
                  className="py-3.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" /> PDF ডাউনলোড
                </button>
                <button
                  onClick={() => setShowExpiredPdfModal(false)}
                  className="py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors"
                >
                  ফিরে যান
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showAllUsersPrintModal && (
          <Modal
            title="সকল গ্রাহক তালিকা প্রিন্ট ও PDF"
            size="wide"
            onClose={() => setShowAllUsersPrintModal(false)}
            isLoading={isProcessing}
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
          >
            <div className="space-y-5">
              {/* Controls Toolbar */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 no-print">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1.5">তালিকার ধরন নির্বাচন করুন</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: `সকল গ্রাহক (${toBn(users.length)})` },
                        { id: 'filtered', label: `বর্তমান ফিল্টার (${toBn(filteredUsers.length)})` },
                        { id: 'active', label: 'সক্রিয়' },
                        { id: 'warning', label: 'সতর্কতা' },
                        { id: 'expired', label: 'মেয়াদ শেষ' },
                        { id: 'deactivated', label: 'বন্ধ' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setPrintListScope(opt.id as any);
                            playSound('click');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            printListScope === opt.id
                              ? 'bg-bkash text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1.5">পেজ লেআউট (A4)</p>
                    <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => { setPrintOrientation('portrait'); playSound('click'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          printOrientation === 'portrait' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        খাড়া (Portrait)
                      </button>
                      <button
                        onClick={() => { setPrintOrientation('landscape'); playSound('click'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          printOrientation === 'landscape' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        আড়াআড়ি (Landscape)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column toggles */}
                <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> কলামসমূহ:
                  </span>
                  {[
                    { key: 'chukirdhari', label: 'চুক্তিধারী' },
                    { key: 'address', label: 'ঠিকানা' },
                    { key: 'land', label: 'জমির পরিমাণ' },
                    { key: 'contract', label: 'চুক্তির টাকা' },
                    { key: 'balance', label: 'পাওয়ার ব্যালেন্স' },
                    { key: 'collected', label: 'আদায়কৃত টাকা' },
                    { key: 'expireDate', label: 'মেয়াদ শেষ' },
                    { key: 'status', label: 'অবস্থা' },
                  ].map((col) => {
                    const active = printColumns[col.key as keyof typeof printColumns];
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => {
                          setPrintColumns(prev => ({ ...prev, [col.key]: !prev[col.key as keyof typeof printColumns] }));
                          playSound('click');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Preview Container */}
              <div className="border border-slate-200 rounded-2xl bg-slate-100/80 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 px-1 no-print">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5 text-bkash" /> প্রিন্ট প্রিভিউ ({toBn(printableUsers.length)} জন গ্রাহক)
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {printOrientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
                  </span>
                </div>

                <div className="max-h-[460px] overflow-auto custom-scrollbar rounded-xl">
                  <div
                    id="all-users-print-area"
                    className="active-print-sheet bg-white p-6 sm:p-8 mx-auto border border-slate-200 shadow-sm text-slate-900"
                    style={{ width: printOrientation === 'landscape' ? '960px' : '740px' }}
                  >
                    {/* Formal Letterhead */}
                    <div className="flex justify-between items-start pb-5 border-b-2 border-slate-900 mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-bkash rounded-xl flex items-center justify-center text-white shrink-0">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            সকল গ্রাহক ও চুক্তি তালিকা
                          </h1>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            LandManager Pro · মাস্টার লেজার প্রতিবেদন
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">
                          তালিকা:{' '}
                          <span className="text-bkash">
                            {printListScope === 'all'
                              ? 'সকল গ্রাহক'
                              : printListScope === 'filtered'
                              ? 'ফিল্টারকৃত তালিকা'
                              : printListScope === 'active'
                              ? 'সক্রিয় গ্রাহক'
                              : printListScope === 'warning'
                              ? 'সতর্কতা (৩০ দিন)'
                              : printListScope === 'expired'
                              ? 'মেয়াদ উত্তীর্ণ'
                              : 'বন্ধ একাউন্ট'}
                          </span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                          প্রিন্ট তারিখ: {toBn(new Date().toLocaleDateString('bn-BD'))} · {liveTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                          মোট রেকর্ড: {toBn(printableUsers.length)} জন
                        </p>
                      </div>
                    </div>

                    {/* Executive Summary Strip inside Print Sheet */}
                    <div className="grid grid-cols-4 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500">মোট গ্রাহক</p>
                        <p className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
                          {toBn(printableUsers.length)} জন
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-bkash-light/60 border border-bkash/20">
                        <p className="text-[10px] font-bold text-bkash">মোট চুক্তির টাকা</p>
                        <p className="text-base font-extrabold text-bkash tabular-nums mt-0.5">
                          {toBn(printSummary.totalAmount.toLocaleString())} ৳
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500">মোট পাওয়ার ব্যালেন্স</p>
                        <p className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
                          {toBn(printSummary.totalBalance.toLocaleString())} ৳
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <p className="text-[10px] font-bold text-emerald-700">মোট আদায়কৃত টাকা</p>
                        <p className="text-base font-extrabold text-emerald-700 tabular-nums mt-0.5">
                          {toBn(printSummary.totalCollected.toLocaleString())} ৳
                        </p>
                      </div>
                    </div>

                    {/* Master User Table */}
                    <table className="w-full text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[11px] font-bold">
                          <th className="py-2.5 px-2.5 text-center border-r border-slate-700 w-10">ক্রম</th>
                          <th className="py-2.5 px-2.5 border-r border-slate-700">গ্রাহকের নাম ও মোবাইল</th>
                          {printColumns.chukirdhari && (
                            <th className="py-2.5 px-2.5 border-r border-slate-700">চুক্তিধারী</th>
                          )}
                          {printColumns.address && (
                            <th className="py-2.5 px-2.5 border-r border-slate-700">ঠিকানা</th>
                          )}
                          {printColumns.land && (
                            <th className="py-2.5 px-2.5 text-center border-r border-slate-700">জমি</th>
                          )}
                          {printColumns.contract && (
                            <th className="py-2.5 px-2.5 text-right border-r border-slate-700">চুক্তি (৳)</th>
                          )}
                          {printColumns.balance && (
                            <th className="py-2.5 px-2.5 text-right border-r border-slate-700">ব্যালেন্স (৳)</th>
                          )}
                          {printColumns.collected && (
                            <th className="py-2.5 px-2.5 text-right border-r border-slate-700">আদায় (৳)</th>
                          )}
                          {printColumns.expireDate && (
                            <th className="py-2.5 px-2.5 text-center border-r border-slate-700">মেয়াদ শেষ</th>
                          )}
                          {printColumns.status && (
                            <th className="py-2.5 px-2.5 text-center">অবস্থা</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {printableUsers.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-10 text-center text-xs font-bold text-slate-400">
                              এই ফিল্টারে কোনো গ্রাহক পাওয়া যায়নি
                            </td>
                          </tr>
                        ) : (
                          printableUsers.map((u, index) => {
                            const daysLeft = getDaysLeft(u.expireDate);
                            const st = u.isActive === false ? 'deactivated' : getStatus(daysLeft);
                            const stLabel = st === 'active' ? 'সক্রিয়' : st === 'warning' ? 'সতর্কতা' : st === 'deactivated' ? 'বন্ধ' : 'মেয়াদ শেষ';
                            const stClass = st === 'active'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : st === 'warning'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : st === 'deactivated'
                              ? 'text-slate-600 bg-slate-100 border-slate-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200';

                            return (
                              <tr key={u.id} className="border-b border-slate-200 even:bg-slate-50/70 text-[11px]">
                                <td className="py-2 px-2 text-center font-bold text-slate-500 border-r border-slate-200 tabular-nums">
                                  {toBn(index + 1)}
                                </td>
                                <td className="py-2 px-2.5 border-r border-slate-200">
                                  <div className="font-bold text-slate-900 leading-tight">{u.name}</div>
                                  {u.nameBn && <div className="text-[10px] text-slate-500 leading-tight">{u.nameBn}</div>}
                                  <div className="text-[10px] font-semibold text-bkash tabular-nums mt-0.5">{toBn(u.mobile)}</div>
                                </td>
                                {printColumns.chukirdhari && (
                                  <td className="py-2 px-2.5 border-r border-slate-200">
                                    <div className="font-semibold text-slate-800">{u.chukirdharirName || '---'}</div>
                                    {u.chukirdharirNameBn && <div className="text-[10px] text-slate-500">{u.chukirdharirNameBn}</div>}
                                  </td>
                                )}
                                {printColumns.address && (
                                  <td className="py-2 px-2.5 text-slate-600 border-r border-slate-200 max-w-[140px] break-words">
                                    {u.address}
                                  </td>
                                )}
                                {printColumns.land && (
                                  <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-200 tabular-nums whitespace-nowrap">
                                    {toBn(u.jomirPoriman)}
                                  </td>
                                )}
                                {printColumns.contract && (
                                  <td className="py-2 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200 tabular-nums whitespace-nowrap">
                                    {toBn(u.amount.toLocaleString())}
                                  </td>
                                )}
                                {printColumns.balance && (
                                  <td className="py-2 px-2.5 text-right font-extrabold text-bkash border-r border-slate-200 tabular-nums whitespace-nowrap">
                                    {toBn(u.pwrBalance.toLocaleString())}
                                  </td>
                                )}
                                {printColumns.collected && (
                                  <td className="py-2 px-2.5 text-right font-bold text-emerald-700 border-r border-slate-200 tabular-nums whitespace-nowrap">
                                    {toBn((u.collectedBalance || 0).toLocaleString())}
                                  </td>
                                )}
                                {printColumns.expireDate && (
                                  <td className="py-2 px-2 text-center font-semibold text-slate-700 border-r border-slate-200 tabular-nums whitespace-nowrap">
                                    {toBn(formatDate(u.expireDate))}
                                  </td>
                                )}
                                {printColumns.status && (
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${stClass}`}>
                                      {stLabel}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {printableUsers.length > 0 && (
                        <tfoot>
                          <tr className="bg-slate-100 border-t-2 border-slate-900 text-[11px] font-extrabold text-slate-900">
                            <td
                              colSpan={
                                2 +
                                (printColumns.chukirdhari ? 1 : 0) +
                                (printColumns.address ? 1 : 0) +
                                (printColumns.land ? 1 : 0)
                              }
                              className="py-2.5 px-3 text-right border-r border-slate-300"
                            >
                              সর্বমোট ({toBn(printableUsers.length)} জন):
                            </td>
                            {printColumns.contract && (
                              <td className="py-2.5 px-2.5 text-right border-r border-slate-300 tabular-nums whitespace-nowrap">
                                {toBn(printSummary.totalAmount.toLocaleString())} ৳
                              </td>
                            )}
                            {printColumns.balance && (
                              <td className="py-2.5 px-2.5 text-right text-bkash border-r border-slate-300 tabular-nums whitespace-nowrap">
                                {toBn(printSummary.totalBalance.toLocaleString())} ৳
                              </td>
                            )}
                            {printColumns.collected && (
                              <td className="py-2.5 px-2.5 text-right text-emerald-700 border-r border-slate-300 tabular-nums whitespace-nowrap">
                                {toBn(printSummary.totalCollected.toLocaleString())} ৳
                              </td>
                            )}
                            {printColumns.expireDate && <td className="py-2.5 px-2 border-r border-slate-300" />}
                            {printColumns.status && <td className="py-2.5 px-2" />}
                          </tr>
                        </tfoot>
                      )}
                    </table>

                    {/* Official Signatures */}
                    <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end text-[11px]">
                      <div>
                        <p className="font-bold text-slate-600">LandManager Pro · অফিসিয়াল কপি</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">প্রস্তুতকারী: {currentUser.displayName || currentUser.email}</p>
                      </div>
                      <div className="flex gap-10">
                        <div className="w-32 border-t border-slate-400 pt-1 text-center font-bold text-slate-600">
                          প্রস্তুতকারক
                        </div>
                        <div className="w-36 border-t border-slate-900 pt-1 text-center font-bold text-slate-900">
                          কর্তৃপক্ষ সিল ও স্বাক্ষর
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
                <button
                  onClick={handlePrintAllUsers}
                  disabled={printableUsers.length === 0}
                  className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট করুন (Print)
                </button>
                <button
                  onClick={handleDownloadAllUsersPDF}
                  disabled={printableUsers.length === 0}
                  className="py-3.5 bg-bkash hover:bg-bkash-dark text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-bkash/20"
                >
                  <FileDown className="w-4 h-4" /> PDF ডাউনলোড করুন
                </button>
                <button
                  onClick={() => setShowAllUsersPrintModal(false)}
                  className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  বন্ধ করুন
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
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
          >
            <AnimatePresence>
              {showRestorePrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 bg-bkash-light border border-bkash/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bkash rounded-xl flex items-center justify-center text-white shrink-0">
                      <History size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-bkash uppercase tracking-wider">অসমাপ্ত ড্রাফট পাওয়া গিয়াছে</p>
                      <p className="text-[8px] font-bold text-bkash/60 uppercase tracking-widest">আপনি কি আগের তথ্যগুলো রিস্টোর করতে চান?</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRestoreDraft}
                      className="flex-1 sm:flex-none px-4 py-2 bg-bkash text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-bkash/20"
                    >
                      রিস্টোর করুন
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDiscardDraft}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100"
                    >
                      মুছে ফেলুন
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAddEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> গ্রাহকের নাম *</label>
                <input name="name" required value={formValues.name} onChange={handleFormInputChange} placeholder="যেমন: মোঃ রহিম মিয়া / Md. Rahim Mia" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> চুক্তিধারীর নাম *</label>
                <input name="chukirdharirName" required value={formValues.chukirdharirName} onChange={handleFormInputChange} placeholder="যেমন: মোঃ শাহিন / Md. Shahin" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-xs font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> মোবাইল নম্বর *</label>
                <input name="mobile" required value={formValues.mobile} onChange={handleFormInputChange} placeholder="01XXXXXXXXX" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-xs font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3" /> ঠিকানা *</label>
                <textarea name="address" rows={2} required value={formValues.address} onChange={handleFormInputChange} placeholder="গ্রাম, পোস্ট, জেলা" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all resize-none text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><TreeDeciduous className="w-3 h-3" /> জমির পরিমাণ *</label>
                <input name="jomirPoriman" required value={formValues.jomirPoriman} onChange={handleFormInputChange} placeholder="যেমন: ৫ কাঠা, ২ বিঘা" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Banknote className="w-3 h-3" /> চুক্তির পরিমাণ (টাকা) *</label>
                <input type="number" name="amount" required value={formValues.amount} onChange={handleFormInputChange} placeholder="যেমন: 50000" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> মেয়াদ শেষের তারিখ *</label>
                <input type="date" name="expireDate" required value={formValues.expireDate} onChange={handleFormInputChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Wallet className="w-3 h-3" /> পাওয়ার ব্যালেন্স (টাকা) *</label>
                <input type="number" name="pwrBalance" required value={formValues.pwrBalance} onChange={handleFormInputChange} placeholder="যেমন: 1000" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[8px] font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><ScrollText className="w-3 h-3" /> চুক্তিনামা / শর্তাবলি</label>
                <textarea name="terms" rows={3} value={formValues.terms} onChange={handleFormInputChange} placeholder="চুক্তির বিশেষ শর্তাবলি লিখুন (প্রচ্ছদ রশিদ বা চুক্তিপত্রে প্রিন্ট হবে)..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all resize-none text-[8px] font-bold" />
              </div>
              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-bkash text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-bkash/20 hover:bg-bkash-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <ActionSpinner /> : (
                    <>
                      <Save className="w-4 h-4" /> {editingUser ? "পরিবর্তন সংরক্ষণ" : "নতুন ইউজার যোগ করুন"}
                    </>
                  )}
                </motion.button>
                <motion.button 
                  whileHover={{ backgroundColor: "#e2e8f0" }}
                  whileTap={{ scale: 0.98 }}
                  type="button" 
                  disabled={isProcessing}
                  onClick={() => setShowAddEditModal(false)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                >
                  বাতিল
                </motion.button>
              </div>
            </form>
          </Modal>
        )}

        {showViewModal && viewingUser && (
          <Modal 
            title="প্রোফাইল ইনফর্মেশন" 
            onClose={() => setShowViewModal(false)}
            isLoading={isProcessing}
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
          >
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 no-print">
                {(['details', 'card', 'portfolio', 'receipt'] as const).map((mode) => (
                  <motion.button 
                    key={mode}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setViewMode(mode);
                      playSound('click');
                    }}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      viewMode === mode ? 'bg-white shadow-sm text-bkash' : 'text-slate-500'
                    }`}
                  >
                    {mode === 'details' ? 'বিস্তারিত তথ্য' : mode === 'card' ? 'প্রিন্টেবল কার্ড' : mode === 'portfolio' ? 'পোর্টফোলিও' : 'টাকা বৃদ্ধির রশিদ'}
                  </motion.button>
                ))}
              </div>

            <div id="print-area" className="active-print-sheet w-full max-w-full overflow-x-hidden p-1">
              {viewMode === 'details' ? (
                <div id="print-details" className="space-y-6">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200/50">
                      <div className="w-16 h-16 rounded-2xl bg-bkash flex items-center justify-center text-white shadow-xl shadow-bkash/20">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex flex-col">
                          <h3 className="text-lg font-black text-slate-800">{viewingUser.name}</h3>
                          {viewingUser.nameBn && (
                            <p className="text-[10px] font-bold text-slate-400 leading-none">{viewingUser.nameBn}</p>
                          )}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-widest text-[8px] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-bkash" /> {viewingUser.address}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">মোবাইল নম্বর</div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-bkash" /> {toBn(viewingUser.mobile)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-left">জমির পরিমাণ</div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <TreeDeciduous className="w-4 h-4 text-emerald-500" /> {toBn(viewingUser.jomirPoriman)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">চুক্তিধারীর নাম</p>
                        <div className="font-bold text-slate-800 flex items-center gap-2 text-[8px]">
                          <Handshake className="w-4 h-4 text-bkash" /> 
                          <div className="flex flex-col">
                            <span>{viewingUser.chukirdharirName}</span>
                            {viewingUser.chukirdharirNameBn && (
                              <span className="text-[10px] text-slate-400 leading-none">{viewingUser.chukirdharirNameBn}</span>
                            )}
                          </div>
                        </div>
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
                          <div key={`hist-details-${idx}-${h.date}`} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-bkash/10 transition-colors group">
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
                <div id="print-card" className="w-[320px] max-w-[90vw] mx-auto bg-white border-[3px] border-slate-900 rounded-sm p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-900/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex border-b-2 border-slate-900 pb-3 mb-4 justify-between items-center text-slate-800">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-bkash" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">অফিসিয়াল কার্ড</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">আইডি: {toBn(viewingUser.id.slice(-6).toUpperCase())}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col border-l-4 border-bkash pl-3">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight break-words">{viewingUser.name}</h3>
                      {viewingUser.nameBn && (
                        <p className="text-[12px] font-bold text-slate-400 leading-none mt-1">{viewingUser.nameBn}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-100">
                      {[
                        { label: 'মোবাইল', value: toBn(viewingUser.mobile) },
                        { label: 'চুক্তিধারী', value: viewingUser.chukirdharirName + (viewingUser.chukirdharirNameBn ? ` (${viewingUser.chukirdharirNameBn})` : '') },
                        { label: 'ঠিকানা', value: viewingUser.address },
                        { label: 'জমির পরিমাণ', value: toBn(viewingUser.jomirPoriman) + ' শতাংশ' },
                        { label: 'ব্যালেন্স', value: toBn(viewingUser.pwrBalance.toLocaleString()) + ' ৳' },
                        { label: 'মেয়াদ শেষ', value: toBn(formatDate(viewingUser.expireDate)) },
                      ].map((item) => (
                        <div key={`card-field-${item.label}`} className="flex border-b border-slate-50 pb-2 overflow-hidden items-center group">
                          <span className="w-24 shrink-0 text-[8px] font-bold text-slate-400 group-hover:text-bkash transition-colors uppercase">{item.label}:</span>
                          <span className="text-[9px] font-black text-slate-900 flex-1 min-w-0 break-words">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center pt-4">
                       <div className={`px-6 py-2 border-2 border-slate-900 text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_rgba(15,23,42,1)] ${
                         getDaysLeft(viewingUser.expireDate) < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                         {getDaysLeft(viewingUser.expireDate) < 0 ? 'মেয়াদ উত্তীর্ণ' : 'যাচাইকৃত ইউজার'}
                       </div>
                    </div>

                    {/* Withdrawal History in Details Mode */}
                    {viewingUser.withdrawals && viewingUser.withdrawals.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <History className="w-4 h-4 text-blue-500" />
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">টাকা উত্তোলনের ইতিহাস</h4>
                        </div>
                        <div className="space-y-3">
                          {viewingUser.withdrawals.map((w, i) => (
                            <div key={`withdraw-detail-${i}`} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center group hover:bg-blue-50 transition-colors">
                              <div>
                                <p className="text-[10px] font-black text-slate-800 tabular-nums">{toBn(formatDate(w.date))}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{w.purpose}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-blue-600">-{toBn(w.amount.toLocaleString())} ৳</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">উত্তোলন</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : viewMode === 'portfolio' ? (
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
                          { label: 'প্রথম পক্ষ (ইউজার)', value: viewingUser.name + (viewingUser.nameBn ? ` (${viewingUser.nameBn})` : '') },
                          { label: 'পিতার নাম / স্বামী', value: (viewingUser.chukirdharirName || '---') + (viewingUser.chukirdharirNameBn ? ` (${viewingUser.chukirdharirNameBn})` : '') },
                          { label: 'মোবাইল নম্বর', value: toBn(viewingUser.mobile) },
                          { label: 'ঠিকানা', value: viewingUser.address },
                        ].map((item) => (
                          <div key={`part-field-${item.label}`} className="flex border-b border-slate-50 py-1 overflow-hidden">
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
                        ].map((item) => (
                          <div key={`prop-field-${item.label}`} className="flex border-b border-slate-50 py-1 overflow-hidden">
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
                        ].map((item) => (
                          <div key={`fin-field-${item.label}`} className={`flex border-b border-slate-50 py-1 overflow-hidden ${item.highlight ? 'bg-slate-50 px-1' : ''}`}>
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
                              <tr key={`hist-portfolio-${i}-${h.date}`} className="border-b border-slate-100">
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

                    {/* Section 5: Withdrawal Table */}
                    {viewingUser.withdrawals && viewingUser.withdrawals.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-900">
                          <span className="text-[9px] font-black">০৫.</span>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">উত্তোলনের তালিকা</h3>
                        </div>
                        
                        <div className="px-1 overflow-x-auto">
                          <table className="w-full text-left border border-slate-200 table-fixed">
                            <thead>
                              <tr className="bg-blue-600 text-white">
                                <th className="w-10 px-2 py-1.5 text-[8px] font-black uppercase border-r border-blue-400 text-center">নং</th>
                                <th className="px-2 py-1.5 text-[8px] font-black uppercase border-r border-blue-400">তারিখ</th>
                                <th className="px-2 py-1.5 text-[8px] font-black uppercase border-r border-blue-400 text-right">পরিমাণ</th>
                                <th className="px-2 py-1.5 text-[8px] font-black uppercase">উদ্দেশ্য</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewingUser.withdrawals.map((w, i) => (
                                <tr key={`withdraw-port-${i}-${w.date}`} className="border-b border-slate-100">
                                  <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-50">{toBn(i + 1)}</td>
                                  <td className="px-2 py-1.5 text-[9px] font-bold text-slate-700 border-r border-slate-50">{toBn(formatDate(w.date))}</td>
                                  <td className="px-2 py-1.5 text-[9px] font-black text-blue-600 text-right border-r border-slate-50">{toBn(w.amount.toLocaleString())}</td>
                                  <td className="px-2 py-1.5 text-[9px] font-bold text-slate-600 truncate">{w.purpose}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {/* Section 6: Signatures */}
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
              ) : (
                <div id="print-receipt" className="bg-white p-6 md:p-10 shadow-sm border border-slate-200 rounded-sm min-h-[600px] flex flex-col">
                  {/* Receipt Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-bkash flex items-center justify-center text-white rounded-xl">
                        <Landmark className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div>
                        <h2 className="text-md md:text-xl font-black text-slate-900 uppercase">LandManager Pro</h2>
                        <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">টাকা সংগ্রহের অফিশিয়াল রশিদ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] md:text-[10px] font-black text-slate-900">ভাউচার নং: {toBn(viewingUser.id.slice(-6).toUpperCase())}</p>
                      <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">তারিখ: {toBn(formatDate(new Date().toISOString()))}</p>
                    </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">গ্রাহকের তথ্য</p>
                        <h3 className="text-[10px] md:text-md font-black text-slate-900">{viewingUser.name} {viewingUser.nameBn && `(${viewingUser.nameBn})`}</h3>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-600">{viewingUser.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">চুক্তিধারী</div>
                        <h3 className="text-[10px] md:text-md font-black text-slate-900">{viewingUser.chukirdharirName} {viewingUser.chukirdharirNameBn && `(${viewingUser.chukirdharirNameBn})`}</h3>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-600">{toBn(viewingUser.mobile)}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl">
                      <h4 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">আর্থিক হিসাব (টাকা বৃদ্ধি)</h4>
                      
                      {(() => {
                        const lastHistory = viewingUser.history && viewingUser.history.length > 0 
                          ? viewingUser.history[viewingUser.history.length - 1] 
                          : null;
                        
                        const addedAmount = lastHistory ? lastHistory.amount : 0;
                        const previousAmount = viewingUser.amount - addedAmount;
                        
                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                              <span className="font-bold text-slate-500 uppercase">পূর্বে চুক্তিবদ্ধ টাকা:</span>
                              <span className="font-black text-slate-900">{toBn(previousAmount.toLocaleString())} ৳</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] md:text-[11px] py-3 border-y border-dashed border-slate-200">
                              <span className="font-bold text-emerald-600 uppercase">বর্তমানে বৃদ্ধিকৃত টাকা:</span>
                              <span className="font-black text-emerald-600">+ {toBn(addedAmount.toLocaleString())} ৳</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] md:text-[12px] pt-2">
                              <span className="font-black text-slate-900 uppercase">সর্বমোট চুক্তির টাকা:</span>
                              <span className="font-black text-bkash underline underline-offset-4 decoration-2">{toBn(viewingUser.amount.toLocaleString())} ৳</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {viewingUser.terms && (
                      <div className="mt-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">বিশেষ শর্তাবলি</p>
                        <div className="text-[8px] md:text-[9px] font-bold text-slate-600 leading-relaxed italic bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                          {viewingUser.terms}
                        </div>
                      </div>
                    )}
                    
                    {!viewingUser.terms && (
                      <div className="mt-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">সার্বজনীন শর্তাবলি</p>
                        <ul className="text-[7px] md:text-[8px] font-bold text-slate-500 space-y-1.5 list-disc pl-4">
                          <li>উক্ত টাকা সংগ্রহের পর চুক্তির মেয়াদ বৃদ্ধি করা হইয়াছে।</li>
                          <li>চুক্তি অনুযায়ী নির্ধারিত সময়ের মধ্যে পাহাড়তলী মেইনটেন্যান্স কাজ সম্পন্ন করা হইবে।</li>
                          <li>কর্তৃপক্ষ চাহিবামাত্র ইউজার তাহার প্রয়োজনীয় দলিলপত্র প্রদর্শন করিতে বাধ্য থাকিবেন।</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-16 md:mt-20 flex justify-between px-6 pt-10 border-t border-slate-100 signature-footer">
                    <div className="text-center w-32 md:w-36">
                      <div className="border-b border-slate-900 mb-2"></div>
                      <p className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest">ইউজার স্বাক্ষর</p>
                    </div>
                    <div className="text-center w-32 md:w-36">
                      <div className="border-b border-slate-900 mb-2"></div>
                      <p className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest">কর্তৃপক্ষ সিল ও স্বাক্ষর</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-10 no-print">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="flex-1 py-4.5 bg-bkash text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-bkash/30 flex items-center justify-center gap-2 hover:bg-bkash-dark transition-all"
              >
                <Printer className="w-4 h-4" /> {viewMode === 'card' ? 'প্রিন্ট' : viewMode === 'portfolio' ? 'প্রিন্ট' : 'প্রিন্ট'}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                className="flex-1 py-4.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" /> পিডিওএফ ডাউনলোড
              </motion.button>
              <motion.button 
                whileHover={{ backgroundColor: "#e2e8f0" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowViewModal(false)} 
                className="flex-1 py-4.5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                বন্ধ
              </motion.button>
            </div>
          </Modal>
        )}

        {showCollectionModal && collectingUser && (
          <Modal 
            title="টাকা সংগ্রহ ও মেয়াদ বৃদ্ধি" 
            onClose={() => setShowCollectionModal(false)}
            isLoading={isProcessing}
            isSuccess={isSuccess}
            playSound={playSound}
            isError={isError}
            errorMessage={errorMessage}
          >
            {/* User Info Header */}
            <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-bkash flex items-center justify-center text-white shadow-lg shadow-bkash/10">
                  <Handshake className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="text-md font-black text-slate-800 uppercase tracking-tight truncate">{collectingUser.name}</h3>
                    {collectingUser.nameBn && (
                      <p className="text-[10px] font-bold text-slate-400 leading-none">{collectingUser.nameBn}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-bkash" /> {collectingUser.address}
                    </div>
                    <div className="text-[8px] font-black text-bkash uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {collectingUser.mobile}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Handshake className="w-3 h-3 text-bkash" /> 
                      <div className="flex flex-col">
                        <span>{collectingUser.chukirdharirName}</span>
                        {collectingUser.chukirdharirNameBn && (
                          <span className="text-[8px] text-slate-400 font-bold">{collectingUser.chukirdharirNameBn}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <TreeDeciduous className="w-3 h-3 text-bkash" /> জমি: {collectingUser.jomirPoriman}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Banknote className="w-3 h-3 text-bkash" /> চুক্তির পরিমাণ: {toBn(collectingUser.amount.toLocaleString())} ৳
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  >
                    <Check className="w-12 h-12 text-white" strokeWidth={4} />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">সংগ্রহ সফল হয়েছে!</h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px]">
                  গ্রাহক {collectingUser.name} এর নিকট হইতে {toBn(collectionAmount)} টাকা সফলভাবে সংগৃহীত হইয়াছে।
                </div>
                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 w-full">
                  <div className="flex justify-between text-[10px] mb-2 font-bold text-slate-500 uppercase tracking-widest">
                    <span>সংগৃহীত টাকা</span>
                    <span className="text-emerald-600 font-black">{toBn(collectionAmount)} ৳</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>নতুন ব্যালেন্স</span>
                    <span className="text-bkash font-black">{toBn((collectingUser.pwrBalance - parseFloat(collectionAmount)).toLocaleString())} ৳</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Detail cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-bkash-light border border-bkash/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-[8px] font-black text-bkash uppercase tracking-widest mb-1">বর্তমান ব্যালেন্স</div>
                    <div className="text-xl font-black text-bkash">{toBn(collectingUser.pwrBalance.toLocaleString())} ৳</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">বর্তমান মেয়াদ</div>
                    <div className="text-md font-black text-slate-700">{formatDate(collectingUser.expireDate)}</div>
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
                    <div className="text-[8px] font-black text-amber-600 flex items-center justify-center sm:justify-start gap-1 px-1 uppercase tracking-tighter">
                      <AlertTriangle className="w-3 h-3" /> প্রতিটি মাসের জন্য ১০০০ টাকা চার্জ (পরিবর্তনযোগ্য)
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <label className="text-[8px] font-black text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 tracking-widest"><TrendingUp className="w-4 h-4 text-emerald-500" /> সংগ্রহের পরিমাণ (টাকা) *</label>
                    <input 
                      type="number" 
                      value={collectionAmount}
                      onChange={(e) => setCollectionAmount(e.target.value)}
                      placeholder="চার্জের পরিমাণ লিখুন" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-md font-black text-emerald-600 text-center sm:text-left" 
                    />
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <label className="text-[8px] font-black text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 tracking-widest"><FileText className="w-4 h-4 text-slate-400" /> বিশেষ শর্তাবলি (যদি থাকে)</label>
                    <textarea 
                      value={collectionTerms}
                      onChange={(e) => setCollectionTerms(e.target.value)}
                      placeholder="এই কিস্তির জন্য কোনো বিশেষ শর্ত থাকলে তা লিখুন..." 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-bkash focus:bg-white focus:ring-4 focus:ring-bkash/10 outline-none transition-all text-[10px] font-bold text-slate-700 min-h-[80px] resize-none" 
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
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={processCollection}
                      disabled={isProcessing}
                      className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    </motion.button>
                    <motion.button 
                      whileHover={{ backgroundColor: "#e2e8f0" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCollectionModal(false)}
                      disabled={isProcessing}
                      className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all disabled:opacity-50"
                    >
                      বাতিল করুন
                    </motion.button>
                  </div>
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
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">পূববর্তী সংগ্রহের রেকর্ডসমূহ</div>
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
                        key={`hist-collect-${idx}-${item.date}`} 
                        className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-bkash/20 hover:shadow-lg transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-bkash group-hover:text-white transition-colors duration-300">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="text-[8px] font-black text-slate-800">{formatDate(item.date)}</div>
                               <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">সংগ্রহের তারিখ</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 sm:gap-8">
                            <div className="text-center sm:text-right">
                              <div className="text-[8px] font-black text-emerald-600">{item.amount.toLocaleString()} ৳</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">টাকা</div>
                            </div>
                            <div className="text-center sm:text-right">
                              <div className="text-[8px] font-black text-bkash">+{item.monthsExtended} মাস</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">বর্ধিত</div>
                            </div>
                            <div className="text-center sm:text-right">
                              <div className="text-[8px] font-black text-slate-700">{formatDate(item.newExpiryDate)}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">নতুন মেয়াদ</div>
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
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">কোনো লেনদেনের ইতিহাস পাওয়া যায়নি</div>
                    </div>
                  )}
                </div>
              </div>
            </>
            )}
          </Modal>
        )}

        {showWithdrawModal && withdrawingUser && (
          <Modal 
            title={withdrawMode === 'withdraw' ? "টাকা উত্তোলন করুন" : "টাকা বৃদ্ধি করুন / জমা দিন"} 
            onClose={() => setShowWithdrawModal(false)}
            isLoading={isProcessing}
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
          >
            <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  withdrawMode === 'withdraw' ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'
                }`}>
                  {withdrawMode === 'withdraw' ? <ArrowUpCircle className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="text-md font-black text-slate-800 uppercase tracking-tight truncate">{withdrawingUser.name}</h3>
                    {withdrawingUser.nameBn && (
                      <p className="text-[10px] font-bold text-slate-400 leading-none">{withdrawingUser.nameBn}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <div className="text-[8px] font-black text-bkash uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {withdrawingUser.mobile}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Banknote className="w-3 h-3 text-bkash" /> বর্তমান ব্যালেন্স: {toBn(withdrawingUser.pwrBalance.toLocaleString())} ৳
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className={`w-24 h-24 ${withdrawMode === 'withdraw' ? 'bg-blue-500 shadow-blue-200' : 'bg-emerald-500 shadow-emerald-200'} rounded-full flex items-center justify-center mb-6 shadow-2xl transition-colors`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  >
                    <Check className="w-12 h-12 text-white" strokeWidth={4} />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{withdrawMode === 'withdraw' ? 'উত্তোলন সফল হয়েছে!' : 'বৃদ্ধি সফল হয়েছে!'}</h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px]">
                  গ্রাহক {withdrawingUser.name} এর {withdrawMode === 'withdraw' ? 'উত্তোলন' : 'বৃদ্ধি'} অনুরোধ সফলভাবে সম্পন্ন হইয়াছে।
                </div>
                <div className={`mt-8 p-4 ${withdrawMode === 'withdraw' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border w-full`}>
                  <div className="flex justify-between text-[10px] mb-2 font-bold text-slate-500 uppercase tracking-widest">
                    <span>পরিমাণ</span>
                    <span className={`${withdrawMode === 'withdraw' ? 'text-blue-600' : 'text-emerald-600'} font-black`}>{toBn(withdrawAmount)} ৳</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>নতুন ব্যালেন্স</span>
                    <span className="text-bkash font-black">{toBn((withdrawMode === 'withdraw' ? withdrawingUser.pwrBalance - parseFloat(withdrawAmount) : withdrawingUser.pwrBalance + parseFloat(withdrawAmount)).toLocaleString())} ৳</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                  <button 
                    onClick={() => {
                      setWithdrawMode('withdraw');
                      playSound('click');
                    }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      withdrawMode === 'withdraw' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    টাকা উত্তোলন
                  </button>
                  <button 
                    onClick={() => {
                      setWithdrawMode('add');
                      playSound('click');
                    }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      withdrawMode === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    টাকা বাড়ানো
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                      {withdrawMode === 'withdraw' ? <Banknote className="w-4 h-4 text-blue-500" /> : <TrendingUp className="w-4 h-4 text-emerald-500" />}
                      {withdrawMode === 'withdraw' ? 'উত্তোলনের পরিমাণ (টাকা) *' : 'বৃদ্ধির পরিমাণ (টাকা) *'}
                    </label>
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="টাকার পরিমাণ লিখুন" 
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:ring-4 outline-none transition-all text-md font-black ${
                        withdrawMode === 'withdraw' ? 'focus:border-blue-600 focus:ring-blue-600/10 text-blue-600' : 'focus:border-emerald-600 focus:ring-emerald-600/10 text-emerald-600'
                      }`} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                      <FileText className="w-4 h-4 text-slate-400" /> {withdrawMode === 'withdraw' ? 'উত্তোলনের কারণ / উদ্দেশ্য *' : 'বৃদ্ধির কারণ / নোট *'}
                    </label>
                    <textarea 
                      value={withdrawPurpose}
                      onChange={(e) => setWithdrawPurpose(e.target.value)}
                      placeholder={withdrawMode === 'withdraw' ? "কেন টাকা উত্তোলন করা হচ্ছে তা লিখুন..." : "কেন টাকা বৃদ্ধি করা হচ্ছে বা কোনো নোট থাকলে লিখুন..."}
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:ring-4 outline-none transition-all text-[10px] font-bold text-slate-700 min-h-[100px] resize-none ${
                        withdrawMode === 'withdraw' ? 'focus:border-blue-600 focus:ring-blue-600/10' : 'focus:border-emerald-600 focus:ring-emerald-600/10'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={processWithdrawal}
                      disabled={isProcessing}
                      className={`py-4 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                        withdrawMode === 'withdraw' ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          প্রসেসিং...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> {withdrawMode === 'withdraw' ? 'উত্তোলন সম্পন্ন করুন' : 'বৃদ্ধি সম্পন্ন করুন'}
                        </>
                      )}
                    </motion.button>
                    <motion.button 
                      whileHover={{ backgroundColor: "#e2e8f0" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowWithdrawModal(false)}
                      disabled={isProcessing}
                      className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all disabled:opacity-50"
                    >
                      বাতিল করুন
                    </motion.button>
                  </div>

                  {/* Transaction History Section in Withdraw Modal */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <History className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-slate-800 uppercase tracking-widest">লেনদেনের ইতিহাস</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">উত্তোলন ও জমার রেকর্ডসমূহ</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Combine both collections and withdrawals for a full history view */}
                      {(() => {
                        const fullHistory = [
                          ...(withdrawingUser.withdrawals || []).map(w => ({ ...w, type: 'withdraw' as const })),
                          ...(withdrawingUser.history || []).map(h => ({ ...h, type: 'add' as const, purpose: (h as any).purpose || 'কিস্তি / জমা' }))
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (fullHistory.length === 0) {
                          return (
                            <div className="bg-slate-50/50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-100">
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">কোনো লেনদেনের ইতিহাস পাওয়া যায়নি</div>
                            </div>
                          );
                        }

                        return fullHistory.map((item, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            key={`hist-withdraw-modal-${idx}`} 
                            className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                item.type === 'withdraw' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                              }`}>
                                {item.type === 'withdraw' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="text-[8px] font-black text-slate-800">{formatDate(item.date)}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{item.purpose}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-[9px] font-black ${item.type === 'withdraw' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {item.type === 'withdraw' ? '-' : '+'}{toBn(item.amount.toLocaleString())} ৳
                              </div>
                              <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                {item.type === 'withdraw' ? 'উত্তোলন' : 'জমা / বৃদ্ধি'}
                              </div>
                            </div>
                          </motion.div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Modal>
        )}

        {showReportsModal && (
          <Modal 
            title="প্রতিবেদন জেনারেট করুন" 
            onClose={() => setShowReportsModal(false)}
            isLoading={isProcessing}
            playSound={playSound}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
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

                    <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={async () => {
                          setIsProcessing(true);
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          downloadCSV(reportData, `Report_${reportRange.start}_to_${reportRange.end}.csv`);
                          setIsSuccess(true);
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          setIsSuccess(false);
                          setIsProcessing(false);
                          setShowReportsModal(false);
                        }}
                        className="py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileDown className="w-4 h-4" /> CSV এক্সপোর্ট
                      </button>

                      <button
                        onClick={() => {
                          setShowReportsModal(false);
                          setPrintListScope('all');
                          setShowAllUsersPrintModal(true);
                          playSound('pop');
                        }}
                        className="py-3.5 bg-bkash hover:bg-bkash-dark text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" /> সকল তালিকা প্রিন্ট / PDF
                      </button>

                      <button
                        onClick={() => {
                          setShowReportsModal(false);
                          setShowExpiredPdfModal(true);
                          playSound('pop');
                        }}
                        className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FileDown className="w-4 h-4" /> মেয়াদ উত্তীর্ণ PDF
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </Modal>
        )}

        {showSettingsModal && (
          <Modal 
            title="সিস্টেম সেটিংস ও পছন্দসমূহ" 
            onClose={() => setShowSettingsModal(false)}
            playSound={playSound}
          >
            <div className="space-y-8">
              {/* Audio Settings */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-bkash flex items-center justify-center text-white">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">শব্দ ও মিউজিক</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">অডিও সেটিংস পরিবর্তন করুন</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-bkash/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isMuted ? 'bg-rose-50 text-rose-500' : 'bg-bkash-light text-bkash'}`}>
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">সিস্টেম সাউন্ড মিউট</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (!isMuted === false) { // if unmuting
                          const audio = new Audio(SOUNDS.click);
                          audio.volume = 0.5;
                          audio.play().catch(() => {});
                        }
                      }}
                      className="focus:outline-none"
                    >
                      {isMuted ? (
                        <ToggleRight className="w-10 h-10 text-rose-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-200" />
                      )}
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-bkash/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${!isSpeechEnabled ? 'bg-rose-50 text-rose-500' : 'bg-bkash-light text-bkash'}`}>
                        <Volume1 size={18} />
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">ভয়েস রিডিং (বাংলা)</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsSpeechEnabled(!isSpeechEnabled);
                        playSound('click');
                        if (!isSpeechEnabled) {
                          speak("ভয়েস রিডিং চালু করা হয়েছে", isMuted, true);
                        }
                      }}
                      className="focus:outline-none"
                    >
                      {isSpeechEnabled ? (
                        <ToggleRight className="w-10 h-10 text-bkash" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-200" />
                      )}
                    </motion.button>
                  </div>

                  {isSpeechEnabled && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => speak("আপনার সিস্টেমের ভয়েস টেস্ট সফল হয়েছে। আমি আপনার সহায়ক হিসেবে আছি।", isMuted, isSpeechEnabled)}
                      className="w-full py-2.5 bg-bkash/5 text-bkash rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border border-bkash/10 hover:bg-bkash/10 transition-all flex items-center justify-center gap-2 -mt-2 mb-2"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> ভয়েস টেস্ট করুন
                    </motion.button>
                  )}

                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isMusicPlaying ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                        <Music size={18} className={isMusicPlaying ? 'animate-pulse' : ''} />
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">ব্যাকগ্রাউন্ড মিউজিক</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsMusicPlaying(!isMusicPlaying);
                        playSound('click');
                      }}
                      className="focus:outline-none"
                    >
                      {isMusicPlaying ? (
                        <ToggleRight className="w-10 h-10 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-200" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">নোটিফিকেশন রিমাইন্ডার</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">রিমাইন্ডার ও মেসেজ সেটিংস</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      মেয়াদ শেষ হওয়ার ৭ দিন আগে আপনাকে স্বয়ংক্রিয়ভাবে নোটিফিকেশন প্রদান করা হইবে।
                    </p>
                  </div>
                  
                  {notifications.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setNotifications([]);
                        playSound('error');
                      }}
                      className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-2 hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      <Trash2 className="w-4 h-4" /> সকল নোটিফিকেশন ক্লিয়ার করুন
                    </motion.button>
                  )}
                </div>
              </div>

              {/* System Info */}
              <div className="px-6 text-center">
                <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">LandManager Pro v2.1.0</p>
                <p className="text-[6px] font-bold text-slate-400 uppercase tracking-[0.2em]">Designed & Developed with Passion</p>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-8 right-6 z-30 md:hidden">
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { 
            setEditingUser(null); 
            setShowAddEditModal(true); 
            playSound('pop');
          }}
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
function Modal({ title, children, onClose, isLoading, isSuccess, isError, errorMessage, playSound, size = 'default' }: { title: string, children: React.ReactNode, onClose: () => void, isLoading?: boolean, isSuccess?: boolean, isError?: boolean, errorMessage?: string, playSound?: (type: any) => void, size?: 'default' | 'wide' }) {
  const modalId = React.useId();
  
  const handleClose = () => {
    if (playSound) playSound('click');
    onClose();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      onClick={isLoading ? undefined : handleClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className={`bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full ${size === 'wide' ? 'max-w-5xl' : 'max-w-2xl'} max-h-[92vh] overflow-y-auto p-5 sm:p-7 lg:p-8 relative overflow-x-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && <ActionSpinner isSuccess={isSuccess} isError={isError} errorMessage={errorMessage} />}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center mb-4 sm:mb-8 sticky top-0 bg-white z-10 py-1 sm:py-2 -mt-2"
        >
          <h2 id={modalId} className="text-[12px] sm:text-lg font-black text-slate-800 tracking-tight">{title}</h2>
          <button 
            disabled={isLoading}
            onClick={handleClose} 
            aria-label="Close modal"
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
        </motion.div>
        <div className="pb-4 sm:pb-0 overflow-x-hidden w-full">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
