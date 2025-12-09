import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../search/FilterSidebar'; // Import FilterSidebar

const RankingPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [filterState, setFilterState] = useState({});
  const [tempFilterState, setTempFilterState] = useState({});

  // Fetch ranking data
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Add filters từ filterState
        for (const key in filterState) {
          let value = filterState[key];
          if (Array.isArray(value)) {
            value = value.join(',');
          }
          if (value && value !== 'all') {
            params.append(key, value);
          }
        }

        params.append('page', page);
        params.append('limit', 4);
        params.append('sort_by', 'rating');

        // Dùng API search (lọc + sắp xếp)
        const response = await axios.get(
          `http://localhost:3000/api/places/search?${params.toString()}`
        );

        setPlaces(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ranking:', error);
        setLoading(false);
      }
    };

    fetchRanking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filterState, page]);

  const toggleFavorite = (placeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId);
    } else {
      newFavorites.add(placeId);
    }
    setFavorites(newFavorites);
  };

  const getSpotImageUrl = (place) => {
    if (place.images && Array.isArray(place.images) && place.images.length > 0) {
      const firstImage = place.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (typeof firstImage === 'object' && firstImage !== null) {
        return firstImage.url || firstImage.src || firstImage.path || null;
      }
    }
    return null;
  };

  if (loading && places.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" align="center">Đang tải dữ liệu...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3} justifyContent="center">
          {/* ① FilterSidebar */}
          <Grid item xs={12} md={4} sx={{mt:7}}>
            <FilterSidebar
              tempFilterState={tempFilterState}
              setTempFilterState={setTempFilterState}
              onApply={() => {
                setFilterState(tempFilterState);
                setPage(1);
              }}
              onReset={() => {
                setTempFilterState({});
                setFilterState({});
              }}
            />
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8} sx={{ width: '100%', maxWidth: '1000px' }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3, textAlign: 'center' }}>
              Xếp hạng địa điểm
            </Typography>

            {/* Ranking Items */}
            <Stack spacing={2}>
              {places.map((place, index) => {
                const imageUrl = getSpotImageUrl(place);
                const isFavorite = favorites.has(place._id);
                const rankingNumber = (page - 1) * 4 + index + 1;

                return (
                  <Paper
                    key={place._id}
                    sx={{
                      p: 2,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {/* Phần trái: Ranking Number + Image (căn giữa) */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {/* ④ Ranking Number */}
                      <Box
                        sx={{
                          minWidth: 60,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'white',
                          color: 'primary.main',
                          borderRight: '2px solid #ddd',
                          fontWeight: 700,
                          fontSize: '35px',
                        }}
                      >
                        {rankingNumber}
                      </Box>

                      {/* Image */}
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: '#e0e0e0',
                          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </Box>

                    {/* ⑤ Spot Card Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                            {place.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {place.address}
                          </Typography>
                        </Box>

                        {/* ⑥ Favorite Button */}
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(place._id)}
                          sx={{ color: isFavorite ? 'error.main' : 'action.disabled' }}
                        >
                          {isFavorite ? (
                            <FavoriteIcon />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </Box>

                      {/* Rating */}
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={600}>
                          {place.rating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({place.total_reviews} đánh giá)
                        </Typography>
                      </Stack>

                      {/* Description */}
                      {place.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {place.description}
                        </Typography>
                      )}

                      {/* Price */}
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'success.main' }}>
                        💰 {place.price_range}
                      </Typography>
                    </Box>

                    {/* ⑦ Detail Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/place/${place._id}`)}
                      sx={{ textTransform: 'none', minWidth: 120, alignSelf: 'flex-start' }}
                    >
                      Xem chi tiết
                    </Button>
                  </Paper>
                );
              })}
            </Stack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RankingPage;
