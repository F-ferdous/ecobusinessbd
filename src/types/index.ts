import { Timestamp } from 'firebase/firestore';

// User roles
export type UserRole = 'admin' | 'employee' | 'client';

// User permissions
export type Permission = 
  | 'manage_users'
  | 'manage_packages'
  | 'view_payments'
  | 'manage_payments'
  | 'upload_documents'
  | 'download_documents'
  | 'view_own_documents'
  | 'view_all_documents'
  | 'create_custom_packages'
  | 'send_notifications';

// User status
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  createdBy?: string; // ID of admin who created this user
}

// Package types
export type PackageType = 'usa' | 'uk' | 'custom';
export type PackageStatus = 'active' | 'inactive' | 'archived';

// Service package interface
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  type: PackageType;
  basePrice: number;
  currency: 'USD' | 'GBP';
  features: string[];
  processingTime: string; // e.g., "5-7 business days"
  requiredDocuments: string[];
  status: PackageStatus;
  isCustomizable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// State fees
export interface StateFee {
  id: string;
  state: string;
  country: 'USA' | 'UK';
  feeType: string; // e.g., "registration", "annual", "amendment"
  amount: number;
  currency: 'USD' | 'GBP';
  description: string;
  isAdjustable: boolean;
  lastUpdated: Timestamp;
}

// Order status
export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'documents_required'
  | 'in_review'
  | 'completed'
  | 'cancelled'
  | 'refunded';

// Order interface
export interface Order {
  id: string;
  clientId: string;
  packageId: string;
  customPackage?: Partial<ServicePackage>;
  status: OrderStatus;
  totalAmount: number;
  currency: 'USD' | 'GBP';
  stateFees: {
    feeId: string;
    amount: number;
    adjustment: number; // positive or negative adjustment
  }[];
  paymentIntentId?: string; // Stripe payment intent ID
  invoiceNumber: string;
  notes?: string;
  assignedTo?: string; // employee ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

// Document types
export type DocumentType = 
  | 'identification'
  | 'proof_of_address'
  | 'business_registration'
  | 'articles_of_incorporation'
  | 'certificate'
  | 'invoice'
  | 'receipt'
  | 'other';

export type DocumentStatus = 'uploaded' | 'reviewed' | 'approved' | 'rejected';

// Document interface
export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: DocumentType;
  status: DocumentStatus;
  size: number;
  mimeType: string;
  downloadURL: string;
  orderId?: string;
  userId: string; // owner of the document
  uploadedBy: string; // who uploaded it (could be different from owner)
  reviewedBy?: string;
  rejectionReason?: string;
  isPublic: boolean; // whether client can see this document
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Notification types
export type NotificationType = 
  | 'order_update'
  | 'document_request'
  | 'document_uploaded'
  | 'payment_received'
  | 'service_completed'
  | 'system_message';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  orderId?: string;
  createdAt: Timestamp;
}

// Payment transaction
export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: 'USD' | 'GBP';
  paymentMethod: 'stripe' | 'paypal';
  paymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refundAmount?: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
  isClient: () => boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Form types for various operations
export interface CreateUserForm {
  email: string;
  displayName: string;
  role: UserRole;
  permissions: Permission[];
}

export interface CreatePackageForm {
  name: string;
  description: string;
  type: PackageType;
  basePrice: number;
  currency: 'USD' | 'GBP';
  features: string[];
  processingTime: string;
  requiredDocuments: string[];
  isCustomizable: boolean;
}

export interface CheckoutForm {
  packageId: string;
  customizations?: {
    additionalFeatures: string[];
    specialRequests: string;
  };
  stateFeeAdjustments: {
    feeId: string;
    adjustment: number;
  }[];
  clientNotes?: string;
}
