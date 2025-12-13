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
              ハノイ週末
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
              ハノイの素敵な遊び・エンタメスポットを発見しよう。
              <br />
              みんなで充実した週末を楽しみましょう！
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <LocationOnIcon fontSize="small" sx={{ mt: 0.3, color: '#64b5f6' }} />
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
                  ハノイ工科大学<br />1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
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
              探索
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/places" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                注目スポット
              </MuiLink>
              <MuiLink href="/events" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                週末イベント
              </MuiLink>
              <MuiLink href="/food" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                グルメ
              </MuiLink>
              <MuiLink href="/parks" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                公園・湖
              </MuiLink>
              <MuiLink href="/museums" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                博物館・史跡
              </MuiLink>
              <MuiLink href="/shopping" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                ショッピング
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 3: About */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              私たちについて
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/about" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                会社概要
              </MuiLink>
              <MuiLink href="/mission" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                ミッション
              </MuiLink>
              <MuiLink href="/blog" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                ブログ
              </MuiLink>
              <MuiLink href="/partners" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                パートナー
              </MuiLink>
              <MuiLink href="/careers" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                採用情報
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 4: Dev team */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              開発チーム
            </Typography>
            <Stack spacing={0.8}>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Lê Thái Sơn - TL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Nguyễn Quốc Khánh - SL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Cao Thành Đạt</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Trần Doãn Huy</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Vũ Thị Quỳnh Như</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Nguyễn Đức Đại Dương</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Phạm Long Khánh</Typography>
            </Stack>
          </Grid>

          {/* Column 5: Support & Policy */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#90caf9', mb: 2 }}>
              サポート・ポリシー
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/guide" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                ご利用ガイド
              </MuiLink>
              <MuiLink href="/faq" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                よくある質問
              </MuiLink>
              <MuiLink href="/terms" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                利用規約
              </MuiLink>
              <MuiLink href="/privacy" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                プライバシーポリシー
              </MuiLink>
              <MuiLink href="/contact" underline="hover" sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#90caf9' } }}>
                お問い合わせ
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

        <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          &copy; {new Date().getFullYear()} ハノイ週末。美しい首都を毎日発見しよう。
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
