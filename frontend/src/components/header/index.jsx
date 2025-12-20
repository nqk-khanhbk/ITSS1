import { AppBar, Toolbar, Stack, IconButton, Button, Box, InputBase, alpha, Divider, Avatar, Typography } from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react';
import { getCookie, deleteCookie } from '../../helpers/cookies.helper';

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const token = getCookie('token');
  const fullName = getCookie('fullName');

  const handleProfileClick = () => {
    navigate('/profile');
  };


  // 検索フォームが送信されたときの処理
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/search?keyword=${searchTerm.trim()}`);
      console.log("Searching for:", `/search?keyword=${searchTerm.trim()}`);

    } else {
      navigate('/search');
    }
  };
  return (
    <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #f48fb1 0%, #4fc3f7 50%, #ffca28 100%)' }}>
      <Toolbar sx={{ minHeight: 68, gap: 3 }}>
        {/* Left logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 1,
            px: 1,
            textDecoration: 'none',
            color: '#1a237e',
            textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
            '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
          }}
        >
          🦊 ハノイ週末
        </Box>

        {/* Divider space between logo and nav */}
        <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#fff', 0.5) }} />

        {/* Navigation group */}
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mr: 2 }}>
          <IconButton
            component={Link}
            to="/"
            size="small"
            aria-label="ホーム"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.5)', 
              color: '#1a237e',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.8)', transform: 'scale(1.1)' },
              transition: 'all 0.2s'
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </IconButton>
          <Button 
            component={Link} 
            to="/ranking" 
            size="small" 
            sx={{ 
              fontWeight: 700,
              color: '#1a237e',
              bgcolor: 'rgba(255,255,255,0.4)',
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.7)' } 
            }}
          >
            ランキング
          </Button>
          <Button 
            component={Link} 
            to="/schedule" 
            size="small" 
            sx={{ 
              fontWeight: 700,
              color: '#1a237e',
              bgcolor: 'rgba(255,255,255,0.4)',
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.7)' }
            }}
          >
            スケジュール
          </Button>
        </Stack>

        {/* Center search box grows */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              maxWidth: 520,
              px: 2,
              py: 1,
              borderRadius: 50,
              backgroundColor: alpha('#fff', 0.85),
              border: '2px solid ' + alpha('#f48fb1', 0.5),
              transition: 'all .3s ease',
              '&:hover': { 
                backgroundColor: '#fff',
                boxShadow: '0 4px 20px rgba(244,143,177,0.3)'
              },
              '&:focus-within': {
                backgroundColor: '#fff',
                border: '2px solid #f48fb1',
                boxShadow: '0 4px 20px rgba(244,143,177,0.4)'
              }
            })}
          >
            <SearchIcon fontSize="small" sx={{ color: '#f48fb1' }} />
            <InputBase
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="検索..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ flex: 1, fontSize: 14, color: '#333' }}
            />
          </Box>
        </Box>

        {/* Auth buttons or User Menu */}
        {token ? (
          <Stack direction="row" spacing={1} alignItems="center">

            {/* User Profile Box - Avatar + Name */}
            <Box
              onClick={handleProfileClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                cursor: 'pointer',
                borderRadius: 50,
                bgcolor: 'rgba(255,255,255,0.6)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
                transition: 'all 0.2s'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  fontSize: 14
                }}
              >
                {fullName || 'ユーザー'}
              </Typography>
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(26,35,126,0.1)',
                  '&:hover': { bgcolor: 'rgba(26,35,126,0.2)' },
                  p: 0.5
                }}
              >
                <AccountCircleIcon sx={{ color: '#1a237e', fontSize: 28 }} />
              </IconButton>
            </Box>
            {/* Notification Icon */}
            <IconButton
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.6)',
                color: '#1a237e',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.85)', transform: 'scale(1.1)' },
                transition: 'all 0.2s'
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              component={Link}
              to="/login"
              size="small"
              variant="outlined"
              sx={{
                px: 2.5,
                borderRadius: 50,
                textTransform: 'none',
                fontWeight: 700,
                color: '#1a237e',
                bgcolor: 'rgba(255,255,255,0.5)',
                borderColor: '#1a237e',
                borderWidth: 2,
                '&:hover': { 
                  borderColor: '#1a237e', 
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderWidth: 2
                }
              }}
            >
              ログイン
            </Button>
            <Button
              size="small"
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                px: 2.5,
                borderRadius: 50,
                textTransform: 'none',
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)',
                boxShadow: '0 4px 15px rgba(233,30,99,0.4)',
                '&:hover': { 
                  boxShadow: '0 6px 20px rgba(233,30,99,0.5)', 
                  background: 'linear-gradient(135deg, #d81b60 0%, #7b1fa2 100%)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
              }}
            >
              新規登録
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
