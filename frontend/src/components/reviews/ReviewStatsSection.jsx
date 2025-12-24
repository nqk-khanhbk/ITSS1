import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Stack,
    Typography,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid
} from '@mui/material';
import axios from 'axios';

const ReviewStatsSection = ({ placeId, refreshTrigger }) => {
    const [stats, setStats] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (placeId) {
            fetchStats();
        }
    }, [placeId, refreshTrigger]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3000/api/reviews/stats/${placeId}`,
                { withCredentials: true }
            );
            setStats(response.data.data);
        } catch (err) {
            console.error('Error loading review stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!stats && !loading) {
        return null;
    }

    const avgRating = stats?.avgRating || 0;
    const totalReviews = stats?.totalReviews || 0;
    const ratingDistribution = stats?.ratingDistribution || {};
    const facilitiesStats = stats?.facilitiesStats || {};

    const getRatingPercentage = (ratingValue) => {
        if (totalReviews === 0) return 0;
        return ((ratingDistribution[ratingValue] || 0) / totalReviews) * 100;
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                {/* Left: Rating */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight={800}>
                        {avgRating.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        / 5.0
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        ({totalReviews} 件)
                    </Typography>
                </Box>

                {/* Right: Button */}
                <Box
                    onClick={() => setOpenDetailsDialog(true)}
                    sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        bgcolor: '#f9f9f9',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 860,
                        height: 110,
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="body1" fontWeight={600} color="primary">
                        レビューを見る →
                    </Typography>
                </Box>
            </Box>


            {/* 詳細ダイアログ */}
            <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
                    レビューの詳細
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {/* 評価分布 */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            評価分布
                        </Typography>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <Box key={rating} sx={{ mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {rating}★
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getRatingPercentage(rating)}
                                            sx={{ height: 12, borderRadius: 6 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'right' }}>
                                        {ratingDistribution[rating] || 0} ({getRatingPercentage(rating).toFixed(0)}%)
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                    </Box>

                    {/* サービス統計テーブル */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            サービス統計
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            サービス名
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                            ある
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                            ない
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                            気づかなかった
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(facilitiesStats).map(([facility, stats]) => (
                                        <TableRow key={facility} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                            <TableCell sx={{ py: 1 }}>
                                                {facility}
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1 }}>
                                                {stats.yes || 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1 }}>
                                                {stats.no || 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1 }}>
                                                {stats.unknown || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDetailsDialog(false)} variant="contained">
                        閉じる
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ReviewStatsSection;
