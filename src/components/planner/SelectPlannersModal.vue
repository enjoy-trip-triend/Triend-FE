<template>
  <div class="modal-overlay">
    <div class="modal scrollable-modal">
      <h2>플래너 선택</h2>
 
      <!-- 📌 플래너 리스트 -->
      <div id="plannerList" class="planner-list-scroll">
        <div v-if="planners.length > 0">
          <div
            v-for="planner in planners"
            :key="planner.id"
            class="planner-card"
            @click="selectPlanner(planner)"
          >
            <strong class="planner-title">{{ planner.name || `플래너 #${planner.id}` }}</strong>
            <span class="planner-period">{{ planner.startDay }} ~ {{ planner.endDay }}</span>
          </div>
        </div>
        <div v-else>텅~ 아무것도 없어요!</div>
      </div>
      <div class="button-group">
        <button @click="showCreatePlannerModal">+ 새 플래너 추가</button>
        <button @click="emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits} from 'vue'

defineProps({
  plannerListVisible: Boolean,
  planners: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'showCreatePlannerModal', 'selectPlanner'])

const showCreatePlannerModal = () => {
  emit('close')
  emit('showCreatePlannerModal')
}

const selectPlanner = (planner) => {
  emit('selectPlanner', planner)
  emit('close')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.modal h2 {
  margin-bottom: 15px;
  color: #0288d1;
}

.modal button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #4fc3f7;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  margin: 0px 3px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  position: absolute;
  width: 400px;
  max-height: 80vh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  min-width: 300px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 210;
  display: flex;
  flex-direction: column;
}

.planner-list-scroll {
  max-height: 50vh;
  overflow-y: auto;
  margin-top: 12px;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.planner-card {
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.planner-card:hover {
  background-color: #f1faff;
  border-color: #0288d1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.planner-title {
  font-size: 16px;
  color: #0288d1;
  display: block;
  margin-bottom: 4px;
}

.planner-period {
  font-size: 13px;
  color: #666;
}
</style>
