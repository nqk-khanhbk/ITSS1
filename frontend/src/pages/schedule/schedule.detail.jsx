import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

// Mock data cho lịch trình
const scheduleData = {
  id: 1,
  title: "Tây Hồ で家族ピクニック一日プラン",
  user: {
    name: "Hà Thu",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60",
  },
  likes: 742,
  isLiked: false,
  overview: {
    price: "100k-300k",
    time: "8:00-17:00",
    age: "Từ 4 tuổi trở lên"
  },
  timeline: [
    {
      id: 1,
      type: "home",
      name: "Nhà",
      time: "9:00",
      icon: "home",
    },
    {
      id: 2,
      type: "location",
      name: "Công viên nước Hồ Tây",
      time: "10:00",
      duration: "1 giờ",
      transport: "walk",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      openingHours: "9:00 - 18:00",
      estimatedCost: "100.000đ - 200.000đ",
      description: "Công viên nước với nhiều trò chơi phù hợp cho gia đình. Không gian rộng rãi, thoáng mát.",
      note: "Nên mang theo đồ bơi và kem chống nắng. Cuối tuần thường đông người.",
      hasWarning: true,
    },
    {
      id: 3,
      type: "location",
      name: "Công viên nước Hồ Tây",
      time: "12:00",
      duration: "2 giờ",
      transport: "walk",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      openingHours: "11:00 - 22:00",
      estimatedCost: "150.000đ - 300.000đ",
      description: "Nhà hàng buffet với nhiều món ăn đa dạng, view nhìn ra Hồ Tây tuyệt đẹp.",
      note: "Nên đặt bàn trước. Giá buffet trẻ em có ưu đãi.",
      hasWarning: true,
    },
    {
      id: 4,
      type: "location",
      name: "Công viên nước Hồ Tây",
      time: "14:00",
      duration: "1.5 giờ",
      transport: "bike",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      openingHours: "24/7",
      estimatedCost: "Miễn phí",
      description: "Công viên xanh mát, yên tĩnh với nhiều khu vui chơi cho trẻ em.",
      note: "Có thể thuê xe đạp đôi. Thích hợp chụp ảnh vào buổi chiều.",
      hasWarning: true,
    },
    {
      id: 5,
      type: "location",
      name: "Công viên nước Hồ Tây",
      time: "16:00",
      duration: "1 giờ",
      transport: "car",
      image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800",
      openingHours: "7:00 - 23:00",
      estimatedCost: "50.000đ - 100.000đ",
      description: "Quán cà phê view Hồ Tây lãng mạn, phù hợp nghỉ ngơi cuối ngày.",
      note: "Có khu vui chơi nhỏ cho trẻ em. Menu đồ uống đa dạng.",
      hasWarning: false,
    },
  ],
  warnings: [
    {
      location: "Công viên nước Hồ Tây",
      note: "Nên mang theo đồ bơi và kem chống nắng",
    },
    {
      location: "Công viên nước Hồ Tây",
      note: "Nên đặt bàn trước để có chỗ ngồi đẹp",
    },
  ],
};

// Component cho một điểm trên timeline
function TimelineCard({ location, onToggleDescription, onToggleNote, expandedDesc, expandedNote }) {
  const getTransportIcon = (transport) => {
    switch (transport) {
      case "walk":
        return <DirectionsWalkIcon fontSize="small" />;
      case "bus":
        return <DirectionsBusIcon fontSize="small" />;
      case "bike":
        return <DirectionsBikeIcon fontSize="small" />;
      case "car":
        return <DirectionsCarIcon fontSize="small" />;
      default:
        return <DirectionsWalkIcon fontSize="small" />;
    }
  };

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
              label={location.openingHours}
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

          {/* Mô tả */}
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
                {location.description}
              </Typography>
            </Collapse>
          </Box>

          {/* Ghi chú */}
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
  const [liked, setLiked] = useState(scheduleData.isLiked);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [expandedNote, setExpandedNote] = useState({});

  const handleToggleDescription = (id) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleNote = (id) => {
    setExpandedNote((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTransportIcon = (transport) => {
    switch (transport) {
      case "walk":
        return <DirectionsWalkIcon sx={{ color: "#1976d2" }} />;
      case "bus":
        return <DirectionsBusIcon sx={{ color: "#1976d2" }} />;
      case "bike":
        return <DirectionsBikeIcon sx={{ color: "#1976d2" }} />;
      case "car":
        return <DirectionsCarIcon sx={{ color: "#1976d2" }} />;
      default:
        return <DirectionsWalkIcon sx={{ color: "#1976d2" }} />;
    }
  };

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
          <IconButton onClick={() => setLiked(!liked)} sx={{ color: liked ? "#f44336" : "inherit" }}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        {/* Horizontal Timeline Overview */}
        <Paper
          sx={{
            mb: 2,
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
                        borderRadius: item.type === "home" ? 2 : "50%",
                        bgcolor: item.type === "home" ? "#1976d2" : "#fff",
                        border: "3px solid #1976d2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        cursor: item.note ? "pointer" : "default",
                        "&:hover": {
                          transform: item.note ? "scale(1.1)" : "none",
                          transition: "transform 0.2s",
                        },
                      }}
                    >
                      {item.type === "home" ? (
                        <HomeIcon sx={{ color: "#fff", fontSize: 28 }} />
                      ) : (
                        <LocationOnIcon sx={{ color: "#1976d2", fontSize: 28 }} />
                      )}
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
          {/* Cột trái - Timeline */}
          {/* Timeline */}
          <Grid item xs={12} md={9} sx={{ flex: 1 }}>
            <Box>
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
                          bgcolor: item.type === "home" ? "#1976d2" : "#fff",
                          border: "2px solid #1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                        }}
                      >
                        {item.type === "home" ? (
                          <HomeIcon sx={{ color: "#fff" }} />
                        ) : (
                          <LocationOnIcon sx={{ color: "#1976d2" }} />
                        )}
                      </Box>
                      {item.transport && (
                        <Box sx={{ mt: 1 }}>{getTransportIcon(item.transport)}</Box>
                      )}
                      {item.duration && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.duration}
                        </Typography>
                      )}
                    </Stack>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      {item.type === "home" ? (
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.name}
                          </Typography>
                        </Paper>
                      ) : (
                        <TimelineCard
                          location={item}
                          onToggleDescription={handleToggleDescription}
                          onToggleNote={handleToggleNote}
                          expandedDesc={expandedDesc[item.id]}
                          expandedNote={expandedNote[item.id]}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
          {/* Cột phải - Thông tin & Bản đồ */}
          <Grid item xs={12} md={3}>
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
                      <strong>料金:</strong> {scheduleData.overview.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon color="action" />
                    <Typography variant="body2">
                      <strong>時間:</strong> {scheduleData.overview.time}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupIcon color="action" />
                    <Typography variant="body2">
                      <strong>年齢:</strong> {scheduleData.overview.age}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon color="action" />
                    <Typography variant="body2">
                      <strong>場所:</strong> {scheduleData.overview.location}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Typography variant="body2" color="warning.main">
                    ⚠️ {scheduleData.overview.note}
                  </Typography>
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
                    height: 250,
                    bgcolor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">Map Placeholder</Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>


        </Grid>
      </Box>
    </Box>
  );
}

export default ScheduleDetail;
