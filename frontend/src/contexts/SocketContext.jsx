import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { endpoints } from '../api/endpoints';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, initialized } = useSelector((state) => state.auth);

  // Fetch initial notifications
  useEffect(() => {
    if (user && initialized) {
      const fetchNotifications = async () => {
        try {
          const res = await axiosInstance.get('/notifications'); // Assumes we added it to endpoints or just hardcode
          const fetchedNotifications = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter((n) => !n.isRead).length);
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, initialized]);

  // Connect socket
  useEffect(() => {
    if (user && initialized) {
      // Create connection
      const newSocket = io(import.meta.env.VITE_API_BASE_URL.replace('/api/v1', ''), {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        // Register user
        newSocket.emit('register', user._id);
      });

      newSocket.on('new-notification', (notification) => {
        setNotifications((prev) => [notification, ...(Array.isArray(prev) ? prev : [])]);
        setUnreadCount((prev) => (typeof prev === 'number' ? prev : 0) + 1);
        toast.success(notification.message, {
          icon: '🔔',
          duration: 5000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user, initialized]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
