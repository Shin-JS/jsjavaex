package p10.inner;
/**[중첩클래스]
 * -.중첩클래스의 사용: 중첩클래스는 주로 클래스의 필드의 초기값으로 클래스를 한번만 사용할 경우 사용한다
 * 						외부객체에 노출시킬 필요가 없거나, 보안을 위해서 주로 사용
 **/
public class A1 {
	//인스턴스 멤버 클래스
	class B1 {}
	//정적 멤버 클래스
	static class C{}
	
	//인스턴스 필드
	B1 field1 = new B1();
	C field2 = new C();
	
	//인스턴스 메소드
	void method1() {
		B1 var1 = new B1();
		C var2 = new C();
	}
	//정적 멤버 필드 초기화
//	static B1 field3 = new B1(); //오류발생, 이유: 인스턴스클래스는 static필드로 올 수 없다.
	static C field4 = new C();
	//정적 메소드
	static void method2() {
//		B1 var1 = new B1(); //오류발생, 이유: 인스턴스클래스는 static메소드의 로컬 변수로 올 수 없다.
		C var2 = new C();
	}
}
