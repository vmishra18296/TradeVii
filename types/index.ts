// ========== CORE TYPES ==========

export type UserRole = 'admin' | 'investor' | 'guest' | null;

export type ThemeMode = 'dark' | 'light';

export interface Trade {
  id?: string;
  date: string;
  stock: string;
  type: string;
  quantity: number;
  buyPrice?: number;
  sellPrice?: number;
  buyValue?: number;
  sellValue?: number;
  turnover: number;
  netPL: number;
  brokerage?: number;
  notes?: string;
  strategy?: string;
  exitReason?: string;
  tags?: string[];
}

export interface Investor {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  amount: number;
  joinDate: string;
  profilePic?: string;
  status?: 'active' | 'inactive' | 'paused';
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    upi?: string;
  };
  nominee?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface Account {
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  holderName?: string;
  upi?: string;
  panNumber?: string;
  gstNumber?: string;
}

export interface SignupRequest {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  status: 'pending' | 'approved' | 'rejected';
  approved: boolean;
  createdAt: number;
  profilePic?: string;
}

export interface WithdrawalRequest {
  id?: string;
  investorName: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
}

export interface Payout {
  id?: string;
  investorName: string;
  amount: number;
  type: string;
  date: string;
  notes?: string;
}

export interface AdminLog {
  action: string;
  details?: Record<string, unknown>;
  timestamp: number;
  role?: string;
  user?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface SystemSettings {
  interestRate: number;
  profitSharePercent: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  autoApproveWithdrawals: boolean;
  maintenanceMode: boolean;
  platformName: string;
}

export interface DashboardStats {
  totalInvestment: number;
  todayPL: number;
  todayTurnover: number;
  yearlyTurnover: number;
  totalTrades: number;
  winRate: number;
  activeinvestors: number;
  pendingWithdrawals: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search: string;
  dateRange: DateRange | null;
  type: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface InterestInfo {
  preciseDays: number;
  wholeDays: number;
  dailyFixedInterest: number;
  totalFixedInterest: number;
  tradeProfitShare: number;
  totalInterest: number;
  totalAmount: number;
}
