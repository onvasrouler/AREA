import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ServicesTab({
  ServicesInfos,
  serviceExpirations,
  loggedInServices,
  handleRefreshServicesTokens,
  handleLogoutFromServices
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Table>
        <TableCaption>Your connected services</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Token expiration date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Refresh</TableHead>
            <TableHead>Disconnect</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {ServicesInfos.map((service, index) => (
              <motion.tr
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {service.name}
                  </div>
                </TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{serviceExpirations[service.name.toLowerCase()] || 'N/A'}</TableCell>
                <TableCell>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={
                      loggedInServices[service.name.toLowerCase()]
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {loggedInServices[service.name.toLowerCase()]
                      ? "Connected"
                      : serviceExpirations[service.name.toLowerCase()] !== "N/A" &&
                        new Date(serviceExpirations[service.name.toLowerCase()]) <= new Date()
                        ? "Token Expired"
                        : "Not Connected"}
                  </motion.span>
                </TableCell>
                <TableCell>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="icon" onClick={() => handleRefreshServicesTokens(service.name.toLowerCase())}>
                      <RefreshCcw />
                    </Button>
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="destructive" onClick={() => handleLogoutFromServices(service.name.toLowerCase())}>
                      Disconnect
                    </Button>
                  </motion.div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </motion.div>
  );
}

