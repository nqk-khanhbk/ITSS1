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
import { register } from '../../services/user.services';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('すべての項目を入力してください');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('メールアドレスの形式が正しくありません');
        setLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        toast.error('パスワードは6文字以上で入力してください');
        setLoading(false);
        return;
      }

      // Check password match
      if (formData.password !== formData.confirmPassword) {
        toast.error('確認用パスワードが一致しません');
        setLoading(false);
        return;
      }

      // Check terms agreement
      if (!agreedToTerms) {
        toast.error('利用規約とプライバシーポリシーに同意してください');
        setLoading(false);
        return;
      }

      // Call API
      const option = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const response = await register(option);
      console.log('Register response:', response);

      // Kiểm tra thành công dựa vào response có data hoặc message thành công
      if (response && (response.data || response.message === 'Đăng ký thành công')) {
        toast.success('登録に成功しました。');
        
        // Chuyển hướng đến trang login sau 1 giây
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        toast.error(response.message || '登録に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Register error:', error);
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
          background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 50%, #fff8e1 100%)',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'white',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f48fb1, #4fc3f7, #ffca28)',
                borderRadius: '3px 3px 0 0'
              }
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
                background: 'linear-gradient(135deg, #4fc3f7 0%, #ffca28 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4
              }}
            >
              🦊 新規登録
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Full Name Input */}
              <TextField
                fullWidth
                label="氏名"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                sx={{ mb: 2 }}
              />

              {/* Email Input */}
              <TextField
                fullWidth
                label="メールアドレス"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />

              {/* Password Input */}
              <TextField
                fullWidth
                label="パスワード"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />

              {/* Confirm Password Input */}
              <TextField
                fullWidth
                label="パスワード（確認）"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />

              {/* Terms Agreement Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    sx={{
                      color: '#f48fb1',
                      '&.Mui-checked': {
                        color: '#f48fb1'
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    <span style={{ color: '#f48fb1', fontWeight: 600 }}>
                      利用規約
                    </span>
                    と
                    <span style={{ color: '#4fc3f7', fontWeight: 600 }}>
                      プライバシーポリシー
                    </span>
                    に同意します
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              {/* Register Button */}
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
                  borderRadius: 50,
                  mb: 3,
                  background: 'linear-gradient(135deg, #4fc3f7 0%, #ffca28 100%)',
                  boxShadow: '0 4px 15px rgba(79,195,247,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #29b6f6 0%, #ffa726 100%)',
                    boxShadow: '0 6px 20px rgba(79,195,247,0.5)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '登録中...' : '登録'}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  すでにアカウントをお持ちですか？{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#f48fb1',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    ログイン
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

export default Register;
