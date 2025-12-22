// 模拟前端调用API获取股票数据
const fetch = require('node-fetch');

async function testFrontendData() {
  // 测试股票代码：三一重工
  const symbol = '600031';
  const apiUrl = `http://192.3.252.100:5001/api/stocks/real-time/${symbol}`;
  
  console.log('测试前端API调用...');
  console.log(`请求URL: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('\nAPI返回数据:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n数据验证:');
    console.log(`PE值: ${data.pe} (预期: > 0)`);
    console.log(`PB值: ${data.pb} (预期: > 0)`);
    console.log(`总股本: ${data.totalShareCapital} (预期: 合理数值)`);
    
    // 检查数据是否正确
    if (data.pe > 0 && data.pb > 0) {
      console.log('\n✅ 测试通过：PE和PB数据正确显示！');
    } else {
      console.log('\n❌ 测试失败：PE或PB数据仍为0');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFrontendData();
