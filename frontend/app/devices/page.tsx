"use client"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const mockDevices = [
  {
    deviceName: "Solar Inverter X1",
    deviceType: "Inverter",
    serialNumber: "INV-123456",
    manufacturer: "SunPower",
    status: "approved",
    submittedAt: "2024-06-01",
  },
  {
    deviceName: "Battery Pack B2",
    deviceType: "Battery",
    serialNumber: "BAT-654321",
    manufacturer: "PowerCell",
    status: "under revision",
    submittedAt: "2024-06-03",
  },
  {
    deviceName: "Wind Turbine W3",
    deviceType: "Turbine",
    serialNumber: "TUR-789012",
    manufacturer: "WindGen",
    status: "rejected",
    submittedAt: "2024-06-05",
  },
]

const statusColor = {
  approved: "success",
  "under revision": "warning",
  rejected: "destructive",
} as const

export default function DevicesPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Devices</h1>
        <Button onClick={() => router.push('/form')}>Create New Device</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Manufacturer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockDevices.map((device, idx) => (
            <TableRow key={idx}>
              <TableCell>{device.deviceName}</TableCell>
              <TableCell>{device.deviceType}</TableCell>
              <TableCell>{device.serialNumber}</TableCell>
              <TableCell>{device.manufacturer}</TableCell>
              <TableCell>
                <Badge variant={statusColor[device.status] || "secondary"}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{device.submittedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 