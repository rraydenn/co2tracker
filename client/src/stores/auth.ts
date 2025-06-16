import { defineStore } from 'pinia';
import axios from 'axios';
import { User } from '@/types/user';
import { log } from '@/utils/logger';

// Variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null as User | null,
		token: localStorage.getItem('token') || null,
	}),

	actions: {
		async register(full_name: string, email: string, password: string) {
			try {
				await axios.post(`${API_BASE_URL}/users`, {
					full_name,
					email,
					password,
				});
				log('User registered successfully', 'info');
			} catch (error) {
				log('Registration failed: ' + (error as Error).message, 'error');
			}
		},

		async login(email: string, password: string) {
			try {
				const response = await axios.post(`${API_BASE_URL}/login`, {
					email,
					password,
				});
				this.token = response.data.token;

				if (this.token) {
					localStorage.setItem('token', this.token);
				}

				log('Login successful', 'info');
				return response.data;
			} catch (error) {
				log('Login failed: ' + (error as Error).message, 'error');
				return null;
			}
		},

		async logout() {
			try {
				if (!this.token) throw new Error('No token found');

				const headers = { Authorization: `Bearer ${this.token}` };
				await axios.post(`${API_BASE_URL}/logout`, {}, { headers });

				localStorage.removeItem('token');
				this.token = null;

				log('Logout successful', 'info');
			} catch (error) {
				log('Logout failed: ' + (error as Error).message, 'error');
			}
		},

		async showUser() {
			try {
				if (!this.token) throw new Error('No token found');

				const headers = { Authorization: `Bearer ${this.token}` };
				const response = await axios.get(`${API_BASE_URL}/users/me`, {
					headers,
				});

				log('User info fetched', 'debug');
				this.user = response.data;
				return response.data;
			} catch (error) {
				log('Show user failed: ' + (error as Error).message, 'error');
				return null;
			}
		},
	},
});
