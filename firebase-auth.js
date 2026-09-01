'use strict';

const authButton = document.getElementById('auth-button');
const guestAuthActions = document.getElementById('guest-auth-actions');
const accountName = document.getElementById('sidebar-name');
const accountStatus = document.getElementById('account-status');
const accountInitial = document.getElementById('account-initial');
const accountMenuButton = document.getElementById('account-menu-button');
const accountMenu = document.getElementById('account-menu');
const accountMenuEmail = document.getElementById('account-menu-email');
const signoutConfirm = document.getElementById('signout-confirm');
const cancelSignout = document.getElementById('cancel-signout');
const confirmSignout = document.getElementById('confirm-signout');
const authView = document.getElementById('auth-view');
const authForm = document.getElementById('account-auth-form');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const authSubmit = document.getElementById('account-auth-submit');
const googleButton = document.getElementById('google-auth-button');
const authTestButton = document.getElementById('auth-test-button');
const authTitle = document.getElementById('auth-title');
const authCopy = document.getElementById('auth-copy');
const authSwitchCopy = document.getElementById('auth-switch-copy');
const authSwitch = document.getElementById('auth-switch');
const authStatus = document.getElementById('auth-status');
let authMode = 'login';
window.luminaryFirebaseStatus = 'loading';
accountMenuButton.disabled = true;

function reportError(message) {
  window.luminaryFirebaseStatus = `error: ${message}`;
  authStatus.textContent = message;
  window.dispatchEvent(new CustomEvent('luminary:auth-error', { detail: message }));
}

function friendlyAuthError(error) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Log in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Allow pop-ups and try Google sign-in again.',
    'auth/account-exists-with-different-credential': 'This email already uses another sign-in method.'
  };
  return messages[error?.code] || 'Authorization could not be completed. Try again.';
}

function setAuthMode(mode) {
  authMode = mode === 'register' ? 'register' : 'login';
  const registering = authMode === 'register';
  authTitle.textContent = registering ? 'Create your account' : 'Welcome back';
  authCopy.textContent = registering ? 'Register to start a personal study path.' : 'Log in to continue your personal study path.';
  authSubmit.textContent = registering ? 'Register' : 'Log in';
  authSwitchCopy.textContent = registering ? 'Already have an account?' : 'New to Luminary?';
  authSwitch.textContent = registering ? 'Log in' : 'Register';
  passwordInput.autocomplete = registering ? 'new-password' : 'current-password';
  authStatus.textContent = '';
}

function showAuth(mode = 'login') {
  setAuthMode(mode);
  accountMenu.hidden = true;
  accountMenuButton.setAttribute('aria-expanded', 'false');
  authView.hidden = false;
  document.body.classList.add('is-auth-open');
  requestAnimationFrame(() => emailInput.focus());
}

function hideAuth() {
  authView.hidden = true;
  document.body.classList.remove('is-auth-open');
  authStatus.textContent = '';
  passwordInput.value = '';
}

document.querySelectorAll('[data-open-auth]').forEach((button) => {
  button.addEventListener('click', () => showAuth(button.dataset.openAuth));
});
window.addEventListener('luminary:open-auth', (event) => showAuth(event.detail?.mode || 'register'));
document.querySelectorAll('[data-close-auth]').forEach((button) => button.addEventListener('click', hideAuth));
authTestButton.addEventListener('click', () => {
  sessionStorage.setItem('luminary-test-session', '1');
  hideAuth();
});
authSwitch.addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !authView.hidden) hideAuth();
});

if (window.location.protocol === 'file:') {
  authButton.disabled = true;
  googleButton.disabled = true;
  reportError('Open Luminary through http://127.0.0.1:8012 to use authorization.');
} else if (!window.firebase) {
  authButton.disabled = true;
  googleButton.disabled = true;
  reportError('Authorization could not load.');
} else {
  const firebaseConfig = {
    apiKey: 'AIzaSyCiiu5vyNlncpNI_Fige-grgEz5_zDIWEo',
    authDomain: 'luminary-571a1.firebaseapp.com',
    projectId: 'luminary-571a1',
    storageBucket: 'luminary-571a1.firebasestorage.app',
    messagingSenderId: '857898461006',
    appId: '1:857898461006:web:1c81547bba5e6d6019e01f'
  };
  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
  const auth = app.auth();
  const persistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {
    window.luminaryFirebaseStatus = 'persistence-warning';
  });
  let activeUser = null;

  function publicUser(user) {
    if (!user) return null;
    const email = user.email || '';
    const name = user.displayName || email.split('@')[0] || 'Learner';
    return { uid: user.uid, name, email, initial: name.trim().charAt(0).toUpperCase() || 'L' };
  }

  auth.onAuthStateChanged((user) => {
    const safeUser = publicUser(user);
    activeUser = user;
    window.luminaryAuthUser = safeUser;
    window.luminaryFirebaseStatus = 'ready';
    accountName.textContent = safeUser?.name || 'Learner';
    accountStatus.textContent = safeUser?.email || 'Progress saved on this device';
    accountInitial.textContent = safeUser?.initial || 'L';
    accountMenuEmail.textContent = safeUser?.email || '';
    accountMenuButton.disabled = !user;
    accountMenuButton.setAttribute('aria-expanded', 'false');
    accountMenu.hidden = true;
    signoutConfirm.hidden = true;
    authButton.hidden = false;
    guestAuthActions.hidden = Boolean(user);
    authButton.textContent = 'Sign out';
    if (user) hideAuth();
    window.dispatchEvent(new CustomEvent('luminary:auth-state', { detail: safeUser }));
  });

  accountMenuButton.addEventListener('click', () => {
    if (!activeUser) return;
    const open = accountMenu.hidden;
    accountMenu.hidden = !open;
    accountMenuButton.setAttribute('aria-expanded', String(open));
    signoutConfirm.hidden = true;
    authButton.hidden = false;
  });

  authButton.addEventListener('click', () => {
    if (!activeUser) return;
    authButton.hidden = true;
    signoutConfirm.hidden = false;
  });

  cancelSignout.addEventListener('click', () => {
    signoutConfirm.hidden = true;
    authButton.hidden = false;
  });

  confirmSignout.addEventListener('click', async () => {
    if (!activeUser) return;
    confirmSignout.disabled = true;
    try { await auth.signOut(); }
    catch { reportError('Sign out could not be completed.'); }
    finally { confirmSignout.disabled = false; }
  });

  document.addEventListener('click', (event) => {
    if (accountMenu.hidden || accountMenu.contains(event.target) || accountMenuButton.contains(event.target)) return;
    accountMenu.hidden = true;
    accountMenuButton.setAttribute('aria-expanded', 'false');
  });

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    if (!email || password.length < 6) {
      authStatus.textContent = 'Enter your email and a password with at least 6 characters.';
      return;
    }
    authSubmit.disabled = true;
    authSubmit.textContent = authMode === 'register' ? 'Creating account...' : 'Logging in...';
    authStatus.textContent = '';
    try {
      await persistenceReady;
      if (authMode === 'register') await auth.createUserWithEmailAndPassword(email, password);
      else await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      reportError(friendlyAuthError(error));
    } finally {
      authSubmit.disabled = false;
      authSubmit.textContent = authMode === 'register' ? 'Register' : 'Log in';
    }
  });

  googleButton.addEventListener('click', async () => {
    googleButton.disabled = true;
    authStatus.textContent = '';
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await persistenceReady;
      await auth.signInWithPopup(provider);
    }
    catch (error) { reportError(friendlyAuthError(error)); }
    finally { googleButton.disabled = false; }
  });
}
