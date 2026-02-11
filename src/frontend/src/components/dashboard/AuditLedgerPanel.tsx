import { useGetAuditLog } from '../../hooks/useAuditLedger';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2 } from 'lucide-react';

export default function AuditLedgerPanel() {
  const { data: auditEntries, isLoading, isError } = useGetAuditLog(50);

  return (
    <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">Audit Ledger</h2>
        <FileText className="h-4 w-4 text-white/40" />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">Failed to load audit log</p>
        </div>
      ) : !auditEntries || auditEntries.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">No audit entries yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-lg border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/50">Time</TableHead>
                <TableHead className="text-white/50">Action</TableHead>
                <TableHead className="text-white/50">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEntries.map((entry, index) => (
                <TableRow
                  key={`${entry.timestamp}-${index}`}
                  className="animate-in fade-in slide-in-from-top-2 duration-300 border-white/5 hover:bg-white/5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-mono text-xs text-white/70">
                    {new Date(Number(entry.timestamp) / 1_000_000).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="font-medium text-white/90">
                    {entry.action}
                  </TableCell>
                  <TableCell className="text-sm text-white/60">
                    {entry.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
