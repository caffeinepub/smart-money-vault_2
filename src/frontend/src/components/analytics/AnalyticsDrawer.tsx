import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useGetAnalyticsEvents } from '../../hooks/useBackendAnalytics';
import { Loader2, TrendingUp, MapPin, CreditCard, CheckCircle, Play } from 'lucide-react';

interface AnalyticsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AnalyticsDrawer({ open, onClose }: AnalyticsDrawerProps) {
  const { events: localEvents } = useAnalytics();
  const { data: backendEvents, isLoading } = useGetAnalyticsEvents(50);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <MapPin className="h-3 w-3" />;
      case 'tour':
        return <TrendingUp className="h-3 w-3" />;
      case 'stripe':
        return <CreditCard className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'started':
        return <Play className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'navigation':
        return 'bg-profit/20 text-profit border-profit/30';
      case 'tour':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'stripe':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed':
        return 'bg-profit/20 text-profit border-profit/30';
      case 'started':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full border-white/10 bg-[#121212] sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">Analytics</SheetTitle>
          <SheetDescription className="text-white/60">
            View your activity and usage statistics
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="local" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="local" className="data-[state=active]:bg-profit data-[state=active]:text-black">
              Local
            </TabsTrigger>
            <TabsTrigger value="backend" className="data-[state=active]:bg-profit data-[state=active]:text-black">
              Backend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="mt-4">
            <ScrollArea className="h-[calc(100vh-240px)]">
              {localEvents.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-white/40">No local events recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-white/5 bg-white/5 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className={getEventColor(event.eventType)}>
                          {getEventIcon(event.eventType)}
                          <span className="ml-1 capitalize">{event.eventType}</span>
                        </Badge>
                        <span className="text-xs text-white/40">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{event.elementId}</p>
                      {event.payload && (
                        <p className="mt-1 text-xs text-white/50">{event.payload}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="backend" className="mt-4">
            <ScrollArea className="h-[calc(100vh-240px)]">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                </div>
              ) : !backendEvents || backendEvents.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-white/40">No backend events recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backendEvents.map((event, index) => {
                    const eventTypeStr = Object.keys(event.eventType)[0] || 'unknown';
                    return (
                      <div
                        key={`${event.timestamp}-${index}`}
                        className="rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline" className={getEventColor(eventTypeStr)}>
                            {getEventIcon(eventTypeStr)}
                            <span className="ml-1 capitalize">{eventTypeStr}</span>
                          </Badge>
                          <span className="text-xs text-white/40">
                            {new Date(Number(event.timestamp) / 1_000_000).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/70">{event.elementId}</p>
                        {event.payload && (
                          <p className="mt-1 text-xs text-white/50">{event.payload}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
