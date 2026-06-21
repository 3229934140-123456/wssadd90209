import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockExportRecords, mockInjectionRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText } from '@/utils/date'
import type { ExportRecord, InjectionRecord, TimelineNote } from '@/types'

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

const TOC_ITEMS = [
  { id: 'basic', number: 1, title: '基本信息', scopes: ['points_only', 'medicine_signature', 'full'] },
  { id: 'points', number: 2, title: '面部点位图及点位详情', scopes: ['points_only', 'full'] },
  { id: 'medicine', number: 3, title: '药品明细与核验信息', scopes: ['medicine_signature', 'full'] },
  { id: 'photos', number: 4, title: '术中照片及标注', scopes: ['full'] },
  { id: 'signature', number: 5, title: '医生签名确认', scopes: ['medicine_signature', 'full'] },
  { id: 'notes', number: 6, title: '异常备注说明', scopes: ['medicine_signature', 'full'] }
]

const padZero = (n: number, len = 2) => String(n).padStart(len, '0')

const generateMedicalRecordNo = () => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}`
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `MR-${dateStr}-${rand}`
}

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
  const [medicalRecordNo, setMedicalRecordNo] = useState('')
  const {
    setExportRecords, setInjectionRecords, exportRecords, injectionRecords, addExportRecord
  } = useAppStore()

  useEffect(() => {
    const { exportRecords, injectionRecords } = useAppStore.getState()
    if (exportRecords.length === 0) setExportRecords(mockExportRecords)
    if (injectionRecords.length === 0) setInjectionRecords(mockInjectionRecords)
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
    setMedicalRecordNo(generateMedicalRecordNo())
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

            <View className={styles.exportCover}>
              <Text className={styles.coverTitle}>📄 微整形注射病历</Text>
              <View className={styles.coverGrid}>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>病历编号</Text>
                  <Text className={styles.coverValue}>{medicalRecordNo}</Text>
                </View>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>客户姓名</Text>
                  <Text className={styles.coverValue}>{previewRecord.customerName}</Text>
                </View>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>就诊日期</Text>
                  <Text className={styles.coverValue}>{formatDate(previewRecord.createTime)}</Text>
                </View>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>操作项目</Text>
                  <Text className={styles.coverValue}>{previewRecord.projectName}</Text>
                </View>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>负责医生</Text>
                  <Text className={styles.coverValue}>{previewRecord.doctorName || '王医生'}</Text>
                </View>
                <View className={styles.coverItem}>
                  <Text className={styles.coverLabel}>生成时间</Text>
                  <Text className={styles.coverValue}>{formatDateTime(new Date().toISOString())}</Text>
                </View>
              </View>
            </View>

            <View className={styles.tocSection}>
              <Text className={styles.tocTitle}>📋 目录</Text>
              {TOC_ITEMS.map(item => {
                const isActive = item.scopes.includes(previewScope)
                return (
                  <View
                    key={item.id}
                    className={classnames(styles.tocItem, {
                      [styles.tocItemActive]: isActive,
                      [styles.tocItemInactive]: !isActive
                    })}
                  >
                    <Text>{item.number}. {item.title}</Text>
                    {isActive && <Text className={styles.tocCheck}>✓</Text>}
                  </View>
                )
              })}
            </View>

            {TOC_ITEMS[0].scopes.includes(previewScope) && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>1</View>
                  <Text className={styles.sectionHeaderTitle}>基本信息</Text>
                </View>
                <View style={{ marginBottom: '24rpx' }}>
                  <Text className={styles.previewLabel}>项目类型</Text>
                  <Text className={styles.previewValue}>{getProjectTypeText(previewRecord.projectType)} - {previewRecord.projectName}</Text>
                </View>
                <View>
                  <Text className={styles.previewLabel}>注射日期</Text>
                  <Text className={styles.previewValue}>{formatDate(previewRecord.createTime)}</Text>
                </View>
              </View>
            )}

            {previewScope === 'full' && previewRecord.timelineNotes && previewRecord.timelineNotes.length > 0 && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>2</View>
                  <Text className={styles.sectionHeaderTitle}>护士补录备注</Text>
                </View>
                {previewRecord.timelineNotes.map((noteItem: TimelineNote) => (
                  <View key={noteItem.id} style={{
                    background: '#F7F8FA',
                    borderRadius: '12rpx',
                    padding: '20rpx',
                    marginBottom: '16rpx'
                  }}>
                    <View style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '22rpx',
                      color: '#86909C',
                      marginBottom: '8rpx'
                    }}>
                      <Text style={{ fontWeight: 500 }}>{noteItem.nurseName}</Text>
                      <Text>{formatDateTime(noteItem.createTime)}</Text>
                    </View>
                    <Text style={{
                      fontSize: '26rpx',
                      color: '#1D2129',
                      lineHeight: 1.6
                    }}>{noteItem.note}</Text>
                  </View>
                ))}
              </View>
            )}

            {TOC_ITEMS[1].scopes.includes(previewScope) && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>3</View>
                  <Text className={styles.sectionHeaderTitle}>面部点位图及点位详情</Text>
                </View>
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

            {TOC_ITEMS[2].scopes.includes(previewScope) && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>4</View>
                  <Text className={styles.sectionHeaderTitle}>药品明细与核验信息</Text>
                </View>
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

            {TOC_ITEMS[3].scopes.includes(previewScope) && previewRecord.photos.length > 0 && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>5</View>
                  <Text className={styles.sectionHeaderTitle}>术中照片及标注</Text>
                </View>
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

            {TOC_ITEMS[4].scopes.includes(previewScope) && previewRecord.doctorSignature && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>6</View>
                  <Text className={styles.sectionHeaderTitle}>医生签名确认</Text>
                </View>
                <Text className={styles.previewLabel}>签名</Text>
                <Text className={styles.previewValue}>{previewRecord.doctorName} · {previewRecord.signatureTime ? formatDateTime(previewRecord.signatureTime) : ''}</Text>
              </View>
            )}

            {TOC_ITEMS[5].scopes.includes(previewScope) && previewRecord.abnormalNotes && (
              <View className={styles.previewSection}>
                <View className={styles.sectionHeader}>
                  <View className={styles.sectionNumber}>7</View>
                  <Text className={styles.sectionHeaderTitle}>异常备注说明</Text>
                </View>
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
