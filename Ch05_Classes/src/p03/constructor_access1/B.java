package p03.constructor_access1;

public class B {
	//필드
	A a1 = new A(true); //동일 패키지내의 public접근제한을 가지는 생성자 호출
	A a2 = new A(1); //동일 패키지내의 default접근제한을 가지는 생성자 호출
//	A a3 = new A("홍길동"); //동일패키지 이지만 private이므로 접근이 불가능함
	
}
