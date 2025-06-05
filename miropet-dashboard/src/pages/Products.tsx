import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { IProduct } from "../types";

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    product: IProduct | null;
  }>({
    open: false,
    product: null,
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllProducts();

      if (response.success && response.data) {
        setProducts(response.data.products);
      }
    } catch (error) {
      enqueueSnackbar("دریافت محصولات ناموفق بود", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    try {
      const response = await apiService.deleteProduct(deleteDialog.product._id);
      if (response.success) {
        setProducts(
          products.filter((p) => p._id !== deleteDialog.product!._id)
        );
        enqueueSnackbar("محصول با موفقیت حذف شد", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("حذف محصول ناموفق بود", { variant: "error" });
    } finally {
      setDeleteDialog({ open: false, product: null });
    }
  };

  const openDeleteDialog = (product: IProduct) => {
    setDeleteDialog({ open: true, product });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, product: null });
  };

  // Mobile Product Card Component
  const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => {
    const minPrice = Math.min(...product.variations.map((v) => v.price));
    const maxPrice = Math.max(...product.variations.map((v) => v.price));
    const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0);

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{ flex: 1, mr: 1 }}
            >
              {product.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Chip
                label={product.isFeatured ? "ویژه" : "معمولی"}
                color={product.isFeatured ? "primary" : "default"}
                size="small"
              />
              <Chip
                label={totalStock}
                color={
                  totalStock > 10
                    ? "success"
                    : totalStock > 0
                    ? "warning"
                    : "error"
                }
                size="small"
              />
            </Box>
          </Box>

          <Stack spacing={1.5}>
            {product.brand && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  برند:
                </Typography>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {product.brand}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                دسته‌بندی‌ها:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {product.category.slice(0, 2).map((cat, index) => (
                  <Chip
                    key={index}
                    label={cat}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {product.category.length > 2 && (
                  <Chip
                    label={`+${product.category.length - 2}`}
                    size="small"
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="caption" color="textSecondary">
                  قیمت:
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                  {minPrice === maxPrice
                    ? `${minPrice} تومان`
                    : `${minPrice} - ${maxPrice} تومان`}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {new Date(product.createdAt).toLocaleDateString("fa-IR")}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => navigate(`/products/${product._id}`)}
              title="مشاهده"
            >
              <Visibility />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => navigate(`/products/${product._id}/edit`)}
              title="ویرایش"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => openDeleteDialog(product)}
              color="error"
              title="حذف"
            >
              <Delete />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header - Mobile Responsive */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: { xs: "center", sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: 4,
          textAlign: { xs: "center", sm: "right" },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            مدیریت محصولات
          </Typography>
          <Typography variant="body1" color="textSecondary">
            محصولات فروشگاه حیوانات خود را مدیریت کنید
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/products/new")}
          sx={{
            height: "fit-content",
            width: { xs: "100%", sm: "auto" },
            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
            boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
          }}
        >
          افزودن محصول
        </Button>
      </Box>

      {products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            محصولی یافت نشد
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            با افزودن اولین محصول خود شروع کنید
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/products/new")}
            sx={{ mt: 2 }}
          >
            افزودن محصول
          </Button>
        </Paper>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </Box>

          {/* Desktop Table Layout */}
          <Paper sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نام</TableCell>
                    <TableCell>برند</TableCell>
                    <TableCell>دسته‌بندی‌ها</TableCell>
                    <TableCell>بازه قیمت</TableCell>
                    <TableCell>کل موجودی</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ ایجاد</TableCell>
                    <TableCell align="center">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => {
                    const minPrice = Math.min(
                      ...product.variations.map((v) => v.price)
                    );
                    const maxPrice = Math.max(
                      ...product.variations.map((v) => v.price)
                    );
                    const totalStock = product.variations.reduce(
                      (sum, v) => sum + v.stock,
                      0
                    );

                    return (
                      <TableRow key={product._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{product.brand || "-"}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                          >
                            {product.category.slice(0, 3).map((cat, index) => (
                              <Chip
                                key={index}
                                label={cat}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {product.category.length > 3 && (
                              <Chip
                                label={`+${product.category.length - 3}`}
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {minPrice === maxPrice
                            ? `${minPrice} تومان`
                            : `${minPrice} - ${maxPrice} تومان`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={totalStock}
                            color={
                              totalStock > 10
                                ? "success"
                                : totalStock > 0
                                ? "warning"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.isFeatured ? "ویژه" : "معمولی"}
                            color={product.isFeatured ? "primary" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/products/${product._id}`)}
                            title="مشاهده"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/products/${product._id}/edit`)
                            }
                            title="ویرایش"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(product)}
                            color="error"
                            title="حذف"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>حذف محصول</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید "{deleteDialog.product?.name}" را حذف
            کنید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>لغو</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
