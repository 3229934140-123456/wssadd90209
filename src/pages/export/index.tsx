import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockExportRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText } from '@/utils/date'
import type { ExportRecord } from '@/types'

interface ExportAction {
  id: string
  name: string
  desc: string
  icon: string
  iconClass: string
}

const EXPORT_ACTIONS: ExportAction[] = [
  {
    id: 'single_pdf',
    name: '导出病历',
    desc: '单条导出',
    icon: '📄',
    iconClass: styles.iconPdf
  },
  {
    id: 'single_image',
    name: '点位图',
    desc: '导出图片',
    icon: '🖼️',
    iconClass: styles.iconImage
  },
  {
    id: 'batch_pdf',
    name: '批量导出',
    desc: '多条病历',
    icon: '📋',
    iconClass: styles.iconBatch
  },
  {
    id: 'history',
    name: '导出历史',
    desc: '查看记录',
    icon: '📅',
    iconClass: styles.iconHistory
  }
]

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'pdf', label: 'PDF病历' },
  { value: 'image', label: '点位图' },
  { value: 'success', label: '已导出' }
]

const ExportPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showSelectModal, setShowSelectModal] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const {
    setExportRecords, exportRecords, injectionRecords
  } = useAppStore()

  useEffect(() => {
    console.log('[Export] Initializing with mock data')
    setExportRecords(mockExportRecords)
  }, [setExportRecords])

  useDidShow(() => {
    console.log('[Export] Page did show')
  })

  const filteredRecords = exportRecords.filter(record => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'success') return record.status === 'success'
    return record.exportType === activeFilter
  })

  const handleAction = (actionId: string) => {
    console.log('[Export] Action clicked:', actionId)

    switch (actionId) {
      case 'single_pdf':
      case 'single_image':
        if (injectionRecords.length === 0) {
          Taro.showToast({ title: '暂无注射记录可导出', icon: 'none' })
          return
        }
        Taro.showToast({ title: '请选择要导出的记录', icon: 'none' })
        break
      case 'batch_pdf':
        if (injectionRecords.length === 0) {
          Taro.showToast({ title: '暂无注射记录可导出', icon: 'none' })
          return
        }
        setShowSelectModal(true)
        break
      case 'history':
        Taro.showToast({ title: '正在加载历史记录', icon: 'none' })
        break
    }
  }

  const handleExport = (record: ExportRecord) => {
    console.log('[Export] Export record:', record.id)
    Taro.showToast({ title: `正在导出${record.customerName}的记录...`, icon: 'none' })
  }

  const handlePreview = (record: ExportRecord) => {
    console.log('[Export] Preview record:', record.id)
    Taro.showToast({ title: '预览功能开发中', icon: 'none' })
  }

  const handleToggleSelect = (recordId: string) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId)
      }
      return [...prev, recordId]
    })
  }

  const handleSelectAll = () => {
    if (selectedRecords.length === injectionRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(injectionRecords.map(r => r.id))
    }
  }

  const handleConfirmBatchExport = () => {
    console.log('[Export] Batch export records:', selectedRecords)
    if (selectedRecords.length === 0) {
      Taro.showToast({ title: '请至少选择一条记录', icon: 'none' })
      return
    }
    Taro.showToast({ title: `正在导出 ${selectedRecords.length} 条记录...`, icon: 'none' })
    setShowSelectModal(false)
    setSelectedRecords([])
  }

  const getTypeClass = (type: string) => {
    return type === 'pdf' ? styles.typePdf : styles.typeImage
  }

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      success: styles.statusSuccess,
      pending: styles.statusPending,
      failed: styles.statusFailed
    }
    return classMap[status] || ''
  }

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      success: '已完成',
      pending: '处理中',
      failed: '导出失败'
    }
    return textMap[status] || '未知状态'
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>记录导出</Text>
        <Text className={styles.subtitle}>快速导出病历和点位图</Text>
      </View>

      <View className={styles.actionCards}>
        {EXPORT_ACTIONS.map(action => (
          <Button
            key={action.id}
            className={styles.actionCard}
            onClick={() => handleAction(action.id)}
          >
            <View className={classnames(styles.actionIcon, action.iconClass)}>
              {action.icon}
            </View>
            <Text className={styles.actionName}>{action.name}</Text>
            <Text className={styles.actionDesc}>{action.desc}</Text>
          </Button>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>导出记录</Text>
          <View className={styles.countBadge}>
            共 {filteredRecords.length} 条
          </View>
        </View>

        <View className={styles.filterRow}>
          {FILTERS.map(filter => (
            <Button
              key={filter.value}
              className={classnames(styles.filterBtn, {
                [styles.filterActive]: activeFilter === filter.value
              })}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </View>

        {filteredRecords.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📄</View>
            <Text className={styles.emptyText}>暂无导出记录</Text>
          </View>
        ) : (
          filteredRecords.map(record => (
            <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordHeader}>
                <View className={styles.customerInfo}>
                  <Image
                    className={styles.avatar}
                    src={`https://picsum.photos/id/${64 + parseInt(record.customerId.slice(-1))}/200/200`}
                    mode='aspectFill'
                  />
                  <View>
                    <Text className={styles.customerName}>{record.customerName}</Text>
                    <Text className={styles.recordDetail}>
                      {getProjectTypeText(record.projectType)} · {formatDate(record.injectionDate)}
                    </Text>
                  </View>
                </View>
                <View className={classnames(styles.exportType, getTypeClass(record.exportType))}>
                  {record.exportType === 'pdf' ? 'PDF' : '图片'}
                </View>
              </View>

              <View className={styles.recordInfo}>
                <Text className={styles.exportTime}>
                  导出时间：{formatDateTime(record.exportTime)}
                </Text>
                <View className={styles.recordActions}>
                  <View className={classnames(styles.statusBadge, getStatusClass(record.status))}>
                    {getStatusText(record.status)}
                  </View>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnSecondary)}
                    onClick={() => handlePreview(record)}
                  >
                    预览
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => handleExport(record)}
                  >
                    导出
                  </Button>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {showSelectModal && (
        <View className={styles.selectModal} onClick={() => setShowSelectModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择要导出的记录</Text>

            <View className={styles.selectItem}>
              <View
                className={classnames(styles.selectCheckbox, {
                  [styles.checkboxChecked]: selectedRecords.length === injectionRecords.length
                })}
                onClick={handleSelectAll}
              >
                {selectedRecords.length === injectionRecords.length && '✓'}
              </View>
              <View className={styles.selectInfo}>
                <Text className={styles.selectName}>全选</Text>
                <Text className={styles.selectDesc}>共 {injectionRecords.length} 条记录</Text>
              </View>
            </View>

            {injectionRecords.map(record => (
              <View key={record.id} className={styles.selectItem}>
                <View
                  className={classnames(styles.selectCheckbox, {
                    [styles.checkboxChecked]: selectedRecords.includes(record.id)
                  })}
                  onClick={() => handleToggleSelect(record.id)}
                >
                  {selectedRecords.includes(record.id) && '✓'}
                </View>
                <View className={styles.selectInfo}>
                  <Text className={styles.selectName}>{record.customerName}</Text>
                  <Text className={styles.selectDesc}>
                    {getProjectTypeText(record.projectType)} · {formatDate(record.injectionDate)}
                  </Text>
                </View>
              </View>
            ))}

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setShowSelectModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleConfirmBatchExport}
              >
                批量导出 ({selectedRecords.length})
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default ExportPage
