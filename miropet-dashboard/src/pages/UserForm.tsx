import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import apiService from "../services/api";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
}

const schema = yup.object({
  name: yup.string().required("نام الزامی است"),
  email: yup.string().email("ایمیل نامعتبر است").required("ایمیل الزامی است"),
  password: yup
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .required("رمز عبور الزامی است"),
  role: yup
    .string()
    .oneOf(["admin", "customer"], "نقش نامعتبر است")
    .required("نقش الزامی است"),
});

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      const response = await apiService.register(data);

      if (response.success) {
        enqueueSnackbar("کاربر با موفقیت ایجاد شد", { variant: "success" });
        navigate("/users");
      }
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "ایجاد کاربر ناموفق بود",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <IconButton onClick={() => navigate("/users")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            افزودن کاربر جدید
          </Typography>
          <Typography variant="body1" color="textSecondary">
            کاربر مدیر جدید برای سیستم ایجاد کنید
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...register("name")}
                fullWidth
                label="نام کامل"
                placeholder="نام کامل کاربر را وارد کنید"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("email")}
                fullWidth
                label="ایمیل"
                type="email"
                placeholder="آدرس ایمیل کاربر"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("password")}
                fullWidth
                label="رمز عبور"
                type="password"
                placeholder="رمز عبور قوی انتخاب کنید"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>نقش کاربر</InputLabel>
                <Select
                  {...register("role")}
                  value={watch("role")}
                  onChange={(e) =>
                    setValue("role", e.target.value as "admin" | "customer")
                  }
                  label="نقش کاربر"
                >
                  <MenuItem value="admin">مدیر</MenuItem>
                  <MenuItem value="customer">مشتری</MenuItem>
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error">
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/users")}
                  disabled={loading}
                >
                  لغو
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : undefined
                  }
                >
                  ایجاد کاربر
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;
