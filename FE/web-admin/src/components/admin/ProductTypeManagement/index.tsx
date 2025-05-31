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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { API_USER } from "../../../links/index";

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  subCategoryResponses: SubCategory[];
}

const ProductTypeManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(
    null
  );
  const [subCategoryName, setSubCategoryName] = useState<string>("");

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<number | null>(
    null
  );

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

      // If there are categories, select the first one by default
      if (response.data && response.data.length > 0) {
        setSelectedCategory(response.data[0]);
      }

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCategory = () => {
    setEditSubCategory(null);
    setSubCategoryName("");
    setOpenDialog(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditSubCategory(subCategory);
    setSubCategoryName(subCategory.subCategoryName);
    setOpenDialog(true);
  };

  const handleDeleteClick = (subCategoryId: number) => {
    setSubCategoryToDelete(subCategoryId);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (subCategoryToDelete === null || !selectedCategory) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_USER}/subCategory/delete`,
        {
          subCategoryId: subCategoryToDelete,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      const updatedCategories = categories.map((category) => {
        if (category.categoryId === selectedCategory.categoryId) {
          return {
            ...category,
            subCategoryResponses: category.subCategoryResponses.filter(
              (sub) => sub.subCategoryId !== subCategoryToDelete
            ),
          };
        }
        return category;
      });

      setCategories(updatedCategories);

      // Update selected category
      const updatedSelectedCategory =
        updatedCategories.find(
          (cat) => cat.categoryId === selectedCategory.categoryId
        ) || null;

      setSelectedCategory(updatedSelectedCategory);

      showNotification("Xóa phân loại sản phẩm thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi xóa phân loại sản phẩm:", err);
      showNotification(
        "Không thể xóa phân loại sản phẩm. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setConfirmDelete(false);
      setSubCategoryToDelete(null);
    }
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryName.trim() || !selectedCategory) {
      showNotification("Tên phân loại không được để trống!", "error");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (editSubCategory) {
        await axios.post(
          `${API_USER}/subCategory/update`,
          {
            subCategoryId: editSubCategory.subCategoryId,
            categoryId: selectedCategory.categoryId,
            subCategoryName,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update local state
        const updatedCategories = categories.map((category) => {
          if (category.categoryId === selectedCategory.categoryId) {
            return {
              ...category,
              subCategoryResponses: category.subCategoryResponses.map((sub) =>
                sub.subCategoryId === editSubCategory.subCategoryId
                  ? { ...sub, subCategoryName }
                  : sub
              ),
            };
          }
          return category;
        });

        setCategories(updatedCategories);

        // Update selected category
        const updatedSelectedCategory =
          updatedCategories.find(
            (cat) => cat.categoryId === selectedCategory.categoryId
          ) || null;

        setSelectedCategory(updatedSelectedCategory);

        showNotification("Cập nhật phân loại sản phẩm thành công!", "success");
      } else {
        // Changed endpoint to match backend API
        const response = await axios.post(
          `${API_USER}/subCategory/addOne`,
          {
            categoryId: selectedCategory.categoryId,
            subCategoryName,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If the backend doesn't return the added subcategory, refresh all categories
        if (!response.data || !response.data.subCategoryId) {
          fetchCategories();
        } else {
          const newSubCategory: SubCategory = response.data;

          // Update local state
          const updatedCategories = categories.map((category) => {
            if (category.categoryId === selectedCategory.categoryId) {
              return {
                ...category,
                subCategoryResponses: [
                  ...category.subCategoryResponses,
                  newSubCategory,
                ],
              };
            }
            return category;
          });

          setCategories(updatedCategories);

          // Update selected category
          const updatedSelectedCategory =
            updatedCategories.find(
              (cat) => cat.categoryId === selectedCategory.categoryId
            ) || null;

          setSelectedCategory(updatedSelectedCategory);
        }

        showNotification("Thêm phân loại sản phẩm thành công!", "success");
      }

      setOpenDialog(false);
    } catch (err) {
      console.error("Lỗi khi lưu phân loại sản phẩm:", err);
      showNotification(
        `Không thể ${
          editSubCategory ? "cập nhật" : "thêm"
        } phân loại sản phẩm. Vui lòng thử lại sau.`,
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
    <div className="product-type-management-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="500">
          Phân loại sản phẩm
        </Typography>
        {selectedCategory && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddSubCategory}
          >
            Thêm phân loại mới
          </Button>
        )}
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
        <>
          {/* Category Selection Combobox */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Chọn danh mục</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                style={{ width: "200px" }}
                value={selectedCategory?.categoryId || ""}
                onChange={(e) => {
                  const categoryId = e.target.value as number;
                  const category =
                    categories.find((cat) => cat.categoryId === categoryId) ||
                    null;
                  setSelectedCategory(category);
                }}
                label="Chọn danh mục"
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {selectedCategory ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell width="10%">ID</TableCell>
                    <TableCell width="70%">Tên phân loại</TableCell>
                    <TableCell width="20%" align="center">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCategory.subCategoryResponses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có phân loại nào trong danh mục này
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedCategory.subCategoryResponses.map((subCategory) => (
                      <TableRow key={subCategory.subCategoryId}>
                        <TableCell>{subCategory.subCategoryId}</TableCell>
                        <TableCell>{subCategory.subCategoryName}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditSubCategory(subCategory)}
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDeleteClick(subCategory.subCategoryId)
                            }
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
          ) : (
            <Alert severity="info">
              Vui lòng chọn một danh mục để xem phân loại sản phẩm.
            </Alert>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editSubCategory
            ? "Chỉnh sửa phân loại sản phẩm"
            : "Thêm phân loại sản phẩm mới"}
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Danh mục: <strong>{selectedCategory.categoryName}</strong>
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Tên phân loại sản phẩm"
            fullWidth
            variant="outlined"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveSubCategory}
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
          <Typography>
            Bạn có chắc chắn muốn xóa phân loại sản phẩm này?
          </Typography>
          <Typography variant="caption" color="error">
            Lưu ý: Các sản phẩm thuộc phân loại này cũng có thể bị ảnh hưởng.
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

export default ProductTypeManagement;
