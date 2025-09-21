import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, X, Moon, Sun, Coffee, BookOpen, Target, Calendar, StickyNote, CheckSquare, Clock, Flag, GripVertical, Menu, Home, Users, Settings } from 'lucide-react';
const DailyTimeBox = () => {
  const [date, setDate] = useState('');
  const [priorities, setPriorities] = useState(['', '', '']);
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState('');
  const [schedule, setSchedule] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [newTask, setNewTask] = useState({
    title: '',
    startHour: '',
    startMinute: '',
    startAmPm: 'AM',
    endHour: '',
    endMinute: '',
    endAmPm: 'AM',
    priority: 0, // 0: no priority, 1,2,3: priority levels
    notes: ''
  });
  const componentRef = useRef();
  const scheduleRef = useRef();
  const prioritiesRef = useRef();
  const brainDumpRef = useRef();
  const notesRef = useRef();
  const scheduleScrollRefMobile = useRef();
  const scheduleScrollRefDesktop = useRef();
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

    // Auto scroll to current time on initial load
    setTimeout(() => {
      scrollToCurrentTime();
    }, 1000);
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
    if (!isClient || activeTab !== 'today') return;
  
    const handleScroll = () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
  
      autoScrollTimeoutRef.current = setTimeout(() => {
        scrollToCurrentTime();
      }, 3000);
    };
  
    const scrollContainer = window.innerWidth < 768
      ? scheduleScrollRefMobile.current
      : scheduleScrollRefDesktop.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
  
    return () => {
      const scrollContainer = window.innerWidth < 768
        ? scheduleScrollRefMobile.current
        : scheduleScrollRefDesktop.current;
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [isClient, activeTab]);
  

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

    const scrollContainer = window.innerWidth < 768
      ? scheduleScrollRefMobile.current
      : scheduleScrollRefDesktop.current;
    
    if (!currentTimePosition || !scrollContainer) return;

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

  // Add todo
  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: '',
      completed: false
    };
    
    // Add new empty task at the end
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
    if (field === 'text') {
      const oldTodo = todos.find(todo => todo.id === id);
      const oldText = oldTodo?.text;
      
      // Update todo
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, [field]: value } : todo
      ));
      
      // Update priorities if the old text was in priorities
      if (oldText && oldText !== value) {
        const newPriorities = priorities.map(priority => 
          priority === oldText ? value : priority
        );
        setPriorities(newPriorities);
        
        // Update schedule if exists
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(key => {
          if (typeof newSchedule[key] === 'object' && 
              newSchedule[key].type === 'timeblock' && 
              newSchedule[key].title === oldText) {
            newSchedule[key].title = value;
          }
        });
        setSchedule(newSchedule);
      }
    } else {
      // For other fields like 'completed'
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, [field]: value } : todo
      ));
    }
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (todos.length > 1) {
      const todoToDelete = todos.find(todo => todo.id === id);
      if (todoToDelete) {
        // Remove from todos
        setTodos(todos.filter(todo => todo.id !== id));
        
        // Remove from priorities if it exists there
        const newPriorities = priorities.map(priority => 
          priority === todoToDelete.text ? '' : priority
        );
        setPriorities(newPriorities);
        
        // Remove from schedule if it exists there
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(key => {
          if (typeof newSchedule[key] === 'object' && 
              newSchedule[key].type === 'timeblock' && 
              newSchedule[key].title === todoToDelete.text) {
            delete newSchedule[key];
          }
        });
        setSchedule(newSchedule);
      }
    }
  };

  // Drag and drop functions
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newTodos = [...todos];
    const draggedTodo = newTodos[draggedItem];
    
    // Remove dragged item
    newTodos.splice(draggedItem, 1);
    
    // Insert at new position
    newTodos.splice(dropIndex, 0, draggedTodo);
    
    setTodos(newTodos);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
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

    // Convert 12-hour format to 24-hour format
    const convertTo24Hour = (hour, minute, ampm) => {
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
    };

    if (editingTask) {
      // Update existing task
      if (editingTask.type === 'todo') {
        setTodos(todos.map(todo => 
          todo.id === editingTask.id 
            ? { ...todo, text: newTask.title, notes: newTask.notes }
            : todo
        ));
      } else if (editingTask.type === 'priority') {
        const newPriorities = [...priorities];
        newPriorities[editingTask.index] = newTask.title;
        setPriorities(newPriorities);
      }
    
      // Update priorities if priority is selected for existing task
      const oldTaskTitle = editingTask.text || editingTask.title;
      const updatedPriorities = [...priorities];

      // 1. Remove the old task title from all priority slots
      for (let i = 0; i < updatedPriorities.length; i++) {
        if (updatedPriorities[i] === oldTaskTitle) {
          updatedPriorities[i] = '';
        }
      }

      // 2. Assign the new priority if selected
      if (newTask.priority >= 1 && newTask.priority <= 3) {
        updatedPriorities[newTask.priority - 1] = newTask.title;
      }

      // 3. Save
      setPriorities(updatedPriorities);

    
      // Update schedule if time is provided
      if (newTask.startHour && newTask.startMinute && newTask.endHour && newTask.endMinute) {
        const startTime = convertTo24Hour(newTask.startHour, newTask.startMinute, newTask.startAmPm);
        const endTime = convertTo24Hour(newTask.endHour, newTask.endMinute, newTask.endAmPm);
        const timeBlockKey = `timeblock-${editingTask.id}`;
        setSchedule(prev => ({
          ...prev,
          [timeBlockKey]: {
            title: newTask.title,
            startTime: startTime,
            endTime: endTime,
            type: 'timeblock',
            notes: newTask.notes
          }
        }));
      }
    } else {
      // Add new task
      // Add to Brain Dump (add to beginning of list, but keep the empty task at the end)
      const newTodo = {
        id: Date.now(),
        text: newTask.title,
        completed: false,
        notes: newTask.notes
      };
      
      // Filter out empty tasks and add new task at the end
      const filteredTodos = todos.filter(todo => todo.text.trim() !== '');
      setTodos([...filteredTodos, newTodo]);

      // Add to Schedule if time range is selected
      if (newTask.startHour && newTask.startMinute && newTask.endHour && newTask.endMinute) {
        const startTime = convertTo24Hour(newTask.startHour, newTask.startMinute, newTask.startAmPm);
        const endTime = convertTo24Hour(newTask.endHour, newTask.endMinute, newTask.endAmPm);
        const timeBlockKey = `timeblock-${Date.now()}`;
        setSchedule(prev => ({
          ...prev,
          [timeBlockKey]: {
            title: newTask.title,
            startTime: startTime,
            endTime: endTime,
            type: 'timeblock',
            notes: newTask.notes
          }
        }));
      }

      // Add to Priorities if priority is selected
      if (newTask.priority >= 1 && newTask.priority <= 3) {
        const updatedPriorities = [...priorities];
        updatedPriorities[newTask.priority - 1] = newTask.title;
        setPriorities(updatedPriorities);
      }
    }

    // Reset form and close popup
    setNewTask({ title: '', startHour: '', startMinute: '', startAmPm: 'AM', endHour: '', endMinute: '', endAmPm: 'AM', priority: 0, notes: '' });
    setEditingTask(null);
    setShowTaskPopup(false);
  };

  // Reset task form
  const resetTaskForm = () => {
    setNewTask({ title: '', startHour: '', startMinute: '', startAmPm: 'AM', endHour: '', endMinute: '', endAmPm: 'AM', priority: 0, notes: '' });
    setEditingTask(null);
    setShowTaskPopup(false);
  };

  // Edit task function
  const editTask = (task, type, index = null) => {
    setEditingTask({ ...task, type, index });
    
    // Find existing time block for this task
    let existingTimeBlock = null;
    for (const [key, value] of Object.entries(schedule)) {
      if (typeof value === 'object' && value.type === 'timeblock' && value.title === (task.text || task)) {
        existingTimeBlock = value;
        break;
      }
    }

    // Find existing priority for this task
    let existingPriority = 0;
    for (let i = 0; i < priorities.length; i++) {
      if (priorities[i] === (task.text || task)) {
        existingPriority = i + 1;
        break;
      }
    }

    // Convert 24-hour format to 12-hour format
    const convertTo12Hour = (timeStr) => {
      if (!timeStr) return { hour: '', minute: '', ampm: 'AM' };
      
      const [hours, minutes] = timeStr.split(':');
      let hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
      
      return {
        hour: hour.toString(),
        minute: minutes,
        ampm: ampm
      };
    };

    const startTime = existingTimeBlock ? convertTo12Hour(existingTimeBlock.startTime) : { hour: '', minute: '', ampm: 'AM' };
    const endTime = existingTimeBlock ? convertTo12Hour(existingTimeBlock.endTime) : { hour: '', minute: '', ampm: 'AM' };

    setNewTask({
      title: task.text || task,
      startHour: startTime.hour,
      startMinute: startTime.minute,
      startAmPm: startTime.ampm,
      endHour: endTime.hour,
      endMinute: endTime.minute,
      endAmPm: endTime.ampm,
      priority: existingPriority,
      notes: task.notes || existingTimeBlock?.notes || ''
    });
    setShowTaskPopup(true);
  };

  // Calculate time block position and height
  const calculateTimeBlockStyle = (startTime, endTime) => {
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };
  
    const start = parseTime(startTime);
    const end = parseTime(endTime);
  
    const slotHeightPerHour = 60;     // 전체 1시간당 height
    const baseOffset = 0;             // 기본적으로 5:00부터 시작이므로 offset 없음
  
    const top = (start - 5) * slotHeightPerHour + 10; // <- 여기에 보정값 필요
    const height = (end - start) * slotHeightPerHour;
  
    return {
      top: `${top}px`,
      height: `${Math.max(height, 30)}px`,
      left: '60px',
      right: '0px',
      position: 'absolute',
      zIndex: 5
    };
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
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-purple-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-600' : 'border-gradient-to-br from-teal-50 to-purple-50',
    input: isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white/70 text-gray-800',
    accent: isDarkMode ? 'from-purple-600 to-pink-600' : 'from-green-500 to-blue-500',
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

  const generateHours = () => {
    const hours = [];
    for (let hour = 0; hour <= 23; hour++) {
      hours.push(hour.toString().padStart(2, '0'));
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let minute = 0; minute < 60; minute += 15) { // 15분 간격
      minutes.push(minute.toString().padStart(2, '0'));
    }
    return minutes;
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  const timeSlots = generateTimeSlots();

  const currentTimePosition = getCurrentTimePosition();

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex`}>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden md:flex md:w-64 ${themeClasses.cardBg} border-r ${themeClasses.border} flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className={`text-xl font-bold ${themeClasses.text} bg-gradient-to-r ${themeClasses.accent} bg-clip-text text-transparent`}>
              Daily Time Box
            </h1>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>Quick Calendar</h3>
          <div className={`${themeClasses.sectionBg} rounded-lg p-3 border ${themeClasses.border}`}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full border ${themeClasses.border} bg-transparent outline-none rounded-lg p-2 ${themeClasses.text} focus:border-purple-500 transition-all text-sm`}
            />
          </div>
        </div>

        {/* Recent Logs */}
        <div className="p-4 flex-1">
          <h3 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>Recent Activity</h3>
          <div className="space-y-2">
            {lastSaved && (
              <div className={`p-3 rounded-lg ${themeClasses.sectionBg} border ${themeClasses.border}`}>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={themeClasses.textSecondary}>
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
            <div className={`p-3 rounded-lg ${themeClasses.sectionBg} border ${themeClasses.border}`}>
              <div className="text-xs">
                <div className={`font-medium ${themeClasses.text} mb-1`}>Today's Progress</div>
                <div className={themeClasses.textSecondary}>
                  {todos.filter(todo => todo.completed).length} of {todos.filter(todo => todo.text.trim()).length} tasks completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          {/* Left: Menu button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">UniDay</h1>
          </div>

          {/* Right: Dark mode toggle + PDF download button */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 rounded-lg text-sm"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
        {/* Desktop Header */}
        <div className="hidden md:block sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            {/* Left: Logo + Title */}
            <div></div>

            {/* Right: Dark mode toggle + PDF download button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
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
        <div className="flex-1 overflow-auto pb-12 md:pb-0">
          {/* Mobile: Tab-based Content */}
          <div className="md:hidden">
            {/* Content for each tab */}
            {activeTab === 'today' && (
              <div className="p-4 space-y-6" ref={componentRef}>

                {/* Daily Priorities */}
                <div ref={prioritiesRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-purple-500" size={24} />
                    <h2 className={`text-xl font-bold ${themeClasses.text}`}>Daily Priorities</h2>
                  </div>
                  <div className="space-y-3">
                    {priorities.map((priority, index) => (
                      <div key={index} className={`flex items-center p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border} ${priority.trim() ? 'cursor-pointer' : ''}`}>
                        <span className={`text-lg font-bold bg-gradient-to-r ${themeClasses.accent} bg-clip-text text-transparent mr-3 w-6`}>
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={priority}
                          readOnly
                          onClick={() => priority.trim() && editTask(priority, 'priority', index)}
                          placeholder={`Priority ${index + 1}`}
                          className={`flex-1 bg-transparent border-none outline-none ${themeClasses.text} placeholder-gray-400 cursor-pointer`}
                          title="Click to edit this priority task"
                        />
                      </div>
                    ))}
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
                    <div className="max-h-80 overflow-y-auto overflow-x-hidden relative" ref={scheduleScrollRefMobile}>
                      {scheduleTimeSlots.map((time, index) => (
                        <div key={`${time}-${index}`} className={`grid border-b ${themeClasses.border} last:border-b-0 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all relative`} style={{gridTemplateColumns: '60px 1fr', gridTemplateRows: '30px 30px'}}>
                          <div className={`row-span-2 p-1 font-bold text-center border-r ${themeClasses.border} flex items-center justify-center ${themeClasses.headerBg} ${themeClasses.text} text-sm`}>
                            {time}
                          </div>
                          <div className="p-1 relative">
                            <input
                              type="text"
                              value={schedule[`${time}-${index}-00`] || ''}
                              readOnly
                              className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded cursor-default`}
                              placeholder=""
                            />
                            {/* 중간 구분선 */}
                            <div className={`absolute bottom-0 left-0 right-0 h-px ${themeClasses.border} bg-gray-300 dark:bg-gray-600`}></div>
                          </div>
                          <div className="p-1">
                            <input
                              type="text"
                              value={schedule[`${time}-${index}-30`] || ''}
                              readOnly
                              className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded cursor-default`}
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
                      
                      {/* Time Block Overlays */}
                      {Object.entries(schedule).map(([key, value]) => {
                        if (typeof value === 'object' && value.type === 'timeblock') {
                          const style = calculateTimeBlockStyle(value.startTime, value.endTime);
                          return (
                            <div
                              key={key}
                              style={style}
                              className="bg-purple-500/80 text-white text-xs p-2 rounded-lg border-l-4 border-purple-600 shadow-lg backdrop-blur-sm group relative overflow-hidden"
                              title={value.notes ? value.notes : ''}
                            >
                              <div className="font-semibold truncate">{value.title}</div>
                              <div className="text-purple-100 text-xs mt-1 truncate">
                                {value.startTime} - {value.endTime}
                              </div>
                              {/* Notes Tooltip */}
                              {value.notes && (
                                <div className="absolute left-full ml-2 top-0 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-48 max-w-64">
                                  <div className="font-medium mb-1">Notes:</div>
                                  <div className="whitespace-pre-wrap">{value.notes}</div>
                                  {/* Arrow */}
                                  <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-800"></div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Brain Dump */}
                <div ref={brainDumpRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckSquare className="text-green-500" size={24} />
                    <h2 className={`text-xl font-bold ${themeClasses.text}`}>Brain Dump</h2>
                  </div>
                  <div className="space-y-2">
                    {todos.map((todo, index) => (
                      <div 
                        key={todo.id} 
                        draggable={todo.text.trim() !== ''}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border} group transition-all ${
                          draggedItem === index ? 'opacity-50 scale-95' : ''
                        } ${
                          dragOverIndex === index && draggedItem !== index ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105' : ''
                        } ${
                          todo.text.trim() !== '' ? 'cursor-move' : ''
                        }`}
                      >
                        {todo.text.trim() !== '' && (
                          <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                            <GripVertical size={16} />
                          </div>
                        )}
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
                          onClick={() => todo.text.trim() && editTask(todo, 'todo')}
                          placeholder="Enter your task..."
                          data-todo-id={todo.id}
                          className={`flex-1 bg-transparent border-none outline-none ${
                            todo.completed 
                              ? 'text-gray-400 line-through' 
                              : themeClasses.text
                          } placeholder-gray-400 text-sm ${todo.text.trim() ? 'cursor-pointer' : ''}`}
                        />
                        {todos.length > 1 && todo.text.trim() !== '' && (
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
                      onClick={() => setShowTaskPopup(true)}
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
            )}
            {activeTab === 'calendar' && (
              <div className="p-4 text-gray-500 text-center">
                📅 Calendar is under construction.
              </div>
            )}
            {activeTab === 'share' && (
              <div className="p-4 text-gray-500 text-center">
                📊 Insights are coming soon.
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="p-4 text-gray-500 text-center">
                ⚙️ Settings page will be available soon.
              </div>
            )}
          </div>

          {/* Desktop: Show all content */}
          <div className="hidden md:block p-4 space-y-6" ref={componentRef}>
                {/* Auto-save Status */}
                {/* <div className="flex justify-end">
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
                </div> */}
                
                {/* Daily Priorities */}
                <div ref={prioritiesRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-purple-500" size={24} />
                    <h2 className={`text-xl font-bold ${themeClasses.text}`}>Daily Priorities</h2>
                  </div>
                  <div className="space-y-3">
                    {priorities.map((priority, index) => (
                      <div key={index} className={`flex items-center p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border} ${priority.trim() ? 'cursor-pointer' : ''}`}>
                        <span className={`text-lg font-bold bg-gradient-to-r ${themeClasses.accent} bg-clip-text text-transparent mr-3 w-6`}>
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={priority}
                          onChange={(e) => updatePriority(index, e.target.value)}
                          onClick={() => priority.trim() && editTask(priority, 'priority', index)}
                          placeholder={`Priority ${index + 1}`}
                          className={`flex-1 bg-transparent border-none outline-none ${themeClasses.text} placeholder-gray-400 ${priority.trim() ? 'cursor-pointer' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Schedule */}
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
                    <div className="max-h-80 overflow-y-auto overflow-x-hidden relative" ref={scheduleScrollRefDesktop}>
                      {scheduleTimeSlots.map((time, index) => (
                        <div key={`${time}-${index}`} className={`grid border-b ${themeClasses.border} last:border-b-0 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all relative`} style={{gridTemplateColumns: '60px 1fr', gridTemplateRows: '30px 30px'}}>
                          <div className={`row-span-2 p-1 font-bold text-center border-r ${themeClasses.border} flex items-center justify-center ${themeClasses.headerBg} ${themeClasses.text} text-sm`}>
                            {time}
                          </div>
                          <div className="p-1 relative">
                            <input
                              type="text"
                              value={schedule[`${time}-${index}-00`] || ''}
                              readOnly
                              className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded cursor-default`}
                              placeholder=""
                            />
                            {/* 중간 구분선 */}
                            <div className={`absolute bottom-0 left-0 right-0 h-px ${themeClasses.border} bg-gray-300 dark:bg-gray-600`}></div>
                          </div>
                          <div className="p-1">
                            <input
                              type="text"
                              value={schedule[`${time}-${index}-30`] || ''}
                              readOnly
                              className={`w-full bg-transparent border-none outline-none text-xs ${themeClasses.text} p-1 rounded cursor-default`}
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
                      
                      {/* Time Block Overlays */}
                      {Object.entries(schedule).map(([key, value]) => {
                        if (typeof value === 'object' && value.type === 'timeblock') {
                          const style = calculateTimeBlockStyle(value.startTime, value.endTime);
                          return (
                            <div
                              key={key}
                              style={style}
                              className="bg-purple-500/80 text-white text-xs p-2 rounded-lg border-l-4 border-purple-600 shadow-lg backdrop-blur-sm group relative overflow-hidden"
                              title={value.notes ? value.notes : ''}
                            >
                              <div className="font-semibold truncate">{value.title}</div>
                              <div className="text-purple-100 text-xs mt-1 truncate">
                                {value.startTime} - {value.endTime}
                              </div>
                              {/* Notes Tooltip */}
                              {value.notes && (
                                <div className="absolute left-full ml-2 top-0 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-48 max-w-64">
                                  <div className="font-medium mb-1">Notes:</div>
                                  <div className="whitespace-pre-wrap">{value.notes}</div>
                                  {/* Arrow */}
                                  <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-800"></div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Brain Dump */}
                <div ref={brainDumpRef} className={`${themeClasses.sectionBg} rounded-2xl p-4 border ${themeClasses.border} shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckSquare className="text-green-500" size={24} />
                    <h2 className={`text-xl font-bold ${themeClasses.text}`}>Brain Dump</h2>
                  </div>
                  <div className="space-y-2">
                    {todos.map((todo, index) => (
                      <div 
                        key={todo.id} 
                        draggable={todo.text.trim() !== ''}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-xl ${themeClasses.input} border ${themeClasses.border} group transition-all ${
                          draggedItem === index ? 'opacity-50 scale-95' : ''
                        } ${
                          dragOverIndex === index && draggedItem !== index ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105' : ''
                        } ${
                          todo.text.trim() !== '' ? 'cursor-move' : ''
                        }`}
                      >
                        {todo.text.trim() !== '' && (
                          <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                            <GripVertical size={16} />
                          </div>
                        )}
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
                          onClick={() => todo.text.trim() && editTask(todo, 'todo')}
                          placeholder="Enter your task..."
                          data-todo-id={todo.id}
                          className={`flex-1 bg-transparent border-none outline-none ${
                            todo.completed 
                              ? 'text-gray-400 line-through' 
                              : themeClasses.text
                          } placeholder-gray-400 text-sm ${todo.text.trim() ? 'cursor-pointer' : ''}`}
                        />
                        {todos.length > 1 && todo.text.trim() !== '' && (
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
                      onClick={() => setShowTaskPopup(true)}
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
        </div>
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 z-50">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center text-xs ${
              activeTab === 'today' ? 'teal-600' : 'text-gray-500'
            }`}
          >
            <Home size={20} />
            Today
          </button>
          <button
            onClick={() => setActiveTab('Calendar')}
            className={`flex flex-col items-center text-xs ${
              activeTab === 'calendar' ? 'emerald-600' : 'text-gray-500'
            }`}
          >
            <Calendar size={20} />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('Share')}
            className={`flex flex-col items-center text-xs ${
              activeTab === 'insights' ? 'emerald-600' : 'text-gray-500'
            }`}
          >
            <Users size={20} />
            Share
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center text-xs ${
              activeTab === 'settings' ? 'emerald-600' : 'text-gray-500'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </div>
        {/* Add New Task Section - Fixed Bottom */}
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-20">
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
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
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
                <div className="space-y-4">
                  {/* Start Time */}
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-3`}>
                      <Clock size={16} className="inline mr-1" />
                      Start Time
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={newTask.startHour}
                        onChange={(e) => setNewTask({...newTask, startHour: e.target.value})}
                        placeholder="07"
                        className={`w-16 h-16 text-center text-xl font-semibold rounded-lg border-2 ${newTask.startHour ? 'border-purple-500 bg-purple-100 dark:bg-purple-900' : themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                      />
                      <span className={`text-2xl font-bold ${themeClasses.text}`}>:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={newTask.startMinute}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Handle 3 digits: take last 2 digits
                          if (value.length > 2) {
                            value = value.slice(-2);
                          }
                          // Pad with leading zero if single digit
                          if (value.length === 1 && parseInt(value) >= 0) {
                            value = value.padStart(2, '0');
                          }
                          // Ensure it's within 0-59 range
                          const numValue = parseInt(value);
                          if (numValue > 59) {
                            value = '59';
                          }
                          setNewTask({...newTask, startMinute: value});
                        }}
                        placeholder="00"
                        className={`w-16 h-16 text-center text-xl font-semibold rounded-lg border-2 ${newTask.startMinute ? 'border-purple-500 bg-purple-100 dark:bg-purple-900' : themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                      />
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setNewTask({...newTask, startAmPm: 'AM'})}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                            newTask.startAmPm === 'AM' 
                              ? 'bg-pink-500 text-white' 
                              : `${themeClasses.input} ${themeClasses.text} border ${themeClasses.border}`
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({...newTask, startAmPm: 'PM'})}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                            newTask.startAmPm === 'PM' 
                              ? 'bg-pink-500 text-white' 
                              : `${themeClasses.input} ${themeClasses.text} border ${themeClasses.border}`
                          }`}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-8 mt-2 text-xs text-gray-500">
                      <span>Hour</span>
                      <span>Minute</span>
                    </div>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-3`}>
                      <Clock size={16} className="inline mr-1" />
                      End Time
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={newTask.endHour}
                        onChange={(e) => setNewTask({...newTask, endHour: e.target.value})}
                        placeholder="07"
                        className={`w-16 h-16 text-center text-xl font-semibold rounded-lg border-2 ${newTask.endHour ? 'border-purple-500 bg-purple-100 dark:bg-purple-900' : themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                      />
                      <span className={`text-2xl font-bold ${themeClasses.text}`}>:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={newTask.endMinute}
                        onChange={(e) => {
                          const value = e.target.value.padStart(2, '0');
                          setNewTask({...newTask, endMinute: value});
                        }}
                        placeholder="00"
                        className={`w-16 h-16 text-center text-xl font-semibold rounded-lg border-2 ${newTask.endMinute ? 'border-purple-500 bg-purple-100 dark:bg-purple-900' : themeClasses.border} ${themeClasses.input} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all`}
                      />
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setNewTask({...newTask, endAmPm: 'AM'})}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                            newTask.endAmPm === 'AM' 
                              ? 'bg-pink-500 text-white' 
                              : `${themeClasses.input} ${themeClasses.text} border ${themeClasses.border}`
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({...newTask, endAmPm: 'PM'})}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                            newTask.endAmPm === 'PM' 
                              ? 'bg-pink-500 text-white' 
                              : `${themeClasses.input} ${themeClasses.text} border ${themeClasses.border}`
                          }`}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-8 mt-2 text-xs text-gray-500">
                      <span>Hour</span>
                      <span>Minute</span>
                    </div>
                  </div>
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

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    <StickyNote size={16} className="inline mr-1" />
                    Notes (Optional)
                  </label>
                  <div className={`rounded-lg border ${themeClasses.border} ${themeClasses.input} p-3`}>
                    <textarea
                      value={newTask.notes}
                      onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                      className={`w-full h-20 bg-transparent border-none outline-none resize-none ${themeClasses.text} placeholder-gray-400`}
                    />
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
                    {editingTask ? 'Update Task' : 'Save Task'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTimeBox;