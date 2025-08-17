# Alpine.js + Handlebars + Turbo 패턴 가이드

## 데이터 전달 패턴

### ❌ 피해야 할 패턴
```handlebars
<!-- 복잡한 객체 직접 전달 - 파싱 에러 위험 -->
<div x-data="component({{{json this}}})">

<!-- 멀티라인 JSON - Alpine.js 파싱 실패 -->
<div x-data="component({
  data: {{{json complexData}}}
})">
```

### ✅ 권장 패턴
```handlebars
<!-- 1. 데이터 분리 -->
<script>
window.pageData = {{{json pageSpecificData}}};
</script>

<!-- 2. 단순 함수 호출 -->
<div x-data="component()" x-cloak>

<!-- 3. Alpine.js 컴포넌트에서 전역 데이터 참조 -->
<script>
function component() {
  return {
    ...window.pageData,
    init() { /* 초기화 로직 */ }
  };
}
</script>
```

## 조건부 렌더링 패턴

### ❌ 문제가 되는 패턴
```handlebars
<!-- x-show는 Turbo와 충돌 가능 -->
<div x-show="activeTab === 'tab1'">
```

### ✅ 권장 패턴
```handlebars
<!-- CSS 클래스 바인딩이 더 안정적 -->
<div :class="activeTab === 'tab1' ? 'block' : 'hidden'">
```

## 디버깅 체크리스트

1. **API 데이터**: `curl /api/endpoint`
2. **템플릿 렌더링**: 브라우저 소스 보기
3. **Alpine.js 초기화**: 콘솔에서 `window.Alpine` 확인
4. **x-data 파싱**: 콘솔에서 파싱 에러 확인
5. **반응성 테스트**: 개발자 도구에서 상태 변경 테스트