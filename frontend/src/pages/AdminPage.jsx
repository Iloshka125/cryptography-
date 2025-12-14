import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import Textarea from '../components/ui/textarea.jsx';
import { ArrowLeft, Plus, X, Trash2, Edit2 } from '../components/IconSet.jsx';
import { 
  getCategories, 
  createCategory, 
  updateCategory,
  deleteCategory, 
  createLevel,
  updateLevel, 
  deleteLevel 
} from '../api/categories.js';

const AdminPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // Состояние для категорий
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '🔐',
    color: '#00ffff',
  });
  const [loading, setLoading] = useState(false);

  // Состояние для уровней
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [levelForm, setLevelForm] = useState({
    name: '',
    description: '',
    task: '',
    flag: '',
    categoryId: null,
    difficulty: 'medium',
    points: 100,
    estimatedTime: '15 мин',
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);

  // Если пользователь не админ, редирект (это также обрабатывается в AdminRoute, но на всякий случай)
  if (!isAdmin) {
    return null;
  }

  // Загружаем категории при монтировании
  useEffect(() => {
    loadCategories();
  }, []);

  // Обновляем выбранную категорию после загрузки категорий
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const updatedCategory = categories.find(cat => cat.id === selectedCategory.id);
      if (updatedCategory) {
        setSelectedCategory(updatedCategory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      showToast('Ошибка загрузки категорий', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingCategory) {
        // Редактирование существующей категории
        response = await updateCategory(editingCategory.id, categoryForm);
        if (response.success) {
          showToast('Категория обновлена!', 'success');
          setEditingCategory(null);
        }
      } else {
        // Создание новой категории
        response = await createCategory(categoryForm);
        if (response.success) {
          showToast('Категория создана!', 'success');
        }
      }
      
      if (response.success) {
        setCategoryForm({ name: '', description: '', icon: '🔐', color: '#00ffff' });
        setIsCategoryModalOpen(false);
        await loadCategories(); // Перезагружаем категории
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      showToast(error.message || 'Ошибка сохранения категории', 'error');
    }
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory && !editingLevel) {
      showToast('Выберите категорию', 'error');
      return;
    }

    try {
      let response;
      if (editingLevel) {
        // Редактирование существующего уровня
        response = await updateLevel(editingLevel.id, {
          name: levelForm.name,
          description: levelForm.description,
          task: levelForm.task,
          flag: levelForm.flag,
          difficulty: levelForm.difficulty,
          points: levelForm.points,
          estimatedTime: levelForm.estimatedTime,
        });
        if (response.success) {
          showToast('Уровень обновлен!', 'success');
          setEditingLevel(null);
        }
      } else {
        // Создание нового уровня
        response = await createLevel(selectedCategory.id, {
          name: levelForm.name,
          description: levelForm.description,
          task: levelForm.task,
          flag: levelForm.flag,
          difficulty: levelForm.difficulty,
          points: levelForm.points,
          estimatedTime: levelForm.estimatedTime,
        });
        if (response.success) {
          showToast('Уровень создан!', 'success');
        }
      }
      
      if (response.success) {
        setLevelForm({ name: '', description: '', task: '', flag: '', categoryId: null, difficulty: 'medium', points: 100, estimatedTime: '15 мин' });
        setIsLevelModalOpen(false);
        await loadCategories(); // Перезагружаем категории с новым уровнем
      }
    } catch (error) {
      console.error('Ошибка сохранения уровня:', error);
      showToast(error.message || 'Ошибка сохранения уровня', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию? Все уровни в ней также будут удалены.')) {
      try {
        const response = await deleteCategory(categoryId);
        if (response.success) {
          if (selectedCategory?.id === categoryId) {
            setSelectedCategory(null);
          }
          showToast('Категория удалена', 'success');
          await loadCategories(); // Перезагружаем категории
        }
      } catch (error) {
        console.error('Ошибка удаления категории:', error);
        showToast(error.message || 'Ошибка удаления категории', 'error');
      }
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот уровень?')) {
      try {
        const response = await deleteLevel(levelId);
        if (response.success) {
          showToast('Уровень удален', 'success');
          await loadCategories(); // Перезагружаем категории
        }
      } catch (error) {
        console.error('Ошибка удаления уровня:', error);
        showToast(error.message || 'Ошибка удаления уровня', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen page-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/enigma')}
            className="bg-transparent border-2 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            НАЗАД
          </Button>
          <h1 className="text-4xl text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
            ПАНЕЛЬ АДМИНИСТРАТОРА
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Категории */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-cyan-300">Категории</h2>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', icon: '🔐', color: '#00ffff' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-cyan-400 text-black hover:bg-cyan-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать категорию
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedCategory?.id === category.id
                        ? 'border-cyan-400 bg-cyan-400/20'
                        : 'border-cyan-400/30 hover:border-cyan-400/50'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h3 className="text-cyan-200 font-semibold">{category.name}</h3>
                          <p className="text-cyan-200/70 text-sm">{category.description || 'Без описания'}</p>
                          <p className="text-cyan-200/50 text-xs mt-1">
                            Уровней: {Array.isArray(category.levels) ? category.levels.length : 0}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-cyan-200/50 text-center py-8">Нет категорий</p>
                )}
              </div>
            </div>
          </div>

          {/* Уровни */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-cyan-300">
                  Уровни {selectedCategory && `- ${selectedCategory.name}`}
                </h2>
                {selectedCategory && (
                  <Button
                    onClick={() => {
                      setEditingLevel(null);
                      setLevelForm({ name: '', description: '', task: '', flag: '', categoryId: selectedCategory.id, difficulty: 'medium', points: 100, estimatedTime: '15 мин' });
                      setIsLevelModalOpen(true);
                    }}
                    className="bg-cyan-400 text-black hover:bg-cyan-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать уровень
                  </Button>
                )}
              </div>

              {selectedCategory ? (
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-cyan-200/50 text-center py-8">Загрузка...</p>
                  ) : (
                    <>
                      {(Array.isArray(selectedCategory.levels) ? selectedCategory.levels : []).map((level) => (
                    <div
                      key={level.id}
                      className="p-4 border-2 border-cyan-400/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-cyan-200 font-semibold">{level.name}</h3>
                          <p className="text-cyan-200/70 text-sm">{level.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingLevel(level);
                              setLevelForm({
                                name: level.name,
                                description: level.description || '',
                                task: level.task || '',
                                flag: level.flag || '',
                                categoryId: level.categoryId || selectedCategory.id,
                                difficulty: level.difficulty || 'medium',
                                points: level.points || 100,
                                estimatedTime: level.estimated_time || level.estimatedTime || '15 мин',
                              });
                              setIsLevelModalOpen(true);
                            }}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteLevel(level.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                      ))}
                      {(Array.isArray(selectedCategory.levels) ? selectedCategory.levels : []).length === 0 && (
                        <p className="text-cyan-200/50 text-center py-8">Нет уровней</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-cyan-200/50 text-center py-8">
                  Выберите категорию для просмотра уровней
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Модальное окно создания категории */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
                </h3>
                <Button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', icon: '🔐', color: '#00ffff' });
                  }}
                  className="bg-transparent hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <Label className="text-cyan-200">Название</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Описание</Label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Иконка (эмодзи)</Label>
                  <Input
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Цвет (hex)</Label>
                  <Input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания уровня */}
        {isLevelModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingLevel ? 'Редактировать уровень' : 'Создать уровень'}
                </h3>
                <Button
                  onClick={() => {
                    setIsLevelModalOpen(false);
                    setEditingLevel(null);
                    setLevelForm({ name: '', description: '', task: '', flag: '', categoryId: null, difficulty: 'medium', points: 100, estimatedTime: '15 мин' });
                  }}
                  className="bg-transparent hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleLevelSubmit} className="space-y-4">
                <div>
                  <Label className="text-cyan-200">Название</Label>
                  <Input
                    value={levelForm.name}
                    onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Описание</Label>
                  <Textarea
                    value={levelForm.description}
                    onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Задание</Label>
                  <Textarea
                    value={levelForm.task}
                    onChange={(e) => setLevelForm({ ...levelForm, task: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Флаг (ответ)</Label>
                  <Input
                    value={levelForm.flag}
                    onChange={(e) => setLevelForm({ ...levelForm, flag: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Сложность</Label>
                  <select
                    value={levelForm.difficulty}
                    onChange={(e) => setLevelForm({ ...levelForm, difficulty: e.target.value })}
                    className="w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400"
                    required
                  >
                    <option value="easy">Легкая</option>
                    <option value="medium">Средняя</option>
                    <option value="hard">Сложная</option>
                  </select>
                </div>
                <div>
                  <Label className="text-cyan-200">Очки</Label>
                  <Input
                    type="number"
                    value={levelForm.points}
                    onChange={(e) => setLevelForm({ ...levelForm, points: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Примерное время</Label>
                  <Input
                    value={levelForm.estimatedTime}
                    onChange={(e) => setLevelForm({ ...levelForm, estimatedTime: e.target.value })}
                    placeholder="15 мин"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingLevel ? 'Сохранить' : 'Создать'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

