/**
 * AG Grid 테스트 및 디버깅 도구
 */

// AG Grid 상태 체크 함수
window.checkAGGridStatus = function() {
  console.log('=== AG Grid 상태 체크 ===');
  console.log('typeof agGrid:', typeof agGrid);
  console.log('typeof window.agGrid:', typeof window.agGrid);
  console.log('typeof window.agGridCommunity:', typeof window.agGridCommunity);
  
  if (typeof agGrid !== 'undefined') {
    console.log('agGrid 객체:', agGrid);
    console.log('agGrid.createGrid:', typeof agGrid.createGrid);
  }
  
  if (typeof window.agGrid !== 'undefined') {
    console.log('window.agGrid 객체:', window.agGrid);
    console.log('window.agGrid.createGrid:', typeof window.agGrid.createGrid);
  }
  
  if (typeof window.agGridCommunity !== 'undefined') {
    console.log('window.agGridCommunity 객체:', window.agGridCommunity);
    console.log('window.agGridCommunity.createGrid:', typeof window.agGridCommunity.createGrid);
  }

  // 스크립트 태그 확인
  const scripts = Array.from(document.querySelectorAll('script')).filter(s => 
    s.src && s.src.includes('ag-grid')
  );
  console.log('AG Grid 스크립트 태그들:', scripts.map(s => s.src));
  
  // CSS 확인
  const styles = Array.from(document.querySelectorAll('link')).filter(l => 
    l.href && l.href.includes('ag-grid')
  );
  console.log('AG Grid CSS 링크들:', styles.map(l => l.href));
};

// AG Grid 수동 로드 함수
window.loadAGGridManually = async function() {
  console.log('AG Grid 수동 로드 시작...');
  
  try {
    // CSS 로드 - 다중 CDN 지원 (공식 CDN 우선)
    const cssUrls = [
      {
        name: 'ag-grid.css',
        urls: [
          'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css',
          'https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css',
          'https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.0.3/ag-grid.css'
        ]
      },
      {
        name: 'ag-theme-alpine.css', 
        urls: [
          'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-alpine.css',
          'https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css',
          'https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.0.3/ag-theme-alpine.css'
        ]
      }
    ];
    
    for (const cssGroup of cssUrls) {
      let loaded = false;
      
      // 이미 로드된 CSS가 있는지 확인
      for (const url of cssGroup.urls) {
        if (document.querySelector(`link[href="${url}"]`)) {
          console.log(`${cssGroup.name} 이미 로드됨:`, url);
          loaded = true;
          break;
        }
      }
      
      if (!loaded) {
        // 여러 CDN 시도
        for (let i = 0; i < cssGroup.urls.length; i++) {
          try {
            await new Promise((resolve, reject) => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = cssGroup.urls[i];
              link.onload = () => {
                console.log(`${cssGroup.name} CSS 로드 성공:`, cssGroup.urls[i]);
                resolve();
              };
              link.onerror = () => {
                console.warn(`${cssGroup.name} CSS 로드 실패:`, cssGroup.urls[i]);
                reject(new Error(`CSS load failed: ${cssGroup.urls[i]}`));
              };
              document.head.appendChild(link);
            });
            break; // 성공하면 다음 CDN 시도하지 않음
          } catch (error) {
            console.warn(`${cssGroup.name} CDN ${i + 1}/${cssGroup.urls.length} 실패:`, error.message);
            if (i === cssGroup.urls.length - 1) {
              console.error(`${cssGroup.name} 모든 CDN 실패 - CSS 없이 계속 진행`);
            }
          }
        }
      }
    }
    
    // JS 로드 - 여러 CDN 시도 (공식 CDN 우선)
    const jsUrls = [
      'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js',
      'https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.0.3/ag-grid-community.min.js'
    ];
    
    // 기존 스크립트들 제거
    const existingScripts = document.querySelectorAll('script[src*="ag-grid"]');
    existingScripts.forEach(script => script.remove());
    console.log(`기존 AG Grid 스크립트 ${existingScripts.length}개 제거됨`);
    
    // 여러 CDN 순차적으로 시도
    for (let i = 0; i < jsUrls.length; i++) {
      try {
        console.log(`AG Grid 로드 시도 ${i + 1}/${jsUrls.length}: ${jsUrls[i]}`);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = jsUrls[i];
          script.onload = () => {
            console.log(`AG Grid 스크립트 로드 완료: ${jsUrls[i]}`);
            setTimeout(() => {
              checkAGGridStatus();
              resolve();
            }, 500);
          };
          script.onerror = () => {
            console.error(`AG Grid 스크립트 로드 실패: ${jsUrls[i]}`);
            reject(new Error(`AG Grid 스크립트 로드 실패: ${jsUrls[i]}`));
          };
          document.head.appendChild(script);
        });
        
        // 로드 성공하면 루프 종료
        console.log('AG Grid 로드 성공!');
        break;
        
      } catch (error) {
        console.warn(`CDN ${i + 1} 실패:`, error.message);
        if (i === jsUrls.length - 1) {
          throw new Error('모든 AG Grid CDN 로드 실패');
        }
        // 다음 CDN 시도 전 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
  } catch (error) {
    console.error('AG Grid 수동 로드 실패:', error);
    throw error;
  }
};

// 간단한 AG Grid 테스트
window.testAGGrid = async function() {
  console.log('AG Grid 테스트 시작...');
  
  // 상태 체크
  checkAGGridStatus();
  
  // AG Grid 찾기
  let agGridLib = null;
  if (typeof agGrid !== 'undefined' && agGrid.createGrid) {
    agGridLib = agGrid;
  } else if (typeof window.agGrid !== 'undefined' && window.agGrid.createGrid) {
    agGridLib = window.agGrid;
  } else if (typeof window.agGridCommunity !== 'undefined' && window.agGridCommunity.createGrid) {
    agGridLib = window.agGridCommunity;
  }
  
  if (!agGridLib) {
    console.error('AG Grid를 찾을 수 없습니다.');
    return false;
  }
  
  try {
    // 테스트 컨테이너 생성
    let testContainer = document.getElementById('ag-grid-test');
    if (!testContainer) {
      testContainer = document.createElement('div');
      testContainer.id = 'ag-grid-test';
      testContainer.className = 'ag-theme-alpine';
      testContainer.style.height = '200px';
      testContainer.style.width = '100%';
      testContainer.style.margin = '20px 0';
      document.body.appendChild(testContainer);
    }
    
    // 간단한 테스트 데이터
    const testData = [
      { name: '테스트1', value: 100 },
      { name: '테스트2', value: 200 }
    ];
    
    const gridOptions = {
      columnDefs: [
        { field: 'name', headerName: '이름' },
        { field: 'value', headerName: '값' }
      ],
      rowData: testData
    };
    
    // AG Grid 생성
    const gridApi = agGridLib.createGrid(testContainer, gridOptions);
    console.log('AG Grid 테스트 성공!', gridApi);
    
    // 3초 후 제거
    setTimeout(() => {
      if (gridApi && gridApi.destroy) {
        gridApi.destroy();
      }
      testContainer.remove();
      console.log('AG Grid 테스트 컨테이너 제거됨');
    }, 3000);
    
    return true;
    
  } catch (error) {
    console.error('AG Grid 테스트 실패:', error);
    return false;
  }
};

console.log('AG Grid 테스트 도구가 로드되었습니다.');
console.log('사용법:');
console.log('- checkAGGridStatus(): AG Grid 상태 확인');
console.log('- loadAGGridManually(): AG Grid 수동 로드');
console.log('- testAGGrid(): AG Grid 간단 테스트');