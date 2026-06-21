import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockExportRecords, mockInjectionRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText } from '@/utils/date'
import type { ExportRecord, InjectionRecord } from '@/types'

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

const EXPORT_SCOPES = [
  { value: 'points_only', label: '仅点位图', desc: '面部点位图 + 点位详情' },
  { value: 'medicine_signature', label: '药品与签名', desc: '药品明细 + 医生签名' },
  { value: 'full', label: '完整病历', desc: '全部信息（点位+药品+照片+签名+备注）' }
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
  const [showSingleSelectModal, setShowSingleSelectModal] = useState(false)
  const [singleExportType, setSingleExportType] = useState<'pdf' | 'image'>('pdf')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<InjectionRecord | null>(null)
  const [exportScope, setExportScope] = useState<'points_only' | 'medicine_signature' | 'full'>('full')
  const [previewScope, setPreviewScope] = useState<'points_only' | 'medicine_signature' | 'full'>('full')
  const {
    setExportRecords, setInjectionRecords, exportRecords, injectionRecords, addExportRecord
  } = useAppStore()

  useEffect(() => {
    console.log('[Export] Initializing with mock data')
    setExportRecords(mockExportRecords)
    setInjectionRecords(mockInjectionRecords)
  }, [setExportRecords, setInjectionRecords])

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
        if (injectionRecords.length === 0) {
          Taro.showToast({ title: '暂无注射记录可导出', icon: 'none' })
          return
        }
        setSingleExportType('pdf')
        setShowSingleSelectModal(true)
        break
      case 'single_image':
        if (injectionRecords.length === 0) {
          Taro.showToast({ title: '暂无注射记录可导出', icon: 'none' })
          return
        }
        setSingleExportType('image')
        setShowSingleSelectModal(true)
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
    const inj = injectionRecords.find(i => i.id === record.injectionRecordId)
    if (!inj) {
      Taro.showToast({ title: '未找到对应的注射记录', icon: 'none' })
      return
    }
    setPreviewRecord(inj)
    setPreviewScope(record.exportScope || 'full')
    setShowPreviewModal(true)
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

  const handleSingleSelect = (inj: InjectionRecord) => {
    const newRecord: ExportRecord = {
      id: `exp_${Date.now()}`,
      customerId: inj.customerId,
      customerName: inj.customerName,
      injectionRecordId: inj.id,
      projectType: inj.projectType,
      projectName: inj.projectName,
      injectionDate: inj.createTime,
      exportTime: new Date().toISOString(),
      exportType: singleExportType,
      status: 'success',
      exportScope
    }
    addExportRecord(newRecord)
    setShowSingleSelectModal(false)
    Taro.showToast({ title: `${inj.customerName}的记录导出成功`, icon: 'success' })
  }

  const handleConfirmBatchExport = () => {
    console.log('[Export] Batch export records:', selectedRecords)
    if (selectedRecords.length === 0) {
      Taro.showToast({ title: '请至少选择一条记录', icon: 'none' })
      return
    }
    selectedRecords.forEach(recordId => {
      const inj = injectionRecords.find(i => i.id === recordId)
      if (inj) {
        const newRecord: ExportRecord = {
          id: `exp_${Date.now()}_${inj.id}`,
          customerId: inj.customerId,
          customerName: inj.customerName,
          injectionRecordId: inj.id,
          projectType: inj.projectType,
          projectName: inj.projectName,
          injectionDate: inj.createTime,
          exportTime: new Date().toISOString(),
          exportType: 'pdf',
          status: 'success',
          exportScope
        }
        addExportRecord(newRecord)
      }
    })
    Taro.showToast({ title: `成功导出 ${selectedRecords.length} 条记录`, icon: 'success' })
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

  const getDepthText = (depth: string) => {
    const map: Record<string, string> = { superficial: '浅层', medium: '中层', deep: '深层' }
    return map[depth] || depth
  }

  const getSideText = (side: string) => {
    const map: Record<string, string> = { left: '左', right: '右', bilateral: '双侧', center: '中央' }
    return map[side] || side
  }

  const getScopeBadgeClass = (scope: string) => {
    const classMap: Record<string, string> = {
      full: styles.scopeFull,
      points_only: styles.scopePoints,
      medicine_signature: styles.scopeMedicine
    }
    return classMap[scope] || ''
  }

  const getScopeText = (scope: string) => {
    const textMap: Record<string, string> = {
      full: '完整病历',
      points_only: '仅点位图',
      medicine_signature: '药品与签名'
    }
    return textMap[scope] || scope
  }

  const handleExportPreviewScope = () => {
    if (!previewRecord) return
    const newRecord: ExportRecord = {
      id: `exp_${Date.now()}`,
      customerId: previewRecord.customerId,
      customerName: previewRecord.customerName,
      injectionRecordId: previewRecord.id,
      projectType: previewRecord.projectType,
      projectName: previewRecord.projectName,
      injectionDate: previewRecord.createTime,
      exportTime: new Date().toISOString(),
      exportType: 'pdf',
      status: 'success',
      exportScope: previewScope
    }
    addExportRecord(newRecord)
    setShowPreviewModal(false)
    Taro.showToast({ title: `${previewRecord.customerName}的记录导出成功`, icon: 'success' })
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
                    <View className={classnames(styles.scopeBadge, getScopeBadgeClass(record.exportScope))}>
                      {getScopeText(record.exportScope)}
                    </View>
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

      {showSingleSelectModal && (
        <View className={styles.selectModal} onClick={() => setShowSingleSelectModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择要导出的注射记录</Text>

            <View className={styles.scopeSelector}>
              {EXPORT_SCOPES.map(scope => (
                <Button
                  key={scope.value}
                  className={classnames(styles.scopeOption, {
                    [styles.scopeOptionActive]: exportScope === scope.value
                  })}
                  onClick={() => setExportScope(scope.value as 'points_only' | 'medicine_signature' | 'full')}
                >
                  <Text className={styles.scopeOptionLabel}>{scope.label}</Text>
                  <Text className={styles.scopeOptionDesc}>{scope.desc}</Text>
                </Button>
              ))}
            </View>

            {injectionRecords.map(record => (
              <View
                key={record.id}
                className={styles.selectItem}
                onClick={() => handleSingleSelect(record)}
              >
                <View className={styles.selectInfo}>
                  <Text className={styles.selectName}>{record.customerName}</Text>
                  <Text className={styles.selectDesc}>
                    {getProjectTypeText(record.projectType)} · {formatDate(record.createTime)}
                  </Text>
                </View>
              </View>
            ))}

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setShowSingleSelectModal(false)}
              >
                取消
              </Button>
            </View>
          </View>
        </View>
      )}

      {showSelectModal && (
        <View className={styles.selectModal} onClick={() => setShowSelectModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择要导出的记录</Text>

            <View className={styles.scopeSelector}>
              {EXPORT_SCOPES.map(scope => (
                <Button
                  key={scope.value}
                  className={classnames(styles.scopeOption, {
                    [styles.scopeOptionActive]: exportScope === scope.value
                  })}
                  onClick={() => setExportScope(scope.value as 'points_only' | 'medicine_signature' | 'full')}
                >
                  <Text className={styles.scopeOptionLabel}>{scope.label}</Text>
                  <Text className={styles.scopeOptionDesc}>{scope.desc}</Text>
                </Button>
              ))}
            </View>

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
                    {getProjectTypeText(record.projectType)} · {formatDate(record.createTime)}
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

      {showPreviewModal && previewRecord && (
        <View className={styles.previewModal} onClick={() => setShowPreviewModal(false)}>
          <View className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>预览 - {previewRecord.customerName}</Text>

            <View className={styles.scopeSelector}>
              {EXPORT_SCOPES.map(scope => (
                <Button
                  key={scope.value}
                  className={classnames(styles.scopeOption, {
                    [styles.scopeOptionActive]: previewScope === scope.value
                  })}
                  onClick={() => setPreviewScope(scope.value as 'points_only' | 'medicine_signature' | 'full')}
                >
                  <Text className={styles.scopeOptionLabel}>{scope.label}</Text>
                  <Text className={styles.scopeOptionDesc}>{scope.desc}</Text>
                </Button>
              ))}
            </View>

            <View className={styles.previewSection}>
              <Text className={styles.previewLabel}>项目类型</Text>
              <Text className={styles.previewValue}>{getProjectTypeText(previewRecord.projectType)} - {previewRecord.projectName}</Text>
            </View>

            <View className={styles.previewSection}>
              <Text className={styles.previewLabel}>注射日期</Text>
              <Text className={styles.previewValue}>{formatDate(previewRecord.createTime)}</Text>
            </View>

            {(previewScope === 'points_only' || previewScope === 'full') && (
              <View className={styles.previewSection}>
                <Text className={styles.previewLabel}>点位列表</Text>
                {previewRecord.points.length === 0 ? (
                  <Text className={styles.previewValue}>暂无点位</Text>
                ) : (
                  previewRecord.points.map((pt, idx) => (
                    <View key={idx} className={styles.previewPoint}>
                      <Text>{pt.pointName} · {getSideText(pt.side)} · {getDepthText(pt.depth)} · {pt.totalDose}{pt.singleDose > 0 ? ` (单点${pt.singleDose})` : ''}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {(previewScope === 'medicine_signature' || previewScope === 'full') && (
              <View className={styles.previewSection}>
                <Text className={styles.previewLabel}>药品列表</Text>
                {previewRecord.medicines.length === 0 ? (
                  <Text className={styles.previewValue}>暂无药品</Text>
                ) : (
                  previewRecord.medicines.map((med) => (
                    <View key={med.id} className={styles.previewMedicine}>
                      <Text>{med.name} · 批号{med.batchNumber} · 用量{med.usedDose}{med.unit} · 剩余{med.remainingDose}{med.unit}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {previewScope === 'full' && previewRecord.photos.length > 0 && (
              <View className={styles.previewSection}>
                <Text className={styles.previewLabel}>照片</Text>
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
                  {previewRecord.photos.map((photo) => (
                    <Image
                      key={photo.id}
                      className={styles.previewPhoto}
                      src={photo.url}
                      mode='aspectFill'
                    />
                  ))}
                </View>
              </View>
            )}

            {(previewScope === 'medicine_signature' || previewScope === 'full') && previewRecord.doctorSignature && (
              <View className={styles.previewSection}>
                <Text className={styles.previewLabel}>签名</Text>
                <Text className={styles.previewValue}>{previewRecord.doctorName} · {previewRecord.signatureTime ? formatDateTime(previewRecord.signatureTime) : ''}</Text>
              </View>
            )}

            {(previewScope === 'medicine_signature' || previewScope === 'full') && previewRecord.abnormalNotes && (
              <View className={styles.previewSection}>
                <Text className={styles.previewLabel}>异常备注</Text>
                <Text className={styles.previewValue}>{previewRecord.abnormalNotes}</Text>
              </View>
            )}

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setShowPreviewModal(false)}
              >
                关闭
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleExportPreviewScope}
              >
                导出此范围
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default ExportPage
