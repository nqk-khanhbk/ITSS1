import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Radio,
    RadioGroup,
    FormControlLabel,
    Paper,
    Rating,
    Alert
} from '@mui/material';
import axios from 'axios';
import { getCookie } from '../../helpers/cookies.helper';

const FACILITY_LABELS = {
    parking: '駐車場',
    restroom: 'トイレ',
    diaper_changing: 'おむつ交換台',
    parent_rest_area: '保護者休憩エリア',
    dining_area: 'ダイニングエリア',
    stroller_support: 'ベビーカーサポート',
    medical_room: '医療室',
    air_conditioning: 'エアコン',
    wifi: 'Wi-Fi',
    disability_access: '障害者アクセス',
    locker: 'ロッカー',
    safe_zone: '安全ゾーン'
};

const FACILITY_KEYS = Object.keys(FACILITY_LABELS);

const ReviewDialog = ({ open, onClose, placeId, onReviewSuccess }) => {
    const [rating, setRating] = useState(0);
    const [facilities, setFacilities] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingReview, setExistingReview] = useState(null);

    // Initialize facilities
    useEffect(() => {
        const initialFacilities = {};
        FACILITY_KEYS.forEach(key => {
            initialFacilities[key] = '';
        });
        setFacilities(initialFacilities);
    }, []);

    // Load existing review if user already reviewed
    useEffect(() => {
        if (open && placeId) {
            loadMyReview();
        }
    }, [open, placeId]);

    const loadMyReview = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/reviews/my-review/${placeId}`,
                { withCredentials: true }
            );
            
            if (response.data.data) {
                const existingData = response.data.data;
                setRating(existingData.rating || 0);
                setExistingReview(existingData);
                
                // Populate facilities
                if (existingData.facilities) {
                    setFacilities(existingData.facilities);
                }
            }
        } catch (err) {
            console.log('No existing review or error loading:', err.message);
        }
    };

    const handleFacilityChange = (facilityKey, value) => {
        setFacilities(prev => ({
            ...prev,
            [facilityKey]: value
        }));
    };

    const isFormValid = () => {
        if (rating === 0) return false;
        return FACILITY_KEYS.every(key => facilities[key] !== '');
    };

    const handleSubmit = async () => {
        if (!isFormValid()) {
            setError('すべての項目を入力してください');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                place_id: placeId,
                rating: rating,
                facilities: facilities
            };

            let response;
            if (existingReview?._id) {
                // Update existing review
                response = await axios.put(
                    `http://localhost:3000/api/reviews/${existingReview._id}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                // Create new review
                response = await axios.post(
                    'http://localhost:3000/api/reviews',
                    payload,
                    { withCredentials: true }
                );
            }

            if (response.data.success) {
                alert(existingReview ? 'レビューが更新されました' : 'レビューが送信されました');
                if (onReviewSuccess) {
                    onReviewSuccess();
                }
                handleClose();
            }
        } catch (err) {
            console.error('Submit review error:', err);
            const errorMsg = err.response?.data?.message || 'レビューの送信に失敗しました';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setFacilities({});
        setError(null);
        setExistingReview(null);
        FACILITY_KEYS.forEach(key => {
            setFacilities(prev => ({
                ...prev,
                [key]: ''
            }));
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', textAlign: 'center' }}>
                {existingReview ? 'レビューを編集' : 'レビューを送信'}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {/* 星評価セクション */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        星評価
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Rating
                            value={rating}
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                            size="large"
                        />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            {rating > 0 ? `${rating}.0 / 5.0` : '評価を選択'}
                        </Typography>
                    </Stack>
                </Box>

                {/* サービスレビュー テーブル */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        サービスレビュー
                    </Typography>
                    
                    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, width: '40%' }}>
                                        サービス名
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                        ある
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                        ない
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                        気づかなかった
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {FACILITY_KEYS.map((facilityKey) => (
                                    <TableRow key={facilityKey} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {FACILITY_LABELS[facilityKey]}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Radio
                                                checked={facilities[facilityKey] === 'yes'}
                                                onChange={() => handleFacilityChange(facilityKey, 'yes')}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Radio
                                                checked={facilities[facilityKey] === 'no'}
                                                onChange={() => handleFacilityChange(facilityKey, 'no')}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Radio
                                                checked={facilities[facilityKey] === 'unknown'}
                                                onChange={() => handleFacilityChange(facilityKey, 'unknown')}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* エラーメッセージ */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    disabled={loading}
                >
                    閉じる
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || loading}
                >
                    {loading ? '送信中...' : 'レビューを送信'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewDialog;
