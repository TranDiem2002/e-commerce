import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_USER } from "../../../links/index";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  Alert,
  Button,
} from "@mui/material";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Bạn cần đăng nhập để xem danh sách người dùng");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_USER}/user/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Hiển thị skin concerns dưới dạng chuỗi
  const formatSkinConcerns = (concerns) => {
    if (!concerns || concerns.length === 0) {
      return "Không có";
    }
    return concerns.join(", ");
  };

  // Hiển thị skin types dưới dạng chuỗi
  const formatSkinTypes = (types) => {
    if (!types || types.length === 0) {
      return "Không có";
    }
    return types.join(", ");
  };

  // Hiển thị avatar hoặc chữ cái đầu nếu không có avatar
  const renderAvatar = (user) => {
    if (user.avatar) {
      return <Avatar src={user.avatar} alt={user.userName} />;
    }
    return (
      <Avatar sx={{ bgcolor: "#3e6a13" }}>
        {user.userName ? user.userName.charAt(0).toUpperCase() : "U"}
      </Avatar>
    );
  };

  // Chuyển đổi giới tính sang tiếng Việt
  const translateGender = (gender) => {
    if (!gender) return "Không xác định";
    return gender === "Male" ? "Nam" : "Nữ";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress sx={{ color: "#3e6a13" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mx: 2, my: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mx: 2, my: 4 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#3e6a13", fontWeight: "500" }}
      >
        Danh sách người dùng
      </Typography>

      {users.length === 0 ? (
        <Alert severity="info">Không có người dùng nào.</Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Ảnh đại diện</TableCell>
                <TableCell>Tên người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ngày sinh</TableCell>
                <TableCell>Giới tính</TableCell>
                <TableCell>Loại da</TableCell>
                <TableCell>Vấn đề về da</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{renderAvatar(user)}</TableCell>
                  <TableCell sx={{ fontWeight: "500" }}>
                    {user.userName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.birthday || "Không xác định"}</TableCell>
                  <TableCell>{translateGender(user.gender)}</TableCell>
                  <TableCell>
                    {user.skinTypes && user.skinTypes.length > 0
                      ? user.skinTypes.map((type, i) => (
                          <Chip
                            key={i}
                            label={type}
                            size="small"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              bgcolor: "#e8f5e9",
                              color: "#2e7d32",
                            }}
                          />
                        ))
                      : "Không có"}
                  </TableCell>
                  <TableCell>
                    {user.skinConcerns && user.skinConcerns.length > 0
                      ? user.skinConcerns.map((concern, i) => (
                          <Chip
                            key={i}
                            label={concern}
                            size="small"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              bgcolor: "#fff8e1",
                              color: "#ff8f00",
                            }}
                          />
                        ))
                      : "Không có"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UserManagement;
