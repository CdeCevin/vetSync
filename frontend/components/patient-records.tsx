"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Search, Plus, Edit, FileText, Phone, Mail, MapPin } from "lucide-react"

interface Patient {
  id: string
  name: string
  species: string
  breed: string
  age: number
  gender: "Male" | "Female"
  weight: number
  color: string
  microchipId?: string
  owner: {
    name: string
    phone: string
    email: string
    address: string
  }
  medicalHistory: MedicalRecord[]
  lastVisit: string
  nextAppointment?: string
  status: "Active" | "Inactive" | "Critical"
}

interface MedicalRecord {
  id: string
  date: string
  type: "Vaccination" | "Surgery" | "Check-up" | "Treatment" | "Emergency"
  description: string
  veterinarian: string
  notes?: string
  medications?: string[]
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Bella",
    species: "Dog",
    breed: "Golden Retriever",
    age: 3,
    gender: "Female",
    weight: 28.5,
    color: "Golden",
    microchipId: "123456789012345",
    owner: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      email: "sarah.johnson@email.com",
      address: "123 Oak Street, Springfield, IL 62701",
    },
    medicalHistory: [
      {
        id: "1",
        date: "2024-01-15",
        type: "Vaccination",
        description: "Annual vaccinations (DHPP, Rabies)",
        veterinarian: "Dr. Smith",
        medications: ["DHPP Vaccine", "Rabies Vaccine"],
      },
      {
        id: "2",
        date: "2023-12-10",
        type: "Check-up",
        description: "Routine wellness examination",
        veterinarian: "Dr. Smith",
        notes: "Healthy, no concerns noted",
      },
    ],
    lastVisit: "2024-01-15",
    nextAppointment: "2024-07-15",
    status: "Active",
  },
  {
    id: "2",
    name: "Max",
    species: "Dog",
    breed: "German Shepherd",
    age: 5,
    gender: "Male",
    weight: 35.2,
    color: "Black and Tan",
    owner: {
      name: "Michael Chen",
      phone: "(555) 987-6543",
      email: "m.chen@email.com",
      address: "456 Pine Avenue, Springfield, IL 62702",
    },
    medicalHistory: [
      {
        id: "3",
        date: "2024-01-20",
        type: "Treatment",
        description: "Skin allergy treatment",
        veterinarian: "Dr. Wilson",
        medications: ["Antihistamine", "Medicated Shampoo"],
      },
    ],
    lastVisit: "2024-01-20",
    status: "Active",
  },
  {
    id: "3",
    name: "Whiskers",
    species: "Cat",
    breed: "Persian",
    age: 7,
    gender: "Male",
    weight: 4.8,
    color: "White",
    owner: {
      name: "Emily Davis",
      phone: "(555) 456-7890",
      email: "emily.davis@email.com",
      address: "789 Maple Drive, Springfield, IL 62703",
    },
    medicalHistory: [
      {
        id: "4",
        date: "2024-01-10",
        type: "Surgery",
        description: "Dental cleaning and tooth extraction",
        veterinarian: "Dr. Smith",
        notes: "Procedure completed successfully, recovery normal",
      },
    ],
    lastVisit: "2024-01-10",
    status: "Critical",
  },
]

export function PatientRecords() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: Patient["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRecordTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "Vaccination":
        return "bg-blue-100 text-blue-800"
      case "Surgery":
        return "bg-red-100 text-red-800"
      case "Check-up":
        return "bg-green-100 text-green-800"
      case "Treatment":
        return "bg-orange-100 text-orange-800"
      case "Emergency":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Patient Records</h1>
          <p className="text-muted-foreground">Manage patient information and medical histories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Add New Patient</DialogTitle>
              <DialogDescription>Enter the patient and owner information</DialogDescription>
            </DialogHeader>
            <AddPatientForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, owners, or breeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Patients ({filteredPatients.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedPatient?.id === patient.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.breed} • {patient.owner.name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientDetails patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif font-semibold text-lg">Select a Patient</h3>
                  <p className="text-muted-foreground">Choose a patient from the list to view their details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PatientDetails({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif">{patient.name}</CardTitle>
            <CardDescription>
              {patient.breed} • {patient.age} years old
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="owner">Owner Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-serif font-semibold">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Species:</span>
                    <span>{patient.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breed:</span>
                    <span>{patient.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{patient.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{patient.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span>{patient.color}</span>
                  </div>
                  {patient.microchipId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Microchip:</span>
                      <span className="font-mono text-xs">{patient.microchipId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-semibold">Visit Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Visit:</span>
                    <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
                  {patient.nextAppointment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Appointment:</span>
                      <span>{new Date(patient.nextAppointment).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      className={`${
                        patient.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : patient.status === "Critical"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-semibold">Medical History</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
            <div className="space-y-3">
              {patient.medicalHistory.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getRecordTypeColor(record.type)}>{record.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-semibold">{record.description}</h5>
                        <p className="text-sm text-muted-foreground">Veterinarian: {record.veterinarian}</p>
                        {record.notes && <p className="text-sm">{record.notes}</p>}
                        {record.medications && (
                          <div className="flex flex-wrap gap-1">
                            {record.medications.map((med, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="owner" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-serif font-semibold">Owner Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{patient.owner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{patient.owner.name}</p>
                    <p className="text-sm text-muted-foreground">Pet Owner</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.owner.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.owner.email}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{patient.owner.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AddPatientForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="patient" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient">Patient Info</TabsTrigger>
          <TabsTrigger value="owner">Owner Info</TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name</Label>
              <Input id="name" placeholder="Bella" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" placeholder="Golden Retriever" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input id="age" type="number" placeholder="3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="28.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" placeholder="Golden" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="microchip">Microchip ID (optional)</Label>
              <Input id="microchip" placeholder="123456789012345" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="owner" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input id="owner-name" placeholder="Sarah Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-phone">Phone</Label>
              <Input id="owner-phone" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-email">Email</Label>
              <Input id="owner-email" type="email" placeholder="sarah.johnson@email.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="owner-address">Address</Label>
              <Textarea id="owner-address" placeholder="123 Oak Street, Springfield, IL 62701" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Add Patient</Button>
      </div>
    </div>
  )
}

function getRecordTypeColor(type: MedicalRecord["type"]) {
  switch (type) {
    case "Vaccination":
      return "bg-blue-100 text-blue-800"
    case "Surgery":
      return "bg-red-100 text-red-800"
    case "Check-up":
      return "bg-green-100 text-green-800"
    case "Treatment":
      return "bg-orange-100 text-orange-800"
    case "Emergency":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
