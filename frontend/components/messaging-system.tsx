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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Send, MessageSquare, Mail, Phone, CheckCircle, AlertCircle, Users } from "lucide-react"

interface Message {
  id: string
  recipientName: string
  recipientPhone: string
  recipientEmail: string
  petName: string
  subject: string
  content: string
  type: "SMS" | "Email" | "Both"
  category: "Appointment Reminder" | "Vaccination Reminder" | "Follow-up" | "General" | "Emergency"
  status: "Sent" | "Delivered" | "Failed" | "Pending"
  sentAt: string
  sentBy: string
  automated: boolean
}

interface MessageTemplate {
  id: string
  name: string
  category: "Appointment Reminder" | "Vaccination Reminder" | "Follow-up" | "General" | "Emergency"
  subject: string
  content: string
  type: "SMS" | "Email" | "Both"
  variables: string[]
}

const mockMessages: Message[] = [
  {
    id: "1",
    recipientName: "Sarah Johnson",
    recipientPhone: "(555) 123-4567",
    recipientEmail: "sarah.johnson@email.com",
    petName: "Bella",
    subject: "Appointment Reminder - Tomorrow at 9:00 AM",
    content:
      "Hi Sarah, this is a reminder that Bella has an appointment tomorrow (Jan 19) at 9:00 AM for her annual check-up. Please arrive 10 minutes early. Reply STOP to opt out.",
    type: "Both",
    category: "Appointment Reminder",
    status: "Delivered",
    sentAt: "2024-01-18T10:00:00Z",
    sentBy: "Dr. Smith",
    automated: true,
  },
  {
    id: "2",
    recipientName: "Michael Chen",
    recipientPhone: "(555) 987-6543",
    recipientEmail: "m.chen@email.com",
    petName: "Max",
    subject: "Vaccination Due - Annual Shots",
    content:
      "Hello Michael, Max is due for his annual vaccinations. Please call us at (555) 123-4567 to schedule an appointment. Best regards, VetCare Team",
    type: "Email",
    category: "Vaccination Reminder",
    status: "Sent",
    sentAt: "2024-01-17T14:30:00Z",
    sentBy: "Reception",
    automated: true,
  },
  {
    id: "3",
    recipientName: "Emily Davis",
    recipientPhone: "(555) 456-7890",
    recipientEmail: "emily.davis@email.com",
    petName: "Whiskers",
    subject: "Post-Surgery Follow-up",
    content:
      "Hi Emily, how is Whiskers doing after his dental procedure? Please let us know if you have any concerns. His follow-up appointment is scheduled for next week.",
    type: "SMS",
    category: "Follow-up",
    status: "Delivered",
    sentAt: "2024-01-16T16:45:00Z",
    sentBy: "Dr. Smith",
    automated: false,
  },
]

const mockTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Appointment Reminder - 24 Hours",
    category: "Appointment Reminder",
    subject: "Appointment Reminder - Tomorrow at {TIME}",
    content:
      "Hi {OWNER_NAME}, this is a reminder that {PET_NAME} has an appointment tomorrow ({DATE}) at {TIME} for {REASON}. Please arrive 10 minutes early. Reply STOP to opt out.",
    type: "Both",
    variables: ["OWNER_NAME", "PET_NAME", "DATE", "TIME", "REASON"],
  },
  {
    id: "2",
    name: "Vaccination Due Notice",
    category: "Vaccination Reminder",
    subject: "Vaccination Due - {PET_NAME}",
    content:
      "Hello {OWNER_NAME}, {PET_NAME} is due for vaccinations. Please call us at {CLINIC_PHONE} to schedule an appointment. Best regards, {CLINIC_NAME}",
    type: "Email",
    variables: ["OWNER_NAME", "PET_NAME", "CLINIC_PHONE", "CLINIC_NAME"],
  },
  {
    id: "3",
    name: "Post-Treatment Follow-up",
    category: "Follow-up",
    subject: "How is {PET_NAME} doing?",
    content:
      "Hi {OWNER_NAME}, how is {PET_NAME} doing after the {TREATMENT}? Please let us know if you have any concerns. Your next appointment is {NEXT_APPOINTMENT}.",
    type: "SMS",
    variables: ["OWNER_NAME", "PET_NAME", "TREATMENT", "NEXT_APPOINTMENT"],
  },
]

export function MessagingSystem() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("messages")

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || message.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || message.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: Message["status"]) => {
    switch (status) {
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: Message["category"]) => {
    switch (category) {
      case "Appointment Reminder":
        return "bg-blue-100 text-blue-800"
      case "Vaccination Reminder":
        return "bg-green-100 text-green-800"
      case "Follow-up":
        return "bg-orange-100 text-orange-800"
      case "General":
        return "bg-gray-100 text-gray-800"
      case "Emergency":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: Message["type"]) => {
    switch (type) {
      case "SMS":
        return <Phone className="h-4 w-4" />
      case "Email":
        return <Mail className="h-4 w-4" />
      case "Both":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const sentToday = messages.filter((msg) => {
    const today = new Date().toDateString()
    return new Date(msg.sentAt).toDateString() === today
  }).length

  const deliveredToday = messages.filter((msg) => {
    const today = new Date().toDateString()
    return new Date(msg.sentAt).toDateString() === today && msg.status === "Delivered"
  }).length

  const failedMessages = messages.filter((msg) => msg.status === "Failed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Messaging System</h1>
          <p className="text-muted-foreground">Communicate with pet owners and manage automated reminders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Create Message Template</DialogTitle>
                <DialogDescription>Create a reusable template for common messages</DialogDescription>
              </DialogHeader>
              <CreateTemplateForm onClose={() => setIsTemplateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Compose New Message</DialogTitle>
                <DialogDescription>Send a message to pet owners</DialogDescription>
              </DialogHeader>
              <ComposeMessageForm onClose={() => setIsComposeDialogOpen(false)} templates={templates} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{sentToday}</div>
            <p className="text-xs text-muted-foreground">Sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredToday}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedMessages}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Appointment Reminder">Appointment Reminder</SelectItem>
                <SelectItem value="Vaccination Reminder">Vaccination Reminder</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Message History ({filteredMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{message.recipientName}</div>
                          <div className="text-sm text-muted-foreground">Pet: {message.petName}</div>
                          <div className="text-xs text-muted-foreground">
                            {message.type.includes("Phone") || message.type === "SMS" ? message.recipientPhone : ""}
                            {message.type === "Both" && " • "}
                            {message.type.includes("Email") || message.type === "Email" ? message.recipientEmail : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{message.subject}</div>
                          <div className="text-sm text-muted-foreground truncate">{message.content}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(message.type)}
                          <span className="text-sm">{message.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(message.category)}>{message.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(message.sentAt).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{new Date(message.sentAt).toLocaleTimeString()}</div>
                          <div className="text-xs text-muted-foreground">
                            by {message.sentBy} {message.automated && "(Auto)"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Message Templates</CardTitle>
              <CardDescription>Reusable templates for common communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                      </div>
                      <CardDescription>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(template.type)}
                          <span>{template.type}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium">Subject:</Label>
                          <p className="text-sm">{template.subject}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Content:</Label>
                          <p className="text-sm text-muted-foreground">{template.content}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Variables:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Automated Messaging</CardTitle>
              <CardDescription>Configure automatic reminders and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-serif font-semibold">Appointment Reminders</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox defaultChecked />
                        <div>
                          <div className="font-medium">24 Hours Before</div>
                          <div className="text-sm text-muted-foreground">Send reminder 1 day before appointment</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">SMS + Email</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox defaultChecked />
                        <div>
                          <div className="font-medium">2 Hours Before</div>
                          <div className="text-sm text-muted-foreground">Send final reminder 2 hours before</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">SMS</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif font-semibold">Vaccination Reminders</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox defaultChecked />
                        <div>
                          <div className="font-medium">30 Days Before Due</div>
                          <div className="text-sm text-muted-foreground">Initial vaccination reminder</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Email</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox defaultChecked />
                        <div>
                          <div className="font-medium">7 Days Overdue</div>
                          <div className="text-sm text-muted-foreground">Follow-up for overdue vaccinations</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">SMS + Email</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif font-semibold">Follow-up Messages</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox defaultChecked />
                        <div>
                          <div className="font-medium">Post-Surgery Check</div>
                          <div className="text-sm text-muted-foreground">24 hours after surgery procedures</div>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">SMS</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ComposeMessageForm({ onClose, templates }: { onClose: () => void; templates: MessageTemplate[] }) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const [messageType, setMessageType] = useState<string>("both")

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select patient owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Johnson (Bella)</SelectItem>
              <SelectItem value="michael">Michael Chen (Max)</SelectItem>
              <SelectItem value="emily">Emily Davis (Whiskers)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template">Use Template (optional)</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No template</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Message Type</Label>
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="both">SMS + Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment">Appointment Reminder</SelectItem>
              <SelectItem value="vaccination">Vaccination Reminder</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="Message subject..." />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={4} placeholder="Type your message here..." />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          <Send className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>
    </div>
  )
}

function CreateTemplateForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input id="template-name" placeholder="Appointment Reminder - 24 Hours" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-category">Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment">Appointment Reminder</SelectItem>
              <SelectItem value="vaccination">Vaccination Reminder</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-type">Message Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="both">SMS + Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-subject">Subject</Label>
          <Input id="template-subject" placeholder="Use {VARIABLES} for dynamic content" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="template-content">Message Content</Label>
          <Textarea
            id="template-content"
            rows={4}
            placeholder="Use variables like {OWNER_NAME}, {PET_NAME}, {DATE}, {TIME}..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2">
            {["OWNER_NAME", "PET_NAME", "DATE", "TIME", "CLINIC_NAME", "CLINIC_PHONE"].map((variable) => (
              <Badge key={variable} variant="outline" className="text-xs">
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Create Template</Button>
      </div>
    </div>
  )
}
