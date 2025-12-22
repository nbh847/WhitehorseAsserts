<template>
  <div class="review-blogs-container">
    <h2>温故知新</h2>
    
    <!-- 内容输入区域 -->
    <div class="blog-input-section">
      <h3>添加值得二刷的内容</h3>
      <form @submit.prevent="handleAddBlog" class="blog-form">
        <div class="form-group">
          <label for="blog-title">标题:</label>
          <input 
            type="text" 
            id="blog-title" 
            v-model="newBlog.title" 
            required 
            placeholder="输入标题"
          />
        </div>
        <div class="form-group">
          <label for="blog-author">作者:</label>
          <input 
            type="text" 
            id="blog-author" 
            v-model="newBlog.author" 
            placeholder="输入作者/主播"
          />
        </div>
        <div class="form-group">
          <label for="blog-url">链接:</label>
          <input 
            type="url" 
            id="blog-url" 
            v-model="newBlog.url" 
            placeholder="输入链接（可选）"
          />
        </div>
        <div class="form-group">
          <label for="blog-type">类型:</label>
          <select id="blog-type" v-model="newBlog.type">
            <option value="blog">博客</option>
            <option value="podcast">播客</option>
            <option value="movie">电影</option>
            <option value="book">书籍</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">添加</button>
      </form>
    </div>
    
    <!-- 随机推荐区域 -->
    <div class="recommendation-section">
      <h3>随机推荐</h3>
      <button @click="handleRecommendBlog" class="btn btn-success" :disabled="blogs.length === 0">
        告诉我今天该复习哪篇？
      </button>
      
      <div v-if="recommendedBlog" class="recommended-blog">
        <h4>推荐内容:</h4>
        <div class="blog-card">
          <h5>{{ recommendedBlog.title }}</h5>
          <p class="blog-author" v-if="recommendedBlog.author">{{ recommendedBlog.author }}</p>
          <a :href="recommendedBlog.url" target="_blank" rel="noopener noreferrer" v-if="recommendedBlog.url">
            {{ recommendedBlog.url }}
          </a>
          <div class="blog-meta">
            <span class="blog-type">{{ 
              recommendedBlog.type === 'blog' ? '博客' : 
              recommendedBlog.type === 'podcast' ? '播客' : 
              recommendedBlog.type === 'movie' ? '电影' : '书籍' 
            }}</span>
            <span class="recommendation-count">推荐次数: {{ getRecommendationCount(recommendedBlog.id) }}</span>
            <span class="read-count">已读次数: {{ getReadCount(recommendedBlog.id) }}</span>
          </div>
          <!-- 阅读时间记录 -->
          <div v-if="readingTimes[recommendedBlog.id] && readingTimes[recommendedBlog.id].length > 0" class="reading-times">
            <h6>阅读时间记录:</h6>
            <div v-for="(time, index) in readingTimes[recommendedBlog.id]" :key="index" class="reading-time-item">
              {{ formatDate(time) }} 👏
            </div>
          </div>
          <button @click="handleMarkAsRead(recommendedBlog.id)" class="btn btn-read">已读此书</button>
        </div>
      </div>
      
      <div v-if="blogs.length === 0 && !recommendedBlog" class="empty-state">
        <p>还没有添加任何内容，请先在上方添加博客、播客、电影或书籍。</p>
      </div>
    </div>
    
    <!-- 博客列表和统计区域 -->
    <div class="blogs-stats-section">
      <h3>我的收藏</h3>
      
      <div v-if="blogs.length > 0" class="blogs-list">
        <div v-for="blog in blogs" :key="blog.id" class="blog-item">
          <div class="blog-info">
          <h4>{{ blog.title }}</h4>
          <p class="blog-author" v-if="blog.author">{{ blog.author }}</p>
          <a :href="blog.url" target="_blank" rel="noopener noreferrer" v-if="blog.url">{{ blog.url }}</a>
          <div class="blog-meta">
              <span class="blog-type">{{ 
                blog.type === 'blog' ? '博客' : 
                blog.type === 'podcast' ? '播客' : 
                blog.type === 'movie' ? '电影' : '书籍' 
              }}</span>
              <span class="added-date">添加于: {{ formatDate(blog.addedAt) }}</span>
              <span class="recommendation-count">推荐次数: {{ getRecommendationCount(blog.id) }}</span>
              <span class="read-count">已读次数: {{ getReadCount(blog.id) }}</span>
              <span v-if="blog.lastRecommendedAt" class="last-recommended">
                最后推荐: {{ formatDate(blog.lastRecommendedAt) }}
              </span>
            </div>
            <!-- 阅读时间记录 -->
            <div v-if="readingTimes[blog.id] && readingTimes[blog.id].length > 0" class="reading-times">
              <h6>阅读时间记录:</h6>
              <div v-for="(time, index) in readingTimes[blog.id]" :key="index" class="reading-time-item">
                {{ formatDate(time) }} 👏
              </div>
            </div>
          </div>
          <button @click="handleDeleteBlog(blog.id)" class="btn btn-delete">删除</button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>还没有添加任何博客/播客。</p>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div v-if="blogs.length > 0" class="statistics-section">
      <h3>统计信息</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总收藏数:</span>
          <span class="stat-value">{{ blogs.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">博客数:</span>
          <span class="stat-value">{{ blogs.filter(b => b.type === 'blog').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">播客数:</span>
          <span class="stat-value">{{ blogs.filter(b => b.type === 'podcast').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">电影数:</span>
          <span class="stat-value">{{ blogs.filter(b => b.type === 'movie').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">书籍数:</span>
          <span class="stat-value">{{ blogs.filter(b => b.type === 'book').length }}</span>
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
import blogStorage from '../utils/blogStorage.js';

export default {
  name: 'ReviewBlogs',
  data() {
    return {
      newBlog: {
        title: '',
        url: '',
        type: 'blog',
        author: ''
      },
      blogs: [],
      recommendedBlog: null,
      recommendationCounts: {},
      readCounts: {}, // 新增已读次数对象
      readingTimes: {} // 新增阅读时间记录对象
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
  async mounted() {
    await this.loadBlogs();
    this.loadRecommendationCounts();
    this.loadReadCounts(); // 加载已读次数
    this.loadReadingTimes(); // 加载阅读时间记录
  },
  methods: {
    async loadBlogs() {
      this.blogs = await blogStorage.getBlogs();
    },
    loadRecommendationCounts() {
      this.recommendationCounts = blogStorage.getRecommendationCounts();
    },
    loadReadCounts() {
      this.readCounts = blogStorage.getReadCounts();
    },
    loadReadingTimes() {
      this.readingTimes = blogStorage.getReadingTimes();
    },
    getReadCount(id) {
      return this.readCounts[id] || 0;
    },
    async handleAddBlog() {
      if (!this.newBlog.title.trim()) {
        alert('请填写标题');
        return;
      }
      
      await blogStorage.addBlog(this.newBlog);
      await this.loadBlogs();
      this.loadRecommendationCounts();
      this.loadReadCounts(); // 加载已读次数
      
      // 重置表单
      this.newBlog = {
        title: '',
        url: '',
        type: 'blog',
        author: ''
      };
      
      alert('添加成功！');
    },
    async handleDeleteBlog(id) {
      if (confirm('确定要删除这篇内容吗？')) {
        await blogStorage.deleteBlog(id);
        await this.loadBlogs();
        this.loadRecommendationCounts();
        this.loadReadCounts(); // 重新加载已读次数
        // 如果删除的是当前推荐的内容，清空推荐
        if (this.recommendedBlog && this.recommendedBlog.id === id) {
          this.recommendedBlog = null;
        }
        alert('删除成功！');
      }
    },
    async handleMarkAsRead(id) {
      await blogStorage.incrementReadCount(id);
      this.loadReadCounts();
      this.loadReadingTimes(); // 重新加载阅读时间记录
      alert('已标记为已读！');
    },
    async handleRecommendBlog() {
      if (this.blogs.length === 0) {
        alert('请先添加内容');
        return;
      }
      
      this.recommendedBlog = await blogStorage.recommendBlog();
      this.loadRecommendationCounts();
      this.loadReadCounts(); // 加载已读次数
      await this.loadBlogs(); // 更新最后推荐时间
    },
    getRecommendationCount(id) {
      return this.recommendationCounts[id] || 0;
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
.review-blogs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.blog-input-section,
.recommendation-section,
.blogs-stats-section,
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
.blog-form {
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
.form-group select {
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

/* 推荐博客样式 */
.recommended-blog {
  margin-top: 20px;
}

.blog-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.blog-card h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.blog-card a {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
  display: block;
  margin-bottom: 10px;
}

.blog-card a:hover {
  text-decoration: underline;
}

/* 作者信息样式 */
.blog-author {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
  margin-top: 5px;
  font-size: 14px;
}

/* 博客列表样式 */
.blogs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.blog-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.blog-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.blog-item a {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
  display: block;
  margin-bottom: 10px;
}

.blog-item a:hover {
  text-decoration: underline;
}

.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.blog-type {
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
