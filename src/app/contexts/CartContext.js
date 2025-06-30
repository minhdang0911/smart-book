'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Refs để tránh stale closure
  const cartDataRef = useRef(cartData);
  const fetchingRef = useRef(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Cập nhật ref khi cartData thay đổi
  useEffect(() => {
    cartDataRef.current = cartData;
  }, [cartData]);


 useEffect(() => {
  // Kiểm tra buyNowData từ localStorage
  const buyNowData = localStorage.getItem('buyNowData');
  
  if (buyNowData && cartData?.items && cartData.items.length > 0) {
    try {
      const parsedBuyNowData = JSON.parse(buyNowData);
      
      // Kiểm tra nếu là "mua ngay" và chưa được xử lý
      if (parsedBuyNowData.isBuyNow && parsedBuyNowData.bookId && !parsedBuyNowData.processed) {
        // Tìm item trong cart có id trùng với bookId
        const targetItem = cartData.items.find(item => item.id === parsedBuyNowData.bookId);
        
        if (targetItem) {
          // Tự động chọn item này
          setSelectedItems([targetItem.id]);
          localStorage.setItem('selectedCartItems', JSON.stringify([targetItem.id]));
          
          // Đánh dấu đã xử lý để tránh trigger lại
          const updatedBuyNowData = {
            ...parsedBuyNowData,
            processed: true
          };
          localStorage.setItem('buyNowData', JSON.stringify(updatedBuyNowData));
          
          toast.info(`🎯 Đã tự động chọn "${targetItem.name || targetItem.title}" để đặt hàng!`);
        }
      }
    } catch (error) {
      console.error('Error parsing buyNowData:', error);
      // Clear invalid data
      localStorage.removeItem('buyNowData');
    }
  }
}, [cartData?.items]);

  const fetchCartData = useCallback(async (showLoading = true) => {
    if (fetchingRef.current) return; // Tránh multiple fetch

    const token = localStorage.getItem('token');
    if (!token) {
      // router.push('/login');
      return;
    }

    try {
      fetchingRef.current = true;
      if (showLoading) setLoading(true);

      const response = await fetch('http://localhost:8000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setCartData(data.data);

        // Broadcast cart update event
        window.dispatchEvent(new CustomEvent('cartDataUpdated', {
          detail: { cartData: data.data }
        }));

        // Update global cart count
        if (window.updateCartCount) {
          window.updateCartCount(data.data.total_items || 0);
        }
      } else {
        message.error('Không thể tải giỏ hàng');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Lỗi khi tải giỏ hàng');
    } finally {
      fetchingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [router]);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // WebSocket URL - adjust according to your backend
      const wsUrl = `ws://localhost:8000/ws/cart?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Cart WebSocket connected');
        setIsConnected(true);

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'cart_updated':
              // Cập nhật cart data từ WebSocket
              setCartData(prevData => {
                const newData = data.cartData;

                // Chỉ cập nhật nếu có thay đổi thực sự
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                  // Broadcast event
                  window.dispatchEvent(new CustomEvent('cartDataUpdated', {
                    detail: { cartData: newData }
                  }));

                  // Update global cart count
                  if (window.updateCartCount) {
                    window.updateCartCount(newData.total_items || 0);
                  }

                  return newData;
                }
                return prevData;
              });
              break;

            case 'item_added':
              message.success(`Đã thêm ${data.item.book.title} vào giỏ hàng`);
              fetchCartData(false); // Refresh without loading
              break;

            case 'item_removed':
              message.info('Sản phẩm đã được xóa khỏi giỏ hàng');
              fetchCartData(false);
              break;

            case 'quantity_updated':
              message.success('Số lượng đã được cập nhật');
              break;

            case 'pong':
              // Heartbeat response
              break;

            default:
              console.log('Unknown WebSocket message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Cart WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Reconnect after delay (unless manually closed)
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {

      };

    } catch (error) {

    }
  }, [fetchCartData]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Add to cart with real-time update
  const addToCart = useCallback(async (bookId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // router.push('/login');
      return false;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          quantity: quantity
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistic update
        setCartData(prev => {
          if (!prev) return prev;

          const existingItemIndex = prev.items.findIndex(item => item.book.id === bookId);

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...prev.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            };

            return {
              ...prev,
              items: updatedItems,
              total_items: prev.total_items + quantity
            };
          } else {
            // Add new item (will be properly updated by WebSocket or next fetch)
            return {
              ...prev,
              total_items: prev.total_items + quantity
            };
          }
        });

        // Fetch updated cart data
        setTimeout(() => fetchCartData(false), 100);

        message.success('Đã thêm vào giỏ hàng');
        return true;
      } else {
        message.error(data.message || 'Không thể thêm vào giỏ hàng');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Lỗi khi thêm vào giỏ hàng');
      return false;
    }
  }, [router, fetchCartData]);

  const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    setUpdatingItems(prev => new Set([...prev, itemId]));

    try {
      const response = await fetch(`http://localhost:8000/api/cart/item/${itemId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistic update
        setCartData(prev => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
            cart: prev.cart ? {
              ...prev.cart,
              cart_items: prev.cart.cart_items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              ),
            } : prev.cart,
          };
        });

        message.success('Cập nhật số lượng thành công');
      } else {
        message.error('Không thể cập nhật số lượng');
        // Revert optimistic update by refetching
        fetchCartData(false);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Lỗi khi cập nhật số lượng');
      fetchCartData(false);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [fetchCartData]);

  const removeItems = useCallback(async (itemIds) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/cart/remove', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart_item_ids: itemIds }),
      });

      const data = await response.json();
      if (data.success) {
        // Optimistic update
        setCartData(prev => {
          if (!prev) return prev;

          const removedItemsCount = prev.items
            .filter(item => itemIds.includes(item.id))
            .reduce((sum, item) => sum + item.quantity, 0);

          return {
            ...prev,
            items: prev.items.filter(item => !itemIds.includes(item.id)),
            cart: prev.cart ? {
              ...prev.cart,
              cart_items: prev.cart.cart_items.filter(item => !itemIds.includes(item.id)),
            } : prev.cart,
            total_items: prev.total_items - removedItemsCount,
          };
        });

        // selectedItems sẽ được tự động sync thông qua useEffect
        message.success('Xóa sản phẩm thành công');

        // Broadcast update
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        message.error('Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error removing items:', error);
      message.error('Lỗi khi xóa sản phẩm');
      fetchCartData(false);
    }
  }, []);

  const calculateTotal = useCallback(() => {
    if (!cartData || !selectedItems.length) return 0;
    return cartData.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.book.price) || 0;
        return total + price * item.quantity;
      }, 0);
  }, [cartData, selectedItems]);

  const refreshCart = useCallback(() => {
    fetchCartData(true);
  }, [fetchCartData]);

  const getCartCount = useCallback(() => {
    return cartData?.total_items || 0;
  }, [cartData?.total_items]);

  // Utility function để update selectedItems an toàn
  const updateSelectedItems = useCallback((newSelectedItems) => {
    if (!cartData?.items) return;

    const currentItemIds = cartData.items.map(item => item.id);
    const validSelectedItems = newSelectedItems.filter(id => currentItemIds.includes(id));

    setSelectedItems(validSelectedItems);

    // Save to localStorage
    if (validSelectedItems.length > 0) {
      localStorage.setItem('selectedCartItems', JSON.stringify(validSelectedItems));
    } else {
      localStorage.removeItem('selectedCartItems');
    }
  }, [cartData?.items]);

  // Load selectedItems từ localStorage - chỉ chạy một lần khi component mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCartItems');
    if (saved) {
      try {
        const savedItems = JSON.parse(saved);
        // Sẽ được sync với cartData thông qua useEffect khác
        setSelectedItems(savedItems);
      } catch (e) {
        console.error('Load selected items error:', e);
        localStorage.removeItem('selectedCartItems');
      }
    }
  }, []); // Chỉ chạy một lần khi mount

  // Initial fetch and WebSocket connection
  useEffect(() => {
    fetchCartData();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [fetchCartData, connectWebSocket, disconnectWebSocket]);

  // Listen for external cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartData(false);
    };

    const handlePageFocus = () => {
      // Refetch when page comes back to focus
      if (!document.hidden) {
        fetchCartData(false);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('visibilitychange', handlePageFocus);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('visibilitychange', handlePageFocus);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [fetchCartData]);

  return (
    <CartContext.Provider
      value={{
        cartData,
        selectedItems,
        setSelectedItems: updateSelectedItems, // Sử dụng function an toàn
        updateItemQuantity,
        removeItems,
        calculateTotal,
        fetchCartData,
        addToCart,
        refreshCart,
        getCartCount,
        loading,
        updatingItems,
        isConnected, // WebSocket connection status
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export { CartContext };