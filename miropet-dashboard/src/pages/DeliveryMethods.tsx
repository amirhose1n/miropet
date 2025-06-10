import {
  Add,
  Delete,
  Edit,
  LocalShipping,
  ToggleOff,
  ToggleOn,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { IDeliveryMethod } from "../types";

const DeliveryMethods: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [deliveryMethods, setDeliveryMethods] = useState<IDeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<IDeliveryMethod | null>(null);

  const fetchDeliveryMethods = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllDeliveryMethodsAdmin({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setDeliveryMethods(response.data.deliveryMethods);
        setTotalItems(response.data.pagination?.totalItems || 0);
      }
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "خطا در دریافت روش‌های تحویل",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, enqueueSnackbar]);

  useEffect(() => {
    fetchDeliveryMethods();
  }, [fetchDeliveryMethods]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleToggleStatus = async (deliveryMethod: IDeliveryMethod) => {
    try {
      await apiService.toggleDeliveryMethodStatus(deliveryMethod._id);
      enqueueSnackbar(
        `روش تحویل ${deliveryMethod.isEnabled ? "غیرفعال" : "فعال"} شد`,
        { variant: "success" }
      );
      fetchDeliveryMethods();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "خطا در تغییر وضعیت", {
        variant: "error",
      });
    }
  };

  const handleDeleteClick = (deliveryMethod: IDeliveryMethod) => {
    setSelectedDeliveryMethod(deliveryMethod);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeliveryMethod) return;

    try {
      await apiService.deleteDeliveryMethod(selectedDeliveryMethod._id);
      enqueueSnackbar("روش تحویل با موفقیت حذف شد", { variant: "success" });
      fetchDeliveryMethods();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "خطا در حذف روش تحویل", {
        variant: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDeliveryMethod(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeliveryMethod(null);
  };

  const formatPrice = (price: number) => {
    return price === 0
      ? "رایگان"
      : new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LocalShipping sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            مدیریت روش‌های تحویل
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/delivery-methods/new")}
          sx={{ borderRadius: 2 }}
        >
          افزودن روش تحویل جدید
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Toolbar sx={{ px: 0 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="جستجو در روش‌های تحویل..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ maxWidth: 400 }}
            />
          </Toolbar>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>زیرعنوان</TableCell>
                  <TableCell>قیمت</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>تاریخ ایجاد</TableCell>
                  <TableCell>ایجاد شده توسط</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : deliveryMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      روش تحویلی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryMethods.map((method) => (
                    <TableRow key={method._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {method.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {method.subtitle || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPrice(method.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={method.isEnabled ? "فعال" : "غیرفعال"}
                          color={method.isEnabled ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(method.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {method.createdBy.name || method.createdBy.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="مشاهده">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/delivery-methods/${method._id}`)
                              }
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ویرایش">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/delivery-methods/${method._id}/edit`)
                              }
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              method.isEnabled ? "غیرفعال کردن" : "فعال کردن"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(method)}
                              color={method.isEnabled ? "warning" : "success"}
                            >
                              {method.isEnabled ? <ToggleOff /> : <ToggleOn />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(method)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="تعداد در هر صفحه:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} از ${count}`
            }
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">حذف روش تحویل</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف روش تحویل "{selectedDeliveryMethod?.name}" اطمینان دارید؟
            این عملیات غیرقابل برگشت است.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>انصراف</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryMethods;
