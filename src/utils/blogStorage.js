import apiService from './apiService';

class BlogStorage {
  constructor() {
    this.storageKey = 'reviewBlogs';
    this.lastRecommendedKey = 'lastRecommendedBlog';
    this.recommendationCountKey = 'blogRecommendationCounts';
    this.readCountKey = 'blogReadCounts'; // 新增已读次数存储键
    this.readingTimesKey = 'blogReadingTimes'; // 新增阅读时间记录存储键
  }

  // 获取所有博客
  async getBlogs() {
    try {
      const blogs = await apiService.getBlogs();
      return blogs;
    } catch (error) {
      console.error('从后端获取博客数据失败，回退到localStorage:', error);
      const blogs = localStorage.getItem(this.storageKey);
      if (!blogs) return [];
      try {
        return JSON.parse(blogs);
      } catch (e) {
        console.error('解析博客数据失败:', e);
        return [];
      }
    }
  }

  // 添加博客/播客/电影/书籍
  async addBlog(blog) {
    const newBlog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: blog.title,
      url: blog.url || '',
      type: blog.type || 'blog', // 默认类型为博客
      author: blog.author || '', // 作者字段
      addedAt: new Date().toISOString(),
      lastRecommendedAt: null
    };

    try {
      const blogs = await apiService.addBlog(newBlog);
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(blogs));
      return blogs;
    } catch (error) {
      console.error('添加博客到后端失败，回退到localStorage:', error);
      const blogs = await this.getBlogs();
      blogs.push(newBlog);
      localStorage.setItem(this.storageKey, JSON.stringify(blogs));
      // 初始化推荐计数和已读次数
      this.updateRecommendationCount(newBlog.id, 0);
      this.updateReadCount(newBlog.id, 0); // 初始化已读次数
      return blogs;
    }
  }

  // 删除博客
  async deleteBlog(id) {
    try {
      const blogs = await apiService.deleteBlog(id);
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(blogs));
      // 删除本地的推荐计数、已读次数和阅读时间记录
      this.deleteRecommendationCount(id);
      this.deleteReadCount(id); // 删除已读次数
      this.deleteReadingTimes(id); // 删除阅读时间记录
      return blogs;
    } catch (error) {
      console.error('从后端删除博客失败，回退到localStorage:', error);
      const blogs = await this.getBlogs();
      const updatedBlogs = blogs.filter(blog => blog.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedBlogs));
      // 删除推荐计数、已读次数和阅读时间记录
      this.deleteRecommendationCount(id);
      this.deleteReadCount(id); // 删除已读次数
      this.deleteReadingTimes(id); // 删除阅读时间记录
      return updatedBlogs;
    }
  }

  // 获取上次推荐的博客ID
  getLastRecommendedBlogId() {
    return localStorage.getItem(this.lastRecommendedKey);
  }

  // 设置上次推荐的博客ID
  setLastRecommendedBlogId(id) {
    localStorage.setItem(this.lastRecommendedKey, id);
  }

  // 获取推荐计数
  getRecommendationCounts() {
    const counts = localStorage.getItem(this.recommendationCountKey);
    if (!counts) return {};
    try {
      return JSON.parse(counts);
    } catch (e) {
      console.error('解析推荐计数失败:', e);
      return {};
    }
  }
  
  // 获取已读次数
  getReadCounts() {
    const counts = localStorage.getItem(this.readCountKey);
    if (!counts) return {};
    try {
      return JSON.parse(counts);
    } catch (e) {
      console.error('解析已读次数失败:', e);
      return {};
    }
  }
  
  // 获取阅读时间记录
  getReadingTimes() {
    const times = localStorage.getItem(this.readingTimesKey);
    if (!times) return {};
    try {
      return JSON.parse(times);
    } catch (e) {
      console.error('解析阅读时间失败:', e);
      return {};
    }
  }

  // 获取特定博客的推荐计数
  getRecommendationCount(id) {
    const counts = this.getRecommendationCounts();
    return counts[id] || 0;
  }
  
  // 获取特定博客的已读次数
  getReadCount(id) {
    const counts = this.getReadCounts();
    return counts[id] || 0;
  }

  // 更新推荐计数
  updateRecommendationCount(id, count) {
    const counts = this.getRecommendationCounts();
    counts[id] = count;
    localStorage.setItem(this.recommendationCountKey, JSON.stringify(counts));
  }
  
  // 更新已读次数
  updateReadCount(id, count) {
    const counts = this.getReadCounts();
    counts[id] = count;
    localStorage.setItem(this.readCountKey, JSON.stringify(counts));
  }

  // 增加推荐计数
  incrementRecommendationCount(id) {
    const currentCount = this.getRecommendationCount(id);
    this.updateRecommendationCount(id, currentCount + 1);
  }
  
  // 增加已读次数并记录阅读时间
  async incrementReadCount(id) {
    try {
      await apiService.updateBlogReadInfo(id);
    } catch (error) {
      console.error('更新后端博客阅读信息失败，回退到localStorage:', error);
      const currentCount = this.getReadCount(id);
      this.updateReadCount(id, currentCount + 1);
      
      // 记录阅读时间
      const readingTimes = this.getReadingTimes();
      if (!readingTimes[id]) {
        readingTimes[id] = [];
      }
      readingTimes[id].push(new Date().toISOString());
      localStorage.setItem(this.readingTimesKey, JSON.stringify(readingTimes));
    }
  }

  // 删除推荐计数
  deleteRecommendationCount(id) {
    const counts = this.getRecommendationCounts();
    delete counts[id];
    localStorage.setItem(this.recommendationCountKey, JSON.stringify(counts));
  }
  
  // 删除已读次数
  deleteReadCount(id) {
    const counts = this.getReadCounts();
    delete counts[id];
    localStorage.setItem(this.readCountKey, JSON.stringify(counts));
  }
  
  // 删除阅读时间记录
  deleteReadingTimes(id) {
    const readingTimes = this.getReadingTimes();
    delete readingTimes[id];
    localStorage.setItem(this.readingTimesKey, JSON.stringify(readingTimes));
  }

  // 随机推荐博客，避免与上次重复
  async recommendBlog() {
    try {
      const recommendedBlog = await apiService.recommendBlog();
      // 更新本地推荐记录
      this.setLastRecommendedBlogId(recommendedBlog.id);
      this.incrementRecommendationCount(recommendedBlog.id);
      // 同步更新本地博客数据
      const blogs = await this.getBlogs();
      const updatedBlogs = blogs.map(blog => {
        if (blog.id === recommendedBlog.id) {
          return recommendedBlog;
        }
        return blog;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(updatedBlogs));
      return recommendedBlog;
    } catch (error) {
      console.error('从后端获取推荐博客失败，回退到localStorage:', error);
      const blogs = await this.getBlogs();
      if (blogs.length === 0) return null;
      if (blogs.length === 1) return blogs[0];

      const lastRecommendedId = this.getLastRecommendedBlogId();
      let recommendedBlog;

      // 筛选出与上次不同的博客
      const availableBlogs = blogs.filter(blog => blog.id !== lastRecommendedId);
      if (availableBlogs.length > 0) {
        // 随机选择
        const randomIndex = Math.floor(Math.random() * availableBlogs.length);
        recommendedBlog = availableBlogs[randomIndex];
      } else {
        // 如果只有一个博客，只能推荐它
        recommendedBlog = blogs[0];
      }

      // 更新推荐记录
      this.setLastRecommendedBlogId(recommendedBlog.id);
      this.incrementRecommendationCount(recommendedBlog.id);

      // 更新博客的最后推荐时间
      const updatedBlogs = blogs.map(blog => {
        if (blog.id === recommendedBlog.id) {
          return { ...blog, lastRecommendedAt: new Date().toISOString() };
        }
        return blog;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(updatedBlogs));

      return recommendedBlog;
    }
  }

  // 清空所有数据
  async clearAll() {
    try {
      const blogs = await apiService.clearBlogs();
      // 同步清空localStorage
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.lastRecommendedKey);
      localStorage.removeItem(this.recommendationCountKey);
      localStorage.removeItem(this.readCountKey); // 清空已读次数
      localStorage.removeItem(this.readingTimesKey); // 清空阅读时间记录
      return blogs;
    } catch (error) {
      console.error('清空后端博客数据失败，回退到localStorage:', error);
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.lastRecommendedKey);
      localStorage.removeItem(this.recommendationCountKey);
      localStorage.removeItem(this.readCountKey); // 清空已读次数
      localStorage.removeItem(this.readingTimesKey); // 清空阅读时间记录
      return [];
    }
  }
}

export default new BlogStorage();
