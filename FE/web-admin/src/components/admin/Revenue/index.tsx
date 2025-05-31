import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Button,
} from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { API_USER } from "../../../links/index";

// Đăng ký các component cần thiết của Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const RevenueStatistics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchStatisticsData();
  }, []);

  const fetchStatisticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập để xem thống kê");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Lấy dữ liệu danh mục đã mua
      const categoryResponse = await axios.get(
        `${API_USER}/purchasedOrder/revenueCategory`,
        { headers }
      );

      // Lấy dữ liệu doanh thu theo tháng
      const monthlyResponse = await axios.get(
        `${API_USER}/purchasedOrder/revenueMonth`,
        { headers }
      );

      setCategoryData(categoryResponse.data || []);
      setMonthlyData(monthlyResponse.data || []);

      // Tính tổng doanh thu
      const revenue = (monthlyResponse.data || []).reduce(
        (sum, item) => sum + item.revenue,
        0
      );
      setTotalRevenue(revenue);

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu thống kê:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const prepareBarChartData = () => {
    // Map tháng tiếng Anh sang tiếng Việt
    const monthMap = {
      JAN: "Tháng 1",
      FEB: "Tháng 2",
      MAR: "Tháng 3",
      APR: "Tháng 4",
      MAY: "Tháng 5",
      JUN: "Tháng 6",
      JUL: "Tháng 7",
      AUG: "Tháng 8",
      SEP: "Tháng 9",
      OCT: "Tháng 10",
      NOV: "Tháng 11",
      DEC: "Tháng 12",
    };

    const monthOrder = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthLabels = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    // Khởi tạo mảng revenue cho 12 tháng với giá trị mặc định là 0
    const revenues = Array(12).fill(0);

    // Cập nhật giá trị revenue cho các tháng có dữ liệu
    monthlyData.forEach((item) => {
      const monthIndex = monthOrder.indexOf(item.month);
      if (monthIndex !== -1) {
        revenues[monthIndex] = item.revenue;
      }
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenues,
          backgroundColor: "rgba(62, 106, 19, 0.7)",
          borderColor: "rgba(62, 106, 19, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieChartData = () => {
    const labels = categoryData.map((item) => item.subCategoryName);
    const values = categoryData.map((item) => item.percent);

    // Tạo bảng màu cho các phần của biểu đồ
    const backgroundColors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(199, 199, 199, 0.7)",
      "rgba(83, 102, 255, 0.7)",
      "rgba(78, 129, 189, 0.7)",
      "rgba(192, 80, 77, 0.7)",
    ];

    // Nếu có nhiều hơn 10 danh mục, tạo thêm màu ngẫu nhiên
    if (categoryData.length > 10) {
      for (let i = 10; i < categoryData.length; i++) {
        backgroundColors.push(`rgba(${Math.floor(Math.random() * 200) + 55}, 
                              ${Math.floor(Math.random() * 200) + 55}, 
                              ${Math.floor(Math.random() * 200) + 55}, 0.7)`);
      }
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Cấu hình cho biểu đồ cột
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Doanh thu theo tháng năm 2025",
        font: {
          size: 16,
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          weight: 500,
        },
        padding: { top: 10, bottom: 20 },
        color: "#333333",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: ${context.parsed.y.toLocaleString()} VNĐ`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString() + " đ";
          },
        },
      },
    },
  };

  // Cấu hình cho biểu đồ tròn
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Tỷ lệ doanh thu theo danh mục",
        font: {
          size: 16,
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          weight: 500,
        },
        padding: { top: 10, bottom: 20 },
        color: "#333333",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  // Lấy tháng có doanh thu cao nhất
  const getHighestRevenueMonth = () => {
    if (!monthlyData || monthlyData.length === 0) return "Chưa có dữ liệu";

    const monthMap = {
      JAN: "Tháng 1",
      FEB: "Tháng 2",
      MAR: "Tháng 3",
      APR: "Tháng 4",
      MAY: "Tháng 5",
      JUN: "Tháng 6",
      JUL: "Tháng 7",
      AUG: "Tháng 8",
      SEP: "Tháng 9",
      OCT: "Tháng 10",
      NOV: "Tháng 11",
      DEC: "Tháng 12",
    };

    const maxRevenueMonth = monthlyData.reduce(
      (max, item) => (item.revenue > max.revenue ? item : max),
      { revenue: 0 }
    );

    return maxRevenueMonth.revenue > 0
      ? monthMap[maxRevenueMonth.month] || "Không xác định"
      : "Chưa có dữ liệu";
  };

  // Lấy danh mục có doanh thu cao nhất
  const getTopCategory = () => {
    if (!categoryData || categoryData.length === 0) return "Chưa có dữ liệu";

    const topCategory = categoryData.reduce(
      (max, item) => (item.percent > max.percent ? item : max),
      { percent: 0 }
    );

    return topCategory.percent > 0
      ? topCategory.subCategoryName
      : "Chưa có dữ liệu";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#3e6a13" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchStatisticsData}>
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#3e6a13", fontWeight: 500, textAlign: "center" }}
      >
        Thống kê doanh thu
      </Typography>

      <Grid container spacing={3}>
        {/* Biểu đồ cột: Doanh thu theo tháng */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Doanh thu theo tháng năm 2025"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ paddingBottom: 0 }}
            />
            <CardContent sx={{ height: 350, pt: 1 }}>
              {monthlyData.length > 0 ? (
                <Box sx={{ height: "100%", position: "relative" }}>
                  <Bar data={prepareBarChartData()} options={barChartOptions} />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Chưa có dữ liệu doanh thu theo tháng
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Biểu đồ tròn: Danh mục đã được mua */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Danh mục đã được mua"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ paddingBottom: 0 }}
            />
            <CardContent sx={{ height: 350, pt: 1 }}>
              {categoryData.length > 0 ? (
                <Box sx={{ height: "100%", position: "relative" }}>
                  <Pie data={preparePieChartData()} options={pieChartOptions} />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Chưa có dữ liệu doanh thu theo danh mục
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Thống kê tổng hợp */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader
              title="Tổng quan"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tổng doanh thu
                    </Typography>
                    <Typography
                      variant="h5"
                      color="#3e6a13"
                      sx={{ fontWeight: 500 }}
                    >
                      {totalRevenue.toLocaleString()} ₫
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tháng có doanh thu cao nhất
                    </Typography>
                    <Typography
                      variant="h5"
                      color="#3e6a13"
                      sx={{ fontWeight: 500 }}
                    >
                      {getHighestRevenueMonth()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Danh mục được mua nhiều nhất
                    </Typography>
                    <Typography
                      variant="h5"
                      color="#3e6a13"
                      sx={{ fontWeight: 500 }}
                    >
                      {getTopCategory()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueStatistics;
