import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Package, AlertTriangle, Clock, CheckCircle } from "lucide-react"

interface DashboardOverviewProps {
  userRole: "veterinarian" | "receptionist"
}

export function DashboardOverview({ userRole }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-foreground">
          Welcome back, {userRole === "veterinarian" ? "Doctor" : ""}
        </h1>
        <p className="text-muted-foreground">Here's what's happening at your practice today</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>9 completed</span>
              <Clock className="h-3 w-3 text-orange-500" />
              <span>3 pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">247</div>
            <p className="text-xs text-muted-foreground">+12 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="destructive" className="text-xs">
                5 Low Stock
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
            <CardDescription>Latest updates from your practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Appointment completed</p>
                <p className="text-xs text-muted-foreground">Bella (Golden Retriever) - Vaccination</p>
              </div>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Low inventory alert</p>
                <p className="text-xs text-muted-foreground">Rabies vaccine - 3 units remaining</p>
              </div>
              <span className="text-xs text-muted-foreground">15 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New appointment scheduled</p>
                <p className="text-xs text-muted-foreground">Max (German Shepherd) - Check-up</p>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
            <CardDescription>Common tasks for {userRole}s</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button className="justify-start h-auto p-4">
                <div className="flex flex-col items-start space-y-1">
                  <span className="font-serif font-semibold">Schedule Appointment</span>
                  <span className="text-xs opacity-80">Book a new patient visit</span>
                </div>
              </Button>
              <Button variant="secondary" className="justify-start h-auto p-4">
                <div className="flex flex-col items-start space-y-1">
                  <span className="font-serif font-semibold">Patient Lookup</span>
                  <span className="text-xs opacity-80">Search medical records</span>
                </div>
              </Button>
              {userRole === "veterinarian" && (
                <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                  <div className="flex flex-col items-start space-y-1">
                    <span className="font-serif font-semibold">Add Treatment</span>
                    <span className="text-xs opacity-80">Record new treatment</span>
                  </div>
                </Button>
              )}
              <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                <div className="flex flex-col items-start space-y-1">
                  <span className="font-serif font-semibold">Send Message</span>
                  <span className="text-xs opacity-80">Contact pet owner</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
