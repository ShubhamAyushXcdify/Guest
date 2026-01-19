'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { useQueryStates, parseAsString } from 'nuqs';

const searchParamsParser = {
  notificationState: parseAsString,
} as const;

export const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [, setNotificationState] = useQueryStates(searchParamsParser);

  const handleOpenNotifications = () => {
  console.log('Bell clicked!'); // Add this
  setNotificationState({
    notificationState: "open",
  });
  console.log('State set'); // Add this
};

  return (
    <div className="relative cursor-pointer">
      <Button variant="ghost" size="icon" onClick={handleOpenNotifications}>
        <Bell className="h-5 w-5" />
      </Button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};
