import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, MailCheck } from 'lucide-react';
import { mockService } from '../../services/mockService';
import { NotificationResponse } from '../../types';
import { formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  useEffect(() => {
    mockService.getNotifications().then(setNotifications);
  }, []);

  const handleMarkAllRead = async () => {
    await mockService.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = async (id: string) => {
    await mockService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Thông Báo Hệ Thống
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cập nhật trạng thái đơn hàng, xác nhận xuất kho và tiến độ vận chuyển.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            onClick={handleMarkAllRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Bell className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500">Bạn không có thông báo nào mới.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleMarkSingleRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.read
                  ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80'
                  : 'bg-brand-50/20 dark:bg-brand-950/20 border-brand-500/40'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  notif.read
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    : 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                }`}
              >
                <MailCheck className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold ${
                      notif.read ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(notif.createdAt)}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
