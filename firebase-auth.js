'use strict';

const authButton = document.getElementById('auth-button');
const accountName = document.getElementById('sidebar-name');
const accountStatus = document.getElementById('account-status');
const accountInitial = document.getElementById('account-initial');
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const emailForm = document.getElementById('email-auth-form');
const emailInput = document.getElementById('auth-email');
const emailSubmit = document.getElementById('email-auth-submit');
const authStatus = document.getElementById('auth-status');
const PENDING_EMAIL_KEY = 'luminary-pending-email';
window.luminaryFirebaseStatus = 'loading';

function reportError(message) {
  window.luminaryFirebaseStatus = `error: ${message}`;
  authStatus.textContent = message;
  window.dispatchEvent(new CustomEvent('luminary:auth-error', { detail: message }));
}

function showAuthModal(message = '') {
  authModal.hidden = false;
  authStatus.textContent = message;
  requestAnimationFrame(() => emailInput.focus());
}

function hideAuthModal() {
  authModal.hidden = true;
}

if (window.location.protocol === 'file:') {
  authButton.disabled = true;
  reportError('Open Luminary through http://127.0.0.1:8012 to link an email.');
} else if (!window.firebase) {
  authButton.disabled = true;
  reportError('Email sign-in could not load.');
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
  const completingEmailLink = auth.isSignInWithEmailLink(window.location.href);
  let activeUser = null;

  function publicUser(user) {
    if (!user) return null;
    const email = user.email || '';
    const name = user.displayName || email.split('@')[0] || 'Learner';
    return { uid: user.uid, name, email, initial: name.trim().charAt(0).toUpperCase() || 'L' };
  }

  async function finishEmailSignIn(email) {
    emailSubmit.disabled = true;
    emailSubmit.textContent = 'Linking account...';
    try {
      await auth.signInWithEmailLink(email, window.location.href);
      localStorage.removeItem(PENDING_EMAIL_KEY);
      history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
      hideAuthModal();
    } catch {
      reportError('This sign-in link is invalid or has expired. Request a new link.');
    } finally {
      emailSubmit.disabled = false;
      emailSubmit.textContent = completingEmailLink ? 'Finish linking' : 'Send sign-in link';
    }
  }

  auth.onAuthStateChanged((user) => {
    const safeUser = publicUser(user);
    activeUser = user;
    window.luminaryAuthUser = safeUser;
    window.luminaryFirebaseStatus = 'ready';
    accountName.textContent = safeUser?.name || 'Learner';
    accountStatus.textContent = safeUser?.email || 'Progress saved on this device';
    accountInitial.textContent = safeUser?.initial || 'L';
    authButton.textContent = safeUser ? 'Sign out' : 'Link email account';
    window.dispatchEvent(new CustomEvent('luminary:auth-state', { detail: safeUser }));
  });

  authButton.addEventListener('click', async () => {
    if (activeUser) {
      authButton.disabled = true;
      try { await auth.signOut(); }
      catch { reportError('Sign out could not be completed.'); }
      finally { authButton.disabled = false; }
    } else showAuthModal();
  });

  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;
    if (completingEmailLink) { await finishEmailSignIn(email); return; }
    emailSubmit.disabled = true;
    emailSubmit.textContent = 'Sending...';
    try {
      await auth.sendSignInLinkToEmail(email, { url: `${window.location.origin}${window.location.pathname}`, handleCodeInApp: true });
      localStorage.setItem(PENDING_EMAIL_KEY, email);
      authStatus.textContent = `Link sent to ${email}. Open it on this device to finish.`;
      emailInput.value = '';
    } catch {
      reportError('The sign-in email could not be sent. Check the address and try again.');
    } finally {
      emailSubmit.disabled = false;
      emailSubmit.textContent = 'Send sign-in link';
    }
  });

  authClose.addEventListener('click', hideAuthModal);
  authModal.addEventListener('click', (event) => { if (event.target === authModal) hideAuthModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideAuthModal(); });

  if (completingEmailLink) {
    const email = localStorage.getItem(PENDING_EMAIL_KEY) || '';
    if (email) finishEmailSignIn(email);
    else {
      emailSubmit.textContent = 'Finish linking';
      showAuthModal('Enter the same email address used to request this link.');
    }
  }
}
