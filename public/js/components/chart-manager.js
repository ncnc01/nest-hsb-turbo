/**
 * 차트 관리자 클래스
 * 다양한 차트 라이브러리를 통합 관리하고 재사용 가능한 차트 컴포넌트를 제공
 */

console.log('📊 ChartManager script loading...');

if (typeof ChartManager !== 'undefined') {
  console.log('chart-manager.js 이미 로드됨, 스킵');
} else {

class ChartManager {
  constructor() {
    this.charts = new Map(); // 차트 인스턴스 저장
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeInOutCubic'
      }
    };
    
    this.init();
  }

  init() {
    // 전역 객체에 등록
    window.ChartManager = this;
    
    // 차트 타입 변경 이벤트 리스너
    window.addEventListener('chartTypeChange', (event) => {
      const { chartId, chartType } = event.detail;
      this.switchChartType(chartId, chartType);
    });

    console.log('📊 ChartManager initialized');
  }

  /**
   * 차트 생성
   * @param {string} chartId - 차트 ID
   * @param {string} type - 차트 타입 ('line', 'bar', 'pie', 등)
   * @param {object} data - 차트 데이터
   * @param {object} options - 추가 옵션
   * @param {string} library - 사용할 라이브러리 ('chartjs', 'apexcharts', 'echarts')
   */
  createChart(chartId, type, data, options = {}, library = 'chartjs') {
    try {
      // 라이브러리 로드 상태 확인
      if (!this.isLibraryLoaded(library)) {
        console.warn(`Library '${library}' is not loaded. Using fallback library.`);
        library = this.getFallbackLibrary(type);
      }

      // 라이브러리별 지원하지 않는 차트 타입 확인
      if (!this.isChartTypeSupported(type, library)) {
        console.warn(`Chart type '${type}' is not properly supported by '${library}'. Using fallback library.`);
        library = this.getFallbackLibrary(type);
      }

      // 기존 차트 정리
      this.destroyChart(chartId);
      
      // 데이터 검증
      const safeData = this.sanitizeData(data, type);
      
      // 라이브러리별 차트 생성
      let chartInstance;
      
      switch (library) {
        case 'chartjs':
          chartInstance = this.createChartJS(chartId, type, safeData, options);
          break;
        case 'apexcharts':
          chartInstance = this.createApexChart(chartId, type, safeData, options);
          break;
        case 'd3':
          chartInstance = this.createD3Chart(chartId, type, safeData, options);
          break;
        case 'plotly':
          chartInstance = this.createPlotlyChart(chartId, type, safeData, options);
          break;
        case 'echarts':
          chartInstance = this.createEChart(chartId, type, safeData, options);
          break;
        default:
          throw new Error(`Unsupported chart library: ${library}`);
      }

      // 차트 인스턴스 저장
      this.charts.set(chartId, {
        instance: chartInstance,
        library,
        type,
        data: safeData,
        options
      });

      console.log(`✅ Chart created: ${chartId} (${library}/${type})`);
      return chartInstance;

    } catch (error) {
      console.error(`❌ Failed to create chart ${chartId}:`, error);
      this.showError(chartId, `차트 로딩 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * Chart.js 차트 생성
   */
  createChartJS(chartId, type, data, options) {
    const container = document.getElementById(chartId);
    if (!container) throw new Error(`Container not found: ${chartId}`);

    // Canvas 생성
    container.innerHTML = `<canvas id="${chartId}-canvas"></canvas>`;
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    const config = {
      type: this.mapChartType(type, 'chartjs'),
      data: this.convertDataFormat(data, 'chartjs', type),
      options: {
        ...this.defaultOptions,
        ...options,
        plugins: {
          legend: {
            position: type === 'gauge' ? 'top' : 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              filter: function(legendItem, chartData) {
                // Gauge 차트에서 'Remaining' 항목 숨기기
                if (type === 'gauge' && legendItem.text === 'Remaining') {
                  return false;
                }
                return true;
              }
            }
          },
          tooltip: {
            mode: type === 'bubble' ? 'point' : 'index',
            intersect: false,
            callbacks: type === 'gauge' ? {
              label: function(context) {
                if (context.dataIndex === 0) {
                  return `${context.label}: ${context.parsed}%`;
                }
                return null;
              }
            } : {}
          }
        },
        scales: this.getScalesConfig(type)
      }
    };

    // Funnel 차트의 경우 가로 바 차트로 설정
    if (type === 'funnel') {
      config.options.indexAxis = 'y';
      config.options.plugins.legend.display = false;
    }

    // Gauge 차트의 경우 특별 설정
    if (type === 'gauge') {
      config.options.circumference = 180;
      config.options.rotation = 270;
      config.options.cutout = '75%';
      config.options.plugins.tooltip.filter = function(tooltipItem) {
        return tooltipItem.dataIndex === 0;
      };
    };

    return new Chart(ctx, config);
  }

  /**
   * D3.js 차트 생성
   */
  createD3Chart(chartId, type, data, options) {
    const container = document.getElementById(chartId);
    if (!container) throw new Error(`Container not found: ${chartId}`);

    // D3 컨테이너 초기화
    container.innerHTML = `<svg id="${chartId}-d3" width="100%" height="100%"></svg>`;
    const svg = d3.select(`#${chartId}-d3`);
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // 차트 타입별 D3 차트 생성
    const chartInstance = {
      library: 'd3',
      container: svg,
      data: data,
      type: type
    };

    switch (type) {
      case 'line':
      case 'area':
        this.drawD3LineChart(svg, data, width, height, type === 'area');
        break;
      case 'bar':
        this.drawD3BarChart(svg, data, width, height);
        break;
      case 'pie':
        this.drawD3PieChart(svg, data, width, height);
        break;
      case 'bubble':
        this.drawD3BubbleChart(svg, data, width, height);
        break;
      default:
        // 기본적으로 line 차트로 그리기
        this.drawD3LineChart(svg, data, width, height);
    }

    return chartInstance;
  }

  /**
   * D3.js Line/Area 차트 그리기
   */
  drawD3LineChart(svg, data, width, height, isArea = false) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, data.labels.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data.datasets[0].data)])
      .range([innerHeight, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d));

    if (isArea) {
      const area = d3.area()
        .x((d, i) => x(i))
        .y0(innerHeight)
        .y1(d => y(d));

      g.append("path")
        .datum(data.datasets[0].data)
        .attr("fill", "rgba(59, 130, 246, 0.2)")
        .attr("d", area);
    }

    g.append("path")
      .datum(data.datasets[0].data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // X 축
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(data.labels.length));

    // Y 축
    g.append("g")
      .call(d3.axisLeft(y));
  }

  /**
   * D3.js Bar 차트 그리기
   */
  drawD3BarChart(svg, data, width, height) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.labels)
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data.datasets[0].data)])
      .range([innerHeight, 0]);

    g.selectAll(".bar")
      .data(data.datasets[0].data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(data.labels[i]))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d))
      .attr("fill", "#3b82f6");

    // X 축
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Y 축  
    g.append("g")
      .call(d3.axisLeft(y));
  }

  /**
   * D3.js Pie 차트 그리기
   */
  drawD3PieChart(svg, data, width, height) {
    const radius = Math.min(width, height) / 2 - 20;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    const pie = d3.pie()
      .value(d => d);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const colors = d3.scaleOrdinal()
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

    const arcs = g.selectAll(".arc")
      .data(pie(data.datasets[0].data))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colors(i));
  }

  /**
   * D3.js Bubble 차트 그리기
   */
  drawD3BubbleChart(svg, data, width, height) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dataset = data.datasets[0].data;
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.x)])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.y)])
      .range([innerHeight, 0]);

    const size = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.r)])
      .range([4, 20]);

    g.selectAll("circle")
      .data(dataset)
      .enter().append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", d => size(d.r))
      .attr("fill", "rgba(59, 130, 246, 0.5)")
      .attr("stroke", "#3b82f6");

    // X 축
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Y 축
    g.append("g")
      .call(d3.axisLeft(y));
  }

  /**
   * Plotly.js 차트 생성
   */
  createPlotlyChart(chartId, type, data, options) {
    const container = document.getElementById(chartId);
    if (!container) throw new Error(`Container not found: ${chartId}`);

    container.innerHTML = `<div id="${chartId}-plotly" style="width: 100%; height: 100%;"></div>`;
    const plotlyContainer = container.querySelector('div');

    const plotlyData = this.convertDataForPlotly(data, type);
    const layout = {
      autosize: true,
      margin: { l: 50, r: 30, t: 30, b: 50 },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 },
      ...options
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(plotlyContainer, plotlyData, layout, config);
    
    return {
      library: 'plotly',
      container: plotlyContainer,
      data: plotlyData,
      layout: layout
    };
  }

  /**
   * Plotly용 데이터 변환
   */
  convertDataForPlotly(data, type) {
    const plotlyData = [];

    switch (type) {
      case 'line':
      case 'area':
        data.datasets.forEach(dataset => {
          plotlyData.push({
            x: data.labels,
            y: dataset.data,
            type: 'scatter',
            mode: 'lines',
            name: dataset.label,
            fill: type === 'area' ? 'tozeroy' : 'none',
            line: { color: dataset.borderColor || '#3b82f6' }
          });
        });
        break;

      case 'bar':
        data.datasets.forEach(dataset => {
          plotlyData.push({
            x: data.labels,
            y: dataset.data,
            type: 'bar',
            name: dataset.label,
            marker: { color: dataset.backgroundColor || '#3b82f6' }
          });
        });
        break;

      case 'pie':
        plotlyData.push({
          labels: data.labels,
          values: data.datasets[0].data,
          type: 'pie',
          marker: {
            colors: data.datasets[0].backgroundColor || 
                   ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          }
        });
        break;

      case 'bubble':
        data.datasets.forEach(dataset => {
          const bubbleData = dataset.data.map(point => ({
            x: point.x,
            y: point.y,
            marker: { size: point.r }
          }));
          
          plotlyData.push({
            x: bubbleData.map(d => d.x),
            y: bubbleData.map(d => d.y),
            mode: 'markers',
            type: 'scatter',
            name: dataset.label,
            marker: {
              size: bubbleData.map(d => d.marker.size),
              color: dataset.backgroundColor || '#3b82f6',
              opacity: 0.6
            }
          });
        });
        break;

      case 'radar':
        data.datasets.forEach(dataset => {
          plotlyData.push({
            type: 'scatterpolar',
            r: dataset.data,
            theta: data.labels,
            fill: 'toself',
            name: dataset.label,
            line: { color: dataset.borderColor || '#3b82f6' }
          });
        });
        break;

      case 'gauge':
        const value = data.datasets[0].data[0];
        const max = data.datasets[0].gauge?.max || 100;
        plotlyData.push({
          type: 'indicator',
          mode: 'gauge+number',
          value: value,
          title: { text: data.datasets[0].label || 'Progress' },
          gauge: {
            axis: { range: [0, max] },
            bar: { color: '#10b981' },
            steps: [
              { range: [0, max * 0.5], color: '#e5e7eb' },
              { range: [max * 0.5, max], color: '#d1d5db' }
            ],
            threshold: {
              line: { color: 'red', width: 4 },
              thickness: 0.75,
              value: data.datasets[0].gauge?.target || max * 0.9
            }
          }
        });
        break;

      case 'funnel':
        plotlyData.push({
          type: 'funnel',
          y: data.labels,
          x: data.datasets[0].data,
          marker: {
            color: data.datasets[0].backgroundColor || 
                   ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
          }
        });
        break;

      default:
        // 기본적으로 line 차트로 처리
        data.datasets.forEach(dataset => {
          plotlyData.push({
            x: data.labels,
            y: dataset.data,
            type: 'scatter',
            mode: 'lines',
            name: dataset.label
          });
        });
    }

    return plotlyData;
  }

  /**
   * Chart.js 스케일 설정 생성
   */
  getScalesConfig(type) {
    if (type === 'pie' || type === 'doughnut' || type === 'gauge' || type === 'radar') {
      return {};
    }

    const baseConfig = {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          color: '#f3f4f6'
        }
      }
    };

    if (type === 'bubble') {
      baseConfig.x.type = 'linear';
      baseConfig.x.position = 'bottom';
    }

    if (type === 'funnel') {
      // 가로 바 차트용 설정
      return {
        x: {
          beginAtZero: true,
          grid: {
            color: '#f3f4f6'
          }
        },
        y: {
          grid: {
            color: '#f3f4f6'
          }
        }
      };
    }

    return baseConfig;
  }

  /**
   * ApexCharts 차트 생성
   */
  createApexChart(chartId, type, data, options) {
    const container = document.getElementById(chartId);
    if (!container) throw new Error(`Container not found: ${chartId}`);

    container.innerHTML = `<div id="${chartId}-apex"></div>`;
    const apexContainer = container.querySelector('div');

    const config = {
      chart: {
        type: this.mapChartType(type, 'apexcharts'),
        height: '100%',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      series: this.convertDataFormat(data, 'apexcharts', type),
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      dataLabels: {
        enabled: type === 'pie' || type === 'donut' || type === 'gauge'
      },
      legend: {
        position: 'bottom'
      },
      ...options
    };

    // 차트 타입별 특수 설정
    if (type === 'pie' || type === 'donut') {
      config.labels = data.labels || [];
    } else if (type === 'radar') {
      config.xaxis = {
        categories: data.labels || []
      };
      config.yaxis = {
        show: false
      };
    } else if (type === 'gauge') {
      config.plotOptions = {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: {
            margin: 15,
            size: '70%'
          },
          dataLabels: {
            name: {
              offsetY: -10,
              color: '#888',
              fontSize: '13px'
            },
            value: {
              offsetY: -50,
              fontSize: '22px'
            }
          }
        }
      };
      config.labels = [data.datasets?.[0]?.label || 'Progress'];
    } else if (type === 'funnel') {
      config.plotOptions = {
        funnel: {
          shape: 'funnel',
          height: '100%'
        }
      };
      config.dataLabels = {
        enabled: true,
        style: {
          fontSize: '12px'
        }
      };
    } else if (type !== 'bubble') {
      config.xaxis = {
        categories: data.labels || []
      };
    }

    try {
      const chart = new ApexCharts(apexContainer, config);
      chart.render();
      return chart;
    } catch (error) {
      console.error(`ApexCharts ${type} chart creation failed:`, error);
      // 오류 발생 시 기본 메시지 표시
      apexContainer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
            <p class="text-sm text-gray-600">ApexCharts ${type} 차트 로드 실패</p>
          </div>
        </div>
      `;
      return null;
    }
  }

  /**
   * ECharts 차트 생성
   */
  createEChart(chartId, type, data, options) {
    const container = document.getElementById(chartId);
    if (!container) throw new Error(`Container not found: ${chartId}`);

    container.innerHTML = `<div id="${chartId}-echarts" style="width: 100%; height: 100%;"></div>`;
    const echartsContainer = container.querySelector('div');

    const chart = echarts.init(echartsContainer);
    
    const config = {
      tooltip: {
        trigger: type === 'pie' || type === 'funnel' || type === 'gauge' ? 'item' : 'axis'
      },
      legend: {
        bottom: 0,
        data: data.datasets?.map(d => d.label) || data.labels || []
      },
      series: this.convertDataFormat(data, 'echarts', type),
      ...options
    };

    // 차트 타입별 축 설정
    if (type === 'radar') {
      config.radar = {
        indicator: data.labels?.map(label => ({ name: label, max: 100 })) || []
      };
      delete config.legend; // 레이더 차트는 범례를 다르게 처리
    } else if (type === 'bubble') {
      config.xAxis = {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      };
      config.yAxis = {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      };
    } else if (type !== 'pie' && type !== 'funnel' && type !== 'gauge') {
      config.xAxis = {
        type: 'category',
        data: data.labels || []
      };
      config.yAxis = {
        type: 'value'
      };
    }

    // 특수 차트 설정
    if (type === 'gauge') {
      config.tooltip = {
        formatter: '{a} <br/>{b} : {c}%'
      };
    }

    // 리사이즈 처리 함수 정의
    const resizeHandler = () => chart.resize();
    
    try {
      chart.setOption(config);
      
      // 리사이즈 이벤트 리스너 추가
      window.addEventListener('resize', resizeHandler);
      
      // 차트 인스턴스에 리사이즈 핸들러 저장
      chart.__resizeHandler = resizeHandler;
      
    } catch (error) {
      console.error(`ECharts ${type} chart creation failed:`, error);
      // 오류 발생 시 기본 메시지 표시
      echartsContainer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
            <p class="text-sm text-gray-600">ECharts ${type} 차트 로드 실패</p>
          </div>
        </div>
      `;
      return null;
    }

    return chart;
  }

  /**
   * 차트 타입 매핑
   */
  mapChartType(type, library) {
    const mapping = {
      chartjs: {
        line: 'line',
        bar: 'bar',
        pie: 'pie',
        doughnut: 'doughnut',
        area: 'line',
        bubble: 'bubble',
        radar: 'radar',
        gauge: 'doughnut', // Chart.js doesn't have native gauge, use doughnut
        funnel: 'bar' // Chart.js doesn't have native funnel, use horizontal bar
      },
      apexcharts: {
        line: 'line',
        bar: 'bar',
        pie: 'pie',
        doughnut: 'donut',
        area: 'area',
        bubble: 'scatter',
        radar: 'radar',
        gauge: 'radialBar',
        funnel: 'funnel'
      },
      d3: {
        line: 'line',
        bar: 'bar',
        pie: 'pie',
        doughnut: 'pie',
        area: 'area',
        bubble: 'bubble',
        radar: 'line', // D3는 레이더를 라인으로 처리
        gauge: 'pie', // D3는 게이지를 파이로 처리
        funnel: 'bar' // D3는 퍼널을 바로 처리
      },
      plotly: {
        line: 'scatter',
        bar: 'bar',
        pie: 'pie',
        doughnut: 'pie',
        area: 'scatter',
        bubble: 'scatter',
        radar: 'scatterpolar',
        gauge: 'indicator',
        funnel: 'funnel'
      },
      echarts: {
        line: 'line',
        bar: 'bar',
        pie: 'pie',
        doughnut: 'pie',
        area: 'line',
        bubble: 'scatter',
        radar: 'radar',
        gauge: 'gauge',
        funnel: 'funnel'
      }
    };

    return mapping[library]?.[type] || type;
  }

  /**
   * 데이터 형식 변환
   */
  convertDataFormat(data, library, type) {
    switch (library) {
      case 'chartjs':
        if (type === 'bubble') {
          return {
            ...data,
            datasets: data.datasets?.map(dataset => ({
              ...dataset,
              data: dataset.data?.map(point => ({
                x: point.x || 0,
                y: point.y || 0,
                r: point.r || 5
              })) || []
            })) || []
          };
        }
        if (type === 'gauge') {
          // Gauge를 doughnut으로 변환 (Chart.js용)
          const value = data.datasets?.[0]?.data?.[0] || 0;
          const max = data.datasets?.[0]?.gauge?.max || 100;
          const remaining = max - value;
          return {
            labels: [data.datasets[0].label || 'Value', 'Remaining'],
            datasets: [{
              data: [value, remaining],
              backgroundColor: [data.datasets[0].backgroundColor || '#10b981', '#e5e7eb'],
              borderWidth: 0,
              cutout: '70%'
            }]
          };
        }
        if (type === 'funnel') {
          // Funnel을 horizontal bar로 변환
          return {
            ...data,
            datasets: data.datasets?.map(dataset => ({
              ...dataset,
              backgroundColor: dataset.backgroundColor || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            })) || []
          };
        }
        return data;

      case 'd3':
        // D3는 기본 데이터 형식을 그대로 사용
        return data;
        
      case 'plotly':
        // Plotly는 별도 함수에서 처리
        return this.convertDataForPlotly(data, type);

      case 'apexcharts':
        if (type === 'pie' || type === 'donut') {
          return data.datasets?.[0]?.data || [];
        }
        if (type === 'bubble') {
          return data.datasets?.map(dataset => ({
            name: dataset.label,
            data: dataset.data?.map(point => [point.x, point.y, point.r]) || []
          })) || [];
        }
        if (type === 'radar') {
          return data.datasets?.map(dataset => ({
            name: dataset.label,
            data: dataset.data
          })) || [];
        }
        if (type === 'gauge') {
          const value = data.datasets?.[0]?.data?.[0] || 0;
          return [value];
        }
        if (type === 'funnel') {
          // ApexCharts funnel needs specific data format
          const funnelData = data.labels?.map((label, index) => {
            return {
              x: label,
              y: data.datasets?.[0]?.data?.[index] || 0
            };
          }) || [];
          
          return [{
            name: 'Funnel Series',
            data: funnelData
          }];
        }
        return data.datasets?.map(dataset => ({
          name: dataset.label,
          data: dataset.data
        })) || [];

      case 'echarts':
        if (type === 'pie') {
          return [{
            type: 'pie',
            radius: '70%',
            data: data.labels?.map((label, index) => ({
              name: label,
              value: data.datasets?.[0]?.data?.[index] || 0
            })) || []
          }];
        }
        if (type === 'bubble') {
          return [{
            type: 'scatter',
            symbolSize: function(data) {
              return data[2] || 10;
            },
            data: data.datasets?.[0]?.data?.map(point => [point.x, point.y, point.r]) || []
          }];
        }
        if (type === 'radar') {
          return data.datasets?.map(dataset => ({
            name: dataset.label,
            type: 'radar',
            data: [{
              value: dataset.data,
              name: dataset.label
            }]
          })) || [];
        }
        if (type === 'gauge') {
          const value = data.datasets?.[0]?.data?.[0] || 0;
          const max = data.datasets?.[0]?.gauge?.max || 100;
          const label = data.datasets?.[0]?.label || 'Progress';
          return [{
            type: 'gauge',
            radius: '75%',
            center: ['50%', '60%'],
            min: 0,
            max: max,
            axisLine: {
              lineStyle: {
                width: 30,
                color: [
                  [0.3, '#67e0e3'],
                  [0.7, '#37a2da'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: 'inherit'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 2
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 4
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: 40,
              fontSize: 12
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: 'inherit'
            },
            data: [{
              value: value,
              name: label
            }]
          }];
        }
        if (type === 'funnel') {
          return [{
            type: 'funnel',
            left: '10%',
            right: '10%',
            top: '60',
            bottom: '60',
            data: data.labels?.map((label, index) => ({
              name: label,
              value: data.datasets?.[0]?.data?.[index] || 0
            })) || []
          }];
        }
        return data.datasets?.map(dataset => ({
          name: dataset.label,
          type: this.mapChartType(type, 'echarts'),
          data: dataset.data,
          smooth: type === 'area'
        })) || [];

      default:
        return data;
    }
  }

  /**
   * 데이터 검증 및 정제
   */
  sanitizeData(data, type) {
    if (!data || typeof data !== 'object') {
      return this.getDefaultData(type);
    }

    // 특수 차트 타입에 대한 처리
    if (type === 'bubble') {
      return {
        labels: Array.isArray(data.labels) ? data.labels : [],
        datasets: Array.isArray(data.datasets) ? data.datasets.map(dataset => ({
          label: String(dataset.label || 'Dataset'),
          data: Array.isArray(dataset.data) ? dataset.data : [],
          backgroundColor: dataset.backgroundColor || '#3b82f6',
          borderColor: dataset.borderColor || '#3b82f6'
        })) : []
      };
    }

    if (type === 'gauge') {
      return {
        labels: Array.isArray(data.labels) ? data.labels : ['Progress'],
        datasets: Array.isArray(data.datasets) ? data.datasets : [{
          data: [0],
          gauge: { min: 0, max: 100 }
        }]
      };
    }

    const sanitized = {
      labels: Array.isArray(data.labels) ? data.labels : [],
      datasets: Array.isArray(data.datasets) ? data.datasets.map(dataset => ({
        label: String(dataset.label || 'Dataset'),
        data: Array.isArray(dataset.data) 
          ? dataset.data.map(val => isFinite(Number(val)) ? Number(val) : 0)
          : [],
        backgroundColor: dataset.backgroundColor || '#3b82f6',
        borderColor: dataset.borderColor || '#3b82f6'
      })) : []
    };

    // 빈 데이터인 경우 기본 데이터 사용
    if (sanitized.datasets.length === 0) {
      return this.getDefaultData(type);
    }

    return sanitized;
  }

  /**
   * 기본 데이터 생성
   */
  getDefaultData(type) {
    const defaultData = {
      line: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6'
        }]
      },
      bar: {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5],
          backgroundColor: '#3b82f6'
        }]
      },
      pie: {
        labels: ['Red', 'Blue', 'Green'],
        datasets: [{
          data: [30, 50, 20],
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981']
        }]
      },
      area: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [{
          label: 'Sample Data',
          data: [5, 10, 15, 10, 20, 15],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          fill: true
        }]
      },
      bubble: {
        labels: ['Data Points'],
        datasets: [{
          label: 'Sample Bubble',
          data: [
            { x: 10, y: 20, r: 10 },
            { x: 20, y: 30, r: 15 },
            { x: 30, y: 25, r: 8 }
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.5)'
        }]
      },
      radar: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F'],
        datasets: [{
          label: 'Sample Data',
          data: [80, 70, 90, 60, 75, 85],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6'
        }]
      },
      gauge: {
        labels: ['Progress'],
        datasets: [{
          data: [75],
          backgroundColor: '#10b981',
          gauge: { min: 0, max: 100, target: 90 }
        }]
      },
      funnel: {
        labels: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'],
        datasets: [{
          data: [100, 75, 50, 25],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }]
      }
    };

    return defaultData[type] || defaultData.line;
  }

  /**
   * 라이브러리 로드 상태 확인
   */
  isLibraryLoaded(library) {
    switch (library) {
      case 'chartjs':
        return typeof Chart !== 'undefined';
      case 'apexcharts':
        return typeof ApexCharts !== 'undefined';
      case 'd3':
        return typeof d3 !== 'undefined';
      case 'plotly':
        return typeof Plotly !== 'undefined';
      case 'echarts':
        return typeof echarts !== 'undefined';
      default:
        return false;
    }
  }

  /**
   * 라이브러리가 차트 타입을 제대로 지원하는지 확인
   */
  isChartTypeSupported(type, library) {
    const unsupportedCombinations = {
      'd3': ['radar', 'gauge', 'funnel'], // D3는 이 차트들을 제대로 지원하지 않음
      'apexcharts': ['funnel'], // ApexCharts는 funnel 차트를 지원하지 않음
      'echarts': [] // ECharts는 모든 차트 타입을 지원
    };

    const unsupported = unsupportedCombinations[library];
    return !unsupported || !unsupported.includes(type);
  }

  /**
   * 지원하지 않는 차트 타입에 대한 대체 라이브러리 반환
   */
  getFallbackLibrary(type) {
    const fallbacks = {
      'radar': 'apexcharts',  // 레이더는 ApexCharts로
      'gauge': 'apexcharts',  // 게이지는 ApexCharts로  
      'funnel': 'echarts'     // 퍼널은 ECharts로 (ApexCharts가 지원하지 않음)
    };

    return fallbacks[type] || 'chartjs';
  }

  /**
   * 차트 타입 변경
   */
  switchChartType(chartId, newLibrary) {
    const chartData = this.charts.get(chartId);
    if (!chartData) {
      console.warn(`Chart not found: ${chartId}`);
      return;
    }

    const { type, data, options } = chartData;
    this.createChart(chartId, type, data, options, newLibrary);
  }

  /**
   * 차트 업데이트
   */
  updateChart(chartId, newData) {
    const chartData = this.charts.get(chartId);
    if (!chartData) {
      console.warn(`Chart not found: ${chartId}`);
      return;
    }

    const { instance, library, type } = chartData;
    const safeData = this.sanitizeData(newData, type);

    try {
      switch (library) {
        case 'chartjs':
          instance.data = this.convertDataFormat(safeData, library, type);
          instance.update();
          break;
        
        case 'apexcharts':
          instance.updateSeries(this.convertDataFormat(safeData, library, type));
          break;
        
        case 'd3':
          // D3 차트 업데이트 - 다시 그리기
          const container = document.getElementById(chartId);
          const svg = d3.select(`#${chartId}-d3`);
          const width = container.offsetWidth;
          const height = container.offsetHeight;
          
          switch (type) {
            case 'line':
            case 'area':
              this.drawD3LineChart(svg, safeData, width, height, type === 'area');
              break;
            case 'bar':
              this.drawD3BarChart(svg, safeData, width, height);
              break;
            case 'pie':
              this.drawD3PieChart(svg, safeData, width, height);
              break;
            case 'bubble':
              this.drawD3BubbleChart(svg, safeData, width, height);
              break;
          }
          break;
          
        case 'plotly':
          // Plotly 차트 업데이트
          const plotlyData = this.convertDataForPlotly(safeData, type);
          Plotly.react(instance.container, plotlyData, instance.layout);
          break;
        
        case 'echarts':
          const option = {
            series: this.convertDataFormat(safeData, library, type)
          };
          if (type !== 'pie') {
            option.xAxis = { data: safeData.labels };
          }
          instance.setOption(option);
          break;
      }

      // 데이터 업데이트
      chartData.data = safeData;
      console.log(`🔄 Chart updated: ${chartId}`);

    } catch (error) {
      console.error(`❌ Failed to update chart ${chartId}:`, error);
    }
  }

  /**
   * 차트 삭제
   */
  destroyChart(chartId) {
    const chartData = this.charts.get(chartId);
    if (!chartData) return;

    const { instance, library } = chartData;

    try {
      switch (library) {
        case 'chartjs':
          if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
          }
          break;
        
        case 'apexcharts':
          if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
          }
          break;
          
        case 'd3':
          // D3 차트 정리
          if (instance && instance.container) {
            instance.container.selectAll("*").remove();
          }
          break;
          
        case 'plotly':
          // Plotly 차트 정리
          if (instance && instance.container) {
            Plotly.purge(instance.container);
          }
          break;
        
        case 'echarts':
          if (instance && typeof instance.dispose === 'function') {
            if (!instance.isDisposed()) {
              // 리사이즈 핸들러 제거
              if (instance.__resizeHandler) {
                window.removeEventListener('resize', instance.__resizeHandler);
              }
              instance.dispose();
            }
          }
          break;
      }

      this.charts.delete(chartId);
      console.log(`🗑️ Chart destroyed: ${chartId}`);

    } catch (error) {
      console.error(`❌ Failed to destroy chart ${chartId}:`, error);
    }
  }

  /**
   * 오류 표시
   */
  showError(chartId, message) {
    const container = document.getElementById(chartId);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-red-500">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p class="text-sm">${message}</p>
          </div>
        </div>
      `;
    }
  }

  /**
   * 모든 차트 정리
   */
  destroyAll() {
    for (const chartId of this.charts.keys()) {
      this.destroyChart(chartId);
    }
    console.log('🧹 All charts destroyed');
  }

  /**
   * 차트 목록 조회
   */
  getChartList() {
    return Array.from(this.charts.keys());
  }

  /**
   * 차트 정보 조회
   */
  getChartInfo(chartId) {
    const chartData = this.charts.get(chartId);
    if (!chartData) return null;

    return {
      id: chartId,
      library: chartData.library,
      type: chartData.type,
      hasData: chartData.data.datasets.length > 0
    };
  }
}

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  if (!window.ChartManager) {
    new ChartManager();
  }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (window.ChartManager) {
    window.ChartManager.destroyAll();
  }
});} // ChartManager 정의 체크 종료
