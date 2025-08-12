/**
 * 데이터 제공자 클래스
 * 대시보드 데이터를 중앙화하여 관리하고 API 통신을 담당
 */

console.log('📊 DataProvider script loading...');

if (typeof DataProvider !== 'undefined') {
  console.log('data-provider.js 이미 로드됨, 스킵');
} else {

class DataProvider {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분 캐시
    this.apiEndpoints = {
      stats: '/dashboard/api/stats',
      trends: '/dashboard/api/trends',
      statusDistribution: '/dashboard/api/status-distribution'
    };
    
    this.init();
  }

  init() {
    window.DataProvider = this;
    console.log('📊 DataProvider initialized');
  }

  /**
   * 통계 데이터 조회
   */
  async getStats() {
    const cacheKey = 'stats';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // API 호출 시뮬레이션 (실제로는 서버에서 데이터를 가져옴)
      const stats = await this.fetchStats();
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * 차트 데이터 조회
   */
  async getChartData(chartType) {
    const cacheKey = `chart-${chartType}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.fetchChartData(chartType);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch chart data for ${chartType}:`, error);
      return this.getMockChartData(chartType);
    }
  }

  /**
   * 실시간 데이터 업데이트 (WebSocket 또는 폴링)
   */
  startRealTimeUpdates(callback, interval = 30000) {
    const updateData = async () => {
      try {
        const freshData = await this.getStats();
        callback(freshData);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    };

    // 초기 데이터 로드
    updateData();

    // 주기적 업데이트
    return setInterval(updateData, interval);
  }

  /**
   * 통계 데이터 API 호출
   */
  async fetchStats() {
    try {
      const response = await fetch(this.apiEndpoints.stats);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('API fetch failed, using mock data:', error);
      return this.getMockStats();
    }
  }

  /**
   * 차트 데이터 API 호출
   */
  async fetchChartData(chartType) {
    try {
      // 차트 타입에 따라 적절한 API 엔드포인트 선택
      let endpoint;
      switch (chartType) {
        case 'line':
        case 'bar':
        case 'area':
          endpoint = this.apiEndpoints.trends;
          break;
        case 'pie':
          endpoint = this.apiEndpoints.statusDistribution;
          break;
        default:
          // 다른 차트 타입들은 목업 데이터 사용
          return this.getMockChartData(chartType);
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // API 데이터를 차트 라이브러리 형식으로 변환
      return this.transformApiDataToChartFormat(data, chartType);
    } catch (error) {
      console.warn(`Chart data API fetch failed for ${chartType}, using mock data:`, error);
      return this.getMockChartData(chartType);
    }
  }

  /**
   * API 데이터를 차트 라이브러리 형식으로 변환
   */
  transformApiDataToChartFormat(apiData, chartType) {
    switch (chartType) {
      case 'line':
      case 'area':
        if (Array.isArray(apiData)) {
          return {
            labels: apiData.map(item => item.month || item.label || item.name),
            datasets: [{
              label: '월별 문의량',
              data: apiData.map(item => item.count || item.value || item.y),
              borderColor: '#3b82f6',
              backgroundColor: chartType === 'area' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 1)',
              fill: chartType === 'area'
            }]
          };
        }
        break;
      case 'bar':
        if (Array.isArray(apiData)) {
          return {
            labels: apiData.map(item => item.month || item.label || item.name),
            datasets: [{
              label: '월별 문의량',
              data: apiData.map(item => item.count || item.value || item.y),
              backgroundColor: '#10b981'
            }]
          };
        }
        break;
      case 'pie':
        if (Array.isArray(apiData)) {
          return {
            labels: apiData.map(item => item.status || item.label || item.name),
            datasets: [{
              data: apiData.map(item => item.count || item.value || item.y),
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
          };
        }
        break;
    }
    
    // 변환 실패시 목업 데이터 반환
    return this.getMockChartData(chartType);
  }

  /**
   * 캐시에서 데이터 조회
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * 목업 통계 데이터
   */
  getMockStats() {
    return {
      totalInquiries: {
        title: '전체 문의',
        value: '1,247',
        change: '12%',
        changeLabel: '전월 대비',
        icon: 'fas fa-envelope',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        isPositive: true
      },
      pendingInquiries: {
        title: '답변 대기',
        value: '23',
        change: '5%',
        changeLabel: '어제 대비',
        icon: 'fas fa-clock',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        isPositive: false
      },
      completionRate: {
        title: '완료율',
        value: '94%',
        change: '2%',
        changeLabel: '이번 주',
        icon: 'fas fa-check-circle',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        isPositive: true
      },
      avgResponseTime: {
        title: '평균 응답시간',
        value: '2.4h',
        change: '15min',
        changeLabel: '향상됨',
        icon: 'fas fa-stopwatch',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        isPositive: true
      }
    };
  }

  /**
   * 목업 차트 데이터 생성
   */
  getMockChartData(chartType) {
    const mockData = {
      line: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [
          {
            label: '문의 접수',
            data: [65, 78, 90, 81, 56, 85],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: '처리 완료',
            data: [45, 64, 72, 71, 48, 78],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }
        ]
      },
      bar: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        datasets: [
          {
            label: '일별 문의량',
            data: [12, 19, 15, 25, 22, 8, 5],
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
              '#8b5cf6', '#06b6d4', '#84cc16'
            ]
          }
        ]
      },
      pie: {
        labels: ['처리완료', '진행중', '대기중', '보류'],
        datasets: [
          {
            data: [65, 20, 10, 5],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
          }
        ]
      },
      area: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [
          {
            label: '시간별 문의량',
            data: [5, 2, 8, 15, 22, 18, 12],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.3)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      bubble: {
        labels: ['제품군'],
        datasets: [
          {
            label: '제품 성과',
            data: [
              { x: 20, y: 30, r: 15 },  // 매출, 이익, 점유율
              { x: 40, y: 10, r: 10 },
              { x: 60, y: 50, r: 25 },
              { x: 30, y: 40, r: 12 },
              { x: 70, y: 35, r: 18 }
            ],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
          }
        ]
      },
      radar: {
        labels: ['품질', '가격', '서비스', '배송', '브랜드', '기능'],
        datasets: [
          {
            label: '우리 제품',
            data: [85, 70, 90, 80, 75, 88],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            pointBackgroundColor: '#3b82f6'
          },
          {
            label: '경쟁사',
            data: [70, 85, 75, 85, 90, 70],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            pointBackgroundColor: '#ef4444'
          }
        ]
      },
      gauge: {
        labels: ['완료율'],
        datasets: [
          {
            data: [75], // 75% 완료
            backgroundColor: '#10b981',
            borderColor: '#059669',
            gauge: {
              min: 0,
              max: 100,
              target: 90
            }
          }
        ]
      },
      funnel: {
        labels: ['방문자', '관심고객', '상담신청', '계약체결'],
        datasets: [
          {
            data: [1000, 400, 150, 50],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
          }
        ]
      }
    };

    return mockData[chartType] || mockData.line;
  }

  /**
   * 데이터 유효성 검사
   */
  validateData(data, type) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    switch (type) {
      case 'stats':
        return typeof data === 'object' && Object.keys(data).length > 0;
      
      case 'chart':
        return data.labels && Array.isArray(data.labels) && 
               data.datasets && Array.isArray(data.datasets);
      
      default:
        return true;
    }
  }

  /**
   * 오류 데이터 반환
   */
  getErrorData(type) {
    if (type === 'stats') {
      return {
        error: {
          title: '데이터 오류',
          value: '---',
          icon: 'fas fa-exclamation-triangle',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        }
      };
    }

    return {
      labels: ['오류'],
      datasets: [{
        label: '데이터 없음',
        data: [0],
        backgroundColor: '#ef4444'
      }]
    };
  }

  /**
   * 데이터 새로고침
   */
  async refreshData() {
    this.clearCache();
    
    try {
      const [stats, chartData] = await Promise.all([
        this.getStats(),
        Promise.all(['line', 'bar', 'pie', 'area', 'bubble', 'radar', 'gauge', 'funnel'].map(type => 
          this.getChartData(type)
        ))
      ]);

      // 데이터 새로고침 이벤트 발생
      window.dispatchEvent(new CustomEvent('dataRefreshed', {
        detail: { stats, chartData }
      }));

      return { stats, chartData };
    } catch (error) {
      console.error('Data refresh failed:', error);
      throw error;
    }
  }

  /**
   * 데이터 내보내기
   */
  exportData(format = 'json') {
    const allData = {
      stats: this.getFromCache('stats'),
      charts: {}
    };

    // 캐시된 차트 데이터 수집
    for (const [key, cached] of this.cache.entries()) {
      if (key.startsWith('chart-')) {
        const chartType = key.replace('chart-', '');
        allData.charts[chartType] = cached.data;
      }
    }

    switch (format) {
      case 'json':
        return JSON.stringify(allData, null, 2);
      
      case 'csv':
        // CSV 변환 로직 (간단한 구현)
        return this.convertToCSV(allData);
      
      default:
        return allData;
    }
  }

  /**
   * CSV 변환
   */
  convertToCSV(data) {
    let csv = 'Type,Name,Value\n';
    
    // 통계 데이터 추가
    if (data.stats) {
      for (const [key, stat] of Object.entries(data.stats)) {
        csv += `stat,${stat.title},${stat.value}\n`;
      }
    }

    return csv;
  }
}

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  if (!window.DataProvider) {
    new DataProvider();
  }
});} // DataProvider 정의 체크 종료
