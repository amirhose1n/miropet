// User types
export interface IAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  role: "customer" | "admin";
  addresses: IAddress[];
  createdAt: string;
}

// Category types
export interface ICategory {
  _id: string;
  name: string;
}

// Product types
export interface IVariation {
  color?: string;
  size?: string;
  price: number;
  weight?: string;
  stock: number;
  images: string[];
}

export interface IProduct {
  _id: string;
  name: string;
  description?: string;
  category: string[];
  brand?: string;
  variations: IVariation[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin";
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentProducts: IProduct[];
  recentUsers: IUser[];
}

// Form types
export interface ProductFormData {
  name: string;
  description?: string;
  category: string[];
  brand?: string;
  variations: IVariation[];
  isFeatured: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
}

export interface CategoryFormData {
  name: string;
}
