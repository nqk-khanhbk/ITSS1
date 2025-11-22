import { AppBar, Toolbar, Stack, IconButton, Button, Box, InputBase, alpha, Divider } from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchIcon from '@mui/icons-material/Search'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar sx={{ minHeight: 68, gap: 3 }}>
        {/* Left logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 1,
            px: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          LOGO
        </Box>

        {/* Divider space between logo and nav */}
        <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#fff', 0.3) }} />

        {/* Navigation group */}
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mr: 2 }}>
          <IconButton
            component={Link}
            to="/"
            color="inherit"
            size="small"
            aria-label="Trang chủ"
            sx={{ bgcolor: alpha('#fff', 0.12), '&:hover': { bgcolor: alpha('#fff', 0.25) } }}
          >
            <HomeRoundedIcon fontSize="small" />
          </IconButton>
          <Button component={Link} to="/ranking" color="inherit" size="small" sx={{ fontWeight: 600 }}>Ranking</Button>
          <Button component={Link} to="/schedule" color="inherit" size="small" sx={{ fontWeight: 600 }}>Lịch trình</Button>
        </Stack>

        {/* Center search box grows */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              maxWidth: 520,
              px: 1.5,
              py: 0.75,
              borderRadius: 50,
              backgroundColor: alpha('#fff', 0.2),
              border: '1px solid ' + alpha('#fff', 0.35),
              transition: 'background-color .2s, box-shadow .2s',
              '&:hover': { backgroundColor: alpha('#fff', 0.3) },
              boxShadow: 'inset 0 0 0 1px ' + alpha('#000', 0.05)
            })}
          >
            <SearchIcon fontSize="small" />
            <InputBase
              placeholder="Tìm kiếm..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ flex: 1, fontSize: 14 }}
            />
          </Box>
        </Box>

        {/* Auth buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            sx={{
              px: 2,
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha('#fff', 0.6),
              '&:hover': { borderColor: '#fff', backgroundColor: alpha('#fff', 0.15) }
            }}
          >
            Đăng nhập
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{
              px: 2,
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg,#ab47bc,#7e57c2)',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none', background: 'linear-gradient(135deg,#9c27b0,#673ab7)' }
            }}
          >
            Đăng ký
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Header
