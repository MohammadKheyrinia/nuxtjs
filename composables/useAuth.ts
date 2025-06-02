// ~/composables/useAuth.ts
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export const useAuth = () => {
  const router = useRouter();
  const isAuthenticated = ref(false); // You can use this for global auth state

  // Check initial auth state (e.g., from localStorage)
  if (typeof window !== 'undefined' && localStorage.getItem('user')) {
    isAuthenticated.value = true;
  }

  const login = async (credentials: any) => {
    // This logic is mostly in login.vue, but you could move the fetch call here
    // For now, it just sets isAuthenticated on success.
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        isAuthenticated.value = true;
        return { success: true, user: data.user };
      } else {
        const errorData = await res.json();
        throw new Error(errorData.statusMessage || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login composable error:', error);
      isAuthenticated.value = false;
      return { success: false, error: error.message };
    }
  };


  const logout = async () => {
    try {
      const res = await fetch('/api/users/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('user'); // Clear user from local storage
        isAuthenticated.value = false;
        console.log('Logged out successfully');
        router.push('/pg/Login'); // Redirect to login page
      } else {
        console.error('Logout failed:', await res.json());
        // Handle logout error (e.g., show a message to the user)
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Handle network or other unexpected errors
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
};