import {
  Add,
  AdminPanelSettings,
  Clear,
  FilterList,
  Person,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
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
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { IUser } from "../types";

interface UsersResponse {
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
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      const response = await apiService.getAllUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "خطا در دریافت کاربران",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Get role display text and color
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return { text: "مدیر", color: "primary" as const };
      case "customer":
        return { text: "مشتری", color: "secondary" as const };
      default:
        return { text: role, color: "default" as const };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { sm: "center", xs: "start" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: "0" },
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            مدیریت کاربران
          </Typography>
          <Typography variant="body1" color="textSecondary">
            مشاهده و مدیریت کاربران سیستم
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/users/create")}
          sx={{
            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
            boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
          }}
        >
          افزودن کاربر
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {pagination.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    کل کاربران
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <AdminPanelSettings />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {users.filter((user) => user.role === "admin").length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    مدیران
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {users.filter((user) => user.role === "customer").length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    مشتریان
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <FilterList />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    نمایش داده شده
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          فیلترها
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="جستجو در نام و ایمیل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
              <InputLabel>نقش</InputLabel>
              <Select
                value={roleFilter}
                label="نقش"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">همه نقش‌ها</MenuItem>
                <MenuItem value="admin">مدیر</MenuItem>
                <MenuItem value="customer">مشتری</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
              >
                جستجو
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilters}
              >
                پاک کردن فیلترها
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="info">
              هیچ کاربری یافت نشد. برای افزودن کاربر جدید از دکمه "افزودن کاربر"
              استفاده کنید.
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>نام</TableCell>
                    <TableCell>ایمیل</TableCell>
                    <TableCell>نقش</TableCell>
                    <TableCell>تاریخ ایجاد</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => {
                    const roleDisplay = getRoleDisplay(user.role);
                    return (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          {(pagination.currentPage - 1) * pagination.limit +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar>
                              {user.role === "admin" ? (
                                <AdminPanelSettings />
                              ) : (
                                <Person />
                              )}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.name || "بدون نام"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={roleDisplay.text}
                            color={roleDisplay.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                    نمایش {users.length} از {pagination.totalUsers} کاربر
                  </Typography>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Users;
