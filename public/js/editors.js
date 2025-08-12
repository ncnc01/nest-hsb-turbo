/**
 * 에디터 라이브러리 통합 관리
 */

class EditorManager {
  constructor() {
    this.currentEditor = null;
    this.currentType = 'basic';
    this.editorInstances = {};
  }

  // 에디터 전환
  async switchEditor(editorType, container, initialValue = '') {
    // 기존 에디터 정리
    await this.destroyCurrentEditor();
    
    this.currentType = editorType;
    
    switch(editorType) {
      case 'basic':
        this.renderBasicEditor(container, initialValue);
        break;
      case 'tinymce':
        await this.renderTinyMCE(container, initialValue);
        break;
      case 'ckeditor5':
        await this.renderCKEditor5(container, initialValue);
        break;
      case 'quill':
        await this.renderQuill(container, initialValue);
        break;
      case 'monaco':
        await this.renderMonaco(container, initialValue);
        break;
      case 'prosemirror':
        await this.renderProseMirror(container, initialValue);
        break;
      default:
        this.renderBasicEditor(container, initialValue);
    }
  }

  // 현재 에디터 내용 가져오기
  getContent() {
    switch(this.currentType) {
      case 'basic':
        const textarea = document.querySelector('#editor-container textarea[name="content"]');
        return textarea ? textarea.value : '';
      
      case 'tinymce':
        return this.editorInstances.tinymce ? this.editorInstances.tinymce.getContent() : '';
      
      case 'ckeditor5':
        return this.editorInstances.ckeditor5 ? this.editorInstances.ckeditor5.getData() : '';
      
      case 'quill':
        return this.editorInstances.quill ? this.editorInstances.quill.root.innerHTML : '';
      
      case 'monaco':
        return this.editorInstances.monaco ? this.editorInstances.monaco.getValue() : '';
      
      case 'prosemirror':
        return this.editorInstances.prosemirror ? this.getProsMirrorHTML() : '';
      
      default:
        return '';
    }
  }

  // 현재 에디터에 내용 설정
  setContent(content) {
    switch(this.currentType) {
      case 'basic':
        const textarea = document.querySelector('#editor-container textarea[name="content"]');
        if (textarea) textarea.value = content;
        break;
      
      case 'tinymce':
        if (this.editorInstances.tinymce) {
          this.editorInstances.tinymce.setContent(content);
        }
        break;
      
      case 'ckeditor5':
        if (this.editorInstances.ckeditor5) {
          this.editorInstances.ckeditor5.setData(content);
        }
        break;
      
      case 'quill':
        if (this.editorInstances.quill) {
          this.editorInstances.quill.root.innerHTML = content;
        }
        break;
      
      case 'monaco':
        if (this.editorInstances.monaco) {
          this.editorInstances.monaco.setValue(content);
        }
        break;
      
      case 'prosemirror':
        if (this.editorInstances.prosemirror) {
          this.setProsMirrorHTML(content);
        }
        break;
    }
  }

  // 현재 에디터 정리
  async destroyCurrentEditor() {
    try {
      switch(this.currentType) {
        case 'tinymce':
          if (this.editorInstances.tinymce) {
            await tinymce.remove('#content-editor');
            delete this.editorInstances.tinymce;
          }
          break;
        
        case 'ckeditor5':
          if (this.editorInstances.ckeditor5) {
            await this.editorInstances.ckeditor5.destroy();
            delete this.editorInstances.ckeditor5;
          }
          break;
        
        case 'quill':
          // Quill은 특별한 destroy 메서드가 없음
          delete this.editorInstances.quill;
          break;
        
        case 'monaco':
          if (this.editorInstances.monaco) {
            this.editorInstances.monaco.dispose();
            delete this.editorInstances.monaco;
          }
          break;
        
        case 'prosemirror':
          if (this.editorInstances.prosemirror) {
            this.editorInstances.prosemirror.destroy();
            delete this.editorInstances.prosemirror;
          }
          break;
      }
    } catch (error) {
      console.warn('에디터 정리 중 오류:', error);
    }
    
    this.currentEditor = null;
  }

  // 기본 텍스트에리어
  renderBasicEditor(container, value) {
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
  }

  // TinyMCE 에디터
  async renderTinyMCE(container, value) {
    container.innerHTML = `
      <div id="tinymce-container">
        <textarea id="content-editor" name="content">${value}</textarea>
      </div>
    `;

    try {
      // TinyMCE 라이브러리 체크
      if (!window.tinymce) {
        console.warn('TinyMCE 라이브러리가 로드되지 않았습니다.');
        this.renderBasicEditor(container, value);
        return;
      }

      await tinymce.init({
        selector: '#content-editor',
        height: 450,
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
          // Premium features (trial)
          'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'ai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Admin User',
        mergetags_list: [
          { value: 'CustomerName', title: '고객명' },
          { value: 'CustomerEmail', title: '고객 이메일' },
          { value: 'InquiryTitle', title: '문의 제목' },
          { value: 'InquiryDate', title: '문의 날짜' },
        ],
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant는 프리미엄 기능입니다')),
        uploadcare_public_key: '2be0637a8a9fda750e87',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
        setup: (editor) => {
          this.editorInstances.tinymce = editor;
          
          // 에디터 로딩 완료 시 포커스
          editor.on('init', () => {
            console.log('✅ TinyMCE 에디터가 성공적으로 로드되었습니다.');
          });
          
          // 에디터 내용 변경 시 폼 필드 동기화
          editor.on('change keyup', () => {
            const content = editor.getContent();
            const textarea = document.querySelector('textarea[name="content"]');
            if (textarea) {
              textarea.value = content;
            }
          });
        }
      });
    } catch (error) {
      console.error('TinyMCE 초기화 실패:', error);
      this.renderBasicEditor(container, value);
    }
  }

  // CKEditor5
  async renderCKEditor5(container, value) {
    container.innerHTML = `
      <div id="ckeditor5-container">
        <div id="content-editor" style="min-height: 400px;">${value}</div>
      </div>
    `;

    try {
      // CKEditor5 라이브러리 체크
      if (!window.ClassicEditor) {
        console.warn('CKEditor5 라이브러리가 로드되지 않았습니다.');
        this.renderBasicEditor(container, value);
        return;
      }

      const editor = await ClassicEditor.create(document.querySelector('#content-editor'), {
        toolbar: [
          'heading', '|',
          'bold', 'italic', 'link', '|',
          'bulletedList', 'numberedList', '|',
          'outdent', 'indent', '|',
          'blockQuote', 'insertTable', '|',
          'undo', 'redo'
        ],
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
          ]
        }
      });
      
      // 에디터 높이 설정
      const editingView = editor.editing.view;
      const root = editingView.document.getRoot();
      editingView.change(writer => {
        writer.setStyle('min-height', '350px', root);
      });
      
      this.editorInstances.ckeditor5 = editor;
    } catch (error) {
      console.error('CKEditor5 초기화 실패:', error);
      this.renderBasicEditor(container, value);
    }
  }

  // Quill 에디터
  async renderQuill(container, value) {
    container.innerHTML = `
      <div id="quill-container">
        <div id="content-editor" style="height: 300px;">${value}</div>
      </div>
    `;

    try {
      // Quill 라이브러리 체크
      if (!window.Quill) {
        console.warn('Quill 라이브러리가 로드되지 않았습니다.');
        this.renderBasicEditor(container, value);
        return;
      }

      const quill = new Quill('#content-editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
          ]
        }
      });
      
      this.editorInstances.quill = quill;
    } catch (error) {
      console.error('Quill 초기화 실패:', error);
      this.renderBasicEditor(container, value);
    }
  }

  // Monaco 에디터
  async renderMonaco(container, value) {
    container.innerHTML = `
      <div id="monaco-container">
        <div id="content-editor" style="height: 400px; border: 1px solid #ccc;"></div>
      </div>
    `;

    try {
      // Monaco 라이브러리 체크
      if (!window.require) {
        console.warn('Monaco 라이브러리가 로드되지 않았습니다.');
        this.renderBasicEditor(container, value);
        return;
      }

      // Monaco 로더 설정
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
          automaticLayout: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 21,
          wordWrap: 'on'
        });
        
        this.editorInstances.monaco = editor;
      });
    } catch (error) {
      console.error('Monaco 초기화 실패:', error);
      this.renderBasicEditor(container, value);
    }
  }

  // ProseMirror 에디터
  async renderProseMirror(container, value) {
    container.innerHTML = `
      <div id="prosemirror-container" class="prosemirror-container">
        <div class="prosemirror-toolbar">
          <button type="button" data-command="strong" title="Bold (Ctrl+B)">
            <i class="fas fa-bold"></i>
          </button>
          <button type="button" data-command="em" title="Italic (Ctrl+I)">
            <i class="fas fa-italic"></i>
          </button>
          <button type="button" data-command="code" title="Code (Ctrl+`)">
            <i class="fas fa-code"></i>
          </button>
          
          <div class="separator"></div>
          
          <button type="button" data-command="paragraph" title="Paragraph">
            <i class="fas fa-paragraph"></i>
          </button>
          <button type="button" data-command="heading1" title="Heading 1">
            <strong>H1</strong>
          </button>
          <button type="button" data-command="heading2" title="Heading 2">
            <strong>H2</strong>
          </button>
          <button type="button" data-command="heading3" title="Heading 3">
            <strong>H3</strong>
          </button>
          
          <div class="separator"></div>
          
          <button type="button" data-command="bullet_list" title="Bullet List">
            <i class="fas fa-list-ul"></i>
          </button>
          <button type="button" data-command="ordered_list" title="Numbered List">
            <i class="fas fa-list-ol"></i>
          </button>
          
          <div class="separator"></div>
          
          <button type="button" data-command="blockquote" title="Block Quote">
            <i class="fas fa-quote-left"></i>
          </button>
          <button type="button" data-command="code_block" title="Code Block">
            <i class="fas fa-terminal"></i>
          </button>
          <button type="button" data-command="horizontal_rule" title="Horizontal Rule">
            <i class="fas fa-minus"></i>
          </button>
          
          <div class="separator"></div>
          
          <button type="button" data-command="undo" title="Undo (Ctrl+Z)">
            <i class="fas fa-undo"></i>
          </button>
          <button type="button" data-command="redo" title="Redo (Ctrl+Y)">
            <i class="fas fa-redo"></i>
          </button>
          
          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; color: #6b7280;">
              <strong>**bold**</strong> <em>*italic*</em> <code>\`code\`</code>
            </span>
          </div>
        </div>
        <div id="content-editor"></div>
      </div>
    `;

    try {
      // ProseMirror 라이브러리 체크
      if (!window.PM || !window.PM.state || !window.PM.view || !window.PM.exampleSetup) {
        console.warn('ProseMirror 라이브러리가 아직 로드되지 않았습니다. 기본 에디터를 사용합니다.');
        this.renderBasicEditor(container, value);
        return;
      }

      // ProseMirror 스키마 생성
      const { schema } = window.PM.exampleSetup;
      const { EditorState } = window.PM.state;
      const { EditorView } = window.PM.view;
      const { exampleSetup, buildMenuItems } = window.PM.exampleSetup;
      
      // 초기 상태 생성
      let doc;
      if (value) {
        // HTML을 파싱해서 ProseMirror 문서로 변환
        const parser = window.DOMParser ? new DOMParser() : null;
        if (parser) {
          const parsedDoc = parser.parseFromString(`<div>${value}</div>`, 'text/html');
          doc = schema.nodeFromJSON(parsedDoc.body.firstChild);
        }
      }
      
      const state = EditorState.create({
        doc: doc,
        plugins: exampleSetup({ schema, menuBar: false })
      });

      // 에디터 뷰 생성
      const view = new EditorView(document.querySelector('#content-editor'), {
        state: state,
        dispatchTransaction(transaction) {
          const newState = view.state.apply(transaction);
          view.updateState(newState);
          
          // 내용 변경 시 hidden textarea 업데이트
          const content = this.getProsMirrorHTML();
          const textarea = document.querySelector('textarea[name="content"]');
          if (textarea) {
            textarea.value = content;
          }
        }
      });

      this.editorInstances.prosemirror = view;
      
      // 툴바 이벤트 연결
      this.setupProseMirrorToolbar(view);
      
      console.log('✅ ProseMirror 에디터가 성공적으로 로드되었습니다.');
    } catch (error) {
      console.error('ProseMirror 초기화 실패:', error);
      this.renderBasicEditor(container, value);
    }
  }

  // ProseMirror 툴바 설정
  setupProseMirrorToolbar(view) {
    const toolbar = document.querySelector('.prosemirror-toolbar');
    if (!toolbar) return;

    toolbar.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-command]');
      if (!button) return;

      const command = button.dataset.command;
      const { state, dispatch } = view;
      const { schema } = state;

      switch (command) {
        case 'strong':
          const strongType = schema.marks.strong;
          const strongCmd = window.PM.commands.toggleMark(strongType);
          strongCmd(state, dispatch);
          break;
          
        case 'em':
          const emType = schema.marks.em;
          const emCmd = window.PM.commands.toggleMark(emType);
          emCmd(state, dispatch);
          break;
          
        case 'code':
          const codeType = schema.marks.code;
          const codeCmd = window.PM.commands.toggleMark(codeType);
          codeCmd(state, dispatch);
          break;
          
        case 'paragraph':
          const pType = schema.nodes.paragraph;
          const pCmd = window.PM.commands.setBlockType(pType);
          pCmd(state, dispatch);
          break;
          
        case 'heading1':
          const h1Type = schema.nodes.heading;
          const h1Cmd = window.PM.commands.setBlockType(h1Type, { level: 1 });
          h1Cmd(state, dispatch);
          break;
          
        case 'heading2':
          const h2Type = schema.nodes.heading;
          const h2Cmd = window.PM.commands.setBlockType(h2Type, { level: 2 });
          h2Cmd(state, dispatch);
          break;
          
        case 'heading3':
          const h3Type = schema.nodes.heading;
          const h3Cmd = window.PM.commands.setBlockType(h3Type, { level: 3 });
          h3Cmd(state, dispatch);
          break;
          
        case 'bullet_list':
          const bulletCmd = window.PM.schemaList.wrapInList(schema.nodes.bullet_list);
          bulletCmd(state, dispatch);
          break;
          
        case 'ordered_list':
          const orderedCmd = window.PM.schemaList.wrapInList(schema.nodes.ordered_list);
          orderedCmd(state, dispatch);
          break;
          
        case 'blockquote':
          const quoteCmd = window.PM.commands.wrapIn(schema.nodes.blockquote);
          quoteCmd(state, dispatch);
          break;
          
        case 'code_block':
          const codeBlockCmd = window.PM.commands.setBlockType(schema.nodes.code_block);
          codeBlockCmd(state, dispatch);
          break;
          
        case 'horizontal_rule':
          const hrCmd = (state, dispatch) => {
            const hr = schema.nodes.horizontal_rule.create();
            const tr = state.tr.replaceSelectionWith(hr);
            dispatch(tr);
            return true;
          };
          hrCmd(state, dispatch);
          break;
          
        case 'undo':
          const undoCmd = window.PM.history.undo;
          undoCmd(state, dispatch);
          break;
          
        case 'redo':
          const redoCmd = window.PM.history.redo;
          redoCmd(state, dispatch);
          break;
      }
      
      view.focus();
    });
  }

  // ProseMirror HTML 가져오기
  getProsMirrorHTML() {
    if (!this.editorInstances.prosemirror) return '';
    
    try {
      const { state } = this.editorInstances.prosemirror;
      const fragment = window.PM.model.DOMSerializer.fromSchema(state.schema).serializeFragment(state.doc.content);
      
      const div = document.createElement('div');
      div.appendChild(fragment);
      return div.innerHTML;
    } catch (error) {
      console.error('ProseMirror HTML 변환 실패:', error);
      return '';
    }
  }

  // ProseMirror HTML 설정
  setProsMirrorHTML(html) {
    if (!this.editorInstances.prosemirror || !html) return;
    
    try {
      const { schema } = this.editorInstances.prosemirror.state;
      const parser = window.DOMParser ? new DOMParser() : null;
      if (parser) {
        const parsedDoc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const doc = window.PM.model.DOMParser.fromSchema(schema).parse(parsedDoc.body.firstChild);
        
        const newState = this.editorInstances.prosemirror.state.reconfigure({
          doc: doc
        });
        
        this.editorInstances.prosemirror.updateState(newState);
      }
    } catch (error) {
      console.error('ProseMirror HTML 설정 실패:', error);
    }
  }
}

// 전역 에디터 매니저 인스턴스
window.editorManager = new EditorManager();

// 에디터 전환 함수 (기존 함수와 호환)
async function updateEditor(library) {
  const container = document.getElementById('editor-container');
  const currentValue = window.editorManager ? window.editorManager.getContent() : '';
  
  if (window.editorManager) {
    await window.editorManager.switchEditor(library, container, currentValue);
  } else {
    // 에디터 매니저가 아직 로드되지 않은 경우 기본 에디터 사용
    console.warn('에디터 매니저가 아직 로드되지 않았습니다.');
    container.innerHTML = `
      <textarea
        id="content-editor"
        name="content"
        rows="12"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
        placeholder="문의사항의 상세 내용을 입력하세요..."
      >${currentValue}</textarea>
    `;
  }
}

// 에디터 내용 가져오기 함수 (기존 함수와 호환)
function getEditorContent(editorType) {
  return window.editorManager.getContent();
}

console.log('📝 에디터 매니저가 로드되었습니다.');