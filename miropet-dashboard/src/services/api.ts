import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  CategoryFormData,
  DeliveryMethodFormData,
  DeliveryMethodsResponse,
  ICategory,
  IDeliveryMethod,
  IOrder,
  IOrderStats,
  IProduct,
  IUser,
  LoginCredentials,
  OrdersResponse,
  ProductFormData,
  RegisterData,
  UserFormData,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: IUser; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: IUser; token: string }>> =
      await this.api.post("/auth/login", credentials);
    return response.data;
  }

  async register(
    userData: RegisterData
  ): Promise<ApiResponse<{ user: IUser; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: IUser; token: string }>> =
      await this.api.post("/auth/register", userData);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/auth/change-password",
      data
    );
    return response.data;
  }

  // Product methods
  async getAllProducts(): Promise<ApiResponse<{ products: IProduct[] }>> {
    const response: AxiosResponse<ApiResponse<{ products: IProduct[] }>> =
      await this.api.get("/products");
    return response.data;
  }

  async getProductById(
    id: string
  ): Promise<ApiResponse<{ product: IProduct }>> {
    const response: AxiosResponse<ApiResponse<{ product: IProduct }>> =
      await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(
    productData: ProductFormData
  ): Promise<ApiResponse<IProduct>> {
    const response: AxiosResponse<ApiResponse<IProduct>> = await this.api.post(
      "/products",
      productData
    );
    return response.data;
  }

  async updateProduct(
    id: string,
    productData: ProductFormData
  ): Promise<ApiResponse<IProduct>> {
    const response: AxiosResponse<ApiResponse<IProduct>> = await this.api.put(
      `/products/${id}`,
      productData
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.delete(
      `/products/${id}`
    );
    return response.data;
  }

  // Category methods
  async getAllCategories(): Promise<ApiResponse<{ categories: ICategory[] }>> {
    const response: AxiosResponse<ApiResponse<{ categories: ICategory[] }>> =
      await this.api.get("/category");
    return response.data;
  }

  async createCategory(
    categoryData: CategoryFormData
  ): Promise<ApiResponse<{ category: ICategory }>> {
    const response: AxiosResponse<ApiResponse<{ category: ICategory }>> =
      await this.api.post("/category", categoryData);
    return response.data;
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<IUser>> {
    const response: AxiosResponse<ApiResponse<IUser>> = await this.api.get(
      "/users/profile"
    );
    return response.data;
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<
    ApiResponse<{
      users: IUser[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      filters: {
        search: string;
        role: string;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const response = await this.api.get(`/users?${queryParams.toString()}`);
    return response.data;
  }

  async createAdminUser(userData: UserFormData): Promise<ApiResponse<IUser>> {
    const response: AxiosResponse<ApiResponse<IUser>> = await this.api.post(
      "/users/admin",
      userData
    );
    return response.data;
  }

  // Order methods
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    orderNumber?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<OrdersResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.paymentStatus)
      queryParams.append("paymentStatus", params.paymentStatus);
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.orderNumber)
      queryParams.append("orderNumber", params.orderNumber);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await this.api.get(`/orders?${queryParams.toString()}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<ApiResponse<{ order: IOrder }>> {
    const response: AxiosResponse<ApiResponse<{ order: IOrder }>> =
      await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    status: string,
    adminNotes?: string,
    trackingNumber?: string
  ): Promise<ApiResponse<{ order: IOrder }>> {
    const response: AxiosResponse<ApiResponse<{ order: IOrder }>> =
      await this.api.patch(`/orders/${id}/status`, {
        status,
        adminNotes,
        trackingNumber,
      });
    return response.data;
  }

  async cancelOrder(
    id: string,
    reason?: string
  ): Promise<ApiResponse<{ order: IOrder }>> {
    const response: AxiosResponse<ApiResponse<{ order: IOrder }>> =
      await this.api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  }

  async getOrderStats(): Promise<ApiResponse<IOrderStats>> {
    const response: AxiosResponse<ApiResponse<IOrderStats>> =
      await this.api.get("/orders/stats/summary");
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get("/health");
    return response.data;
  }

  // Delivery Method methods
  async getAllDeliveryMethods(): Promise<ApiResponse<DeliveryMethodsResponse>> {
    const response: AxiosResponse<ApiResponse<DeliveryMethodsResponse>> =
      await this.api.get("/delivery-methods");
    return response.data;
  }

  async getAllDeliveryMethodsAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isEnabled?: boolean;
  }): Promise<ApiResponse<DeliveryMethodsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isEnabled !== undefined)
      queryParams.append("isEnabled", params.isEnabled.toString());

    const response: AxiosResponse<ApiResponse<DeliveryMethodsResponse>> =
      await this.api.get(
        `/delivery-methods/admin/all?${queryParams.toString()}`
      );
    return response.data;
  }

  async getDeliveryMethodById(
    id: string
  ): Promise<ApiResponse<{ deliveryMethod: IDeliveryMethod }>> {
    const response: AxiosResponse<
      ApiResponse<{ deliveryMethod: IDeliveryMethod }>
    > = await this.api.get(`/delivery-methods/${id}`);
    return response.data;
  }

  async createDeliveryMethod(
    deliveryMethodData: DeliveryMethodFormData
  ): Promise<ApiResponse<{ deliveryMethod: IDeliveryMethod }>> {
    const response: AxiosResponse<
      ApiResponse<{ deliveryMethod: IDeliveryMethod }>
    > = await this.api.post("/delivery-methods/admin", deliveryMethodData);
    return response.data;
  }

  async updateDeliveryMethod(
    id: string,
    deliveryMethodData: DeliveryMethodFormData
  ): Promise<ApiResponse<{ deliveryMethod: IDeliveryMethod }>> {
    const response: AxiosResponse<
      ApiResponse<{ deliveryMethod: IDeliveryMethod }>
    > = await this.api.put(`/delivery-methods/admin/${id}`, deliveryMethodData);
    return response.data;
  }

  async deleteDeliveryMethod(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.delete(
      `/delivery-methods/admin/${id}`
    );
    return response.data;
  }

  async toggleDeliveryMethodStatus(
    id: string
  ): Promise<ApiResponse<{ deliveryMethod: IDeliveryMethod }>> {
    const response: AxiosResponse<
      ApiResponse<{ deliveryMethod: IDeliveryMethod }>
    > = await this.api.patch(`/delivery-methods/admin/${id}/toggle`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
