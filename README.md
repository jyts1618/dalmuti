# 달무티

Next.js, React, TypeScript, Tailwind CSS로 만든 1인용 달무티 웹 카드게임입니다. 사용자는 1명이고 나머지 참가자는 브라우저 안에서 자동 행동하는 AI 플레이어입니다. 별도 서버, 로그인, 데이터베이스 없이 실행되며 진행 중인 게임은 `localStorage`에 저장됩니다.

## 설치 방법

```bash
npm install
```

## 실행 방법

터미널 없이 실행하려면 Finder에서 아래 파일을 엽니다.

```text
게임 실행.html
```

또는 직접 아래 파일을 열어도 됩니다.

```text
out/index.html
```

개발 모드로 실행하려면:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

정적 실행 파일을 다시 만들려면:

```bash
npm run build
```

## GitHub Pages 배포

이 저장소는 GitHub Actions 없이도 배포할 수 있도록 `docs` 폴더에 정적 실행 파일을 포함합니다.

GitHub 저장소에서:

1. `Settings`로 이동합니다.
2. `Pages` 메뉴를 엽니다.
3. `Build and deployment`의 `Source`를 `Deploy from a branch`로 선택합니다.
4. `Branch`는 `main`, 폴더는 `/docs`를 선택합니다.
5. `Save`를 누릅니다.

잠시 후 아래 주소에서 실행됩니다.

```text
https://jyts1618.github.io/dalmuti/
```

## 후기 게시판 설정

후기 게시판은 Supabase에 저장됩니다. Supabase 프로젝트를 만든 뒤 `supabase.sql` 내용을 Supabase SQL Editor에서 실행합니다.

그 다음 `.env.local` 파일에 아래 값을 넣고 다시 빌드합니다.

```text
NEXT_PUBLIC_SUPABASE_URL=Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase anon public key
```

GitHub Pages로 배포하려면 위 환경값이 들어간 상태에서 `npm run build`를 실행한 뒤 새로 생성된 `out` 내용을 `docs`에 반영해 커밋합니다.

## 테스트 방법

```bash
npm run lint
npm run test
npm run build
```

## 게임 흐름

1. 참여 인원과 사용자 이름을 설정합니다.
2. 첫 라운드는 각 플레이어가 카드 한 장을 추첨해 계급을 정합니다.
3. 계급 순서대로 80장 덱을 셔플하고 분배합니다.
4. 조커 2장을 가진 플레이어가 있으면 혁명 여부를 처리합니다.
5. 혁명이 없으면 공식 세금 교환을 처리합니다.
6. 대달무티부터 트릭을 시작하고, 같은 장수이면서 더 강한 카드만 낼 수 있습니다.
7. 모든 상대가 연속 패스하면 마지막 제출자가 새 트릭을 시작합니다.
8. 카드를 모두 낸 순서대로 순위를 확정하고 다음 라운드 계급을 재배치합니다.

## AI 행동 기준

AI는 항상 현재 규칙에서 유효한 행동만 선택합니다. 낼 수 있는 조합이 없으면 패스하고, 낼 수 있으면 가능한 조합 중 가장 약한 유효 조합을 냅니다. 새 트릭을 시작할 때도 높은 숫자 카드부터 내며, 조커는 가능한 한 보존합니다.

## 공식 규칙 구현 범위

- 80장 공식 덱 구성
- 숫자가 낮을수록 강한 카드 판정
- 조커 단독 및 일반 카드 조합 판정
- 첫 라운드 계급 추첨과 동률 재추첨
- 4~8명 참여 인원에 따른 계급 배치
- 대농노/소농노 세금과 달무티 반환
- 일반 혁명과 대혁명
- 패스 후 같은 트릭 재참여
- 트릭 종료와 라운드 순위 확정
- 다음 라운드 계급 재배치
- 저장된 게임 이어서 하기

온라인 멀티플레이, 로그인, 채팅, 점수 시스템, 통계, 커스텀 규칙은 MVP 범위에서 제외했습니다.
