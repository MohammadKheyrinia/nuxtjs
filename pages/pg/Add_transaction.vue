<template>
  <div class="bg-[#FFF6E5] flex w-[300px] h-[600px] mx-auto flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4">
      <NuxtLink to="/pg/Homescreen">
        <Icon name="uiw:arrow-left" size="14" />
      </NuxtLink>
      <h1 class="text-center flex-grow">Add Transaction</h1>
    </div>

    <p class="text-gray-600 font-semibold pt-8 pl-6 text-3xl pb-8">How much?</p>

    <!-- Form -->
    <form @submit.prevent="submitTransaction" class="bg-white rounded-3xl m-2 flex-1 flex flex-col">
      <!-- Amount -->
      <div class="p-4">
        <input
          v-model.number="transaction.amount"
          type="number"
          class="border w-full pl-3 p-2 rounded-xl border-black"
          placeholder="Enter Amount"
          required
        />
      </div>

      <!-- Category -->
      <div class="p-4">
        <select
          v-model="transaction.category"
          class="border w-full pl-3 p-2 rounded-xl border-black text-gray-700"
          required
        >
          <option value="" disabled>Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <!-- Income / Expense -->
      <div class="flex justify-center space-x-3 pt-4 pb-2">
        <button
          type="button"
          @click="transaction.type = 'INCOME'"
          :class="buttonClass('INCOME')"
        >
          Income
        </button>
        <button
          type="button"
          @click="transaction.type = 'EXPENSE'"
          :class="buttonClass('EXPENSE')"
        >
          Expense
        </button>
      </div>

      <!-- Description -->
      <div class="mt-3 p-4">
        <input
          v-model="transaction.description"
          type="text"
          class="border w-full pl-3 p-2 rounded-xl border-black"
          placeholder="Description (Optional)"
        />
      </div>

      <!-- Submit -->
      <div class="p-4 mt-auto">
        <button
          type="submit"
          class="w-full text-white bg-purple-600 rounded-2xl p-2"
        >
          Continue
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from '#app'; // Nuxt 3

const router = useRouter();

const transaction = ref({
  amount: null as number | null,
  category: '',
  description: '',
  type: '',
  userId: '',
});

const submitTransaction = async () => {
  if (!transaction.value.type) {
    alert("Please select Income or Expense.");
    return;
  }

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert("User not found. Please log in again.");
    router.push('/pg/Login');
    return;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!user._id || user._id.length !== 24) {
      throw new Error("Invalid user ID");
    }

    transaction.value.userId = user._id;

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction.value),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.statusMessage || "Error saving transaction");

    console.log("Transaction saved:", data.transaction);

    // ✅ Update local user balance if returned by backend
    if (data.balance !== undefined) {
      user.balance = data.balance;
      localStorage.setItem('user', JSON.stringify(user));
    }

    router.push('/pg/Homescreen');
  } catch (error: any) {
    console.error("Submission failed:", error.message);
    alert("Failed to save transaction.");
  }
};

const buttonClass = (type: string) => {
  return [
    "px-4 py-2 rounded-xl text-white transition-opacity duration-200",
    transaction.value.type === type ? "opacity-100" : "opacity-50",
    type === "INCOME" ? "bg-green-600" : "bg-red-400",
  ].join(" ");
};
</script>
