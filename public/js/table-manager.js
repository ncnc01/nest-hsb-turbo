/**
 * 테이블 매니저 - 다양한 테이블 라이브러리를 통합 관리
 */
class TableManager {
  constructor() {
    this.currentLibrary = 'basic';
    this.currentData = [];
    this.currentContainer = null;
    this.initialized = false;
  }

  /**
   * 테이블 매니저 초기화
   */
  async init() {
    if (this.initialized) return;
    
    // 필요한 라이브러리들을 동적으로 로드
    await this.loadLibraries();
    this.initialized = true;
  }

  /**
   * 필요한 테이블 라이브러리들을 동적으로 로드
   */
  async loadLibraries() {
    const libraries = {
      datatables: {
        css: [
          'https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css',
          'https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css'
        ],
        js: [
          'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js',
          'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js',
          'https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js',
          'https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
          'https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js'
        ]
      },
      tabulator: {
        css: [
          'https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css'
        ],
        js: [
          'https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js'
        ]
      },
      aggrid: {
        css: [
          'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css',
          'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-alpine.css'
        ],
        js: [
          'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js'
        ]
      },
      handsontable: {
        css: [
          'https://cdn.jsdelivr.net/npm/handsontable@13.1.0/dist/handsontable.full.min.css'
        ],
        js: [
          'https://cdn.jsdelivr.net/npm/handsontable@13.1.0/dist/handsontable.full.min.js'
        ]
      },
      gridjs: {
        css: [
          'https://unpkg.com/gridjs@6.2.0/dist/theme/mermaid.min.css'
        ],
        js: [
          'https://unpkg.com/gridjs@6.2.0/dist/gridjs.umd.js'
        ]
      }
    };

    // 라이브러리들을 순차적으로 로드
    for (const [name, config] of Object.entries(libraries)) {
      try {
        await this.loadLibrary(config);
        console.log(`${name} 라이브러리 로드 완료`);
      } catch (error) {
        console.warn(`${name} 라이브러리 로드 실패:`, error);
        // AG Grid는 실패해도 폴백이 있으므로 계속 진행
        if (name !== 'aggrid') {
          console.error(`${name} 라이브러리 로드 중단됨`);
        }
      }
    }
  }

  /**
   * 개별 라이브러리 로드
   */
  async loadLibrary(config) {
    // CSS 로드
    if (config.css) {
      for (const cssUrl of config.css) {
        await this.loadCSS(cssUrl);
      }
    }

    // JS 로드
    if (config.js) {
      for (const jsUrl of config.js) {
        await this.loadJS(jsUrl);
      }
    }
  }

  /**
   * 강제로 스크립트 재로드
   */
  async forceReloadScript(url) {
    // 기존 스크립트 제거
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // 캐시 방지를 위해 타임스탬프 추가
    const urlWithTimestamp = `${url}?t=${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = urlWithTimestamp;
      script.onload = () => {
        console.log(`스크립트 재로드 완료: ${url}`);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to reload script: ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * CSS 파일 동적 로드 (다중 CDN 지원)
   */
  async loadCSS(url) {
    // 이미 로드된 CSS인지 확인
    if (document.querySelector(`link[href="${url}"]`)) {
      return Promise.resolve();
    }

    // CSS용 다중 CDN 매핑
    const cdnAlternatives = {
      'ag-grid.css': [
        'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css',
        'https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css',
        'https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.0.3/ag-grid.css'
      ],
      'ag-theme-alpine.css': [
        'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-alpine.css',
        'https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css',
        'https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.0.3/ag-theme-alpine.css'
      ]
    };

    // URL에서 파일명 추출
    const fileName = url.split('/').pop();
    const alternatives = cdnAlternatives[fileName] || [url];

    for (let i = 0; i < alternatives.length; i++) {
      try {
        await new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = alternatives[i];
          link.onload = () => {
            console.log(`CSS 로드 성공: ${alternatives[i]}`);
            resolve();
          };
          link.onerror = () => {
            console.warn(`CSS 로드 실패: ${alternatives[i]}`);
            reject(new Error(`Failed to load CSS: ${alternatives[i]}`));
          };
          document.head.appendChild(link);
        });
        
        // 성공하면 루프 종료
        return;
        
      } catch (error) {
        console.warn(`CSS CDN ${i + 1}/${alternatives.length} 실패:`, error.message);
        
        // 마지막 시도도 실패했으면 에러 발생
        if (i === alternatives.length - 1) {
          console.error(`모든 CSS CDN 실패: ${fileName}`);
          // CSS는 JS만큼 중요하지 않으므로 실패해도 계속 진행
          return Promise.resolve();
        }
      }
    }
  }

  /**
   * JS 파일 동적 로드
   */
  loadJS(url) {
    return new Promise((resolve, reject) => {
      // 이미 로드된 스크립트인지 확인
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * 테이블 업데이트
   */
  async updateTable(library, container, data) {
    // 초기화 확인
    if (!this.initialized) {
      await this.init();
    }

    this.currentLibrary = library;
    this.currentData = data;
    this.currentContainer = container;

    // 기존 테이블 정리
    this.cleanup();

    switch (library) {
      case 'basic':
        this.renderBasicTable();
        break;
      case 'datatables':
        await this.renderDataTables();
        break;
      case 'tabulator':
        await this.renderTabulator();
        break;
      case 'aggrid':
        await this.renderAGGrid();
        break;
      case 'handsontable':
        await this.renderHandsontable();
        break;
      case 'gridjs':
        await this.renderGridJS();
        break;
      default:
        this.renderBasicTable();
    }
  }

  /**
   * 기존 테이블 정리
   */
  cleanup() {
    if (this.currentContainer) {
      // DataTables 인스턴스 정리
      if ($.fn.DataTable && $.fn.DataTable.isDataTable('#inquiry-table')) {
        $('#inquiry-table').DataTable().destroy();
      }
      
      // Tabulator 인스턴스 정리
      if (this.tabulatorInstance) {
        this.tabulatorInstance.destroy();
        this.tabulatorInstance = null;
      }

      // AG Grid 인스턴스 정리
      if (this.agGridInstance) {
        this.agGridInstance.destroy();
        this.agGridInstance = null;
      }

      // Grid.js 인스턴스 정리
      if (this.gridjsInstance) {
        this.gridjsInstance.destroy();
        this.gridjsInstance = null;
      }
    }
  }

  /**
   * 기본 테이블 렌더링
   */
  renderBasicTable() {
    location.reload();
  }

  /**
   * DataTables 렌더링
   */
  async renderDataTables() {
    if (typeof $ === 'undefined' || !$.fn.DataTable) {
      console.error('jQuery DataTables가 로드되지 않았습니다.');
      return;
    }

    const tableData = this.currentData.map(item => [
      `<div class="w-full max-w-xs">
        <div class="text-sm font-medium text-gray-900 truncate" title="${this.escapeHtml(item.title)}">${this.truncateText(item.title, 30)}</div>
       </div>`,
      `<div class="text-sm">
        <div class="text-gray-900 truncate" title="${this.escapeHtml(item.customerName)}">${this.truncateText(item.customerName, 15)}</div>
        <div class="text-gray-500 truncate text-xs" title="${this.escapeHtml(item.customerEmail)}">${this.truncateText(item.customerEmail, 20)}</div>
       </div>`,
      this.getCategoryBadge(item.category),
      this.getStatusBadge(item.status),
      this.getPriorityBadge(item.priority),
      this.formatDate(item.createdAt),
      `<div class="flex space-x-1 text-xs whitespace-nowrap">
        <a href="/inquiry/${item.id}" class="text-primary-600 hover:text-primary-700 px-2 py-1 rounded bg-primary-50">보기</a>
        <a href="/inquiry/${item.id}/edit" class="text-gray-600 hover:text-gray-700 px-2 py-1 rounded bg-gray-50">수정</a>
       </div>`
    ]);

    this.currentContainer.innerHTML = `
      <div class="w-full">
        <table id="inquiry-table" class="display table table-striped table-bordered" style="width:100%;">
          <thead>
            <tr>
              <th style="width: 30%;">문의사항</th>
              <th style="width: 20%;">고객</th>
              <th style="width: 12%;">카테고리</th>
              <th style="width: 10%;">상태</th>
              <th style="width: 10%;">우선순위</th>
              <th style="width: 12%;">등록일</th>
              <th style="width: 6%;">액션</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    // DataTables 초기화 with 고정 레이아웃
    $('#inquiry-table').DataTable({
      data: tableData,
      pageLength: 10,
      scrollX: false,
      scrollCollapse: false,
      responsive: false,
      autoWidth: false,
      fixedHeader: false,
      columnDefs: [
        { 
          width: "30%", 
          targets: 0,
          className: "text-sm",
          render: function(data, type, row) {
            return type === 'display' ? data : data.replace(/<[^>]*>/g, '');
          }
        },
        { 
          width: "20%", 
          targets: 1,
          className: "text-sm"
        },
        { 
          width: "12%", 
          targets: 2,
          className: "text-center text-sm"
        },
        { 
          width: "10%", 
          targets: 3,
          className: "text-center text-sm"
        },
        { 
          width: "10%", 
          targets: 4,
          className: "text-center text-sm"
        },
        { 
          width: "12%", 
          targets: 5,
          className: "text-sm whitespace-nowrap"
        },
        { 
          width: "6%", 
          targets: 6, 
          orderable: false,
          className: "text-center text-sm"
        }
      ],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/ko.json'
      },
      order: [[5, 'desc']], // 등록일 기준 내림차순
      dom: '<"row"<"col-sm-6"l><"col-sm-6"f>>' +
           '<"row"<"col-sm-12"<"table-responsive"t>>>' +
           '<"row"<"col-sm-5"i><"col-sm-7"p>>',
      drawCallback: function() {
        // 테이블이 그려진 후 스타일 적용
        $('#inquiry-table').css({
          'table-layout': 'fixed',
          'width': '100%'
        });
        
        // 셀 내용이 넘치지 않도록 처리
        $('#inquiry-table td').css({
          'word-wrap': 'break-word',
          'overflow': 'hidden',
          'text-overflow': 'ellipsis'
        });
      }
    });

    // 테이블 스타일 조정 제거 (더 이상 필요없음)
  }

  /**
   * Tabulator 렌더링
   */
  async renderTabulator() {
    if (typeof Tabulator === 'undefined') {
      console.error('Tabulator가 로드되지 않았습니다.');
      return;
    }

    this.currentContainer.innerHTML = '<div id="tabulator-table"></div>';

    // this 컨텍스트 보존
    const tableManager = this;
    
    this.tabulatorInstance = new Tabulator("#tabulator-table", {
      data: this.currentData,
      height: "400px",
      layout: "fitColumns",
      responsiveLayout: "hide",
      pagination: "local",
      paginationSize: 10,
      columns: [
        {
          title: "문의사항",
          field: "title",
          formatter: (cell) => {
            const data = cell.getData();
            return `<div class="max-w-xs">
              <div class="text-sm font-medium text-gray-900 truncate" title="${tableManager.escapeHtml(data.title)}">${tableManager.truncateText(data.title, 30)}</div>
            </div>`;
          }
        },
        {
          title: "고객",
          field: "customerName",
          formatter: (cell) => {
            const data = cell.getData();
            return `<div class="text-sm text-gray-900">${data.customerName}</div><div class="text-sm text-gray-500">${data.customerEmail}</div>`;
          }
        },
        { title: "카테고리", field: "category", formatter: (cell) => tableManager.getCategoryBadge(cell.getValue()) },
        { title: "상태", field: "status", formatter: (cell) => tableManager.getStatusBadge(cell.getValue()) },
        { title: "우선순위", field: "priority", formatter: (cell) => tableManager.getPriorityBadge(cell.getValue()) },
        { title: "등록일", field: "createdAt", formatter: (cell) => tableManager.formatDate(cell.getValue()) },
        {
          title: "액션",
          field: "id",
          formatter: (cell) => {
            const id = cell.getValue();
            return `<a href="/inquiry/${id}" class="text-primary-600 hover:text-primary-700 mr-2">보기</a><a href="/inquiry/${id}/edit" class="text-gray-600 hover:text-gray-700">수정</a>`;
          }
        }
      ]
    });
  }

  /**
   * AG Grid 렌더링
   */
  async renderAGGrid() {
    console.log('AG Grid 렌더링 시작...');
    
    // AG Grid 체크 및 대기 - 여러 방법으로 체크
    let attempts = 0;
    while (attempts < 15) {
      // 다양한 방법으로 AG Grid 확인
      if (typeof agGrid !== 'undefined' && agGrid.createGrid) {
        console.log('AG Grid 발견됨:', typeof agGrid);
        break;
      }
      if (typeof window.agGrid !== 'undefined' && window.agGrid.createGrid) {
        window.agGrid = window.agGrid;
        console.log('Window.agGrid 발견됨');
        break;
      }
      if (typeof window.agGridCommunity !== 'undefined') {
        window.agGrid = window.agGridCommunity;
        console.log('AgGridCommunity 발견됨');
        break;
      }
      
      console.log(`AG Grid 로딩 대기 중... 시도 ${attempts + 1}/15`);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    // 최종 확인
    let agGridLib = null;
    if (typeof agGrid !== 'undefined' && agGrid.createGrid) {
      agGridLib = agGrid;
    } else if (typeof window.agGrid !== 'undefined' && window.agGrid.createGrid) {
      agGridLib = window.agGrid;
    } else if (typeof window.agGridCommunity !== 'undefined' && window.agGridCommunity.createGrid) {
      agGridLib = window.agGridCommunity;
    }

    if (!agGridLib) {
      console.error('AG Grid를 로드할 수 없습니다. 사용 가능한 객체:', {
        agGrid: typeof agGrid,
        'window.agGrid': typeof window.agGrid,
        'window.agGridCommunity': typeof window.agGridCommunity
      });
      
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">AG Grid 로딩 실패</h3>
            <p class="text-red-600 mb-4">AG Grid 라이브러리를 로드할 수 없습니다.</p>
            <div class="text-sm text-red-500 mb-4 text-left">
              <p class="font-semibold mb-2">디버깅 정보:</p>
              <div class="bg-red-100 p-3 rounded font-mono text-xs">
                <p>typeof agGrid: ${typeof agGrid}</p>
                <p>typeof window.agGrid: ${typeof window.agGrid}</p>
                <p>typeof window.agGridCommunity: ${typeof window.agGridCommunity}</p>
                <p>AG Grid 스크립트: ${document.querySelectorAll('script[src*="ag-grid"]').length}개</p>
                <p>AG Grid CSS: ${document.querySelectorAll('link[href*="ag-grid"]').length}개</p>
                <p>시도 횟수: ${attempts}/15</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">새로고침</button>
              <button onclick="window.tableManager.retryAGGrid()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">재시도</button>
              <button onclick="checkAGGridStatus()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">상태확인</button>
              <button onclick="loadAGGridManually().then(() => window.tableManager.retryAGGrid())" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">수동로드</button>
              <button onclick="updateTable('basic')" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">기본테이블</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // AG Grid 컨테이너 생성 (CSS 로드 실패에 대비한 인라인 스타일 포함)
    this.currentContainer.innerHTML = `
      <div id="ag-grid-table" class="ag-theme-alpine w-full" style="
        height: 500px; 
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: white;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        overflow: hidden;
      ">
        <div class="ag-grid-loading" style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
        ">
          <div style="text-align: center;">
            <i class="fas fa-spinner fa-spin text-2xl mb-2" style="color: #3b82f6;"></i>
            <div>AG Grid 로딩 중...</div>
          </div>
        </div>
      </div>
    `;

    // this 컨텍스트 보존을 위해 변수에 저장
    const tableManager = this;
    
    const columnDefs = [
      {
        headerName: "문의사항",
        field: "title",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params) => {
          const title = tableManager.truncateText(params.data.title, 30);
          return `<div class="py-1">
            <div class="text-sm font-medium text-gray-900 truncate" title="${tableManager.escapeHtml(params.data.title)}">${tableManager.escapeHtml(title)}</div>
          </div>`;
        },
        cellStyle: { 'white-space': 'normal', 'line-height': '1.4' }
      },
      {
        headerName: "고객",
        field: "customerName", 
        flex: 1,
        minWidth: 150,
        cellRenderer: (params) => {
          return `<div class="py-1"><div class="text-sm text-gray-900">${params.data.customerName}</div><div class="text-sm text-gray-500">${params.data.customerEmail}</div></div>`;
        }
      },
      { 
        headerName: "카테고리", 
        field: "category", 
        width: 120,
        cellRenderer: (params) => tableManager.getCategoryBadge(params.value) 
      },
      { 
        headerName: "상태", 
        field: "status", 
        width: 100,
        cellRenderer: (params) => tableManager.getStatusBadge(params.value) 
      },
      { 
        headerName: "우선순위", 
        field: "priority", 
        width: 100,
        cellRenderer: (params) => tableManager.getPriorityBadge(params.value) 
      },
      { 
        headerName: "등록일", 
        field: "createdAt", 
        width: 120,
        cellRenderer: (params) => tableManager.formatDate(params.value),
        sort: 'desc'
      },
      {
        headerName: "액션",
        field: "id",
        width: 120,
        cellRenderer: (params) => {
          return `<div class="flex space-x-2 py-1"><a href="/inquiry/${params.value}" class="text-primary-600 hover:text-primary-700">보기</a><a href="/inquiry/${params.value}/edit" class="text-gray-600 hover:text-gray-700">수정</a></div>`;
        },
        sortable: false
      }
    ];

    const gridOptions = {
      columnDefs: columnDefs,
      rowData: this.currentData,
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [5, 10, 20, 50],
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true
      },
      rowHeight: 60,
      headerHeight: 40,
      suppressCellFocus: true,
      suppressRowClickSelection: true,
      animateRows: true,
      localeText: {
        // 한국어 텍스트
        page: '페이지',
        more: '더보기',
        to: '~',
        of: '/',
        next: '다음',
        last: '마지막',
        first: '첫번째',
        previous: '이전',
        loadingOoo: '로딩 중...',
        selectAll: '전체 선택',
        searchOoo: '검색...',
        blanks: '빈값',
        filterOoo: '필터...',
        applyFilter: '필터 적용',
        equals: '같음',
        notEqual: '다름',
        lessThan: '미만',
        greaterThan: '초과',
        inRange: '범위',
        contains: '포함',
        notContains: '포함하지 않음',
        startsWith: '시작',
        endsWith: '끝',
        noRowsToShow: '표시할 데이터가 없습니다'
      }
    };

    try {
      // 로딩 메시지 제거
      const loadingDiv = document.querySelector('.ag-grid-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }
      
      this.agGridInstance = agGridLib.createGrid(document.querySelector('#ag-grid-table'), gridOptions);
      console.log('AG Grid 초기화 완료');
      
      // CSS가 제대로 로드되지 않은 경우를 위한 기본 스타일 추가
      setTimeout(() => {
        const agGridElement = document.querySelector('#ag-grid-table');
        if (agGridElement) {
          // AG Grid가 제대로 렌더링되지 않은 경우 감지
          const gridRows = agGridElement.querySelectorAll('.ag-row');
          if (gridRows.length === 0) {
            console.warn('AG Grid 렌더링 문제 감지 - 폴백 테이블로 전환');
            this.renderAdvancedHtmlTable();
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('AG Grid 초기화 실패:', error);
      // AG Grid 실패 시 고급 HTML 테이블로 폴백
      this.renderAdvancedHtmlTable();
    }
  }

  /**
   * 고급 HTML 테이블 렌더링 (AG Grid 대체)
   */
  renderAdvancedHtmlTable() {
    console.log('고급 HTML 테이블로 폴백 중...');
    
    let tableHTML = `
      <div class="ag-grid-fallback">
        <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
            <span class="text-yellow-800 text-sm">AG Grid를 사용할 수 없어 고급 HTML 테이블로 표시합니다.</span>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="flex justify-between items-center p-4 bg-gray-50 border-b">
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">총 ${this.currentData.length}건</span>
              <div class="flex items-center space-x-2">
                <label class="text-xs text-gray-500">페이지 크기:</label>
                <select class="text-xs border rounded px-2 py-1" onchange="tableManager.changePageSize(this.value)">
                  <option value="5">5</option>
                  <option value="10" selected>10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <input type="text" placeholder="검색..." class="text-sm border rounded px-3 py-1 w-48" 
                     oninput="tableManager.filterTable(this.value)">
              <button class="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700" 
                      onclick="tableManager.exportToCSV()">CSV</button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200" style="table-layout: fixed;">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 30%;" onclick="tableManager.sortTable('title')">
                    문의사항 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 20%;" onclick="tableManager.sortTable('customerName')">
                    고객 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 12%;" onclick="tableManager.sortTable('category')">
                    카테고리 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 10%;" onclick="tableManager.sortTable('status')">
                    상태 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 10%;" onclick="tableManager.sortTable('priority')">
                    우선순위 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      style="width: 12%;" onclick="tableManager.sortTable('createdAt')">
                    등록일 <i class="fas fa-sort text-gray-400 ml-1"></i>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 6%;">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" id="advanced-table-body">
              </tbody>
            </table>
          </div>
          
          <div class="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div class="text-sm text-gray-700">
              <span id="table-info">1-10 / ${this.currentData.length}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1 border rounded text-sm hover:bg-gray-100" 
                      onclick="tableManager.previousPage()" id="prev-btn">이전</button>
              <span class="text-sm px-2" id="page-info">1 / 1</span>
              <button class="px-3 py-1 border rounded text-sm hover:bg-gray-100" 
                      onclick="tableManager.nextPage()" id="next-btn">다음</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.currentContainer.innerHTML = tableHTML;
    
    // 테이블 상태 초기화
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortColumn = 'createdAt';
    this.sortDirection = 'desc';
    this.filterText = '';
    this.filteredData = [...this.currentData];
    
    this.updateAdvancedTable();
  }

  /**
   * 고급 테이블 업데이트
   */
  updateAdvancedTable() {
    // 필터링
    this.filteredData = this.currentData.filter(item => {
      if (!this.filterText) return true;
      const searchText = this.filterText.toLowerCase();
      return item.title.toLowerCase().includes(searchText) ||
             item.customerName.toLowerCase().includes(searchText) ||
             item.customerEmail.toLowerCase().includes(searchText) ||
             item.category.toLowerCase().includes(searchText) ||
             item.status.toLowerCase().includes(searchText) ||
             item.priority.toLowerCase().includes(searchText);
    });

    // 정렬
    this.filteredData.sort((a, b) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];
      
      if (this.sortColumn === 'createdAt') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // 페이지네이션
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    // 테이블 바디 렌더링
    const tbody = document.getElementById('advanced-table-body');
    if (tbody) {
      tbody.innerHTML = pageData.map(item => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 text-sm" style="width: 30%;">
            <div class="truncate" title="${this.escapeHtml(item.title)}">
              ${this.escapeHtml(this.truncateText(item.title, 30))}
            </div>
          </td>
          <td class="px-4 py-3 text-sm" style="width: 20%;">
            <div class="truncate font-medium">${this.escapeHtml(item.customerName)}</div>
            <div class="truncate text-gray-500 text-xs">${this.escapeHtml(item.customerEmail)}</div>
          </td>
          <td class="px-4 py-3 text-center text-sm" style="width: 12%;">
            ${this.getCategoryBadge(item.category)}
          </td>
          <td class="px-4 py-3 text-center text-sm" style="width: 10%;">
            ${this.getStatusBadge(item.status)}
          </td>
          <td class="px-4 py-3 text-center text-sm" style="width: 10%;">
            ${this.getPriorityBadge(item.priority)}
          </td>
          <td class="px-4 py-3 text-center text-sm whitespace-nowrap" style="width: 12%;">
            ${this.formatDate(item.createdAt)}
          </td>
          <td class="px-4 py-3 text-center text-sm" style="width: 6%;">
            <div class="flex justify-center space-x-1">
              <a href="/inquiry/${item.id}" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded">보기</a>
              <a href="/inquiry/${item.id}/edit" class="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 bg-gray-50 rounded">수정</a>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 페이지네이션 정보 업데이트
    const tableInfo = document.getElementById('table-info');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (tableInfo) {
      const start = startIndex + 1;
      const end = Math.min(endIndex, this.filteredData.length);
      tableInfo.textContent = `${start}-${end} / ${this.filteredData.length}`;
    }
    
    if (pageInfo) {
      pageInfo.textContent = `${this.currentPage} / ${totalPages}`;
    }
    
    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
      prevBtn.classList.toggle('opacity-50', this.currentPage <= 1);
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
      nextBtn.classList.toggle('opacity-50', this.currentPage >= totalPages);
    }
  }

  // 고급 테이블 유틸리티 메서드들
  sortTable(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.updateAdvancedTable();
  }

  filterTable(text) {
    this.filterText = text;
    this.currentPage = 1;
    this.updateAdvancedTable();
  }

  changePageSize(size) {
    this.pageSize = parseInt(size);
    this.currentPage = 1;
    this.updateAdvancedTable();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateAdvancedTable();
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateAdvancedTable();
    }
  }

  exportToCSV() {
    const headers = ['문의사항', '고객명', '이메일', '카테고리', '상태', '우선순위', '등록일'];
    const csvContent = [
      headers.join(','),
      ...this.filteredData.map(item => [
        `"${item.title}"`,
        `"${item.customerName}"`,
        `"${item.customerEmail}"`,
        `"${item.category}"`,
        `"${item.status}"`,
        `"${item.priority}"`,
        `"${this.formatDate(item.createdAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '문의사항목록.csv';
    link.click();
  }

  /**
   * AG Grid 재시도 메서드
   */
  async retryAGGrid() {
    console.log('AG Grid 재시도 중...');
    const container = this.currentContainer;
    const data = this.currentData;
    
    // 강제로 라이브러리 다시 로드
    try {
      // 기존 AG Grid 관련 전역 변수 제거
      if (typeof window.agGrid !== 'undefined') {
        delete window.agGrid;
      }
      if (typeof window.agGridCommunity !== 'undefined') {
        delete window.agGridCommunity;
      }
      
      // 스크립트 강제 재로드
      await this.forceReloadScript('https://unpkg.com/ag-grid-community@31.0.3/dist/ag-grid-community.min.js');
      
      // 잠시 대기 후 다시 시도
      setTimeout(async () => {
        await this.renderAGGrid();
      }, 1000);
      
    } catch (error) {
      console.error('AG Grid 재로딩 실패:', error);
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-times-circle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">AG Grid 재로딩 실패</h3>
            <p class="text-red-600">AG Grid를 다시 로드할 수 없습니다.</p>
            <button onclick="updateTable('basic')" class="mt-3 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">기본 테이블로 돌아가기</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Handsontable 렌더링
   */
  async renderHandsontable() {
    // Handsontable 체크 및 대기
    let attempts = 0;
    while (typeof Handsontable === 'undefined' && attempts < 10) {
      console.log('Handsontable 로딩 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (typeof Handsontable === 'undefined') {
      console.error('Handsontable을 로드할 수 없습니다.');
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Handsontable 로딩 실패</h3>
            <p class="text-red-600">Handsontable 라이브러리를 로드할 수 없습니다.</p>
            <button onclick="location.reload()" class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">새로고침</button>
          </div>
        </div>
      `;
      return;
    }

    this.currentContainer.innerHTML = '<div id="handsontable-table" style="height: 400px; width: 100%; overflow: hidden;"></div>';

    const data = this.currentData.map(item => [
      this.truncateText(item.title, 30),
      item.customerName,
      item.customerEmail,
      item.category,
      item.status,
      item.priority,
      this.formatDate(item.createdAt),
      item.id
    ]);

    const headers = ['문의사항', '고객명', '이메일', '카테고리', '상태', '우선순위', '등록일', 'ID'];

    try {
      this.handsontableInstance = new Handsontable(document.getElementById('handsontable-table'), {
        data: data,
        colHeaders: headers,
        rowHeaders: true,
        width: '100%',
        height: 400,
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        autoWrapRow: true,
        autoWrapCol: true,
        manualRowResize: true,
        manualColumnResize: true,
        contextMenu: true,
        filters: true,
        dropdownMenu: true,
        columnSorting: {
          indicator: true,
          sortEmptyCells: true,
          headerAction: true,
          compareFunctionFactory: function(sortOrder, columnMeta) {
            return function(value, nextValue) {
              if (value < nextValue) return sortOrder === 'asc' ? -1 : 1;
              if (value > nextValue) return sortOrder === 'asc' ? 1 : -1;
              return 0;
            };
          }
        },
        columns: [
          { data: 0, width: 200, wordWrap: true },
          { data: 1, width: 120 },
          { data: 2, width: 150 },
          { data: 3, width: 100, renderer: this.categoryRenderer.bind(this) },
          { data: 4, width: 100, renderer: this.statusRenderer.bind(this) },
          { data: 5, width: 100, renderer: this.priorityRenderer.bind(this) },
          { data: 6, width: 120 },
          { data: 7, width: 100, renderer: this.actionRenderer.bind(this) }
        ],
        afterInit: function() {
          console.log('Handsontable 초기화 완료');
        }
      });
    } catch (error) {
      console.error('Handsontable 초기화 실패:', error);
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Handsontable 초기화 실패</h3>
            <p class="text-red-600">테이블을 초기화할 수 없습니다: ${error.message}</p>
            <button onclick="location.reload()" class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">새로고침</button>
          </div>
        </div>
      `;
    }
  }

  // Handsontable 렌더러 함수들
  categoryRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = this.getCategoryBadge(value);
    return td;
  }

  statusRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = this.getStatusBadge(value);
    return td;
  }

  priorityRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = this.getPriorityBadge(value);
    return td;
  }

  actionRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = `<div class="flex space-x-2"><a href="/inquiry/${value}" class="text-primary-600 hover:text-primary-700">보기</a><a href="/inquiry/${value}/edit" class="text-gray-600 hover:text-gray-700">수정</a></div>`;
    return td;
  }

  /**
   * Grid.js 렌더링
   */
  async renderGridJS() {
    // Grid.js 체크 및 대기
    let attempts = 0;
    while (typeof gridjs === 'undefined' && attempts < 10) {
      console.log('Grid.js 로딩 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (typeof gridjs === 'undefined') {
      console.error('Grid.js를 로드할 수 없습니다.');
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Grid.js 로딩 실패</h3>
            <p class="text-red-600">Grid.js 라이브러리를 로드할 수 없습니다.</p>
            <button onclick="location.reload()" class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">새로고침</button>
          </div>
        </div>
      `;
      return;
    }

    this.currentContainer.innerHTML = '<div id="gridjs-table" class="w-full"></div>';

    const data = this.currentData.map(item => [
      this.truncateText(item.title, 30),
      [item.customerName, item.customerEmail].join('\n'),
      item.category,
      item.status,
      item.priority,
      this.formatDate(item.createdAt),
      item.id
    ]);

    // this 컨텍스트 보존
    const tableManager = this;
    
    try {
      this.gridjsInstance = new gridjs.Grid({
        columns: [
          { 
            name: '문의사항',
            width: '30%',
            formatter: (cell) => {
              return gridjs.html(`<div class="py-1">
                <div class="text-sm font-medium text-gray-900 truncate" title="${tableManager.escapeHtml(cell)}">${tableManager.escapeHtml(cell)}</div>
              </div>`);
            }
          },
          { 
            name: '고객',
            width: '20%',
            formatter: (cell) => {
              const lines = cell.split('\n');
              return gridjs.html(`<div class="py-1"><div class="text-sm text-gray-900">${lines[0]}</div><div class="text-sm text-gray-500">${lines[1] || ''}</div></div>`);
            }
          },
          { 
            name: '카테고리',
            width: '12%',
            formatter: (cell) => gridjs.html(tableManager.getCategoryBadge(cell))
          },
          { 
            name: '상태',
            width: '12%',
            formatter: (cell) => gridjs.html(tableManager.getStatusBadge(cell))
          },
          { 
            name: '우선순위',
            width: '12%',
            formatter: (cell) => gridjs.html(tableManager.getPriorityBadge(cell))
          },
          { 
            name: '등록일',
            width: '12%'
          },
          { 
            name: '액션',
            width: '12%',
            sort: false,
            formatter: (cell) => gridjs.html(`<div class="flex space-x-2"><a href="/inquiry/${cell}" class="text-primary-600 hover:text-primary-700">보기</a><a href="/inquiry/${cell}/edit" class="text-gray-600 hover:text-gray-700">수정</a></div>`)
          }
        ],
        data: data,
        pagination: {
          limit: 10,
          summary: true
        },
        search: {
          enabled: true,
          placeholder: '검색...'
        },
        sort: {
          multiColumn: false
        },
        resizable: true,
        language: {
          'search': {
            'placeholder': '🔍 검색...'
          },
          'pagination': {
            'previous': '이전',
            'next': '다음',
            'navigate': (page, pages) => `페이지 ${page} / ${pages}`,
            'page': (page) => `페이지 ${page}`,
            'showing': '표시 중',
            'of': '/',
            'to': '~',
            'results': '결과'
          },
          'loading': '로딩 중...',
          'noRecordsFound': '데이터가 없습니다.',
          'error': '오류가 발생했습니다.'
        },
        style: {
          table: {
            'font-size': '14px'
          },
          th: {
            'background-color': '#f9fafb',
            'color': '#374151',
            'border-bottom': '2px solid #e5e7eb',
            'padding': '12px 8px',
            'font-weight': '600'
          },
          td: {
            'padding': '12px 8px',
            'border-bottom': '1px solid #f3f4f6'
          }
        }
      }).render(document.getElementById('gridjs-table'));
      
      console.log('Grid.js 초기화 완료');
    } catch (error) {
      console.error('Grid.js 초기화 실패:', error);
      this.currentContainer.innerHTML = `
        <div class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Grid.js 초기화 실패</h3>
            <p class="text-red-600">테이블을 초기화할 수 없습니다: ${error.message}</p>
            <button onclick="location.reload()" class="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">새로고침</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * 카테고리 뱃지 생성
   */
  getCategoryBadge(category) {
    const labels = {
      'technical': '기술 지원',
      'billing': '결제/청구',
      'account': '계정 관리',
      'general': '일반 문의'
    };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">${labels[category] || category}</span>`;
  }

  /**
   * 상태 뱃지 생성
   */
  getStatusBadge(status) {
    const config = {
      'pending': { label: '대기', class: 'bg-orange-100 text-orange-800' },
      'in_progress': { label: '진행중', class: 'bg-blue-100 text-blue-800' },
      'completed': { label: '완료', class: 'bg-green-100 text-green-800' },
      'closed': { label: '종료', class: 'bg-gray-100 text-gray-800' }
    };
    const item = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.class}">${item.label}</span>`;
  }

  /**
   * 우선순위 뱃지 생성
   */
  getPriorityBadge(priority) {
    const config = {
      'low': { label: '낮음', class: 'bg-green-100 text-green-800' },
      'medium': { label: '보통', class: 'bg-blue-100 text-blue-800' },
      'high': { label: '높음', class: 'bg-orange-100 text-orange-800' },
      'urgent': { label: '긴급', class: 'bg-red-100 text-red-800' }
    };
    const item = config[priority] || { label: priority, class: 'bg-gray-100 text-gray-800' };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.class}">${item.label}</span>`;
  }

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * 텍스트 자르기
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}

// 전역 인스턴스
window.tableManager = new TableManager();