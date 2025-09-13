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
import { Separator } from "@/components/ui/separator"
import { Search, Plus, FileText, DollarSign, CreditCard, AlertCircle, TrendingUp, Calendar } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  petName: string
  clientEmail: string
  clientPhone: string
  issueDate: string
  dueDate: string
  services: InvoiceService[]
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  balance: number
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
  paymentMethod?: "Cash" | "Credit Card" | "Check" | "Bank Transfer"
  notes?: string
}

interface InvoiceService {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: "Cash" | "Credit Card" | "Check" | "Bank Transfer"
  date: string
  reference?: string
  notes?: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "Sarah Johnson",
    petName: "Bella",
    clientEmail: "sarah.johnson@email.com",
    clientPhone: "(555) 123-4567",
    issueDate: "2024-01-15",
    dueDate: "2024-02-14",
    services: [
      {
        id: "1",
        description: "Annual Wellness Examination",
        quantity: 1,
        unitPrice: 85.0,
        total: 85.0,
      },
      {
        id: "2",
        description: "Rabies Vaccination",
        quantity: 1,
        unitPrice: 25.0,
        total: 25.0,
      },
      {
        id: "3",
        description: "DHPP Vaccination",
        quantity: 1,
        unitPrice: 30.0,
        total: 30.0,
      },
    ],
    subtotal: 140.0,
    tax: 11.2,
    total: 151.2,
    amountPaid: 151.2,
    balance: 0.0,
    status: "Paid",
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "Michael Chen",
    petName: "Max",
    clientEmail: "m.chen@email.com",
    clientPhone: "(555) 987-6543",
    issueDate: "2024-01-18",
    dueDate: "2024-02-17",
    services: [
      {
        id: "4",
        description: "Dental Cleaning",
        quantity: 1,
        unitPrice: 350.0,
        total: 350.0,
      },
      {
        id: "5",
        description: "Tooth Extraction",
        quantity: 2,
        unitPrice: 75.0,
        total: 150.0,
      },
      {
        id: "6",
        description: "Anesthesia",
        quantity: 1,
        unitPrice: 125.0,
        total: 125.0,
      },
    ],
    subtotal: 625.0,
    tax: 50.0,
    total: 675.0,
    amountPaid: 0.0,
    balance: 675.0,
    status: "Sent",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "Emily Davis",
    petName: "Whiskers",
    clientEmail: "emily.davis@email.com",
    clientPhone: "(555) 456-7890",
    issueDate: "2024-01-10",
    dueDate: "2024-01-25",
    services: [
      {
        id: "7",
        description: "Emergency Consultation",
        quantity: 1,
        unitPrice: 150.0,
        total: 150.0,
      },
      {
        id: "8",
        description: "X-Ray (2 views)",
        quantity: 1,
        unitPrice: 120.0,
        total: 120.0,
      },
      {
        id: "9",
        description: "Pain Medication",
        quantity: 1,
        unitPrice: 35.0,
        total: 35.0,
      },
    ],
    subtotal: 305.0,
    tax: 24.4,
    total: 329.4,
    amountPaid: 100.0,
    balance: 229.4,
    status: "Overdue",
    notes: "Partial payment received",
  },
]

const mockPayments: Payment[] = [
  {
    id: "1",
    invoiceId: "1",
    amount: 151.2,
    method: "Credit Card",
    date: "2024-01-15",
    reference: "****1234",
  },
  {
    id: "2",
    invoiceId: "3",
    amount: 100.0,
    method: "Cash",
    date: "2024-01-10",
    notes: "Partial payment",
  },
]

export function BillingModule() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [activeTab, setActiveTab] = useState("invoices")

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0)
  const outstandingBalance = invoices.reduce((sum, invoice) => sum + invoice.balance, 0)
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue").length
  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice for services provided</DialogDescription>
              </DialogHeader>
              <CreateInvoiceForm onClose={() => setIsCreateInvoiceOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${outstandingBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Successfully collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="services">Services & Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Invoices ({filteredInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{invoice.clientName}</div>
                          <div className="text-sm text-muted-foreground">Pet: {invoice.petName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">${invoice.total.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold ${invoice.balance > 0 ? "text-destructive" : "text-green-600"}`}>
                          ${invoice.balance.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          {invoice.balance > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setIsPaymentDialogOpen(true)
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Payment History</CardTitle>
              <CardDescription>Recent payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const invoice = invoices.find((inv) => inv.id === payment.invoiceId)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice?.invoiceNumber}</div>
                            <div className="text-sm text-muted-foreground">{invoice?.clientName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600">${payment.amount.toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{payment.reference || payment.notes || "-"}</div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Services & Pricing</CardTitle>
              <CardDescription>Manage service catalog and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Examinations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Wellness Examination</span>
                      <span className="font-semibold">$85.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Consultation</span>
                      <span className="font-semibold">$150.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up Visit</span>
                      <span className="font-semibold">$65.00</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vaccinations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rabies Vaccine</span>
                      <span className="font-semibold">$25.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DHPP Vaccine</span>
                      <span className="font-semibold">$30.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bordetella Vaccine</span>
                      <span className="font-semibold">$20.00</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Procedures</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Dental Cleaning</span>
                      <span className="font-semibold">$350.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tooth Extraction</span>
                      <span className="font-semibold">$75.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spay/Neuter</span>
                      <span className="font-semibold">$275.00</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnostics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>X-Ray (2 views)</span>
                      <span className="font-semibold">$120.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blood Work Panel</span>
                      <span className="font-semibold">$95.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Urinalysis</span>
                      <span className="font-semibold">$45.00</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInvoice && !isPaymentDialogOpen && (
        <InvoiceDetailsDialog invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      {selectedInvoice && isPaymentDialogOpen && (
        <PaymentDialog
          invoice={selectedInvoice}
          onClose={() => {
            setIsPaymentDialogOpen(false)
            setSelectedInvoice(null)
          }}
        />
      )}
    </div>
  )
}

function CreateInvoiceForm({ onClose }: { onClose: () => void }) {
  const [services, setServices] = useState<InvoiceService[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const addService = () => {
    const newService: InvoiceService = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setServices([...services, newService])
  }

  const removeService = (id: string) => {
    setServices(services.filter((service) => service.id !== id))
  }

  const updateService = (id: string, field: keyof InvoiceService, value: any) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return service
      }),
    )
  }

  const subtotal = services.reduce((sum, service) => sum + service.total, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Johnson (Bella)</SelectItem>
              <SelectItem value="michael">Michael Chen (Max)</SelectItem>
              <SelectItem value="emily">Emily Davis (Whiskers)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice Number</Label>
          <Input id="invoice-number" value="INV-2024-004" readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issue-date">Issue Date</Label>
          <Input id="issue-date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-semibold">Services</h3>
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={service.id} className="grid gap-3 md:grid-cols-12 items-end p-3 border rounded-lg">
              <div className="md:col-span-5">
                <Label className="text-sm">Description</Label>
                <Input
                  placeholder="Service description"
                  value={service.description}
                  onChange={(e) => updateService(service.id, "description", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={service.quantity}
                  onChange={(e) => updateService(service.id, "quantity", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={service.unitPrice}
                  onChange={(e) => updateService(service.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Total</Label>
                <Input value={`$${service.total.toFixed(2)}`} readOnly />
              </div>
              <div className="md:col-span-1">
                {services.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeService(service.id)}>
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Additional notes or payment terms..." />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onClose}>
          Save as Draft
        </Button>
        <Button onClick={onClose}>Create & Send Invoice</Button>
      </div>
    </div>
  )
}

function InvoiceDetailsDialog({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Invoice Details</DialogTitle>
          <DialogDescription>{invoice.invoiceNumber}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Client</Label>
              <p className="font-semibold">{invoice.clientName}</p>
              <p className="text-sm text-muted-foreground">Pet: {invoice.petName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Issue Date</Label>
              <p className="font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
              <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Services</Label>
            <div className="mt-2 space-y-2">
              {invoice.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{service.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.quantity} × ${service.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">${service.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="text-green-600">${invoice.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>
              <span className={invoice.balance > 0 ? "text-destructive" : "text-green-600"}>
                ${invoice.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
          {invoice.balance > 0 && (
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentDialog({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Record Payment</DialogTitle>
          <DialogDescription>
            {invoice.invoiceNumber} - Balance: ${invoice.balance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder={invoice.balance.toFixed(2)}
                defaultValue={invoice.balance.toFixed(2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input id="payment-date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (optional)</Label>
              <Input id="reference" placeholder="Check #, last 4 digits, etc." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="payment-notes">Notes (optional)</Label>
              <Textarea id="payment-notes" placeholder="Additional payment notes..." />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Record Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getStatusColor(status: Invoice["status"]) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-800"
    case "Sent":
      return "bg-blue-100 text-blue-800"
    case "Paid":
      return "bg-green-100 text-green-800"
    case "Overdue":
      return "bg-red-100 text-red-800"
    case "Cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
