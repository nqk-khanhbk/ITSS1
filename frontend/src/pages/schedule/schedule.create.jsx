import { useState } from 'react';
import './schedule.create.css';

const CLOUDINARY_UPLOAD_PRESET = 'itss1_upload'; // Thay bằng preset của bạn
const CLOUDINARY_CLOUD_NAME = 'dxudvl25z'; // Thay bằng cloud name của bạn

const ScheduleCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    date: '',
    coverImage: null,
    tags: [],
    items: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Handle drag start
  const handleDragStart = (e, id) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    
    if (draggedItem === targetId) return;
    
    const draggedIndex = formData.items.findIndex(item => item.id === draggedItem);
    const targetIndex = formData.items.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newItems = [...formData.items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    
    setFormData({ ...formData, items: newItems });
    setDraggedItem(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Move timeline item up or down
  const moveTimelineItem = (id, direction) => {
    const index = formData.items.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.items.length) return;
    
    const newItems = [...formData.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setFormData({ ...formData, items: newItems });
  };

  // Add timeline item
  const addTimelineItem = () => {
    const newItem = {
      id: Date.now(),
      customPlaceName: '',
      placeLink: '',
      startTime: '',
      endTime: '',
      image: null,
      caution: '',
      note: '',
      transport: 'Ô tô',
      priceMin: '',
      priceMax: ''
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  // Remove timeline item
  const removeTimelineItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  // Update timeline item
  const updateTimelineItem = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  // Handle image upload
  const handleImageUpload = async (e, id = null) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        
        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        
        if (id) {
          updateTimelineItem(id, 'image', imageUrl);
        } else {
          setFormData({ ...formData, coverImage: imageUrl });
        }
      } catch (error) {
        alert('Đã xảy ra lỗi khi tải ảnh lên!');
        console.error('Image upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Extract place_id from placeLink
  const extractPlaceId = (placeLink) => {
    if (!placeLink) return null;
    
    try {
      // Match pattern: /places/[id] or just the ID
      const match = placeLink.match(/\/places\/([a-zA-Z0-9]+)/) || placeLink.match(/^([a-zA-Z0-9]+)$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting place_id:', error);
      return null;
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.title.trim()) {
        alert('Vui lòng nhập tiêu đề');
        return;
      }

      if (formData.items.length === 0) {
        alert('Vui lòng thêm ít nhất một item vào kế hoạch');
        return;
      }

      setUploading(true);

      // Prepare data for API
      const dayPlanData = {
        user_id: '693791edb4a4ce2737d360d7', // TODO: Lấy từ auth context/cookies
        title: formData.title,
        note: formData.note,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        cover_image: formData.coverImage || '',
        tags: formData.tags,
        items: formData.items.map((item, index) => {
          const placeId = extractPlaceId(item.placeLink);
          
          return {
            place_id: placeId, // Lấy từ placeLink
            custom_place_name: item.customPlaceName,
            start_time: item.startTime,
            end_time: item.endTime,
            image: item.image || '',
            note: item.caution, // Miêu tả cho item
            caution: item.note, // Điểm chú ý cho item
            transport: item.transport,
            price_range: {
              min: parseInt(item.priceMin) || 0,
              max: parseInt(item.priceMax) || 0
            },
            sort_order: index + 1
          };
        })
      };

      console.log('Submitting:', dayPlanData);

      // Call API
      const response = await fetch('http://localhost:3000/api/day-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Gửi cookies
        body: JSON.stringify(dayPlanData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }

      alert('Tạo kế hoạch thành công!');
      console.log('Created day plan:', result.data);
      
      // Reset form
      setFormData({
        title: '',
        note: '',
        date: '',
        coverImage: null,
        tags: [],
        items: []
      });
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Có lỗi xảy ra!');
    } finally {
      setUploading(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    alert('Đã lưu nháp!');
  };

  return (
    <div className="schedule-create-container">
      <div className="schedule-create-content">
        {/* Left Column */}
        <div className="left-column">
          {/* Title */}
          <h1 className="page-title">一日プラン作成</h1>

          {/* Title Input */}
          <div className="form-group">
            <label className="form-label">タイトル</label>
            <input
              type="text"
              className="form-input"
              placeholder="タイトルを入力"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">プランの注記</label>
            <textarea
              className="form-textarea"
              placeholder="注記を入力してください (オプション)"
              rows="4"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <div className="timeline-header">
              <label className="form-label">タイムライン</label>
            </div>

            {formData.items.map((item, index) => (
              <div 
                key={item.id} 
                className={`timeline-item ${draggedItem === item.id ? 'dragging' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="timeline-item-header">
                  <div className="time-inputs">
                    <div className="time-input-group">
                      <span className="time-icon">🕐</span>
                      <input
                        type="time"
                        className="time-input"
                        value={item.startTime}
                        onChange={(e) => updateTimelineItem(item.id, 'startTime', e.target.value)}
                      />
                    </div>
                    <span className="time-separator">-</span>
                    <div className="time-input-group">
                      <span className="time-icon">🕐</span>
                      <input
                        type="time"
                        className="time-input"
                        value={item.endTime}
                        onChange={(e) => updateTimelineItem(item.id, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="timeline-actions">
                    <div className="menu-wrapper">
                      <button 
                        className="btn-icon" 
                        title="Menu"
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      >
                        ⋮
                      </button>
                      {activeMenu === item.id && (
                        <div className="dropdown-menu">
                          <button 
                            className="menu-item"
                            onClick={() => { moveTimelineItem(item.id, 'up'); setActiveMenu(null); }}
                            disabled={index === 0}
                          >
                            ↑ 上に移動
                          </button>
                          <button 
                            className="menu-item"
                            onClick={() => { moveTimelineItem(item.id, 'down'); setActiveMenu(null); }}
                            disabled={index === formData.items.length - 1}
                          >
                            ↓ 下に移動
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => removeTimelineItem(item.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="timeline-item-content">
                  {/* Place Link and Name Inputs */}
                  <div className="place-info-inputs">
                    <input
                      type="text"
                      className="place-name-input"
                      placeholder="Công viên nước Hồ Tây"
                      value={item.customPlaceName}
                      onChange={(e) => updateTimelineItem(item.id, 'customPlaceName', e.target.value)}
                    />
                    <input
                      type="url"
                      className="place-link-input"
                      placeholder="リンクを入力"
                      value={item.placeLink}
                      onChange={(e) => updateTimelineItem(item.id, 'placeLink', e.target.value)}
                    />
                  </div>

                  <div className="timeline-item-body">
                    {/* Image Upload */}
                    <div className="image-upload-box">
                      {item.image ? (
                        <img src={item.image} alt="Preview" className="preview-image" />
                      ) : (
                        <div className="image-placeholder">
                          <span className="placeholder-icon">📷</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, item.id)}
                        className="file-input"
                        id={`file-${item.id}`}
                      />
                      <label htmlFor={`file-${item.id}`} className="file-label">
                        画像を選択
                      </label>
                    </div>

                    {/* Description */}
                    <textarea
                      className="item-description"
                      placeholder="場所についての説明..."
                      rows="6"
                      value={item.caution}
                      onChange={(e) => updateTimelineItem(item.id, 'caution', e.target.value)}
                    />
                  </div>

                  {/* Bottom Info */}
                  <div className="timeline-item-footer">
                    {/* Transport */}
                    <div className="footer-item">
                      <label className="footer-label">車両</label>
                      <select
                        className="footer-select"
                        value={item.transport}
                        onChange={(e) => updateTimelineItem(item.id, 'transport', e.target.value)}
                      >
                        <option value="Ô tô">🚗 Ô tô</option>
                        <option value="Xe máy">🏍️ Xe máy</option>
                        <option value="Đi bộ">🚶 Đi bộ</option>
                        <option value="Xe bus">🚌 Xe bus</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="footer-item footer-item-price">
                      <label className="footer-label">💴 金額</label>
                      <div className="price-range-inputs">
                        <input
                          type="number"
                          className="footer-input price-input"
                          placeholder="最小"
                          value={item.priceMin}
                          onChange={(e) => updateTimelineItem(item.id, 'priceMin', e.target.value)}
                        />
                        <span className="price-separator">~</span>
                        <input
                          type="number"
                          className="footer-input price-input"
                          placeholder="最大"
                          value={item.priceMax}
                          onChange={(e) => updateTimelineItem(item.id, 'priceMax', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Note/Caution Point */}
                    <div className="footer-item">
                      <label className="footer-label">注意点</label>
                      <input
                        type="text"
                        className="footer-input"
                        placeholder="注意点を入力"
                        value={item.note}
                        onChange={(e) => updateTimelineItem(item.id, 'note', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Timeline Button */}
            <button className="btn-add-timeline" onClick={addTimelineItem}>
              + タイムライン項目
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-secondary" 
              onClick={handleSaveDraft}
              disabled={uploading}
            >
              {uploading ? 'Đang xử lý...' : '下書き保存'}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'Đang xử lý...' : '公開'}
            </button>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label">実施</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label className="form-label">カバー画像</label>
            <div className="cover-image-upload">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover" className="cover-preview" />
              ) : (
                <div className="cover-placeholder">
                  <span className="placeholder-text">画像をアップロード</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e)}
                className="file-input"
                id="cover-file"
              />
              <label htmlFor="cover-file" className="file-label-cover">
                画像を選択
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">タグ</label>
            <div className="tags-input-wrapper">
              <input
                type="text"
                className="tags-input"
                placeholder="タグを追加 (例: 観光、食事...)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button className="btn-add-tag" onClick={addTag}>
                追加
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button className="tag-remove" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreate;