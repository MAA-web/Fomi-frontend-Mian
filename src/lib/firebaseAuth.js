import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  getAuth, setPersistence, browserLocalPersistence
} from 'firebase/auth';
import { auth } from './firebase';



// Firebase Authentication Service
class FirebaseAuthService {
  constructor(auth) {
    this.auth = auth;
    this.currentUser = null;
    this.isInitialized = false;
    this.authStateListeners = [];
    this.initializationPromise = null; // added this to handle async initialization
  }

  // Initialize auth state listener
  // initialize() {
  //   if (this.isInitialized) return;
    
  //   console.log("Auth service initializing...");

  //   onAuthStateChanged(this.auth, (user) => {
  //     this.currentUser = user;
  //     console.log('🔄 Firebase Auth State Changed:', user ? `User: ${user.email}` : 'No user');
      
  //     // Add essential debugging
  //     if (user) {
  //       console.log('🔄 Auth State Changed:', {
  //         uid: user.uid,
  //         email: user.email,
  //         displayName: user.displayName,
  //         emailVerified: user.emailVerified
  //       });
  //     }
      
  //     // Notify all listeners
  //     this.authStateListeners.forEach(listener => {
  //       try {
  //         listener(user);
  //       } catch (error) {
  //         console.error('Error in auth state listener:', error);
  //       }
  //     });
  //   });

  //   this.isInitialized = true;
  //   console.log('🔄 Firebase Auth Service initialized');
  // }


  // Register auth state listener
  async onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }


  async initialize() {
    if (this.isInitialized) return;

    if (this.initializationPromise) { 
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = new Promise((resolve, reject) => { // Modify this line
      console.log("Auth service initializing...");

      setPersistence(this.auth, browserLocalPersistence)
        .then(() => {
          console.log("✅ Firebase Auth persistence set to LOCAL (works across tabs).");

          onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            console.log('🔄 Firebase Auth State Changed:', user ? `User: ${user.email}` : 'No user');

            // Add essential debugging
            if (user) {
              console.log('🔄 Auth State Changed:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
              });
            }
            
            // Notify all listeners
            console.log('📢 Notifying', this.authStateListeners.length, 'auth state listeners')
            this.authStateListeners.forEach(listener => {
              try {
                listener(user);
              } catch (error) {
                console.error('Error in auth state listener:', error);
              }
            });

            this.isInitialized = true;
            this.initializationPromise = null;
            resolve();
          });
        })
        .catch((err) => {
          console.error("❌ Failed to set Firebase persistence:", err);
          reject(err);
        });
    });

    return this.initializationPromise;
  }

  isReady() {
    if (this.isInitialized) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }





  // Get current user
  async getCurrentUser() {
    const user = this.currentUser;
    console.log('📋 getCurrentUser called, returning:', user ? user.email : 'null');
    return user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Register with email and password
  async registerWithEmail(email, password, displayName = null) {
    try {
              console.log('🚀 Firebase Registration:', { email, displayName: displayName || 'Not provided' });

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('Display name updated:', displayName);
        
        // Verify display name was updated
        console.log('✅ Display name updated to:', user.displayName);
        
                // Update Firebase custom claims to include displayName in ID token via backend
        // try {
        //   await this.updateFirebaseCustomClaims({ displayName });
        // } catch (claimsError) {
        //   // Custom claims update failed - will work once backend implements the endpoint
        // }
      }

      // Send email verification
      await sendEmailVerification(user);
      console.log('Email verification sent');

      console.log('Registration successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });

      // Force a token refresh to get the updated custom claims before syncing with backend
      const token = await user.getIdToken(true);
      console.log('✅ Token refreshed after registration to get custom claims');

      // Send user data to backend for database creation/update
      try {
        console.log('🔄 Syncing user data with backend...');
        
        const { firstName, lastName } = this.getNamesFromDisplayName(user.displayName);
        
        const requestBody = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          firstName: firstName,
          lastName: lastName,
          emailVerified: user.emailVerified
        };
        console.log('📤 Backend request:', { uid: user.uid, email: user.email, name: user.displayName });
        
        const backendResponse = await fetch('https://api.tarum.ai/user-service/auth/firebase/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (backendResponse.ok) {
          const responseData = await backendResponse.json();
          console.log('✅ Backend user sync SUCCESS:', responseData);
        } else {
          const errorText = await backendResponse.text();
          console.error('❌ Backend user sync FAILED');
          console.error('Status:', backendResponse.status);
          console.error('Response:', errorText);
          console.error('This endpoint will work once backend team implements it');
        }
      } catch (backendError) {
        console.error('❌ Backend user sync ERROR:', backendError);
        console.error('Network error or endpoint not available yet');
      }

      return {
        success: true,
        user: this.transformFirebaseUser(user),
        message: 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Firebase registration error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Login with email and password
  async loginWithEmail(email, password, displayName) {
    try {
              console.log('🔑 Firebase Email Login:', { email, displayName });

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log('Login successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });

      // Force a token refresh to get any custom claims that were set on the backend
      const token = await user.getIdToken(true);
      console.log('✅ Token refreshed after login to get custom claims');

      // Determine the name to send to the backend. Prioritize the name from the FE form if available.
      const nameToSend = displayName || user.displayName;

      // Send user data to backend for database update
      try {
        console.log('🔄 Syncing user data with backend...');
        
        const { firstName, lastName } = this.getNamesFromDisplayName(nameToSend);
        
        const requestBody = {
          uid: user.uid,
          email: user.email,
          name: nameToSend,
          firstName: firstName,
          lastName: lastName,
          emailVerified: user.emailVerified
        };
        
        const backendResponse = await fetch('https://api.tarum.ai/user-service/auth/firebase/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (backendResponse.ok) {
          const responseData = await backendResponse.json();
          console.log('✅ Backend user sync SUCCESS:', responseData);
        } else {
          const errorText = await backendResponse.text();
          console.error('❌ Backend user sync FAILED');
          console.error('Status:', backendResponse.status);
          console.error('Response:', errorText);
          console.error('This endpoint will work once backend team implements it');
        }
      } catch (backendError) {
        console.error('❌ Backend user sync ERROR:', backendError);
      }

      return {
        success: true,
        user: this.transformFirebaseUser(user),
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
              console.log('🔑 Firebase Google Login');

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;

      console.log('Google login successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });

      // Update custom claims with display name if it exists (for new users)
      // if (user.displayName) {
      //   try {
      //     await this.updateFirebaseCustomClaims({ displayName: user.displayName });
      //   } catch (claimsError) {
      //     // Custom claims update failed
      //   }
      // }

      // Force a token refresh to get any custom claims that were set on the backend
      const token = await user.getIdToken(true);
      console.log('✅ Token refreshed after Google login to get custom claims');

      // Send user data to backend for database creation/update
      try {
        console.log('🔄 Syncing user data with backend...');
        
        const { firstName, lastName } = this.getNamesFromDisplayName(user.displayName);
        
        const requestBody = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          firstName: firstName,
          lastName: lastName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        };
        
        const backendResponse = await fetch('https://api.tarum.ai/user-service/auth/firebase/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (backendResponse.ok) {
          const responseData = await backendResponse.json();
          console.log('✅ Backend user sync SUCCESS:', responseData);
        } else {
          const errorText = await backendResponse.text();
          console.error('❌ Backend user sync FAILED');
          console.error('Status:', backendResponse.status);
          console.error('Response:', errorText);
          console.error('This endpoint will work once backend team implements it');
        }
      } catch (backendError) {
        console.error('❌ Backend user sync ERROR:', backendError);
      }
      
      return {
        success: true,
        user: this.transformFirebaseUser(user),
        message: 'Google login successful!'
      };
    } catch (error) {
      console.error('Firebase Google login error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Logout
  async logout() {
    try {
              console.log('🚪 Firebase Logout');
      await signOut(this.auth);
      console.log('Logout successful');
      return {
        success: true,
        message: 'Logout successful!'
      };
    } catch (error) {
      console.error('Firebase logout error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

              console.log('✏️ Firebase Update Profile:', updates);

      const profileUpdates = {};
      if (updates.displayName) profileUpdates.displayName = updates.displayName;
      if (updates.photoURL) profileUpdates.photoURL = updates.photoURL;

      await updateProfile(user, profileUpdates);

      // If displayName was updated, also update custom claims on the backend
      // if (updates.displayName) {
      //   try {
      //     await this.updateFirebaseCustomClaims({ displayName: updates.displayName });
      //   } catch (claimsError) {
      //     // Custom claims update failed
      //   }
      // }
      
      // Force a token refresh to get the updated custom claims before syncing with backend
      const token = await user.getIdToken(true);
      console.log('✅ Token refreshed after profile update to get custom claims');

      // Send updated user data to backend
      try {
        const { firstName, lastName } = this.getNamesFromDisplayName(updates.displayName);
        
        const backendResponse = await fetch('https://api.tarum.ai/user-service/auth/firebase/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: updates.displayName,
            firstName: firstName,
            lastName: lastName,
            photoURL: updates.photoURL,
            emailVerified: user.emailVerified
          })
        });

        if (backendResponse.ok) {
          console.log('✅ Profile updated in backend successfully');
        } else {
          console.warn('❌ Backend profile update failed:', await backendResponse.text());
        }
      } catch (backendError) {
        console.warn('⚠️ Could not update profile in backend:', backendError);
      }

      console.log('Profile updated successfully');
      return {
        success: true,
        user: this.transformFirebaseUser(user),
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Firebase update profile error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

              console.log('🗑️ Firebase Delete Account:', user.email);

      await deleteUser(user);

      console.log('Account deleted successfully');
      return {
        success: true,
        message: 'Account deleted successfully!'
      };
    } catch (error) {
      console.error('Firebase delete account error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
              console.log('🔐 Firebase Password Reset:', email);

      await sendPasswordResetEmail(this.auth, email);

      console.log('Password reset email sent');
      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Firebase password reset error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Update Firebase custom claims via backend
  // async updateFirebaseCustomClaims(claims) {
  //   try {
  //     const user = this.currentUser;
  //     if (!user) {
  //       throw new Error('No authenticated user');
  //     }

  //     const token = await user.getIdToken();
      
  //     const response = await fetch('https://api.tarum.ai/user-service/auth/firebase/update-custom-claims', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ claims })
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('❌ Failed to update custom claims. Response:', errorText);
  //       throw new Error('Failed to update custom claims');
  //     }
      
  //     console.log('✅ Custom claims updated via backend');
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Error updating custom claims:', error);
  //     return { success: false, error: error.message };
  //   }
  // }

  // Send email verification
  async sendEmailVerification() {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

              console.log('📧 Firebase Email Verification:', user.email);

      await sendEmailVerification(user);

      console.log('Email verification sent');
      return {
        success: true,
        message: 'Email verification sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Firebase email verification error:', error);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error),
        message: this.getFirebaseErrorMessage(error)
      };
    }
  }

  // Get user ID token (for backend API calls)
  async getIdToken(forceRefresh = false) {
    try {
      const user = this.currentUser;
      if (!user) {
        return null;
      }

      const token = await user.getIdToken(forceRefresh);
      console.log('ID Token obtained:', token ? 'Present' : 'Missing');
      
      // Decode and display token contents for debugging
      if (token) {
        this.decodeAndDisplayToken(token);
      }
      
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  // Decode and display Firebase ID token contents
  decodeAndDisplayToken(token) {
    try {
      console.log('🔍 Token Analysis:', {
        length: token.length,
        preview: token.substring(0, 30) + '...'
      });
      
      // Decode the JWT token (it's a standard JWT format)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log('📋 Token Payload:', {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          emailVerified: payload.email_verified,
          displayName: payload.name || 'NOT INCLUDED',
          signInProvider: payload.firebase?.sign_in_provider
        });
        
        return payload;
      } else {
        console.log('❌ Invalid token format');
      }
    } catch (error) {
      console.error('❌ Error decoding token:', error);
    }
  }

  // Transform Firebase user to our format
  transformFirebaseUser(firebaseUser) {
    // Check if user exists AND has a valid uid
    if (!firebaseUser || !firebaseUser.uid) {
      console.log('⚠️ transformFirebaseUser: Invalid user object', firebaseUser);
      return null;
    }

    console.log('🔄 Transforming Firebase user:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified
    });

    const { firstName, lastName } = this.getNamesFromDisplayName(firebaseUser.displayName);

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || 'Unknown User',
      firstName: firstName,
      lastName: lastName,
      avatar: firebaseUser.photoURL,
      avatarUrl: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : null,
      updatedAt: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : null,
      // Default credits for new users (you can fetch from your backend)
      credits: 50,
      subscription: {
        plan: 'Free',
        credits: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      preferences: {
        defaultModel: 'default',
        theme: 'light',
        notifications: true
      }
    };
  }

  // Get user-friendly error messages
  getFirebaseErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Login was cancelled.';
      case 'auth/popup-blocked':
        return 'Login popup was blocked. Please allow popups for this site.';
      case 'auth/requires-recent-login':
        return 'This action requires recent authentication. Please log in again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  // Get user info for display
  getUserInfo() {
    const user = this.currentUser;
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || 'Unknown User',
      avatar: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null,
      lastSignIn: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null
    };
  }

  // Prepare user data for backend API calls
  async prepareUserDataForBackend() {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get the ID token for authentication
      const idToken = await user.getIdToken();
      
      // Decode token to get user information
      const tokenPayload = this.decodeAndDisplayToken(idToken);
      
      console.log('🔄 Preparing user data for backend...');
      
      // Prepare the data structure for your backend
      const userDataForBackend = {
        // Authentication
        idToken: idToken,
        
        // Basic user information (from Firebase)
        firebase: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData,
          metadata: {
            creationTime: user.metadata?.creationTime,
            lastSignInTime: user.metadata?.lastSignInTime,
            lastRefreshTime: user.metadata?.lastRefreshTime
          }
        },
        
        // Token information (for backend verification)
        token: {
          issuer: tokenPayload?.iss,
          audience: tokenPayload?.aud,
          issuedAt: tokenPayload?.iat,
          expiresAt: tokenPayload?.exp,
          authTime: tokenPayload?.auth_time,
          signInProvider: tokenPayload?.firebase?.sign_in_provider
        },
        
        // User profile data (for backend storage/update)
        profile: {
          email: user.email,
          name: user.displayName || 'Unknown User',
          firstName: user.displayName ? user.displayName.split(' ')[0] : null,
          lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : null,
          avatar: user.photoURL,
          emailVerified: user.emailVerified,
          createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null,
          lastSignIn: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null
        },
        
        // Billing and subscription data (for backend to populate)
        billing: {
          // These should be fetched from your backend database
          plan: 'Free', // Default, should be fetched from backend
          credits: 50,  // Default, should be fetched from backend
          subscriptionStatus: 'active', // Default, should be fetched from backend
          subscriptionExpiresAt: null, // Should be fetched from backend
          paymentMethod: null, // Should be fetched from backend
          billingAddress: null, // Should be fetched from backend
          invoices: [], // Should be fetched from backend
        },
        
        // Credits and usage data (for backend to populate)
        credits: {
          currentBalance: 50, // Default, should be fetched from backend
          totalEarned: 0, // Should be fetched from backend
          totalSpent: 0, // Should be fetched from backend
          usageHistory: [], // Should be fetched from backend
          lastUpdated: new Date().toISOString()
        },
        
        // Preferences and settings (for backend to populate)
        preferences: {
          defaultModel: 'default',
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        
        // Additional metadata
        metadata: {
          clientInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          sessionInfo: {
            sessionId: this.generateSessionId(),
            timestamp: new Date().toISOString()
          }
        }
      };
      
      console.log('✅ User data prepared for backend');
      console.log('📊 Summary:', {
        uid: userDataForBackend.firebase.uid,
        email: userDataForBackend.profile.email,
        plan: userDataForBackend.billing.plan,
        credits: userDataForBackend.credits.currentBalance
      });
      
      return userDataForBackend;
    } catch (error) {
      console.error('Error preparing user data for backend:', error);
      throw error;
    }
  }

  // Generate a unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper function to safely extract first and last names
  getNamesFromDisplayName(displayName) {
    if (!displayName) {
      return { firstName: null, lastName: null };
    }
    const parts = displayName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
    return { firstName, lastName };
  }
}

// Create singleton instance
const firebaseAuthService = new FirebaseAuthService(auth);

// Initialize Firebase Auth service
firebaseAuthService.initialize().catch(error => {
  console.error('Failed to initialize Firebase Auth:', error);
});

export default firebaseAuthService;