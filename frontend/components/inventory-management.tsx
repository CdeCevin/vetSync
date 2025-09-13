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
import { Search, Plus, Edit, AlertTriangle, Package, TrendingDown, Calendar } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  category: "Medication" | "Equipment" | "Supplies" | "Food" | "Cleaning"
  description: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  costPerUnit: number
  supplier: string
  supplierContact: string
  expirationDate?: string
  batchNumber?: string
  location: string
  lastRestocked: string
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Expired"
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Rabies Vaccine",
    category: "Medication",
    description: "Annual rabies vaccination for dogs and cats",
    currentStock: 3,
    minStock: 10,
    maxStock: 50,
    unit: "vials",
    costPerUnit: 25.99,
    supplier: "VetSupply Co.",
    supplierContact: "(555) 123-4567",
    expirationDate: "2024-12-31",
    batchNumber: "RV2024-001",
    location: "Refrigerator A, Shelf 2",
    lastRestocked: "2024-01-01",
    status: "Low Stock",
  },
  {
    id: "2",
    name: "Digital Thermometer",
    category: "Equipment",
    description: "Digital rectal thermometer for accurate temperature readings",
    currentStock: 5,
    minStock: 3,
    maxStock: 10,
    unit: "units",
    costPerUnit: 45.0,
    supplier: "MedEquip Solutions",
    supplierContact: "(555) 987-6543",
    location: "Equipment Cabinet B",
    lastRestocked: "2023-11-15",
    status: "In Stock",
  },
  {
    id: "3",
    name: "Surgical Gloves (Large)",
    category: "Supplies",
    description: "Sterile latex surgical gloves, size large",
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    unit: "boxes",
    costPerUnit: 12.5,
    supplier: "Medical Supplies Inc.",
    supplierContact: "(555) 456-7890",
    location: "Supply Room, Shelf A",
    lastRestocked: "2023-12-20",
    status: "Out of Stock",
  },
  {
    id: "4",
    name: "Antibiotics - Amoxicillin",
    category: "Medication",
    description: "Broad-spectrum antibiotic for bacterial infections",
    currentStock: 25,
    minStock: 15,
    maxStock: 60,
    unit: "tablets",
    costPerUnit: 0.85,
    supplier: "PharmVet",
    supplierContact: "(555) 321-9876",
    expirationDate: "2024-06-30",
    batchNumber: "AMX2024-003",
    location: "Pharmacy Cabinet, Drawer 3",
    lastRestocked: "2024-01-10",
    status: "In Stock",
  },
  {
    id: "5",
    name: "Disinfectant Spray",
    category: "Cleaning",
    description: "Hospital-grade disinfectant for surface cleaning",
    currentStock: 8,
    minStock: 5,
    maxStock: 25,
    unit: "bottles",
    costPerUnit: 8.99,
    supplier: "CleanCare Products",
    supplierContact: "(555) 654-3210",
    location: "Cleaning Supply Closet",
    lastRestocked: "2024-01-05",
    status: "In Stock",
  },
]

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800"
      case "Out of Stock":
        return "bg-red-100 text-red-800"
      case "Expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: InventoryItem["category"]) => {
    switch (category) {
      case "Medication":
        return "bg-blue-100 text-blue-800"
      case "Equipment":
        return "bg-purple-100 text-purple-800"
      case "Supplies":
        return "bg-green-100 text-green-800"
      case "Food":
        return "bg-orange-100 text-orange-800"
      case "Cleaning":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const lowStockItems = inventory.filter((item) => item.status === "Low Stock" || item.status === "Out of Stock")
  const expiringSoon = inventory.filter((item) => {
    if (!item.expirationDate) return false
    const expDate = new Date(item.expirationDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expDate <= thirtyDaysFromNow
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track medications, supplies, and equipment</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <AddInventoryForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Medication">Medication</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Supplies">Supplies</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Low Stock">Low Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Inventory Items ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                      {item.expirationDate && (
                        <div className="text-xs text-muted-foreground">
                          Expires: {new Date(item.expirationDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min: {item.minStock} • Max: {item.maxStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === "Low Stock" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.location}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{item.supplier}</div>
                      <div className="text-xs text-muted-foreground">{item.supplierContact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {(lowStockItems.length > 0 || expiringSoon.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {lowStockItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items that need immediate restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.currentStock} {item.unit} remaining (Min: {item.minStock})
                        </div>
                      </div>
                      <Button size="sm">Order Now</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringSoon.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Calendar className="h-5 w-5 text-destructive mr-2" />
                  Expiring Soon
                </CardTitle>
                <CardDescription>Items expiring within 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringSoon.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Expires: {item.expirationDate && new Date(item.expirationDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedItem && <ItemDetailsDialog item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}

function AddInventoryForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details & Supplier</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="Rabies Vaccine" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Brief description of the item..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input id="current-stock" type="number" placeholder="25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" placeholder="vials, boxes, units..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-stock">Minimum Stock</Label>
              <Input id="min-stock" type="number" placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-stock">Maximum Stock</Label>
              <Input id="max-stock" type="number" placeholder="50" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost per Unit ($)</Label>
              <Input id="cost" type="number" step="0.01" placeholder="25.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" placeholder="Refrigerator A, Shelf 2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" placeholder="VetSupply Co." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-contact">Supplier Contact</Label>
              <Input id="supplier-contact" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date (optional)</Label>
              <Input id="expiration" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Number (optional)</Label>
              <Input id="batch" placeholder="RV2024-001" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Add Item</Button>
      </div>
    </div>
  )
}

function ItemDetailsDialog({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Category</Label>
              <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
              <p className="font-semibold">
                {item.currentStock} {item.unit}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Stock Range</Label>
              <p className="font-semibold">
                {item.minStock} - {item.maxStock} {item.unit}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Cost per Unit</Label>
              <p className="font-semibold">${item.costPerUnit}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
              <p className="font-semibold">{item.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
              <p className="font-semibold">{item.supplier}</p>
              <p className="text-sm text-muted-foreground">{item.supplierContact}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Restocked</Label>
              <p className="font-semibold">{new Date(item.lastRestocked).toLocaleDateString()}</p>
            </div>
            {item.expirationDate && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Expiration Date</Label>
                <p className="font-semibold">{new Date(item.expirationDate).toLocaleDateString()}</p>
              </div>
            )}
            {item.batchNumber && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                <p className="font-semibold font-mono text-sm">{item.batchNumber}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>Restock Item</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getCategoryColor(category: InventoryItem["category"]) {
  switch (category) {
    case "Medication":
      return "bg-blue-100 text-blue-800"
    case "Equipment":
      return "bg-purple-100 text-purple-800"
    case "Supplies":
      return "bg-green-100 text-green-800"
    case "Food":
      return "bg-orange-100 text-orange-800"
    case "Cleaning":
      return "bg-cyan-100 text-cyan-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusColor(status: InventoryItem["status"]) {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800"
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800"
    case "Out of Stock":
      return "bg-red-100 text-red-800"
    case "Expired":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
