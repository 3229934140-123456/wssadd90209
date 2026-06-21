import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockCustomers } from '@/data/mockCustomers'
import { formatDate } from '@/utils/date'
import type { Customer } from '@/types'

const TABS = [
  { value: 'all', label: '全部' },
  { value: 'recent', label: '最近就诊' },
  { value: 'allergy', label: '有过敏史' },
  { value: 'vip', label: 'VIP客户' }
]

const CustomerPage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const { customers, setCustomers, setCurrentCustomer } = useAppStore()

  useEffect(() => {
    const { customers } = useAppStore.getState()
    if (customers.length === 0) setCustomers(mockCustomers)
  }, [setCustomers])

  const filteredCustomers = useMemo(() => {
    let result = [...customers]

    if (searchText) {
      const keyword = searchText.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword)
      )
    }

    switch (activeTab) {
      case 'recent':
        result = result.sort((a, b) =>
          new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime()
        )
        break
      case 'allergy':
        result = result.filter(c => c.allergyHistory.length > 0)
        break
      case 'vip':
        result = result.filter(c => c.totalVisits >= 5)
        break
    }

    return result
  }, [customers, searchText, activeTab])

  const handleViewDetail = (customer: Customer) => {
    console.log('[Customer] View detail:', customer.name)
    setCurrentCustomer(customer)
    Taro.navigateTo({ url: '/pages/customer-detail/index' })
  }

  const handleNewInjection = (customer: Customer) => {
    console.log('[Customer] New injection for:', customer.name)
    setCurrentCustomer(customer)
    Taro.switchTab({ url: '/pages/injection/index' })
  }

  const handleAddCustomer = () => {
    console.log('[Customer] Add new customer')
    Taro.showToast({ title: '新增客户功能开发中', icon: 'none' })
  }

  const isVip = (customer: Customer) => customer.totalVisits >= 5

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.searchSection}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索客户姓名、手机号'
            placeholderClass={styles.placeholder}
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
          />
        </View>
        <Button className={styles.addBtn} onClick={handleAddCustomer}>
          +
        </Button>
      </View>

      <ScrollView className={styles.filterTabs} scrollX>
        {TABS.map(tab => (
          <Button
            key={tab.value}
            className={classnames(styles.tabItem, {
              [styles.tabActive]: activeTab === tab.value
            })}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </ScrollView>

      <View className={styles.listSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>客户列表</Text>
          <Text className={styles.countBadge}>共 {filteredCustomers.length} 位</Text>
        </View>

        {filteredCustomers.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text style={{ fontSize: '56rpx', color: '#C9CDD4' }}>👥</Text>
            </View>
            <Text className={styles.emptyText}>暂无客户数据</Text>
            <Button className={styles.emptyBtn} onClick={handleAddCustomer}>
              添加客户
            </Button>
          </View>
        ) : (
          filteredCustomers.map(customer => (
            <View
              key={customer.id}
              className={styles.customerCard}
              onClick={() => handleViewDetail(customer)}
            >
              <View className={styles.cardHeader}>
                <Image
                  className={styles.avatar}
                  src={customer.avatar}
                  mode='aspectFill'
                />
                <View className={styles.info}>
                  <View className={styles.nameRow}>
                    <Text className={styles.name}>{customer.name}</Text>
                    <Text className={styles.genderAge}>
                      {customer.gender === 'female' ? '女' : '男'} · {customer.age}岁
                    </Text>
                    {customer.allergyHistory.length > 0 && (
                      <View className={classnames(styles.badge, styles.allergyBadge)}>
                        过敏史
                      </View>
                    )}
                    {isVip(customer) && (
                      <View className={classnames(styles.badge, styles.vipBadge)}>
                        VIP
                      </View>
                    )}
                  </View>
                  <Text className={styles.phone}>{customer.phone}</Text>
                </View>
              </View>

              <View className={styles.cardStats}>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{customer.totalVisits}</Text>
                  <Text className={styles.statLabel}>就诊次数</Text>
                </View>
                <View className={styles.statDivider} />
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{formatDate(customer.lastVisitDate)}</Text>
                  <Text className={styles.statLabel}>末次就诊</Text>
                </View>
                <View className={styles.statDivider} />
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>
                    {customer.allergyHistory.length > 0 ? customer.allergyHistory.join('、') : '无'}
                  </Text>
                  <Text className={styles.statLabel}>过敏史</Text>
                </View>
              </View>

              <View className={styles.cardActions}>
                <Button
                  className={classnames(styles.actionBtn, styles.btnSecondary)}
                  onClick={(e) => { e.stopPropagation(); handleViewDetail(customer) }}
                >
                  查看详情
                </Button>
                <Button
                  className={classnames(styles.actionBtn, styles.btnPrimary)}
                  onClick={(e) => { e.stopPropagation(); handleNewInjection(customer) }}
                >
                  新建记录
                </Button>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

export default CustomerPage
