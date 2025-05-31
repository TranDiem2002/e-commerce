import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { API_USER } from "../../../links/index"; // Adjust path as needed

interface Category {
  categoryId: number; // Note: Backend has catogoryId (typo), but we'll use correct naming in frontend
  categoryName: string;
  categoryStatus?: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryStatus, setCategoryStatus] = useState<boolean>(true);

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại để tiếp tục.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_USER}/category/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryStatus(true);
    setOpenDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditCategory(category);
    setCategoryName(category.categoryName);
    setCategoryStatus(
      category.categoryStatus !== undefined ? category.categoryStatus : true
    );
    setOpenDialog(true);
  };

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete === null) return;

    try {
      const token = localStorage.getItem("token");

      // Using POST for delete as per the backend API
      await axios.post(
        `${API_USER}/category/delete`,
        {
          catogoryId: categoryToDelete,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCategories(
        categories.filter(
          (category) => category.categoryId !== categoryToDelete
        )
      );
      showNotification("Xóa danh mục thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
      showNotification(
        "Không thể xóa danh mục. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setConfirmDelete(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      showNotification("Tên danh mục không được để trống!", "error");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (editCategory) {
        await axios.post(
          `${API_USER}/category/update`,
          {
            catogoryId: editCategory.categoryId,
            catogoryName: categoryName,
            categoryStatus: categoryStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update local state
        setCategories(
          categories.map((category) =>
            category.categoryId === editCategory.categoryId
              ? { ...category, categoryName, categoryStatus }
              : category
          )
        );

        showNotification("Cập nhật danh mục thành công!", "success");
      } else {
        // Add new category - Using POST to addOne endpoint
        const response = await axios.post(
          `${API_USER}/category/addOne`,
          {
            catogoryName: categoryName, // Note: Using "catogoryName" to match backend field name
            categoryStatus: categoryStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If the API returns the new category, add it to local state
        // If not, refresh all categories
        if (response.data && response.data.categoryId) {
          setCategories([...categories, response.data]);
        } else {
          fetchCategories();
        }

        showNotification("Thêm danh mục thành công!", "success");
      }

      setOpenDialog(false);
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err);
      showNotification(
        `Không thể ${
          editCategory ? "cập nhật" : "thêm"
        } danh mục. Vui lòng thử lại sau.`,
        "error"
      );
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({
      open: true,
      message,
      type,
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <div className="category-management-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="500">
          Danh mục sản phẩm
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddCategory}
        >
          Thêm danh mục
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell width="10%">ID</TableCell>
                <TableCell width="60%">Tên danh mục</TableCell>
                <TableCell width="10%">Trạng thái</TableCell>
                <TableCell width="20%" align="center">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.categoryId}>
                    <TableCell>{category.categoryId}</TableCell>
                    <TableCell>{category.categoryName}</TableCell>
                    <TableCell>
                      {category.categoryStatus !== undefined
                        ? category.categoryStatus
                          ? "Hoạt động"
                          : "Không hoạt động"
                        : "Hoạt động"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditCategory(category)}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(category.categoryId)}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên danh mục"
            fullWidth
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={categoryStatus}
                onChange={(e) => setCategoryStatus(e.target.checked)}
                color="primary"
              />
            }
            label="Hoạt động"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            color="primary"
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa danh mục này?</Typography>
          <Typography variant="caption" color="error">
            Lưu ý: Các sản phẩm thuộc danh mục này cũng có thể bị ảnh hưởng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CategoryManagement;
