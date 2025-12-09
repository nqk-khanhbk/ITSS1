import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormGroup,FormControl,InputLabel,Select,MenuItem, FormControlLabel, Checkbox,
  RadioGroup, Radio, Slider, Divider, Button
} from '@mui/material';
import axios from 'axios';

const FilterSidebar = ({ tempFilterState, setTempFilterState, onApply, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);

    useEffect(() => {
    axios.get('http://localhost:3000/api/places/filters')
      .then(res => {
        setCategories(res.data.data.categories || []);
        setAmenities(res.data.data.amenities || []);
      });
  }, []);

  const handleChange = (key, value) => {
    setTempFilterState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box
        sx={{
            p: 2,
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: 1,
            height: '100vh',
            overflowY: 'auto'
        }}
        >
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Bộ lọc chi tiết</Typography>

      {/* Độ tuổi */}
      <Typography variant="subtitle2" fontWeight="bold">Độ tuổi</Typography>
      <RadioGroup
        value={tempFilterState.age_ranges || 'all'}
        onChange={(e) => handleChange('age_ranges', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
        <FormControlLabel value="1-5" control={<Radio />} label="1 - 5 tuổi" />
        <FormControlLabel value="6-12" control={<Radio />} label="6 - 12 tuổi" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Loại hình hoạt động */}
      <Typography variant="subtitle2" fontWeight="bold">Loại hình hoạt động</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
          labelId="category-label"
          value={tempFilterState.category_ids || 'all'}
          onChange={(e) => handleChange('category_ids', e.target.value)}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Vị trí */}
      <Typography variant="subtitle2" fontWeight="bold">Vị trí</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
        labelId="district-label"
        value={tempFilterState.districts || 'all'}
        onChange={(e) => handleChange('districts', e.target.value)}
        >
        <MenuItem value="all">Tất cả</MenuItem>
        {[
            "Hoàn Kiếm","Hai Bà Trưng","Ba Đình","Cầu Giấy","Tây Hồ","Hoàng Mai","Hà Đông",
            "Nam Từ Liêm","Bắc Từ Liêm","Long Biên","Gia Lâm","Đông Anh","Khu vực khác"
        ].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Giá */}
      <Typography variant="subtitle2" fontWeight="bold">Khoảng giá</Typography>
      <RadioGroup
        value={tempFilterState.price_filter || 'all'}
        onChange={(e) => handleChange('price_filter', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
        <FormControlLabel value="free" control={<Radio />} label="Miễn phí" />
        <FormControlLabel value="under_100k" control={<Radio />} label="Dưới 100,000 VND" />
        <FormControlLabel value="100k_300k" control={<Radio />} label="100,000 – 300,000 VND" />
        <FormControlLabel value="over_300k" control={<Radio />} label="Trên 300,000 VND" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Thời gian mở cửa */}
      <Typography variant="subtitle2" fontWeight="bold">Thời gian mở cửa</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
        labelId="open-time-label"
        value={tempFilterState.open_time || 'all'}
        onChange={(e) => handleChange('open_time', e.target.value)}
        >
        <MenuItem value="all">Tất cả</MenuItem>
        <MenuItem value="morning">Mở buổi sáng</MenuItem>
        <MenuItem value="afternoon">Mở buổi chiều</MenuItem>
        <MenuItem value="evening">Mở buổi tối</MenuItem>
        <MenuItem value="all_day">Mở cả ngày</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Mức độ đông đúc */}
      <Typography variant="subtitle2" fontWeight="bold">Mức độ đông đúc</Typography>
      <RadioGroup
        value={tempFilterState.crowd_level || 'all'}
        onChange={(e) => handleChange('crowd_level', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
        <FormControlLabel value="low" control={<Radio />} label="Ít người" />
        <FormControlLabel value="medium" control={<Radio />} label="Trung bình" />
        <FormControlLabel value="high" control={<Radio />} label="Thường đông" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Tiện ích đi kèm - chọn nhiều */}
      <Typography variant="subtitle2" fontWeight="bold">Tiện ích đi kèm</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
          labelId="amenities-label"
          multiple
          value={tempFilterState.amenity_ids || []}
          onChange={(e) => handleChange('amenity_ids', e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {selected.map((value) => {
                const amenity = amenities.find(a => a._id === value);
                return (
                  <Typography key={value} variant="body2">
                    {amenity ? amenity.name : value}
                  </Typography>
                );
              })}
            </Box>
          )}
        >
          {amenities.map(a => (
            <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Đánh giá */}
      <Typography variant="subtitle2" fontWeight="bold">Đánh giá</Typography>
      <RadioGroup
        value={tempFilterState.min_rating || 'all'}
        onChange={(e) => handleChange('min_rating', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
        <FormControlLabel value="5" control={<Radio />} label="5★" />
        <FormControlLabel value="4.5" control={<Radio />} label="4.5★ trở lên" />
        <FormControlLabel value="4" control={<Radio />} label="4★ trở lên" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Khoảng cách */}
      <Typography variant="subtitle2" fontWeight="bold">Khoảng cách</Typography>
      <RadioGroup
        value={tempFilterState.radius || 'all'}
        onChange={(e) => handleChange('radius', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
        <FormControlLabel value="2" control={<Radio />} label="Dưới 2km" />
        <FormControlLabel value="5" control={<Radio />} label="Dưới 5km" />
        <FormControlLabel value="10" control={<Radio />} label="Dưới 10km" />
        <FormControlLabel value="over_10km" control={<Radio />} label="Trên 10km" />
      </RadioGroup>

      {/* Nút hành động */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
            variant="contained"
            color="primary"
            onClick={onApply}
        >
            Lọc
        </Button>
        <Button
            variant="outlined"
            color="secondary"
            onClick={onReset}
        >
            Đặt lại
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSidebar;
