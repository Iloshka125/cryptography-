import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import Textarea from '../components/ui/textarea.jsx';
import { ArrowLeft, Plus, X, Trash2, Edit2, cryptographyIcons, renderIconByValue } from '../components/IconSet.jsx';
import { 
  getCategories, 
  createCategory, 
  updateCategory,
  deleteCategory, 
  createLevel,
  updateLevel,
  deleteLevel 
} from '../api/categories.js';
import {
  getBattlePassRewards,
  createBattlePassReward,
  updateBattlePassReward,
  deleteBattlePassReward,
} from '../api/battlepass.js';
import {
  getLevelExperienceRequirements,
  setLevelExperienceRequirement,
  deleteLevelExperienceRequirement,
} from '../api/levelExperienceRequirements.js';
import {
  getCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from '../api/competitions.js';

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
    icon: 'lock',
    color: '#00ffff',
  });
  const [loading, setLoading] = useState(false);

  // Состояние для уровней
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelForm, setLevelForm] = useState({
    name: '',
    description: '',
    task: '',
    taskFile: null,
    useTaskFile: false,
    flag: '',
    categoryId: null,
    difficulty: 'medium',
    points: 100,
    estimatedTime: '15 мин',
    orderIndex: 1,
    isPaid: false,
    price: 0,
    hint: '',
  });
  
  // Состояние для редактирования категории
  const [editingCategory, setEditingCategory] = useState(null);

  // Состояние для Battle Pass
  const [battlePassRewards, setBattlePassRewards] = useState([]);
  const [isBattlePassModalOpen, setIsBattlePassModalOpen] = useState(false);
  const [editingBattlePassReward, setEditingBattlePassReward] = useState(null);
  const [battlePassForm, setBattlePassForm] = useState({
    level: '',
    reward: '',
  });

  // Состояние для требований опыта для уровней
  const [levelExperienceRequirements, setLevelExperienceRequirements] = useState([]);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [requirementForm, setRequirementForm] = useState({ level_number: '', experience_required: '' });
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(false);

  // Состояние для соревнований
  const [competitions, setCompetitions] = useState([]);
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [competitionForm, setCompetitionForm] = useState({
    name: '',
    description: '',
    welcomeText: '',
    entryFee: 0,
    startDate: '',
    endDate: '',
    status: 'upcoming',
    initialConditions: {
      resetExperience: false,
      startingExperience: 0,
      startingLevel: 1,
    },
    prize: '',
    maxParticipants: '',
  });

  // Если пользователь не админ, редирект (это также обрабатывается в AdminRoute, но на всякий случай)
  if (!isAdmin) {
    return null;
  }

  // Загружаем категории при монтировании
  useEffect(() => {
    loadCategories();
    loadBattlePassRewards();
    loadLevelExperienceRequirements();
    loadCompetitions();
  }, []);

  const loadLevelExperienceRequirements = async () => {
    try {
      setLoadingRequirements(true);
      const response = await getLevelExperienceRequirements();
      if (response.success && response.requirements) {
        setLevelExperienceRequirements(response.requirements);
      }
    } catch (error) {
      console.error('Ошибка загрузки требований опыта:', error);
      showToast('Ошибка загрузки требований опыта', 'error');
    } finally {
      setLoadingRequirements(false);
    }
  };

  const handleRequirementEdit = (requirement) => {
    setEditingRequirement(requirement);
    setRequirementForm({
      level_number: requirement.level_number,
      experience_required: requirement.experience_required,
    });
    setIsRequirementModalOpen(true);
  };

  const handleRequirementSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await setLevelExperienceRequirement(
        parseInt(requirementForm.level_number),
        parseInt(requirementForm.experience_required)
      );
      if (response.success) {
        showToast('Требование обновлено!', 'success');
        setIsRequirementModalOpen(false);
        setEditingRequirement(null);
        setRequirementForm({ level_number: '', experience_required: '' });
        await loadLevelExperienceRequirements();
      }
    } catch (error) {
      console.error('Ошибка сохранения требования:', error);
      showToast(error.message || 'Ошибка сохранения требования', 'error');
    }
  };

  const handleAddNewRequirement = () => {
    setEditingRequirement(null);
    setRequirementForm({ level_number: '', experience_required: '' });
    setIsRequirementModalOpen(true);
  };

  const handleDeleteRequirement = async (levelNumber) => {
    if (window.confirm(`Вы уверены, что хотите удалить требование для уровня ${levelNumber}?`)) {
      try {
        const response = await deleteLevelExperienceRequirement(levelNumber);
        if (response.success) {
          showToast('Требование удалено', 'success');
          await loadLevelExperienceRequirements();
        }
      } catch (error) {
        console.error('Ошибка удаления требования:', error);
        showToast(error.message || 'Ошибка удаления требования', 'error');
      }
    }
  };

  const loadBattlePassRewards = async () => {
    try {
      const response = await getBattlePassRewards();
      if (response.success && response.rewards) {
        setBattlePassRewards(response.rewards);
      }
    } catch (error) {
      console.error('Ошибка загрузки наград Battle Pass:', error);
      showToast('Ошибка загрузки наград Battle Pass', 'error');
    }
  };

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


  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'lock',
      color: category.color || '#00ffff',
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Редактирование категории
        const response = await updateCategory(editingCategory.id, categoryForm);
        if (response.success) {
          setCategoryForm({ name: '', description: '', icon: 'lock', color: '#00ffff' });
          setEditingCategory(null);
          setIsCategoryModalOpen(false);
          showToast('Категория обновлена!', 'success');
          await loadCategories();
        }
      } else {
        // Создание категории
        const response = await createCategory(categoryForm);
        if (response.success) {
          setCategoryForm({ name: '', description: '', icon: 'lock', color: '#00ffff' });
          setIsCategoryModalOpen(false);
          showToast('Категория создана!', 'success');
          await loadCategories();
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      showToast(error.message || 'Ошибка сохранения категории', 'error');
    }
  };

  const handleLevelEdit = (level) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      description: level.description || '',
      task: level.task || '',
      taskFile: null,
      useTaskFile: !!level.task_file_path,
      flag: level.flag || '',
      categoryId: selectedCategory.id,
      difficulty: level.difficulty || 'medium',
      points: level.points || 100,
      estimatedTime: level.estimated_time || '15 мин',
      orderIndex: level.order_index || 1,
      isPaid: level.is_paid || false,
      price: level.price || 0,
      hint: level.hint || '',
    });
    setIsLevelModalOpen(true);
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      showToast('Выберите категорию', 'error');
      return;
    }

    try {
      if (editingLevel) {
        // Редактирование уровня
        const updateData = {
          name: levelForm.name,
          description: levelForm.description,
          task: levelForm.useTaskFile ? null : levelForm.task,
          flag: levelForm.flag,
          difficulty: levelForm.difficulty,
          points: parseInt(levelForm.points),
          estimatedTime: levelForm.estimatedTime,
          orderIndex: parseInt(levelForm.orderIndex) || 1,
          isPaid: levelForm.isPaid,
          price: levelForm.isPaid ? parseInt(levelForm.price) || 0 : 0,
          hint: levelForm.hint || '',
        };
        
        if (levelForm.useTaskFile && levelForm.taskFile) {
          updateData.taskFile = levelForm.taskFile;
        }
        
        const response = await updateLevel(editingLevel.id, updateData);
        
        if (response.success) {
          setLevelForm({ name: '', description: '', task: '', taskFile: null, useTaskFile: false, flag: '', categoryId: null, difficulty: 'medium', points: 100, estimatedTime: '15 мин', orderIndex: 1, isPaid: false, price: 0, hint: '' });
          setEditingLevel(null);
          setIsLevelModalOpen(false);
          showToast('Уровень обновлен!', 'success');
          await loadCategories();
        }
      } else {
        // Создание уровня
        const createData = {
          name: levelForm.name,
          description: levelForm.description,
          task: levelForm.useTaskFile ? null : levelForm.task,
          flag: levelForm.flag,
          difficulty: levelForm.difficulty,
          points: parseInt(levelForm.points),
          estimatedTime: levelForm.estimatedTime,
          orderIndex: parseInt(levelForm.orderIndex) || 1,
          isPaid: levelForm.isPaid,
          price: levelForm.isPaid ? parseInt(levelForm.price) || 0 : 0,
          hint: levelForm.hint || '',
        };
        
        if (levelForm.useTaskFile && levelForm.taskFile) {
          createData.taskFile = levelForm.taskFile;
        }
        
        const response = await createLevel(selectedCategory.id, createData);
        
        if (response.success) {
          setLevelForm({ name: '', description: '', task: '', taskFile: null, useTaskFile: false, flag: '', categoryId: null, difficulty: 'medium', points: 100, estimatedTime: '15 мин', orderIndex: 1, isPaid: false, price: 0, hint: '' });
          setIsLevelModalOpen(false);
          showToast('Уровень создан!', 'success');
          await loadCategories();
        }
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

  const handleBattlePassRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBattlePassReward) {
        // Редактирование награды
        const response = await updateBattlePassReward(editingBattlePassReward.id, {
          level: parseInt(battlePassForm.level),
          reward: battlePassForm.reward,
        });
        if (response.success) {
          setBattlePassForm({ level: '', reward: '' });
          setEditingBattlePassReward(null);
          setIsBattlePassModalOpen(false);
          showToast('Награда обновлена!', 'success');
          await loadBattlePassRewards();
        }
      } else {
        // Создание награды
        const response = await createBattlePassReward({
          level: parseInt(battlePassForm.level),
          reward: battlePassForm.reward,
        });
        if (response.success) {
          setBattlePassForm({ level: '', reward: '' });
          setIsBattlePassModalOpen(false);
          showToast('Награда создана!', 'success');
          await loadBattlePassRewards();
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения награды:', error);
      showToast(error.message || 'Ошибка сохранения награды', 'error');
    }
  };

  const handleDeleteBattlePassReward = async (rewardId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту награду?')) {
      try {
        const response = await deleteBattlePassReward(rewardId);
        if (response.success) {
          showToast('Награда удалена', 'success');
          await loadBattlePassRewards();
        }
      } catch (error) {
        console.error('Ошибка удаления награды:', error);
        showToast(error.message || 'Ошибка удаления награды', 'error');
      }
    }
  };

  const loadCompetitions = async () => {
    try {
      const response = await getCompetitions();
      if (response.success && response.competitions) {
        setCompetitions(response.competitions);
      }
    } catch (error) {
      console.error('Ошибка загрузки соревнований:', error);
      showToast('Ошибка загрузки соревнований', 'error');
    }
  };

  const handleCompetitionEdit = (competition) => {
    setEditingCompetition(competition);
    setCompetitionForm({
      name: competition.name || '',
      description: competition.description || '',
      welcomeText: competition.welcome_text || '',
      entryFee: competition.entry_fee || 0,
      startDate: competition.start_date ? competition.start_date.split('T')[0] : '',
      endDate: competition.end_date ? competition.end_date.split('T')[0] : '',
      status: competition.status || 'upcoming',
      initialConditions: competition.initial_conditions || {
        resetExperience: false,
        startingExperience: 0,
        startingLevel: 1,
      },
      prize: competition.prize || '',
      maxParticipants: competition.max_participants || '',
    });
    setIsCompetitionModalOpen(true);
  };

  const handleCompetitionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompetition) {
        const response = await updateCompetition(editingCompetition.id, {
          name: competitionForm.name,
          description: competitionForm.description,
          welcomeText: competitionForm.welcomeText,
          entryFee: parseInt(competitionForm.entryFee) || 0,
          startDate: competitionForm.startDate || null,
          endDate: competitionForm.endDate,
          status: competitionForm.status,
          initialConditions: competitionForm.initialConditions,
          prize: competitionForm.prize || null,
          maxParticipants: competitionForm.maxParticipants ? parseInt(competitionForm.maxParticipants) : null,
        });
        if (response.success) {
          showToast('Соревнование обновлено!', 'success');
          setIsCompetitionModalOpen(false);
          setEditingCompetition(null);
          setCompetitionForm({
            name: '',
            description: '',
            welcomeText: '',
            entryFee: 0,
            startDate: '',
            endDate: '',
            status: 'upcoming',
            initialConditions: {
              resetExperience: false,
              startingExperience: 0,
              startingLevel: 1,
            },
            prize: '',
            maxParticipants: '',
          });
          await loadCompetitions();
        }
      } else {
        const response = await createCompetition({
          name: competitionForm.name,
          description: competitionForm.description,
          welcomeText: competitionForm.welcomeText,
          entryFee: parseInt(competitionForm.entryFee) || 0,
          startDate: competitionForm.startDate || null,
          endDate: competitionForm.endDate,
          status: competitionForm.status,
          initialConditions: competitionForm.initialConditions,
          prize: competitionForm.prize || null,
          maxParticipants: competitionForm.maxParticipants ? parseInt(competitionForm.maxParticipants) : null,
        });
        if (response.success) {
          showToast('Соревнование создано!', 'success');
          setIsCompetitionModalOpen(false);
          setCompetitionForm({
            name: '',
            description: '',
            welcomeText: '',
            entryFee: 0,
            startDate: '',
            endDate: '',
            status: 'upcoming',
            initialConditions: {
              resetExperience: false,
              startingExperience: 0,
              startingLevel: 1,
            },
            prize: '',
            maxParticipants: '',
          });
          await loadCompetitions();
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения соревнования:', error);
      showToast(error.message || 'Ошибка сохранения соревнования', 'error');
    }
  };

  const handleDeleteCompetition = async (competitionId) => {
    if (window.confirm('Вы уверены, что хотите удалить это соревнование?')) {
      try {
        const response = await deleteCompetition(competitionId);
        if (response.success) {
          showToast('Соревнование удалено', 'success');
          await loadCompetitions();
        }
      } catch (error) {
        console.error('Ошибка удаления соревнования:', error);
        showToast(error.message || 'Ошибка удаления соревнования', 'error');
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

        {/* Секция требований опыта для уровней */}
        <div className="mb-8">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-cyan-300">Требования опыта для уровней</h2>
              <Button
                onClick={handleAddNewRequirement}
                className="bg-cyan-400 text-black hover:bg-cyan-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить уровень
              </Button>
            </div>
            <p className="text-cyan-200/70 text-sm mb-4">
              Настройте количество опыта, необходимое для достижения каждого уровня. Опыт должен быть кумулятивным (накопительным).
            </p>
            {loadingRequirements ? (
              <p className="text-cyan-200/50 text-center py-8">Загрузка...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-cyan-400/30">
                      <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Уровень</th>
                      <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Требуется опыта</th>
                      <th className="text-right py-3 px-4 text-cyan-300 font-semibold">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelExperienceRequirements.map((req) => (
                      <tr key={req.level_number} className="border-b border-cyan-400/10 hover:bg-cyan-400/5">
                        <td className="py-3 px-4 text-cyan-200">{req.level_number}</td>
                        <td className="py-3 px-4 text-cyan-200">{req.experience_required}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleRequirementEdit(req)}
                              className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30"
                              size="sm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteRequirement(req.level_number)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {levelExperienceRequirements.length === 0 && (
                  <p className="text-cyan-200/50 text-center py-8">Нет настроенных требований</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Секция Соревнований */}
        <div className="mb-8">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-cyan-300">Соревнования</h2>
              <Button
                onClick={() => {
                  setEditingCompetition(null);
                  setCompetitionForm({
                    name: '',
                    description: '',
                    welcomeText: '',
                    entryFee: 0,
                    startDate: '',
                    endDate: '',
                    status: 'upcoming',
                    initialConditions: {
                      resetExperience: false,
                      startingExperience: 0,
                      startingLevel: 1,
                    },
                    prize: '',
                    maxParticipants: '',
                  });
                  setIsCompetitionModalOpen(true);
                }}
                className="bg-cyan-400 text-black hover:bg-cyan-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать соревнование
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitions.map((competition) => (
                <div
                  key={competition.id}
                  className="p-4 border-2 border-cyan-400/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-cyan-200 font-semibold">{competition.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      competition.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      competition.status === 'finished' ? 'bg-gray-500/20 text-gray-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {competition.status === 'active' ? 'Активно' :
                       competition.status === 'finished' ? 'Завершено' : 'Скоро'}
                    </span>
                  </div>
                  <p className="text-cyan-200/70 text-sm mb-2">{competition.description || 'Без описания'}</p>
                  <div className="space-y-1 mb-3 text-xs text-cyan-200/60">
                    <div>Участников: {competition.participants_count || 0}{competition.max_participants ? ` / ${competition.max_participants}` : ''}</div>
                    <div>Взнос: {competition.entry_fee || 0} монет</div>
                    {competition.prize && <div>Приз: {competition.prize}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCompetitionEdit(competition)}
                      className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50 flex-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCompetition(competition.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {competitions.length === 0 && (
                <p className="text-cyan-200/50 text-center py-8 col-span-full">Нет соревнований</p>
              )}
            </div>
          </div>
        </div>

        {/* Секция Battle Pass */}
        <div className="mb-8">
          <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-cyan-300">Battle Pass - Награды</h2>
              <Button
                  onClick={() => {
                  setEditingBattlePassReward(null);
                  setBattlePassForm({ level: '', reward: '' });
                  setIsBattlePassModalOpen(true);
                }}
                className="bg-cyan-400 text-black hover:bg-cyan-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать награду
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battlePassRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 border-2 border-cyan-400/30 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-cyan-200 font-semibold">Уровень {reward.level}</h3>
                      <p className="text-cyan-200/70 text-sm">{reward.reward}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingBattlePassReward(reward);
                          setBattlePassForm({
                            level: reward.level,
                            reward: reward.reward,
                          });
                          setIsBattlePassModalOpen(true);
                        }}
                        className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBattlePassReward(reward.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {battlePassRewards.length === 0 && (
                <p className="text-cyan-200/50 text-center py-8 col-span-full">Нет наград</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Категории */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-cyan-400/30 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-cyan-300">Категории</h2>
                <Button
                  onClick={() => setIsCategoryModalOpen(true)}
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
                        <div className="text-3xl text-cyan-300">
                          {renderIconByValue(category.icon || 'lock', 'w-8 h-8')}
                        </div>
                        <div>
                          <h3 className="text-cyan-200 font-semibold">{category.name}</h3>
                          <p className="text-cyan-200/70 text-sm">
                            {category.description 
                              ? (category.description.length > 20 
                                  ? category.description.substring(0, 20) + '...' 
                                  : category.description)
                              : ''}
                          </p>
                          <p className="text-cyan-200/50 text-xs mt-1">
                            Уровней: {Array.isArray(category.levels) ? category.levels.length : 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryEdit(category);
                          }}
                          className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
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
                      setLevelForm({ name: '', description: '', task: '', flag: '', categoryId: selectedCategory.id, difficulty: 'medium', points: 100, estimatedTime: '15 мин', orderIndex: 1, isPaid: false, price: 0, hint: '', taskFile: null, useTaskFile: false });
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
                          <p className="text-cyan-200/70 text-sm">
                            {level.description 
                              ? (level.description.length > 20 
                                  ? level.description.substring(0, 20) + '...' 
                                  : level.description)
                              : ''}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-cyan-200/60">
                            <span>Сложность: {level.difficulty === 'easy' ? 'Легкая' : level.difficulty === 'hard' ? 'Сложная' : 'Средняя'}</span>
                            <span>Очки: {level.points || 100}</span>
                            <span>Время: {level.estimated_time || '15 мин'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleLevelEdit(level)}
                            className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/50"
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
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
                </h3>
                <Button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', icon: 'lock', color: '#00ffff' });
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
                  <Label className="text-cyan-200">Иконка</Label>
                  <div className="grid grid-cols-6 gap-2 p-4 border border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50 max-h-64 overflow-y-auto custom-scrollbar">
                    {cryptographyIcons.map((iconData) => {
                      const IconComponent = iconData.icon;
                      return (
                        <button
                          key={iconData.value}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, icon: iconData.value })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            categoryForm.icon === iconData.value
                              ? 'border-cyan-400 bg-cyan-400/20'
                              : 'border-cyan-400/30 hover:border-cyan-400/50'
                          }`}
                          title={iconData.name}
                        >
                          <IconComponent className="w-6 h-6 text-cyan-300 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
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
                  Создать
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания уровня */}
        {isLevelModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingLevel ? 'Редактировать уровень' : 'Создать уровень'}
                </h3>
                <Button
                  onClick={() => {
                    setIsLevelModalOpen(false);
                    setEditingLevel(null);
                    setLevelForm({ name: '', description: '', task: '', taskFile: null, useTaskFile: false, flag: '', categoryId: null, difficulty: 'medium', points: 100, estimatedTime: '15 мин', orderIndex: 1, isPaid: false, price: 0 });
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
                    rows={4}
                    resizable={true}
                    className="min-h-[100px] max-h-[300px]"
                  />
                </div>
                <div>
                  <Label className="text-cyan-200 mb-2 block">Задание</Label>
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="useTaskFile"
                        checked={levelForm.useTaskFile || false}
                        onChange={(e) => {
                          const useFile = e.target.checked;
                          // Если включаем файл и есть текст, создаем файл из текста
                          if (useFile && levelForm.task && !levelForm.taskFile) {
                            const blob = new Blob([levelForm.task], { type: 'text/plain' });
                            const file = new File([blob], `task-${Date.now()}.txt`, { type: 'text/plain' });
                            setLevelForm({ ...levelForm, useTaskFile: true, taskFile: file });
                          } else {
                            setLevelForm({ ...levelForm, useTaskFile: useFile, task: useFile ? '' : levelForm.task });
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-cyan-400/60 bg-[#0a0a0f] text-cyan-400 focus:ring-2 focus:ring-cyan-400/70 cursor-pointer"
                      />
                      <Label htmlFor="useTaskFile" className="text-cyan-200 cursor-pointer select-none">
                        Загрузить txt файл вместо текста
                      </Label>
                    </div>
                  </div>
                  {levelForm.useTaskFile ? (
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="file"
                          accept=".txt"
                          onChange={(e) => setLevelForm({ ...levelForm, taskFile: e.target.files[0] || null })}
                          className="block flex-1 text-sm text-cyan-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-black hover:file:bg-cyan-300 cursor-pointer"
                          required={levelForm.useTaskFile && !levelForm.taskFile}
                        />
                        {levelForm.task && !levelForm.taskFile && (
                          <Button
                            type="button"
                            onClick={() => {
                              const blob = new Blob([levelForm.task], { type: 'text/plain' });
                              const file = new File([blob], `task-${Date.now()}.txt`, { type: 'text/plain' });
                              setLevelForm({ ...levelForm, taskFile: file });
                            }}
                            className="bg-cyan-400 text-black hover:bg-cyan-300 whitespace-nowrap"
                          >
                            Создать файл из текста
                          </Button>
                        )}
                      </div>
                      <p className="text-cyan-200/60 text-xs mt-1">Разрешены только файлы .txt (максимум 10MB)</p>
                      {levelForm.taskFile && (
                        <p className="text-cyan-300 text-sm mt-2">Выбран файл: {levelForm.taskFile.name}</p>
                      )}
                      {!levelForm.taskFile && levelForm.task && (
                        <p className="text-cyan-200/80 text-sm mt-2">Нажмите "Создать файл из текста" или загрузите файл</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Textarea
                        value={levelForm.task}
                        onChange={(e) => setLevelForm({ ...levelForm, task: e.target.value })}
                        required={!levelForm.useTaskFile}
                        placeholder="Введите текст задания или загрузите txt файл"
                      />
                      {levelForm.task && (
                        <Button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([levelForm.task], { type: 'text/plain' });
                            const file = new File([blob], `task-${Date.now()}.txt`, { type: 'text/plain' });
                            setLevelForm({ ...levelForm, useTaskFile: true, taskFile: file });
                          }}
                          className="mt-2 bg-cyan-400 text-black hover:bg-cyan-300"
                        >
                          Создать txt файл из текста
                        </Button>
                      )}
                    </div>
                  )}
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
                  <Label className="text-cyan-200">Подсказка (необязательно)</Label>
                  <Textarea
                    value={levelForm.hint}
                    onChange={(e) => setLevelForm({ ...levelForm, hint: e.target.value })}
                    placeholder="Краткая подсказка для уровня"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Сложность</Label>
                  <select
                    value={levelForm.difficulty}
                    onChange={(e) => setLevelForm({ ...levelForm, difficulty: e.target.value })}
                    className="w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
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
                    onChange={(e) => setLevelForm({ ...levelForm, points: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Время выполнения</Label>
                  <Input
                    value={levelForm.estimatedTime}
                    onChange={(e) => setLevelForm({ ...levelForm, estimatedTime: e.target.value })}
                    placeholder="15 мин"
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Номер уровня</Label>
                  <Input
                    type="number"
                    value={levelForm.orderIndex}
                    onChange={(e) => setLevelForm({ ...levelForm, orderIndex: e.target.value })}
                    min="1"
                    placeholder="1"
                    required
                  />
                  <p className="text-cyan-200/60 text-xs mt-1">Порядок отображения уровня в категории</p>
                </div>
                <div>
                  <Label className="text-cyan-200 mb-2 block">Доступ к уровню</Label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={levelForm.isPaid || false}
                      onChange={(e) => {
                        const isPaid = e.target.checked;
                        setLevelForm({ 
                          ...levelForm, 
                          isPaid: isPaid, 
                          price: isPaid ? (levelForm.price || 0) : 0 
                        });
                      }}
                    />
                    <Label htmlFor="isPaid" className="text-cyan-200 cursor-pointer select-none">
                      Платный уровень (покупка за монеты)
                    </Label>
                  </div>
                  {levelForm.isPaid && (
                    <div>
                      <Label className="text-cyan-200">Стоимость (монеты)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={levelForm.price || 0}
                        onChange={(e) => setLevelForm({ ...levelForm, price: parseInt(e.target.value) || 0 })}
                        required={levelForm.isPaid}
                        className="bg-[#0a0a0f] border-cyan-400/30 text-cyan-200 mt-1"
                        placeholder="Введите стоимость"
                      />
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingLevel ? 'Сохранить изменения' : 'Создать'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования требования опыта */}
        {isRequirementModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingRequirement ? 'Редактировать требование' : 'Добавить требование'}
                </h3>
                <Button
                  onClick={() => {
                    setIsRequirementModalOpen(false);
                    setEditingRequirement(null);
                    setRequirementForm({ level_number: '', experience_required: '' });
                  }}
                  className="bg-transparent hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleRequirementSubmit} className="space-y-4">
                <div>
                  <Label className="text-cyan-200">Номер уровня</Label>
                  <Input
                    type="number"
                    min="1"
                    value={requirementForm.level_number}
                    onChange={(e) => setRequirementForm({ ...requirementForm, level_number: e.target.value })}
                    required
                    disabled={!!editingRequirement}
                    className="bg-[#0a0a0f] border-cyan-400/30 text-cyan-200"
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Требуется опыта (кумулятивное значение)</Label>
                  <p className="text-cyan-200/70 text-sm mb-2">
                    Общее количество опыта, необходимое для достижения этого уровня. Например: для уровня 1 - 100, для уровня 2 - 250, для уровня 3 - 450 и т.д.
                  </p>
                  <Input
                    type="number"
                    min="0"
                    value={requirementForm.experience_required}
                    onChange={(e) => setRequirementForm({ ...requirementForm, experience_required: e.target.value })}
                    required
                    className="bg-[#0a0a0f] border-cyan-400/30 text-cyan-200"
                  />
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingRequirement ? 'Обновить' : 'Создать'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования соревнования */}
        {isCompetitionModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingCompetition ? 'Редактировать соревнование' : 'Создать соревнование'}
                </h3>
                <Button
                  onClick={() => {
                    setIsCompetitionModalOpen(false);
                    setEditingCompetition(null);
                    setCompetitionForm({
                      name: '',
                      description: '',
                      welcomeText: '',
                      entryFee: 0,
                      startDate: '',
                      endDate: '',
                      status: 'upcoming',
                      initialConditions: {
                        resetExperience: false,
                        startingExperience: 0,
                        startingLevel: 1,
                      },
                      prize: '',
                      maxParticipants: '',
                    });
                  }}
                  className="bg-transparent hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleCompetitionSubmit} className="space-y-4">
                <div>
                  <Label className="text-cyan-200">Название</Label>
                  <Input
                    value={competitionForm.name}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Описание</Label>
                  <Textarea
                    value={competitionForm.description}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Приветственный текст</Label>
                  <Textarea
                    value={competitionForm.welcomeText}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, welcomeText: e.target.value })}
                    placeholder="Текст, который увидят участники при входе в соревнование"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-200">Взнос за вход (монеты)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={competitionForm.entryFee}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, entryFee: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-200">Максимум участников</Label>
                    <Input
                      type="number"
                      min="1"
                      value={competitionForm.maxParticipants}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, maxParticipants: e.target.value })}
                      placeholder="Не ограничено"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-200">Дата начала</Label>
                    <Input
                      type="datetime-local"
                      value={competitionForm.startDate}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-200">Дата окончания *</Label>
                    <Input
                      type="datetime-local"
                      value={competitionForm.endDate}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-cyan-200">Статус</Label>
                  <select
                    value={competitionForm.status}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, status: e.target.value })}
                    className="w-full border border-cyan-400/60 bg-[#0a0a0f] text-cyan-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                  >
                    <option value="upcoming">Скоро</option>
                    <option value="active">Активно</option>
                    <option value="finished">Завершено</option>
                  </select>
                </div>
                <div>
                  <Label className="text-cyan-200">Приз</Label>
                  <Input
                    value={competitionForm.prize}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, prize: e.target.value })}
                    placeholder="5000 монет"
                  />
                </div>
                <div className="p-4 border border-cyan-400/30 rounded-lg bg-[#0a0a0f]/50">
                  <Label className="text-cyan-200 mb-3 block">Начальные условия</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="resetExperience"
                        checked={competitionForm.initialConditions.resetExperience}
                        onChange={(e) => setCompetitionForm({
                          ...competitionForm,
                          initialConditions: {
                            ...competitionForm.initialConditions,
                            resetExperience: e.target.checked,
                          },
                        })}
                        className="w-5 h-5 rounded border-2 border-cyan-400/60 bg-[#0a0a0f] text-cyan-400 focus:ring-2 focus:ring-cyan-400/70 cursor-pointer"
                      />
                      <Label htmlFor="resetExperience" className="text-cyan-200 cursor-pointer select-none">
                        Сбросить опыт участников до 0
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-cyan-200 text-sm">Начальный опыт</Label>
                        <Input
                          type="number"
                          min="0"
                          value={competitionForm.initialConditions.startingExperience}
                          onChange={(e) => setCompetitionForm({
                            ...competitionForm,
                            initialConditions: {
                              ...competitionForm.initialConditions,
                              startingExperience: parseInt(e.target.value) || 0,
                            },
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-cyan-200 text-sm">Начальный уровень</Label>
                        <Input
                          type="number"
                          min="1"
                          value={competitionForm.initialConditions.startingLevel}
                          onChange={(e) => setCompetitionForm({
                            ...competitionForm,
                            initialConditions: {
                              ...competitionForm.initialConditions,
                              startingLevel: parseInt(e.target.value) || 1,
                            },
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingCompetition ? 'Сохранить изменения' : 'Создать'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования награды Battle Pass */}
        {isBattlePassModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0a0a0f] border-2 border-cyan-400 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-cyan-300">
                  {editingBattlePassReward ? 'Редактировать награду' : 'Создать награду'}
                </h3>
                <Button
                  onClick={() => {
                    setIsBattlePassModalOpen(false);
                    setEditingBattlePassReward(null);
                    setBattlePassForm({ level: '', reward: '' });
                  }}
                  className="bg-transparent hover:bg-red-500/20 text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleBattlePassRewardSubmit} className="space-y-4">
                <div>
                  <Label className="text-cyan-200">Уровень</Label>
                  <Input
                    type="number"
                    value={battlePassForm.level}
                    onChange={(e) => setBattlePassForm({ ...battlePassForm, level: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Награда</Label>
                  <Input
                    value={battlePassForm.reward}
                    onChange={(e) => setBattlePassForm({ ...battlePassForm, reward: e.target.value })}
                    placeholder="100 монет"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-300">
                  {editingBattlePassReward ? 'Сохранить изменения' : 'Создать'}
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

