import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords } from '@/data/mockInjections'
import { formatDate, formatDateTime, getProjectTypeText, getDepthText, getSideText } from '@/utils/date'
import { FACIAL_POINTS_CONFIG } from '@/types'

const InjectionDetailPage: React.FC = () => {
  const router = useRouter()
  const recordId = router.params.id as string
  const {
    injectionRecords,
    setInjectionRecords
  } = useAppStore()

  const [record, setRecord] = useState<any>(null)

  useEffect(() => {
    console.log('[InjectionDetail] Initializing with mock data')
    setInjectionRecords(mockInjectionRecords)
  }, [setInjectionRecords])

  useDidShow(() => {
    console.log('[InjectionDetail] Page did show, recordId:', recordId)
    if (recordId) {
      const found = injectionRecords.find(r => r.id === recordId) || mockInjectionRecords[0]
      setRecord(found)
    } else {
      setRecord(mockInjectionRecords[0])
    }
  })

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
