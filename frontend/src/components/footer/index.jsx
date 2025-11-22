import { Box, Container, Grid, Typography, Link as MuiLink, Stack, Divider, IconButton } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0d47a1', color: '#fff', py: 5, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={12}>
          {/* Left: Website info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              Hà Nội Cuối Tuần
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
              Khám phá những địa điểm vui chơi, giải trí tuyệt vời ở Hà Nội. 
              <br />   
              Cùng nhau tận hưởng cuối tuần ý nghĩa!
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <LocationOnIcon fontSize="small" sx={{ mt: 0.3, color: '#64b5f6' }} />
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
                  Đại học Bách Khoa Hà Nội<br />1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailIcon fontSize="small" sx={{ color: '#64b5f6' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  contact@hanoiweekend.vn
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PhoneIcon fontSize="small" sx={{ color: '#64b5f6' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Hotline: 0344 570 115
                </Typography>
              </Stack>
            </Stack>

            {/* Social icons */}
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <IconButton
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1877f2', transform: 'translateY(-2px)' },
                  transition: 'all .2s'
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  '&:hover': { bgcolor: '#e1306c', transform: 'translateY(-2px)' },
                  transition: 'all .2s'
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1da1f2', transform: 'translateY(-2px)' },
                  transition: 'all .2s'
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="YouTube"
                href="https://youtube.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  '&:hover': { bgcolor: '#ff0000', transform: 'translateY(-2px)' },
                  transition: 'all .2s'
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Column 2: Discover */}
          <Grid item xs={12} sm={8} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              Khám Phá
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/places" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Địa điểm nổi bật
              </MuiLink>
              <MuiLink href="/events" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Sự kiện cuối tuần
              </MuiLink>
              <MuiLink href="/food" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Ẩm thực đặc sắc
              </MuiLink>
              <MuiLink href="/parks" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Công viên & Hồ
              </MuiLink>
              <MuiLink href="/museums" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Bảo tàng & Di tích
              </MuiLink>
              <MuiLink href="/shopping" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Mua sắm
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 3: About */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              Về Chúng Tôi
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/about" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Giới thiệu
              </MuiLink>
              <MuiLink href="/mission" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Sứ mệnh
              </MuiLink>
              <MuiLink href="/blog" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Blog chia sẻ
              </MuiLink>
              <MuiLink href="/partners" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Đối tác
              </MuiLink>
              <MuiLink href="/careers" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Tuyển dụng
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 4: Dev team */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              Đội Phát Triển
            </Typography>
            <Stack spacing={0.8}>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Le Thai Son - TL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Nguyen Quoc Khanh - SL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Cao Thành Đạt</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Tran Doan Huy</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Vu Thi Quynh Nhu</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Nguyen Duc Dai Duong</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Phạm Long Khánh</Typography>
            </Stack>
          </Grid>

          {/* Column 5: Support & Policy */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              Hỗ Trợ & Chính Sách
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/guide" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Hướng dẫn sử dụng
              </MuiLink>
              <MuiLink href="/faq" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Câu hỏi thường gặp
              </MuiLink>
              <MuiLink href="/terms" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Điều khoản sử dụng
              </MuiLink>
              <MuiLink href="/privacy" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Chính sách bảo mật
              </MuiLink>
              <MuiLink href="/contact" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                Liên hệ
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

        <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          &copy; {new Date().getFullYear()} Hà Nội Cuối Tuần. Khám phá thủ đô xinh đẹp mỗi ngày.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
