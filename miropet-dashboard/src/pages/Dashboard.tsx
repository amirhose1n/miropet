import {
  Add,
  Inventory,
  People,
  ShoppingCart,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import apiService from "../services/api";
import { IProduct, IUser } from "../types";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" fontWeight="bold">
            {value}
          </Typography>
          {change && (
            <Typography variant="body2" sx={{ color: color, mt: 1 }}>
              {change}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            color: "white",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const navigate = useNavigate();

  // Sample chart data
  const salesData = [
    { name: "فروردین", sales: 4000, orders: 24 },
    { name: "اردیبهشت", sales: 3000, orders: 18 },
    { name: "خرداد", sales: 5000, orders: 35 },
    { name: "تیر", sales: 4500, orders: 28 },
    { name: "مرداد", sales: 6000, orders: 42 },
    { name: "شهریور", sales: 5500, orders: 38 },
  ];

  const categoryData = [
    { name: "غذا", value: 45, color: "#8884d8" },
    { name: "اسباب‌بازی", value: 30, color: "#82ca9d" },
    { name: "لوازم جانبی", value: 15, color: "#ffc658" },
    { name: "بهداشت", value: 10, color: "#ff7300" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse] = await Promise.all([
          apiService.getAllProducts(),
        ]);

        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data.products);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "تعداد محصولات",
      value: products.length,
      icon: <Inventory />,
      color: "#3f51b5",
      change: "۱۲% افزایش نسبت به ماه گذشته",
    },
    {
      title: "تعداد سفارشات",
      value: 245,
      icon: <ShoppingCart />,
      color: "#4caf50",
      change: "۸% افزایش نسبت به ماه گذشته",
    },
    {
      title: "تعداد کاربران",
      value: 1247,
      icon: <People />,
      color: "#ff9800",
      change: "۱۵% افزایش نسبت به ماه گذشته",
    },
    {
      title: "درآمد",
      value: "۱۲,۴۵۰ تومان",
      icon: <TrendingUp />,
      color: "#f44336",
      change: "۲۲% افزایش نسبت به ماه گذشته",
    },
  ];

  const recentProducts = products?.length > 0 ? products.slice(0, 5) : [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          نمای کلی داشبورد
        </Typography>
        <Typography variant="body1" color="textSecondary">
          به پنل مدیریت میروپت خوش آمدید
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              نمودار فروش
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              دسته‌بندی محصولات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">محصولات اخیر</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/products/new")}
              >
                افزودن محصول
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نام</TableCell>
                    <TableCell>دسته‌بندی</TableCell>
                    <TableCell>قیمت</TableCell>
                    <TableCell>موجودی</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {product.category.slice(0, 2).map((cat, index) => (
                            <Chip
                              key={index}
                              label={cat}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {product.variations[0]?.price || 0} تومان
                      </TableCell>
                      <TableCell>
                        {product.variations.reduce(
                          (sum, v) => sum + v.stock,
                          0
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.isFeatured ? "ویژه" : "معمولی"}
                          color={product.isFeatured ? "primary" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          مشاهده
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              دسترسی سریع
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() => navigate("/products/new")}
              >
                افزودن محصول جدید
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<People />}
                onClick={() => navigate("/users/new")}
              >
                افزودن کاربر مدیر
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Inventory />}
                onClick={() => navigate("/products")}
              >
                مدیریت محصولات
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
