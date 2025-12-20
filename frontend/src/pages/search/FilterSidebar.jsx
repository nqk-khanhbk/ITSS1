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
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>詳細フィルター</Typography>

      {/* Độ tuổi */}
      <Typography variant="subtitle2" fontWeight="bold">対象年齢</Typography>
      <RadioGroup
        value={tempFilterState.age_ranges || 'all'}
        onChange={(e) => handleChange('age_ranges', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="すべて" />
        <FormControlLabel value="1-5" control={<Radio />} label="1 - 5歳" />
        <FormControlLabel value="6-12" control={<Radio />} label="6 - 12歳" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Loại hình hoạt động */}
      <Typography variant="subtitle2" fontWeight="bold">アクティビティタイプ</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
          labelId="category-label"
          value={tempFilterState.category_ids || 'all'}
          onChange={(e) => handleChange('category_ids', e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Vị trí */}
      <Typography variant="subtitle2" fontWeight="bold">エリア</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
        labelId="district-label"
        value={tempFilterState.districts || 'all'}
        onChange={(e) => handleChange('districts', e.target.value)}
        >
        <MenuItem value="all">すべて</MenuItem>
        {[
            "Hoàn Kiếm","Hai Bà Trưng","Ba Đình","Cầu Giấy","Tây Hồ","Hoàng Mai","Hà Đông",
            "Nam Từ Liêm","Bắc Từ Liêm","Long Biên","Gia Lâm","Đông Anh","Khu vực khác"
        ].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Giá */}
      <Typography variant="subtitle2" fontWeight="bold">料金範囲</Typography>
      <RadioGroup
        value={tempFilterState.price_filter || 'all'}
        onChange={(e) => handleChange('price_filter', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="すべて" />
        <FormControlLabel value="free" control={<Radio />} label="無料" />
        <FormControlLabel value="under_100k" control={<Radio />} label="10万VND未満" />
        <FormControlLabel value="100k_300k" control={<Radio />} label="10万 – 30万VND" />
        <FormControlLabel value="over_300k" control={<Radio />} label="30万VND以上" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Thời gian mở cửa */}
      <Typography variant="subtitle2" fontWeight="bold">営業時間帯</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Select
        labelId="open-time-label"
        value={tempFilterState.open_time || 'all'}
        onChange={(e) => handleChange('open_time', e.target.value)}
        >
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="morning">午前営業</MenuItem>
        <MenuItem value="afternoon">午後営業</MenuItem>
        <MenuItem value="evening">夜営業</MenuItem>
        <MenuItem value="all_day">終日営業</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Mức độ đông đúc */}
      <Typography variant="subtitle2" fontWeight="bold">混雑度</Typography>
      <RadioGroup
        value={tempFilterState.crowd_level || 'all'}
        onChange={(e) => handleChange('crowd_level', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="すべて" />
        <FormControlLabel value="low" control={<Radio />} label="空いている" />
        <FormControlLabel value="medium" control={<Radio />} label="普通" />
        <FormControlLabel value="high" control={<Radio />} label="混雑" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Tiện ích đi kèm - chọn nhiều */}
      <Typography variant="subtitle2" fontWeight="bold">設備・アメニティ</Typography>
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
      <Typography variant="subtitle2" fontWeight="bold">評価</Typography>
      <RadioGroup
        value={tempFilterState.min_rating || 'all'}
        onChange={(e) => handleChange('min_rating', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="すべて" />
        <FormControlLabel value="5" control={<Radio />} label="5★" />
        <FormControlLabel value="4.5" control={<Radio />} label="4.5★ 以上" />
        <FormControlLabel value="4" control={<Radio />} label="4★ 以上" />
      </RadioGroup>
      <Divider sx={{ my: 2 }} />

      {/* Khoảng cách */}
      <Typography variant="subtitle2" fontWeight="bold">距離</Typography>
      <RadioGroup
        value={tempFilterState.radius || 'all'}
        onChange={(e) => handleChange('radius', e.target.value)}
      >
        <FormControlLabel value="all" control={<Radio />} label="すべて" />
        <FormControlLabel value="2" control={<Radio />} label="2km未満" />
        <FormControlLabel value="5" control={<Radio />} label="5km未満" />
        <FormControlLabel value="10" control={<Radio />} label="10km未満" />
        <FormControlLabel value="over_10km" control={<Radio />} label="10km超" />
      </RadioGroup>

      {/* Nút hành động */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1 }}
          onClick={onApply}
        >
          絞り込む
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onReset}
        >
          リセット
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSidebar;
