import * as React from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton, Box, Button } from '@mui/material'; // Thêm Button
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

// Component hiển thị chi tiết 1 địa điểm
const SpotCard = ({ spot }) => {
  const navigate = useNavigate();

  // Hàm xử lý điều hướng đến trang chi tiết
  const handleDetailClick = () => {
      // Sử dụng ID của địa điểm (spot._id) để xây dựng URL
      navigate(`/places/${spot._id}`);
  };

  return (
    <Card 
        sx={{ 
            width: '250px', 
            position: 'relative', 
            height: 400, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
        }}
    >
      
      {/* Nút Yêu thích (Wireframe Mục 7) */}
      <IconButton 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          color: 'white', 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 10
        }}
      >
        <FavoriteBorderIcon />
      </IconButton>
      
      {/* Hình ảnh */}
      <CardMedia
        component="img"
        height="140"
        image={spot.thumbnail || 'https://via.placeholder.com/250x140?text=No+Image'}

        alt={spot.name}
      />
      
      {/* CardContent */}
      <CardContent 
            sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                // Loại bỏ justifyContent để nội dung ở gần nhau
            }}
        > 
            {/* Phần Tên, Rating, Giá */}
            <Box sx={{ flexGrow: 1 }}> {/* Bao quanh nội dung chính để đẩy Button xuống */}
                {/* Tên */}
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        fontWeight: 'bold', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                  {spot.name || "Địa điểm mới"}
                </Typography>
            
                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ color: 'gold', fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {spot.rating || '0'} ({spot.reviews || '0'} reviews)
                  </Typography>
                </Box>
                {/* Description */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {spot.description || 'Chưa có mô tả'}
                  </Typography>
                </Box>
                {/* Giá */}
                <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
                  {spot.price_range || 'Chưa rõ giá'}
                </Typography>
            </Box>
            
            {/* Nút Chi tiết (Wireframe Mụsc 6: 詳細を見る) */}
            <Button 
                variant="contained" 
                size="small" 
                fullWidth
                onClick={handleDetailClick}
                sx={{ 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    // Đặt màu xanh dương đồng bộ
                    bgcolor: '#1976d2', 
                    '&:hover': { bgcolor: '#1565c0' } 
                }}
            >
                Chi tiết
            </Button>
      </CardContent>
    </Card>
  );
};

export default SpotCard;
