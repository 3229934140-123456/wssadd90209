import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockCustomers } from '@/data/mockCustomers'
import { formatDate, getProjectTypeText } from '@/utils/date'

const CustomerDetailPage: React.FC = () => {
  const router = useRouter()
  const customerId = router.params.id as string
  const {
    customers,
    setCustomers,
    currentCustomer,
    setCurrentCustomer,
    injectionRecords
  } = useAppStore()

  const [customer, setCustomer] = useState<any>(null)
  const [customerHistory, setCustomerHistory] = useState<any[]>([])

  useEffect(() => {
    console.log('[CustomerDetail] Initializing with mock data')
    setCustomers(mockCustomers)
  }, [setCustomers])

  useDidShow(() => {
    console.log('[CustomerDetail] Page did show, customerId:', customerId)
    if (customerId) {
      const found = customers.find(c => c.id === customerId) || mockCustomers[0]
      setCustomer(found)
      setCurrentCustomer(found)
      const history = injectionRecords.filter(r => r.customerId === customerId)
      setCustomerHistory(history)
    } else {
      setCustomer(mockCustomers[0])
      setCurrentCustomer(mockCustomers[0])
    }
  })

  if (!customer) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🔍</View>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    )
  }

  const handleStartInjection = () => {
    console.log('[CustomerDetail] Start injection for:', customer.name)
    Taro.navigateTo({ url: '/pages/injection/index' })
  }

  const handleViewRecord = (record: any) => {
    console.log('[CustomerDetail] View record:', record.id)
    Taro.navigateTo({ url: `/pages/injection-detail/index?id=${record.id}` })
  }

  const handleEditCustomer = () => {
    console.log('[CustomerDetail] Edit customer:', customer.name)
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Image
            className={styles.avatar}
            src={customer.avatar}
            mode='aspectFill'
          />
          <View className={styles.customerInfo}>
            <View className={styles.nameRow}>
              <Text className={styles.customerName}>{customer.name}</Text>
            </View>
            <Text className={styles.baseInfo}>
              {customer.gender === 'female' ? '女' : '男'} · {customer.age}岁
            </Text>
            <Text className={styles.phone}>{customer.phone}</Text>
          </View>
          <Button className={styles.floatingBtn} onClick={handleEditCustomer}>
            ✎
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{customer.totalVisits || 0}</View>
            <View className={styles.statLabel}>就诊次数</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{customer.lastVisitDate ? formatDate(customer.lastVisitDate) : '-'}</View>
            <View className={styles.statLabel}>上次就诊</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{customer.medicalHistory && customer.medicalHistory.length > 0 ? customer.medicalHistory.join('、') : '无'}</View>
            <View className={styles.statLabel}>病史</View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>建档日期</Text>
            <Text className={styles.infoValue}>{formatDate(customer.createTime)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <Text className={styles.infoValue}>{customer.phone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>过敏史</Text>
            {customer.allergyHistory && customer.allergyHistory.length > 0 ? (
              <View className={styles.allergyTag}>
                {customer.allergyHistory.join('、')}
              </View>
            ) : (
              <Text className={styles.infoValue}>无</Text>
            )}
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>客户备注</Text>
            <Text className={styles.infoValue}>{customer.notes || '无'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>就诊历史</Text>
          <Text style={{ fontSize: '24rpx', color: '#86909C' }}>共 {customerHistory.length} 条</Text>
        </View>

        {customerHistory.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📋</View>
            <Text className={styles.emptyText}>暂无就诊记录</Text>
          </View>
        ) : (
          customerHistory.map(record => (
            <View
              key={record.id}
              className={styles.historyCard}
              onClick={() => handleViewRecord(record)}
            >
              <View className={styles.historyHeader}>
                <Text className={styles.projectName}>
                  {getProjectTypeText(record.projectType)}
                </Text>
                <Text className={styles.historyDate}>{formatDate(record.createTime)}</Text>
              </View>
              <View className={styles.historyDetail}>
                点位：{record.points.map(p => p.pointName).join('、')}
              </View>
              <View className={styles.historyDetail}>
                药品：{record.medicines.map(m => `${m.name} ${m.usedDose}${m.unit}`).join('、')}
              </View>
              <View className={styles.historyInfo}>
                <Text className={styles.historyDoctor}>医生：{record.doctorName}</Text>
                <Text className={styles.totalAmount}>
                  总剂量：{record.points.reduce((sum, p) => sum + (p.totalDose || 0), 0)}
                  {record.projectType === 'botox' ? 'U' : 'ml'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Button className={styles.floatingBtn} onClick={handleStartInjection}>
        +
      </Button>
    </ScrollView>
  )
}

export default CustomerDetailPage
