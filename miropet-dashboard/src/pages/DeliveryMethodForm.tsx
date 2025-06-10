import { ArrowBack, LocalShipping, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../services/api";
import { DeliveryMethodFormData, IDeliveryMethod } from "../types";

interface DeliveryMethodFormProps {
  disabled?: boolean;
}

const DeliveryMethodForm: React.FC<DeliveryMethodFormProps> = ({
  disabled = false,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<IDeliveryMethod | null>(
    null
  );

  const [formData, setFormData] = useState<DeliveryMethodFormData>({
    name: "",
    subtitle: "",
    price: 0,
    validationDesc: "",
    isEnabled: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (id && id !== "new") {
      setIsEditMode(true);
      fetchDeliveryMethod();
    }
  }, [id]);

  const fetchDeliveryMethod = async () => {
    if (!id || id === "new") return;

    setLoading(true);
    try {
      const response = await apiService.getDeliveryMethodById(id);
      if (response.success && response.data) {
        const method = response.data.deliveryMethod;
        setDeliveryMethod(method);
        setFormData({
          name: method.name,
          subtitle: method.subtitle || "",
          price: method.price,
          validationDesc: method.validationDesc || "",
          isEnabled: method.isEnabled,
        });
      }
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "خطا در دریافت اطلاعات روش تحویل",
        { variant: "error" }
      );
      navigate("/delivery-methods");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isEnabled: event.target.checked,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "نام روش تحویل الزامی است";
    }

    if (formData.price < 0) {
      newErrors.price = "قیمت نمی‌تواند منفی باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && id) {
        await apiService.updateDeliveryMethod(id, formData);
        enqueueSnackbar("روش تحویل با موفقیت بروزرسانی شد", {
          variant: "success",
        });
      } else {
        await apiService.createDeliveryMethod(formData);
        enqueueSnackbar("روش تحویل با موفقیت ایجاد شد", { variant: "success" });
      }
      navigate("/delivery-methods");
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message ||
          `خطا در ${isEditMode ? "بروزرسانی" : "ایجاد"} روش تحویل`,
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
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

  const getPageTitle = () => {
    if (disabled) return "مشاهده روش تحویل";
    return isEditMode ? "ویرایش روش تحویل" : "افزودن روش تحویل جدید";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
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
            {getPageTitle()}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/delivery-methods")}
        >
          بازگشت
        </Button>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="نام روش تحویل"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={disabled || loading}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="قیمت (تومان)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  disabled={disabled || loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">تومان</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="زیرعنوان (اختیاری)"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  disabled={disabled || loading}
                  multiline
                  rows={2}
                  helperText="توضیح کوتاه درباره این روش تحویل"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات اعتبارسنجی (اختیاری)"
                  name="validationDesc"
                  value={formData.validationDesc}
                  onChange={handleInputChange}
                  disabled={disabled || loading}
                  multiline
                  rows={3}
                  helperText="شرایط و محدودیت‌های استفاده از این روش تحویل"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isEnabled}
                        onChange={handleSwitchChange}
                        disabled={disabled || loading}
                        color="primary"
                      />
                    }
                    label="فعال"
                  />
                </FormControl>
              </Grid>

              {/* Show metadata for existing delivery methods */}
              {deliveryMethod && (
                <Grid item xs={12}>
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      اطلاعات تکمیلی
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          ایجاد شده توسط:{" "}
                          {deliveryMethod.createdBy.name ||
                            deliveryMethod.createdBy.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          تاریخ ایجاد: {formatDate(deliveryMethod.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          آخرین بروزرسانی توسط:{" "}
                          {deliveryMethod.updatedBy.name ||
                            deliveryMethod.updatedBy.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          تاریخ بروزرسانی:{" "}
                          {formatDate(deliveryMethod.updatedAt)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              {!disabled && (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ minWidth: 150 }}
                    >
                      {loading
                        ? "در حال ذخیره..."
                        : isEditMode
                        ? "بروزرسانی"
                        : "ایجاد"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/delivery-methods")}
                      disabled={loading}
                    >
                      انصراف
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DeliveryMethodForm;
