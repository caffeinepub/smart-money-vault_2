import { useListTiers } from '../../hooks/useTiers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminTierManagementPanel() {
  const { data: tiers, isLoading } = useListTiers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return (
      <Card className="border-white/5 bg-[#121212]">
        <CardContent className="py-12 text-center">
          <p className="text-white/60">No subscription tiers found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-[#121212]">
      <CardHeader>
        <CardTitle className="text-white">Subscription Tiers</CardTitle>
        <CardDescription className="text-white/60">
          View and manage subscription tier configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60">Tier Name</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-right text-white/60">Price</TableHead>
                <TableHead className="text-right text-white/60">Max Bots</TableHead>
                <TableHead className="text-right text-white/60">Max API Calls</TableHead>
                <TableHead className="text-white/60">Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{tier.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tier.active ? 'default' : 'destructive'}
                      className={
                        tier.active
                          ? 'bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30'
                          : 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
                      }
                    >
                      {tier.active ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {tier.priceInCents === BigInt(0)
                      ? 'Free'
                      : `$${(Number(tier.priceInCents) / 100).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {Number(tier.maxBots) === 999999 ? '∞' : tier.maxBots.toString()}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {Number(tier.maxApiCalls) === 999999
                      ? '∞'
                      : Number(tier.maxApiCalls).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs space-y-1">
                      {tier.features.slice(0, 2).map((feature, idx) => (
                        <p key={idx} className="text-xs text-white/60">
                          • {feature}
                        </p>
                      ))}
                      {tier.features.length > 2 && (
                        <p className="text-xs text-white/40">
                          +{tier.features.length - 2} more
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
