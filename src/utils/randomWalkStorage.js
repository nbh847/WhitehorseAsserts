import apiService from './apiService.js';

class RandomWalkStorage {
  constructor() {
    this.storageKey = 'randomWalkRecords';
    this.lastRecommendedKey = 'lastRecommendedRandomWalk';
    this.recommendationCountKey = 'randomWalkRecommendationCounts';
    this.readCountKey = 'randomWalkReadCounts';
    this.readingTimesKey = 'randomWalkReadingTimes';
  }

  // 获取所有随机漫步记录
  async getRecords() {
    try {
      const records = await apiService.getRandomWalkRecords();
      return records;
    } catch (error) {
      console.error('从后端获取随机漫步记录失败，使用本地存储:', error);
      const records = localStorage.getItem(this.storageKey);
      if (!records) return [];
      try {
        return JSON.parse(records);
      } catch (e) {
        console.error('解析本地随机漫步记录失败:', e);
        return [];
      }
    }
  }

  // 添加随机漫步记录
  async addRecord(record) {
    try {
      const newRecord = {
        title: record.title,
        content: record.content || '',
        tags: record.tags || [],
        type: record.type || 'thought'
      };
      const updatedRecords = await apiService.addRandomWalkRecord(newRecord);
      return updatedRecords;
    } catch (error) {
      console.error('向后端添加随机漫步记录失败，使用本地存储:', error);
      const records = await this.getRecords();
      const newRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: record.title,
        content: record.content || '',
        tags: record.tags || [],
        type: record.type || 'thought',
        addedAt: new Date().toISOString(),
        lastRecommendedAt: null
      };
      records.push(newRecord);
      localStorage.setItem(this.storageKey, JSON.stringify(records));
      this.updateRecommendationCount(newRecord.id, 0);
      this.updateReadCount(newRecord.id, 0);
      return records;
    }
  }

  // 删除随机漫步记录
  async deleteRecord(id) {
    try {
      const updatedRecords = await apiService.deleteRandomWalkRecord(id);
      return updatedRecords;
    } catch (error) {
      console.error('从后端删除随机漫步记录失败，使用本地存储:', error);
      const records = await this.getRecords();
      const updatedRecords = records.filter(record => record.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedRecords));
      this.deleteRecommendationCount(id);
      this.deleteReadCount(id);
      this.deleteReadingTimes(id);
      return updatedRecords;
    }
  }

  // 获取随机推荐
  async recommendRecord() {
    try {
      const recommendedRecord = await apiService.recommendRandomWalk();
      return recommendedRecord;
    } catch (error) {
      console.error('从后端获取随机推荐失败，使用本地存储:', error);
      const records = await this.getRecords();
      if (records.length === 0) return null;
      if (records.length === 1) return records[0];

      const lastRecommendedId = this.getLastRecommendedId();
      let recommendedRecord;

      // 筛选出与上次不同的记录
      const availableRecords = records.filter(record => record.id !== lastRecommendedId);
      if (availableRecords.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableRecords.length);
        recommendedRecord = availableRecords[randomIndex];
      } else {
        recommendedRecord = records[0];
      }

      // 更新推荐记录
      this.setLastRecommendedId(recommendedRecord.id);
      this.incrementRecommendationCount(recommendedRecord.id);

      // 更新记录的最后推荐时间
      const updatedRecords = records.map(record => {
        if (record.id === recommendedRecord.id) {
          return { ...record, lastRecommendedAt: new Date().toISOString() };
        }
        return record;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(updatedRecords));

      return recommendedRecord;
    }
  }

  // 获取上次推荐的记录ID
  getLastRecommendedId() {
    return localStorage.getItem(this.lastRecommendedKey);
  }

  // 设置上次推荐的记录ID
  setLastRecommendedId(id) {
    localStorage.setItem(this.lastRecommendedKey, id);
  }

  // 获取推荐计数
  async getRecommendationCounts() {
    try {
      const metadata = await apiService.getRandomWalkMetadata();
      return metadata.recommendationCounts || {};
    } catch (error) {
      console.error('从后端获取推荐计数失败，使用本地存储:', error);
      const counts = localStorage.getItem(this.recommendationCountKey);
      if (!counts) return {};
      try {
        return JSON.parse(counts);
      } catch (e) {
        console.error('解析本地推荐计数失败:', e);
        return {};
      }
    }
  }

  // 获取已读次数
  async getReadCounts() {
    try {
      const metadata = await apiService.getRandomWalkMetadata();
      return metadata.readCounts || {};
    } catch (error) {
      console.error('从后端获取已读次数失败，使用本地存储:', error);
      const counts = localStorage.getItem(this.readCountKey);
      if (!counts) return {};
      try {
        return JSON.parse(counts);
      } catch (e) {
        console.error('解析本地已读次数失败:', e);
        return {};
      }
    }
  }

  // 获取阅读时间记录
  async getReadingTimes() {
    try {
      const metadata = await apiService.getRandomWalkMetadata();
      return metadata.readingTimes || {};
    } catch (error) {
      console.error('从后端获取阅读时间记录失败，使用本地存储:', error);
      const times = localStorage.getItem(this.readingTimesKey);
      if (!times) return {};
      try {
        return JSON.parse(times);
      } catch (e) {
        console.error('解析本地阅读时间记录失败:', e);
        return {};
      }
    }
  }

  // 增加已读次数并记录阅读时间
  async incrementReadCount(id) {
    try {
      await apiService.updateRandomWalkReadCount(id);
    } catch (error) {
      console.error('向后端更新已读次数失败，使用本地存储:', error);
      const currentCount = await this.getReadCount(id);
      this.updateReadCount(id, currentCount + 1);
      
      // 记录阅读时间
      const readingTimes = await this.getReadingTimes();
      if (!readingTimes[id]) {
        readingTimes[id] = [];
      }
      readingTimes[id].push(new Date().toISOString());
      localStorage.setItem(this.readingTimesKey, JSON.stringify(readingTimes));
    }
  }

  // 获取特定记录的推荐计数
  async getRecommendationCount(id) {
    const counts = await this.getRecommendationCounts();
    return counts[id] || 0;
  }

  // 获取特定记录的已读次数
  async getReadCount(id) {
    const counts = await this.getReadCounts();
    return counts[id] || 0;
  }

  // 更新推荐计数（仅本地使用）
  updateRecommendationCount(id, count) {
    const counts = JSON.parse(localStorage.getItem(this.recommendationCountKey) || '{}');
    counts[id] = count;
    localStorage.setItem(this.recommendationCountKey, JSON.stringify(counts));
  }

  // 更新已读次数（仅本地使用）
  updateReadCount(id, count) {
    const counts = JSON.parse(localStorage.getItem(this.readCountKey) || '{}');
    counts[id] = count;
    localStorage.setItem(this.readCountKey, JSON.stringify(counts));
  }

  // 增加推荐计数（仅本地使用）
  incrementRecommendationCount(id) {
    const currentCount = this.getRecommendationCountLocal(id);
    this.updateRecommendationCount(id, currentCount + 1);
  }

  // 获取本地推荐计数（仅本地使用）
  getRecommendationCountLocal(id) {
    const counts = JSON.parse(localStorage.getItem(this.recommendationCountKey) || '{}');
    return counts[id] || 0;
  }

  // 删除推荐计数（仅本地使用）
  deleteRecommendationCount(id) {
    const counts = JSON.parse(localStorage.getItem(this.recommendationCountKey) || '{}');
    delete counts[id];
    localStorage.setItem(this.recommendationCountKey, JSON.stringify(counts));
  }

  // 删除已读次数（仅本地使用）
  deleteReadCount(id) {
    const counts = JSON.parse(localStorage.getItem(this.readCountKey) || '{}');
    delete counts[id];
    localStorage.setItem(this.readCountKey, JSON.stringify(counts));
  }

  // 删除阅读时间记录（仅本地使用）
  deleteReadingTimes(id) {
    const readingTimes = JSON.parse(localStorage.getItem(this.readingTimesKey) || '{}');
    delete readingTimes[id];
    localStorage.setItem(this.readingTimesKey, JSON.stringify(readingTimes));
  }

  // 清空所有数据
  async clearAll() {
    try {
      await apiService.clearRandomWalkRecords();
      return [];
    } catch (error) {
      console.error('从后端清空随机漫步记录失败，使用本地存储:', error);
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.lastRecommendedKey);
      localStorage.removeItem(this.recommendationCountKey);
      localStorage.removeItem(this.readCountKey);
      localStorage.removeItem(this.readingTimesKey);
      return [];
    }
  }
}

export default new RandomWalkStorage();