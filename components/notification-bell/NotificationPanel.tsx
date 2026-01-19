'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const searchParamsParser = {
  notificationState: parseAsString,
} as const;

export const NotificationPanel = () => {
  const [{ notificationState }, setNotificationState] = useQueryStates(searchParamsParser);
  const { notifications, unreadCount } = useNotifications();

  const isOpen = notificationState === 'open';

  const handleClose = () => {
    setNotificationState({ notificationState: null });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-2">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button variant="ghost" className="w-full" onClick={handleClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};