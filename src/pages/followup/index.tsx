import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords, mockFollowupRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText } from '@/utils/date'
import { FACIAL_POINTS_CONFIG } from '@/types'
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
  const [selectedHistoryId, setSelectedHistoryId] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [activeComparisonRecordId, setActiveComparisonRecordId] = useState('')
  const [showSavedComparison, setShowSavedComparison] = useState(false)
  const [selectedSavedComparison, setSelectedSavedComparison] = useState<any>(null)
  const [currentFollowupRecordId, setCurrentFollowupRecordId] = useState('')
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
    const inj = injectionRecords.find(i => i.id === record.injectionRecordId)
    if (!inj) {
      Taro.showToast({ title: '未找到关联注射记录', icon: 'none' })
      return
    }
    setSelectedHistoryId(inj.id)
    setCurrentFollowupRecordId(record.id)
    setActiveComparisonRecordId(record.id)

    const newPhoto = record.comparisonPhotos?.[0]?.newPhotoUrl
    if (newPhoto) {
      setNewPhotoUrl(newPhoto)
      setShowComparison(true)
    } else {
      Taro.showToast({ title: '请先从上方选择新照片', icon: 'none' })
    }
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

  const handleChooseNewPhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setNewPhotoUrl(res.tempFilePaths[0])
      }
    })
  }

  const handleStartComparison = () => {
    if (!selectedHistoryId) {
      Taro.showToast({ title: '请先选择历史记录', icon: 'none' })
      return
    }
    if (!newPhotoUrl) {
      Taro.showToast({ title: '请先选择新照片', icon: 'none' })
      return
    }
    setCurrentFollowupRecordId('')
    setShowComparison(true)
  }

  const handleSaveComparison = () => {
    if (!newPhotoUrl || !selectedHistoryId) {
      Taro.showToast({ title: '缺少必要参数', icon: 'none' })
      return
    }
    let targetRecordId = currentFollowupRecordId
    if (!targetRecordId && followupRecords.length > 0) {
      targetRecordId = followupRecords[0].id
    }
    if (!targetRecordId) {
      Taro.showToast({ title: '请先选择复诊记录', icon: 'none' })
      return
    }
    const comp = {
      id: `cmp_${Date.now()}`,
      historyInjectionId: selectedHistoryId,
      historyProjectName: selectedInjection?.projectName || '',
      newPhotoUrl,
      savedTime: new Date().toISOString(),
      pointCount: comparisonPoints.length
    }
    const updatedRecords = followupRecords.map(r => {
      if (r.id === targetRecordId) {
        return {
          ...r,
          savedComparisons: [...(r.savedComparisons || []), comp]
        }
      }
      return r
    })
    setFollowupRecords(updatedRecords)
    Taro.showToast({ title: '对比图已保存', icon: 'success' })
  }

  const handleOpenSavedComparison = (record: any, savedComp: any) => {
    setActiveComparisonRecordId(record.id)
    setSelectedSavedComparison(savedComp)
    setShowSavedComparison(true)
  }

  const selectedInjection = injectionRecords.find(i => i.id === selectedHistoryId)
  const comparisonPoints = useMemo(() => {
    if (!selectedInjection) return []
    const configPoints = FACIAL_POINTS_CONFIG[selectedInjection.projectType] || []
    return selectedInjection.points.map(pt => {
      const config = configPoints.find(cp => cp.id === pt.pointId)
      return {
        ...pt,
        x: config?.x ?? 50,
        y: config?.y ?? 50
      }
    })
  }, [selectedInjection])

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
            <Text className={styles.comparisonTitle}>复诊对比</Text>

            <View className={styles.comparisonSelectRow}>
              <Text className={styles.comparisonLabel}>选择历史记录</Text>
              <View className={styles.comparisonPicker}>
                {injectionRecords.length === 0 ? (
                  <Text className={styles.comparisonPlaceholder}>暂无注射记录</Text>
                ) : (
                  <picker
                    mode='selector'
                    range={injectionRecords.map(r => `${r.customerName} - ${getProjectTypeText(r.projectType)}`)}
                    onChange={(e) => setSelectedHistoryId(injectionRecords[e.detail.value]?.id || '')}
                  >
                    <Text className={styles.comparisonPickerText}>
                      {selectedHistoryId
                        ? (() => {
                            const sel = injectionRecords.find(r => r.id === selectedHistoryId)
                            return sel ? `${sel.customerName} - ${getProjectTypeText(sel.projectType)}` : '请选择'
                          })()
                        : '请选择'}
                    </Text>
                  </picker>
                )}
              </View>
            </View>

            <View className={styles.comparisonSelectRow}>
              <Text className={styles.comparisonLabel}>选择新照片</Text>
              <Button
                className={classnames(styles.actionBtn, styles.btnSecondary)}
                onClick={handleChooseNewPhoto}
              >
                {newPhotoUrl ? '已选择照片' : '选择照片'}
              </Button>
            </View>

            <Button
              className={classnames(styles.actionBtn, styles.btnPrimary)}
              onClick={handleStartComparison}
              style={{ marginTop: '24rpx', width: '100%' }}
            >
              开始对比
            </Button>
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

                  {record.comparisonPhotos?.[0]?.newPhotoUrl && (
                    <View className={styles.thumbnailRow}>
                      <Text className={styles.thumbnailLabel}>对比照片：</Text>
                      <Image
                        className={styles.thumbnailImage}
                        src={record.comparisonPhotos[0].newPhotoUrl}
                        mode='aspectFill'
                      />
                    </View>
                  )}

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

                    {record.savedComparisons && record.savedComparisons.length > 0 && (
                      <View className={styles.savedComparisonRow}>
                        <Text className={styles.savedComparisonLabel}>
                          已保存对比（{record.savedComparisons.length}张）
                        </Text>
                        <View className={styles.savedComparisonThumbs}>
                          {record.savedComparisons.map((comp: any) => (
                            <Button
                              key={comp.id}
                              className={styles.savedComparisonThumb}
                              onClick={() => handleOpenSavedComparison(record, comp)}
                            >
                              <Image
                                className={styles.savedThumbImage}
                                src={comp.newPhotoUrl}
                                mode='aspectFill'
                              />
                              <View className={styles.savedThumbCount}>
                                {comp.pointCount}点位
                              </View>
                            </Button>
                          ))}
                        </View>
                      </View>
                    )}

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

      {showComparison && newPhotoUrl && selectedInjection && (
        <View className={styles.comparisonModal} onClick={() => setShowComparison(false)}>
          <View className={styles.comparisonContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>点位叠加对比</Text>
            <Text style={{ fontSize: '24rpx', color: '#86909C', textAlign: 'center', marginBottom: '24rpx' }}>
              历史点位半透明叠加到新照片上
            </Text>

            <View className={styles.comparisonPhotoContainer}>
              <Image
                className={styles.comparisonPhoto}
                src={newPhotoUrl}
                mode='aspectFill'
              />
              {comparisonPoints.map((pt, idx) => (
                <View
                  key={idx}
                  className={styles.comparisonPoint}
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    backgroundColor: pt.color,
                    opacity: 0.5
                  }}
                >
                  <Text className={styles.comparisonPointLabel}>{pt.pointName}</Text>
                </View>
              ))}
            </View>

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
                onClick={handleSaveComparison}
              >
                保存对比图
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={() => setShowComparison(false)}
              >
                关闭
              </Button>
            </View>
          </View>
        </View>
      )}

      {showSavedComparison && selectedSavedComparison && (() => {
        const savedInjection = injectionRecords.find(i => i.id === selectedSavedComparison.historyInjectionId)
        const savedConfigPoints = savedInjection ? (FACIAL_POINTS_CONFIG[savedInjection.projectType] || []) : []
        const savedPoints = savedInjection ? savedInjection.points.map(pt => {
          const config = savedConfigPoints.find(cp => cp.id === pt.pointId)
          return {
            ...pt,
            x: config?.x ?? 50,
            y: config?.y ?? 50
          }
        }) : []
        return (
          <View className={styles.comparisonModal} onClick={() => setShowSavedComparison(false)}>
            <View className={styles.comparisonContent} onClick={(e) => e.stopPropagation()}>
              <Text className={styles.modalTitle}>已保存对比 - {selectedSavedComparison.historyProjectName}</Text>

              <View className={styles.comparisonPhotoContainer}>
                <Image
                  className={styles.comparisonPhoto}
                  src={selectedSavedComparison.newPhotoUrl}
                  mode='aspectFill'
                />
                {savedPoints.map((pt, idx) => (
                  <View
                    key={idx}
                    className={styles.comparisonPoint}
                    style={{
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      backgroundColor: pt.color,
                      opacity: 0.5
                    }}
                  >
                    <Text className={styles.comparisonPointLabel}>{pt.pointName}</Text>
                  </View>
                ))}
              </View>

              <View className={styles.savedInfo}>
                <View className={styles.savedInfoRow}>
                  <Text className={styles.savedInfoLabel}>保存时间</Text>
                  <Text className={styles.savedInfoValue}>{formatDateTime(selectedSavedComparison.savedTime)}</Text>
                </View>
                <View className={styles.savedInfoRow}>
                  <Text className={styles.savedInfoLabel}>点位数量</Text>
                  <Text className={styles.savedInfoValue}>{selectedSavedComparison.pointCount} 个</Text>
                </View>
              </View>

              <View className={styles.modalActions}>
                <Button
                  className={classnames(styles.modalBtn, styles.btnPrimary)}
                  onClick={() => setShowSavedComparison(false)}
                >
                  关闭
                </Button>
              </View>
            </View>
          </View>
        )
      })()}
    </ScrollView>
  )
}

export default FollowupPage
