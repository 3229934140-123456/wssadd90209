import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockReceptionList } from '@/data/mockReception'
import { formatDate, formatTime, getStatusText, getProjectTypeText } from '@/utils/date'
import type { ReceptionItem } from '@/types'

type FilterType = 'all' | 'waiting' | 'in_progress' | 'completed' | 'cancelled'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'waiting', label: '待接诊' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const ReceptionPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { receptionList, setReceptionList, updateReceptionStatus, setCurrentCustomer, customers } = useAppStore()

  useEffect(() => {
    console.log('[Reception] Initializing with mock data')
    setReceptionList(mockReceptionList)
  }, [setReceptionList])

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return receptionList
    return receptionList.filter(item => item.status === activeFilter)
  }, [receptionList, activeFilter])

  const stats = useMemo(() => {
    return {
      total: receptionList.length,
      waiting: receptionList.filter(r => r.status === 'waiting').length,
      inProgress: receptionList.filter(r => r.status === 'in_progress').length,
      completed: receptionList.filter(r => r.status === 'completed').length
    }
  }, [receptionList])

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      waiting: styles.statusWaiting,
      in_progress: styles.statusInProgress,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled
    }
    return classMap[status] || ''
  }

  const handleStartInjection = (item: ReceptionItem) => {
    console.log('[Reception] Start injection for:', item.customerName)
    const customer = customers.find(c => c.id === item.customerId)
    if (customer) {
      setCurrentCustomer(customer)
    }
    updateReceptionStatus(item.id, 'in_progress')
    Taro.switchTab({ url: '/pages/injection/index' })
  }

  const handleViewCustomer = (item: ReceptionItem) => {
    console.log('[Reception] View customer:', item.customerName)
    const customer = customers.find(c => c.id === item.customerId)
    if (customer) {
      setCurrentCustomer(customer)
      Taro.navigateTo({ url: '/pages/customer-detail/index' })
    }
  }

  const handleComplete = (item: ReceptionItem) => {
    console.log('[Reception] Complete reception:', item.id)
    updateReceptionStatus(item.id, 'completed')
    Taro.showToast({ title: '接诊完成', icon: 'success' })
  }

  const handleRefresh = () => {
    console.log('[Reception] Pull to refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
      Taro.showToast({ title: '刷新成功', icon: 'none' })
    }, 1000)
  }

  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.onPullDownRefresh(handleRefresh)
    }
  }, [])

  const today = formatDate(new Date(), 'YYYY年MM月DD日')

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.dateSection}>
          <Text className={styles.dateText}>{today}</Text>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>今日预约</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.waiting}</Text>
            <Text className={styles.statLabel}>待接诊</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.inProgress}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        {FILTERS.map(filter => (
          <Button
            key={filter.value}
            className={classnames(styles.filterItem, {
              [styles.filterActive]: activeFilter === filter.value
            })}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </View>

      <View className={styles.listSection}>
        <Text className={styles.sectionTitle}>
          接诊列表 {filteredList.length > 0 && `(${filteredList.length})`}
        </Text>

        {filteredList.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text style={{ fontSize: '48rpx', color: '#C9CDD4' }}>📋</Text>
            </View>
            <Text className={styles.emptyText}>暂无就诊记录</Text>
          </View>
        ) : (
          filteredList.map(item => (
            <View key={item.id} className={styles.receptionCard}>
              <View className={styles.cardHeader}>
                <Image
                  className={styles.avatar}
                  src={item.customerAvatar}
                  mode='aspectFill'
                />
                <View className={styles.info}>
                  <View className={styles.nameRow}>
                    <Text className={styles.name}>{item.customerName}</Text>
                    <View
                      className={classnames(styles.statusBadge, getStatusClass(item.status))}
                    >
                      {getStatusText(item.status)}
                    </View>
                  </View>
                  <View className={styles.timeRow}>
                    <Text className={styles.time}>
                      预约时间：{formatTime(item.appointmentTime)}
                    </Text>
                    <Text className={styles.room}>{item.roomNumber}</Text>
                  </View>
                </View>
              </View>

              <View className={styles.projectInfo}>
                <Text className={styles.projectName}>
                  {getProjectTypeText(item.projectType)} · {item.projectName}
                </Text>
                <Text className={styles.nurseName}>护士：{item.nurseName}</Text>
              </View>

              {item.status === 'waiting' && (
                <View className={styles.actions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnSecondary)}
                    onClick={() => handleViewCustomer(item)}
                  >
                    查看档案
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => handleStartInjection(item)}
                  >
                    开始接诊
                  </Button>
                </View>
              )}

              {item.status === 'in_progress' && (
                <View className={styles.actions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnSecondary)}
                    onClick={() => handleViewCustomer(item)}
                  >
                    查看档案
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => handleComplete(item)}
                  >
                    完成接诊
                  </Button>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

export default ReceptionPage
