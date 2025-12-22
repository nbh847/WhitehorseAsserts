<template>
  <div class="random-walk-container">
    <h2>随机漫步</h2>
    
    <!-- 内容输入区域 -->
    <div class="record-input-section">
      <h3>添加我的想法/待办</h3>
      <form @submit.prevent="handleAddRecord" class="record-form">
        <div class="form-group">
          <label for="record-title">标题:</label>
          <input 
            type="text" 
            id="record-title" 
            v-model="newRecord.title" 
            required 
            placeholder="输入标题"
          />
        </div>
        <div class="form-group">
          <label for="record-content">内容:</label>
          <textarea 
            id="record-content" 
            v-model="newRecord.content" 
            placeholder="输入内容（可选）"
            rows="4"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="record-tags">标签:</label>
          <input 
            type="text" 
            id="record-tags" 
            v-model="newRecord.tagsString" 
            placeholder="输入标签，用逗号分隔"
          />
        </div>
        <div class="form-group">
          <label for="record-type">类型:</label>
          <select id="record-type" v-model="newRecord.type">
            <option value="thought">想法</option>
            <option value="todo">待办</option>
            <option value="knowledge">知识点</option>
            <option value="experience">经验总结</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">添加</button>
      </form>
    </div>
    
    <!-- 随机推荐区域 -->
    <div class="recommendation-section">
      <h3>今天该看什么？</h3>
      <button @click="handleRecommendRecord" class="btn btn-success" :disabled="records.length === 0">
        🎲 开始随机漫步
      </button>
      
      <div v-if="recommendedRecord" class="recommended-record">
        <h4>推荐内容:</h4>
        <div class="record-card">
          <h5>{{ recommendedRecord.title }}</h5>
          <div v-if="recommendedRecord.content" class="record-content">
            {{ recommendedRecord.content }}
          </div>
          <!-- 标签显示 -->
          <div v-if="recommendedRecord.tags && recommendedRecord.tags.length > 0" class="record-tags">
            <span 
              v-for="(tag, index) in recommendedRecord.tags" 
              :key="index" 
              class="tag-item"
            >
              {{ tag }}
            </span>
          </div>
          <div class="record-meta">
            <span class="record-type">{{ 
              recommendedRecord.type === 'thought' ? '想法' : 
              recommendedRecord.type === 'todo' ? '待办' : 
              recommendedRecord.type === 'knowledge' ? '知识点' : '经验总结' 
            }}</span>
            <span class="recommendation-count">推荐次数: {{ getRecommendationCount(recommendedRecord.id) }}</span>
            <span class="read-count">已读次数: {{ getReadCount(recommendedRecord.id) }}</span>
          </div>
          <!-- 阅读时间记录 -->
          <div v-if="readingTimes[recommendedRecord.id] && readingTimes[recommendedRecord.id].length > 0" class="reading-times">
            <h6>阅读时间记录:</h6>
            <div v-for="(time, index) in readingTimes[recommendedRecord.id]" :key="index" class="reading-time-item">
              {{ formatDate(time) }} 👏
            </div>
          </div>
          <button @click="handleMarkAsRead(recommendedRecord.id)" class="btn btn-read">已读</button>
        </div>
      </div>
      
      <div v-if="records.length === 0 && !recommendedRecord" class="empty-state">
        <p>还没有添加任何记录，请先在上方添加你的想法或待办。</p>
      </div>
    </div>
    
    <!-- 记录列表和统计区域 -->
    <div class="records-stats-section">
      <h3>我的记录</h3>
      
      <div v-if="records.length > 0" class="records-list">
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-info">
          <h4>{{ record.title }}</h4>
          <div v-if="record.content" class="record-content">
            {{ record.content }}
          </div>
          <!-- 标签显示 -->
          <div v-if="record.tags && record.tags.length > 0" class="record-tags">
            <span 
              v-for="(tag, index) in record.tags" 
              :key="index" 
              class="tag-item"
            >
              {{ tag }}
            </span>
          </div>
          <div class="record-meta">
              <span class="record-type">{{ 
                record.type === 'thought' ? '想法' : 
                record.type === 'todo' ? '待办' : 
                record.type === 'knowledge' ? '知识点' : '经验总结' 
              }}</span>
              <span class="added-date">添加于: {{ formatDate(record.addedAt) }}</span>
              <span class="recommendation-count">推荐次数: {{ getRecommendationCount(record.id) }}</span>
              <span class="read-count">已读次数: {{ getReadCount(record.id) }}</span>
              <span v-if="record.lastRecommendedAt" class="last-recommended">
                最后推荐: {{ formatDate(record.lastRecommendedAt) }}
              </span>
            </div>
            <!-- 阅读时间记录 -->
            <div v-if="readingTimes[record.id] && readingTimes[record.id].length > 0" class="reading-times">
              <h6>阅读时间记录:</h6>
              <div v-for="(time, index) in readingTimes[record.id]" :key="index" class="reading-time-item">
                {{ formatDate(time) }} 👏
              </div>
            </div>
          </div>
          <button @click="handleDeleteRecord(record.id)" class="btn btn-delete">删除</button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>还没有添加任何记录。</p>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div v-if="records.length > 0" class="statistics-section">
      <h3>统计信息</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总记录数:</span>
          <span class="stat-value">{{ records.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">想法数:</span>
          <span class="stat-value">{{ records.filter(r => r.type === 'thought').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待办数:</span>
          <span class="stat-value">{{ records.filter(r => r.type === 'todo').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">知识点数:</span>
          <span class="stat-value">{{ records.filter(r => r.type === 'knowledge').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">经验总结数:</span>
          <span class="stat-value">{{ records.filter(r => r.type === 'experience').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总推荐次数:</span>
          <span class="stat-value">{{ totalRecommendationCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总已读次数:</span>
          <span class="stat-value">{{ totalReadCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import randomWalkStorage from '../utils/randomWalkStorage.js';

export default {
  name: 'RandomWalk',
  data() {
    return {
      newRecord: {
        title: '',
        content: '',
        type: 'thought',
        tagsString: '',
        tags: []
      },
      records: [],
      recommendedRecord: null,
      recommendationCounts: {},
      readCounts: {},
      readingTimes: {}
    };
  },
  computed: {
    totalRecommendationCount() {
      return Object.values(this.recommendationCounts).reduce((sum, count) => sum + count, 0);
    },
    totalReadCount() {
      return Object.values(this.readCounts).reduce((sum, count) => sum + count, 0);
    }
  },
  mounted() {
    this.loadRecords();
    this.loadRecommendationCounts();
    this.loadReadCounts();
    this.loadReadingTimes();
  },
  methods: {
    async loadRecords() {
      this.records = await randomWalkStorage.getRecords();
    },
    async loadRecommendationCounts() {
      this.recommendationCounts = await randomWalkStorage.getRecommendationCounts();
    },
    async loadReadCounts() {
      this.readCounts = await randomWalkStorage.getReadCounts();
    },
    async loadReadingTimes() {
      this.readingTimes = await randomWalkStorage.getReadingTimes();
    },
    getRecommendationCount(id) {
      return this.recommendationCounts[id] || 0;
    },
    getReadCount(id) {
      return this.readCounts[id] || 0;
    },
    async handleAddRecord() {
      if (!this.newRecord.title.trim()) {
        alert('请填写标题');
        return;
      }
      
      // 处理标签
      const tags = this.newRecord.tagsString
        ? this.newRecord.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const recordData = {
        title: this.newRecord.title,
        content: this.newRecord.content,
        tags: tags,
        type: this.newRecord.type
      };
      
      await randomWalkStorage.addRecord(recordData);
      await this.loadRecords();
      await this.loadRecommendationCounts();
      await this.loadReadCounts();
      
      // 重置表单
      this.newRecord = {
        title: '',
        content: '',
        type: 'thought',
        tagsString: '',
        tags: []
      };
      
      alert('添加成功！');
    },
    async handleDeleteRecord(id) {
      if (confirm('确定要删除这条记录吗？')) {
        await randomWalkStorage.deleteRecord(id);
        await this.loadRecords();
        await this.loadRecommendationCounts();
        await this.loadReadCounts();
        await this.loadReadingTimes();
        // 如果删除的是当前推荐的内容，清空推荐
        if (this.recommendedRecord && this.recommendedRecord.id === id) {
          this.recommendedRecord = null;
        }
        alert('删除成功！');
      }
    },
    async handleMarkAsRead(id) {
      await randomWalkStorage.incrementReadCount(id);
      await this.loadReadCounts();
      await this.loadReadingTimes();
      alert('已标记为已读！');
    },
    async handleRecommendRecord() {
      if (this.records.length === 0) {
        alert('请先添加记录');
        return;
      }
      
      this.recommendedRecord = await randomWalkStorage.recommendRecord();
      await this.loadRecommendationCounts();
      await this.loadReadCounts();
      await this.loadReadingTimes();
      await this.loadRecords();
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.random-walk-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.record-input-section,
.recommendation-section,
.records-stats-section,
.statistics-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

/* 表单样式 */
.record-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-success {
  background-color: #67c23a;
  color: white;
  font-size: 18px;
  padding: 12px 30px;
}

.btn-success:hover {
  background-color: #85ce61;
}

.btn-success:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.btn-delete {
  background-color: #f56c6c;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-delete:hover {
  background-color: #f78989;
}

.btn-read {
  background-color: #909399;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  margin-top: 15px;
}

.btn-read:hover {
  background-color: #a6a9ad;
}

/* 推荐记录样式 */
.recommended-record {
  margin-top: 20px;
}

.record-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.record-card h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.record-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #555;
}

/* 标签样式 */
.record-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag-item {
  background-color: #f0f0f0;
  color: #666;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
}

/* 记录列表样式 */
.records-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.record-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.record-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.record-type {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.recommendation-count {
  font-weight: bold;
  color: #67c23a;
}

.read-count {
  font-weight: bold;
  color: #909399;
}

/* 阅读时间记录样式 */
.reading-times {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.reading-times h6 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.reading-time-item {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
  padding-left: 10px;
  position: relative;
}

.reading-time-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #409eff;
}

.added-date,
.last-recommended {
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 18px;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
</style>