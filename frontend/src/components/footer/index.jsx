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
    <Box component="footer" sx={{ 
      background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)', 
      color: '#1a237e', 
      py: 5, 
      mt: 'auto',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #f48fb1, #ffca28, #4fc3f7, #f48fb1)'
      }
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={12}>
          {/* Left: Website info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#c2185b', mb: 2 }}>
              🦊 ハノイ週末
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, color: '#1a237e' }}>
              ハノイの素敵な遊び・エンタメスポットを発見しよう。
              <br />
              みんなで充実した週末を楽しみましょう！
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <LocationOnIcon fontSize="small" sx={{ mt: 0.3, color: '#c2185b' }} />
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#1a237e' }}>
                  ハノイ工科大学<br />1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailIcon fontSize="small" sx={{ color: '#f57c00' }} />
                <Typography variant="body2" sx={{ color: '#1a237e' }}>
                  contact@hanoiweekend.vn
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PhoneIcon fontSize="small" sx={{ color: '#c2185b' }} />
                <Typography variant="body2" sx={{ color: '#1a237e' }}>
                  ホットライン: 0344 570 115
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
                  bgcolor: 'rgba(26,35,126,0.1)',
                  color: '#1a237e',
                  '&:hover': { bgcolor: '#c2185b', color: '#fff', transform: 'translateY(-3px) scale(1.1)', boxShadow: '0 4px 15px rgba(194,24,91,0.4)' },
                  transition: 'all .3s'
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(26,35,126,0.1)',
                  color: '#1a237e',
                  '&:hover': { bgcolor: '#f57c00', color: '#fff', transform: 'translateY(-3px) scale(1.1)', boxShadow: '0 4px 15px rgba(245,124,0,0.4)' },
                  transition: 'all .3s'
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(26,35,126,0.1)',
                  color: '#1a237e',
                  '&:hover': { bgcolor: '#0288d1', color: '#fff', transform: 'translateY(-3px) scale(1.1)', boxShadow: '0 4px 15px rgba(2,136,209,0.4)' },
                  transition: 'all .3s'
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="YouTube"
                href="https://youtube.com"
                target="_blank"
                sx={{
                  bgcolor: 'rgba(26,35,126,0.1)',
                  color: '#1a237e',
                  '&:hover': { bgcolor: '#d32f2f', color: '#fff', transform: 'translateY(-3px) scale(1.1)', boxShadow: '0 4px 15px rgba(211,47,47,0.4)' },
                  transition: 'all .3s'
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Column 2: Discover */}
          <Grid item xs={12} sm={8} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#c2185b', mb: 2 }}>
              探索
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/places" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                注目スポット
              </MuiLink>
              <MuiLink href="/events" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                週末イベント
              </MuiLink>
              <MuiLink href="/food" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                グルメ
              </MuiLink>
              <MuiLink href="/parks" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                公園・湖
              </MuiLink>
              <MuiLink href="/museums" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                博物館・史跡
              </MuiLink>
              <MuiLink href="/shopping" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                ショッピング
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 3: About */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#c2185b', mb: 2 }}>
              私たちについて
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/about" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                会社概要
              </MuiLink>
              <MuiLink href="/mission" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                ミッション
              </MuiLink>
              <MuiLink href="/blog" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                ブログ
              </MuiLink>
              <MuiLink href="/partners" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                パートナー
              </MuiLink>
              <MuiLink href="/careers" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                採用情報
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 4: Dev team */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#c2185b', mb: 2 }}>
              開発チーム
            </Typography>
            <Stack spacing={0.8}>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Lê Thái Sơn - TL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Nguyễn Quốc Khánh - SL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Cao Thành Đạt</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Trần Doãn Huy</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Vũ Thị Quỳnh Như</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Nguyễn Đức Đại Dương</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#1a237e' }}>Phạm Long Khánh</Typography>
            </Stack>
          </Grid>

          {/* Column 5: Support & Policy */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#c2185b', mb: 2 }}>
              サポート・ポリシー
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/guide" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                ご利用ガイド
              </MuiLink>
              <MuiLink href="/faq" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                よくある質問
              </MuiLink>
              <MuiLink href="/terms" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                利用規約
              </MuiLink>
              <MuiLink href="/privacy" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                プライバシーポリシー
              </MuiLink>
              <MuiLink href="/contact" underline="hover" sx={{ fontSize: 14, color: '#1a237e', '&:hover': { color: '#c2185b' }, transition: 'color 0.2s' }}>
                お問い合わせ
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(26,35,126,0.2)' }} />

        <Typography variant="body2" align="center" sx={{ color: '#1a237e' }}>
          &copy; {new Date().getFullYear()} ハノイ週末。美しい首都を毎日発見しよう。
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
