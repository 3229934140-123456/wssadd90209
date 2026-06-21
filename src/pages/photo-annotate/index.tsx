import React, { useState, useCallback } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { POINT_COLORS } from '@/types'
import type { PhotoMarker } from '@/types'

const MARKER_LABELS = ['额纹', '鱼尾纹', '眉间纹', '苹果肌', '鼻唇沟', '下巴', '太阳穴', '下颌缘', '上唇', '下唇', '鼻背纹', '口周']

const PhotoAnnotatePage: React.FC = () => {
  const router = useRouter()
  const photoId = router.params.photoId as string
  const photoUrl = decodeURIComponent(router.params.photoUrl || '')
  const photoType = router.params.photoType as string

  const { currentInjection, addPhoto } = useAppStore()

  const existingPhoto = currentInjection?.photos?.find(p => p.id === photoId)
  const [markers, setMarkers] = useState<PhotoMarker[]>(existingPhoto?.markers || [])
  const [selectedColor, setSelectedColor] = useState(POINT_COLORS[0])
  const [selectedLabel, setSelectedLabel] = useState(MARKER_LABELS[0])
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  const handleImageClick = useCallback((e: any) => {
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e.detail
    if (!touch) return

    const query = Taro.createSelectorQuery()
    query.select('#annotateImage').boundingClientRect((rect: any) => {
      if (!rect) return
      const x = Math.round(((touch.clientX - rect.left) / rect.width) * 100)
      const y = Math.round(((touch.clientY - rect.top) / rect.height) * 100)

      if (x < 0 || x > 100 || y < 0 || y > 100) return

      const newMarker: PhotoMarker = {
        id: `mk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        x,
        y,
        color: selectedColor,
        label: selectedLabel
      }
      setMarkers(prev => [...prev, newMarker])
    }).exec()
  }, [selectedColor, selectedLabel])

  const handleRemoveMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId))
  }

  const handleSave = () => {
    if (!currentInjection) return

    const photoIndex = currentInjection.photos?.findIndex(p => p.id === photoId)
    if (photoIndex !== undefined && photoIndex >= 0) {
      const updatedPhotos = [...currentInjection.photos]
      updatedPhotos[photoIndex] = {
        ...updatedPhotos[photoIndex],
        markers
      }
      const updatedInjection = {
        ...currentInjection,
        photos: updatedPhotos,
        updateTime: new Date().toISOString()
      }
      useAppStore.setState({ currentInjection: updatedInjection })
    } else {
      const newPhoto = {
        id: photoId || `photo_${Date.now()}`,
        type: (photoType || 'front') as 'front' | 'side_left' | 'side_right' | 'oblique',
        url: photoUrl,
        markers,
        createTime: new Date().toISOString()
      }
      addPhoto(newPhoto)
    }

    Taro.showToast({ title: '标注已保存', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  }

  const photoTypeText = (type: string) => {
    const map: Record<string, string> = { front: '正面', side_left: '左侧面', side_right: '右侧面', oblique: '斜位' }
    return map[type] || '照片'
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>照片标注</Text>
        <Text className={styles.subtitle}>{photoTypeText(photoType)} - 点击照片添加进针标记</Text>
      </View>

      <View className={styles.toolBar}>
        <View className={styles.colorRow}>
          <Text className={styles.toolLabel}>标记颜色</Text>
          <View className={styles.colorOptions}>
            {POINT_COLORS.map(c => (
              <View
                key={c}
                className={classnames(styles.colorDot, { [styles.colorActive]: selectedColor === c })}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </View>
        </View>
        <View className={styles.labelRow}>
          <Text className={styles.toolLabel}>标记区域</Text>
          <Button className={styles.labelBtn} onClick={() => setShowLabelPicker(!showLabelPicker)}>
            {selectedLabel} ▾
          </Button>
        </View>
      </View>

      {showLabelPicker && (
        <View className={styles.labelPicker}>
          {MARKER_LABELS.map(label => (
            <Button
              key={label}
              className={classnames(styles.labelOption, { [styles.labelActive]: selectedLabel === label })}
              onClick={() => { setSelectedLabel(label); setShowLabelPicker(false) }}
            >
              {label}
            </Button>
          ))}
        </View>
      )}

      <View
        className={styles.imageContainer}
        onClick={handleImageClick}
      >
        <Image
          id='annotateImage'
          className={styles.annotateImage}
          src={photoUrl}
          mode='widthFix'
        />
        {markers.map(marker => (
          <View
            key={marker.id}
            className={styles.marker}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            onClick={(e) => { e.stopPropagation(); handleRemoveMarker(marker.id) }}
          >
            <View className={styles.markerDot} style={{ background: marker.color }} />
            <View className={styles.markerLabel} style={{ background: marker.color }}>
              {marker.label}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.markerList}>
        <Text className={styles.listTitle}>已添加标记 ({markers.length})</Text>
        {markers.length === 0 ? (
          <Text className={styles.emptyHint}>点击照片添加进针位置标记</Text>
        ) : (
          markers.map(marker => (
            <View key={marker.id} className={styles.markerItem}>
              <View className={styles.markerColor} style={{ background: marker.color }} />
              <Text className={styles.markerName}>{marker.label}</Text>
              <Text className={styles.markerPos}>({marker.x}%, {marker.y}%)</Text>
              <Button className={styles.removeBtn} onClick={() => handleRemoveMarker(marker.id)}>×</Button>
            </View>
          ))
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.bottomBtn, styles.btnSecondary)} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={classnames(styles.bottomBtn, styles.btnPrimary)} onClick={handleSave}>
          保存标注
        </Button>
      </View>
    </ScrollView>
  )
}

export default PhotoAnnotatePage
