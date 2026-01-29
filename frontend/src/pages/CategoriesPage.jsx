import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import HeaderBar from '../components/enigma/HeaderBar.jsx';
import {
  CategoriesGrid,
  CategoryLevels,
} from '../components/enigma/CategoriesSection.jsx';
import ShopDialog from '../components/enigma/ShopDialog.jsx';
import { getProfile } from '../api/profile.js';
import { getCategories } from '../api/categories.js';
import { useLocation } from 'react-router-dom';

const CategoriesPage = () => {
  const { showToast } = useToast();
  const { 
    balance, 
    subtractCoins,
    addHints,
    fetchBalance,
    userId,
    userEmail: authUserEmail,
    userPhone: authUserPhone,
  } = useAuth();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState('target');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Загружаем профиль и баланс при монтировании и изменении идентификаторов
  useEffect(() => {
    if (userId || authUserEmail || authUserPhone) {
      fetchBalance();
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUserEmail, authUserPhone, fetchBalance]);

  // Загружаем категории из БД
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Сбрасываем выбранную категорию при изменении пути
  useEffect(() => {
    setSelectedCategory(null);
  }, [location.pathname]);

  const loadCategories = async () => {
    if (!userId) return;
    
    try {
      setCategoriesLoading(true);
      const response = await getCategories(userId);
      if (response.success && response.categories) {
        // Преобразуем данные из БД в формат, ожидаемый компонентами
        const formattedCategories = response.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          icon: cat.icon || 'lock',
          color: cat.color || '#00ffff',
          levels: (cat.levels || []).map(level => ({
            id: level.id,
            name: level.name,
            description: level.description || '',
            completed: level.completed || false,
            isPaid: level.is_paid || false,
            price: level.price || 0,
            purchased: level.purchased !== undefined ? level.purchased : (!level.is_paid), // Бесплатные считаются купленными
            locked: (level.is_paid && !level.purchased), // Заблокирован, если платный и не куплен
            order_index: level.order_index,
            orderIndex: level.order_index,
          })),
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      showToast('Ошибка загрузки категорий', 'error');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!userId && !authUserEmail && !authUserPhone) return;

    try {
      const params = userId 
        ? { user_id: userId }
        : (authUserEmail ? { email: authUserEmail } : { phone: authUserPhone });
      
      const response = await getProfile(params);
      
      if (response.success && response.profile) {
        const profile = response.profile;
        setUserAvatar(profile.avatar || 'target');
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handlePurchaseLevel = async (levelId, price) => {
    if (!userId) {
      showToast('Требуется авторизация', 'error');
      return;
    }

    if ((balance?.coins || 0) < price) {
      showToast('Недостаточно монет!', 'error');
      return;
    }

    try {
      const { purchaseLevel } = await import('../api/categories.js');
      const response = await purchaseLevel(levelId, userId);
      
      if (response.success) {
        await fetchBalance(); // Обновляем баланс
        await loadCategories(); // Перезагружаем категории, чтобы обновить статус покупки
        showToast('Уровень успешно куплен!', 'success');
      } else {
        showToast(response.error || 'Ошибка при покупке уровня', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Ошибка при покупке уровня', 'error');
    }
  };

  const shopItems = [
    { id: 1, name: '100 монет', price: 1.99, type: 'currency', icon: '💎' },
    { id: 2, name: '500 монет', price: 8.99, type: 'currency', icon: '💎' },
    { id: 3, name: '1000 монет', price: 14.99, type: 'currency', icon: '💎', popular: true },
    { id: 4, name: '1 подсказка', coinPrice: 50, type: 'hint', icon: 'zap' },
    { id: 5, name: '5 подсказок', coinPrice: 200, type: 'hint', icon: 'zap' },
    { id: 6, name: '10 подсказок', coinPrice: 350, type: 'hint', icon: 'zap' },
  ];

  const handleBuyHints = async (amount, price) => {
    if ((balance?.coins || 0) >= price) {
      try {
        await subtractCoins(price);
        await addHints(amount);
        showToast(`Куплено ${amount} подсказок!`, 'success');
      } catch (error) {
        showToast(error.message || 'Ошибка при покупке подсказок', 'error');
      }
    } else {
      showToast('Недостаточно монет!', 'error');
    }
  };

  const currentCategory = categories.find(
    (c) => c.id === selectedCategory,
  );

  return (
    <div className="min-h-screen relative overflow-hidden page-fade-in">
      <HeaderBar
        coins={balance?.coins || 0}
        hints={balance?.hints || 0}
        onChangeSection={(section) => {
          if (section === 'shop') {
            setIsShopOpen(true);
          }
        }}
        currentSection="categories"
        userAvatar={userAvatar}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 slide-stack">
        {!selectedCategory && (
          <div className="slide-panel">
            <CategoriesGrid
              categories={categories}
              onSelect={(id) => {
                setSelectedCategory(id);
              }}
            />
          </div>
        )}

        {selectedCategory && (
          <div className="slide-panel">
            <CategoryLevels
              category={currentCategory}
              onBack={() => setSelectedCategory(null)}
              userId={userId}
              balance={balance}
              onPurchaseLevel={handlePurchaseLevel}
            />
          </div>
        )}
      </div>

      <ShopDialog
        open={isShopOpen}
        onOpenChange={setIsShopOpen}
        shopItems={shopItems}
        onBuyHints={handleBuyHints}
        coins={balance?.coins || 0}
        showToast={showToast}
      />
    </div>
  );
};

export default CategoriesPage;
