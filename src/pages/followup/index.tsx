import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords, mockFollowupRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText } from '@/utils/date'
import type { PostopReminder } from '@/types'

const REMINDER_ICONS: Record<string, string> = {
  ice: '🧊',
  diet: '🥗',
  observe: '👀',
  medication: '💊',
  followup: '📅'
}

const FollowupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'followup'>('reminders')
  const {
    currentInjection,
    setInjectionRecords,
    setFollowupRecords,
    followupRecords,
    injectionRecords
  } = useAppStore()

  useEffect(() => {
    console.log('[Followup] Initializing with mock data')
    setInjectionRecords(mockInjectionRecords)
    setFollowupRecords(mockFollowupRecords)
  }, [setInjectionRecords, setFollowupRecords])

  const reminders = useMemo(() => {
    if (currentInjection?.postopReminders?.length) {
      return currentInjection.postopReminders
    }
    const defaultReminders: PostopReminder[] = [
      {
        id: 'rem_1',
        title: '冰敷护理',
        content: '注射后48小时内间断冰敷，每次15-20分钟，间隔1小时，减少肿胀和淤青',
        type: 'ice',
        time: formatDate(new Date()),
        completed: false
      },
      {
        id: 'rem_2',
        title: '饮食禁忌',
        content: '一周内避免辛辣、海鲜、酒精等刺激性食物，避免吸烟，避免剧烈运动',
        type: 'diet',
        time: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        completed: false
      },
      {
        id: 'rem_3',
        title: '观察注意',
        content: '注射部位避免按摩、热敷，避免高温环境（桑拿、温泉），24小时内避免沾水',
        type: 'observe',
        time: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        completed: false
      },
      {
        id: 'rem_4',
        title: '复诊提醒',
        content: '术后2周复诊，观察注射效果，评估是否需要补量调整。如有任何不适请及时联系医生',
        type: 'followup',
        time: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        completed: false
      }
    ]
    return defaultReminders
  }, [currentInjection])

  const handleToggleReminder = (reminderId: string) => {
    console.log('[Followup] Toggle reminder:', reminderId)
    Taro.showToast({ title: '已更新提醒状态', icon: 'success' })
  }

  const handleViewComparison = (record: any) => {
    console.log('[Followup] View comparison for:', record.customerName)
    Taro.showToast({ title: '复诊对比功能开发中', icon: 'none' })
  }

  const handleAddSupplment = (record: any) => {
    console.log('[Followup] Add supplement for:', record.customerName)
    Taro.showToast({ title: '补量记录功能开发中', icon: 'none' })
  }

  const handleGenerateReminders = () => {
    console.log('[Followup] Generate reminders')
    Taro.showModal({
      title: '生成提醒',
      content: '是否根据注射项目自动生成术后提醒？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '提醒已生成', icon: 'success' })
        }
      }
    })
  }

  const getIconClass = (type: string) => {
    const classMap: Record<string, string> = {
      ice: styles.iconIce,
      diet: styles.iconDiet,
      observe: styles.iconObserve,
      medication: styles.iconMedication,
      followup: styles.iconFollowup
    }
    return classMap[type] || ''
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>术后随访</Text>
        <Text className={styles.subtitle}>管理术后提醒和复诊记录</Text>
      </View>

      <View className={styles.tabs}>
        <Button
          className={classnames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'reminders'
          })}
          onClick={() => setActiveTab('reminders')}
        >
          术后提醒
        </Button>
        <Button
          className={classnames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'followup'
          })}
          onClick={() => setActiveTab('followup')}
        >
          复诊记录
        </Button>
      </View>

      {activeTab === 'reminders' && (
        <>
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text>术后注意事项</Text>
              <View className={styles.countBadge}>
                {reminders.filter(r => r.completed).length}/{reminders.length}
              </View>
            </View>

            {reminders.length === 0 ? (
              <View className={styles.emptyState}>
                <View className={styles.emptyIcon}>📋</View>
                <Text className={styles.emptyText}>暂无术后提醒</Text>
                <Button className={styles.emptyBtn} onClick={handleGenerateReminders}>
                  生成提醒
                </Button>
              </View>
            ) : (
              reminders.map(reminder => (
                <View key={reminder.id} className={styles.reminderCard}>
                  <View className={styles.reminderHeader}>
                    <View className={classnames(styles.reminderIcon, getIconClass(reminder.type))}>
                      {REMINDER_ICONS[reminder.type]}
                    </View>
                    <View className={styles.reminderInfo}>
                      <Text className={styles.reminderTitle}>{reminder.title}</Text>
                      <Text className={styles.reminderTime}>提醒时间：{reminder.time}</Text>
                    </View>
                  </View>

                  <View className={styles.reminderContent}>
                    {reminder.content}
                  </View>

                  <View className={styles.reminderActions}>
                    <Button
                      className={classnames(styles.checkBtn, {
                        [styles.btnDone]: !reminder.completed,
                        [styles.btnCompleted]: reminder.completed
                      })}
                      onClick={() => handleToggleReminder(reminder.id)}
                    >
                      {reminder.completed ? '✓ 已完成' : '标记完成'}
                    </Button>
                  </View>
                </View>
              ))
            )}
          </View>

          <View className={styles.comparisonSection}>
            <Text className={styles.comparisonTitle}>复诊对比示例</Text>
            <View className={styles.photoCompare}>
              <View className={styles.photoItem}>
                <Image
                  className={styles.photoImage}
                  src='https://picsum.photos/id/64/300/400'
                  mode='aspectFill'
                />
                <View className={styles.photoLabel}>术前</View>
              </View>
              <View className={styles.photoItem}>
                <Image
                  className={styles.photoImage}
                  src='https://picsum.photos/id/91/300/400'
                  mode='aspectFill'
                />
                <View className={styles.photoLabel}>术后</View>
                <View className={styles.overlayHint}>点位叠加对比</View>
              </View>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#86909C', textAlign: 'center' }}>
              复诊时可将上次点位半透明叠加到新照片上，便于判断吸收和补量位置
            </Text>
          </View>
        </>
      )}

      {activeTab === 'followup' && (
        <View className={styles.customerList}>
          {followupRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📅</View>
              <Text className={styles.emptyText}>暂无复诊记录</Text>
            </View>
          ) : (
            followupRecords.map(record => {
              const injection = injectionRecords.find(i => i.id === record.injectionRecordId)
              return (
                <View key={record.id} className={styles.followupCard}>
                  <View className={styles.customerHeader}>
                    <Image
                      className={styles.avatar}
                      src={`https://picsum.photos/id/${64 + parseInt(record.customerId.slice(-1))}/200/200`}
                      mode='aspectFill'
                    />
                    <View className={styles.customerInfo}>
                      <Text className={styles.customerName}>{record.customerName}</Text>
                      <Text className={styles.projectInfo}>
                        {injection ? getProjectTypeText(injection.projectType) : '注射项目'}
                      </Text>
                    </View>
                    <View className={styles.followupDate}>
                      {formatDate(record.followupDate)}
                    </View>
                  </View>

                  <View className={styles.followupContent}>
                    <View className={styles.absorptionRow}>
                      <Text className={styles.absorptionLabel}>吸收率评估</Text>
                      <Text className={styles.absorptionValue}>{record.absorptionRate}%</Text>
                    </View>

                    {record.supplementAreas.length > 0 && (
                      <View className={styles.supplementTags}>
                        {record.supplementAreas.map((area, index) => (
                          <View key={index} className={styles.supplementTag}>
                            建议补量：{area}
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={{ marginBottom: '24rpx' }}>
                      <Text style={{ fontSize: '26rpx', color: '#4E5969', lineHeight: 1.6 }}>
                        {record.notes}
                      </Text>
                    </View>

                    <View style={{ marginBottom: '16rpx' }}>
                      <Text style={{ fontSize: '24rpx', color: '#1890FF' }}>
                        下次复诊：{formatDate(record.nextFollowupDate)}
                      </Text>
                    </View>

                    <View className={styles.actionRow}>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnSecondary)}
                        onClick={() => handleViewComparison(record)}
                      >
                        对比照片
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={() => handleAddSupplment(record)}
                      >
                        补量记录
                      </Button>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>
      )}
    </ScrollView>
  )
}

export default FollowupPage
