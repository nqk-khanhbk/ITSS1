import { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  decomposeColor,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const mockPlans = [
  {
    id: 1,
    user: "Hà Thu",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60",
    likes: 128,
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    title: "Thăm Hồ Gươm + Coffee sáng",
    price: "0đ - 150.000đ",
    age: "Từ 5 tuổi",
    description: "Đi bộ ngắm phố cổ, nhâm nhi cà phê vỉa hè",
    province: "Hà Nội",
    area: "Hoàn Kiếm",
  },
  {
    id: 2,
    user: "An Bình",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60",
    likes: 92,
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    title: "Chạy bộ Công viên Thống Nhất",
    price: "Miễn phí",
    age: "Từ 12 tuổi",
    description: "Tham gia lớp zumba, mượn xe đạp công viên",
    province: "Hà Nội",
    area: "Hai Bà Trưng",
  },
  {
    id: 3,
    user: "Minh Đức",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60",
    likes: 201,
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    title: "Tản bộ Phố Cổ + Bảo tàng",
    price: "100.000đ - 250.000đ",
    age: "Từ 8 tuổi",
    description: "Ghé Bảo tàng Dân tộc học chụp hình gia đình",
    province: "Hà Nội",
    area: "Hoàn Kiếm",
  },
  {
    id: 4,
    user: "An Nhiên",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60",
    likes: 184,
    cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
    title: "Thư giãn phố nghệ thuật",
    price: "120.000đ - 300.000đ",
    age: "Từ 15 tuổi",
    description: "Ghé triển lãm, uống trà sách tại toà nhà cổ",
    province: "Hà Nội",
    area: "Ba Đình",
  },
  {
    id: 5,
    user: "Lan Phạm",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=60",
    likes: 74,
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    title: "Ẩm thực đêm Tống Duy Tân",
    price: "80.000đ - 220.000đ",
    age: "Từ 18 tuổi",
    description: "Ăn nhậu nhẹ, thử trà chanh",
    province: "Hà Nội",
    area: "Hoàn Kiếm",
  },
  {
    id: 6,
    user: "Tuấn Khang",
    avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60",
    likes: 156,
    cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
    title: "Góc chill West Lake",
    price: "150.000đ",
    age: "Từ 7 tuổi",
    description: "Check-in cầu Thê Húc, ăn kem Bạch Đằng",
    province: "Hà Nội",
    area: "Tây Hồ",
  },
];
//localhost:3000/dayplay/list
export default function Schedule() {
  const plans = useMemo(() => mockPlans.slice(0, 6), []);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: "#f2f4f7" }}>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5" fontWeight={700} sx={{ color: "#1e1e1e" }}>
            Lịch trình đề xuất
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FavoriteBorderIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(25,118,210,0.35)",
            }}
          >
            Tạo lịch trình mới
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}  columns={12}>
        <Grid item xs={12} md={9} sx={{ flex: 1 }}>
          <Grid container spacing={3} sx={{marginBottom: 2}}>
            {plans.map((plan) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={plan.id}
                sx={{ display: "flex" }}
              >
                <Paper
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 420,
                    width: 310,
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    boxShadow: "0 8px 25px rgba(15,23,42,0.08)",
                  }}
                >
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          src={plan.avatar}
                          alt={plan.user}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {plan.user}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FavoriteBorderIcon
                          fontSize="small"
                          sx={{ color: "#eb3941" }}
                        />
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          {plan.likes}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box
                      component="img"
                      src={plan.cover}
                      alt={plan.title}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        height: 180,
                        objectFit: "cover",
                      }}
                    />

                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {plan.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#374151" }}>
                        {plan.description_description_description_description}
                      </Typography>
                      <Stack direction="column" spacing={0.3} sx={{ pt: 1 }}>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          <LocationOnIcon
                            fontSize="small"
                            sx={{
                              verticalAlign: "middle",
                              mr: 0.5,
                              color: "#1976d2",
                            }}
                          />
                          {plan.province} · {plan.area}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Giá: {plan.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Độ tuổi: {plan.age}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 1 }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontSize: 12,
                      }}
                    >
                      Xem ngay
                    </Button>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      #{plan.area.replace(/\s+/g, "")}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="center">
              <Pagination count={2} color="primary" />
            </Stack>
          </Grid>
        </Grid>

        <Grid item xs={12} md={3} >
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 3,
              borderRadius: 3,
              boxShadow: "0 8px 25px rgba(15,23,42,0.08)",
            }}
          >
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SearchIcon sx={{ color: "#1976d2" }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Tìm kiếm
                </Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="Nhập tên địa điểm"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Divider sx={{ borderColor: "#e5e7eb" }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Lọc theo địa chỉ
              </Typography>
              <TextField
                select
                size="small"
                label="Tỉnh / Thành phố"
                defaultValue="Hà Nội"
              >
                <MenuItem value="Hà Nội">Hà Nội</MenuItem>
                <MenuItem value="Tp. HCM">Tp. HCM</MenuItem>
                <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Quận / Huyện"
                defaultValue="Hoàn Kiếm"
              >
                <MenuItem value="Hoàn Kiếm">Hoàn Kiếm</MenuItem>
                <MenuItem value="Hai Bà Trưng">Hai Bà Trưng</MenuItem>
                <MenuItem value="Tây Hồ">Tây Hồ</MenuItem>
              </TextField>
              <Divider sx={{ borderColor: "#e5e7eb" }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Bộ lọc bổ sung
              </Typography>

              {/* Khoảng giá */}
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  Khoảng giá
                </FormLabel>
                <RadioGroup defaultValue="all">
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="Tất cả"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="free"
                    control={<Radio size="small" />}
                    label="Miễn phí"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="0-200k"
                    control={<Radio size="small" />}
                    label="0đ - 200.000đ"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="200k-500k"
                    control={<Radio size="small" />}
                    label="200.000đ - 500.000đ"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="500k-1m"
                    control={<Radio size="small" />}
                    label="500.000đ - 1.000.000đ"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="1m+"
                    control={<Radio size="small" />}
                    label="Trên 1.000.000đ"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                </RadioGroup>
              </FormControl>

              {/* Độ tuổi */}
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  Độ tuổi
                </FormLabel>
                <RadioGroup defaultValue="all">
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="Tất cả"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="0-5"
                    control={<Radio size="small" />}
                    label="0 - 5 tuổi"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="5-12"
                    control={<Radio size="small" />}
                    label="5 - 12 tuổi"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="12-18"
                    control={<Radio size="small" />}
                    label="12 - 18 tuổi"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="18+"
                    control={<Radio size="small" />}
                    label="Trên 18 tuổi"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                </RadioGroup>
              </FormControl>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                sx={{ pt: 1 }}
              >
                <Button
                  variant="contained"
                  startIcon={<FilterAltIcon />}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Lọc
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none", color: "#6b4c00" }}
                >
                  Đặt lại
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
