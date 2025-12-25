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
import CommentSection from '../../components/comments/CommentSection';
import ReviewDialog from '../../components/reviews/ReviewDialog';
import ReviewStatsSection from '../../components/reviews/ReviewStatsSection';

// Component chính
const PlaceDetail = () => {
    const { id } = useParams(); // Lấy ID địa điểm từ URL
    const navigate = useNavigate();
    const [placeData, setPlaceData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [refreshStatsKey, setRefreshStatsKey] = useState(0);

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
                setError("詳細を読み込めません。IDをご確認ください。");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Container sx={{ mt: 5 }}><Typography align="center">読み込み中...</Typography></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Typography align="center" color="error">{error}</Typography></Container>;
    if (!placeData) return null;
    
    // Dữ liệu chính:
    const { 
        name, rating, total_reviews, images, price_range, address, 
        description, related_places, age_limit, location 
    } = placeData;

    // Helper function to reload reviews
    const fetchReviews = async () => {
        try {
            const reviewsResponse = await axios.get(`http://localhost:3000/api/reviews/place/${id}?limit=2`);
            setReviews(reviewsResponse.data.data);
            // Refresh stats box khi review được submit/update
            setRefreshStatsKey(prev => prev + 1);
        } catch (err) {
            console.error('Error loading reviews:', err);
        }
    };

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
                    <Grid item xs={12} md={8}>
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
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>詳細説明</Typography>
                            <Typography variant="body1" color="text.secondary">{description}</Typography>
                        </Box>
                        
                        {/* ĐÁNH GIÁ  */}
                        <Box sx={{ mt: 4 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={700}>
                            レビュー
                            </Typography>

                            {/* Nút mở popup đánh giá */}
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={() => {
                                    const userStr = getCookie('user');
                                    if (!userStr) {
                                        alert('レビューを書くにはログインしてください');
                                        return;
                                    }
                                    setOpenReviewDialog(true);
                                }}
                            >
                            評価する
                            </Button>
                        </Stack>

                        {/* Review Stats Section */}
                        <Box sx={{ mt: 3 }}>
                            <ReviewStatsSection placeId={id} refreshTrigger={refreshStatsKey} />
                        </Box>

                        <Divider sx={{ mt: 3, mb: 3 }} />

                        {/* Comment input + list comments */}
                        <CommentSection placeId={id} placeName={name} />
                        </Box>
                    </Grid>

                    {/* Cột Phải (1/3) */}
                    <Grid item xs={12} md={4} >
                        <Stack spacing={3}> 
                            {/* Mục 4: Thông tin cơ bản & Ticket/Add Favorite */}
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={700}>基本情報</Typography>
                                    <Divider />
                                    
                                    {/* Giá */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AttachMoneyIcon color="primary" />
                                        <Typography variant="body1">料金: {price_range || '詳細はお問い合わせください'}</Typography>
                                    </Stack>
                                    
                                    {/* Giờ mở cửa (Chưa có trong data, thêm mock) */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AccessTimeIcon color="primary" />
                                        <Typography variant="body1">営業時間: 8:00 - 18:00</Typography>
                                    </Stack>
                                    
                                    {/* Độ tuổi */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <PeopleIcon color="primary" />
                                        <Typography variant="body1">対象年齢: {age_limit?.min || '0'} - {age_limit?.max || '全年齢'}</Typography>
                                    </Stack>

                                    {/* Địa chỉ */}
                                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                                        <LocationOnIcon color="primary" sx={{ mt: 0.5 }}/>
                                        <Typography variant="body1">住所: {address || '更新中'}</Typography>
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
                                                    alert('この機能を使用するにはログインしてください');
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
                                                    alert('お気に入り更新中にエラーが発生しました');
                                                }
                                            }}
                                        >
                                            {isFavorite ? 'お気に入りを外す' : 'お気に入りに追加'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                            
                            {/* Mục 6: Map Area */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>地図上の場所</Typography>
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
                                                行き方
                                            </Button>
                                        </>
                                    ) : (
                                        <Typography align="center" sx={{ pt: 10 }} color="text.secondary">
                                            位置情報がありません
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Mục 9: Địa điểm liên quan */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>関連スポット</Typography>
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

                {/* Review Dialog */}
                <ReviewDialog 
                    open={openReviewDialog}
                    onClose={() => setOpenReviewDialog(false)}
                    placeId={id}
                    onReviewSuccess={() => {
                        // Reload reviews after successful submission
                        fetchReviews();
                    }}
                />
            </Container>
        </Box>
    );
};

export default PlaceDetail;
