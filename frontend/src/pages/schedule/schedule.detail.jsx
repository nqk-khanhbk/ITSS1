import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCookie } from '../../helpers/cookies.helper';
import { likeDayPlan, unlikeDayPlan, checkLikeDayPlan } from '../../services/favorite.services';

const API_BASE_URL = "http://localhost:3000/api";

// Mock data cho lịch trình - sẽ được thay thế bằng dữ liệu từ API
// const scheduleDataMock = {
//   id: 1,
//   title: "Tây Hồ で家族ピクニック一日プラン",
//   user: {
//     name: "Hà Thu",
//     avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60",
//   },
//   likes: 742,
//   isLiked: false,
//   overview: {
//     price: "100k-300k",
//     time: "8:00-17:00",
//     age: "Từ 4 tuổi trở lên"
//   },
//   timeline: [
//     {
//       id: 1,
//       type: "home", //bỏ luôn kiểu type;
//       name: "Nhà",
//       time: "9:00",
//       icon: "home",
//     },
//     {
//       id: 2,
//       type: "location",
//       name: "Công viên nước Hồ Tây",
//       time: "10:00",
//       duration: "1 giờ",
//       transport: "walk",
//       image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
//       openingHours: "9:00 - 18:00",
//       estimatedCost: "100.000đ - 200.000đ",
//       description: "Công viên nước với nhiều trò chơi phù hợp cho gia đình. Không gian rộng rãi, thoáng mát.",
//       note: "Nên mang theo đồ bơi và kem chống nắng. Cuối tuần thường đông người.",
//       hasWarning: true,
//     },
//     {
//       id: 3,
//       type: "location",
//       name: "Công viên nước Hồ Tây",
//       time: "12:00",
//       duration: "2 giờ",
//       transport: "walk",
//       image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
//       openingHours: "11:00 - 22:00",
//       estimatedCost: "150.000đ - 300.000đ",
//       description: "Nhà hàng buffet với nhiều món ăn đa dạng, view nhìn ra Hồ Tây tuyệt đẹp.",
//       note: "Nên đặt bàn trước. Giá buffet trẻ em có ưu đãi.",
//       hasWarning: true,
//     },
//     {
//       id: 4,
//       type: "location",
//       name: "Công viên nước Hồ Tây",
//       time: "14:00",
//       duration: "1.5 giờ",
//       transport: "bike",
//       image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
//       openingHours: "24/7",
//       estimatedCost: "Miễn phí",
//       description: "Công viên xanh mát, yên tĩnh với nhiều khu vui chơi cho trẻ em.",
//       note: "Có thể thuê xe đạp đôi. Thích hợp chụp ảnh vào buổi chiều.",
//       hasWarning: true,
//     },
//     {
//       id: 5,
//       type: "location",
//       name: "Công viên nước Hồ Tây",
//       time: "16:00",
//       duration: "1 giờ",
//       transport: "car",
//       image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800",
//       openingHours: "7:00 - 23:00",
//       estimatedCost: "50.000đ - 100.000đ",
//       description: "Quán cà phê view Hồ Tây lãng mạn, phù hợp nghỉ ngơi cuối ngày.",
//       note: "Có khu vui chơi nhỏ cho trẻ em. Menu đồ uống đa dạng.",
//       hasWarning: false,
//     },
//   ],
//   warnings: [
//     {
//       location: "Công viên nước Hồ Tây",
//       note: "Nên mang theo đồ bơi và kem chống nắng",
//     },
//     {
//       location: "Công viên nước Hồ Tây",
//       note: "Nên đặt bàn trước để có chỗ ngồi đẹp",
//     },
//   ],
// };

// Component cho một điểm trên timeline
function TimelineCard({ location, onToggleDescription, onToggleNote, expandedDesc, expandedNote }) {
  return (
    <Card 
      sx={{ 
        display: 'flex',
        mb: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* Thumbnail Image */}
      <CardMedia
        component="img"
        sx={{ width: 160, height: '100%', objectFit: "cover" }}
        image={location.image}
        alt={location.name}
      />

      {/* Warning Badge */}
      {location.hasWarning && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "#ff9800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
            zIndex: 2
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>!</Typography>
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ flex: 1, p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Title and Button */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              {location.name}
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ textTransform: "none", minWidth: 80 }}
            >
              表示
            </Button>
          </Stack>

          {/* Start Time, End Time and Cost */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {location.startTime && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`${location.startTime} - ${location.endTime || ''}`}
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              icon={<AttachMoneyIcon />}
              label={location.estimatedCost}
              size="small"
              variant="outlined"
              color="success"
            />
          </Stack>

          {/* Description Section */}
          <Box>
            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                p: 0.5,
                borderRadius: 1
              }}
              onClick={() => onToggleDescription(location.id)}
            >
              <Typography variant="body2" fontWeight={600}>
                説明
              </Typography>
              <IconButton size="small">
                {expandedDesc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={expandedDesc}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, pl: 0.5 }}>
                {location.description}
              </Typography>
            </Collapse>
          </Box>

          {/* Note Section */}
          {location.note && (
            <Box>
              <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  p: 0.5,
                  borderRadius: 1
                }}
                onClick={() => onToggleNote(location.id)}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <WarningAmberIcon fontSize="small" color="warning" />
                  <Typography variant="body2" fontWeight={600}>
                    注意
                  </Typography>
                </Stack>
                <IconButton size="small">
                  {expandedNote ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>
              <Collapse in={expandedNote}>
                <Typography variant="body2" color="warning.main" sx={{ mt: 1, pl: 0.5 }}>
                  {location.note}
                </Typography>
              </Collapse>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ScheduleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [expandedNote, setExpandedNote] = useState({});
  const [relatedPlaces, setRelatedPlaces] = useState([]);

  // Fetch schedule data from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/day-plans/${id}`);
        
        if (response.data && response.data.data) {
          const rawData = response.data.data;
          
          // Transform API response to match component's expected structure
          const transformedData = {
            id: rawData._id,
            title: rawData.title,
            user: {
              name: "User", // Will be populated from user_id if needed
              avatar: "",
            },
            overview: {
              price: calculateTotalPriceRange(rawData.items),
              time: getTimeRange(rawData.items),
              age: rawData.target_age || "Mọi lứa tuổi",
              locations: rawData.items.length,
              note: rawData.note || ""
            },
            timeline: rawData.items.map((item, index) => ({
              id: item._id,
              type: "location",
              name: item.custom_place_name || "Địa điểm",
              time: item.start_time,
              startTime: item.start_time,
              endTime: item.end_time,
              duration: calculateDuration(item.start_time, item.end_time),
              transport: mapTransport(item.transport),
              transportText: item.transport || "",
              image: item.image || "https://via.placeholder.com/800",
              openingHours: "N/A",
              estimatedCost: formatPriceRange(item.price_range),
              description: item.description || "",
              note: item.caution || "",
              hasWarning: !!item.caution,
            })),
            warnings: rawData.items
              .filter(item => item.caution)
              .map(item => ({
                location: item.custom_place_name || "Địa điểm",
                note: item.caution
              }))
          };
          
          setScheduleData(transformedData);
          
          // Fetch related places
          const placeIds = rawData.items
            .map(item => item.place_id)
            .filter(placeId => placeId); // Filter out null/undefined
          
          if (placeIds.length > 0) {
            try {
              const placesPromises = placeIds.map(placeId => 
                axios.get(`${API_BASE_URL}/places/${placeId}`)
              );
              const placesResponses = await Promise.all(placesPromises);
              const places = placesResponses
                .map(res => res.data?.data)
                .filter(place => place) // Filter out failed requests
                .map(place => ({
                  id: place._id,
                  name: place.name,
                  image: place.images?.[0]?.url || "https://via.placeholder.com/300",
                  category: place.category_id?.name || "Địa điểm"
                }));
              setRelatedPlaces(places);
            } catch (err) {
              console.error('Error fetching related places:', err);
            }
          }
          
          // Check like status if user logged in
          try {
            const userStr = getCookie('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              const chk = await checkLikeDayPlan(user._id, id);
              if (chk && chk.data && typeof chk.data.is_liked !== 'undefined') {
                setLiked(!!chk.data.is_liked);
                if (typeof chk.data.total_likes === 'number') setLikesCount(chk.data.total_likes);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchScheduleData();
    }
  }, [id]);

  // Helper functions for data transformation
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;

    if (diffMinutes <= 0) return "";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0) return `${minutes} phút`;
    if (minutes === 0) return `${hours} giờ`;
    return `${hours} giờ ${minutes} phút`;
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange || (!priceRange.min && !priceRange.max)) return "Miễn phí";
    if (priceRange.min === priceRange.max || !priceRange.max) {
      return `${priceRange.min.toLocaleString()}đ`;
    }
    return `${priceRange.min.toLocaleString()}đ - ${priceRange.max.toLocaleString()}đ`;
  };

  const calculateTotalPriceRange = (items) => {
    if (!items || items.length === 0) return "Miễn phí";
    let totalMin = 0;
    let totalMax = 0;
    items.forEach(item => {
      if (item.price_range) {
        totalMin += item.price_range.min || 0;
        totalMax += item.price_range.max || item.price_range.min || 0;
      }
    });
    if (totalMin === 0 && totalMax === 0) return "Miễn phí";
    if (totalMin === totalMax) return `${totalMin.toLocaleString()}đ`;
    return `${totalMin.toLocaleString()}đ - ${totalMax.toLocaleString()}đ`;
  };

  const getTimeRange = (items) => {
    if (!items || items.length === 0) return "-";
    const firstTime = items[0]?.start_time;
    const lastTime = items[items.length - 1]?.end_time;
    if (!firstTime || !lastTime) return "-";
    return `${firstTime} - ${lastTime}`;
  };

  const mapTransport = (transport) => {
    const transportMap = {
      "Ô tô": "car",
      "Xe máy": "bike",
      "Đi bộ": "walk",
      "Xe bus": "bus",
      "Xe đạp": "bike"
    };
    return transportMap[transport] || "walk";
  };

  const handleToggleDescription = (id) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleNote = (id) => {
    setExpandedNote((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTransportIcon = (transport) => {
    switch (transport) {
      case "walk":
        return <DirectionsWalkIcon sx={{ color: "#333", fontSize: 24 }} />;
      case "bus":
        return <DirectionsBusIcon sx={{ color: "#333", fontSize: 24 }} />;
      case "bike":
        return <DirectionsBikeIcon sx={{ color: "#333", fontSize: 24 }} />;
      case "car":
        return <DirectionsCarIcon sx={{ color: "#333", fontSize: 24 }} />;
      default:
        return <DirectionsWalkIcon sx={{ color: "#333", fontSize: 24 }} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error || !scheduleData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || "Không tìm thấy lịch trình"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/schedule")}
            sx={{ mt: 2 }}
          >
            Quay lại
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate("/schedule")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              {scheduleData.title}
            </Typography>
          </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      onClick={async () => {
                        const userStr = getCookie('user');
                        if (!userStr) {
                          return navigate('/login');
                        }
                        const user = JSON.parse(userStr);
                        try {
                          if (liked) {
                            await unlikeDayPlan(user._id, id);
                            setLiked(false);
                            setLikesCount((c) => Math.max(0, c - 1));
                          } else {
                            await likeDayPlan(user._id, id);
                            setLiked(true);
                            setLikesCount((c) => c + 1);
                          }
                        } catch (err) {
                          console.error('Like toggle error', err);
                        }
                      }}
                      sx={{ color: liked ? "#f44336" : "inherit" }}
                    >
                      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">{likesCount}</Typography>
                  </Stack>
        </Stack>

        {/* Horizontal Timeline Overview */}
        <Paper
          sx={{
            mb: 2,
            p: 3,
            overflowX: "auto",
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              minWidth: "max-content",
              height: 180,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Horizontal Line */}
            <Box
              sx={{
                position: "absolute",
                left: 60,
                right: 60,
                top: "50%",
                height: 2,
                bgcolor: "#333",
                zIndex: 0,
              }}
            />

            {/* Container for all points */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                px: 2,
              }}
            >
              {/* Start Point - Home */}
              <Stack alignItems="center" spacing={0.5} sx={{ zIndex: 1, minWidth: 80 }}>
                <HomeIcon sx={{ fontSize: 40, color: "#333" }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: "#333", fontSize: "0.75rem" }}>
                  自宅
                </Typography>
              </Stack>

              {/* All timeline items with transport text between */}
              {scheduleData.timeline.map((item, index) => {
                const isAbove = index % 2 === 0;
                
                return (
                  <React.Fragment key={item.id}>
                    {/* Transport Text before location point */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: isAbove ? "flex-start" : "flex-end",
                        justifyContent: "center",
                        minWidth: 100,
                        position: "relative",
                      }}
                    >
                      <Stack 
                        alignItems="center" 
                        spacing={0.3} 
                        sx={{ 
                          mt: isAbove ? 1 : 0,
                          mb: isAbove ? 0 : 1,
                        }}
                      >
                        {/* Transport Icon */}
                        <Box sx={{ order: isAbove ? 2 : 1 }}>
                          {getTransportIcon(item.transport)}
                        </Box>
                        {/* Transport Text */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#333",
                            fontSize: "0.65rem",
                            order: isAbove ? 1 : 2,
                          }}
                        >
                          {item.transportText}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Location Point */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 1,
                        position: "relative",
                        minWidth: 120,
                      }}
                    >
                      <Stack
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          top: isAbove ? "-80px" : "20px",
                          minWidth: 120,
                        }}
                      >
                        {/* Time - positioned based on location */}
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            color: "#333",
                            fontSize: "0.75rem",
                            order: isAbove ? 1 : 2,
                          }}
                        >
                          {item.time}
                        </Typography>

                        {/* Location Icon with optional warning */}
                        <Tooltip title={item.note || ""} arrow placement="top">
                          <Box
                            sx={{
                              position: "relative",
                              cursor: item.note ? "pointer" : "default",
                              order: isAbove ? 2 : 1,
                            }}
                          >
                            <LocationOnIcon
                              sx={{
                                fontSize: 40,
                                color: "#333",
                              }}
                            />
                            {item.hasWarning && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  right: -6,
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  bgcolor: "#333",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "2px solid #fff",
                                }}
                              >
                                <Typography sx={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>!</Typography>
                              </Box>
                            )}
                          </Box>
                        </Tooltip>

                        {/* Location Name */}
                        <Typography
                          variant="caption"
                          align="center"
                          sx={{
                            maxWidth: 120,
                            fontSize: "0.7rem",
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                            color: "#333",
                            order: 3,
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Stack>

                      {/* Dot on the line */}
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#333",
                          border: "2px solid #fff",
                        }}
                      />
                    </Box>
                  </React.Fragment>
                );
              })}

              {/* End Point - Home */}
              <Stack alignItems="center" spacing={0.5} sx={{ zIndex: 1, minWidth: 80 }}>
                <HomeIcon sx={{ fontSize: 40, color: "#333" }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: "#333", fontSize: "0.75rem" }}>
                  帰宅
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* User info */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar src={scheduleData.user.avatar} sx={{ width: 48, height: 48 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {scheduleData.user.name}
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {/* Timeline */}
          <Grid item xs={12} md={9} sx={{ flex: 1 }}>
            <Box>
              {/* Start Point - Home */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Stack alignItems="center" sx={{ minWidth: 80 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      bgcolor: "#4caf50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(76,175,80,0.3)",
                    }}
                  >
                    <HomeIcon sx={{ color: "#fff", fontSize: 28 }} />
                  </Box>
                </Stack>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Paper sx={{ px: 3, py: 1.5, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body1" fontWeight={600}>
                      出発 (自宅)
                    </Typography>
                  </Paper>
                </Box>
              </Stack>

              {/* Timeline Items */}
              {scheduleData.timeline.map((item, index) => (
                <Box key={item.id} sx={{ position: "relative" }}>
                  {/* Vertical line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 24,
                      top: 0,
                      bottom: index === scheduleData.timeline.length - 1 ? '50%' : 0,
                      width: 2,
                      bgcolor: "#ddd",
                      zIndex: 0,
                    }}
                  />

                  {/* Transport Info */}
                  {item.transport && (
                    <Stack 
                      direction="row" 
                      spacing={2} 
                      sx={{ mb: 2, pl: '90px' }}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#fff",
                          border: "2px solid #e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: 'absolute',
                          left: 5,
                          zIndex: 1,
                        }}
                      >
                        {getTransportIcon(item.transport)}
                      </Box>
                    </Stack>
                  )}

                  {/* Location Point and Card */}
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    {/* Location Icon */}
                    <Stack alignItems="center" sx={{ minWidth: 80 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          bgcolor: "#fff",
                          border: "3px solid #1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                          position: 'relative',
                        }}
                      >
                        <LocationOnIcon sx={{ color: "#1976d2", fontSize: 28 }} />
                        {/* Location Number Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: '#1976d2',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            border: '2px solid #fff'
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Box>
                    </Stack>

                    {/* Time and Location Card */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#1976d2' }}>
                        {item.time}
                      </Typography>
                      <TimelineCard
                        location={item}
                        onToggleDescription={handleToggleDescription}
                        onToggleNote={handleToggleNote}
                        expandedDesc={expandedDesc[item.id]}
                        expandedNote={expandedNote[item.id]}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}

              {/* End Point - Home */}
              <Stack direction="row" spacing={2}>
                <Stack alignItems="center" sx={{ minWidth: 80 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      bgcolor: "#f44336",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(244,67,54,0.3)",
                    }}
                  >
                    <HomeIcon sx={{ color: "#fff", fontSize: 28 }} />
                  </Box>
                </Stack>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Paper sx={{ px: 3, py: 1.5, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body1" fontWeight={600}>
                      帰宅
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Box>
          </Grid>
          {/* Cột phải - Thông tin & Bản đồ */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              {/* Tổng quan */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Tổng quan
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AttachMoneyIcon color="action" />
                    <Typography variant="body2">
                      {scheduleData.overview.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupIcon color="action" />
                    <Typography variant="body2">
                      {scheduleData.overview.age}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon color="action" />
                    <Typography variant="body2">
                      {scheduleData.overview.time}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon color="action" />
                    <Typography variant="body2">
                      {scheduleData.overview.locations}場所
                    </Typography>
                  </Stack>
                  {scheduleData.overview.note && (
                    <>
                      <Divider />
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <WarningAmberIcon color="warning" fontSize="small" sx={{ mt: 0.3 }} />
                        <Typography variant="body2">
                          {scheduleData.overview.note}
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* Danh sách chú ý */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Lưu ý
                </Typography>
                <Stack spacing={1.5}>
                  {scheduleData.warnings.map((warning, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <WarningAmberIcon color="warning" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {warning.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {warning.note}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>

              {/* Bản đồ */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Bản đồ
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 250,
                    bgcolor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">Bản đồ</Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>


        </Grid>

        {/* Related Places Section */}
        {relatedPlaces.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              関連する場所
            </Typography>
            <Grid container spacing={3}>
              {relatedPlaces.map((place) => (
                <Grid item xs={12} sm={6} md={3} key={place.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => navigate(`/places/${place.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={place.image}
                      alt={place.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {place.category}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {place.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ScheduleDetail;