import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Medicine } from '@/types'
import { formatDate, isExpired } from '@/utils/date'

interface MedicineItemProps {
  medicine: Medicine
  onRemove?: () => void
  showActions?: boolean
}

const MedicineItem: React.FC<MedicineItemProps> = ({ medicine, onRemove, showActions = true }) => {
  const expired = isExpired(medicine.expiryDate)

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.nameSection}>
          <Text className={styles.name}>{medicine.name}</Text>
          <Text className={styles.brand}>{medicine.brand}</Text>
        </View>
        {expired && (
          <View className={classnames('badge', styles.expiredBadge)}>已过期</View>
        )}
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>批号</Text>
          <Text className={styles.infoValue}>{medicine.batchNumber}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>有效期</Text>
          <Text className={classnames(styles.infoValue, expired && styles.textError)}>
            {formatDate(medicine.expiryDate)}
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>规格</Text>
          <Text className={styles.infoValue}>{medicine.specification}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>扫码时间</Text>
          <Text className={styles.infoValue}>{formatDate(medicine.scanTime)}</Text>
        </View>
      </View>

      <View className={styles.quantitySection}>
        <View className={styles.quantityBar}>
          <View
            className={styles.usedBar}
            style={{ width: `${(medicine.usedQuantity / medicine.totalQuantity) * 100}%` }}
          />
        </View>
        <View className={styles.quantityInfo}>
          <View className={styles.quantityItem}>
            <Text className={styles.quantityLabel}>总剂量</Text>
            <Text className={styles.quantityValue}>{medicine.totalQuantity}</Text>
          </View>
          <View className={styles.quantityItem}>
            <Text className={styles.quantityLabel}>已使用</Text>
            <Text className={classnames(styles.quantityValue, styles.usedValue)}>
              {medicine.usedQuantity}
            </Text>
          </View>
          <View className={styles.quantityItem}>
            <Text className={styles.quantityLabel}>剩余量</Text>
            <Text className={classnames(styles.quantityValue, styles.remainingValue)}>
              {medicine.remainingQuantity}
            </Text>
          </View>
        </View>
      </View>

      {showActions && onRemove && (
        <View className={styles.actions}>
          <Text className={styles.removeBtn} onClick={onRemove}>移除</Text>
        </View>
      )}
    </View>
  )
}

export default MedicineItem
