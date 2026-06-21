import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Customer } from '@/types'
import { formatDate } from '@/utils/date'

interface CustomerCardProps {
  customer: Customer
  onClick?: () => void
  showStats?: boolean
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, showStats = true }) => {
  const genderText = customer.gender === 'female' ? '女' : '男'

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Image className={styles.avatar} src={customer.avatar} mode='aspectFill' />
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{customer.name}</Text>
            <Text className={styles.genderAge}>{genderText} · {customer.age}岁</Text>
          </View>
          <Text className={styles.phone}>{customer.phone}</Text>
        </View>
        {customer.allergyHistory.length > 0 && (
          <View className={classnames('badge', styles.allergyBadge)}>过敏史</View>
        )}
      </View>

      {showStats && (
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{customer.totalVisits}</Text>
            <Text className={styles.statLabel}>就诊次数</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatDate(customer.lastVisitDate)}</Text>
            <Text className={styles.statLabel}>末次就诊</Text>
          </View>
        </View>
      )}

      {customer.notes && (
        <View className={styles.notes}>
          <Text className={styles.notesLabel}>备注：</Text>
          <Text className={styles.notesText}>{customer.notes}</Text>
        </View>
      )}
    </View>
  )
}

export default CustomerCard
