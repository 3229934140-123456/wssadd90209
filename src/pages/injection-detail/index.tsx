import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText, getDepthText, getSideText } from '@/utils/date'
import { FACIAL_POINTS_CONFIG, TimelineNote } from '@/types'

const InjectionDetailPage: React.FC = () => {
  const router = useRouter()
  const recordId = router.params.id as string
  const {
    injectionRecords,
    setInjectionRecords,
    addTimelineNote
  } = useAppStore()

  const [record, setRecord] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'detail' | 'timeline'>('detail')

  useEffect(() => {
    const { injectionRecords } = useAppStore.getState()
    if (injectionRecords.length === 0) setInjectionRecords(mockInjectionRecords)
  }, [setInjectionRecords])

  useDidShow(() => {
    const { injectionRecords } = useAppStore.getState()
    const allRecords = injectionRecords.length > 0 ? injectionRecords : mockInjectionRecords
    const found = recordId ? (allRecords.find(r => r.id === recordId) || allRecords[0]) : allRecords[0]
    setRecord(found)
  })

  useEffect(() => {
    const allRecords = injectionRecords.length > 0 ? injectionRecords : mockInjectionRecords
    const found = recordId ? (allRecords.find(r => r.id === recordId) || allRecords[0]) : allRecords[0]
    setRecord(found)
  }, [injectionRecords, recordId])

  if (!record) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '120rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '28rpx', color: '#86909C' }}>加载中...</Text>
        </View>
      </View>
    )
  }

  const totalDose = record.points.reduce((sum: number, p: any) => sum + (p.totalDose || 0), 0)
  const totalNeedles = record.points.reduce((sum: number, p: any) => sum + (p.needleCount || 0), 0)
  const pointConfig = FACIAL_POINTS_CONFIG[record.projectType] || []

  const getPhotoTypeText = (type: string) => {
    const map: Record<string, string> = {
      front: '正面照',
      side_left: '左侧面照',
      side_right: '右侧面照'
    }
    return map[type] || '照片'
  }

  const buildTimelineNodes = () => {
    const nodes: Array<{
      time: string
      icon: string
      title: string
      content: string[]
      nodeType: TimelineNote['nodeType']
    }> = []

    nodes.push({
      time: record.createTime,
      icon: '📋',
      title: '选择项目',
      content: [`${record.projectName}（${getProjectTypeText(record.projectType)}）`],
      nodeType: 'project'
    })

    if (record.points && record.points.length > 0) {
      nodes.push({
        time: record.updateTime,
        icon: '📍',
        title: '添加注射点位',
        content: record.points.map((point: any) =>
          `${point.pointName} · ${getSideText(point.side)} · ${getDepthText(point.depth)} · ${point.needleCount}针 × ${point.singleDose}单位 = 总${point.totalDose}`
        ),
        nodeType: 'points'
      })
    }

    if (record.medicines && record.medicines.length > 0) {
      const medTimes = record.medicines.map((m: any) => m.verifiedAt || m.scanTime).filter(Boolean)
      const medTime = medTimes.length > 0 ? medTimes[0] : record.updateTime
      nodes.push({
        time: medTime,
        icon: '💊',
        title: '核验药品',
        content: record.medicines.map((medicine: any) =>
          `${medicine.name} - 批号${medicine.batchNumber} · 用量${medicine.usedDose}${medicine.unit} · ${medicine.verified ? '✓已核验' : '待核验'}`
        ),
        nodeType: 'medicine'
      })
    }

    if (record.photos && record.photos.length > 0) {
      record.photos.forEach((photo: any) => {
        nodes.push({
          time: photo.createTime,
          icon: '📷',
          title: '拍照标注',
          content: [`${getPhotoTypeText(photo.type)} · ${photo.markers?.length || 0}个标记点`],
          nodeType: 'photo'
        })
      })
    }

    if (record.abnormalNotes) {
      nodes.push({
        time: record.updateTime,
        icon: '⚠️',
        title: '异常备注',
        content: [record.abnormalNotes],
        nodeType: 'abnormal'
      })
    }

    if (record.doctorSignature) {
      nodes.push({
        time: record.signatureTime || record.updateTime,
        icon: '✍️',
        title: '医生签名确认',
        content: [`${record.doctorName} 完成签名，记录已锁定`],
        nodeType: 'signature'
      })
    }

    nodes.sort((a, b) => {
      const ta = new Date(a.time).getTime()
      const tb = new Date(b.time).getTime()
      return ta - tb
    })

    return nodes
  }

  const timelineNodes = buildTimelineNodes()

  const handleAddNote = (nodeType: TimelineNote['nodeType'], nodeTime: string) => {
    Taro.showModal({
      title: '补录步骤备注',
      editable: true,
      placeholderText: '请输入备注内容...',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          addTimelineNote(record.id, {
            nodeType,
            nodeTime,
            note: res.content.trim(),
            nurseName: '操作护士'
          })
          Taro.showToast({ title: '备注添加成功', icon: 'success' })
        }
      }
    })
  }

  const getNodeNotes = (nodeType: TimelineNote['nodeType'], nodeTime: string): TimelineNote[] => {
    if (!record.timelineNotes || !Array.isArray(record.timelineNotes)) return []
    return record.timelineNotes.filter(
      (n: TimelineNote) => n.nodeType === nodeType && n.nodeTime === nodeTime
    )
  }

  const handleExport = () => {
    console.log('[InjectionDetail] Export record:', record.id)
    Taro.showToast({ title: '正在导出病历...', icon: 'none' })
  }

  const handleEdit = () => {
    console.log('[InjectionDetail] Edit record:', record.id)
    if (record.status === 'completed') {
      Taro.showModal({
        title: '确认编辑',
        content: '该记录已完成，编辑后需要重新签名确认，是否继续？',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
          }
        }
      })
    } else {
      Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
    }
  }

  const handleFollowup = () => {
    console.log('[InjectionDetail] Create followup for:', record.id)
    Taro.navigateTo({ url: '/pages/followup/index' })
  }

  const getStatusClass = (status: string) => {
    return status === 'completed' ? styles.statusCompleted : styles.statusDraft
  }

  const getStatusText = (status: string) => {
    return status === 'completed' ? '已完成' : '草稿'
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.customerInfo}>
          <Image
            className={styles.avatar}
            src={`https://picsum.photos/id/${64 + parseInt(record.customerId.slice(-1))}/200/200`}
            mode='aspectFill'
          />
          <View>
            <Text className={styles.customerName}>{record.customerName}</Text>
            <Text className={styles.projectType}>{getProjectTypeText(record.projectType)}</Text>
          </View>
          <View className={classnames(styles.statusBadge, getStatusClass(record.status))}>
            {getStatusText(record.status)}
          </View>
        </View>
      </View>

      <View className={styles.viewTabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'detail' && styles.tabActive)}
          onClick={() => setActiveTab('detail')}
        >
          详情视图
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'timeline' && styles.tabActive)}
          onClick={() => setActiveTab('timeline')}
        >
          时间线视图
        </View>
      </View>

      {activeTab === 'detail' ? (
        <>
          <View className={styles.infoCards}>
            <View className={styles.infoCard}>
              <View className={styles.infoCardValue}>{record.points.length}</View>
              <View className={styles.infoCardLabel}>点位数量</View>
            </View>
            <View className={styles.infoCard}>
              <View className={styles.infoCardValue}>{totalNeedles}</View>
              <View className={styles.infoCardLabel}>总针数</View>
            </View>
            <View className={styles.infoCard}>
              <View className={styles.infoCardValue}>{totalDose.toFixed(2)}{record.projectType === 'botox' ? 'U' : 'ml'}</View>
              <View className={styles.infoCardLabel}>总剂量</View>
            </View>
            <View className={styles.infoCard}>
              <View className={styles.infoCardValue}>{record.medicines.length}</View>
              <View className={styles.infoCardLabel}>使用药品</View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>基本信息</Text>
            <View className={styles.card}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>注射日期</Text>
                <Text className={styles.infoValue}>{formatDateTime(record.createTime)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>执行医生</Text>
                <Text className={styles.infoValue}>{record.doctorName}</Text>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>面部点位图</Text>
            <View className={styles.facialMapContainer}>
              <View className={styles.faceDiagram}>
                <View className={styles.faceOutline}></View>
                {record.points.map((point: any, index: number) => {
                  const config = pointConfig.find((c: any) => c.id === point.pointId)
                  if (!config) return null
                  return (
                    <View
                      key={point.pointId}
                      style={{
                        position: 'absolute',
                        left: `${config.x}%`,
                        top: `${config.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '24rpx',
                        height: '24rpx',
                        borderRadius: '50%',
                        background: point.color,
                        border: '3rpx solid #fff',
                        boxShadow: '0 2rpx 8rpx rgba(0,0,0,0.3)',
                        zIndex: 10
                      }}
                    >
                      <View style={{
                        position: 'absolute',
                        top: '-40rpx',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: point.color,
                        color: '#fff',
                        padding: '4rpx 12rpx',
                        borderRadius: '8rpx',
                        fontSize: '20rpx',
                        whiteSpace: 'nowrap'
                      }}>
                        {point.pointName} {point.totalDose}{record.projectType === 'botox' ? 'U' : 'ml'}
                      </View>
                    </View>
                  )
                })}
              </View>
              <View className={styles.legend}>
                {Array.from(new Set(record.points.map((p: any) => p.pointId))).map(pointId => {
                  const point = record.points.find((p: any) => p.pointId === pointId)
                  return (
                    <View key={pointId} className={styles.legendItem}>
                      <View className={styles.legendColor} style={{ background: point?.color }}></View>
                      <Text>{point?.pointName}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>点位详情</Text>
            <View className={styles.card}>
              <View className={styles.pointsList}>
                {record.points.map((point: any) => (
                  <View key={point.pointId} className={styles.pointItem}>
                    <View className={styles.pointHeader}>
                      <View className={styles.pointName}>
                        <View className={styles.pointColor} style={{ background: point.color }}></View>
                        {point.pointName}
                      </View>
                      <Text className={styles.pointDose}>
                        总计 {point.totalDose.toFixed(2)}{record.projectType === 'botox' ? 'U' : 'ml'}
                      </Text>
                    </View>
                    <View className={styles.pointDetails}>
                      <Text className={styles.pointDetail}>侧别：{getSideText(point.side)}</Text>
                      <Text className={styles.pointDetail}>层次：{getDepthText(point.depth)}</Text>
                      <Text className={styles.pointDetail}>针数：{point.needleCount}针</Text>
                      <Text className={styles.pointDetail}>单点剂量：{point.singleDose}{record.projectType === 'botox' ? 'U' : 'ml'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>使用药品</Text>
            <View className={styles.card}>
              {record.medicines.map((medicine: any, index: number) => (
                <View key={index} className={styles.medicineItem}>
                  <View className={styles.medicineHeader}>
                    <Text className={styles.medicineName}>{medicine.name}</Text>
                    <Text className={styles.medicineUsed}>
                      已用 {medicine.usedDose}{medicine.unit} / {medicine.totalDose}{medicine.unit}
                    </Text>
                  </View>
                  <View className={styles.medicineInfo}>
                    <Text>批号：{medicine.batchNumber}</Text>
                    <Text>有效期：{formatDate(medicine.expiryDate)}</Text>
                    <Text>剩余量：{medicine.remainingDose.toFixed(2)}{medicine.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {record.photos && record.photos.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>术中照片</Text>
              <View className={styles.photoGrid}>
                {record.photos.map((photo: any, index: number) => (
                  <View key={index} className={styles.photoItem}>
                    <Image
                      className={styles.photoImage}
                      src={photo.url}
                      mode='aspectFill'
                    />
                    {photo.markers && photo.markers.map((marker: any) => (
                      <View
                        key={marker.id}
                        className={styles.photoMarkerDot}
                        style={{
                          left: `${marker.x}%`,
                          top: `${marker.y}%`,
                          background: marker.color
                        }}
                      />
                    ))}
                    <View className={styles.photoLabel}>
                      {photo.type === 'front' ? '正面' : photo.type === 'side_left' ? '左侧面' : photo.type === 'side_right' ? '右侧面' : '照片'}
                      {photo.markers?.length > 0 && ` · ${photo.markers.length}个标记`}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {record.doctorSignature && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>医生签名</Text>
              <View className={styles.card}>
                <View className={styles.signatureSection}>
                  <Image
                    className={styles.signatureImage}
                    src={record.doctorSignature}
                    mode='aspectFit'
                  />
                  <View className={styles.signatureInfo}>
                    <Text className={styles.doctorName}>{record.doctorName}</Text>
                    <Text className={styles.signatureTime}>
                      签名时间：{formatDateTime(record.signatureTime || record.createTime)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {record.abnormalNotes && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>异常备注</Text>
              <View className={styles.card}>
                <Text className={styles.notesText}>{record.abnormalNotes}</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View className={styles.timeline}>
          {timelineNodes.map((node, index) => {
            const nodeNotes = getNodeNotes(node.nodeType, node.time)
            return (
              <View key={index} className={styles.timelineNode}>
                <View className={styles.timelineIcon}>{node.icon}</View>
                <View className={styles.timelineLine}></View>
                <View className={styles.timelineContent}>
                  <View className={styles.timelineTime}>{formatDateTime(node.time)}</View>
                  <View className={styles.timelineTitle}>{node.title}</View>
                  <View className={styles.timelineDetail}>
                    {node.content.map((line, i) => (
                      <View key={i}>{line}</View>
                    ))}
                  </View>
                  {nodeNotes.length > 0 && (
                    <View className={styles.timelineNotes}>
                      {nodeNotes.map((noteItem) => (
                        <View key={noteItem.id} className={styles.timelineNoteItem}>
                          <View className={styles.noteHeader}>
                            <Text className={styles.noteNurse}>{noteItem.nurseName}</Text>
                            <Text className={styles.noteTime}>{formatDateTime(noteItem.createTime)}</Text>
                          </View>
                          <View className={styles.noteContent}>{noteItem.note}</View>
                        </View>
                      ))}
                    </View>
                  )}
                  <Button
                    className={styles.addNoteBtn}
                    onClick={() => handleAddNote(node.nodeType, node.time)}
                  >
                    + 补录步骤备注
                  </Button>
                </View>
              </View>
            )
          })}
        </View>
      )}

      <View className={styles.actionBar}>
        <Button
          className={classnames(styles.actionBtn, styles.btnSecondary)}
          onClick={handleEdit}
        >
          编辑
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.btnSecondary)}
          onClick={handleFollowup}
        >
          复诊
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.btnPrimary)}
          onClick={handleExport}
        >
          导出病历
        </Button>
      </View>
    </ScrollView>
  )
}

export default InjectionDetailPage
