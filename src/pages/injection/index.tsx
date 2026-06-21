import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, Input, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import FacialMap from '@/components/FacialMap'
import {
  INJECTION_PROJECTS,
  POINT_COLORS,
  DEPTH_OPTIONS,
  SIDE_OPTIONS,
  type InjectionProjectType,
  type FacialPoint,
  type InjectionRecordPoint
} from '@/types'
import { getDepthText, getSideText } from '@/utils/date'
import { mockCustomers } from '@/data/mockCustomers'

const InjectionPage: React.FC = () => {
  const {
    currentCustomer,
    setCurrentCustomer,
    currentInjection,
    initInjection,
    addInjectionPoint,
    removeInjectionPoint,
    updateInjectionPoint,
    setAbnormalNotes,
    addMedicine,
    addPhoto,
    confirmInjection,
    setCustomers
  } = useAppStore()

  const [selectedProject, setSelectedProject] = useState<InjectionProjectType | null>(null)
  const [showPointModal, setShowPointModal] = useState(false)
  const [selectedFacialPoint, setSelectedFacialPoint] = useState<FacialPoint | null>(null)
  const [pointForm, setPointForm] = useState({
    side: 'center' as InjectionRecordPoint['side'],
    depth: 'medium' as InjectionRecordPoint['depth'],
    needleCount: 1,
    singleDose: 5
  })
  const [abnormalNotes, setAbnormalNotesState] = useState('')

  useEffect(() => {
    setCustomers(mockCustomers)
  }, [setCustomers])

  const handleSelectProject = (type: InjectionProjectType) => {
    if (!currentCustomer) {
      Taro.showToast({ title: '请先选择客户', icon: 'none' })
      return
    }
    setSelectedProject(type)
    const project = INJECTION_PROJECTS.find(p => p.type === type)
    if (project) {
      console.log('[Injection] Init injection for:', currentCustomer.name, 'project:', project.name)
      initInjection(currentCustomer.id, currentCustomer.name, type, project.name)
    }
  }

  const handlePointClick = (point: FacialPoint) => {
    console.log('[Injection] Point clicked:', point.name)
    setSelectedFacialPoint(point)
    setPointForm({
      side: point.id.includes('left') ? 'left' : point.id.includes('right') ? 'right' : 'center',
      depth: point.defaultDepth,
      needleCount: 1,
      singleDose: selectedProject === 'botox' ? 5 : 1
    })
    setShowPointModal(true)
  }

  const handlePointRemove = (pointId: string) => {
    console.log('[Injection] Remove point:', pointId)
    removeInjectionPoint(pointId)
  }

  const handleConfirmPoint = () => {
    if (!selectedFacialPoint) return

    const totalDose = pointForm.needleCount * pointForm.singleDose
    const pointIndex = currentInjection?.points.length || 0
    const color = POINT_COLORS[pointIndex % POINT_COLORS.length]

    const recordPoint: InjectionRecordPoint = {
      pointId: selectedFacialPoint.id,
      pointName: selectedFacialPoint.name,
      side: pointForm.side,
      depth: pointForm.depth,
      needleCount: pointForm.needleCount,
      singleDose: pointForm.singleDose,
      totalDose,
      color
    }

    console.log('[Injection] Add point:', recordPoint)
    addInjectionPoint(recordPoint)
    setShowPointModal(false)
    setSelectedFacialPoint(null)

    Taro.showToast({
      title: `已添加 ${selectedFacialPoint.name}`,
      icon: 'success'
    })
  }

  const handleSelectCustomer = () => {
    console.log('[Injection] Open customer selection')
    Taro.showActionSheet({
      itemList: mockCustomers.map(c => `${c.name} - ${c.phone}`),
      success: (res) => {
        const customer = mockCustomers[res.tapIndex]
        setCurrentCustomer(customer)
        setSelectedProject(null)
      }
    })
  }

  const handleMedicineVerify = () => {
    console.log('[Injection] Navigate to medicine verify')
    if (!currentInjection) {
      Taro.showToast({ title: '请先选择项目和点位', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/medicine-verify/index' })
  }

  const handleTakePhoto = () => {
    console.log('[Injection] Take photo')
    if (!currentInjection) {
      Taro.showToast({ title: '请先选择项目和点位', icon: 'none' })
      return
    }
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const photos = res.tempFilePaths.map((path, index) => ({
          id: `photo_${Date.now()}_${index}`,
          type: ['front', 'side_left', 'side_right'][index] as const,
          url: path,
          markers: [],
          createTime: new Date().toISOString()
        }))
        photos.forEach(photo => addPhoto(photo))
        Taro.showToast({ title: `已添加 ${photos.length} 张照片`, icon: 'success' })
      },
      fail: (err) => {
        console.error('[Injection] Take photo error:', err)
      }
    })
  }

  const handleSignature = () => {
    console.log('[Injection] Navigate to signature')
    if (!currentInjection || currentInjection.points.length === 0) {
      Taro.showToast({ title: '请先添加注射点位', icon: 'none' })
      return
    }
    if (currentInjection.medicines.length === 0) {
      Taro.showToast({ title: '请先核验药品', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/signature/index' })
  }

  const handleSaveDraft = () => {
    console.log('[Injection] Save draft')
    if (abnormalNotes) {
      setAbnormalNotes(abnormalNotes)
    }
    Taro.showToast({ title: '草稿已保存', icon: 'success' })
  }

  const handleComplete = () => {
    console.log('[Injection] Complete record')
    if (!currentInjection || !currentInjection.doctorSignature) {
      Taro.showToast({ title: '请先完成医生签名', icon: 'none' })
      return
    }
    if (abnormalNotes) {
      setAbnormalNotes(abnormalNotes)
    }
    confirmInjection()
    Taro.showModal({
      title: '记录完成',
      content: '注射记录已保存，是否生成术后提醒？',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/followup/index' })
        }
      }
    })
  }

  const totalDose = currentInjection?.points.reduce((sum, p) => sum + p.totalDose, 0) || 0
  const totalPoints = currentInjection?.points.length || 0
  const canComplete = currentInjection?.doctorSignature && currentInjection?.points.length > 0

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.customerSection}>
        {currentCustomer ? (
          <View className={styles.customerCard}>
            <Image
              className={styles.customerAvatar}
              src={currentCustomer.avatar}
              mode='aspectFill'
            />
            <View className={styles.customerInfo}>
              <Text className={styles.customerName}>{currentCustomer.name}</Text>
              <Text className={styles.customerDetail}>
                {currentCustomer.gender === 'female' ? '女' : '男'} · {currentCustomer.age}岁 · {currentCustomer.phone}
              </Text>
              {currentCustomer.allergyHistory.length > 0 && (
                <Text className={styles.customerDetail} style={{ color: '#FFCCC7' }}>
                  ⚠️ 过敏史：{currentCustomer.allergyHistory.join('、')}
                </Text>
              )}
            </View>
            <Button className={styles.selectCustomerBtn} onClick={handleSelectCustomer}>
              更换
            </Button>
          </View>
        ) : (
          <Button className={styles.customerCard} onClick={handleSelectCustomer}>
            <Text style={{ fontSize: '32rpx', color: '#fff' }}>👤 点击选择客户</Text>
          </Button>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择项目</Text>
        <View className={styles.projectList}>
          {INJECTION_PROJECTS.map(project => (
            <Button
              key={project.type}
              className={classnames(styles.projectCard, {
                [styles.projectSelected]: selectedProject === project.type
              })}
              onClick={() => handleSelectProject(project.type)}
            >
              <View className={styles.projectIcon}>
                {project.type === 'botox' ? '💉' : project.type === 'hyaluronic' ? '💧' : '✨'}
              </View>
              <Text className={styles.projectName}>{project.name}</Text>
              <Text className={styles.projectDesc}>{project.description}</Text>
            </Button>
          ))}
        </View>
      </View>

      {selectedProject && currentInjection && (
        <View className={styles.facialMapSection}>
          <View className={styles.mapHeader}>
            <Text className={styles.mapTitle}>面部点位图</Text>
            <Text className={styles.pointCount}>
              已选 {totalPoints} 个点位 · 共 {totalDose} 单位
            </Text>
          </View>

          <FacialMap
            projectType={selectedProject}
            selectedPoints={currentInjection.points}
            onPointClick={handlePointClick}
            onPointRemove={handlePointRemove}
          />

          {currentInjection.points.length > 0 && (
            <View className={styles.pointsList}>
              {currentInjection.points.map((point, index) => (
                <View key={point.pointId} className={styles.pointItem}>
                  <View
                    className={styles.pointColor}
                    style={{ backgroundColor: point.color }}
                  />
                  <View className={styles.pointInfo}>
                    <Text className={styles.pointName}>{point.pointName}</Text>
                    <Text className={styles.pointDetail}>
                      {getSideText(point.side)} · {getDepthText(point.depth)} · {point.needleCount}针 × {point.singleDose}单位
                    </Text>
                  </View>
                  <Text className={styles.pointDose}>{point.totalDose}</Text>
                  <Button
                    className={styles.removeBtn}
                    onClick={() => handlePointRemove(point.pointId)}
                  >
                    ×
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View className={styles.actionGrid}>
        <Button className={styles.actionCard} onClick={handleMedicineVerify}>
          <View className={styles.actionIcon}>💊</View>
          <Text className={styles.actionName}>药品核验</Text>
          <Text className={styles.actionDesc}>扫码录入批号和有效期</Text>
          {currentInjection && currentInjection.medicines.length > 0 && (
            <View className={classnames('badge', 'badgePrimary')} style={{ position: 'absolute', top: '16rpx', right: '16rpx' }}>
              {currentInjection.medicines.length}
            </View>
          )}
        </Button>

        <Button className={styles.actionCard} onClick={handleTakePhoto}>
          <View className={styles.actionIcon}>📷</View>
          <Text className={styles.actionName}>拍照标注</Text>
          <Text className={styles.actionDesc}>拍摄正侧面照片</Text>
          {currentInjection && currentInjection.photos.length > 0 && (
            <View className={classnames('badge', 'badgePrimary')} style={{ position: 'absolute', top: '16rpx', right: '16rpx' }}>
              {currentInjection.photos.length}
            </View>
          )}
        </Button>

        <Button className={styles.actionCard} onClick={handleSignature}>
          <View className={styles.actionIcon}>✍️</View>
          <Text className={styles.actionName}>医生签名</Text>
          <Text className={styles.actionDesc}>手写签名确认记录</Text>
          {currentInjection?.doctorSignature && (
            <View className={classnames('badge', 'badgeSuccess')} style={{ position: 'absolute', top: '16rpx', right: '16rpx' }}>
              已签
            </View>
          )}
        </Button>

        <Button className={styles.actionCard}>
          <View className={styles.actionIcon}>📋</View>
          <Text className={styles.actionName}>历史记录</Text>
          <Text className={styles.actionDesc}>查看往期注射记录</Text>
        </Button>
      </View>

      <View className={styles.notesSection}>
        <Text className={styles.notesTitle}>异常备注</Text>
        <Textarea
          className={styles.notesInput}
          placeholder='如有异常情况请在此记录，如出血、淤青、客户不适等...'
          value={abnormalNotes}
          onInput={e => setAbnormalNotesState(e.detail.value)}
          maxlength={500}
        />
      </View>

      {showPointModal && selectedFacialPoint && (
        <View className={styles.modalOverlay} onClick={() => setShowPointModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>{selectedFacialPoint.name}</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>注射侧别</Text>
              <View className={styles.optionRow}>
                {SIDE_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    className={classnames(styles.optionBtn, {
                      [styles.optionActive]: pointForm.side === opt.value
                    })}
                    onClick={() => setPointForm({ ...pointForm, side: opt.value as any })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>注射层次</Text>
              <View className={styles.optionRow}>
                {DEPTH_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    className={classnames(styles.optionBtn, {
                      [styles.optionActive]: pointForm.depth === opt.value
                    })}
                    onClick={() => setPointForm({ ...pointForm, depth: opt.value as any })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <View className={styles.inputRow}>
                <View className={styles.inputItem}>
                  <Text className={styles.formLabel}>针数</Text>
                  <Input
                    className={styles.inputField}
                    type='number'
                    value={String(pointForm.needleCount)}
                    onInput={e => setPointForm({ ...pointForm, needleCount: parseInt(e.detail.value) || 0 })}
                  />
                </View>
                <View className={styles.inputItem}>
                  <Text className={styles.formLabel}>单点剂量(单位)</Text>
                  <Input
                    className={styles.inputField}
                    type='digit'
                    value={String(pointForm.singleDose)}
                    onInput={e => setPointForm({ ...pointForm, singleDose: parseFloat(e.detail.value) || 0 })}
                  />
                </View>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel} style={{ color: '#1890FF' }}>
                总剂量：{pointForm.needleCount * pointForm.singleDose} 单位
              </Text>
            </View>

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setShowPointModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleConfirmPoint}
              >
                确认添加
              </Button>
            </View>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.bottomBtn, styles.btnSecondary)}
          onClick={handleSaveDraft}
        >
          保存草稿
        </Button>
        <Button
          className={classnames(styles.bottomBtn, {
            [styles.btnPrimary]: canComplete,
            [styles.btnDisabled]: !canComplete
          })}
          onClick={handleComplete}
          disabled={!canComplete}
        >
          完成记录
        </Button>
      </View>
    </ScrollView>
  )
}

export default InjectionPage
