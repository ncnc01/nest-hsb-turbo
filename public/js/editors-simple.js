/**
 * 간단한 에디터 관리 시스템
 * 기존 시스템 복원용
 */

let currentEditor = null;
let currentEditorType = 'basic';

// 에디터 전환 함수
async function updateEditor(editorType) {
  console.log('🔄 Switching editor to:', editorType);
  
  const container = document.getElementById('editor-container');
  if (!container) {
    console.error('❌ Editor container not found');
    return;
  }
  
  // 현재 내용 저장
  const currentContent = getCurrentContent();
  
  // 기존 에디터 정리
  await destroyCurrentEditor();
  
  // 새 에디터 생성
  currentEditorType = editorType;
  
  switch (editorType) {
    case 'basic':
      renderBasicEditor(container, currentContent);
      break;
    case 'tinymce':
      await renderTinyMCE(container, currentContent);
      break;
    case 'ckeditor5':
      await renderCKEditor(container, currentContent);
      break;
    case 'quill':
      await renderQuill(container, currentContent);
      break;
    case 'monaco':
      await renderMonaco(container, currentContent);
      break;
    default:
      renderBasicEditor(container, currentContent);
  }
}

// 현재 에디터 내용 가져오기
function getCurrentContent() {
  switch (currentEditorType) {
    case 'tinymce':
      if (window.tinymce && window.tinymce.activeEditor) {
        return window.tinymce.activeEditor.getContent();
      }
      break;
    case 'ckeditor5':
      if (currentEditor && currentEditor.getData) {
        return currentEditor.getData();
      }
      break;
    case 'quill':
      if (currentEditor && currentEditor.root) {
        return currentEditor.root.innerHTML;
      }
      break;
    case 'monaco':
      if (currentEditor && currentEditor.getValue) {
        return currentEditor.getValue();
      }
      break;
    default:
      const textarea = document.querySelector('#editor-container textarea[name="content"]');
      return textarea ? textarea.value : '';
  }
  
  // 폴백
  const textarea = document.querySelector('#editor-container textarea[name="content"]');
  return textarea ? textarea.value : '';
}

// 기존 에디터 정리
async function destroyCurrentEditor() {
  try {
    switch (currentEditorType) {
      case 'tinymce':
        if (window.tinymce) {
          await window.tinymce.remove('#content-editor');
        }
        break;
      case 'ckeditor5':
        if (currentEditor && currentEditor.destroy) {
          await currentEditor.destroy();
        }
        break;
      case 'monaco':
        if (currentEditor && currentEditor.dispose) {
          currentEditor.dispose();
        }
        break;
    }
  } catch (error) {
    console.warn('Editor cleanup warning:', error);
  }
  
  currentEditor = null;
}

// 기본 텍스트에리어
function renderBasicEditor(container, content) {
  container.innerHTML = `
    <textarea
      id="content-editor"
      name="content"
      rows="12"
      required
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
      placeholder="문의사항의 상세 내용을 입력하세요..."
    >${content}</textarea>
  `;
  console.log('✅ Basic editor loaded');
}

// TinyMCE 에디터
async function renderTinyMCE(container, content) {
  container.innerHTML = `
    <textarea id="content-editor" name="content">${content}</textarea>
  `;
  
  try {
    if (!window.tinymce) {
      console.warn('TinyMCE not available, using basic editor');
      renderBasicEditor(container, content);
      return;
    }
    
    await window.tinymce.init({
      selector: '#content-editor',
      height: 400,
      plugins: 'link lists code table',
      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link code',
      menubar: false,
      setup: (editor) => {
        currentEditor = editor;
        console.log('✅ TinyMCE editor loaded');
      }
    });
  } catch (error) {
    console.error('TinyMCE failed:', error);
    renderBasicEditor(container, content);
  }
}

// CKEditor 5
async function renderCKEditor(container, content) {
  container.innerHTML = `
    <div id="content-editor">${content}</div>
  `;
  
  try {
    if (!window.ClassicEditor) {
      console.warn('CKEditor5 not available, using basic editor');
      renderBasicEditor(container, content);
      return;
    }
    
    const editor = await window.ClassicEditor.create(document.querySelector('#content-editor'), {
      toolbar: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
    });
    
    currentEditor = editor;
    console.log('✅ CKEditor5 loaded');
  } catch (error) {
    console.error('CKEditor5 failed:', error);
    renderBasicEditor(container, content);
  }
}

// Quill 에디터
async function renderQuill(container, content) {
  container.innerHTML = `
    <div id="content-editor" style="height: 300px;">${content}</div>
  `;
  
  try {
    if (!window.Quill) {
      console.warn('Quill not available, using basic editor');
      renderBasicEditor(container, content);
      return;
    }
    
    const quill = new window.Quill('#content-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
      }
    });
    
    currentEditor = quill;
    console.log('✅ Quill editor loaded');
  } catch (error) {
    console.error('Quill failed:', error);
    renderBasicEditor(container, content);
  }
}

// Monaco 에디터
async function renderMonaco(container, content) {
  container.innerHTML = `
    <div id="content-editor" style="height: 400px; border: 1px solid #ccc;"></div>
  `;
  
  try {
    if (!window.require) {
      console.warn('Monaco not available, using basic editor');
      renderBasicEditor(container, content);
      return;
    }
    
    window.require.config({ 
      paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
    });
    
    window.require(['vs/editor/editor.main'], () => {
      const editor = window.monaco.editor.create(document.getElementById('content-editor'), {
        value: content,
        language: 'markdown',
        theme: 'vs-light',
        automaticLayout: true,
        wordWrap: 'on'
      });
      
      currentEditor = editor;
      console.log('✅ Monaco editor loaded');
    });
  } catch (error) {
    console.error('Monaco failed:', error);
    renderBasicEditor(container, content);
  }
}

console.log('📝 Simple Editor System loaded');