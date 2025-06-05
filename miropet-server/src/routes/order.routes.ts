import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderStats,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { adminAuth, auth } from "../middleware/auth.middleware";

const router = Router();

// ===== USER ROUTES =====

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 * @body    { shippingAddress, paymentMethod?, customerNotes? }
 */
router.post("/", auth, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders with pagination
 * @access  Private
 * @query   { page?, limit? }
 */
router.get("/", auth, getUserOrders);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private
 */
router.get("/:orderId", auth, getOrderById);

/**
 * @route   PUT /api/orders/:orderId/cancel
 * @desc    Cancel order (only pending/confirmed orders)
 * @access  Private
 */
router.put("/:orderId/cancel", auth, cancelOrder);

// ===== ADMIN ROUTES =====

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Admin
 * @query   { page?, limit?, status?, paymentStatus? }
 */
router.get("/admin/all", adminAuth, getAllOrders);

/**
 * @route   PUT /api/orders/admin/:orderId/status
 * @desc    Update order status (Admin only)
 * @access  Admin
 * @body    { status, trackingNumber?, adminNotes? }
 */
router.put("/admin/:orderId/status", adminAuth, updateOrderStatus);

/**
 * @route   GET /api/orders/admin/stats
 * @desc    Get order statistics (Admin only)
 * @access  Admin
 */
router.get("/admin/stats", adminAuth, getOrderStats);

export default router;
