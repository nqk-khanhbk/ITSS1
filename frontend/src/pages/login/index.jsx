import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import Header from '../../components/header';
import { login } from '../../services/user.services';
import { setCookie } from '../../helpers/cookies.helper';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!email || !password) {
        toast.error('メールアドレスとパスワードを入力してください');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('メールアドレスの形式が正しくありません');
        setLoading(false);
        return;
      }

      // Call API
      const option = {
        email: email.trim(),
        password: password,
      };

      const response = await login(option);
      console.log('Login response:', response);
      if (response && response.token) {
        // Lưu token vào cookies
        const expiryDays = rememberMe ? 30 : 1;
        setCookie('token', response.token, expiryDays);
        
        // Lưu user info nếu có
        if (response.data) {
          setCookie('fullName', response.data.fullName, expiryDays);
          // Store full user object as JSON string so other components can read user._id
          try {
            setCookie('user', JSON.stringify(response.data), expiryDays);
          } catch (e) {
            console.warn('Failed to stringify user data for cookie', e);
          }
        }

        toast.success('ログインに成功しました。');
        
        // Chuyển hướng sau 1 giây
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        toast.error(response.message || 'ログインに失敗しました。入力内容をご確認ください。');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('エラーが発生しました。しばらくしてからもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'white'
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 4
            }}
          >
            ログイン
          </Typography>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              sx={{ mb: 2 }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />

            {/* Remember Me Checkbox and Forgot Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="ログイン情報を保存する"
              />
              <Link
                to="/forgot-password"
                style={{
                  color: '#667eea',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '16px'
                }}
              >
                パスワードをお忘れですか？
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none',
                borderRadius: 2,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #64387d 100%)'
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666'
                }
              }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                アカウントをお持ちでない方は{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#667eea',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  新規登録
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
    </>
  );
}

export default Login;
