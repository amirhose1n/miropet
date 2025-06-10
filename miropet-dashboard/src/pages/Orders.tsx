import {
  Assignment,
  Clear,
  Edit,
  LocalShipping,
  Pending,
  Receipt,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { IOrder } from "../types";

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  sortBy: string;
  sortOrder: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  order: IOrder | null;
  onClose: () => void;
  onStatusUpdate: (
    orderId: string,
    status: string,
    adminNotes?: string,
    trackingNumber?: string
  ) => void;
}

interface StatusUpdateDialogProps {
  open: boolean;
  order: IOrder | null;
  onClose: () => void;
  onUpdate: (
    orderId: string,
    status: string,
    adminNotes?: string,
    trackingNumber?: string
  ) => void;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "",
    paymentStatus: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [orderDetailsDialog, setOrderDetailsDialog] = useState<{
    open: boolean;
    order: IOrder | null;
  }>({
    open: false,
    order: null,
  });
  const [statusUpdateDialog, setStatusUpdateDialog] = useState<{
    open: boolean;
    order: IOrder | null;
  }>({
    open: false,
    order: null,
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.search && { orderNumber: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),

        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await apiService.getAllOrders(params);

      if (response.success && response.data) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      enqueueSnackbar("دریافت سفارشات ناموفق بود", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const openOrderDetails = (order: IOrder) => {
    setOrderDetailsDialog({ open: true, order });
  };

  const closeOrderDetails = () => {
    setOrderDetailsDialog({ open: false, order: null });
  };

  const openStatusUpdate = (order: IOrder) => {
    setStatusUpdateDialog({ open: true, order });
  };

  const closeStatusUpdate = () => {
    setStatusUpdateDialog({ open: false, order: null });
  };

  const handleStatusUpdate = async (
    orderId: string,
    status: string,
    adminNotes?: string,
    trackingNumber?: string
  ) => {
    try {
      const response = await apiService.updateOrderStatus(
        orderId,
        status,
        adminNotes,
        trackingNumber
      );

      if (response.success) {
        enqueueSnackbar("وضعیت سفارش با موفقیت به‌روزرسانی شد", {
          variant: "success",
        });
        fetchOrders();
        closeStatusUpdate();
        closeOrderDetails();
      }
    } catch (error) {
      enqueueSnackbar("به‌روزرسانی وضعیت سفارش ناموفق بود", {
        variant: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "warning";
      case "inProgress":
        return "info";
      case "posted":
        return "primary";
      case "done":
        return "success";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "ثبت شده";
      case "inProgress":
        return "در حال پردازش";
      case "posted":
        return "ارسال شده";
      case "done":
        return "تحویل داده شده";
      case "canceled":
        return "لغو شده";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "در انتظار";
      case "paid":
        return "پرداخت شده";
      case "failed":
        return "ناموفق";
      case "refunded":
        return "بازگردانده شده";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats calculation
  const stats = [
    {
      title: "کل سفارشات",
      value: pagination.totalOrders,
      icon: <Receipt />,
      color: "#3f51b5",
    },
    {
      title: "در انتظار پردازش",
      value: orders.filter((order) => order.status === "submitted").length,
      icon: <Pending />,
      color: "#ff9800",
    },
    {
      title: "در حال پردازش",
      value: orders.filter((order) => order.status === "inProgress").length,
      icon: <Assignment />,
      color: "#2196f3",
    },
    {
      title: "ارسال شده",
      value: orders.filter((order) => order.status === "posted").length,
      icon: <LocalShipping />,
      color: "#4caf50",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          مدیریت سفارشات
        </Typography>
        <Typography variant="body1" color="textSecondary">
          مشاهده و مدیریت سفارشات مشتریان
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          فیلترها
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="جستجو شماره سفارش"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>وضعیت سفارش</InputLabel>
              <Select
                value={filters.status}
                label="وضعیت سفارش"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="submitted">ثبت شده</MenuItem>
                <MenuItem value="inProgress">در حال پردازش</MenuItem>
                <MenuItem value="posted">ارسال شده</MenuItem>
                <MenuItem value="done">تحویل داده شده</MenuItem>
                <MenuItem value="canceled">لغو شده</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>وضعیت پرداخت</InputLabel>
              <Select
                value={filters.paymentStatus}
                label="وضعیت پرداخت"
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
              >
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="pending">در انتظار</MenuItem>
                <MenuItem value="paid">پرداخت شده</MenuItem>
                <MenuItem value="failed">ناموفق</MenuItem>
                <MenuItem value="refunded">بازگردانده شده</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Clear />}
              fullWidth
            >
              پاک کردن
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper>
        {orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              سفارشی یافت نشد
            </Typography>
            <Typography variant="body2" color="textSecondary">
              با فیلترهای مختلف جستجو کنید
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>شماره سفارش</TableCell>
                    <TableCell>مشتری</TableCell>
                    <TableCell>تعداد اقلام</TableCell>
                    <TableCell>مبلغ کل</TableCell>
                    <TableCell>وضعیت سفارش</TableCell>
                    <TableCell>وضعیت پرداخت</TableCell>
                    <TableCell>تاریخ ثبت</TableCell>
                    <TableCell align="center">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {order.user?.name || "نامشخص"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            آدرس: {order.shippingAddressId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.items.length}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPrice(order.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentStatusText(order.paymentStatus)}
                          color={
                            getPaymentStatusColor(order.paymentStatus) as any
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => openOrderDetails(order)}
                            title="مشاهده جزئیات"
                          >
                            <Visibility />
                          </IconButton>
                          {order.status !== "canceled" &&
                            order.status !== "done" && (
                              <IconButton
                                size="small"
                                onClick={() => openStatusUpdate(order)}
                                title="تغییر وضعیت"
                              >
                                <Edit />
                              </IconButton>
                            )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <Stack spacing={2} alignItems="center">
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                  <Typography variant="body2" color="textSecondary">
                    نمایش {orders.length} از {pagination.totalOrders} سفارش
                  </Typography>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={orderDetailsDialog.open}
        order={orderDetailsDialog.order}
        onClose={closeOrderDetails}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        open={statusUpdateDialog.open}
        order={statusUpdateDialog.order}
        onClose={closeStatusUpdate}
        onUpdate={handleStatusUpdate}
      />
    </Box>
  );
};

// Order Details Dialog Component
const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  order,
  onClose,
  onStatusUpdate,
}) => {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "ثبت شده";
      case "inProgress":
        return "در حال پردازش";
      case "posted":
        return "ارسال شده";
      case "done":
        return "تحویل داده شده";
      case "canceled":
        return "لغو شده";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "در انتظار";
      case "paid":
        return "پرداخت شده";
      case "failed":
        return "ناموفق";
      case "refunded":
        return "بازگردانده شده";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">جزئیات سفارش {order.orderNumber}</Typography>
          <IconButton onClick={onClose}>
            <Clear />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Order Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اطلاعات سفارش
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      شماره سفارش:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {order.orderNumber}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      وضعیت:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {getStatusText(order.status)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      وضعیت پرداخت:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {getPaymentStatusText(order.paymentStatus)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      تاریخ ثبت:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                  {order.trackingNumber && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        کد رهگیری:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.trackingNumber}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اطلاعات مشتری
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      نام مشتری:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {order.user?.name || "نامشخص"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      آدرس تحویل:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {order.shippingAddressId}
                    </Typography>
                  </Box>
                  {order.billingAddressId && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        آدرس صورتحساب:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.billingAddressId}
                      </Typography>
                    </Box>
                  )}
                  {order.deliveryMethodName && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        روش تحویل:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.deliveryMethodName}
                        {order.deliveryMethodPrice !== undefined &&
                          order.deliveryMethodPrice > 0 && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="textSecondary"
                            >
                              {" "}
                              ({formatPrice(order.deliveryMethodPrice)})
                            </Typography>
                          )}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اقلام سفارش
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>محصول</TableCell>
                        <TableCell>مشخصات</TableCell>
                        <TableCell>تعداد</TableCell>
                        <TableCell>قیمت واحد</TableCell>
                        <TableCell>قیمت کل</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.productName}
                              </Typography>
                              {item.productBrand && (
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {item.productBrand}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {item.variationDetails.color && (
                                <Chip
                                  label={`رنگ: ${item.variationDetails.color}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {item.variationDetails.size && (
                                <Chip
                                  label={`سایز: ${item.variationDetails.size}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {item.variationDetails.weight && (
                                <Chip
                                  label={`وزن: ${item.variationDetails.weight}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  خلاصه سفارش
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      جمع اقلام:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatPrice(order.subtotal)}
                    </Typography>
                  </Box>
                  {order.shippingCost > 0 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        هزینه ارسال:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatPrice(order.shippingCost)}
                      </Typography>
                    </Box>
                  )}
                  {order.tax > 0 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        مالیات:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatPrice(order.tax)}
                      </Typography>
                    </Box>
                  )}
                  {order.discount > 0 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        تخفیف:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="success.main"
                      >
                        -{formatPrice(order.discount)}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      مبلغ کل:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {(order.customerNotes || order.adminNotes) && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    یادداشت‌ها
                  </Typography>
                  <Stack spacing={2}>
                    {order.customerNotes && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          یادداشت مشتری:
                        </Typography>
                        <Typography variant="body2">
                          {order.customerNotes}
                        </Typography>
                      </Box>
                    )}
                    {order.adminNotes && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          یادداشت مدیر:
                        </Typography>
                        <Typography variant="body2">
                          {order.adminNotes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {order.status !== "canceled" && order.status !== "done" && (
          <Button
            variant="contained"
            onClick={() => onStatusUpdate(order._id, order.status)}
            startIcon={<Edit />}
          >
            تغییر وضعیت
          </Button>
        )}
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
};

// Status Update Dialog Component
const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  order,
  onClose,
  onUpdate,
}) => {
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setAdminNotes(order.adminNotes || "");
      setTrackingNumber(order.trackingNumber || "");
    }
  }, [order]);

  const handleUpdate = () => {
    if (order) {
      onUpdate(order._id, status, adminNotes, trackingNumber);
    }
  };

  if (!order) return null;

  const statusOptions = [
    { value: "submitted", label: "ثبت شده" },
    { value: "inProgress", label: "در حال پردازش" },
    { value: "posted", label: "ارسال شده" },
    { value: "done", label: "تحویل داده شده" },
    { value: "canceled", label: "لغو شده" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>تغییر وضعیت سفارش {order.orderNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>وضعیت جدید</InputLabel>
            <Select
              value={status}
              label="وضعیت جدید"
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(status === "posted" || status === "done") && (
            <TextField
              fullWidth
              label="کد رهگیری"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="کد رهگیری مرسوله را وارد کنید"
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="یادداشت مدیر"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="یادداشت اختیاری برای این تغییر وضعیت"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button variant="contained" onClick={handleUpdate}>
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Orders;
