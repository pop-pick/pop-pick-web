# src/shared/lib/kakao-map

Kakao Map SDK를 감싸는 자리다. 공식 React 래퍼가 없어 직접 감싼다. npm 패키지를 쓰지 않고 `next/script`로 SDK를 불러온다 (8/28 결정).

JavaScript 키는 `NEXT_PUBLIC_KAKAO_MAP_KEY`로 읽는다. 카카오 개발자 콘솔에 배포 도메인을 등록해야 지도가 뜬다. 프로덕션 URL과 `develop` 브랜치 별칭을 등록한다. 절차는 `docs/release/RUNBOOK.md`에 있다.

로더 코드는 지도 화면 담당이 정해진 뒤에 쓴다. 담당은 미정이다.

미리 정한 것 둘이 있다.

- 마커 수 상한을 정하고 시작한다. 값은 미정이다
- 팀에 경험자가 없어 이 프로젝트에서 새로 배우는 기술은 이것 하나로 끝낸다. 지도 주변에 다른 낯선 도구를 더 들이지 않는다
