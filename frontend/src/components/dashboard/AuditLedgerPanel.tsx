import { useGetAuditLog } from '../../hooks/useAuditLedger';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { TableSkeleton } from '../common/LoadingSkeletons';
import { StateMessage } from '../common/StateMessage';

export default function AuditLedgerPanel() {
  const { data: auditEntries, isLoading, isError, refetch } = useGetAuditLog(50);

  if (isLoading) {
    return (
      <div id="audit-ledger-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Audit Ledger</h2>
          <FileText className="h-5 w-5 text-white/40" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div id="audit-ledger-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <StateMessage
          variant="error"
          title="Failed to Load"
          description="Unable to fetch audit log entries."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  if (!auditEntries || auditEntries.length === 0) {
    return (
      <div id="audit-ledger-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <StateMessage
          variant="empty"
          title="No Audit Entries"
          description="System actions and configuration changes will appear here."
        />
      </div>
    );
  }

  return (
    <div id="audit-ledger-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Audit Ledger</h2>
          <p className="text-xs text-white/50 sm:text-sm">Recent system actions and changes</p>
        </div>
        <FileText className="h-5 w-5 text-white/40" />
      </div>

      <ScrollArea className="h-[400px] rounded-lg border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="font-semibold text-white/70">Time</TableHead>
              <TableHead className="font-semibold text-white/70">Action</TableHead>
              <TableHead className="font-semibold text-white/70">Details</TableHead>
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
                <TableCell className="font-medium text-white">
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
    </div>
  );
}
