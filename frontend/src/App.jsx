import './App.css'
import { Container, Box, Typography, Stack, Button, Divider, Chip } from '@mui/material'

function App() {
  return (
    <Container maxWidth="md">
      <Box py={6}>
        <Stack spacing={3}>
          <Typography variant="h3" component="h1" fontWeight={700}>
            Giới thiệu dự án
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Đây là ứng dụng React được xây dựng với Vite và Material UI (MUI).
            Mục tiêu là cung cấp khởi đầu nhanh, cấu trúc gọn nhẹ và UI hiện đại.
          </Typography>

          <Divider>
            <Chip label="Tính năng chính" />
          </Divider>

          <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
            <Typography component="li">Hiệu năng cao nhờ Vite HMR.</Typography>
            <Typography component="li">Component UI sẵn có từ MUI.</Typography>
            <Typography component="li">Dễ mở rộng và tuỳ biến.</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              href="https://mui.com/"
              target="_blank"
              rel="noreferrer"
            >
              Tài liệu MUI
            </Button>
            <Button
              variant="outlined"
              href="https://vitejs.dev/guide/"
              target="_blank"
              rel="noreferrer"
            >
              Tài liệu Vite
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}

export default App
