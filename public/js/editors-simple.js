/**
 * 간단한 에디터 관리 (문제 해결용)
 */

// 전역 변수들
let currentEditorType = 'basic';
let currentEditorInstance = null;

// 에디터 전환 함수
async function updateEditor(library) {
  console.log('🔄 에디터 전환:', library);
  
  const container = document.getElementById('editor-container');
  if (!container) {
    console.error('에디터 컨테이너를 찾을 수 없습니다');
    return;
  }

  // 현재 값 저장
  const currentValue = getCurrentContent();
  
  // 이전 에디터 정리
  await destroyCurrentEditor();
  
  // 새 에디터 렌더링
  currentEditorType = library;
  
  switch(library) {
    case 'tinymce':
      await renderTinyMCE(container, currentValue);
      break;
    case 'ckeditor5':
      await renderCKEditor5(container, currentValue);
      break;
    case 'quill':
      await renderQuill(container, currentValue);
      break;
    case 'monaco':
      await renderMonaco(container, currentValue);
      break;
    default:
      renderBasic(container, currentValue);
  }
}

// 현재 내용 가져오기
function getCurrentContent() {
  switch(currentEditorType) {
    case 'tinymce':
      return currentEditorInstance && window.tinymce ? tinymce.get('content-editor')?.getContent() || '' : '';
    case 'ckeditor5':
      return currentEditorInstance ? currentEditorInstance.getData() : '';
    case 'quill':
      return currentEditorInstance ? currentEditorInstance.root.innerHTML : '';
    case 'monaco':
      return currentEditorInstance ? currentEditorInstance.getValue() : '';
    default:
      const textarea = document.querySelector('#content-editor');
      return textarea ? textarea.value : '';
  }
}

// 이전 에디터 정리
async function destroyCurrentEditor() {
  try {
    switch(currentEditorType) {
      case 'tinymce':
        if (window.tinymce && tinymce.get('content-editor')) {
          await tinymce.remove('#content-editor');
        }
        break;
      case 'ckeditor5':
        if (currentEditorInstance && currentEditorInstance.destroy) {
          await currentEditorInstance.destroy();
        }
        break;
      case 'quill':
      case 'monaco':
        // 특별한 정리 불필요
        break;
    }
  } catch (error) {
    console.warn('에디터 정리 중 오류:', error);
  }
  
  currentEditorInstance = null;
}

// 기본 에디터
function renderBasic(container, value) {
  container.innerHTML = `
    <textarea
      id="content-editor"
      name="content"
      rows="12"
      required
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
      placeholder="문의사항의 상세 내용을 입력하세요..."
    >${value}</textarea>
  `;
  console.log('✅ 기본 에디터 로드됨');
}

// TinyMCE 에디터
async function renderTinyMCE(container, value) {
  if (!window.tinymce) {
    console.warn('TinyMCE 라이브러리가 없습니다. 기본 에디터로 대체합니다.');
    renderBasic(container, value);
    return;
  }

  container.innerHTML = `
    <textarea id="content-editor" name="content">${value}</textarea>
  `;

  try {
    await tinymce.init({
      selector: '#content-editor',
      height: 400,
      plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'ai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
      ],
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Admin User',
      mergetags_list: [
        { value: 'CustomerName', title: '고객명' },
        { value: 'CustomerEmail', title: '고객 이메일' }
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant는 프리미엄 기능입니다')),
      uploadcare_public_key: '2be0637a8a9fda750e87',
      setup: (editor) => {
        currentEditorInstance = editor;
        editor.on('init', () => {
          console.log('✅ TinyMCE 에디터 로드됨');
        });
      }
    });
  } catch (error) {
    console.error('TinyMCE 초기화 실패:', error);
    renderBasic(container, value);
  }
}

// CKEditor5
async function renderCKEditor5(container, value) {
  if (!window.ClassicEditor) {
    console.warn('CKEditor5 라이브러리가 없습니다. 기본 에디터로 대체합니다.');
    renderBasic(container, value);
    return;
  }

  container.innerHTML = `
    <div id="content-editor" style="min-height: 400px;">${value}</div>
  `;

  try {
    const editor = await ClassicEditor.create(document.querySelector('#content-editor'), {
      toolbar: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo']
    });
    
    // 에디터 높이 설정
    const editingView = editor.editing.view;
    const root = editingView.document.getRoot();
    editingView.change(writer => {
      writer.setStyle('min-height', '400px', root);
    });
    
    currentEditorInstance = editor;
    console.log('✅ CKEditor5 에디터 로드됨');
  } catch (error) {
    console.error('CKEditor5 초기화 실패:', error);
    renderBasic(container, value);
  }
}

// Quill 에디터
async function renderQuill(container, value) {
  if (!window.Quill) {
    console.warn('Quill 라이브러리가 없습니다. 기본 에디터로 대체합니다.');
    renderBasic(container, value);
    return;
  }

  container.innerHTML = `
    <div id="content-editor" style="height: 300px;">${value}</div>
  `;

  try {
    const quill = new Quill('#content-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });
    
    currentEditorInstance = quill;
    console.log('✅ Quill 에디터 로드됨');
  } catch (error) {
    console.error('Quill 초기화 실패:', error);
    renderBasic(container, value);
  }
}

// Monaco 에디터
async function renderMonaco(container, value) {
  if (!window.require) {
    console.warn('Monaco 라이브러리가 없습니다. 기본 에디터로 대체합니다.');
    renderBasic(container, value);
    return;
  }

  container.innerHTML = `
    <div id="content-editor" style="height: 400px; border: 1px solid #ccc;"></div>
  `;

  try {
    require.config({ 
      paths: { 
        'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
      }
    });

    require(['vs/editor/editor.main'], () => {
      const editor = monaco.editor.create(document.getElementById('content-editor'), {
        value: value,
        language: 'markdown',
        theme: 'vs-dark',
        automaticLayout: true
      });
      
      currentEditorInstance = editor;
      console.log('✅ Monaco 에디터 로드됨');
    });
  } catch (error) {
    console.error('Monaco 초기화 실패:', error);
    renderBasic(container, value);
  }
}


// 폼 제출용 내용 가져오기 (기존 함수와 호환)
function getEditorContent() {
  return getCurrentContent();
}

// Turbo 페이지 로드 시 에디터 상태 초기화
document.addEventListener('turbo:load', function() {
  console.log('🔄 Turbo 페이지 로드 - 에디터 상태 초기화');
  
  // 에디터 상태 초기화
  currentEditorType = 'basic';
  currentEditorInstance = null;
  
  // 에디터 컨테이너가 있는 페이지인지 확인
  const container = document.getElementById('editor-container');
  const selector = document.getElementById('editor-library-select');
  
  if (container && selector) {
    console.log('📝 에디터 페이지 감지 - 기본 에디터로 초기화');
    
    // 셀렉터 값을 basic으로 리셋
    selector.value = 'basic';
    
    // 기본 에디터로 렌더링
    renderBasic(container, '');
  }
});

// 전역 updateEditor 함수를 안전하게 노출
window.updateEditor = updateEditor;

console.log('📝 간단한 에디터 관리자가 로드되었습니다.');