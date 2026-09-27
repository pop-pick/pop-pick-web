# 팝픽 디자인 방향

서비스가 주는 인상과 그것을 만드는 규칙을 적는다. 화면별 상세는 DESIGN-SPEC.md에 적는다.

디자인 토큰의 정본은 `src/shared/styles/tokens/`다. 원시 색은 `color-primitive.css`, 의미 색은 `color-semantic.css`, 글자는 `typography.css`, 그림자는 `shadow.css`에 있고 `globals.css`가 이 파일들을 불러온다. 값은 피그마 시안의 변수와 텍스트 스타일, 이펙트에서 옮겼고 시안 이름과 코드 이름을 표로 맞춰 둔다. 시안이 바뀌면 해당 `tokens/` 파일을 고치고 이 문서의 표를 함께 고친다.

## 인상과 레퍼런스

처음 열었을 때 받아야 할 느낌을 형용사 셋 이하로 적고 그 느낌을 어디서 따왔는지 레퍼런스를 함께 적는다. 형용사 셋이 아래 모든 선택의 기준이 된다. 레퍼런스 하나에서는 한 가지씩만 따온다. 디자이너가 리서치 중이라 아직 비어 있다.

## 색

두 층이다. 원시 토큰은 `:root`의 CSS 변수로만 있고 유틸리티가 생기지 않는다. 화면은 `@theme inline`의 의미 토큰만 쓴다. 의미 토큰은 원시 변수를 참조하므로 같은 색을 바꿀 때 원시 값 한 곳만 고친다.

Tailwind 기본 팔레트(`zinc`, `blue` 등)는 지우지 않았다. 기존 화면이 아직 기본 팔레트를 쓰고 있어서다. 화면을 시안으로 옮길 때 의미 토큰으로 바꾸고, 다 옮기면 기본 팔레트를 지운다.

### 원시 토큰

| 시안 변수                            | 코드 변수     | 값        |
| ------------------------------------ | ------------- | --------- |
| `Blue (S-Primary)/blue-10`           | `--blue-10`   | `#ebf0ff` |
| `Blue (S-Primary)/blue-50`           | `--blue-50`   | `#dde5ff` |
| `Blue (S-Primary)/blue-100`          | `--blue-100`  | `#b4c6ff` |
| `Blue (S-Primary)/blue-200`          | `--blue-200`  | `#8aa7ff` |
| `Blue (S-Primary)/blue-300`          | `--blue-300`  | `#7194ff` |
| `Blue (S-Primary)/blue-400`          | `--blue-400`  | `#517bf7` |
| `Blue (S-Primary)/blue-500(PRIMARY)` | `--blue-500`  | `#3c6bf8` |
| `Blue (S-Primary)/blue-600`          | `--blue-600`  | `#2956da` |
| `Blue (S-Primary)/blue-700`          | `--blue-700`  | `#224ed2` |
| `Blue (S-Primary)/blue-800`          | `--blue-800`  | `#1f45b5` |
| `Blue (S-Primary)/blue-900`          | `--blue-900`  | `#1a3a99` |
| `Blue (S-Primary)/blue-1000`         | `--blue-1000` | `#173282` |
| `Gray/Neutral0`                      | `--gray-0`    | `#ffffff` |
| `Gray/Neutral50`                     | `--gray-50`   | `#f7fafd` |
| `Gray/Gray100`                       | `--gray-100`  | `#f2f4f7` |
| `Gray/Gray200`                       | `--gray-200`  | `#eaecf2` |
| `Gray/Gray300`                       | `--gray-300`  | `#cfd4e0` |
| `Gray/Gray400`                       | `--gray-400`  | `#aeb3c2` |
| `Gray/Gray500`                       | `--gray-500`  | `#868da3` |
| `Gray/Gray600`                       | `--gray-600`  | `#6f768c` |
| `Gray/Gray700`                       | `--gray-700`  | `#565d70` |
| `Gray/Gray800`                       | `--gray-800`  | `#3f4454` |
| `Gray/Grayl900`                      | `--gray-900`  | `#2e3442` |
| `Gray/Grayl1000`                     | `--gray-1000` | `#282d39` |
| `Gray/Gray1100`                      | `--gray-1100` | `#12141b` |
| `error`                              | `--red-500`   | `#ff5d4a` |
| `error-bg`                           | `--red-10`    | `#ffefef` |

시안의 `Grayl900`, `Grayl1000`은 이름에 `l`이 끼어 있지만 같은 회색 척도다. 코드에서는 `--gray-900`, `--gray-1000`으로 적는다.

### 의미 토큰

`--color-{이름}`으로 선언해 `text-{이름}`, `bg-{이름}`, `border-{이름}` 유틸리티가 생긴다. 글자 색 토큰은 이름이 `text-`로 시작해서 클래스가 `text-text-1`이 된다. 시안 이름과 맞추려고 그대로 둔다.

| 시안 변수                  | 코드 토큰               | 원시          | 예시 클래스          |
| -------------------------- | ----------------------- | ------------- | -------------------- |
| `Text Color/text-1`        | `--color-text-1`        | `--gray-1000` | `text-text-1`        |
| `Text Color/text-2`        | `--color-text-2`        | `--gray-800`  | `text-text-2`        |
| `Text Color/text-3`        | `--color-text-3`        | `--gray-700`  | `text-text-3`        |
| `Text Color/text-4`        | `--color-text-4`        | `--gray-600`  | `text-text-4`        |
| `Text Color/text-5`        | `--color-text-5`        | `--gray-500`  | `text-text-5`        |
| `Text Color/text-6`        | `--color-text-6`        | `--gray-400`  | `text-text-6`        |
| `Text Color/text-w`        | `--color-text-w`        | `--gray-0`    | `text-text-w`        |
| `Text Color/text-w 2`      | `--color-text-w-2`      | `--gray-100`  | `text-text-w-2`      |
| `Background Color/bg-1`    | `--color-bg-1`          | `--gray-0`    | `bg-bg-1`            |
| `Background Color/bg-2`    | `--color-bg-2`          | `--gray-50`   | `bg-bg-2`            |
| `Background Color/bg-3`    | `--color-bg-3`          | `--gray-100`  | `bg-bg-3`            |
| `Background Color/bg-4`    | `--color-bg-4`          | `--gray-200`  | `bg-bg-4`            |
| `Background Color/bg-5`    | `--color-bg-5`          | `--gray-300`  | `bg-bg-5`            |
| `Divider Color/divider-1`  | `--color-divider-1`     | `--gray-100`  | `border-divider-1`   |
| `Divider Color/divider-2`  | `--color-divider-2`     | `--gray-200`  | `border-divider-2`   |
| `Divider Color/divider-3`  | `--color-divider-3`     | `--gray-300`  | `border-divider-3`   |
| `Divider Color/divider-4`  | `--color-divider-4`     | `--gray-400`  | `border-divider-4`   |
| `Icon Color/Icon`          | `--color-icon`          | `--gray-900`  | `text-icon`          |
| `Icon Color/Icon 2`        | `--color-icon-2`        | `--gray-700`  | `text-icon-2`        |
| `Icon Color/Icon-color`    | `--color-icon-primary`  | `--blue-500`  | `text-icon-primary`  |
| `Icon Color/Icon-disabled` | `--color-icon-disabled` | `--gray-400`  | `text-icon-disabled` |
| `Icon Color/Icon-w`        | `--color-icon-w`        | `--gray-0`    | `text-icon-w`        |
| `blue-500(PRIMARY)`        | `--color-primary`       | `--blue-500`  | `bg-primary`         |
| `error`                    | `--color-error`         | `--red-500`   | `text-error`         |
| `error-bg`                 | `--color-error-bg`      | `--red-10`    | `bg-error-bg`        |

시안이 의미 변수 없이 원시 색을 직접 칠한 곳이 있다. 그 쓰임마다 의미 토큰을 하나씩 붙였다.

| 코드 토큰                | 값           | 시안에서 쓰인 곳                                                                                        |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| `--color-primary-subtle` | `--blue-10`  | 온보딩 선택지 배경                                                                                      |
| `--color-primary-strong` | `--blue-600` | 눌린 상태의 테두리                                                                                      |
| `--color-ai`             | `--blue-400` | AI 일치 문구와 반짝이 아이콘                                                                            |
| `--color-like`           | `#dc4c4c`    | 찜한 하트. 시안에서 변수에 묶이지 않은 값이라 원시 변수 없이 값을 직접 둔다. 변수로 등록할지는 미정이다 |

카카오 로그인 버튼 색 `--color-kakao`와 `-hover`, `-active`, `-foreground`는 카카오 디자인 가이드 값이라 시안과 무관하다.

지도 SDK에 넘기는 인라인 스타일처럼 클래스를 쓸 수 없는 곳은 원시 변수를 직접 참조한다(`var(--blue-500)`). `@theme inline`의 의미 토큰 변수는 클래스에서 쓰일 때만 CSS에 출력되어서 JS 문자열에서 참조하면 값이 없을 수 있다.

### 대비

흰 바탕(`bg-1`) 기준으로 WCAG 2.2 상대 휘도 공식으로 계산했다. 본문 글자는 4.5:1, 24px 이상이거나 약 18.66px 이상 굵은 글자와 의미를 전하는 아이콘은 3:1이 기준이다.

| 토큰                      | 값        | 대비   | 본문 글자 | 큰 글자와 아이콘 |
| ------------------------- | --------- | ------ | --------- | ---------------- |
| `primary`, `icon-primary` | `#3c6bf8` | 4.52:1 | 통과      | 통과             |
| `text-4`                  | `#6f768c` | 4.52:1 | 통과      | 통과             |
| `text-5`                  | `#868da3` | 3.31:1 | 실패      | 통과             |
| `error`                   | `#ff5d4a` | 3.04:1 | 실패      | 통과             |
| `text-6`, `icon-disabled` | `#aeb3c2` | 2.09:1 | 실패      | 실패             |

`primary`와 `text-4`는 흰 바탕에서 4.5보다 0.02 높을 뿐이라 `bg-2`, `bg-3` 위에서는 떨어질 수 있다. `text-5`로 쓴 보조 글자와 `error`로 쓴 12px 오류 문구는 본문 기준에 못 미친다. `text-6`과 `icon-disabled`는 비활성 상태에만 쓴다. 디자이너에게 물을 것은 `docs/product/ROADMAP.md`의 미결정 절에 있다.

## 타이포그래피

글꼴은 Pretendard 1.3.9다. `src/shared/styles/fonts.ts`가 `next/font/local`로 Regular, Medium, SemiBold, Bold 네 굵기를 싣고 `--font-pretendard` 변수를 `<html>`에 건다. `@theme inline`의 `--font-sans`가 이 변수 뒤에 시스템 대체 글꼴을 잇는다. 파일은 `src/shared/assets/fonts/`에 있고 SIL OFL 라이선스 원문을 같은 폴더에 둔다.

파일은 KS X 1001 한글 2,350자 서브셋이다. 굵기 하나가 약 267KB다. 서브셋 밖의 드문 한글(똠, 햏 같은 글자)은 대체 글꼴인 Apple SD Gothic Neo나 맑은 고딕으로 보인다. 사용자가 입력한 이름이나 팝업 이름에서 섞여 보일 수 있다.

시안 텍스트 스타일 하나를 `--text-{이름}` 토큰 하나로 옮겼다. 크기와 줄 높이, 자간, 굵기가 함께 걸려서 `text-h1` 클래스 하나로 스타일 전체가 적용된다. `leading-*`, `tracking-*`, `font-*`를 함께 쓰면 그쪽이 이긴다. 다만 `cn()`은 뒤에 온 글자 토큰이 앞의 `leading-*`을 지우므로 `cn()` 안에서는 `leading-*`을 `text-*` 뒤에 둔다.

| 시안 스타일           | 클래스         | 크기 | 줄 높이 | 자간    | 굵기 |
| --------------------- | -------------- | ---- | ------- | ------- | ---- |
| `Head/H1_semi`        | `text-h1`      | 24px | 1.5     | -0.2px  | 700  |
| `Head/H2_semi`        | `text-h2`      | 20px | 1.5     | -0.02em | 700  |
| `Head/H3_semi`        | `text-h3`      | 18px | 1.5     | 0       | 600  |
| `Head/H4_semi`        | `text-h4`      | 16px | 1.5     | 0       | 600  |
| `Body1/B1_Semi` 18    | `text-b1-18`   | 18px | 1.5     | -0.2px  | 600  |
| `Body1/B1_Semi` 16    | `text-b1-16`   | 16px | 1.5     | -0.2px  | 600  |
| `Body1/B1_Semi` 14    | `text-b1-14`   | 14px | 1.5     | -0.2px  | 600  |
| `Body2/B2_medium` 20  | `text-b2-20`   | 20px | 1.5     | 0       | 500  |
| `Body2/B2_medium` 16  | `text-b2-16`   | 16px | 1.5     | 0       | 500  |
| `Body2/B2_medium` 14  | `text-b2-14`   | 14px | 1.5     | 0       | 500  |
| `Body2/B2_medium` 12  | `text-b2-12`   | 12px | 20px    | 0       | 500  |
| `Body3/B3_regular` 16 | `text-b3-16`   | 16px | 1.5     | 0       | 400  |
| `Body3/B3_regular` 14 | `text-b3-14`   | 14px | 1.5     | 0       | 400  |
| `Body3/B3_regular` 12 | `text-b3-12`   | 12px | 1.5     | 0       | 400  |
| `Caption/regular 12`  | `text-caption` | 12px | 12px    | 0       | 400  |

`Head/H1_semi`와 `Head/H2_semi`는 이름에 semi가 붙어 있지만 시안 글꼴이 Bold라 700으로 옮겼다. `Body2/B2_medium` 12px은 시안에서 줄 높이 20px로 쓰인 곳이 가장 많아 20px로 정했다.

시안의 글자 크기 변수(`font/fontSize/*`)는 토큰으로 옮기지 않았다. `base`가 14px이라 Tailwind `text-base`(16px)와 이름이 같고 값이 다르다. 시안 줄 높이 변수 snug(20px)와 relaxed(24px)는 Tailwind 기본 `leading-5`, `leading-6`과 값이 같으니 그것을 쓴다. Tailwind 기본 `leading-snug`, `leading-relaxed`는 값이 다르다. Tailwind 기본 글자 크기 `text-xs`부터 `text-9xl`은 기존 화면이 쓰고 있어 남겨 두었다.

`cn()`은 tailwind-merge로 겹치는 클래스를 지운다. tailwind-merge는 모르는 `text-*`를 글자 색으로 읽으므로 `src/shared/lib/cn.ts`에 글자 토큰과 그림자 토큰 이름을 등록해 두었다. `typography.css`나 `shadow.css`에 토큰을 더하면 `cn.ts`의 목록에도 더한다. 빠뜨리면 `cn("text-h1 text-text-1")`이 `text-h1`을 지운다.

## 그림자

시안의 그림자는 전부 가로, 세로 위치가 0이고 흐림 반경만 있다. 쓰임에 따라 이름을 붙였다.

| 클래스                 | 값                  | 시안에서 쓰인 곳            |
| ---------------------- | ------------------- | --------------------------- |
| `shadow-subtle`        | `0 0 4px` 검정 4%   | 탐색 검색창                 |
| `shadow-bar`           | `0 0 14px` 검정 8%  | 화면 아래 고정 버튼 영역    |
| `shadow-floating`      | `0 0 12px` 검정 10% | 떠 있는 하단 탭바, 드롭다운 |
| `shadow-on-map`        | `0 0 12px` 검정 16% | 지도 위 칩                  |
| `shadow-sheet`         | `0 0 20px` 검정 12% | 바텀시트, 날짜와 시간 선택  |
| `shadow-modal`         | `0 0 24px` 검정 20% | 로그인 모달                 |
| `text-shadow-on-image` | `0 0 12px` 검정 8%  | 이미지 위 글자              |

한 곳에서만 쓰인 값은 가까운 토큰으로 맞췄다. 드롭다운의 12px 12%는 `shadow-floating`으로, 메인 추천 카드의 30px 20%는 `shadow-modal`로 옮긴다. Tailwind 기본 `shadow-sm`부터 `shadow-2xl`은 기존 화면이 쓰고 있어 남겨 두었다.

## 간격과 모서리

간격은 4px 그리드이고 Tailwind 기본 간격 척도(`p-4`는 16px)를 그대로 쓴다. 토큰을 따로 만들지 않았다.

모서리 반경도 Tailwind 기본 척도를 쓴다. 시안 값과 같다.

| 시안 반경 | 클래스         |
| --------- | -------------- |
| 4px       | `rounded-sm`   |
| 8px       | `rounded-lg`   |
| 12px      | `rounded-xl`   |
| 16px      | `rounded-2xl`  |
| 24px      | `rounded-3xl`  |
| 999px     | `rounded-full` |

20px 반경(바텀시트 윗모서리, 지도 버튼, 플래너 카드)은 Tailwind 기본 척도에 없다. 토큰으로 둘지 16px이나 24px로 맞출지는 미정이고 `docs/product/ROADMAP.md`의 미결정 절에 있다.

값은 Tailwind 토큰으로 정의한다. `p-[18px]` 같은 임의값을 클래스에 직접 박지 않는다. 이 규칙은 `.agents/rules/tailwind.md`에 있다.

## 아이콘

원본은 `src/shared/assets/icons/`의 SVG 파일이다. 목록은 `ls src/shared/assets/icons`로 본다. 빌드할 때 SVGR이 SVG를 React 컴포넌트로 바꾸고 `SvgIcon`이 크기와 접근성 기본값을 건다.

```tsx
import HeartIcon from "@/shared/assets/icons/heart.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

<SvgIcon icon={HeartIcon} size={20} label="찜" className="text-like" />;
```

- 새 아이콘은 Figma에서 SVG로 내보내 이 폴더에 넣는다. 파일 이름은 케밥 케이스다. 색 값은 SVGR의 svgo 설정이 `currentColor`로 바꾸므로 그대로 둬도 된다
- 선을 윤곽선으로 바꾸지 말고 내보낸다. 안쪽이나 바깥쪽 정렬 선은 Figma가 `clipPath`로 내보내는데 같은 아이콘이 한 화면에 여럿이면 id가 겹칠 수 있다. 가운데 정렬 선으로 바꿔 내보내는 편이 안전하다
- 설정은 `next.config.ts`의 `turbopack.rules`에 있고 이 폴더의 SVG에만 걸린다. 다른 위치의 SVG는 Next 기본대로 이미지로 import된다
- import 경로는 `@/shared/assets/icons/`로 쓴다. 타입 선언이 이 경로에만 걸려 있어 상대 경로로 부르면 `any`가 된다

- 색은 `currentColor`라 `text-icon`, `text-icon-primary` 같은 색 클래스로 칠한다
- 크기는 `size` prop으로 16, 20, 24, 32 중 하나를 준다. 주지 않으면 SVG 원본 크기다
- 뜻을 전하는 아이콘은 `label` prop을 준다. 그러면 `role="img"`와 `aria-label`이 붙는다. `label`이 없으면 `aria-hidden`이 붙어 읽히지 않는다
- 아이콘만 있는 버튼은 버튼에 이름을 단다

## 다크 모드

지원 여부는 미정이다. 지원한다면 시스템 설정을 따르는지 서비스 안에 전환 설정을 두는지도 함께 정한다. 지원하기로 하면 `@theme inline` 토큰에 다크 값을 더하는 방식으로 붙인다.

## 반응형

Design width 375px, 대상은 모바일 웹이고 반응형 범위는 375px에서 430px까지다. 데스크탑은 범위 밖이고 넓은 화면에서는 루트 레이아웃이 가운데 고정 폭 컬럼으로 그린다. 데스크탑 배치를 따로 만들지 않는다. 컬럼 폭은 지금 Tailwind 기본 `max-w-md`이고 디자인 토큰이 오면 `@theme inline`에 넣는다.
