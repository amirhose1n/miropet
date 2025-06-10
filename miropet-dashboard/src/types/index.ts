// User types
export interface IAddress {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  role: "customer" | "admin";
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
  discount?: number;
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

// Order types
export interface IOrderItem {
  productId: string;
  productName: string;
  productBrand?: string;
  variationIndex: number;
  variationDetails: {
    color?: string;
    size?: string;
    weight?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  orderNumber: string;
  items: IOrderItem[];

  // Pricing
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;

  // Delivery Method
  deliveryMethodId?: string;
  deliveryMethodName?: string;
  deliveryMethodPrice?: number;

  // Address IDs (instead of embedded objects)
  shippingAddressId: string;
  billingAddressId?: string;

  // Status
  status: "submitted" | "inProgress" | "posted" | "done" | "canceled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;

  // Notes
  customerNotes?: string;
  adminNotes?: string;

  // Tracking
  trackingNumber?: string;

  // User details (populated)
  user?: IUser;
}

export interface IOrderStats {
  orderStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  paymentStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  totalOrders: number;
  totalRevenue: number;
}

export interface OrdersResponse {
  orders: IOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    status?: string;
    paymentStatus?: string;
    userId?: string;
    orderNumber?: string;
    startDate?: string;
    endDate?: string;
    sortBy: string;
    sortOrder: string;
  };
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

// Delivery Method types
export interface IDeliveryMethod {
  _id: string;
  name: string;
  subtitle?: string;
  price: number;
  validationDesc?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name?: string;
    email: string;
  };
}

export interface DeliveryMethodFormData {
  name: string;
  subtitle?: string;
  price: number;
  validationDesc?: string;
  isEnabled: boolean;
}

export interface DeliveryMethodsResponse {
  deliveryMethods: IDeliveryMethod[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  total?: number;
}
