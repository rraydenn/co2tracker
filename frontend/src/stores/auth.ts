import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
	full_name: string;
	email: string;
	password: string;
}

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null as User | null,
		token: localStorage.getItem('token') || null,
	}),
	actions: {
		async register(full_name: string, email: string, password: string) {
			try {
				await axios.post('http://localhost:3333/users', {
					full_name,
					email,
					password,
				});
			} catch (error) {
				console.error('Registration failed', error);
			}
		},

		async login(email: string, password: string) {
			try {
				const response = await axios.post('http://localhost:3333/login', {
					email,
					password,
				});

				this.token = response.data.token;
				if (this.token) {
					localStorage.setItem('token', this.token);
				}

				return response.data;
			} catch (error) {
				console.error('Login failed', error);
				return null; // Ensure a consistent return type
			}
		},

		async logout() {
			try {
				if (this.token) {
					const header = { Authorization: `Bearer ${this.token}` };
					await axios.post(
						'http://localhost:3333/logout',
						{},
						{ headers: header }
					);
					localStorage.removeItem('token');
					this.token = null;
				} else {
					throw new Error('No token found');
				}
			} catch (error) {
				console.error('Logout failed', error);
			}
		},

		async showUser() {
			try {
				if (this.token) {
					const header = { Authorization: `Bearer ${this.token}` };
					const response = await axios.get('http://localhost:3333/users/me', {
						headers: header,
					});

					console.log(response.data);
					return response.data;
				} else {
					throw new Error('No token found');
				}
			} catch (error) {
				console.error('Show user failed', error);
				return null; // Ensure a consistent return type
			}
		},
	},
});
