export interface CollectionHistory {
  date: string;
  amount: number;
  monthsExtended: number;
  newExpiryDate: string;
}

export interface User {
  id: string;
  name: string;
  address: string;
  mobile: string;
  jomirPoriman: string;
  amount: number;
  expireDate: string; // ISO format (YYYY-MM-DD)
  pwrBalance: number;
  chukirdharirName: string;
  history?: CollectionHistory[];
}

export type StatusFilter = 'all' | 'active' | 'warning' | 'expired';

export interface SortConfig {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export const INITIAL_USERS: User[] = [
  { 
    id: "1", 
    name: "মোঃ রহিম মিয়া", 
    address: "ভিলেজ: সুতলী, পোঃ: রামপুর", 
    mobile: "01712-345678", 
    jomirPoriman: "৫ কাঠা", 
    amount: 50000, 
    expireDate: "2025-12-31", 
    pwrBalance: 12000, 
    chukirdharirName: "মোঃ শাহিন" 
  },
  { 
    id: "2", 
    name: "মোছা: ফাতেমা বেগম", 
    address: "ভিলেজ: কাজিপুর, পোঃ: রাজবাড়ী", 
    mobile: "01876-543210", 
    jomirPoriman: "১০ কাঠা", 
    amount: 75000, 
    expireDate: "2024-12-15", 
    pwrBalance: 5000, 
    chukirdharirName: "মোঃ হাসান" 
  },
  { 
    id: "3", 
    name: "মোঃ করিম উল্লাহ", 
    address: "ভিলেজ: বালুয়া, পোঃ: ফরিদপুর", 
    mobile: "01998-765432", 
    jomirPoriman: "২ বিঘা", 
    amount: 120000, 
    expireDate: "2024-05-20", 
    pwrBalance: 2500, 
    chukirdharirName: "মোঃ নিজাম" 
  }
];
