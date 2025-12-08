import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

function ScheduleCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");

  const [items, setItems] = useState([
    {
      custom_place_name: "",
      start_time: "",
      end_time: "",
      link: "",
      image: "",
      note: "",
      caution: "",
      transport: "",
      price_min: "",
      price_max: "",
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        custom_place_name: "",
        start_time: "",
        end_time: "",
        link: "",
        image: "",
        note: "",
        caution: "",
        transport: "",
        price_min: "",
        price_max: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveItem = (index, direction) => {
    setItems((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return newItems;
    });
  };

  const handleChangeItemField = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const buildPayload = () => {
    return {
      // user_id sẽ được backend gán từ token, nên FE chỉ mock cấu trúc
      user_id: "mock-user-id",
      title,
      description,
      date: date ? new Date(date).toISOString() : null,
      cover_image: coverImage,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      items: items.map((item, index) => ({
        custom_place_name: item.custom_place_name,
        start_time: item.start_time,
        end_time: item.end_time,
        link: item.link,
        image: item.image,
        note: item.note,
        caution: item.caution,
        transport: item.transport,
        price_range: {
          min: item.price_min ? Number(item.price_min) : undefined,
          max: item.price_max ? Number(item.price_max) : undefined,
        },
        sort_order: index,
      })),
    };
  };

  const handleSaveDraft = () => {
    const payload = buildPayload();
    console.log("Save draft payload (dayPlan)", payload);
    // TODO: call API /api/day-plans as draft when backend ready
  };

  const handlePublish = () => {
    const payload = buildPayload();
    console.log("Publish payload (dayPlan)", payload);
    // TODO: call API /api/day-plans to publish when backend ready
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 2, bgcolor: "#f2f4f7" }}>
      {/* Header: page title + actions (1, 16, 17) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Tạo kế hoạch trong ngày
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={{ textTransform: "none" }}
          >
            Lưu bản nháp
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            sx={{ textTransform: "none" }}
          >
            Đăng công khai
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4} columns={12}>
        {/* Left 7/12: main content */}
        <Grid item xs={12} md={7} sx={{flex:1}}>
          <Stack spacing={2}>
            {/* 2. Tên Kế hoạch */}
            <TextField
              label="Tên kế hoạch"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* 3. Ghi chú Kế hoạch */}
            <TextField
              label="Ghi chú kế hoạch"
              fullWidth
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ "& .MuiInputBase-root": { fontSize: 14, py: 0.5 } }}
            />

            {/* Timeline title */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
              Timeline địa điểm
            </Typography>

            {/* 4-14: Item cards */}
            {items.map((item, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                }}
              >
                <Stack spacing={2}>
                  {/* Thời gian + nút lên/xuống/xóa (5, 6, 7) */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Bắt đầu"
                        type="time"
                        size="small"
                        value={item.start_time}
                        onChange={(e) =>
                          handleChangeItemField(index, "start_time", e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Kết thúc"
                        type="time"
                        size="small"
                        value={item.end_time}
                        onChange={(e) =>
                          handleChangeItemField(index, "end_time", e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveItem(index, "up")}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveItem(index, "down")}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack spacing={2}>
                    {/* Hàng 1: tên địa điểm + liên kết địa điểm */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        label="Tên địa điểm"
                        fullWidth
                        value={item.custom_place_name}
                        onChange={(e) =>
                          handleChangeItemField(
                            index,
                            "custom_place_name",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Liên kết đến địa điểm (trong trang web)"
                        fullWidth
                        value={item.link}
                        onChange={(e) =>
                          handleChangeItemField(index, "link", e.target.value)
                        }
                      />
                    </Stack>

                    {/* Hàng 2: bên trái là ô ảnh (upload từ máy), bên phải là mô tả bổ sung */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <Box
                        sx={{
                          width: 240,
                          height: 200,
                          borderRadius: 2,
                          border: "1px dashed #cbd5e1",
                          bgcolor: "#f9fafb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {item.image ? (
                          <Box
                            component="img"
                            src={item.image}
                            alt="Ảnh địa điểm"
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Bấm để chọn ảnh địa điểm
                          </Typography>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const imageUrl = URL.createObjectURL(file);
                            handleChangeItemField(index, "image", imageUrl);
                          }}
                        />
                      </Box>

                      <TextField
                        label="Mô tả địa điểm bổ sung"
                        fullWidth
                        multiline
                        value={item.note}
                        onChange={(e) =>
                          handleChangeItemField(index, "note", e.target.value)
                        }
                        sx={{
                          height: 200,
                          "& .MuiInputBase-root": {
                            height: "100%",
                            alignItems: "flex-start",
                            paddingTop: 1,
                            paddingBottom: 1,
                          },
                          "& textarea": {
                            height: "100%",
                            overflow: "auto",
                          },
                        }}
                      />
                    </Stack>

                    {/* Hàng 3: phương tiện, giá tiền, điểm chú ý trên một hàng (1:1:1:1) */}
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      sx={{ mt: 1 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="Phương tiện di chuyển"
                          select
                          fullWidth
                          value={item.transport}
                          onChange={(e) =>
                            handleChangeItemField(index, "transport", e.target.value)
                          }
                        >
                          <MenuItem value="">Chọn phương tiện</MenuItem>
                          <MenuItem value="car">Ô tô</MenuItem>
                          <MenuItem value="motorbike">Xe máy</MenuItem>
                          <MenuItem value="bus">Xe bus</MenuItem>
                          <MenuItem value="walk">Đi bộ</MenuItem>
                          <MenuItem value="other">Khác</MenuItem>
                        </TextField>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="Chi phí tối thiểu (đ)"
                          type="number"
                          fullWidth
                          value={item.price_min}
                          onChange={(e) =>
                            handleChangeItemField(index, "price_min", e.target.value)
                          }
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="Tối đa (đ)"
                          type="number"
                          fullWidth
                          value={item.price_max}
                          onChange={(e) =>
                            handleChangeItemField(index, "price_max", e.target.value)
                          }
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="Điểm chú ý / lưu ý quan trọng"
                          fullWidth
                          value={item.caution}
                          onChange={(e) =>
                            handleChangeItemField(index, "caution", e.target.value)
                          }
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            ))}

            {/* 15: Thêm thẻ mới */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ textTransform: "none", alignSelf: "center", mt: 1 }}
            >
              Thêm thẻ mới
            </Button>
          </Stack>
        </Grid>

        {/* Right 5/12: meta info (18, 19, 20) */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                {/* 18. Ngày tạo kế hoạch */}
                <TextField
                  label="Ngày tạo kế hoạch"
                  type="date"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* 19. Hình ảnh đại diện */}
                <TextField
                  label="URL hình ảnh đại diện"
                  fullWidth
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />

                {/* 20. Thẻ (tags) */}
                <TextField
                  label="Thẻ (tag) - cách nhau bằng dấu phẩy"
                  fullWidth
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ScheduleCreate;
