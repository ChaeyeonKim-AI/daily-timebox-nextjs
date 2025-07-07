import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, X, Moon, Sun, Coffee, BookOpen, Target, Calendar, StickyNote, CheckSquare, Clock, Flag } from 'lucide-react';

const DailyTimeBox = () => {
  const [date, setDate] = useState('');
  const [priorities, setPriorities] = useState(['', '', '']);
  const [todos, setTodos] = useState([{ id: 1, text: '', completed: false }]);
  const [notes, setNotes] = useState('');
  const [schedule, setSchedule] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    time: '',
    priority: 0 // 0: no priority, 1,2,3: priority levels
  });
  const componentRef = useRef();
  const scheduleRef = useRef();
  const prioritiesRef = useRef();
  const brainDumpRef = useRef();
  const notesRef = useRef();
  const scheduleScrollRef = useRef();
  const autoScrollTimeoutRef = useRef();
  const saveTimeoutRef = useRef();

  // Auto-save function
  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      const dataToSave = {
        date,
        priorities,
        todos,
        notes,
        schedule,
        isDarkMode,
        lastSaved: new Date().toISOString()
      };
      
      // Save to memory (simulating API call)
      setTimeout(() => {
        console.log('Auto-saved data:', dataToSave);
        setLastSaved(new Date());
        setIsSaving(false);
      }, 200);
    }, 500); // Save after 500ms of inactivity
  };

  // Load saved data on client initialization
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setIsClient(true);
    
    // Simulate loading saved data
    // In a real app, this would fetch from localStorage or API
    // const savedData = localStorage.getItem('dailyTimeBox');
    // if (savedData) {
    //   const parsed = JSON.parse(savedData);
    //   setDate(parsed.date || new Date().toISOString().split('T')[0]);
    //   setPriorities(parsed.priorities || ['', '', '']);
    //   setTodos(parsed.todos || [{ id: 1, text: '', completed: false }]);
    //   setNotes(parsed.notes || '');
    //   setSchedule(parsed.schedule || {});
    //   setIsDarkMode(parsed.isDarkMode || false);
    // }
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (isClient) {
      autoSave();
    }
  }, [date, priorities, todos, notes, schedule, isDarkMode, isClient]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto scroll to current time after inactivity
  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }

      // Set new timeout for auto scroll
      autoScrollTimeoutRef.current = setTimeout(() => {
        scrollToCurrentTime();
      }, 5000); // 5 seconds of inactivity
    };

    const scrollContainer = scheduleScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current);
        }
      };
    }
  }, [isClient]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Time slots from 5 AM to 1 AM next day
  const scheduleTimeSlots = [];
  for (let hour = 5; hour <= 23; hour++) {
    scheduleTimeSlots.push(`${hour}:00`);
  }
  // Add midnight and 1 AM
  scheduleTimeSlots.push('0:00'); // midnight
  scheduleTimeSlots.push('1:00'); // 1 AM

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Find the index of current time slot
    let timeSlotIndex = -1;
    
    if (currentHour >= 5 && currentHour <= 23) {
      timeSlotIndex = currentHour - 5;
    } else if (currentHour === 0) {
      timeSlotIndex = 19; // midnight slot
    } else if (currentHour === 1) {
      timeSlotIndex = 20; // 1 AM slot
    }
    
    if (timeSlotIndex === -1) return null;
    
    // Calculate position within the time slot (0-1)
    const positionInSlot = currentMinute / 60;
    
    return {
      slotIndex: timeSlotIndex,
      position: positionInSlot
    };
  };

  // Scroll to current time
  const scrollToCurrentTime = () => {
    const currentTimePosition = getCurrentTimePosition();
    if (!currentTimePosition || !scheduleScrollRef.current) return;

    const scrollContainer = scheduleScrollRef.current;
    const timeSlotHeight = 60; // Reduced height for 2-row layout
    const headerHeight = 40; // Height of the table header
    
    // Calculate scroll position to center current time in view
    const targetScrollTop = (currentTimePosition.slotIndex * timeSlotHeight) + 
                           (currentTimePosition.position * timeSlotHeight) - 
                           (scrollContainer.clientHeight / 3); // Position at top 1/3 of container

    scrollContainer.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  };

  // Scroll to section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Update priority
  const updatePriority = (index, value) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  // Add todo
  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: '',
      completed: false
    };
    setTodos([...todos, newTodo]);
    
    // Focus on the new todo after it's added
    setTimeout(() => {
      const newTodoInput = document.querySelector(`input[data-todo-id="${newTodo.id}"]`);
      if (newTodoInput) {
        newTodoInput.focus();
      }
    }, 0);
  };

  // Update todo
  const updateTodo = (id, field, value) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, [field]: value } : todo
    ));
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (todos.length > 1) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  // Handle enter key press
  const handleTodoKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTodo();
    }
  };

  // Add new task from popup
  const addTaskFromPopup = () => {
    if (!newTask.title.trim()) return;

    // Add to Brain Dump
    const newTodo = {
      id: Date.now(),
      text: newTask.title,
      completed: false
    };
    setTodos([...todos, newTodo]);

    // Add to Schedule if time is selected
    if (newTask.time) {
      const timeKey = `${newTask.time}-${Math.floor(Math.random() * 1000)}-00`;
      setSchedule(prev => ({
        ...prev,
        [timeKey]: newTask.title
      }));
    }

    // Add to Priorities if priority is selected
    if (newTask.priority > 0 && newTask.priority <= 3) {
      const newPriorities = [...priorities];
      const priorityIndex = newTask.priority - 1;
      if (!newPriorities[priorityIndex]) {
        newPriorities[priorityIndex] = newTask.title;
      } else {
        // If priority slot is taken, find next available slot
        for (let i = 0; i < 3; i++) {
          if (!newPriorities[i]) {
            newPriorities[i] = newTask.title;
            break;
          }
        }
      }
      setPriorities(newPriorities);
    }

    // Reset form and close popup
    setNewTask({ title: '', time: '', priority: 0 });
    setShowTaskPopup(false);
  };

  // Reset task form
  const resetTaskForm = () => {
    setNewTask({ title: '', time: '', priority: 0 });
    setShowTaskPopup(false);
  };

  // Update schedule
  const updateSchedule = (time, period, value) => {
    const key = `${time}-${period}`;
    setSchedule(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // PDF download function
  const downloadPDF = () => {
    alert('PDF download feature will be executed. For actual implementation, use jsPDF library.');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-600' : 'border-purple-200',
    input: isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white/70 text-gray-800',
    accent: isDarkMode ? 'from-purple-600 to-pink-600' : 'from-purple-500 to-pink-500',
    sectionBg: isDarkMode ? 'bg-gray-700/50' : 'bg-white/80',
    headerBg: isDarkMode ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-100 to-pink-100'
  };

  // Quick navigation items
  const quickNavItems = [
    { icon: Calendar, label: 'Schedule', ref: scheduleRef, color: 'bg-blue-500' },
    { icon: Target, label: 'Priorities', ref: prioritiesRef, color: 'bg-purple-500' },
    { icon: CheckSquare, label: 'Tasks', ref: brainDumpRef, color: 'bg-green-500' },
    { icon: StickyNote, label: 'Notes', ref: notesRef, color: 'bg-orange-500' }
  ];

  // Generate time slots for popup
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 23; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    slots.push('0:00');
    slots.push('0:30');
    slots.push('1:00');
    slots.push('1:30');
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const currentTimePosition = getCurrentTimePosition();

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} pb-24`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${themeClasses.cardBg} border-b ${themeClasses.border} p-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className={`text-2xl font-bold ${themeClasses.text} bg-gradient-to-r ${themeClasses.accent} bg-clip-text text-transparent`}>
              Daily Time Box
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6" ref={componentRef}>
        
        {/* Date Input */}
        <div className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-bold ${themeClasses.text}`}>Today</h2>
              {/* Auto-save Status */}
              <div className="flex items-center gap-2 text-xs">
                {isSaving ? (
                  <div className="flex items-center gap-1 text-blue-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Saving...</span>
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`border-2 border-purple-300 bg-transparent outline-none rounded-lg p-2 ${themeClasses.text} focus:border-purple-500 transition-all`}
            />
          </div>
        </div>

        {/* Today's Schedule - Priority Section */}
        <div ref={scheduleRef} className={`${themeClasses.sectionBg} rounded-2xl overflow-hidden border ${themeClasses.border} shadow-lg`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-blue-500" size={24} />
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>Today's Schedule</h2>
            </div>
          </div>
          
          {/* Schedule Grid */}
          <div className="overflow-hidden">
            {/* Header */}
            <div className={`grid ${themeClasses.headerBg} border-b-2 ${themeClasses.border}`} style={{gridTemplateColumns: '60px 1fr'}}>
              <div className={`p-2 font-bold text-center border-r ${themeClasses.border} ${themeClasses.text} text-sm`}>Time</div>
              <div className={`p-2 font-bold text-center ${themeClasses.text} text-sm`}>Schedule</div>
            </div>

            {/* Time Slots */}
            <div className="max-h-80 overflow-y-auto relative" ref={scheduleScrollRef}>
              {scheduleTimeSlots.map((time, index) => (
                <div key={`${time}-${index}`} className={`grid border-b ${themeClasses.border} last:border-b-0 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all relative`} style={{gridTemplateColumns: '60px 1fr', gridTemplateRows: '30px 30px'}}>
                  <div className={`row-span-2 p-1 font-bold text-center border-r ${themeClasses.border} flex items-center justify-center ${themeClasses.headerBg} ${themeClasses.text} text-sm`}>
                    {time}
                  </div>
                  <div className="p-1 relative">
                    <input
                      type="text"
                      value={schedule[`${time}-${index}-00`] || ''}
                      onChange={(e) => updateSchedule(time, `${index}-00`, e.target.value)}
                      className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded focus:bg-purple-50 dark:focus:bg-gray-700 transition-all`}
                      placeholder=""
                    />
                    {/* 중간 구분선 */}
                    <div className={`absolute bottom-0 left-0 right-0 h-px ${themeClasses.border} bg-gray-300 dark:bg-gray-600`}></div>
                  </div>
                  <div className="p-1">
                    <input
                      type="text"
                      value={schedule[`${time}-${index}-30`] || ''}
                      onChange={(e) => updateSchedule(time, `${index}-30`, e.target.value)}
                      className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded focus:bg-purple-50 dark:focus:bg-gray-700 transition-all`}
                      placeholder=""
                    />
                  </div>
                  
                  {/* Current Time Indicator */}
                  {currentTimePosition && currentTimePosition.slotIndex === index && (
                    <div 
                      className="absolute left-0 right-0 h-px bg-red-500 z-10 pointer-events-none"
                      style={{
                        top: `${currentTimePosition.position * 100}%`,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        boxShadow: '0 0 2px rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      <div className="absolute -left-0.5 -top-0.5 w-1 h-1 bg-red-500 rounded-full opacity-80"></div>
                      <div className="absolute -right-0.5 -top-0.5 w-1 h-1 bg-red-500 rounded-full opacity-80"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Priorities */}
        <div ref={prioritiesRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-purple-500" size={24} />
            <h2 className={`text-xl font-bold ${themeClasses.text}`}>Daily Priorities</h2>
          </div>
          <div className="space-y-3">
            {priorities.map((priority, index) => (
              <div key={index} className={`flex items-center p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border}`}>
                <span className={`text-lg font-bold bg-gradient-to-r ${themeClasses.accent} bg-clip-text text-transparent mr-3 w-6`}>
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => updatePriority(index, e.target.value)}
                  placeholder={`Priority ${index + 1}`}
                  className={`flex-1 bg-transparent border-none outline-none ${themeClasses.text} placeholder-gray-400`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Brain Dump */}
        <div ref={brainDumpRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="text-green-500" size={24} />
            <h2 className={`text-xl font-bold ${themeClasses.text}`}>Brain Dump</h2>
          </div>
          <div className="space-y-2">
            {todos.map((todo) => (
              <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border} group`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => updateTodo(todo.id, 'completed', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <input
                  type="text"
                  value={todo.text}
                  onChange={(e) => updateTodo(todo.id, 'text', e.target.value)}
                  onKeyPress={(e) => handleTodoKeyPress(e, todo.id)}
                  placeholder="Enter your task..."
                  data-todo-id={todo.id}
                  className={`flex-1 bg-transparent border-none outline-none ${
                    todo.completed 
                      ? 'text-gray-400 line-through' 
                      : themeClasses.text
                  } placeholder-gray-400 text-sm`}
                />
                {todos.length > 1 && (
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTodo}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 mt-3 p-3 rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 transition-all w-full justify-center"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Notes */}
        <div ref={notesRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <StickyNote className="text-orange-500" size={24} />
            <h2 className={`text-xl font-bold ${themeClasses.text}`}>Notes</h2>
          </div>
          <div className={`rounded-xl ${themeClasses.input} border ${themeClasses.border} p-3`}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes..."
              className={`w-full h-24 bg-transparent border-none outline-none resize-none ${themeClasses.text} placeholder-gray-400`}
            />
          </div>
        </div>
      </div>

      {/* Add New Task Section - Fixed Bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`flex items-center gap-3 ${themeClasses.cardBg} rounded-full px-4 py-3 shadow-2xl border ${themeClasses.border}`}>
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
            <Plus className="text-white" size={16} />
          </div>
          <button
            onClick={() => setShowTaskPopup(true)}
            className={`text-sm font-medium ${themeClasses.text} hover:text-purple-600 transition-all`}
          >
            Add New Task
          </button>
        </div>
      </div>

      {/* Task Popup */}
      {showTaskPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.cardBg} rounded-2xl p-6 w-full max-w-md border ${themeClasses.border} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${themeClasses.text}`}>Add New Task</h3>
              <button
                onClick={resetTaskForm}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${themeClasses.text}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                  className={`w-full p-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  <Clock size={16} className="inline mr-1" />
                  Time (Optional)
                </label>
                <select
                  value={newTask.time}
                  onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  className={`w-full p-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                >
                  <option value="">Select time...</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Priority Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  <Flag size={16} className="inline mr-1" />
                  Priority (Optional)
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewTask({...newTask, priority})}
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        newTask.priority === priority
                          ? 'bg-purple-500 text-white border-purple-500'
                          : `border-gray-300 ${themeClasses.input} hover:border-purple-300`
                      }`}
                    >
                      {priority === 0 ? 'None' : `Priority ${priority}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetTaskForm}
                  className={`flex-1 py-3 px-4 rounded-lg border ${themeClasses.border} ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={addTaskFromPopup}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newTask.title.trim()}
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTimeBox;