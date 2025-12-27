import { useEffect,useState} from "react";
import {
  Avatar,
  Box,
  Button,
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
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Schedule() {
  // const plans = useMemo(() => mockPlans.slice(0, 6), []);
  const [plansData, setPlansData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [ageRange, setAgeRange] = useState("all");

  // Applied filters (for actual API call)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    province: "",
    area: "",
    price_min: null,
    price_max: null,
    age_min: null,
    age_max: null,
  });

  useEffect(() => {
    const fetchDayPlans = async () => {
      console.log("Fetching day plans from API... Page:", page);
      try {
        setLoading(true);
        
        // Build query params
        const params = { page };
        
        // Add filters if applied
        if (appliedFilters.search) params.search = appliedFilters.search;
        if (appliedFilters.province) params.province = appliedFilters.province;
        if (appliedFilters.area) params.area = appliedFilters.area;
        if (appliedFilters.price_min !== null) params.price_min = appliedFilters.price_min;
        if (appliedFilters.price_max !== null) params.price_max = appliedFilters.price_max;
        if (appliedFilters.age_min !== null) params.age_min = appliedFilters.age_min;
        if (appliedFilters.age_max !== null) params.age_max = appliedFilters.age_max;

        const response = await axios.get("http://localhost:3000/api/day-plans", {
          params
        });
        setPlansData(response.data?.data ?? []);
        
        // Use totalPages from backend (now calculated based on filtered results)
        setTotalPages(response.data?.pagination?.totalPages ?? 1);
        
        console.log("Fetched day plans:", response.data);
      } catch (error) {
        console.error("Failed to fetch day plans", error?.response ?? error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDayPlans();
  }, [page, appliedFilters]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter application
  const handleApplyFilters = () => {
    // Convert price range to min/max
    let price_min = null;
    let price_max = null;
    
    switch (priceRange) {
      case "free":
        price_min = 0;
        price_max = 0;
        break;
      case "0-150k":
        price_min = 0;
        price_max = 15000;
        break;
      case "150k-600k":
        price_min = 150000;
        price_max = 600000;
        break;
      case "250k-1m":
        price_min = 250000;
        price_max = 1000000;
        break;
      case "1m+":
        price_min = 1000000;
        price_max = null;
        break;
      default:
        break;
    }

    // Convert age range to min/max
    let age_min = null;
    let age_max = null;
    
    switch (ageRange) {
      case "0-5":
        age_min = 0;
        age_max = 5;
        break;
      case "5-12":
        age_min = 5;
        age_max = 12;
        break;
      case "12-18":
        age_min = 12;
        age_max = 18;
        break;
      case "18+":
        age_min = 18;
        age_max = null;
        break;
      default:
        break;
    }

    setAppliedFilters({
      search: searchText.trim(),
      province: selectedProvince,
      area: selectedArea,
      price_min,
      price_max,
      age_min,
      age_max,
    });

    // Reset to page 1 when applying filters
    setPage(1);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchText("");
    setSelectedProvince("");
    setSelectedArea("");
    setPriceRange("all");
    setAgeRange("all");
    setAppliedFilters({
      search: "",
      province: "",
      area: "",
      price_min: null,
      price_max: null,
      age_min: null,
      age_max: null,
    });
    setPage(1);
  };
  
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: "#f2f4f7" }}>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5" fontWeight={700} sx={{ color: "#1e1e1e" }}>
            おすすめスケジュール
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/schedule/create"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(25,118,210,0.35)",
            }}
          >
            新しいスケジュールを作成
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}  columns={12}>
        <Grid item xs={12} md={9} sx={{ flex: 1 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                読み込み中...
              </Typography>
            </Stack>
          ) : plansData.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                スケジュールがありません
              </Typography>
            </Stack>
          ) : (
            <Grid container spacing={3} sx={{marginBottom: 2}}>
            {plansData.map((plan) => (
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
                          src={plan.user.avatar}
                          alt={plan.user.fullName}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {plan.user.fullName}
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
                        {plan.description}
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
                          {plan.province[0]} · {plan.area[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          料金: {plan.price_range}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          対象年齢: {plan.age}
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
                      onClick={() => navigate(`/schedule/${plan.id}`)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontSize: 12,
                      }}
                    >
                      詳細を見る
                    </Button>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                     #{plan?.area?.[0]?.replace(/\s+/g, "") ?? ""}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
          )}

          {/* Pagination */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page}
              onChange={handlePageChange}
              color="primary" 
              showFirstButton 
              showLastButton
            />
          </Stack>
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
                  検索
                </Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="場所名を入力"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyFilters();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={handleApplyFilters}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Divider sx={{ borderColor: "#e5e7eb" }} />
              <Typography variant="subtitle2" fontWeight={600}>
                住所で絞り込む
              </Typography>
              <TextField
                select
                size="small"
                label="都道府県"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="Hà Nội">ハノイ</MenuItem>
                <MenuItem value="Tp. HCM">ホーチミン</MenuItem>
                <MenuItem value="Đà Nẵng">ダナン</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="区・郡"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="Hoàn Kiếm">ホアンキエム</MenuItem>
                <MenuItem value="Hai Bà Trưng">ハイバーチュン</MenuItem>
                <MenuItem value="Tây Hồ">タイホー</MenuItem>
              </TextField>
              <Divider sx={{ borderColor: "#e5e7eb" }} />
              <Typography variant="subtitle2" fontWeight={600}>
                追加フィルター
              </Typography>

              {/* 料金範囲 */}
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  料金範囲
                </FormLabel>
                <RadioGroup value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="すべて"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="free"
                    control={<Radio size="small" />}
                    label="無料"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="0-150k"
                    control={<Radio size="small" />}
                    label="0円 - 1,000円"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="150k-600k"
                    control={<Radio size="small" />}
                    label="1,000円 - 4,000円"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="250k-1m"
                    control={<Radio size="small" />}
                    label="1,500円 - 6,000円"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="1m+"
                    control={<Radio size="small" />}
                    label="6,000円以上"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                </RadioGroup>
              </FormControl>

              {/* 対象年齢 */}
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  対象年齢
                </FormLabel>
                <RadioGroup value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="すべて"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="0-5"
                    control={<Radio size="small" />}
                    label="0 - 5歳"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="5-12"
                    control={<Radio size="small" />}
                    label="5 - 12歳"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="12-18"
                    control={<Radio size="small" />}
                    label="12 - 18歳"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  />
                  <FormControlLabel
                    value="18+"
                    control={<Radio size="small" />}
                    label="18歳以上"
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
                  onClick={handleApplyFilters}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  絞り込む
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ textTransform: "none", color: "#6b4c00" }}
                >
                  リセット
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
