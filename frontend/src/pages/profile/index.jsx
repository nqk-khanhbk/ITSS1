import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Rating,
  Grid,
  Divider
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getCookie, deleteCookie } from '../../helpers/cookies.helper';
import {
  getFavoritePlaces,
  getFavoritePlans,
  removeFavoritePlace,
} from '../../services/favorite.services';
import { unlikeDayPlan } from '../../services/favorite.services';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'plans'
  const fullName = getCookie('fullName');
  const token = getCookie('token');

  // Initial state empty — sẽ được load từ backend trong useEffect
  const [favoriteSpots, setFavoriteSpots] = useState([]);

  const [favoritePlans, setFavoritePlans] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    // Load favorites (places paginated, plans not paginated)
    const userStr = getCookie('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      const user_id = user._id;

      (async () => {
        try {
          if (activeTab === 'favorites') {
            const respPlaces = await getFavoritePlaces(user_id, page, LIMIT);
            if (respPlaces && respPlaces.data) {
              const spots = respPlaces.data.map((f) => ({
                id: f.place_id || f.placeId || f.place_id,
                _id: f.place_id || f.placeId || f.place_id,
                name: f.name || '',
                address: f.address || '',
                rating: f.rating ? Number(f.rating) : 0,
                image: (f.images && f.images.length > 0 && (f.images[0].url || f.images[0])) ? (f.images[0].url || f.images[0]) : '/placeholder.jpg',
                reviews: f.total_reviews ? `${f.total_reviews} đánh giá` : '',
                rawFavoriteId: f.favorite_id || f.favoriteId || f.favorite_id
              }));
              setFavoriteSpots(spots.filter(Boolean));
              if (respPlaces.pagination) setTotalPages(respPlaces.pagination.totalPages || 1);
            } else {
              setFavoriteSpots([]);
              setTotalPages(1);
            }
          } else {
            const respPlans = await getFavoritePlans(user_id);
            if (respPlans && respPlans.data) {
              const plans = respPlans.data.map((p) => ({
                id: p.day_plan_id || p._id || p.id,
                name: p.title || p.name || (p.day_plan && p.day_plan.title) || 'Kế hoạch',
                address: '',
                rating: 0,
                image: (p.images && p.images.length > 0 && p.images[0].url) ? p.images[0].url : '/placeholder.jpg',
                reviews: '',
                raw: p
              }));
              setFavoritePlans(plans);
            } else {
              setFavoritePlans([]);
            }
          }
        } catch (err) {
          console.error('Load favorites error', err);
        }
      })();
    } catch (e) {
      console.warn('Invalid user cookie', e);
    }
  }, [token, activeTab, page]);

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('fullName');
    deleteCookie('user');
    navigate('/login');
  };

  const handleUnfavorite = (id, type) => {
    const userStr = getCookie('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const user_id = user._id;

    if (type === 'spot') {
      // Call backend to remove
      removeFavoritePlace(user_id, id)
        .then(() => {
          setFavoriteSpots((prev) => prev.filter((spot) => spot.id !== id && spot._id !== id));
        })
        .catch((err) => {
          console.error('Remove favorite error', err);
        });
    } else {
      // Call backend to unlike the day plan, then update UI
      unlikeDayPlan(user_id, id)
        .then(() => {
          setFavoritePlans((prev) => prev.filter((plan) => plan.id !== id));
        })
        .catch((err) => {
          console.error('Remove favorite plan error', err);
        });
    }
  };

  const handleViewDetail = (id, type) => {
    if (type === 'spot') {
      navigate(`/places/${id}`);
    } else {
      navigate(`/schedule/${id}`);
    }
  };

  // Compute visible pagination items according to rules:
  // - Always show page 1 and last page
  // - Show current page and its immediate neighbors
  // - Use ellipses where there's a gap
  const getVisiblePagination = (current, total) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pagesSet = new Set();
    pagesSet.add(1);
    pagesSet.add(total);
    pagesSet.add(current);
    if (current - 1 >= 2) pagesSet.add(current - 1);
    if (current + 1 <= total - 1) pagesSet.add(current + 1);

    const pages = Array.from(pagesSet).filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of pages) {
      if (prev && p - prev > 1) {
        result.push('ellipsis');
      }
      result.push(p);
      prev = p;
    }
    return result;
  };

  return (
    <>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 2 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Left Sidebar - 3 parts */}
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
                {/* Profile Section */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {fullName || 'User'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Menu List */}
                <List sx={{ flex:1}}>
                  <ListItem
                    button
                    selected={activeTab === 'favorites'}
                    onClick={() => setActiveTab('favorites')}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.light' }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <FavoriteIcon color={activeTab === 'favorites' ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText primary="お気に入りスト" />
                  </ListItem>

                  <ListItem
                    button
                    selected={activeTab === 'plans'}
                    onClick={() => setActiveTab('plans')}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.light' }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <EventIcon color={activeTab === 'plans' ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText primary="お気に入りプラン" />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Logout Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ mt: 2 }}
                >
                  ログアウト
                </Button>
              </Card>
            </Grid>

            {/* Right Content Area - 9 parts */}
            <Grid item xs={12} md={9} sx={{flex:1}}>
              <Grid container spacing={3} alignItems="stretch" alignContent="stretch">
                {(activeTab === 'favorites' ? favoriteSpots : favoritePlans).map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        width: { xs: '100%', sm: 320, md: 348 },
                        maxWidth: 348,
                        minHeight: 460,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      {/* Unfavorite Button */}
                      <IconButton
                        onClick={() => handleUnfavorite(item.id, activeTab === 'favorites' ? 'spot' : 'plan')}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'white',
                          zIndex: 1,
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <FavoriteIcon color="error" />
                      </IconButton>

                      {/* Image */}
                      <CardMedia
                        component="div"
                        sx={{
                          height: 180,
                          bgcolor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography color="text.secondary">画像</Typography>
                      </CardMedia>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                            sx={{
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              minHeight: '3rem'
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                            {item.address}
                          </Typography>

                          {/* Rating */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Rating value={item.rating} readOnly size="small" />
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {item.reviews}
                          </Typography>
                        </Box>

                        {/* Detail Button */}
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleViewDetail(item.id, activeTab === 'favorites' ? 'spot' : 'plan')}
                          sx={{ mt: 2 }}
                        >
                          詳細を見る
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination for favorites (places) */}
              {activeTab === 'favorites' && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="previous page"
                    >
                      <ChevronLeftIcon />
                    </IconButton>

                    {getVisiblePagination(page, totalPages).map((item, idx) =>
                      item === 'ellipsis' ? (
                        <Typography
                          key={`el-${idx}`}
                          sx={{ px: 1.25, color: 'text.secondary', userSelect: 'none' }}
                        >
                          &hellip;
                        </Typography>
                      ) : (
                        <Button
                          key={item}
                          size="small"
                          onClick={() => setPage(item)}
                          variant={item === page ? 'contained' : 'text'}
                          color={item === page ? 'primary' : 'inherit'}
                          sx={
                            item === page
                              ? {
                                  minWidth: 40,
                                  height: 36,
                                  borderRadius: 2,
                                  px: 1.5,
                                  bgcolor: 'primary.main',
                                  color: 'common.white',
                                  boxShadow: 3,
                                  '&:hover': { bgcolor: 'primary.dark' }
                                }
                              : {
                                  minWidth: 34,
                                  height: 32,
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'transparent' }
                                }
                          }
                        >
                          {item}
                        </Button>
                      )
                    )}

                    <IconButton
                      size="small"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-label="next page"
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Empty State */}
              {((activeTab === 'favorites' && favoriteSpots.length === 0) ||
                (activeTab === 'plans' && favoritePlans.length === 0)) && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: 'white',
                    borderRadius: 2
                  }}
                >
                  <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    お気に入りがまだありません
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default Profile;