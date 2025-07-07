import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, X, Moon, Sun, Coffee, BookOpen, Target, Calendar, StickyNote, CheckSquare } from 'lucide-react';

const DailyTimeBox = () => {
  const [date, setDate] = useState('');
  const [priorities, setPriorities] = useState(['', '', '']);
  const [todos, setTodos] = useState([{ id: 1, text: '', completed: false }]);
  const [notes, setNotes] = useState('');
  const [schedule, setSchedule] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const componentRef = useRef();
  const scheduleRef = useRef();
  const prioritiesRef = useRef();
  const brainDumpRef = useRef();
  const notesRef = useRef();
  const scheduleScrollRef = useRef();
  const autoScrollTimeoutRef = useRef();

  // Initialize date on client side
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setIsClient(true);
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
      }, 3000); // 3 seconds of inactivity
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
    };
  }, []);

  // Time slots from 5 AM to 1 AM next day
  const timeSlots = [];
  for (let hour = 5; hour <= 23; hour++) {
    timeSlots.push(`${hour}:00`);
  }
  // Add midnight and 1 AM
  timeSlots.push('0:00'); // midnight
  timeSlots.push('1:00'); // 1 AM

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
    const timeSlotHeight = 48; // Approximate height of each time slot
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
            <h2 className={`text-lg font-bold ${themeClasses.text}`}>Today</h2>
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
            <div className={`grid ${themeClasses.headerBg} border-b-2 ${themeClasses.border}`} style={{gridTemplateColumns: '60px 1fr 1fr'}}>
              <div className={`p-2 font-bold text-center border-r ${themeClasses.border} ${themeClasses.text} text-sm`}>Time</div>
              <div className={`p-2 font-bold text-center border-r ${themeClasses.border} ${themeClasses.text} text-sm`}>:00</div>
              <div className={`p-2 font-bold text-center ${themeClasses.text} text-sm`}>:30</div>
            </div>

            {/* Time Slots */}
            <div className="max-h-80 overflow-y-auto relative" ref={scheduleScrollRef}>
              {timeSlots.map((time, index) => (
                <div key={`${time}-${index}`} className={`grid border-b ${themeClasses.border} last:border-b-0 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all relative`} style={{gridTemplateColumns: '60px 1fr 1fr'}}>
                  <div className={`p-2 font-bold text-center border-r ${themeClasses.border} flex items-center justify-center ${themeClasses.headerBg} ${themeClasses.text} text-sm`}>
                    {time}
                  </div>
                  <div className={`p-2 border-r ${themeClasses.border}`}>
                    <input
                      type="text"
                      value={schedule[`${time}-${index}-00`] || ''}
                      onChange={(e) => updateSchedule(time, `${index}-00`, e.target.value)}
                      className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded focus:bg-purple-50 dark:focus:bg-gray-700 transition-all`}
                      placeholder=""
                    />
                  </div>
                  <div className="p-2">
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
                      className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 shadow-lg"
                      style={{
                        top: `${currentTimePosition.position * 100}%`,
                        boxShadow: '0 0 4px rgba(239, 68, 68, 0.8)'
                      }}
                    >
                      <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
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

      {/* Quick Navigation - Fixed Bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`flex items-center gap-2 ${themeClasses.cardBg} rounded-full p-2 shadow-2xl border ${themeClasses.border}`}>
          {quickNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(item.ref)}
              className={`p-3 rounded-full ${item.color} text-white hover:scale-110 transition-all shadow-lg`}
              title={item.label}
            >
              <item.icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyTimeBox;