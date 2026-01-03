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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component cho một điểm trên timeline (giao diện cũ)
function TimelineCard({ location, onToggleDescription, onToggleNote, expandedDesc, expandedNote, navigate }) {
  const timeLabel = location.startTime
    ? `${location.startTime}${location.endTime ? ` - ${location.endTime}` : ''}`
    : location.time || "時間未設定";

  return (
    <Card sx={{ mb: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={location.image}
          alt={location.name}
          sx={{ objectFit: "cover" }}
        />
        {location.hasWarning && (
          <Chip
            icon={<WarningAmberIcon />}
            label="注意"
            size="small"
            color="warning"
            sx={{ position: "absolute", top: 8, right: 8 }}
          />
        )}
      </Box>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={600}>
            {location.name}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<AccessTimeIcon />}
              label={timeLabel}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<AttachMoneyIcon />}
              label={location.estimatedCost}
              size="small"
              variant="outlined"
              color="success"
            />
          </Stack>

          {/* 説明 */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                説明
              </Typography>
              <IconButton size="small" onClick={() => onToggleDescription(location.id)}>
                {expandedDesc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={expandedDesc}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {location.description || "説明はありません"}
              </Typography>
            </Collapse>
          </Box>

          {/* 注意事項 */}
          {location.note && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <WarningAmberIcon fontSize="small" color="warning" />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    注意事項
                  </Typography>
                </Stack>
                <IconButton size="small" onClick={() => onToggleNote(location.id)}>
                  {expandedNote ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>
              <Collapse in={expandedNote}>
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  {location.note}
                </Typography>
              </Collapse>
            </Box>
          )}

          <Button
            variant="contained"
            size="small"
            sx={{ alignSelf: "flex-start", textTransform: "none" }}
            onClick={() => location.placeId && navigate(`/places/${location.placeId}`)}
          >
            詳細を見る
          </Button>
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
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Default: Hanoi
  const [mapZoom, setMapZoom] = useState(13);

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
              age: rawData.target_age || "すべての年齢",
              locations: rawData.items.length,
              note: rawData.note || ""
            },
            timeline: rawData.items.map((item, index) => ({
              id: item._id,
              type: "location",
              name: item.custom_place_name || "スポット",
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
              placeId: item.place_id, // Add place_id for navigation
            })),
            warnings: rawData.items
              .filter(item => item.caution)
              .map(item => ({
                location: item.custom_place_name || "スポット",
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
                .filter(place => place); // Filter out failed requests

              // Calculate age range intersection
              let ageRangeText = rawData.target_age || "すべての年齢";
              if (places.length > 0) {
                const ageRanges = places
                  .filter(place => place.age_limit && place.age_limit.min !== undefined && place.age_limit.max !== undefined)
                  .map(place => place.age_limit);

                if (ageRanges.length > 0) {
                  // Find intersection of all age ranges
                  const minAge = Math.max(...ageRanges.map(range => range.min));
                  const maxAge = Math.min(...ageRanges.map(range => range.max));

                  if (minAge <= maxAge) {
                    if (minAge === 0 && maxAge >= 100) {
                      ageRangeText = "すべての年齢";
                    } else if (minAge === maxAge) {
                      ageRangeText = `${minAge}歳`;
                    } else {
                      ageRangeText = `${minAge}歳 - ${maxAge}歳`;
                    }
                  } else {
                    ageRangeText = "共通の年齢範囲がありません";
                  }
                }
              }

              // Update transformedData with calculated age range
              transformedData.overview.age = ageRangeText;
              setScheduleData(transformedData);

              // Set related places for display with coordinates
              const relatedPlacesData = places.map(place => ({
                id: place._id,
                name: place.name,
                image: place.images?.[0]?.url || "https://via.placeholder.com/300",
                category: place.category_id?.name || "スポット",
                location: place.location // Include location coordinates
              }));
              setRelatedPlaces(relatedPlacesData);

              // Calculate map center from places with valid coordinates
              const placesWithCoords = relatedPlacesData.filter(
                place => place.location?.coordinates &&
                  Array.isArray(place.location.coordinates) &&
                  place.location.coordinates.length === 2
              );

              if (placesWithCoords.length > 0) {
                const avgLat = placesWithCoords.reduce((sum, place) =>
                  sum + place.location.coordinates[1], 0) / placesWithCoords.length;
                const avgLng = placesWithCoords.reduce((sum, place) =>
                  sum + place.location.coordinates[0], 0) / placesWithCoords.length;
                setMapCenter([avgLat, avgLng]);

                // Adjust zoom based on spread of locations
                if (placesWithCoords.length === 1) {
                  setMapZoom(15);
                } else {
                  setMapZoom(13);
                }
              }
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
        setError(err.message || "データを読み込めませんでした");
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

    if (hours === 0) return `${minutes}分`;
    if (minutes === 0) return `${hours}時間`;
    return `${hours}時間${minutes}分`;
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange || (!priceRange.min && !priceRange.max)) return "無料";
    if (priceRange.min === priceRange.max || !priceRange.max) {
      return `${priceRange.min.toLocaleString()}đ`;
    }
    return `${priceRange.min.toLocaleString()}đ - ${priceRange.max.toLocaleString()}đ`;
  };

  const calculateTotalPriceRange = (items) => {
    if (!items || items.length === 0) return "無料";
    let totalMin = 0;
    let totalMax = 0;
    items.forEach(item => {
      if (item.price_range) {
        totalMin += item.price_range.min || 0;
        totalMax += item.price_range.max || item.price_range.min || 0;
      }
    });
    if (totalMin === 0 && totalMax === 0) return "無料";
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
      "Xe đạp": "bike",
      "Grab": "bike",
      "Taxi": "car"
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
            {error || "スケジュールが見つかりません"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/schedule")}
            sx={{ mt: 2 }}
          >
            戻る
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

        {/* Timeline Overview (giao diện cũ) */}
        <Paper
          sx={{
            mb: 3,
            p: 2,
            overflowX: "auto",
            bgcolor: "#ddd",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0}
            sx={{
              minWidth: "max-content",
              position: "relative",
            }}
          >
            {scheduleData.timeline.map((item, index) => (
              <Box key={item.id} sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                {/* Location Item */}
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 120, px: 1 }}>
                  {/* Icon */}
                  <Tooltip title={item.note || ""} arrow placement="top">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        border: "3px solid #1976d2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        cursor: item.note ? "pointer" : "default",
                        "&:hover": {
                          transform: item.note ? "scale(1.05)" : "none",
                          transition: "transform 0.2s",
                        },
                      }}
                    >
                      <LocationOnIcon sx={{ color: "#1976d2", fontSize: 26 }} />
                      {item.hasWarning && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: "#ff9800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #fff",
                          }}
                        >
                          <WarningAmberIcon sx={{ fontSize: 12, color: "#fff" }} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>

                  {/* Time */}
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#1976d2" }}>
                    {item.time}
                  </Typography>

                  {/* Name */}
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      maxWidth: 100,
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.name}
                  </Typography>
                </Stack>

                {/* Transport Arrow */}
                {index < scheduleData.timeline.length - 1 && (
                  <Stack alignItems="center" spacing={0.5} sx={{ mx: 2 }}>
                    {/* Transport Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getTransportIcon(scheduleData.timeline[index + 1].transport)}
                    </Box>

                    {/* Duration */}
                    {scheduleData.timeline[index + 1].duration && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                        {scheduleData.timeline[index + 1].duration}
                      </Typography>
                    )}

                    {/* Arrow Line */}
                    <Box
                      sx={{
                        width: 120,
                        height: 2,
                        bgcolor: "#1976d2",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          right: -6,
                          top: -4,
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid #1976d2",
                          borderTop: "5px solid transparent",
                          borderBottom: "5px solid transparent",
                        },
                      }}
                    />
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
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
          <Grid item xs={12} md={8} sx={{ flex: 2 }}>
            <Box>
              {/* Timeline Items (giao diện cũ) */}
              {scheduleData.timeline.map((item, index) => (
                <Box key={item.id} sx={{ position: "relative" }}>
                  {/* Timeline line */}
                  {index < scheduleData.timeline.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 20,
                        top: 50,
                        bottom: -20,
                        width: 2,
                        bgcolor: "#ddd",
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Transport icon between locations */}
                  {index < scheduleData.timeline.length - 1 && scheduleData.timeline[index + 1].transport && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#e3f2fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getTransportIcon(scheduleData.timeline[index + 1].transport)}
                      </Box>
                      {scheduleData.timeline[index + 1].duration && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: "0.65rem",
                            whiteSpace: "nowrap",
                            bgcolor: "rgba(255,255,255,0.9)",
                            px: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          {scheduleData.timeline[index + 1].duration}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    {/* Time & Icon */}
                    <Stack alignItems="center" sx={{ minWidth: 80 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {item.time}
                      </Typography>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#fff",
                          border: "2px solid #1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                        }}
                      >
                        <LocationOnIcon sx={{ color: "#1976d2" }} />
                      </Box>
                    </Stack>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      {/* Transport info - hiển thị trước TimelineCard */}
                      {item.transport && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          sx={{
                            mb: 2,
                            p: 1.5,
                            bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                            border: "1px solid rgba(25, 118, 210, 0.2)",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            {getTransportIcon(item.transport)}
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: "#1565c0" }}
                          >
                            {item.transportText || item.transport}
                          </Typography>
                          {item.duration && (
                            <Chip
                              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                              label={item.duration}
                              size="small"
                              sx={{
                                bgcolor: "#fff",
                                color: "#1976d2",
                                fontWeight: 500,
                                "& .MuiChip-icon": {
                                  color: "#1976d2",
                                },
                              }}
                            />
                          )}
                        </Stack>
                      )}
                      <TimelineCard
                        location={item}
                        onToggleDescription={handleToggleDescription}
                        onToggleNote={handleToggleNote}
                        expandedDesc={expandedDesc[item.id]}
                        expandedNote={expandedNote[item.id]}
                        navigate={navigate}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
          {/* Cột phải - Thông tin & Bản đồ */}
          <Grid item xs={12} md={4} sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Tổng quan */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  概要
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
                  注意
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
                  地図
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    borderRadius: 2,
                    overflow: "hidden",
                    "& .leaflet-container": {
                      height: "100%",
                      width: "100%",
                      borderRadius: 2,
                    }
                  }}
                >
                  {relatedPlaces.length > 0 ? (
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {relatedPlaces
                        .filter(place =>
                          place.location?.coordinates &&
                          Array.isArray(place.location.coordinates) &&
                          place.location.coordinates.length === 2
                        )
                        .map((place, index) => (
                          <Marker
                            key={place.id}
                            position={[
                              place.location.coordinates[1], // latitude
                              place.location.coordinates[0]  // longitude
                            ]}
                          >
                            <Popup>
                              <Box sx={{ minWidth: 150 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {place.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {place.category}
                                </Typography>
                              </Box>
                            </Popup>
                          </Marker>
                        ))
                      }
                    </MapContainer>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">地図データがありません</Typography>
                    </Box>
                  )}
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
