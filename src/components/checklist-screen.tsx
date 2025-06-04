
'use client'

import { useState } from 'react'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChecklistData {
  truckType: string
  vehicleNumber: string
  customer: string
  raNumber: string
  dateOut?: string
  timeOut?: string
  dateIn?: string
  timeIn?: string
  milesOut?: number
  milesIn?: number
  fuelLevelOut?: string
  fuelLevelIn?: string
  reeferHoursOut?: number
  reeferHoursIn?: number
  defLevelOut?: string
  defLevelIn?: string
  otherEquipment: string
  equipmentCheck: string[]
  damageNotes: string
  hasNewDamage: boolean
}

interface ChecklistScreenProps {
  transactionType: 'checkout' | 'return' | 'update'
  onNext: (checklistData: ChecklistData) => void
  onBack: () => void
}

export function ChecklistScreen({ transactionType, onNext, onBack }: ChecklistScreenProps) {
  const [formData, setFormData] = useState<ChecklistData>({
    truckType: '',
    vehicleNumber: '',
    customer: '',
    raNumber: '',
    dateOut: transactionType === 'checkout' ? new Date().toISOString().split('T')[0] : '',
    timeOut: transactionType === 'checkout' ? new Date().toTimeString().slice(0, 5) : '',
    dateIn: transactionType === 'return' ? new Date().toISOString().split('T')[0] : '',
    timeIn: transactionType === 'return' ? new Date().toTimeString().slice(0, 5) : '',
    otherEquipment: '',
    equipmentCheck: [],
    damageNotes: '',
    hasNewDamage: false
  })

  const fuelLevels = ['Full', '¾', '½', '¼', 'Empty']
  const defLevels = ['Full', '¾', '½', '¼', 'Empty']
  const equipmentOptions = [
    'Liftgate',
    'Inspection Current',
    'Registration Current',
    'Insurance Current',
    'Safety Kit',
    'Radio'
  ]

  const updateField = (field: keyof ChecklistData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleEquipmentCheck = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentCheck: prev.equipmentCheck.includes(equipment)
        ? prev.equipmentCheck.filter(item => item !== equipment)
        : [...prev.equipmentCheck, equipment]
    }))
  }

  const isFormValid = () => {
    const required = ['truckType', 'vehicleNumber', 'customer']
    
    if (transactionType === 'checkout') {
      required.push('dateOut', 'timeOut', 'fuelLevelOut')
      if (formData.milesOut === undefined) return false
    }
    
    if (transactionType === 'return') {
      required.push('dateIn', 'timeIn', 'fuelLevelIn')
      if (formData.milesIn === undefined) return false
    }
    
    return required.every(field => formData[field as keyof ChecklistData])
  }

  const handleNext = () => {
    if (isFormValid()) {
      onNext(formData)
    }
  }

  const showOutFields = transactionType === 'checkout' || transactionType === 'update'
  const showInFields = transactionType === 'return' || transactionType === 'update'

  return (
    <WizardLayout
      currentStep={4}
      totalSteps={5}
      stepTitle="Inspection Checklist"
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="truckType">Truck Type *</Label>
              <Select value={formData.truckType} onValueChange={(value) => updateField('truckType', value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select truck type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box-truck">Box Truck</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="refrigerated">Refrigerated Truck</SelectItem>
                  <SelectItem value="pickup">Pickup Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicleNumber">Vehicle # *</Label>
              <Input
                id="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => updateField('vehicleNumber', e.target.value)}
                placeholder="Enter vehicle number"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => updateField('customer', e.target.value)}
                placeholder="Enter customer name"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="raNumber">RA # (Optional)</Label>
              <Input
                id="raNumber"
                value={formData.raNumber}
                onChange={(e) => updateField('raNumber', e.target.value)}
                placeholder="Enter RA number"
                className="min-h-[44px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Out Fields */}
        {showOutFields && (
          <Card>
            <CardHeader>
              <CardTitle>Checkout Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOut">Date Out {transactionType === 'checkout' ? '*' : ''}</Label>
                  <Input
                    id="dateOut"
                    type="date"
                    value={formData.dateOut}
                    onChange={(e) => updateField('dateOut', e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <Label htmlFor="timeOut">Time Out {transactionType === 'checkout' ? '*' : ''}</Label>
                  <Input
                    id="timeOut"
                    type="time"
                    value={formData.timeOut}
                    onChange={(e) => updateField('timeOut', e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="milesOut">Miles Out {transactionType === 'checkout' ? '*' : ''}</Label>
                <Input
                  id="milesOut"
                  type="number"
                  value={formData.milesOut || ''}
                  onChange={(e) => updateField('milesOut', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter miles"
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <Label htmlFor="fuelLevelOut">Fuel Level Out {transactionType === 'checkout' ? '*' : ''}</Label>
                <Select value={formData.fuelLevelOut} onValueChange={(value) => updateField('fuelLevelOut', value)}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select fuel level" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reeferHoursOut">Reefer Hours Out (Optional)</Label>
                <Input
                  id="reeferHoursOut"
                  type="number"
                  value={formData.reeferHoursOut || ''}
                  onChange={(e) => updateField('reeferHoursOut', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter reefer hours"
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <Label htmlFor="defLevelOut">DEF Level Out (Optional)</Label>
                <Select value={formData.defLevelOut} onValueChange={(value) => updateField('defLevelOut', value)}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select DEF level" />
                  </SelectTrigger>
                  <SelectContent>
                    {defLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Fields */}
        {showInFields && (
          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateIn">Date In {transactionType === 'return' ? '*' : ''}</Label>
                  <Input
                    id="dateIn"
                    type="date"
                    value={formData.dateIn}
                    onChange={(e) => updateField('dateIn', e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <Label htmlFor="timeIn">Time In {transactionType === 'return' ? '*' : ''}</Label>
                  <Input
                    id="timeIn"
                    type="time"
                    value={formData.timeIn}
                    onChange={(e) => updateField('timeIn', e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="milesIn">Miles In {transactionType === 'return' ? '*' : ''}</Label>
                <Input
                  id="milesIn"
                  type="number"
                  value={formData.milesIn || ''}
                  onChange={(e) => updateField('milesIn', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter miles"
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <Label htmlFor="fuelLevelIn">Fuel Level In {transactionType === 'return' ? '*' : ''}</Label>
                <Select value={formData.fuelLevelIn} onValueChange={(value) => updateField('fuelLevelIn', value)}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select fuel level" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reeferHoursIn">Reefer Hours In (Optional)</Label>
                <Input
                  id="reeferHoursIn"
                  type="number"
                  value={formData.reeferHoursIn || ''}
                  onChange={(e) => updateField('reeferHoursIn', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter reefer hours"
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <Label htmlFor="defLevelIn">DEF Level In (Optional)</Label>
                <Select value={formData.defLevelIn} onValueChange={(value) => updateField('defLevelIn', value)}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select DEF level" />
                  </SelectTrigger>
                  <SelectContent>
                    {defLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment & Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="otherEquipment">Other Equipment (Optional)</Label>
              <Textarea
                id="otherEquipment"
                value={formData.otherEquipment}
                onChange={(e) => updateField('otherEquipment', e.target.value)}
                placeholder="Describe any other equipment..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Equipment Check (Optional)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={formData.equipmentCheck.includes(equipment)}
                      onCheckedChange={() => toggleEquipmentCheck(equipment)}
                      className="min-h-[20px] min-w-[20px]"
                    />
                    <Label htmlFor={equipment} className="text-sm">
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="hasNewDamage"
                  checked={formData.hasNewDamage}
                  onCheckedChange={(checked) => updateField('hasNewDamage', checked)}
                  className="min-h-[20px] min-w-[20px]"
                />
                <Label htmlFor="hasNewDamage">New Damage?</Label>
              </div>
              
              {formData.hasNewDamage && (
                <Textarea
                  value={formData.damageNotes}
                  onChange={(e) => updateField('damageNotes', e.target.value)}
                  placeholder="Describe the damage in detail..."
                  className="min-h-[100px]"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!isFormValid()}
          className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
        >
          Continue to Review
        </Button>
      </div>
    </WizardLayout>
  )
}
