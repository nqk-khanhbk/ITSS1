// src/pages/SearchResultPage.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Box, Container, Typography, Pagination, TextField, Button, Paper, Stack, IconButton } from '@mui/material';
import SpotCard from '../../components/spot-card';
import FilterSidebar from './FilterSidebar';
import SearchInputSidebar from '../../components/filter-sidebar/SearchInputSidebar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';

const SearchResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlKeyword = searchParams.get('keyword'); // Lấy keyword từ URL
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [filterState, setFilterState] = useState({});
    const [tempFilterState, setTempFilterState] = useState({});



    useEffect(() => {
        const fetchSpots = async () => {
            setLoading(true);
            try {
                const API_URL = 'http://localhost:3000/api/places/search';

                // BƯỚC 1: Tạo URLSearchParams mới
                const params = new URLSearchParams();

                // BƯỚC 2: Thêm Keyword từ URL
                if (urlKeyword && urlKeyword.trim()) {
                    params.append('keyword', urlKeyword.trim());
                }

                // BƯỚC 3: Thêm các bộ lọc khác từ filterState (age, price,...)
                for (const key in filterState) {
                    let value = filterState[key];
                    if (Array.isArray(value)) {
                      value = value.join(','); // chuyển mảng thành chuỗi phân cách bởi dấu phẩy
                    }
                    if (value && value.trim() && value !== 'all') {
                        params.append(key, value.trim());
                    }
                }

                params.append('page', page);
                params.append('limit', 6);


                // BƯỚC 4: Xây dựng URL cuối cùng
                const queryString = params.toString();
                const apiUrlWithQuery = `${API_URL}${queryString ? '?' + queryString : ''}`;

                console.log("URL truy vấn hợp nhất:", apiUrlWithQuery);

                const response = await axios.get(apiUrlWithQuery);
                setSpots(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalResults(response.data.pagination.total);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setLoading(false);
            }
        };

        // useEffect chạy lại khi URL params (bao gồm keyword) thay đổi HOẶC filterState thay đổi
        fetchSpots();
    }, [urlKeyword, filterState, page]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Typography variant="h5" align="center">読み込み中...</Typography>
            </Container>
        );
    }

    const getCenterCoordinates = () => {
        // Nếu có điểm, lấy tọa độ điểm đầu tiên làm trung tâm, nếu không, dùng Hà Nội
        if (spots.length > 0) {
            const coords = spots[0].location.coordinates;
            // Lưu ý: MongoDB lưu [Lng, Lat], Leaflet dùng [Lat, Lng]
            return [coords[1], coords[0]];
        }
        return [21.0285, 105.8542]; // Tọa độ Hà Nội
    };

    const getSpotImageUrl = (spot) => {
        if (spot.thumbnail) return spot.thumbnail;
        if (Array.isArray(spot.images) && spot.images.length > 0) {
            const firstImage = spot.images[0];
            if (typeof firstImage === 'string') return firstImage;
            if (typeof firstImage === 'object' && firstImage !== null) {
                return firstImage.url || firstImage.src || firstImage.path || null;
            }
        }
        return null;
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 3 }}>
            <Container maxWidth="xl" sx={{ mt: 0 }}>
                <Grid container spacing={3}>

                    {/* Cột 1: Sidebar Filter (MD: 3) */}
                    <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                        <Stack spacing={3} sx={{ width: "100%", height: "100%" }}>
                            {/* 1. THANH TÌM KIẾM KEYWORD MỚI */}
                            <SearchInputSidebar />

                            {/* 2. BỘ LỌC CHÍNH */}
                            <FilterSidebar
                                tempFilterState={tempFilterState}
                                setTempFilterState={setTempFilterState}
                                onApply={() => setFilterState(tempFilterState)}
                                onReset={() => {
                                    setTempFilterState({});
                                    setFilterState({});
                                }}
                            />

                        </Stack>
                    </Grid>

                    {/* Cột 2: Kết quả tìm kiếm (MD: 9) */}
                    <Grid item xs={12} md={9} sx={{ flex: 1 }}>
                        <Paper sx={{ p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>

                            {/* Tiêu đề và List/Map Toggle */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="body1" color="textSecondary" fontWeight={600}>
                                    {totalResults}件のスポットを表示
                                </Typography>

                                {/* Cập nhật nút LIST/MAP để quản lý state viewMode */}
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant={viewMode === 'list' ? 'contained' : 'outlined'}
                                        onClick={() => setViewMode('list')}
                                        sx={{ textTransform: 'none', minWidth: 80 }}
                                    >
                                        LIST
                                    </Button>
                                    <Button
                                        variant={viewMode === 'map' ? 'contained' : 'outlined'}
                                        onClick={() => setViewMode('map')}
                                        sx={{ textTransform: 'none', minWidth: 80 }}
                                    >
                                        MAP
                                    </Button>
                                </Stack>
                            </Box>

                            {/* HIỂN THỊ KẾT QUẢ TÙY THEO viewMode */}
                            {viewMode === 'list' ? (
                                /* Giao diện LIST VIEW (Card View) */
                                <Grid container spacing={3}>
                                    {spots.map((spot) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            key={spot.id}
                                            // Đặt align-items: "stretch" để đảm bảo các thẻ cao bằng nhau
                                            sx={{ display: "flex", alignItems: "stretch" }}
                                        >
                                            <SpotCard spot={spot} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ height: 500, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                    <MapContainer
                                        center={getCenterCoordinates()}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        />

                                        {/* Markers */}
                                        {spots.map((spot) => {
                                            const coords = spot.location?.coordinates;
                                            if (!coords) return null;
                                            const position = [coords[1], coords[0]]; // [Lat, Lng]
                                            const imageUrl = getSpotImageUrl(spot);

                                            return (
                                                <Marker position={position} key={spot._id}>
                                                    <Popup>
                                                        <Stack direction="row" spacing={1} sx={{ minWidth: 250, p: 0.5 }}>
                                                            {/* Phần ảnh bên trái */}
                                                            <Box
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    flexShrink: 0, // Không co lại
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden',
                                                                    bgcolor: '#e0e0e0', // Màu nền placeholder
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center',
                                                                }}
                                                            >
                                                                {/* Nếu không có ảnh, hiển thị placeholder text */}
                                                                {!imageUrl && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        画像なし
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {/* Phần thông tin bên phải */}
                                                            <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                                                                {/* Tên Địa điểm và Icon Trái tim */}
                                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        fontWeight={700}
                                                                        sx={{ color: 'primary.main', lineHeight: 1.2, flexGrow: 1 }}
                                                                    >
                                                                        {spot.name}
                                                                    </Typography>
                                                                    <IconButton size="small" sx={{ p: 0.5 }}>
                                                                        <FavoriteBorderIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Stack>

                                                                {/* Rating (Nếu có) */}
                                                                {spot.rating > 0 && (
                                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                        <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {spot.rating}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            ({spot.total_reviews} 件のレビュー)
                                                                        </Typography>
                                                                    </Stack>
                                                                )}

                                                                {/* Mô tả */}
                                                                {spot.description && (
                                                                    <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display: 'block',
                                                                        lineHeight: 1.4,
                                                                        maxHeight: 40,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}
                                                                    >
                                                                    {spot.description.length > 60
                                                                        ? spot.description.slice(0, 60) + '...'
                                                                        : spot.description}
                                                                    </Typography>
                                                                )}

                                                                {/* Giá */}
                                                                <Typography variant="body2" color="text.secondary">
                                                                    💰 {spot.price_range}
                                                                </Typography>

                                                                {/* Nút Chi tiết */}
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => navigate(`/places/${spot._id}`)}
                                                                    sx={{ mt: 1, textTransform: 'none' }}
                                                                >
                                                                    詳細を見る
                                                                </Button>
                                                            </Stack>
                                                        </Stack>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>
                                </Box>
                            )}


                            {/* Pagination (Chỉ hiển thị trong List View) */}
                            {viewMode === 'list' && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pb: 2 }}>
                                    <Pagination count={totalPages} color="primary" page={page} onChange={(event, value) => setPage(value)} />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default SearchResultPage;
