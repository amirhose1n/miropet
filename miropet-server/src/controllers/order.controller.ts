import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Cart } from "../models/Cart.model";
import { Order } from "../models/Order.model";
import { Product } from "../models/Product.model";

// Create order from cart
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { shippingAddress, paymentMethod, customerNotes } = req.body;

    if (!shippingAddress) {
      res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
      return;
    }

    // Validate shipping address
    const requiredFields = [
      "fullName",
      "phone",
      "street",
      "city",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        res.status(400).json({
          success: false,
          message: `${field} is required in shipping address`,
        });
        return;
      }
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
      return;
    }

    // Validate cart items and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId as any;

      if (!product) {
        res.status(400).json({
          success: false,
          message: "Invalid product in cart",
        });
        return;
      }

      const variation = product.variations[cartItem.variationIndex];

      if (!variation) {
        res.status(400).json({
          success: false,
          message: `Invalid variation for product ${product.name}`,
        });
        return;
      }

      // Check stock availability
      if (variation.stock < cartItem.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${variation.stock}`,
        });
        return;
      }

      const totalPrice = cartItem.price * cartItem.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productBrand: product.brand,
        variationIndex: cartItem.variationIndex,
        variationDetails: {
          color: variation.color,
          size: variation.size,
          weight: variation.weight,
        },
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        totalPrice,
      });
    }

    // Calculate order totals (you can add tax and shipping logic here)
    const shippingCost = subtotal > 500000 ? 0 : 50000; // Free shipping over 500,000 IRR
    const tax = 0; // Add tax calculation if needed
    const discount = 0; // Add discount logic if needed
    const totalAmount = subtotal + shippingCost + tax - discount;

    // Create the order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      shippingAddress,
      paymentMethod,
      customerNotes,
    });

    await order.save();

    // Update product stock
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (product && product.variations[cartItem.variationIndex]) {
        product.variations[cartItem.variationIndex].stock -= cartItem.quantity;
        await product.save();
      }
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get user's orders
export const getUserOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.productId", "name brand category");

    const totalOrders = await Order.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get single order by ID
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    }).populate("items.productId");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Cancel order (only if status is pending or confirmed)
export const cancelOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
      return;
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && product.variations[item.variationIndex]) {
        product.variations[item.variationIndex].stock += item.quantity;
        await product.save();
      }
    }

    order.updateStatus("cancelled");
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// ===== ADMIN ENDPOINTS =====

// Get all orders (Admin only)
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .populate("items.productId", "name brand");

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, adminNotes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status",
      });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    order.updateStatus(status);

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (adminNotes) order.adminNotes = adminNotes;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Orders this month
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Orders last month
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // Revenue this month
    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Revenue last month
    const revenueLastMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: {
        totalOrders,
        ordersThisMonth,
        ordersLastMonth,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        revenueLastMonth: revenueLastMonth[0]?.total || 0,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order statistics",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
