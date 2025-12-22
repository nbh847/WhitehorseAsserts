# 个人财务管理系统后端

这是一个基于Flask的个人财务管理系统后端，用于管理资产数据和股票数据，并将数据保存到本地文件。

## 功能特点

- **资产数据管理**：支持添加、删除、查询资产记录
- **股票数据管理**：支持添加、删除、更新、查询股票数据
- **数据持久化**：所有数据保存到本地JSON文件
- **跨域支持**：支持前端跨域请求
- **RESTful API**：提供标准的RESTful API接口

## 技术栈

- Flask 3.0.3：Python Web框架
- Flask-CORS 5.0.0：处理跨域请求
- Python-dotenv 1.0.1：环境变量管理

## 安装和运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行后端服务

```bash
python app.py
```

默认情况下，服务将在 `http://localhost:5000` 启动。

## API接口说明

### 资产记录接口

#### 获取所有资产记录
```
GET /api/assets
```

#### 添加资产记录
```
POST /api/assets
Content-Type: application/json

{
  "liveMoney": 10000,
  "investMoney": 50000,
  "bondMoney": 30000
}
```

#### 删除资产记录
```
DELETE /api/assets/<id>
```

#### 清空所有资产记录
```
DELETE /api/assets
```

#### 获取最新资产记录
```
GET /api/assets/latest
```

### 股票数据接口

#### 获取所有股票数据
```
GET /api/stocks
```

#### 添加股票数据
```
POST /api/stocks
Content-Type: application/json

{
  "code": "600031",
  "name": "三一重工",
  "buyPoint": 15.0,
  "sellPoint": 25.0,
  "shares": 1000,
  "currentPrice": 18.5,
  "ma51": 17.8,
  "ma120": 19.2,
  "ma250": 20.5,
  "ma850": 22.3
}
```

#### 删除股票数据
```
DELETE /api/stocks/<id>
```

#### 更新股票数据
```
PUT /api/stocks/<id>
Content-Type: application/json

{
  "currentPrice": 19.0,
  "ma51": 18.2,
  "ma120": 19.5,
  "ma250": 20.8,
  "ma850": 22.6
}
```

#### 清空所有股票数据
```
DELETE /api/stocks
```

## 数据存储

- 资产记录存储在：`data/asset_records.json`
- 股票数据存储在：`data/blue_chip_stocks.json`

这些文件将在首次运行时自动创建。

## 前端对接

前端需要将原来的localStorage操作替换为调用这些API接口。例如：

```javascript
// 原来的localStorage操作
this.records = storage.getRecordsSortedByDate()

// 替换为API调用
fetch('http://localhost:5000/api/assets')
  .then(response => response.json())
  .then(data => this.records = data)
```

## 注意事项

1. 默认端口为5000，如果需要修改端口，可以在 `app.py` 最后一行修改
2. 开发环境下请勿将此服务暴露到公网
3. 定期备份 `data` 文件夹以防止数据丢失