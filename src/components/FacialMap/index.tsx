import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { FacialPoint, InjectionRecordPoint, InjectionProjectType } from '@/types'
import { FACIAL_POINTS_CONFIG, POINT_COLORS } from '@/types'

interface FacialMapProps {
  projectType: InjectionProjectType
  selectedPoints: InjectionRecordPoint[]
  onPointClick: (point: FacialPoint) => void
  onPointRemove?: (pointId: string) => void
  showLabels?: boolean
}

const FacialMap: React.FC<FacialMapProps> = ({
  projectType,
  selectedPoints,
  onPointClick,
  onPointRemove,
  showLabels = true
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

  const facialPoints = FACIAL_POINTS_CONFIG[projectType] || []

  const isPointSelected = (pointId: string) => {
    return selectedPoints.some(p => p.pointId === pointId)
  }

  const getSelectedPoint = (pointId: string) => {
    return selectedPoints.find(p => p.pointId === pointId)
  }

  const handlePointClick = (point: FacialPoint) => {
    const selected = getSelectedPoint(point.id)
    if (selected && onPointRemove) {
      onPointRemove(point.id)
    } else {
      onPointClick(point)
    }
  }

  return (
    <View className={styles.container}>
      <View className={styles.faceContainer}>
        <View className={styles.faceOutline}>
          <View className={styles.faceShape} />

          <View className={styles.eyeBrowLeft} />
          <View className={styles.eyeBrowRight} />

          <View className={styles.eyeLeft} />
          <View className={styles.eyeRight} />

          <View className={styles.nose} />

          <View className={styles.lipUpper} />
          <View className={styles.lipLower} />
        </View>

        {facialPoints.map((point, index) => {
          const isSelected = isPointSelected(point.id)
          const selectedPoint = getSelectedPoint(point.id)
          const pointColor = selectedPoint?.color || POINT_COLORS[index % POINT_COLORS.length]
          const isHovered = hoveredPoint === point.id

          return (
            <View
              key={point.id}
              className={classnames(styles.point, {
                [styles.pointSelected]: isSelected,
                [styles.pointHovered]: isHovered
              })}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                backgroundColor: isSelected ? pointColor : 'rgba(24, 144, 255, 0.3)',
                borderColor: pointColor
              }}
              onClick={() => handlePointClick(point)}
              onTouchStart={() => setHoveredPoint(point.id)}
              onTouchEnd={() => setHoveredPoint(null)}
            >
              {isSelected && selectedPoint && (
                <Text className={styles.pointDose}>{selectedPoint.totalDose}</Text>
              )}

              {(isHovered || isSelected) && showLabels && (
                <View
                  className={classnames(styles.pointLabel, {
                    [styles.labelLeft]: point.x > 50
                  })}
                >
                  <Text className={styles.pointLabelText}>{point.name}</Text>
                  {selectedPoint && (
                    <Text className={styles.pointLabelDetail}>
                      {selectedPoint.needleCount}针 · {selectedPoint.totalDose}单位
                    </Text>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </View>

      <View className={styles.legend}>
        <Text className={styles.legendTitle}>点位说明</Text>
        <View className={styles.legendList}>
          {facialPoints.slice(0, 6).map((point, index) => (
            <View key={point.id} className={styles.legendItem}>
              <View
                className={styles.legendDot}
                style={{ backgroundColor: POINT_COLORS[index % POINT_COLORS.length] }}
              />
              <Text className={styles.legendText}>{point.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default FacialMap
