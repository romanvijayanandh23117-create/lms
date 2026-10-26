// CraftStudio LMS - Client Application Logic
// Handcrafted with persistent state, real-time feedback, and interactive features.

(function () {
  'use strict';

  // State keys
  const STORAGE_KEY = 'craftstudio_student_data_v1';
  const THEME_KEY = 'craftstudio_theme_pref';
  const CUSTOM_COURSES_KEY = 'craftstudio_custom_courses_v1';

  // Load any user-created custom courses into COURSES_DATA
  loadCustomCourses();

  // Load or initialize state
  let studentData = loadStudentData();
  let currentCourse = COURSES_DATA.find(c => c.id === 'python-skills') || COURSES_DATA[0];
  let currentLesson = currentCourse.modules[0].lessons[0];
  let currentView = 'dashboard';
  let isVideoPlaying = false;
  let videoCurrentSeconds = 0;
  let videoTotalSeconds = 1530; // 25:30
  let videoTimer = null;
  let currentQuizCourse = currentCourse;
  let currentQuizIndex = 0;
  let quizAnswers = {};

  // DOM Elements
  const dom = {
    // Nav items
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    globalSearchInput: document.getElementById('global-search-input'),
    dailyFocusDisplay: document.getElementById('daily-focus-display'),
    editFocusBtn: document.getElementById('edit-focus-btn'),
    
    // Dashboard elements
    heroUserName: document.getElementById('hero-user-name'),
    sidebarUserName: document.getElementById('sidebar-user-name'),
    sidebarAvatar: document.getElementById('sidebar-avatar'),
    streakCounter: document.getElementById('streak-counter'),
    statHours: document.getElementById('stat-hours'),
    statCompletedLessons: document.getElementById('stat-completed-lessons'),
    statCertsCount: document.getElementById('stat-certs-count'),
    dashboardCoursesGrid: document.getElementById('dashboard-courses-grid'),
    badgesContainer: document.getElementById('badges-container'),
    btnViewAllCourses: document.getElementById('btn-view-all-courses'),

    // Player elements
    videoTheater: document.getElementById('video-theater-elem'),
    videoScreenLayer: document.getElementById('video-screen-layer'),
    playerLessonTitle: document.getElementById('player-lesson-title'),
    playerInstructorLabel: document.getElementById('player-instructor-label'),
    btnCenterPlay: document.getElementById('btn-center-play'),
    btnPlayToggle: document.getElementById('btn-play-toggle'),
    btnReplay10: document.getElementById('btn-replay-10'),
    btnForward10: document.getElementById('btn-forward-10'),
    playerTimeDisplay: document.getElementById('player-time-display'),
    timelineScrubber: document.getElementById('timeline-scrubber'),
    timelineFill: document.getElementById('timeline-fill'),
    speedSelect: document.getElementById('playback-speed-select'),
    btnVolumeToggle: document.getElementById('btn-volume-toggle'),
    btnTheaterToggle: document.getElementById('btn-theater-toggle'),

    // Player tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane-content'),
    lessonNotesContent: document.getElementById('lesson-notes-content'),
    lessonCodeContent: document.getElementById('lesson-code-content'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    studentScratchpad: document.getElementById('student-scratchpad'),
    scratchpadStatus: document.getElementById('scratchpad-status'),
    resourcesListContent: document.getElementById('resources-list-content'),
    qaThreadContainer: document.getElementById('qa-thread-container'),
    qaInputMsg: document.getElementById('qa-input-msg'),
    btnSubmitQa: document.getElementById('btn-submit-qa'),

    // Curriculum sidebar
    curriculumCourseName: document.getElementById('curriculum-course-name'),
    curriculumProgressStat: document.getElementById('curriculum-progress-stat'),
    curriculumModulesWrapper: document.getElementById('curriculum-modules-wrapper'),
    btnLaunchQuizFromPlayer: document.getElementById('btn-launch-quiz-from-player'),

    // Quiz elements
    quizCoursePills: document.getElementById('quiz-course-pills'),
    quizInProgressState: document.getElementById('quiz-in-progress-state'),
    quizResultState: document.getElementById('quiz-result-state'),
    quizCourseTag: document.getElementById('quiz-course-tag'),
    quizMainTitle: document.getElementById('quiz-main-title'),
    quizStepCounter: document.getElementById('quiz-step-counter'),
    quizQuestionText: document.getElementById('quiz-question-text'),
    quizOptionsContainer: document.getElementById('quiz-options-container'),
    quizFeedbackDisplay: document.getElementById('quiz-feedback-display'),
    btnQuizPrev: document.getElementById('btn-quiz-prev'),
    btnCheckAnswer: document.getElementById('btn-check-answer'),
    btnQuizNext: document.getElementById('btn-quiz-next'),
    resultScoreBadge: document.getElementById('result-score-badge'),
    resultHeadingText: document.getElementById('result-heading-text'),
    resultSubText: document.getElementById('result-sub-text'),
    btnRetryQuiz: document.getElementById('btn-retry-quiz'),
    btnClaimCert: document.getElementById('btn-claim-cert'),

    // Certificates elements
    certificatesDisplayContainer: document.getElementById('certificates-display-container'),
    btnPrintCertificate: document.getElementById('btn-print-certificate'),

    // Catalog elements
    filterChips: document.querySelectorAll('.filter-chip'),
    catalogCoursesContainer: document.getElementById('catalog-courses-container'),
    btnTopAddCourse: document.getElementById('btn-top-add-course'),
    btnOpenAddCourseModal: document.getElementById('btn-open-add-course-modal'),

    // Add Course Modal Elements
    addCourseModal: document.getElementById('add-course-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    addCourseForm: document.getElementById('add-course-form'),

    // Toast
    toast: document.getElementById('toast-notification'),
    toastIcon: document.getElementById('toast-icon'),
    toastMessage: document.getElementById('toast-message'),
    btnQuickNotes: document.getElementById('btn-quick-notes'),
    profileStripBtn: document.getElementById('profile-strip-btn')
  };

  // -------------------------------------------------------------
  // Initialization & Custom Course Persistence
  // -------------------------------------------------------------
  function loadCustomCourses() {
    try {
      const saved = localStorage.getItem(CUSTOM_COURSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(course => {
            if (!COURSES_DATA.some(c => c.id === course.id)) {
              COURSES_DATA.push(course);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Storage load error for custom courses:", e);
    }
  }

  function saveCustomCourse(newCourse) {
    try {
      const saved = localStorage.getItem(CUSTOM_COURSES_KEY);
      let list = saved ? JSON.parse(saved) : [];
      list = list.filter(c => c.id !== newCourse.id);
      list.push(newCourse);
      localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Storage save error for custom course:", e);
    }
  }

  function init() {
    initTheme();
    bindEvents();
    renderAllViews();
    renderLesson(currentLesson);
  }

  function loadStudentData() {
    let data = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        data = JSON.parse(saved);
        if (data.email && data.email.includes('craftstudio.dev')) {
          data.email = 'vijay.anand@vjinstitute.edu';
        }
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    if (!data) {
      data = JSON.parse(JSON.stringify(INITIAL_STUDENT_PROFILE));
    }
    // Ensure all critical collections exist even if stale localStorage was loaded
    if (!Array.isArray(data.completedLessons)) data.completedLessons = [...INITIAL_STUDENT_PROFILE.completedLessons];
    if (!Array.isArray(data.certificates)) data.certificates = [...INITIAL_STUDENT_PROFILE.certificates];
    if (!Array.isArray(data.badges)) data.badges = [...INITIAL_STUDENT_PROFILE.badges];
    if (!data.personalNotes) data.personalNotes = { ...INITIAL_STUDENT_PROFILE.personalNotes };

    // Sync with active user from VJAuth if available
    if (typeof VJAuth !== 'undefined') {
      const active = VJAuth.getCurrentUser();
      if (active) {
        data.name = active.name;
        data.email = active.email;
        data.title = active.role || data.title;
        if (active.avatar) data.avatar = active.avatar;
      }
    }
    return data;
  }

  function saveStudentData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studentData));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  function showToast(message, icon = '⚡') {
    dom.toastIcon.textContent = icon;
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('show');
    setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2800);
  }

  // -------------------------------------------------------------
  // Theme Management
  // -------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    dom.themeIcon.textContent = nextTheme === 'dark' ? '🌙' : '☀️';
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Blue Studio'}`, nextTheme === 'dark' ? '🌙' : '☀️');
  }

  // -------------------------------------------------------------
  // Navigation & View Routing
  // -------------------------------------------------------------
  function switchView(viewName) {
    currentView = viewName;

    // Update Sidebar Active Class
    dom.navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update View Sections
    dom.viewSections.forEach(section => {
      if (section.id === `${viewName}-view`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Specific View Refreshes
    if (viewName === 'dashboard') {
      renderDashboard();
    } else if (viewName === 'certificates') {
      renderCertificates();
    } else if (viewName === 'catalog') {
      renderCatalog();
    } else if (viewName === 'quizzes') {
      loadQuiz(currentCourse);
    }
  }

  // -------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------
  function bindEvents() {
    // Navigation buttons
    dom.navItems.forEach(item => {
      item.addEventListener('click', () => switchView(item.dataset.view));
    });

    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    // Daily Focus editing
    dom.editFocusBtn.addEventListener('click', () => {
      const currentGoal = studentData.dailyFocus || dom.dailyFocusDisplay.textContent.replace(/^"|"$/g, '').trim();
      const newGoal = prompt("Update your focus / study milestone for today:", currentGoal);
      if (newGoal && newGoal.trim()) {
        studentData.dailyFocus = newGoal.trim();
        dom.dailyFocusDisplay.textContent = `"${newGoal.trim()}"`;
        saveStudentData();
        showToast("Daily focus goal updated!", "🎯");
      }
    });

    // View All Courses click from Dashboard
    dom.btnViewAllCourses.addEventListener('click', () => switchView('catalog'));

    // Video Player events
    dom.btnCenterPlay.addEventListener('click', togglePlayState);
    dom.btnPlayToggle.addEventListener('click', togglePlayState);
    dom.btnReplay10.addEventListener('click', () => seekVideo(-10));
    dom.btnForward10.addEventListener('click', () => seekVideo(10));
    dom.timelineScrubber.addEventListener('click', handleTimelineClick);
    dom.speedSelect.addEventListener('change', (e) => {
      showToast(`Playback speed set to ${e.target.value}x`, "⚡");
    });
    dom.btnVolumeToggle.addEventListener('click', () => {
      const isMuted = dom.btnVolumeToggle.textContent === '🔇';
      dom.btnVolumeToggle.textContent = isMuted ? '🔊' : '🔇';
      showToast(isMuted ? "Audio Unmuted" : "Audio Muted", isMuted ? "🔊" : "🔇");
    });
    dom.btnTheaterToggle.addEventListener('click', () => {
      dom.videoTheater.classList.toggle('theater-mode');
      showToast("Toggled Theater View Mode", "⛶");
    });

    // Player Tabs switching
    dom.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.tabBtns.forEach(b => b.classList.remove('active'));
        dom.tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.tab;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Copy Code Snippet
    dom.btnCopyCode.addEventListener('click', () => {
      if (currentLesson && currentLesson.codeSnippet) {
        navigator.clipboard.writeText(currentLesson.codeSnippet).then(() => {
          showToast("Code snippet copied to clipboard!", "📋");
        }).catch(() => {
          showToast("Copied to clipboard", "📋");
        });
      }
    });

    // Personal Scratchpad Autosave
    let scratchpadTimer;
    dom.studentScratchpad.addEventListener('input', () => {
      dom.scratchpadStatus.textContent = 'Saving changes...';
      clearTimeout(scratchpadTimer);
      scratchpadTimer = setTimeout(() => {
        if (!studentData.personalNotes) studentData.personalNotes = {};
        studentData.personalNotes[currentLesson.id] = dom.studentScratchpad.value;
        saveStudentData();
        dom.scratchpadStatus.textContent = '✓ Saved to local memory just now';
      }, 600);
    });

    // Quick notes button in header
    dom.btnQuickNotes.addEventListener('click', () => {
      switchView('player');
      const scratchTab = document.querySelector('[data-tab="tab-scratchpad"]');
      if (scratchTab) scratchTab.click();
      dom.studentScratchpad.focus();
    });

    // User profile strip click
    dom.profileStripBtn.addEventListener('click', () => {
      switchView('dashboard');
    });

    // Community Q&A submit
    dom.btnSubmitQa.addEventListener('click', submitQaQuestion);
    dom.qaInputMsg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQaQuestion();
    });

    // Player sidebar Quiz Launch
    dom.btnLaunchQuizFromPlayer.addEventListener('click', () => {
      loadQuiz(currentCourse);
      switchView('quizzes');
    });

    // Quiz action buttons
    dom.btnQuizPrev.addEventListener('click', () => {
      if (currentQuizIndex > 0) {
        currentQuizIndex--;
        renderQuizQuestion();
      }
    });
    dom.btnQuizNext.addEventListener('click', handleQuizNext);
    dom.btnCheckAnswer.addEventListener('click', checkCurrentAnswer);
    dom.btnRetryQuiz.addEventListener('click', () => {
      quizAnswers = {};
      currentQuizIndex = 0;
      dom.quizResultState.style.display = 'none';
      dom.quizInProgressState.style.display = 'block';
      renderQuizQuestion();
    });
    dom.btnClaimCert.addEventListener('click', () => {
      claimCertificate(currentQuizCourse);
      switchView('certificates');
    });

    // Print Certificate
    dom.btnPrintCertificate.addEventListener('click', () => {
      window.print();
    });

    // Catalog Filter Chips
    dom.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderCatalog(chip.dataset.category);
      });
    });

    // Global Search Bar Debounce
    let searchTimeout;
    dom.globalSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim().toLowerCase();
      searchTimeout = setTimeout(() => {
        if (query.length > 0) {
          switchView('catalog');
          renderCatalog('all', query);
        } else {
          renderCatalog('all');
        }
      }, 250);
    });

    // Add Course Modal Triggers
    if (dom.btnTopAddCourse) {
      dom.btnTopAddCourse.addEventListener('click', openAddCourseModal);
    }
    if (dom.btnOpenAddCourseModal) {
      dom.btnOpenAddCourseModal.addEventListener('click', openAddCourseModal);
    }
    if (dom.btnCloseModal) {
      dom.btnCloseModal.addEventListener('click', closeAddCourseModal);
    }
    if (dom.btnCancelModal) {
      dom.btnCancelModal.addEventListener('click', closeAddCourseModal);
    }
    if (dom.addCourseModal) {
      dom.addCourseModal.addEventListener('click', (e) => {
        if (e.target === dom.addCourseModal) closeAddCourseModal();
      });
    }
    if (dom.addCourseForm) {
      dom.addCourseForm.addEventListener('submit', handleCreateCourseSubmit);
    }

    // User Profile Modal Open & Close
    if (dom.profileStripBtn) {
      dom.profileStripBtn.addEventListener('click', openProfileModal);
    }
    const btnCloseProfile = document.getElementById('btn-close-profile-modal');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', closeProfileModal);
    }
    const btnCloseProfileFooter = document.getElementById('btn-close-profile-modal-footer');
    if (btnCloseProfileFooter) {
      btnCloseProfileFooter.addEventListener('click', closeProfileModal);
    }
    const userProfileModal = document.getElementById('user-profile-modal');
    if (userProfileModal) {
      userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) closeProfileModal();
      });
    }

    // Modal Logout
    const btnModalLogout = document.getElementById('btn-modal-logout');
    if (btnModalLogout) {
      btnModalLogout.addEventListener('click', () => {
        if (typeof VJAuth !== 'undefined') {
          VJAuth.logout();
        }
        showToast('Signed out of VJ Institute', '👋');
        closeProfileModal();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 500);
      });
    }
  }

  // -------------------------------------------------------------
  // Add Course Modal Dialog Logic
  // -------------------------------------------------------------
  function openAddCourseModal() {
    if (dom.addCourseModal) {
      dom.addCourseModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const titleInput = document.getElementById('new-course-title');
      if (titleInput) {
        titleInput.focus();
        titleInput.select();
      }
    }
  }

  function closeAddCourseModal() {
    if (dom.addCourseModal) {
      dom.addCourseModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function handleCreateCourseSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-course-title').value.trim();
    const category = document.getElementById('new-course-category').value;
    const level = document.getElementById('new-course-level').value;
    const duration = document.getElementById('new-course-duration').value.trim() || '12h 00m';
    const badge = document.getElementById('new-course-badge').value.trim() || 'New';
    const instructorName = document.getElementById('new-course-instructor').value.trim();
    const instructorRole = document.getElementById('new-course-role').value.trim() || 'Principal Faculty & Engineer';
    const desc = document.getElementById('new-course-desc').value.trim();
    const modTitle = document.getElementById('new-course-module-title').value.trim() || 'Module 1: Foundations & Architecture';
    const lessonTitle = document.getElementById('new-course-lesson-title').value.trim() || '1.1 Core Architecture & Hands-on Setup';
    const codeSnippet = document.getElementById('new-course-code').value.trim() || '# Production implementation snippet';

    if (!title || !instructorName || !desc) {
      showToast('Please fill out all required fields', '⚠️');
      return;
    }

    const courseId = `course-${Date.now().toString(36)}`;
    const lessonId = `les-${Date.now().toString(36)}`;

    const newCourse = {
      id: courseId,
      title: title,
      shortDescription: desc,
      category: category,
      level: level,
      duration: duration,
      totalLessons: 12,
      rating: 4.98,
      reviewsCount: 1,
      instructor: {
        name: instructorName,
        role: instructorRole,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        bio: `${instructorRole} specializing in production engineering.`
      },
      badge: badge,
      accentColor: "#38bdf8",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
      enrolled: true,
      modules: [
        {
          id: `mod-${Date.now().toString(36)}`,
          title: modTitle,
          lessons: [
            {
              id: lessonId,
              title: lessonTitle,
              duration: "25:30",
              type: "video",
              completed: false,
              summary: desc,
              notes: `### ${title} - Curriculum Notes\n- Comprehensive technical foundation on ${modTitle}.\n- Production principles, performance insights, and best practices.\n- Architected for resilient scale.`,
              codeSnippet: codeSnippet,
              resources: [
                { name: `${title} Architecture Guide (PDF)`, size: "1.4 MB" }
              ]
            }
          ]
        }
      ],
      quiz: {
        id: `quiz-${courseId}`,
        title: `${title} Assessment`,
        description: `Verify your mastery of key concepts taught in ${title}.`,
        passingScore: 80,
        questions: [
          {
            id: `q-${Date.now().toString(36)}-1`,
            question: `What is the primary technical objective emphasized in ${title}?`,
            options: [
              "Building robust, decoupled, and highly performant production systems",
              "Skipping all test cases to ship faster",
              "Hardcoding secrets in source control",
              "Never monitoring production errors"
            ],
            correctIndex: 0,
            explanation: "High-scale engineering demands resilient architecture, thoughtful boundary decoupling, and rigorous performance profiling."
          }
        ]
      }
    };

    // Append and persist
    COURSES_DATA.push(newCourse);
    saveCustomCourse(newCourse);
    closeAddCourseModal();
    renderAllViews();
    showToast(`Masterclass "${title}" published!`, '🚀');

    // Switch to course
    currentCourse = newCourse;
    currentLesson = newCourse.modules[0].lessons[0];
    renderLesson(currentLesson);
    switchView('player');
  }

  // -------------------------------------------------------------
  // User Profile & Authentication Modal Logic
  // -------------------------------------------------------------
  function updateProfileModal() {
    const active = (typeof VJAuth !== 'undefined') ? VJAuth.getCurrentUser() : null;
    const nameEl = document.getElementById('modal-user-name');
    const emailEl = document.getElementById('modal-user-email');
    const roleEl = document.getElementById('modal-user-role-badge');
    const trackEl = document.getElementById('modal-user-track');
    const avatarEl = document.getElementById('modal-user-avatar');
    const sinceEl = document.getElementById('modal-user-since');

    if (active) {
      if (nameEl) nameEl.textContent = active.name;
      if (emailEl) emailEl.textContent = active.email;
      if (roleEl) roleEl.textContent = active.role || 'Principal Fellow';
      if (trackEl) trackEl.textContent = `Track: ${active.track || 'Distributed Systems & Architecture'}`;
      if (avatarEl && active.avatar) avatarEl.src = active.avatar;
      if (sinceEl) sinceEl.textContent = active.memberSince || 'October 2026';
    }
  }

  function openProfileModal() {
    updateProfileModal();
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function renderHeaderAuthState() {
    const container = document.getElementById('header-auth-container');
    if (!container) return;
    const active = (typeof VJAuth !== 'undefined') ? VJAuth.getCurrentUser() : null;
    if (active) {
      container.innerHTML = `
        <button class="btn-secondary" id="btn-header-profile" style="padding: 6px 14px; font-size: 0.82rem; border-radius: var(--radius-full); display:flex; align-items:center; gap:8px;" title="View Fellowship Profile & Settings">
          <img src="${active.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" style="width:22px; height:22px; border-radius:50%; object-fit:cover; border:1px solid var(--brand-primary);" alt="Avatar">
          <span>${active.name.split(' ')[0]}</span>
          <span style="font-size:0.65rem; opacity:0.6;">▼</span>
        </button>
        <a href="login.html" class="btn-secondary" title="Switch User or Log In" style="padding: 6px 11px; font-size: 0.82rem; border-radius: var(--radius-full); text-decoration:none;">
          <span>🔄</span>
        </a>
      `;
      const pBtn = document.getElementById('btn-header-profile');
      if (pBtn) pBtn.addEventListener('click', openProfileModal);
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn-secondary" id="btn-header-login" style="padding: 7px 14px; font-size: 0.82rem; border-radius: var(--radius-full); text-decoration:none;">
          <span>🔑 Sign In</span>
        </a>
        <a href="signup.html" class="btn-primary" id="btn-header-signup" style="padding: 7px 15px; font-size: 0.82rem; border-radius: var(--radius-full); text-decoration:none;">
          <span>✨ Sign Up</span>
        </a>
      `;
    }
  }

  // -------------------------------------------------------------
  // Data Rendering Routines
  // -------------------------------------------------------------
  function renderAllViews() {
    renderDashboard();
    renderCertificates();
    renderCatalog();
    renderQuizPills();
    if (studentData.dailyFocus) {
      dom.dailyFocusDisplay.textContent = `"${studentData.dailyFocus}"`;
    }
  }

  // Render Dashboard
  function renderDashboard() {
    dom.heroUserName.textContent = studentData.name.split(' ')[0];
    dom.sidebarUserName.textContent = studentData.name;
    if (studentData.avatar && dom.sidebarAvatar) {
      dom.sidebarAvatar.src = studentData.avatar;
    }
    dom.streakCounter.textContent = `${studentData.streakDays} Days Velocity`;
    dom.statHours.textContent = `${studentData.hoursLearned}h`;
    dom.statCompletedLessons.textContent = studentData.completedLessons.length;
    dom.statCertsCount.textContent = studentData.certificates.length;

    renderHeaderAuthState();

    // Render active courses
    dom.dashboardCoursesGrid.innerHTML = '';
    const enrolledCourses = COURSES_DATA.filter(c => c.enrolled);

    enrolledCourses.forEach(course => {
      const card = createCourseCard(course);
      dom.dashboardCoursesGrid.appendChild(card);
    });

    // Render badges
    dom.badgesContainer.innerHTML = '';
    studentData.badges.forEach(b => {
      const bElem = document.createElement('div');
      bElem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        padding: 12px 18px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
      `;
      bElem.innerHTML = `
        <div style="font-size:1.8rem;">${b.icon}</div>
        <div>
          <div style="font-size:0.88rem; font-weight:700; color:var(--text-primary);">${b.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${b.desc}</div>
        </div>
      `;
      dom.badgesContainer.appendChild(bElem);
    });
  }

  function calculateCourseProgress(course) {
    let total = 0;
    let completed = 0;
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        total++;
        if (studentData.completedLessons.includes(l.id)) {
          completed++;
        }
      });
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  function createCourseCard(course) {
    const { total, completed, percentage } = calculateCourseProgress(course);
    const card = document.createElement('div');
    card.className = 'course-progress-card';

    card.innerHTML = `
      <div class="card-banner" style="background-image: url('${course.thumbnail}');">
        <span class="card-badge">${course.badge}</span>
        <span class="card-category-tag">${course.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${course.title}</h3>
        <div class="card-instructor">
          <img src="${course.instructor.avatar}" alt="${course.instructor.name}" class="card-inst-img">
          <span class="card-inst-name">${course.instructor.name} &bull; ${course.instructor.role.split('&')[0]}</span>
        </div>
        
        <div class="progress-container">
          <div class="progress-meta">
            <span>Course Progress</span>
            <span>${percentage}% (${completed}/${total} lessons)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>

        <div class="card-footer-action">
          <button class="btn-primary btn-resume-course" style="width:100%;">
            <span>Resume Learning &rarr;</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-resume-course').addEventListener('click', () => {
      currentCourse = course;
      // pick first incomplete or first lesson
      let nextLesson = null;
      for (const m of course.modules) {
        for (const l of m.lessons) {
          if (!studentData.completedLessons.includes(l.id)) {
            nextLesson = l;
            break;
          }
        }
        if (nextLesson) break;
      }
      currentLesson = nextLesson || course.modules[0].lessons[0];
      renderLesson(currentLesson);
      switchView('player');
    });

    return card;
  }

  // -------------------------------------------------------------
  // Lesson & Player Engine
  // -------------------------------------------------------------
  function renderLesson(lesson) {
    currentLesson = lesson;

    // Title & info
    dom.playerLessonTitle.textContent = lesson.title;
    dom.playerInstructorLabel.textContent = `Instructor: ${currentCourse.instructor.name} • ${currentCourse.instructor.role}`;

    // Markdown Notes
    dom.lessonNotesContent.innerHTML = parseSimpleMarkdown(lesson.notes || lesson.summary);

    // Code Snippet
    dom.lessonCodeContent.textContent = lesson.codeSnippet || '// No code snippet required for this lesson concept.';

    // Personal Scratchpad
    dom.studentScratchpad.value = (studentData.personalNotes && studentData.personalNotes[lesson.id]) || '';
    dom.scratchpadStatus.textContent = '✓ Saved in local memory';

    // Resources List
    dom.resourcesListContent.innerHTML = '';
    if (lesson.resources && lesson.resources.length > 0) {
      lesson.resources.forEach(r => {
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.innerHTML = `
          <div class="resource-info">
            <span class="resource-icon">📁</span>
            <div>
              <div class="resource-name">${r.name}</div>
              <div class="resource-size">${r.size} &bull; Verified Asset</div>
            </div>
          </div>
          <button class="resource-dl-btn">Download</button>
        `;
        item.querySelector('.resource-dl-btn').addEventListener('click', () => {
          showToast(`Simulated download: ${r.name}`, "⬇️");
        });
        dom.resourcesListContent.appendChild(item);
      });
    } else {
      dom.resourcesListContent.innerHTML = '<p style="color:var(--text-muted); font-size:0.88rem;">No downloadable assets for this lecture.</p>';
    }

    // Curriculum Sidebar Playlist
    renderCurriculumSidebar();

    // Reset video scrubber simulation
    videoCurrentSeconds = 0;
    updateVideoTimeDisplay();
  }

  function renderCurriculumSidebar() {
    dom.curriculumCourseName.textContent = currentCourse.title;
    const { total, completed, percentage } = calculateCourseProgress(currentCourse);
    dom.curriculumProgressStat.textContent = `${completed} of ${total} lessons completed (${percentage}%)`;

    dom.curriculumModulesWrapper.innerHTML = '';

    currentCourse.modules.forEach(mod => {
      const group = document.createElement('div');
      group.className = 'curriculum-module-group';

      const modHeader = document.createElement('div');
      modHeader.className = 'module-header';
      modHeader.textContent = mod.title;
      group.appendChild(modHeader);

      const ul = document.createElement('ul');
      ul.className = 'lesson-nav-list';

      mod.lessons.forEach(l => {
        const isCompleted = studentData.completedLessons.includes(l.id);
        const isActive = currentLesson && currentLesson.id === l.id;

        const li = document.createElement('li');
        li.className = `lesson-nav-item ${isActive ? 'active' : ''}`;

        li.innerHTML = `
          <button class="lesson-check-btn ${isCompleted ? 'checked' : ''}" title="${isCompleted ? 'Mark uncompleted' : 'Mark completed'}">
            ${isCompleted ? '✓' : ''}
          </button>
          <div class="lesson-nav-info">
            <div class="lesson-nav-title">${l.title}</div>
            <div class="lesson-nav-duration">⏱ ${l.duration}</div>
          </div>
        `;

        // Lesson click
        li.querySelector('.lesson-nav-info').addEventListener('click', () => {
          renderLesson(l);
        });

        // Checkbox toggle
        const checkBtn = li.querySelector('.lesson-check-btn');
        checkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLessonCompletion(l.id);
        });

        ul.appendChild(li);
      });

      group.appendChild(ul);
      dom.curriculumModulesWrapper.appendChild(group);
    });
  }

  function toggleLessonCompletion(lessonId) {
    const idx = studentData.completedLessons.indexOf(lessonId);
    if (idx > -1) {
      studentData.completedLessons.splice(idx, 1);
      showToast("Lesson marked incomplete", "⚪");
    } else {
      studentData.completedLessons.push(lessonId);
      showToast("Lesson completed! Progress updated.", "✅");
    }
    saveStudentData();
    renderCurriculumSidebar();
    renderDashboard();
  }

  function togglePlayState() {
    isVideoPlaying = !isVideoPlaying;
    if (isVideoPlaying) {
      dom.videoScreenLayer.classList.add('is-playing');
      dom.btnPlayToggle.textContent = '⏸';
      dom.btnCenterPlay.textContent = '⏸';
      dom.btnCenterPlay.style.opacity = '0.3';
      showToast("Playing lecture stream...", "▶️");
      startVideoTicker();
    } else {
      dom.videoScreenLayer.classList.remove('is-playing');
      dom.btnPlayToggle.textContent = '▶';
      dom.btnCenterPlay.textContent = '▶';
      dom.btnCenterPlay.style.opacity = '1';
      clearInterval(videoTimer);
    }
  }

  function startVideoTicker() {
    clearInterval(videoTimer);
    videoTimer = setInterval(() => {
      if (videoCurrentSeconds < videoTotalSeconds) {
        videoCurrentSeconds += 1;
        updateVideoTimeDisplay();
      } else {
        togglePlayState();
        showToast("Lesson completed!", "🎉");
        if (!studentData.completedLessons.includes(currentLesson.id)) {
          toggleLessonCompletion(currentLesson.id);
        }
      }
    }, 1000);
  }

  function seekVideo(seconds) {
    videoCurrentSeconds = Math.max(0, Math.min(videoTotalSeconds, videoCurrentSeconds + seconds));
    updateVideoTimeDisplay();
    showToast(`Seeked ${seconds > 0 ? '+' : ''}${seconds}s`, "⏩");
  }

  function handleTimelineClick(e) {
    const rect = dom.timelineScrubber.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoCurrentSeconds = Math.round(clickRatio * videoTotalSeconds);
    updateVideoTimeDisplay();
  }

  function updateVideoTimeDisplay() {
    const format = (sec) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    dom.playerTimeDisplay.textContent = `${format(videoCurrentSeconds)} / ${format(videoTotalSeconds)}`;
    const pct = (videoCurrentSeconds / videoTotalSeconds) * 100;
    dom.timelineFill.style.width = `${pct}%`;
  }

  function submitQaQuestion() {
    const msg = dom.qaInputMsg.value.trim();
    if (!msg) return;

    // Append user question
    const userItem = document.createElement('div');
    userItem.className = 'qa-item';
    userItem.innerHTML = `
      <div class="qa-author">
        <img src="${studentData.avatar}" alt="${studentData.name}" class="qa-avatar">
        <span class="qa-name">${studentData.name}</span>
        <span class="qa-tag">You</span>
      </div>
      <div class="qa-text">${escapeHtml(msg)}</div>
    `;
    dom.qaThreadContainer.appendChild(userItem);
    dom.qaInputMsg.value = '';

    // Simulate realistic mentor response after 1 second
    setTimeout(() => {
      const replyItem = document.createElement('div');
      replyItem.className = 'qa-item';
      replyItem.style.borderLeft = '3px solid var(--accent-emerald)';
      replyItem.innerHTML = `
        <div class="qa-author">
          <img src="${currentCourse.instructor.avatar}" alt="${currentCourse.instructor.name}" class="qa-avatar">
          <span class="qa-name">${currentCourse.instructor.name} (Instructor)</span>
          <span class="qa-tag" style="background:rgba(16,185,129,0.15); color:var(--accent-emerald);">Mentor Reply</span>
        </div>
        <div class="qa-text">
          "Terrific question, ${studentData.name.split(' ')[0]}! In production scenarios, always monitor your p99 latencies when tweaking this threshold. If you'd like, jump into our upcoming live architecture review room this Friday!"
        </div>
      `;
      dom.qaThreadContainer.appendChild(replyItem);
      dom.qaThreadContainer.scrollTop = dom.qaThreadContainer.scrollHeight;
      showToast("Mentor Arjun Mehta replied to your question!", "💬");
    }, 1200);
  }

  // -------------------------------------------------------------
  // Quiz & Assessment Engine
  // -------------------------------------------------------------
  function loadQuiz(course) {
    if (!course || !course.quiz) {
      course = COURSES_DATA[0];
    }
    currentQuizCourse = course;
    currentQuizIndex = 0;
    quizAnswers = {};

    dom.quizCourseTag.textContent = course.title;
    dom.quizMainTitle.textContent = course.quiz.title;
    dom.quizResultState.style.display = 'none';
    dom.quizInProgressState.style.display = 'block';

    renderQuizPills();
    renderQuizQuestion();
  }

  function renderQuizPills() {
    if (!dom.quizCoursePills) return;
    dom.quizCoursePills.innerHTML = '';
    COURSES_DATA.forEach(course => {
      if (!course.quiz) return;
      const pill = document.createElement('button');
      const isActive = currentQuizCourse && currentQuizCourse.id === course.id;
      pill.className = `quiz-course-pill ${isActive ? 'active' : ''}`;
      // Clean short label
      const shortTitle = course.title.includes(':') ? course.title.split(':')[0] : course.title;
      pill.textContent = shortTitle;
      pill.title = course.title;
      pill.addEventListener('click', () => {
        loadQuiz(course);
      });
      dom.quizCoursePills.appendChild(pill);
    });
  }

  function renderQuizQuestion() {
    const quiz = currentQuizCourse.quiz;
    const totalQ = quiz.questions.length;
    const q = quiz.questions[currentQuizIndex];

    dom.quizStepCounter.textContent = `Question ${currentQuizIndex + 1} of ${totalQ}`;
    dom.quizQuestionText.textContent = q.question;
    dom.quizFeedbackDisplay.style.display = 'none';
    dom.quizFeedbackDisplay.className = 'quiz-feedback-box';

    // Prev / Next button states
    dom.btnQuizPrev.disabled = currentQuizIndex === 0;
    dom.btnQuizNext.textContent = currentQuizIndex === totalQ - 1 ? 'Finish Assessment &rarr;' : 'Next Question &rarr;';

    // Render Options
    dom.quizOptionsContainer.innerHTML = '';
    const selectedAnswer = quizAnswers[q.id];

    q.options.forEach((opt, idx) => {
      const label = document.createElement('label');
      label.className = `quiz-option-label ${selectedAnswer === idx ? 'selected' : ''}`;

      label.innerHTML = `
        <input type="radio" name="quiz_opt_${q.id}" class="option-radio" value="${idx}" ${selectedAnswer === idx ? 'checked' : ''}>
        <span class="option-text">${opt}</span>
      `;

      label.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option-label').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        label.querySelector('input').checked = true;
        quizAnswers[q.id] = idx;
        dom.quizFeedbackDisplay.style.display = 'none';
      });

      dom.quizOptionsContainer.appendChild(label);
    });
  }

  function checkCurrentAnswer() {
    const q = currentQuizCourse.quiz.questions[currentQuizIndex];
    const userSelected = quizAnswers[q.id];

    if (userSelected === undefined) {
      showToast("Please choose an option before verifying", "⚠️");
      return;
    }

    const isCorrect = userSelected === q.correctIndex;
    dom.quizFeedbackDisplay.style.display = 'block';

    if (isCorrect) {
      dom.quizFeedbackDisplay.className = 'quiz-feedback-box correct';
      dom.quizFeedbackDisplay.innerHTML = `<strong>✓ Correct!</strong> ${q.explanation}`;
      showToast("Spot on! Great technical understanding.", "🎉");
    } else {
      dom.quizFeedbackDisplay.className = 'quiz-feedback-box incorrect';
      dom.quizFeedbackDisplay.innerHTML = `<strong>✕ Not quite:</strong> ${q.explanation}`;
      showToast("Review the explanation above.", "💡");
    }
  }

  function handleQuizNext() {
    const q = currentQuizCourse.quiz.questions[currentQuizIndex];
    if (quizAnswers[q.id] === undefined) {
      showToast("Please select an answer to proceed", "⚠️");
      return;
    }

    const totalQ = currentQuizCourse.quiz.questions.length;
    if (currentQuizIndex < totalQ - 1) {
      currentQuizIndex++;
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const quiz = currentQuizCourse.quiz;
    let correctCount = 0;

    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    dom.quizInProgressState.style.display = 'none';
    dom.quizResultState.style.display = 'block';

    if (passed) {
      dom.resultScoreBadge.textContent = '🏆';
      dom.resultHeadingText.textContent = `Mastery Achieved! Score: ${percentage}%`;
      dom.resultSubText.textContent = `Exceptional work! You successfully passed the ${currentQuizCourse.title} assessment with ${correctCount}/${quiz.questions.length} correct answers.`;
      dom.btnClaimCert.style.display = 'inline-flex';
      showToast("Congratulations! You unlocked your verified diploma.", "🎓");
    } else {
      dom.resultScoreBadge.textContent = '📚';
      dom.resultHeadingText.textContent = `Score: ${percentage}% (Passing is ${quiz.passingScore}%)`;
      dom.resultSubText.textContent = `You got ${correctCount} out of ${quiz.questions.length} questions correct. Review the architecture lessons and retake when ready.`;
      dom.btnClaimCert.style.display = 'none';
      showToast("Keep going! You're very close to passing.", "💪");
    }
  }

  function claimCertificate(course) {
    const existing = studentData.certificates.find(c => c.courseId === course.id);
    if (!existing) {
      const newCert = {
        id: `CERT-${course.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        courseId: course.id,
        courseName: course.title,
        issueDate: "October 14, 2026",
        score: "100%",
        instructor: course.instructor.name,
        verificationHash: `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`
      };
      studentData.certificates.push(newCert);
      saveStudentData();
      showToast("Certificate added to your verified credentials portfolio!", "📜");
    }
  }

  // -------------------------------------------------------------
  // Certificates Display
  // -------------------------------------------------------------
  function renderCertificates() {
    dom.certificatesDisplayContainer.innerHTML = '';

    if (studentData.certificates.length === 0) {
      dom.certificatesDisplayContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 48px 20px; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
          <div style="font-size:3rem; margin-bottom:12px;">📜</div>
          <h3 style="font-size:1.2rem; margin-bottom:8px;">No Certificates Unlocked Yet</h3>
          <p style="color:var(--text-secondary); max-width:500px; margin:0 auto 20px auto;">
            Complete course lessons and pass the final assessment quiz with 80%+ score to earn your tamper-proof credential.
          </p>
          <button class="btn-primary" onclick="window.craftStudioSwitch('quizzes')">Take Knowledge Assessment &rarr;</button>
        </div>
      `;
      return;
    }

    studentData.certificates.forEach(cert => {
      const card = document.createElement('div');
      card.className = 'certificate-card';

      card.innerHTML = `
        <div class="cert-watermark">VJ INSTITUTE</div>
        <div class="cert-top-row">
          <div class="cert-seal">
            <img src="assets/images/vj-monogram.png" alt="VJ Seal" style="width:20px; height:20px; object-fit:contain; border-radius:4px; vertical-align:middle; margin-right:6px; display:inline-block;">
            <span>VJ INSTITUTE &bull; VERIFIED DIPLOMATIC SEAL</span>
          </div>
          <div class="cert-id-tag">ID: ${cert.id}</div>
        </div>

        <div class="cert-recipient-label">This certifies that</div>
        <div class="cert-recipient-name">${studentData.name}</div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">has demonstrated technical excellence in:</div>
        <div class="cert-course-name">${cert.courseName || cert.title || 'Production Full-Stack Architecture Mastery'}</div>

        <div class="cert-footer">
          <div>
            <div class="cert-sign-label">Issued Date</div>
            <div style="font-size:0.85rem; font-weight:600; color:#e2e8f0;">${cert.issueDate || cert.issuedDate || 'October 24, 2026'} &bull; Score: ${cert.score || '100%'}</div>
            <div style="font-size:0.7rem; font-family:var(--font-mono); color:var(--text-muted); margin-top:4px;">Hash: ${cert.verificationHash || cert.verifyHash || 'VJ-9984-LMS-2026-ARCH'}</div>
          </div>
          <div style="text-align:right;">
            <div class="cert-instructor-sign">${cert.instructor || 'Arjun Mehta'}</div>
            <div class="cert-sign-label">VJ Institute Academic Council &bull; Lead Faculty</div>
          </div>
        </div>
      `;

      dom.certificatesDisplayContainer.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Course Explorer / Catalog
  // -------------------------------------------------------------
  function renderCatalog(category = 'all', searchQuery = '') {
    dom.catalogCoursesContainer.innerHTML = '';

    const q = searchQuery.toLowerCase().trim();
    // Normalize common typos e.g. "sillk" -> "silk" or "skil" -> "skill"
    const normalizedQ = q.replace(/sillk/g, 'silk').replace(/skil\b/g, 'skill');

    const filtered = COURSES_DATA.filter(course => {
      let matchesCategory = false;
      if (category === 'all') {
        matchesCategory = true;
      } else if (category === 'Java') {
        matchesCategory = course.category === 'Java' || 
                          course.title.toLowerCase().includes('java') || 
                          (course.category && course.category.toLowerCase().includes('java'));
      } else if (category === 'Python') {
        matchesCategory = course.category === 'Python' || 
                          course.title.toLowerCase().includes('python') || 
                          (course.category && course.category.toLowerCase().includes('python'));
      } else {
        matchesCategory = course.category === category || 
                          (course.category && course.category.toLowerCase().includes(category.toLowerCase()));
      }

      const matchesSearch = !q || (
        course.title.toLowerCase().includes(q) ||
        course.title.toLowerCase().includes(normalizedQ) ||
        course.shortDescription.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(normalizedQ) ||
        course.instructor.name.toLowerCase().includes(q) ||
        course.instructor.role.toLowerCase().includes(q) ||
        (course.category && course.category.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      dom.catalogCoursesContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 48px 20px; color:var(--text-muted);">
          <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
          <h3>No matching courses found</h3>
          <p>Try searching for terms like "Redis", "Figma", "Architecture", or "RAG".</p>
        </div>
      `;
      return;
    }

    filtered.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-progress-card';

      card.innerHTML = `
        <div class="card-banner" style="background-image: url('${course.thumbnail}');">
          <span class="card-badge">${course.badge}</span>
          <span class="card-category-tag">${course.category}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${course.title}</h3>
          <p style="font-size:0.84rem; color:var(--text-secondary); line-height:1.5; margin-bottom:14px;">
            ${course.shortDescription}
          </p>

          <div class="card-instructor">
            <img src="${course.instructor.avatar}" alt="${course.instructor.name}" class="card-inst-img">
            <span class="card-inst-name">${course.instructor.name}</span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted); margin-bottom:16px; padding:10px 0; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
            <span>⏱ ${course.duration}</span>
            <span>📚 ${course.totalLessons} Lessons</span>
            <span>⭐ ${course.rating} (${course.reviewsCount})</span>
          </div>

          <button class="btn-primary btn-open-course-cta" style="width:100%;">
            ${course.enrolled ? 'Continue Course &rarr;' : 'Enroll in Masterclass &rarr;'}
          </button>
        </div>
      `;

      card.querySelector('.btn-open-course-cta').addEventListener('click', () => {
        course.enrolled = true;
        currentCourse = course;
        currentLesson = course.modules[0].lessons[0];
        renderLesson(currentLesson);
        switchView('player');
        showToast(`Loaded ${course.title}`, "🚀");
      });

      dom.catalogCoursesContainer.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function parseSimpleMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.85em;">$1</code>')
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>')
      .replace(/\n$/gim, '<br />');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Expose global switcher for inline event helpers
  window.vjInstituteSwitch = switchView;
  window.craftStudioSwitch = switchView;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
