import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { Edit, Add } from "@mui/icons-material";
import { API_USER } from "../../../../links/index";

// Định nghĩa interfaces
interface Category {
  categoryId: number;
  categoryName: string;
  subCategoryResponses: SubCategory[];
}

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
}

interface ProductResponse {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discount: number;
  isNew: boolean;
  specialPrice: boolean;
  ratingsAvg: number;
  reviewCount: number;
}

// Interface cho sản phẩm mới
interface NewProduct {
  productName: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discount: number;
  isNew: boolean;
  specialPrice: boolean;
  categoryId: number;
  subCategoryId: number;
  description: string;
}

const AllProducts: React.FC = () => {
  // State quản lý danh mục và sản phẩm
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | string
  >("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  // State cho chức năng thêm sản phẩm mới
  const [openNewProductDialog, setOpenNewProductDialog] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newProductFormErrors, setNewProductFormErrors] = useState<{
    [key: string]: string;
  }>({});

  // Sản phẩm mới với giá trị mặc định
  const [newProduct, setNewProduct] = useState<NewProduct>({
    productName: "",
    imageUrl: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    isNew: true,
    specialPrice: false,
    categoryId: 0,
    subCategoryId: 0,
    description: "",
  });

  // State cho việc chọn danh mục trong form thêm sản phẩm
  const [newProductCategoryId, setNewProductCategoryId] = useState<number | "">(
    ""
  );
  const [newProductSubCategories, setNewProductSubCategories] = useState<
    SubCategory[]
  >([]);

  // Tải danh mục khi component được mount
  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  // Tải danh sách danh mục
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

  // Tải tất cả sản phẩm
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại để tiếp tục.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_USER}/product/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data);
      setError(null);

      if (response.data.length === 0) {
        showNotification("Không có sản phẩm nào", "info");
      } else {
        showNotification(`Đã tải ${response.data.length} sản phẩm`, "success");
      }
    } catch (err) {
      console.error("Lỗi khi lấy tất cả sản phẩm:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải sản phẩm theo danh mục
  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại để tiếp tục.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_USER}/product/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(response.data);
      setError(null);

      if (response.data.length === 0) {
        showNotification("Không có sản phẩm nào trong danh mục này", "info");
      }
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải sản phẩm theo phân loại
  const fetchProductsBySubCategory = async (subCategoryId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại để tiếp tục.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_USER}/product/getAll`,
        { subCategoryId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProducts(response.data);
      setError(null);

      if (response.data.length === 0) {
        showNotification("Không có sản phẩm nào trong phân loại này", "info");
      }
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thay đổi danh mục
  const handleCategoryChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const categoryId = event.target.value as number;
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("all"); // Reset về "all" khi thay đổi danh mục

    // Tìm các phân loại cho danh mục đã chọn
    const category = categories.find((cat) => cat.categoryId === categoryId);
    if (category) {
      setSubCategories(category.subCategoryResponses);
    } else {
      setSubCategories([]);
    }

    // Tải sản phẩm cho danh mục đã chọn
    fetchProductsByCategory(categoryId);
  };

  // Xử lý khi thay đổi phân loại
  const handleSubCategoryChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const subCategoryId = event.target.value;
    setSelectedSubCategoryId(subCategoryId);

    if (subCategoryId === "all" && selectedCategoryId) {
      // Tải tất cả sản phẩm cho danh mục đã chọn
      fetchProductsByCategory(selectedCategoryId as number);
    } else if (subCategoryId === "all") {
      // Tải tất cả sản phẩm nếu không có danh mục nào được chọn
      fetchAllProducts();
    } else {
      // Tải sản phẩm cho phân loại đã chọn
      fetchProductsBySubCategory(subCategoryId as number);
    }
  };

  // Xử lý khi nhấp vào nút chỉnh sửa
  const handleEditClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  // Hiển thị thông báo
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

  // Đóng thông báo
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Mở dialog thêm sản phẩm mới
  const handleOpenNewProductDialog = () => {
    setOpenNewProductDialog(true);
    setNewProductFormErrors({});

    // Reset form values
    setNewProduct({
      productName: "",
      imageUrl: "",
      price: 0,
      originalPrice: 0,
      discount: 0,
      isNew: true,
      specialPrice: false,
      categoryId: 0,
      subCategoryId: 0,
      description: "",
    });

    setNewProductCategoryId("");
    setNewProductSubCategories([]);
  };

  // Xử lý thay đổi input cho form sản phẩm mới
  const handleNewProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Với trường số, chuyển giá trị sang số
    if (["price", "originalPrice", "discount"].includes(name)) {
      const numValue = parseFloat(value);
      setNewProduct({
        ...newProduct,
        [name]: isNaN(numValue) ? 0 : numValue,
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value,
      });
    }

    // Xóa lỗi cho trường này nếu có
    if (newProductFormErrors[name]) {
      setNewProductFormErrors({
        ...newProductFormErrors,
        [name]: "",
      });
    }
  };

  // Xử lý thay đổi switch cho giá trị boolean
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: checked,
    });
  };

  // Xử lý chọn danh mục trong form thêm sản phẩm
  const handleNewProductCategoryChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const categoryId = event.target.value as number;
    setNewProductCategoryId(categoryId);

    // Cập nhật newProduct
    setNewProduct({
      ...newProduct,
      categoryId: categoryId,
      subCategoryId: 0, // Reset phân loại khi danh mục thay đổi
    });

    // Tìm phân loại cho danh mục đã chọn
    const category = categories.find((cat) => cat.categoryId === categoryId);
    if (category) {
      setNewProductSubCategories(category.subCategoryResponses);
    } else {
      setNewProductSubCategories([]);
    }

    // Xóa lỗi
    if (newProductFormErrors.categoryId) {
      setNewProductFormErrors({
        ...newProductFormErrors,
        categoryId: "",
        subCategoryId: "",
      });
    }
  };

  // Xử lý chọn phân loại trong form thêm sản phẩm
  const handleNewProductSubCategoryChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const subCategoryId = event.target.value as number;
    setNewProduct({
      ...newProduct,
      subCategoryId: subCategoryId,
    });

    // Xóa lỗi
    if (newProductFormErrors.subCategoryId) {
      setNewProductFormErrors({
        ...newProductFormErrors,
        subCategoryId: "",
      });
    }
  };

  // Xác thực form
  const validateNewProductForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!newProduct.productName.trim()) {
      errors.productName = "Tên sản phẩm không được để trống";
    }

    if (!newProduct.imageUrl.trim()) {
      errors.imageUrl = "URL hình ảnh không được để trống";
    }

    if (newProduct.price <= 0) {
      errors.price = "Giá bán phải lớn hơn 0";
    }

    if (newProduct.originalPrice <= 0) {
      errors.originalPrice = "Giá gốc phải lớn hơn 0";
    }

    if (newProduct.discount < 0 || newProduct.discount > 100) {
      errors.discount = "Giảm giá phải từ 0% đến 100%";
    }

    if (!newProduct.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }

    if (!newProduct.subCategoryId) {
      errors.subCategoryId = "Vui lòng chọn phân loại sản phẩm";
    }

    setNewProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gửi sản phẩm mới lên API
  const handleSubmitNewProduct = async () => {
    // Xác thực form
    if (!validateNewProductForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại để tiếp tục.");
        setIsSubmitting(false);
        return;
      }

      // Gọi API để tạo sản phẩm mới
      await axios.post(`${API_USER}/product/add`, newProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Đóng dialog
      setOpenNewProductDialog(false);

      // Hiển thị thông báo thành công
      showNotification("Thêm sản phẩm mới thành công", "success");

      // Làm mới danh sách sản phẩm
      if (selectedSubCategoryId === "all" && selectedCategoryId === "") {
        fetchAllProducts();
      } else if (selectedSubCategoryId === "all" && selectedCategoryId !== "") {
        fetchProductsByCategory(selectedCategoryId as number);
      } else if (selectedSubCategoryId !== "all") {
        fetchProductsBySubCategory(selectedSubCategoryId as number);
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm mới:", err);
      showNotification(
        "Không thể thêm sản phẩm mới. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="all-products-container">
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="500">
          Quản lý tất cả sản phẩm
        </Typography>

        {/* Nút Thêm sản phẩm mới */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenNewProductDialog}
        >
          Thêm sản phẩm mới
        </Button>
      </Box>

      {/* Dropdown lọc sản phẩm */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="category-select-label">Chọn danh mục</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              label="Chọn danh mục"
              disabled={loading || categories.length === 0}
            >
              <MenuItem value="">
                <em>Tất cả danh mục</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={loading}
          >
            <InputLabel id="subcategory-select-label">
              Chọn phân loại
            </InputLabel>
            <Select
              labelId="subcategory-select-label"
              id="subcategory-select"
              value={selectedSubCategoryId}
              onChange={handleSubCategoryChange}
              label="Chọn phân loại"
            >
              <MenuItem value="all">
                <em>Tất cả phân loại</em>
              </MenuItem>
              {subCategories.map((subCategory) => (
                <MenuItem
                  key={subCategory.subCategoryId}
                  value={subCategory.subCategoryId}
                >
                  {subCategory.subCategoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Thông báo lỗi */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Hiển thị loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Bảng sản phẩm */}
      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/50";
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditClick(product)}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Chi tiết sản phẩm */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết sản phẩm</DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.productName}
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/300";
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.productName}
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="40%">
                          ID sản phẩm
                        </TableCell>
                        <TableCell>{selectedProduct.productId}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Giá bán</TableCell>
                        <TableCell>
                          {selectedProduct.price.toLocaleString("vi-VN")} đ
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Giá gốc</TableCell>
                        <TableCell>
                          {selectedProduct.originalPrice.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Giảm giá</TableCell>
                        <TableCell>{selectedProduct.discount}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Sản phẩm mới</TableCell>
                        <TableCell>
                          {selectedProduct.isNew ? "Có" : "Không"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Giá đặc biệt</TableCell>
                        <TableCell>
                          {selectedProduct.specialPrice ? "Có" : "Không"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">
                          Đánh giá trung bình
                        </TableCell>
                        <TableCell>{selectedProduct.ratingsAvg} / 5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Số lượng đánh giá</TableCell>
                        <TableCell>{selectedProduct.reviewCount}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenDialog(false);
              showNotification(
                "Chức năng chỉnh sửa sẽ được triển khai sau",
                "info"
              );
            }}
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Thêm sản phẩm mới */}
      <Dialog
        open={openNewProductDialog}
        onClose={() => !isSubmitting && setOpenNewProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="productName"
                label="Tên sản phẩm *"
                value={newProduct.productName}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!newProductFormErrors.productName}
                helperText={newProductFormErrors.productName}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="imageUrl"
                label="URL hình ảnh *"
                value={newProduct.imageUrl}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!newProductFormErrors.imageUrl}
                helperText={newProductFormErrors.imageUrl}
                disabled={isSubmitting}
              />
            </Grid>

            {newProduct.imageUrl && (
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center", my: 2 }}
              >
                <img
                  src={newProduct.imageUrl}
                  alt="Product preview"
                  style={{
                    maxHeight: "150px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=Lỗi+hình+ảnh";
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={4}>
              <TextField
                name="price"
                label="Giá bán (VNĐ) *"
                type="number"
                value={newProduct.price}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!newProductFormErrors.price}
                helperText={newProductFormErrors.price}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="originalPrice"
                label="Giá gốc (VNĐ) *"
                type="number"
                value={newProduct.originalPrice}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!newProductFormErrors.originalPrice}
                helperText={newProductFormErrors.originalPrice}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="discount"
                label="Giảm giá (%)"
                type="number"
                value={newProduct.discount}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!newProductFormErrors.discount}
                helperText={newProductFormErrors.discount}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newProduct.isNew}
                    onChange={handleSwitchChange}
                    name="isNew"
                    disabled={isSubmitting}
                  />
                }
                label="Sản phẩm mới"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newProduct.specialPrice}
                    onChange={handleSwitchChange}
                    name="specialPrice"
                    disabled={isSubmitting}
                  />
                }
                label="Giá đặc biệt"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!newProductFormErrors.categoryId}>
                <InputLabel id="new-product-category-label">
                  Danh mục *
                </InputLabel>
                <Select
                  labelId="new-product-category-label"
                  value={newProductCategoryId}
                  onChange={handleNewProductCategoryChange}
                  label="Danh mục *"
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>Chọn danh mục</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
                {newProductFormErrors.categoryId && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5 }}
                  >
                    {newProductFormErrors.categoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                disabled={!newProductCategoryId}
                error={!!newProductFormErrors.subCategoryId}
              >
                <InputLabel id="new-product-subcategory-label">
                  Phân loại *
                </InputLabel>
                <Select
                  labelId="new-product-subcategory-label"
                  value={newProduct.subCategoryId}
                  onChange={handleNewProductSubCategoryChange}
                  label="Phân loại *"
                  disabled={!newProductCategoryId || isSubmitting}
                >
                  <MenuItem value={0}>
                    <em>Chọn phân loại</em>
                  </MenuItem>
                  {newProductSubCategories.map((subCategory) => (
                    <MenuItem
                      key={subCategory.subCategoryId}
                      value={subCategory.subCategoryId}
                    >
                      {subCategory.subCategoryName}
                    </MenuItem>
                  ))}
                </Select>
                {newProductFormErrors.subCategoryId && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5 }}
                  >
                    {newProductFormErrors.subCategoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô tả sản phẩm"
                value={newProduct.description}
                onChange={handleNewProductInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenNewProductDialog(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitNewProduct}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Đang thêm..." : "Thêm sản phẩm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
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

export default AllProducts;
