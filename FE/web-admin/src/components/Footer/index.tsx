import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  styled,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#3e6a13", // Màu xanh lá
  color: "#fff",
  padding: "40px 20px",
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  marginBottom: "8px",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const Footer = () => {
  return (
    <FooterContainer>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Cột 1: Về Cỏ Mềm */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              VỀ CỎ MỀM
            </Typography>
            <FooterLink>Chuyện của Cỏ</FooterLink>
            <FooterLink>Về nhà máy</FooterLink>
          </Grid>

          {/* Cột 2: Hoạt động cộng đồng */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              HOẠT ĐỘNG CỘNG ĐỒNG
            </Typography>
            <FooterLink>Xây trường cho trẻ em</FooterLink>
            <FooterLink>Trồng rừng</FooterLink>
            <FooterLink>Chung tay phòng chống COVID</FooterLink>
          </Grid>

          {/* Cột 3: Hướng dẫn mua hàng */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              HƯỚNG DẪN MUA HÀNG
            </Typography>
            <FooterLink>Chính sách mua hàng và thanh toán</FooterLink>
            <FooterLink>Chính sách bảo hành</FooterLink>
            <FooterLink>Chính sách đổi trả và hoàn tiền</FooterLink>
            <FooterLink>Chính sách bảo mật thông tin</FooterLink>
          </Grid>

          {/* Cột 4: Thông tin liên hệ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              THÔNG TIN LIÊN HỆ
            </Typography>
            <FooterLink>cskh.so@comem.vn</FooterLink>
            <FooterLink>096.862.2511</FooterLink>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f9a825",
                color: "#fff",
                marginTop: "10px",
                "&:hover": {
                  backgroundColor: "#f57f17",
                },
              }}
            >
              Hệ thống cửa hàng
            </Button>
          </Grid>
        </Grid>

        {/* Đăng ký email */}
        <Box
          sx={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" gutterBottom>
            Đăng ký email để nhận ưu đãi *
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Nhập email của bạn"
              size="small"
              sx={{
                backgroundColor: "#fff",
                borderRadius: "4px",
                width: "300px",
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f9a825",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#f57f17",
                },
              }}
            >
              ĐĂNG KÝ
            </Button>
          </Box>
        </Box>

        {/* Dòng thông tin công ty */}
        <Box
          sx={{
            marginTop: "40px",
            textAlign: "center",
            fontSize: "0.8rem",
          }}
        >
          <Typography>Công ty Cổ phần Mỹ phẩm Thiên nhiên Cỏ Mềm</Typography>
          <Typography>
            GPĐKKD số 0109153702 do Sở KHĐT Tp.Hà Nội cấp 09/04/2020
          </Typography>
          <Typography>
            Sản xuất tại Nhà máy Mỹ phẩm Thiên Nhiên Song An, 225 Trần Đăng
            Ninh, p. Dịch Vọng, q. Cầu Giấy, Hà Nội
          </Typography>
        </Box>

        {/* Biểu tượng mạng xã hội */}
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <FacebookIcon sx={{ fontSize: "30px", cursor: "pointer" }} />
          <InstagramIcon sx={{ fontSize: "30px", cursor: "pointer" }} />
          <YouTubeIcon sx={{ fontSize: "30px", cursor: "pointer" }} />
        </Box>

        {/* Ghi chú */}
        <Box
          sx={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#d4e157",
          }}
        >
          * Lưu ý: Tác dụng của sản phẩm có thể thay đổi tùy theo tình trạng thể
          chất mỗi người
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
