// ==========================================================================
// VJ Institute - Learn and Grow LMS: Central Authentication Module
// ==========================================================================

(function () {
  'use strict';

  const USERS_STORAGE_KEY = 'vj_lms_users_v1';
  const CURRENT_USER_KEY = 'vj_lms_current_user_v1';
  const THEME_KEY = 'craftstudio_theme_pref';
  const STUDENT_DATA_KEY = 'craftstudio_student_data_v1';

  // Seed default demo accounts
  const DEFAULT_USERS = [
    {
      id: 'usr-vijay',
      name: 'Vijay Anand',
      email: 'vijay.anand@vjinstitute.edu',
      password: 'password123',
      role: 'Principal Fellow',
      track: 'Distributed Systems & Full-Stack Architecture',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      memberSince: 'October 2026',
      streakDays: 14,
      hoursLearned: 48.5
    },
    {
      id: 'usr-elena',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@vjinstitute.edu',
      password: 'password123',
      role: 'Principal Python Architect',
      track: 'Python Systems & CPython Internals',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      memberSince: 'August 2026',
      streakDays: 28,
      hoursLearned: 92.0
    },
    {
      id: 'usr-arjun',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@vjinstitute.edu',
      password: 'password123',
      role: 'Staff Infrastructure Engineer',
      track: 'Production Full-Stack Architecture',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      memberSince: 'May 2026',
      streakDays: 45,
      hoursLearned: 140.0
    }
  ];

  function getUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading users from storage:', e);
    }
    // Seed initial users if not found
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    } catch (e) {
      console.warn('Failed to seed default users:', e);
    }
    return DEFAULT_USERS;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading active user:', e);
    }
    // Default active user is Vijay Anand
    const users = getUsers();
    const defaultUser = users[0];
    setCurrentUser(defaultUser);
    return defaultUser;
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Also update student data profile so dashboard name and email match
        syncStudentData(user);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.warn('Error writing current user:', e);
    }
  }

  function syncStudentData(user) {
    try {
      const raw = localStorage.getItem(STUDENT_DATA_KEY);
      let data = raw ? JSON.parse(raw) : {};
      data.name = user.name;
      data.email = user.email;
      data.title = user.role || data.title || 'Software Engineer';
      if (user.avatar) data.avatar = user.avatar;
      if (user.streakDays) data.streakDays = user.streakDays;
      if (user.hoursLearned) data.hoursLearned = user.hoursLearned;
      localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Sync student data error:', e);
    }
  }

  function login(email, password, rememberMe = true) {
    const users = getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (matchedUser.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Check your credentials or use quick demo fill.' };
    }

    // Set as active user
    setCurrentUser(matchedUser);

    if (rememberMe) {
      try {
        localStorage.setItem('vj_lms_remember_email', cleanEmail);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('vj_lms_remember_email');
      } catch (e) {}
    }

    return { success: true, user: matchedUser };
  }

  function signup({ name, email, password, role, track }) {
    const users = getUsers();
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check email uniqueness
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    // Avatars generator
    const avatarSeeds = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    ];
    const randomAvatar = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];

    const newUser = {
      id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: role || 'Fellow Software Architect',
      track: track || 'Distributed Systems & Full-Stack Architecture',
      avatar: randomAvatar,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      streakDays: 1,
      hoursLearned: 0.0
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    // Return status
    return { success: true };
  }

  function resetPassword(email, newPassword) {
    const users = getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (idx === -1) {
      return { success: false, error: 'Email address not found in system.' };
    }
    users[idx].password = newPassword || 'password123';
    saveUsers(users);
    return { success: true, message: 'Password has been successfully updated.' };
  }

  // Theme Sync Helper
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    return next;
  }

  // Expose to window
  window.VJAuth = {
    getUsers,
    getCurrentUser,
    setCurrentUser,
    login,
    signup,
    logout,
    resetPassword,
    initTheme,
    toggleTheme,
    DEFAULT_USERS
  };

  // Auto-init theme
  initTheme();
})();
