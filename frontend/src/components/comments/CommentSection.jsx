import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    Box,
    Stack,
    Typography,
    Avatar,
    TextField,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Pagination
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { getCookie } from '../../helpers/cookies.helper';

const CommentSection = ({ placeId, placeName }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);

    const LIMIT = 5;

    // Lấy user hiện tại từ cookie
    useEffect(() => {
        try {
            const userStr = getCookie('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUser(user);
            }
        } catch (e) {
            console.warn('Failed to get user from cookie', e);
        }
    }, []);

    // Lấy danh sách comments
    useEffect(() => {
        if (!placeId) return;
        fetchComments(1);
    }, [placeId]);

    const fetchComments = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `http://localhost:3000/api/comments/${placeId}?page=${pageNum}&limit=${LIMIT}`,
                {
                    withCredentials: true
                }
            );
            
            if (response.data && response.data.success) {
                setComments(response.data.data || []);
                setPage(pageNum);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                throw new Error(response.data?.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Fetch comments error:', err);
            // Kiểm tra nếu là lỗi 404 (place không tồn tại) thì show thông báo khác
            if (err.response?.status === 404) {
                setError('Địa điểm không tồn tại.');
            } else {
                setError('Không thể tải comments. Vui lòng thử lại.');
            }
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    // Tạo comment mới
    const handleCreateComment = async () => {
        if (!newComment.trim()) {
            toast.error('コメント内容を入力してください。');
            return;
        }

        if (!currentUser) {
            toast.error('コメントするにはログインしてください');
            return;
        }

        try {
            setSubmitting(true);
            
            const response = await axios.post(
                'http://localhost:3000/api/comments',
                {
                    place_id: placeId,
                    content: newComment.trim()
                },
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                setNewComment('');
                
                // Thêm comment mới trực tiếp vào danh sách (nếu đang ở trang 1)
                if (page === 1 && response.data.data) {
                    setComments(prevComments => [response.data.data, ...prevComments]);
                } else {
                    // Nếu ở trang khác, reload lại trang 1
                    await fetchComments(1);
                }
                
                //alert('Bình luận thành công!');
            } else {
                throw new Error(response.data?.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Create comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi tạo bình luận';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Mở menu (3 chấm)
    const handleMenuOpen = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    // Bắt đầu chỉnh sửa
    const handleEditStart = () => {
        if (selectedComment) {
            setEditingId(selectedComment._id);
            setEditContent(selectedComment.content);
            handleMenuClose();
        }
    };

    // Lưu chỉnh sửa
    const handleEditSave = async () => {
        if (!editContent.trim()) {
            toast.error('内容を空欄にすることはできません');
            return;
        }

        try {
            setSubmitting(true);
            
            const response = await axios.put(
                `http://localhost:3000/api/comments/${editingId}`,
                { content: editContent.trim() },
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                // Cập nhật comment trực tiếp trong state
                if (response.data.data) {
                    setComments(prevComments =>
                        prevComments.map(comment =>
                            comment._id === editingId
                                ? response.data.data
                                : comment
                        )
                    );
                } else {
                    // Nếu không có data, reload từ server
                    await fetchComments(page);
                }
                
                setEditingId(null);
                setEditContent('');
                toast.success('コメントが正常に更新されました！');
            } else {
                throw new Error(response.data?.message || '不明なエラー');
            }
        } catch (err) {
            console.error('Update comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'コメントの更新に失敗しました';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Hủy chỉnh sửa
    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    // Mở dialog xác nhận xóa
    const handleDeleteStart = () => {
        if (selectedComment) {
            setDeleteCommentId(selectedComment._id);
            setOpenDeleteDialog(true);
            handleMenuClose();
        }
    };

    // Xóa comment
    const handleDeleteConfirm = async () => {
        try {
            setSubmitting(true);
            
            const response = await axios.delete(
                `http://localhost:3000/api/comments/${deleteCommentId}`,
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                // Xóa comment trực tiếp từ state
                setComments(prevComments =>
                    prevComments.filter(comment => comment._id !== deleteCommentId)
                );
                
                setOpenDeleteDialog(false);
                setDeleteCommentId(null);
                toast.success('コメントが正常に削除されました！');
            } else {
                throw new Error(response.data?.message || '不明なエラー');
            }
        } catch (err) {
            console.error('Delete comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'コメントの削除に失敗しました';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Kiểm tra user có quyền sửa/xóa không
    const isOwner = (commentUserId) => {
        return currentUser && currentUser._id === commentUserId;
    };

    if (loading && comments.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            {/* Tiêu đề */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    コメント ({comments.length})
                </Typography>
            </Stack>

            {/* Form tạo comment mới */}
            {currentUser ? (
                <Paper sx={{ p: 2.5, mb: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar 
                                src={currentUser.avatar} 
                                alt={currentUser.fullName}
                                sx={{ width: 40, height: 40 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {currentUser.fullName}
                                </Typography>
                            </Box>
                        </Stack>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="このスポットについてあなたの意見を共有してください..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            variant="outlined"
                            size="small"
                            disabled={submitting}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5
                                }
                            }}
                        />

                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button
                                variant="text"
                                onClick={() => setNewComment('')}
                                disabled={submitting}
                            >
                                キャンセル
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<SendIcon />}
                                onClick={handleCreateComment}
                                disabled={submitting || !newComment.trim()}
                            >
                                {submitting ? '送信中...' : 'コメントを送信'}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                    コメントするには<strong>ログイン</strong>してください
                </Alert>
            )}

            {/* Thông báo lỗi */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Danh sách comments */}
            <Stack spacing={2.5}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <Box key={comment._id}>
                            {editingId === comment._id ? (
                                // Form chỉnh sửa
                                <Paper sx={{ p: 2.5, bgcolor: '#fafafa', borderRadius: 2 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <Avatar 
                                                src={comment.user_id?.avatar} 
                                                alt={comment.user_id?.fullName}
                                                sx={{ width: 40, height: 40 }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {comment.user_id?.fullName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(comment.created_at).toLocaleString('vi-VN')}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            disabled={submitting}
                                        />

                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <Button
                                                variant="text"
                                                onClick={handleEditCancel}
                                                disabled={submitting}
                                            >
                                                キャンセル
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleEditSave}
                                                disabled={submitting}
                                            >
                                                {submitting ? '保存中...' : '保存'}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ) : (
                                // Hiển thị comment
                                <Paper sx={{ p: 2.5, borderRadius: 2, '&:hover': { bgcolor: '#fafafa' } }}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Avatar 
                                            src={comment.user_id?.avatar} 
                                            alt={comment.user_id?.fullName}
                                            sx={{ width: 40, height: 40 }}
                                        />

                                        <Box sx={{ flexGrow: 1 }}>
                                            <Stack 
                                                direction="row" 
                                                justifyContent="space-between" 
                                                alignItems="flex-start"
                                                sx={{ mb: 0.5 }}
                                            >
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {comment.user_id?.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(comment.created_at).toLocaleString('ja-JP', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </Box>

                                                {/* Nút 3 chấm - chỉ hiển thị cho chủ comment */}
                                                {isOwner(comment.user_id?._id) && (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleMenuOpen(e, comment)}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Stack>

                                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                                {comment.content}
                                            </Typography>

                                            {comment.review_id && (
                                                <Chip 
                                                    label={`⭐ Review: ${comment.review_id.rating || comment.review_id}/5`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 1 }}
                                                />
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        まだコメントがありません。最初のコメントを書きましょう!
                    </Typography>
                )}
            </Stack>

            {/* Phân trang */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        color="primary" 
                        page={page} 
                        onChange={(event, value) => fetchComments(value)}
                        disabled={loading}
                    />
                </Box>
            )}

            {/* Menu (3 chấm) */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditStart}>
                    編集
                </MenuItem>
                <MenuItem onClick={handleDeleteStart} sx={{ color: 'error.main' }}>
                    削除
                </MenuItem>
            </Menu>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>削除の確認</DialogTitle>
                <DialogContent>
                    <Typography>
                        このコメントを削除してもよろしいですか?このアクションは元に戻せません。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        キャンセル
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? '削除中...' : '削除'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommentSection;
