import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, Container, Grid, Typography, Stack, Divider, Paper, 
    Button, IconButton, Chip, Avatar // ĐÃ THÊM AVATAR
} from '@mui/material';

// Import Icons cần thiết
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'; // Không cần thiết trừ khi bạn chỉnh sửa icon marker mặc định
import { getCookie } from '../../helpers/cookies.helper';
import {
    addFavoritePlace,
    removeFavoritePlace,
    checkFavoritePlace,
} from '../../services/favorite.services';

// Component chính
const PlaceDetail = () => {
    const { id } = useParams(); // Lấy ID địa điểm từ URL
    const navigate = useNavigate();
    const [placeData, setPlaceData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    // Lấy dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const detailResponse = await axios.get(`http://localhost:3000/api/places/${id}`);
                const respData = detailResponse.data;
                const place = respData?.data || respData;
                const reviewsResponse = await axios.get(`http://localhost:3000/api/reviews/place/${id}?limit=2`);

                setPlaceData(place);
                setReviews(reviewsResponse.data.data);

                // Nếu đã đăng nhập, kiểm tra trạng thái favorite
                try {
                    const userStr = getCookie('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const chk = await checkFavoritePlace(user._id, id);
                        if (chk && chk.data && typeof chk.data.is_favorite !== 'undefined') {
                            setIsFavorite(!!chk.data.is_favorite);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to check favorite', e);
                }
            } catch (err) {
                console.error("Fetch Detail Error:", err);
                setError("Không thể tải chi tiết địa điểm. Vui lòng kiểm tra ID.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Container sx={{ mt: 5 }}><Typography align="center">Đang tải...</Typography></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Typography align="center" color="error">{error}</Typography></Container>;
    if (!placeData) return null;
    
    // Dữ liệu chính:
    const { 
        name, rating, total_reviews, images, price_range, address, 
        description, related_places, age_limit, location 
    } = placeData;

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
            <Container maxWidth="xl" sx={{ ml: 6 }}>
                
                {/* Mục 1: Tiêu đề và Rating */}
                <Stack direction="row" alignItems="flex-end" spacing={2} sx={{ mb: 2 }}>
                    <Typography variant="h4" fontWeight={700}>{name}</Typography>
                </Stack>
                
                {/* 2. Body - Chia 2 cột */}
                <Grid container spacing={3} >
                    
                    {/* Cột Trái (2/3) */}
                    <Grid item xs={12} md={8} sx={{ minWidth: '60%' }}>
                        {/* Mục 3: Main Image / Gallery */}
                        <Paper sx={{ height: 450, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                            <Box
                                component="img"
                                src={images && images.length > 0 ? images[0].url : 'https://via.placeholder.com/800x450?text=Gallery+Placeholder'}
                                alt={name}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Paper>
                        
                        <Box sx={{ mt: 3 }}>
                            {/* Mục 5: Chi tiết & Mô tả */}
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Mô tả chi tiết</Typography>
                            <Typography variant="body1" color="text.secondary">{description}</Typography>
                        </Box>
                        
                        {/* Mục 7 & 8: Đánh giá & Bình luận */}
                        <Box sx={{ mt: 4 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight={600}>
                                    Đánh giá & Bình luận
                                </Typography>
                                <Chip 
                                    label={`Điểm: ${rating} / 5.0 (${total_reviews} reviews)`} 
                                    color="primary" 
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Stack>

                            <Divider sx={{ mt: 2, mb: 3 }}/>

                            {/* Mục 8: Danh sách bình luận */}
                            <Stack spacing={3}>
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <Box key={review._id}>
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                {/* Avatar Reviewer */}
                                                <Avatar src={review.user_id?.avatar} alt={review.user_id?.fullName} />
                                                
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {review.user_id?.fullName || 'Người dùng ẩn danh'}
                                                    </Typography>
                                                    {/* Rating Stars */}
                                                    <Typography variant="caption" color="gold">
                                                        {'⭐'.repeat(review.rating)}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        {review.comment}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Ngày: {new Date(review.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa có đánh giá nào. Hãy là người đầu tiên!
                                    </Typography>
                                )}

                                <Button variant="outlined" sx={{ alignSelf: 'flex-start', textTransform: 'none', mt: 3 }}>
                                    Xem tất cả {total_reviews} bình luận
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Cột Phải (1/3) */}
                    <Grid item xs={12} md={4} sx={{ minWidth: '30%'}} >
                        <Stack spacing={3}> 
                            {/* Mục 4: Thông tin cơ bản & Ticket/Add Favorite */}
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={700}>Thông tin cơ bản</Typography>
                                    <Divider />
                                    
                                    {/* Giá */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AttachMoneyIcon color="primary" />
                                        <Typography variant="body1">Giá: {price_range || 'Liên hệ'}</Typography>
                                    </Stack>
                                    
                                    {/* Giờ mở cửa (Chưa có trong data, thêm mock) */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AccessTimeIcon color="primary" />
                                        <Typography variant="body1">Giờ mở cửa: 8:00 - 18:00</Typography>
                                    </Stack>
                                    
                                    {/* Độ tuổi */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <PeopleIcon color="primary" />
                                        <Typography variant="body1">Độ tuổi: {age_limit?.min || '0'} - {age_limit?.max || 'Mọi lứa tuổi'}</Typography>
                                    </Stack>

                                    {/* Địa chỉ */}
                                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                                        <LocationOnIcon color="primary" sx={{ mt: 0.5 }}/>
                                        <Typography variant="body1">Địa chỉ: {address || 'Đang cập nhật'}</Typography>
                                    </Stack>

                                    <Divider />
                                    
                                    {/* Nút Thêm/Bỏ yêu thích */}
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant={isFavorite ? 'contained' : 'outlined'}
                                            color={isFavorite ? 'error' : 'primary'}
                                            startIcon={<FavoriteBorderIcon />}
                                            sx={{ textTransform: 'none', flexGrow: 1 }}
                                            onClick={async () => {
                                                const userStr = getCookie('user');
                                                if (!userStr) {
                                                    alert('Vui lòng đăng nhập để sử dụng chức năng này');
                                                    return;
                                                }
                                                const user = JSON.parse(userStr);
                                                try {
                                                    if (isFavorite) {
                                                        await removeFavoritePlace(user._id, id);
                                                        setIsFavorite(false);
                                                    } else {
                                                        await addFavoritePlace(user._id, id);
                                                        setIsFavorite(true);
                                                    }
                                                } catch (err) {
                                                    console.error('Toggle favorite error', err);
                                                    alert('Có lỗi xảy ra khi cập nhật yêu thích');
                                                }
                                            }}
                                        >
                                            {isFavorite ? 'Bỏ Yêu thích' : 'Thêm Yêu thích'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                            
                            {/* Mục 6: Map Area */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Địa điểm trên bản đồ</Typography>
                                <Box sx={{ height: 300, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                    {location?.coordinates ? (
                                        <>
                                            <MapContainer 
                                                center={[location.coordinates[1], location.coordinates[0]]} 
                                                zoom={14} 
                                                style={{ height: '80%', width: '100%' }}
                                                key={location.coordinates[0]} 
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; OpenStreetMap contributors'
                                                />
                                                <Marker position={[location.coordinates[1], location.coordinates[0]]}>
                                                    <Popup>{name}</Popup>
                                                </Marker>
                                            </MapContainer>
                                            
                                            <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>
                                                Cách di chuyển
                                            </Button>
                                        </>
                                    ) : (
                                        <Typography align="center" sx={{ pt: 10 }} color="text.secondary">
                                            Không có dữ liệu tọa độ
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Mục 9: Địa điểm liên quan */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Địa điểm liên quan</Typography>
                                <Stack spacing={2}>
                                    {related_places?.map((place) => (
                                        <Paper 
                                            key={place._id} 
                                            sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}
                                            
                                            // SỬA LỖI ĐIỀU HƯỚNG TẠI ĐÂY: Dùng template literal (backticks `)
                                            onClick={() => navigate(`/places/${place._id}`)} 
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box 
                                                    component="img" 
                                                    src={place.thumbnail || 'https://via.placeholder.com/60x60'}
                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>{place.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{place.price_range}</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PlaceDetail;
