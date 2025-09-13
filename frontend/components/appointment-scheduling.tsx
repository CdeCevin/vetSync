"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Plus, CalendarIcon, Edit, CheckCircle } from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  ownerName: string
  ownerPhone: string
  date: string
  time: string
  duration: number // in minutes
  type: "Check-up" | "Vaccination" | "Surgery" | "Emergency" | "Consultation" | "Follow-up"
  veterinarian: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "No Show"
  notes?: string
  reason: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Bella",
    ownerName: "Sarah Johnson",
    ownerPhone: "(555) 123-4567",
    date: "2024-01-18",
    time: "09:00",
    duration: 30,
    type: "Check-up",
    veterinarian: "Dr. Smith",
    status: "Scheduled",
    reason: "Annual wellness examination",
  },
  {
    id: "2",
    patientName: "Max",
    ownerName: "Michael Chen",
    ownerPhone: "(555) 987-6543",
    date: "2024-01-18",
    time: "10:30",
    duration: 45,
    type: "Surgery",
    veterinarian: "Dr. Wilson",
    status: "Scheduled",
    reason: "Dental cleaning",
    notes: "Patient needs to fast 12 hours before procedure",
  },
  {
    id: "3",
    patientName: "Whiskers",
    ownerName: "Emily Davis",
    ownerPhone: "(555) 456-7890",
    date: "2024-01-18",
    time: "14:00",
    duration: 20,
    type: "Follow-up",
    veterinarian: "Dr. Smith",
    status: "Completed",
    reason: "Post-surgery check",
  },
  {
    id: "4",
    patientName: "Luna",
    ownerName: "David Wilson",
    ownerPhone: "(555) 321-9876",
    date: "2024-01-19",
    time: "11:00",
    duration: 30,
    type: "Vaccination",
    veterinarian: "Dr. Smith",
    status: "Scheduled",
    reason: "Annual vaccinations",
  },
]

export function AppointmentScheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "No Show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: Appointment["type"]) => {
    switch (type) {
      case "Check-up":
        return "bg-green-100 text-green-800"
      case "Vaccination":
        return "bg-blue-100 text-blue-800"
      case "Surgery":
        return "bg-red-100 text-red-800"
      case "Emergency":
        return "bg-red-100 text-red-800"
      case "Consultation":
        return "bg-purple-100 text-purple-800"
      case "Follow-up":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const todaysAppointments = appointments.filter((apt) => apt.date === selectedDate.toISOString().split("T")[0])

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Schedule New Appointment</DialogTitle>
              <DialogDescription>Book a new appointment for a patient</DialogDescription>
            </DialogHeader>
            <AddAppointmentForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Appointments</span>
                <Badge variant="secondary">{todaysAppointments.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <Badge className="bg-green-100 text-green-800">
                  {todaysAppointments.filter((apt) => apt.status === "Completed").length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {todaysAppointments.filter((apt) => apt.status === "Scheduled").length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {viewMode === "day" && <DayView appointments={todaysAppointments} timeSlots={timeSlots} />}
          {viewMode === "week" && <WeekView selectedDate={selectedDate} appointments={appointments} />}
          {viewMode === "month" && <MonthView selectedDate={selectedDate} appointments={appointments} />}
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
      )}
    </div>
  )
}

function DayView({ appointments, timeSlots }: { appointments: Appointment[]; timeSlots: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Daily Schedule</CardTitle>
        <CardDescription>Today's appointments and available time slots</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeSlots.map((time) => {
            const appointment = appointments.find((apt) => apt.time === time)
            return (
              <div key={time} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-16 text-sm font-medium text-muted-foreground">{time}</div>
                {appointment ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{appointment.patientName}</span>
                        <Badge className={getTypeColor(appointment.type)}>{appointment.type}</Badge>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.ownerName} • {appointment.reason}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-muted-foreground">Available</div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function WeekView({ selectedDate, appointments }: { selectedDate: Date; appointments: Appointment[] }) {
  const weekStart = new Date(selectedDate)
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return day
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Weekly Schedule</CardTitle>
        <CardDescription>Week of {weekStart.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter((apt) => apt.date === day.toISOString().split("T")[0])
            return (
              <div key={day.toISOString()} className="border rounded-lg p-3">
                <div className="font-semibold text-sm mb-2">
                  {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="text-xs p-1 bg-primary/10 rounded">
                      <div className="font-medium">{apt.time}</div>
                      <div className="truncate">{apt.patientName}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function MonthView({ selectedDate, appointments }: { selectedDate: Date; appointments: Appointment[] }) {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days = []
  const date = new Date(startDate)
  while (date <= monthEnd || days.length < 42) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Monthly Schedule</CardTitle>
        <CardDescription>
          {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayAppointments = appointments.filter((apt) => apt.date === day.toISOString().split("T")[0])
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
            return (
              <div
                key={day.toISOString()}
                className={`min-h-20 p-1 border rounded ${isCurrentMonth ? "bg-background" : "bg-muted/50"}`}
              >
                <div className={`text-sm ${isCurrentMonth ? "font-medium" : "text-muted-foreground"}`}>
                  {day.getDate()}
                </div>
                {dayAppointments.length > 0 && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {dayAppointments.length > 1 && (
                      <div className="text-xs text-muted-foreground">+{dayAppointments.length - 1}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function AddAppointmentForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient">Patient</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bella">Bella (Golden Retriever)</SelectItem>
              <SelectItem value="max">Max (German Shepherd)</SelectItem>
              <SelectItem value="whiskers">Whiskers (Persian Cat)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="veterinarian">Veterinarian</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select veterinarian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dr-smith">Dr. Smith</SelectItem>
              <SelectItem value="dr-wilson">Dr. Wilson</SelectItem>
              <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="09:30">9:30 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="10:30">10:30 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Appointment Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check-up">Check-up</SelectItem>
              <SelectItem value="vaccination">Vaccination</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="reason">Reason for Visit</Label>
          <Input id="reason" placeholder="Annual wellness examination" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Any special instructions or notes..." />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Schedule Appointment</Button>
      </div>
    </div>
  )
}

function AppointmentDetailsDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Appointment Details</DialogTitle>
          <DialogDescription>
            {appointment.date} at {appointment.time}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
              <p className="font-semibold">{appointment.patientName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Owner</Label>
              <p className="font-semibold">{appointment.ownerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Type</Label>
              <Badge className={getTypeColor(appointment.type)}>{appointment.type}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Veterinarian</Label>
              <p className="font-semibold">{appointment.veterinarian}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
              <p className="font-semibold">{appointment.duration} minutes</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
            <p>{appointment.reason}</p>
          </div>
          {appointment.notes && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <p>{appointment.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTypeColor(type: Appointment["type"]) {
  switch (type) {
    case "Check-up":
      return "bg-green-100 text-green-800"
    case "Vaccination":
      return "bg-blue-100 text-blue-800"
    case "Surgery":
      return "bg-red-100 text-red-800"
    case "Emergency":
      return "bg-red-100 text-red-800"
    case "Consultation":
      return "bg-purple-100 text-purple-800"
    case "Follow-up":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusColor(status: Appointment["status"]) {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-800"
    case "In Progress":
      return "bg-yellow-100 text-yellow-800"
    case "Completed":
      return "bg-green-100 text-green-800"
    case "Cancelled":
      return "bg-red-100 text-red-800"
    case "No Show":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
