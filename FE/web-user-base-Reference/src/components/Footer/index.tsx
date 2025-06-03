import React from "react";
import { Box, Container, Typography, styled } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#3e6a13", // Màu xanh lá
  color: "#fff",
  padding: "30px 20px",
}));

const Footer = () => {
  return (
    <FooterContainer>
      <Container maxWidth="xl">
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
            Sản xuất tại Nhà máy Mỹ phẩm Thiên Nhiên Song An
          </Typography>
          <Typography>
            225 Trần Đăng Ninh, p. Dịch Vọng, q. Cầu Giấy, Hà Nội
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
