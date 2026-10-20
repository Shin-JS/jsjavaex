# 참조 자료와 확인 범위

조사일: 2026-10-20. 앞선 조사에서 R2024x의 일부 Contents URL이 404였다는 이유로 백엔드를 확보하지 못했다고 판단한 부분을 정정합니다. Git tree API로 master의 jpo와 WEB-INF/lib를 확인했습니다. main에는 README만 있고 소스는 master에 있습니다.

## 이번 수정의 기준 원본

저장소 [Ignim94/R2024x](https://github.com/Ignim94/R2024x/tree/master), 참조 커밋 `ef1fd81959f127ec7d5d5760cf2178e381cf738a`.

| 파일 | 확인 내용 | Git blob SHA |
|---|---|---|
| [jpo/enoECMChangeActionBase_mxJPO.java](https://github.com/Ignim94/R2024x/blob/master/jpo/enoECMChangeActionBase_mxJPO.java) | Deprecated createChangeAction, 활성 ChangeAction.create 호출, autoName 부분은 주석 | 소스 메서드 직접 조회 |
| [jpo/ChgUXServicesChangeActionBase_mxJPO.java](https://github.com/Ignim94/R2024x/blob/master/jpo/ChgUXServicesChangeActionBase_mxJPO.java) | Issues 앱용 생성 전달 메서드 | 소스 메서드 직접 조회 |
| [enterprisechangemgt.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/enterprisechangemgt.jar) | ChangeAction.create → Factory, null name 전달 | ba5632f7d5570aa7d657c474b0a80d8ced1bd5da |
| [PLMJChangeActionImpl.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/PLMJChangeActionImpl.jar) | ChangeAction.impl의 생성 경로, CA adapter의 실제 CreateParameters.create 호출 및 앞뒤 처리 | 8cf4f293774428152f0ed7e6339b0b48d710fd65 |
| [NewContentWebServices.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/NewContentWebServices.jar) | ENONew REST/adapter 경로, update 트랜잭션, ENONewAppException 서명 | 8c5da06f70577d1c59976373df7122b32893718e |
| [eMatrixServletRMI.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/eMatrixServletRMI.jar) | Context, CreateParametersBase, BusinessObject API 서명 및 사용자 코드의 실제 SDK 컴파일 | c6c3ed0076388c451902f403dfc07a1b67c59550 |
| [enterprisechangemgtuxservice.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/enterprisechangemgtuxservice.jar) | JPO와 대응 여부 확인. 해당 정적 createChangeAction 메서드는 이 JAR에서 확인되지 않음 | 7e82fcdb2b4429d4524acadee71053ebe6c1bf49 |

JAR의 서명과 바이트코드는 javap로 확인하고, 관련 CA adapter 메서드의 구조도 확인했습니다. R2024x 이름의 공개 저장소 자료이며, 사용자의 설치 버전과 파일 구성이 같다는 보증은 아닙니다. JPO 소스와 배포 JAR가 서로 완전히 일치한다고 가정하지 않습니다.

정식 Java 소스가 없는 CA adapter는 JAR에서 확인한 메서드를 기준으로 최소 diff와 서명 검사형 소스 수정 스크립트를 작성했습니다. 벤더 전체 소스/JAR는 이 저장소에 복제하지 않았습니다.

## 이전에 확인한 배경 문서

- [About Autonaming Business Objects](https://help-3dexperience.aesvietnam.com/English/DteAdminMap/dte-c-autoname.htm): Object/Number Generator 개념의 참고. 이번 실제 수정 지점의 근거는 위 JAR입니다.
- [Dassault Support Q&A 목록](https://3dswym.3dexperience.3ds.com/post/enovia-user-community/the-best-of-q3-2017-enovia-support-q-a_8223): CA 번호 관련 KB 항목의 존재만 확인. 개별 KB 해결책을 구현 근거로 삼지 않았습니다.
- [Java 8 Clock](https://docs.oracle.com/javase/8/docs/api/java/time/Clock.html): 시간대 및 고정 시각 테스트.
