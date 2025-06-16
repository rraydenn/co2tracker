<template>
	<Transition :name="transitionName" mode="out-in">
		<div class="container" key="register-page">
			<div class="box" ref="boxRef">
				<h1 class="title">Register</h1>
				<form @submit.prevent="register" class="form">
					<div class="form-group">
						<label for="full_name" class="form-label">Full name:</label>
						<input
							type="text"
							v-model="full_name"
							placeholder="Enter your name"
							required
							class="form-input"
							:disabled="!isActive" />
					</div>

					<div class="form-group">
						<label for="email" class="form-label">Email:</label>
						<input
							type="email"
							v-model="email"
							placeholder="Enter your email"
							required
							class="form-input"
							:disabled="!isActive" />
					</div>
					<div class="form-group">
						<label for="password" class="form-label">Password:</label>
						<input
							type="password"
							v-model="password"
							placeholder="Enter your password"
							required
							class="form-input"
							:disabled="!isActive" />
					</div>
					<button type="submit" class="button-register">Register</button>
				</form>
				<p class="footer">
					Already have an account?
					<router-link
						to="/login"
						class="link"
						@click.native="setTransition('slide-left')"
						>Login</router-link
					>
				</p>
				<router-link to="/" class="return-btn">Retour à l'accueil</router-link>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';

export default defineComponent({
	setup() {
		const full_name = ref('');
		const email = ref('');
		const password = ref('');
		const authStore = useAuthStore();
		const router = useRouter();
		const isActive = ref(false);
		const boxRef = ref<HTMLElement | null>(null);
		const transitionName = ref('slide-right');

		const register = async () => {
			try {
				await authStore.register(full_name.value, email.value, password.value);
				setTransition('slide-left');
				await router.push('/login');
			} catch (error) {
				console.error(error);
			}
		};

		const setTransition = (name: string) => {
			transitionName.value = name;
		};

		const animateForm = async () => {
			if (boxRef.value) {
				gsap.from(boxRef.value, {
					opacity: 0,
					y: 50,
					duration: 0.8,
					ease: 'power2.out',
					onComplete: () => {
						isActive.value = true;
					},
				});
			}
		};

		onMounted(async () => {
			await nextTick();
			await animateForm();
		});

		return {
			full_name,
			email,
			password,
			isActive,
			boxRef,
			transitionName,
			register,
			setTransition,
			animateForm,
		};
	},
});
</script>

<style scoped>

.link {
    color: #4a8;
    text-decoration: none;
    font-weight: bold;
  }
  
  .link:hover {
    text-decoration: underline;
  }

  .form-label{
	color: #1f2937;
	font-weight: bold;
    font-size: 1.1rem;

  }

  .form-input{
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
}

  .button-register{
	width: 100%;
  	background-color: #1f2937;
  	color: white;
  	padding: 0.6rem;
  	border: none;
  	border-radius: 5px;
	font-weight: bold;
	cursor: pointer;
	transition: background-color 0.2s ease;

  }

  .return-btn {
    display: block;
    margin-top: 20px;
    padding: 8px 16px;
    background: #4a8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    text-align: center;
    transition: background 0.3s;
  }
.return-btn:hover {
  background: #3a7;
}
</style>
