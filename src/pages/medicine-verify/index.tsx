import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store/useAppStore'
import { mockInjectionRecords } from '@/data/mockInjections'
import { formatDate } from '@/utils/date'
import type { Medicine } from '@/types'

const MedicineVerifyPage: React.FC = () => {
  const [showInputModal, setShowInputModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null)
  const [batchNumber, setBatchNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [usedDose, setUsedDose] = useState('')
  const [manualInput, setManualInput] = useState(false)
  const [newMedicineName, setNewMedicineName] = useState('')
  const [newMedicineBrand, setNewMedicineBrand] = useState('')
  const [newMedicineSpec, setNewMedicineSpec] = useState('')
  const [newMedicineTotalDose, setNewMedicineTotalDose] = useState('')
  const [newMedicineUnit, setNewMedicineUnit] = useState('ml')

  const {
    currentInjection,
    currentCustomer,
    medicines,
    setMedicines,
    addMedicine,
    updateMedicine,
    setInjectionRecords
  } = useAppStore()

  useEffect(() => {
    console.log('[MedicineVerify] Initializing with mock data')
    setInjectionRecords(mockInjectionRecords)
    if (mockInjectionRecords.length > 0) {
      setMedicines(mockInjectionRecords[0].medicines)
    }
  }, [setMedicines, setInjectionRecords])

  useDidShow(() => {
    console.log('[MedicineVerify] Page did show')
  })

  const displayMedicines = currentInjection?.medicines?.length ? currentInjection.medicines : medicines

  const totalUsed = displayMedicines.reduce((sum: number, m: Medicine) => sum + (m.usedDose || 0), 0)
  const totalRemaining = displayMedicines.reduce(
    (sum: number, m: Medicine) => sum + (m.remainingDose || 0),
    0
  )
  const verifiedCount = displayMedicines.filter((m: Medicine) => m.verified).length

  const handleScan = (medicineId: string) => {
    console.log('[MedicineVerify] Scan medicine:', medicineId)
    setSelectedMedicineId(medicineId)
    if (medicineId === 'new') {
      setShowInputModal(true)
      setManualInput(true)
      return
    }
    Taro.showActionSheet({
      itemList: ['扫码录入', '手动输入'],
      success: (res) => {
        if (res.tapIndex === 0) {
          setShowScanModal(true)
          setTimeout(() => {
            setShowScanModal(false)
            setShowInputModal(true)
            setBatchNumber('BATCH' + Date.now().toString().slice(-8))
            setExpiryDate(formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)))
            setManualInput(false)
          }, 2000)
        } else {
          setShowInputModal(true)
          setManualInput(true)
        }
      }
    })
  }

  const handleVerify = (medicineId: string) => {
    console.log('[MedicineVerify] Verify medicine:', medicineId)
    const medicine = displayMedicines.find((m: Medicine) => m.id === medicineId)
    if (!medicine) return

    if (!medicine.batchNumber || !medicine.expiryDate) {
      Taro.showToast({ title: '请先录入批号和有效期', icon: 'none' })
      return
    }

    const now = new Date()
    const expiry = new Date(medicine.expiryDate)
    const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysToExpiry < 0) {
      Taro.showModal({
        title: '药品已过期',
        content: `该药品已过期${Math.abs(daysToExpiry)}天，是否继续使用？`,
        confirmColor: '#FF4D4F',
        success: (res) => {
          if (res.confirm) {
            updateMedicine(medicineId, { verified: true, verifiedAt: new Date() })
            Taro.showToast({ title: '核验完成（注意：药品已过期）', icon: 'none' })
          }
        }
      })
    } else if (daysToExpiry < 30) {
      Taro.showModal({
        title: '药品即将过期',
        content: `该药品将在${daysToExpiry}天后过期，是否继续使用？`,
        confirmColor: '#FAAD14',
        success: (res) => {
          if (res.confirm) {
            updateMedicine(medicineId, { verified: true, verifiedAt: new Date() })
            Taro.showToast({ title: '核验完成', icon: 'success' })
          }
        }
      })
    } else {
      updateMedicine(medicineId, { verified: true, verifiedAt: new Date() })
      Taro.showToast({ title: '核验完成', icon: 'success' })
    }
  }

  const handleSaveMedicine = () => {
    if (!selectedMedicineId) return

    if (selectedMedicineId === 'new') {
      if (!newMedicineName || !newMedicineTotalDose || !newMedicineUnit) {
        Taro.showToast({ title: '请填写药品名称、总量和单位', icon: 'none' })
        return
      }
      const totalDoseNum = parseFloat(newMedicineTotalDose) || 0
      const usedDoseNum = parseFloat(usedDose) || 0
      const newMedicine: Medicine = {
        id: `med_${Date.now()}`,
        name: newMedicineName,
        brand: newMedicineBrand,
        batchNumber,
        expiryDate,
        specification: newMedicineSpec,
        totalDose: totalDoseNum,
        usedDose: usedDoseNum,
        remainingDose: totalDoseNum - usedDoseNum,
        unit: newMedicineUnit,
        scanTime: new Date().toISOString(),
        verified: false,
        verifiedAt: ''
      }
      addMedicine(newMedicine)
      setShowInputModal(false)
      setNewMedicineName('')
      setNewMedicineBrand('')
      setNewMedicineSpec('')
      setNewMedicineTotalDose('')
      setNewMedicineUnit('ml')
      setBatchNumber('')
      setExpiryDate('')
      setUsedDose('')
      setSelectedMedicineId(null)
      Taro.showToast({ title: '添加成功', icon: 'success' })
      return
    }

    if (!batchNumber || !expiryDate) {
      Taro.showToast({ title: '请填写批号和有效期', icon: 'none' })
      return
    }

    const usedDoseNum = parseFloat(usedDose) || 0

    updateMedicine(selectedMedicineId, {
      batchNumber,
      expiryDate,
      usedDose: usedDoseNum
    })

    setShowInputModal(false)
    setBatchNumber('')
    setExpiryDate('')
    setUsedDose('')
    setSelectedMedicineId(null)
    Taro.showToast({ title: '录入成功', icon: 'success' })
  }

  const handleDeleteMedicine = (medicineId: string) => {
    console.log('[MedicineVerify] Delete medicine:', medicineId)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该药品记录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  const getMedicineStatusClass = (medicine: Medicine) => {
    const now = new Date()
    const expiry = new Date(medicine.expiryDate)
    const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysToExpiry < 0) return styles.expired
    if (daysToExpiry < 30) return styles.warning
    if (medicine.verified) return styles.verified
    return ''
  }

  const getProgressClass = (medicine: Medicine) => {
    const usageRatio = medicine.totalDose ? medicine.usedDose / medicine.totalDose : 0
    if (usageRatio > 0.9) return styles.progressDanger
    if (usageRatio > 0.7) return styles.progressWarning
    return ''
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>药品核验</Text>
        <Text className={styles.subtitle}>扫码录入、批号核验、剂量计算</Text>
      </View>

      {currentCustomer && (
        <View className={styles.customerCard}>
          <Image
            className={styles.avatar}
            src={currentCustomer.avatar}
            mode='aspectFill'
          />
          <View>
            <Text className={styles.customerName}>{currentCustomer.name}</Text>
            <Text className={styles.projectName}>
              {currentInjection?.projectType ? (currentInjection.projectType === 'botox' ? '肉毒除皱' : currentInjection.projectType === 'hyaluronic' ? '玻尿酸填充' : '轮廓固定') : '注射项目'}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>核验概览</Text>
        </View>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>药品总数</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryValuePrimary)}>
              {displayMedicines.length} 种
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>已核验</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryValueSuccess)}>
              {verifiedCount} / {displayMedicines.length}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>已用总量</Text>
            <Text className={styles.summaryValue}>
              {totalUsed.toFixed(2)} {displayMedicines[0]?.unit || 'ml'}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>剩余总量</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryValueWarning)}>
              {totalRemaining.toFixed(2)} {displayMedicines[0]?.unit || 'ml'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>药品列表</Text>
          <Button className={styles.scanBtn} onClick={() => handleScan('new')}>
            📷 扫码添加
          </Button>
        </View>

        {displayMedicines.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>💊</View>
            <Text className={styles.emptyText}>暂无药品记录</Text>
            <Button className={styles.emptyBtn} onClick={() => handleScan('new')}>
              添加药品
            </Button>
          </View>
        ) : (
          displayMedicines.map((medicine: Medicine) => (
            <View
              key={medicine.id}
              className={classnames(styles.medicineCard, getMedicineStatusClass(medicine))}
            >
              <View className={styles.medicineHeader}>
                <Text className={styles.medicineName}>{medicine.name}</Text>
                <View
                  className={classnames(styles.statusBadge, {
                    [styles.statusVerified]: medicine.verified,
                    [styles.statusPending]: !medicine.verified && !medicine.expiryDate,
                    [styles.statusExpired]: !medicine.verified && medicine.expiryDate && new Date(medicine.expiryDate) < new Date()
                  })}
                >
                  {medicine.verified ? '已核验' : '待核验'}
                </View>
              </View>

              <View className={styles.infoGrid}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>产品批号</Text>
                  <Text className={styles.infoValue}>{medicine.batchNumber || '未录入'}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>有效期</Text>
                  <Text className={styles.infoValue}>
                    {medicine.expiryDate ? formatDate(medicine.expiryDate) : '未录入'}
                  </Text>
                </View>
              </View>

              <View className={styles.doseSection}>
                <View className={styles.doseInfo}>
                  <Text className={styles.doseLabel}>用量进度</Text>
                  <Text className={styles.doseValue}>
                    {medicine.usedDose?.toFixed(2) || 0} / {medicine.totalDose} {medicine.unit}
                  </Text>
                  <Text
                    className={classnames(styles.remainingDose, {
                      [styles.remainingWarning]: (medicine.remainingDose || 0) < 0.5
                    })}
                  >
                    剩余：{(medicine.remainingDose || 0).toFixed(2)} {medicine.unit}
                  </Text>
                </View>
                <View>
                  <View className={styles.progressBar}>
                    <View
                      className={classnames(styles.progressFill, getProgressClass(medicine))}
                      style={{ width: `${medicine.totalDose ? ((medicine.usedDose || 0) / medicine.totalDose) * 100 : 0}%` }}
                    ></View>
                  </View>
                </View>
              </View>

              <View className={styles.actionRow}>
                <Button
                  className={classnames(styles.actionBtn, styles.btnSecondary)}
                  onClick={() => handleScan(medicine.id)}
                >
                  {medicine.batchNumber ? '重新录入' : '录入信息'}
                </Button>
                {!medicine.verified && (
                  <Button
                    className={classnames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => handleVerify(medicine.id)}
                  >
                    核验
                  </Button>
                )}
                {medicine.verified && (
                  <Button
                    className={classnames(styles.actionBtn, styles.btnDanger)}
                    onClick={() => handleDeleteMedicine(medicine.id)}
                  >
                    删除
                  </Button>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {showScanModal && (
        <View className={styles.inputModal} onClick={() => setShowScanModal(false)}>
          <View className={styles.scanAnimation} onClick={(e) => e.stopPropagation()}>
            <View className={styles.scanIcon}>📷</View>
            <Text className={styles.scanText}>
              请将药品条码放入框内{'\n'}正在识别中...
            </Text>
          </View>
        </View>
      )}

      {showInputModal && (
        <View className={styles.inputModal} onClick={() => setShowInputModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {selectedMedicineId === 'new' ? '手动添加药品' : manualInput ? '手动输入药品信息' : '录入药品信息'}
            </Text>

            {selectedMedicineId === 'new' && (
              <>
                <View className={styles.inputItem}>
                  <Text className={styles.inputLabel}>药品名称</Text>
                  <Input
                    className={styles.inputField}
                    placeholder='请输入药品名称'
                    value={newMedicineName}
                    onInput={(e) => setNewMedicineName(e.detail.value)}
                  />
                </View>
                <View className={styles.inputItem}>
                  <Text className={styles.inputLabel}>品牌</Text>
                  <Input
                    className={styles.inputField}
                    placeholder='请输入品牌'
                    value={newMedicineBrand}
                    onInput={(e) => setNewMedicineBrand(e.detail.value)}
                  />
                </View>
                <View className={styles.inputItem}>
                  <Text className={styles.inputLabel}>规格</Text>
                  <Input
                    className={styles.inputField}
                    placeholder='请输入规格'
                    value={newMedicineSpec}
                    onInput={(e) => setNewMedicineSpec(e.detail.value)}
                  />
                </View>
                <View className={styles.inputItem}>
                  <Text className={styles.inputLabel}>总量</Text>
                  <Input
                    className={styles.inputField}
                    type='digit'
                    placeholder='请输入总量'
                    value={newMedicineTotalDose}
                    onInput={(e) => setNewMedicineTotalDose(e.detail.value)}
                  />
                </View>
                <View className={styles.inputItem}>
                  <Text className={styles.inputLabel}>单位</Text>
                  <Input
                    className={styles.inputField}
                    placeholder='请输入单位'
                    value={newMedicineUnit}
                    onInput={(e) => setNewMedicineUnit(e.detail.value)}
                  />
                </View>
              </>
            )}

            <View className={styles.inputItem}>
              <Text className={styles.inputLabel}>产品批号</Text>
              <Input
                className={styles.inputField}
                placeholder='请输入产品批号'
                value={batchNumber}
                onInput={(e) => setBatchNumber(e.detail.value)}
              />
            </View>

            <View className={styles.inputItem}>
              <Text className={styles.inputLabel}>有效期</Text>
              <Input
                className={styles.inputField}
                placeholder='YYYY-MM-DD'
                value={expiryDate}
                onInput={(e) => setExpiryDate(e.detail.value)}
              />
            </View>

            <View className={styles.inputItem}>
              <Text className={styles.inputLabel}>本次用量</Text>
              <Input
                className={styles.inputField}
                type='digit'
                placeholder='请输入本次用量'
                value={usedDose}
                onInput={(e) => setUsedDose(e.detail.value)}
              />
            </View>

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setShowInputModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleSaveMedicine}
              >
                确认
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default MedicineVerifyPage
