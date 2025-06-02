<template>
  <div class="bg-[#FFF6E5] flex w-[300px] h-[600px] mx-auto flex-col">
    <div class="flex items-center justify-between px-4 py-4">
      <NuxtLink to="/pg/Homescreen">
        <Icon name="uiw:arrow-left" size="14" />
      </NuxtLink>
      <h1 class="text-center flex-grow">Create Account</h1>
    </div>

    <form @submit.prevent="submitAccount" class="bg-white rounded-3xl m-2 p-4 flex flex-col flex-1">
      <!-- Balance -->
      <label class="text-gray-700 font-semibold mb-2">Starting Balance</label>
      <input
        v-model.number="account.balance"
        type="number"
        class="border w-full p-2 rounded-xl border-black mb-4"
        placeholder="Enter initial balance"
        required
      />

      <!-- Optional: User ID -->
      <label class="text-gray-700 font-semibold mb-2">User ID</label>
      <input
        v-model="account.userId"
        type="text"
        class="border w-full p-2 rounded-xl border-black mb-4"
        placeholder="Enter User ID"
        required
      />

      <button
        type="submit"
        class="mt-auto text-white bg-purple-600 rounded-2xl p-2"
      >
        Create Account
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const account = ref({
  balance: null,
  userId: '', // Replace or select from user list
});

const submitAccount = async () => {
  if (!account.value.userId || account.value.balance == null) {
    alert('Please fill all required fields.');
    return;
  }

  try {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account.value),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.statusMessage || 'Account creation failed');

    console.log('Account created:', data.account);
    router.push('/pg/Homescreen');
  } catch (err) {
    console.error(err);
    alert('Failed to create account.');
  }
};
</script>
