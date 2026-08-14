'use strict';

const authButton = document.getElementById('auth-button');
const accountName = document.getElementById('sidebar-name');
const accountStatus = document.getElementById('account-status');
const accountInitial = document.getElementById('account-initial');
window.luminaryFirebaseStatus = 'loading';

function reportError(message) {
  window.luminaryFirebaseStatus = `error: ${message}`;
  window.dispatchEvent(new CustomEvent('luminary:auth-error', { detail: message }));
}

if (window.location.protocol === 'file:') {
  authButton.disabled = true;
  reportError('Open Luminary through http://127.0.0.1:8012 to use Google sign-in.');
} else if (!window.firebase) {
  authButton.disabled = true;
  reportError('Google sign-in could not load.');
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
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  let activeUser = null;

  function publicUser(user) {
    return user ? { uid: user.uid, name: user.displayName || '', email: user.email || '', initial: (user.displayName || user.email || 'L').trim().charAt(0).toUpperCase() } : null;
  }

  auth.onAuthStateChanged((user) => {
    const safeUser = publicUser(user);
    activeUser = user;
    window.luminaryAuthUser = safeUser;
    window.luminaryFirebaseStatus = 'ready';
    accountName.textContent = safeUser?.name || 'Learner';
    accountStatus.textContent = safeUser?.email || 'Local profile';
    accountInitial.textContent = safeUser?.initial || 'L';
    authButton.textContent = safeUser ? 'Sign out' : 'Continue with Google';
    window.dispatchEvent(new CustomEvent('luminary:auth-state', { detail: safeUser }));
  });

  authButton.addEventListener('click', async () => {
    authButton.disabled = true;
    try {
      if (activeUser) await auth.signOut();
      else await auth.signInWithRedirect(provider);
    } catch (error) {
      reportError(error.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : 'Google sign-in could not be completed.');
    } finally {
      authButton.disabled = false;
    }
  });
}
