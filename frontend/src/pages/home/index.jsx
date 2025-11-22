import { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Stack, Typography, Container, Grid, Card, CardMedia, CardContent, Chip, Button } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocationOnIcon from '@mui/icons-material/LocationOn'

function Home() {
  // Mock data địa điểm gần đây
  const nearbyPlaces = [
    {
      id: 1,
      name: 'Hồ Gươm',
      category: 'Công viên & Hồ',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
      description: 'Hồ Hoàn Kiếm là biểu tượng của Hà Nội với Tháp Rùa và cầu Thê Húc nổi tiếng',
    },
    {
      id: 2,
      name: 'Phố Cổ Hà Nội',
      category: 'Văn hóa & Lịch sử',
      image: 'https://th.bing.com/th/id/OIP.weRP3hnUPWYFffxJll1A1gHaE8?w=286&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      description: 'Khu phố cổ với 36 phố phường mang đậm bản sắc văn hóa Thăng Long',
    },
    {
      id: 3,
      name: 'Văn Miếu - Quốc Tử Giám',
      category: 'Di tích lịch sử',
      image: 'https://th.bing.com/th/id/OIP.3klOUDWBzJXQa9mC3vqBUAHaEZ?w=297&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      description: 'Ngôi đền Khổng Tử đầu tiên ở Việt Nam, trường đại học đầu tiên của Việt Nam',
    },
    {
      id: 4,
      name: 'Công Viên Thống Nhất',
      category: 'Giải trí & Thư giãn',
      image: 'https://nemtv.vn/wp-content/uploads/2019/01/cong-vien-thong-nhat-nemtv-1-696x371.jpg',
      description: 'Công viên lớn với hồ nước, khu vui chơi và không gian xanh mát',
    },
  ]

  const images = useMemo(() => {
    const modules = import.meta.glob('../../assets/images/*.{png,jpg,jpeg,webp,gif}', {
      eager: true,
      as: 'url'
    })
    const list = Object.values(modules)
    // Lấy tối đa 4 ảnh đầu tiên
    return list.slice(0, 4)
  }, [])

  const [index, setIndex] = useState(0)
  const len = images.length

  useEffect(() => {
    if (len <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % len)
    }, 4000)
    return () => clearInterval(id)
  }, [len])

  const prev = () => setIndex((i) => (i - 1 + len) % len)
  const next = () => setIndex((i) => (i + 1) % len)

  if (len === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
        Không tìm thấy ảnh trong thư mục assets/images
      </Box>
    )
  }

  return (
    <>
      <Box>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 1600,
            mx: 'auto',
            height: 550,
            borderRadius: '0 0 0.5rem 0.5rem',
            overflow: 'hidden',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
          }}
        >
          {images.map((src, i) => (
            <Box
              key={src}
              component="img"
              src={src}
              alt={`slide-${i + 1}`}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity .5s ease',
                opacity: i === index ? 1 : 0
              }}
            />
          ))}

          {/* Controls */}
          {len > 1 && (
            <>
              <IconButton
                onClick={prev}
                aria-label="Previous"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 8,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(220,38,38,0.75)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(220,38,38,0.95)' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={next}
                aria-label="Next"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(220,38,38,0.75)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(220,38,38,0.95)' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}

          {/* Dots */}
          {len > 1 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => setIndex(i)}
                  sx={{
                    width: i === index ? 18 : 8,
                    height: 8,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    bgcolor: i === index ? 'primary.main' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(0,0,0,0.2)'
                  }}
                />)
              )}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Phần đề xuất địa điểm */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 6 }}>
        {/* Cho container full width thật sự */}
        <Container maxWidth={false}>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#ff5722',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LocationOnIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#333' }}>
                Địa điểm gần bạn
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton sx={{ border: '1px solid #ddd', bgcolor: '#fff', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton sx={{ border: '1px solid #ddd', bgcolor: '#fff', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {nearbyPlaces.map((place) => (
              <Grid item xs={12} sm={6} md={3} key={place.id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    bgcolor: '#fff',
                    transition: 'all .3s',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={place.image}
                      alt={place.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                        mb: 0.3,
                        fontSize: 10
                      }}
                    >
                      {place.category}
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        mb: 0.8,
                        fontSize: 13.5,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {place.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        fontSize: 11.5,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        flexGrow: 1
                      }}
                    >
                      {place.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 8,
                px: 5,
                py: 1.5,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                borderColor: '#1976d2',
                color: '#1976d2',
                bgcolor: '#fff',
                '&:hover': {
                  borderColor: '#1565c0',
                  bgcolor: 'rgba(25,118,210,0.04)'
                }
              }}
            >
              Xem tất cả
            </Button>
          </Box>
        </Container>
      </Box>

    </>
  )
}

export default Home
