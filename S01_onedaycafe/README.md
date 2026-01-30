# OneDayCafe-project
일일카페 주문/확인 시스템

## <용어 정의>
### 메뉴
- 메뉴이름, 가격, 쿠폰개수, 그룹(1 이상의 정수), 카테고리, 품절여부, render에 대한 정보를 담고 있는 객체
### 그룹
- 메뉴를 담당하는 요리 client 의 종류
- 한 그룹이 모든 메뉴를 담당할 수도 있고, 한 메뉴를 여러 그룹이 담당할 수도 있다.
### 카테고리
- 메뉴의 의미적인 분류 방식
- 예를 들어, 파스타, 볶음밥 등은 식사이고, 아메리카노, 라떼 등은 음료이다.
- order.html 에서 UX 측면에서 의미 있게 작용함
### render
- 이 메뉴를 렌더링할지 말지 결정하는 값. 1이면 렌더링을 하고, 0이면 렌더링하지 않는다.
- 삭제된 메뉴의 임시 휴지통 역할을 구현할 때 사용됨
### trsc
- trsc 번호(고유값, 0001로 시작해서 1씩 증가), order, 테이블 번호, 지불방식(현금 / 쿠폰 택 1), 주문시각 에 대한 정보를 담고 있다.
- 메뉴는 menu.txt 를 읽어옴
### order
- order 번호(같은 trsc 안에서 고유값, 01로 시작해서 1씩 증가), 메뉴 이름, 개수, 요리 완성 여부, 서빙 완료 여부
### 완료
- trsc의 요리 완성 여부와 서빙 완료 여부가 모두 True 인 상태
### trsc list
- 생성된 trsc 들 중 완료되지 않은 trsc 들의 모임

## <시스템 아키텍처>
### WAS (Tomcat)
- 주문 webClient 로부터 주문 입력 요청을 받으면 그 trsc과 order 데이터 저장
- 요리 webClient 로부터 요리 완성 메시지를 받으면 해당 주문이 요리 완성되었음으로 수정
- 중앙 webClient 로부터 서빙 완료 메시지를 받으면 해당 주문이 요리 서빙되었음으로 수정
- 관리자로부터 메뉴 추가, 품절, 삭제 요청을 받으면 메뉴 데이터 업데이트

|Method|Path|설명|
|------|---|---|
|GET|/order|주문 WebClient에게 order.html 페이지와 메뉴 목록을 렌더링하여 반환합니다.|
|GET|/kitchen/{group_id}|요리 WebClient에게 kitchen.html 페이지를 렌더링하여 반환합니다.|
|GET|/central|중앙 WebClient에게 central.html 페이지를 렌더링하여 반환합니다.|
|GET|/admin|관리자 페이지를 렌더링하여 반환합니다.|
|POST|/api/order|주문 WebClient로부터 새로운 trsc을 받아 DB에 추가합니다.|
|POST|/api/addmenu|관리자 페이지로부터 메뉴 추가 요청을 받아 DB에 추가합니다.|
|PATCH|/api/trsc/{order_id}/cook|요리 WebClient로부터 요리 완료 요청을 받아 DB를 수정합니다.|
|PATCH|/api/trsc/{order_id}/serve|중앙 WebClient로부터 서빙 완료 요청을 받아 DB를 수정합니다.|
|PATCH|/api/soldout|관리자 페이지로부터 메뉴 품절 요청을 받아 DB를 수정합니다.|
|PATCH|/api/deletemenu|관리자 페이지로부터 메뉴 삭제 요청을 받아 DB를 수정합니다. 해당 메뉴의 render 값을 1에서 0으로 수정합니다.|

### Database (MariaDB)
- trsc이 생성될 때마다 데이터 생성 후 저장(주문번호, 메뉴, 테이블번호, 지불방식, 주문시각, 요리완성여부, 서빙완료여부)
- WAS 가 요청하면 완료되지 않은 trsc들의 list를 반환

### 주문 webClient (웹 브라우저)
- 5-6개 정도 WAS에 동시 접속
- WAS에게 주문 페이지 html(app/templates/order.html)을 요청
- User가 trsc을 작성하여 전송

### 요리 webClient (웹 브라우저)
- N개 WAS에 동시 접속
- 그룹 1-N 중 하나 선택
- WAS에게 요리 페이지 html(app/templates/kitchen.html/?group_id=={그룹번호})을 요청
- 요리가 완성되어 완성 여부 버튼을 클릭하면, WAS에게 해당 요리 완료 요청을 전송

### 중앙 webClient (웹 브라우저)
- 1개 WAS에 접속
- WAS에게 중앙 페이지 html(app/templates/central.html)을 요청
- 완성된 trsc 의 서빙 여부 버튼을 클릭하면 WAS에게 trsc 서빙 완료 요청을 전송

## <활용 기술스택>
- Backend: Tomcat, java, servlet, jsp
- Frontend: Nginx, HTML, CSS, JavaScript
- Database: MariaDB
- Others: Kubernetes, Docker


이 글은 내가 만들고자 하는 onedaycafe 프로젝트의 README.md 야.
onedaycafe는 동아리에서 일일카페를 하는데 필요한 주문 입력/확인 시스템이야. 다만, 요리하는 주방이 여러 개이고 서로 공간이 분리되어 있다보니, 요리사 입장에서 본인이 맡은 요리 주문이 들어오면 알 수 있어야 해. 그리고 서빙하는 직원들도 어느 주방의 어떤 요리가 완성되고, 어느 테이블로 서빙되어야 하는지 바로 확인할 수 있도록 도와주는 서비스야.
Nginx는 리버스프록시의 역할만 수행하면 되고, Tomcat에서 모든 로직을 수행하면 돼.
메뉴들도 데이터베이스에 저장하면 돼.
데이터베이스 접속 정보는 url = jdbc:mariadb://10.0.2.30:3306/cafeDB, id = dbuser, password = dbuser 야.
