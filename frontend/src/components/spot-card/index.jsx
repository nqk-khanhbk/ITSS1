import * as React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
  Stack
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../helpers/cookies.helper';
import { addFavoritePlace, removeFavoritePlace, checkFavoritePlace } from '../../services/favorite.services';
import FavoriteIcon from '@mui/icons-material/Favorite';

const SpotCard = ({ spot, isFavorite: isFavoriteProp, onToggleFavorite }) => {
  const navigate = useNavigate();
  // Controlled if parent provides isFavoriteProp; otherwise local state and optional backend check
  const [isFavorite, setIsFavorite] = React.useState(
    typeof isFavoriteProp === 'boolean' ? isFavoriteProp : false
  );

  React.useEffect(() => {
    // If parent passes isFavoriteProp, keep local state in sync
    if (typeof isFavoriteProp === 'boolean') {
      setIsFavorite(isFavoriteProp);
      return;
    }

    // Otherwise, perform a one-time check with backend (only if user logged in)
    let mounted = true;
    const userStr = getCookie('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      const userId = user._id;
      (async () => {
        try {
          const res = await checkFavoritePlace(userId, spot._id || spot.id);
          if (mounted && res && res.data && typeof res.data.is_favorite !== 'undefined') {
            setIsFavorite(!!res.data.is_favorite);
          }
        } catch (err) {
          // ignore
        }
      })();
    } catch (e) {
      // invalid user cookie
    }
    return () => { mounted = false };
  }, [spot, isFavoriteProp]);

  const handleDetailClick = () => {
    navigate(`/places/${spot._id}`);
  };

  const getImageUrl = () => {
    if (spot.thumbnail) return spot.thumbnail;
    if (spot.images && spot.images.length > 0) {
      const firstImage = spot.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    return 'https://via.placeholder.com/250x160?text=No+Image';
  };

  return (
    <Card
      sx={{
        width: 348,
        height: 400, // Đảm bảo card chiếm toàn bộ chiều cao
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Ảnh */}
      <CardMedia
        component="img"
        height="160"
        image={getImageUrl()}
        alt={spot.name || '名称未設定'}
        sx={{ objectFit: 'cover' }}
      />

      {/* Nội dung */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // Đảm bảo nút nằm dưới
          p: 2
        }}
      >
        {/* Tên + Tim */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              mr: 1
            }}
          >
            {spot.name || '名称未設定のスポット'}
          </Typography>
          <IconButton
            size="small"
            sx={{ p: 0.5, mt: -0.5 }}
            aria-label="お気に入り"
            onClick={async (e) => {
              e.stopPropagation();
              const userStr = getCookie('user');
              if (!userStr) {
                navigate('/login');
                return;
              }
              const user = JSON.parse(userStr);
              try {
                if (isFavorite) {
                  await removeFavoritePlace(user._id, spot._id || spot.id);
                  setIsFavorite(false);
                  if (typeof onToggleFavorite === 'function') onToggleFavorite(false, spot);
                } else {
                  await addFavoritePlace(user._id, spot._id || spot.id);
                  setIsFavorite(true);
                  if (typeof onToggleFavorite === 'function') onToggleFavorite(true, spot);
                }
              } catch (err) {
                console.error('Favorite toggle error', err);
              }
            }}
          >
            {isFavorite ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        </Stack>

        {/* Rating */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
          <Typography variant="body2" fontWeight={600}>
            {spot.rating || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({spot.total_reviews || 0} レビュー)
          </Typography>
        </Stack>

        {/* Giá + Mô tả */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="primary" fontWeight={500} sx={{ mb: 0.5 }}>
            💰 {spot.price_range || '詳細はお問い合わせください'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
            {spot.description
              ? spot.description.length > 50
                ? spot.description.slice(0, 50) + '...'
                : spot.description
              : ''}
          </Typography>
        </Box>

        {/* Nút chi tiết */}
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={handleDetailClick}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            mt: 'auto' // Đẩy nút xuống cuối
          }}
        >
          詳細を見る
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpotCard;
